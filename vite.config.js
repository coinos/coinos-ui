import { sveltekit } from "@sveltejs/kit/vite";
import tailwindcss from "@tailwindcss/vite";
import { visualizer } from "rollup-plugin-visualizer";
import { defineConfig, loadEnv } from "vite";

export default defineConfig(({ mode }) => {
	const env = loadEnv(mode, process.cwd(), "");
	const analyze = process.env.ANALYZE === "true";

	return {
		plugins: [
			tailwindcss({ optimize: false }),
			sveltekit(),
			analyze &&
				visualizer({
					filename: "build/stats.html",
					gzipSize: true,
					brotliSize: true,
					template: "treemap",
				}),
		].filter(Boolean),
	css: {
		transformer: "postcss",
	},
	preview: {
		allowedHosts: [
			process.env.PUBLIC_DOMAIN || env.PUBLIC_DOMAIN || "coinos.io",
			...((process.env.PUBLIC_EXTRA_HOSTS || env.PUBLIC_EXTRA_HOSTS || "").split(",").filter(Boolean)),
		],
	},
	server: {
		proxy:
			process.env.NODE_ENV === "development"
				? {
						"/api/": {
							target: "http://localhost:3119",
							rewrite: (path) => path.replace(/^\/api\//, ""),
						},
				  }
				: undefined,
	},
		build: {
			cssMinify: "esbuild",
			chunkSizeWarningLimit: 1000,
			rollupOptions: {
				output: {
					manualChunks(id) {
						if (id.includes("node_modules")) {
							const parts = id.split("node_modules/")[1].split("/");
							const pkg = parts[0].startsWith("@")
								? `${parts[0].slice(1)}-${parts[1]}`
								: parts[0];
							return `vendor-${pkg}`;
						}
					},
				},
			},
		},
	};
});
