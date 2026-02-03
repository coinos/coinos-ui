import { sveltekit } from "@sveltejs/kit/vite";
import tailwindcss from "@tailwindcss/vite";

import { defineConfig } from "vite";

export default defineConfig({
	plugins: [tailwindcss({ optimize: false }), sveltekit()],
	css: {
		transformer: "postcss",
	},
	preview: {
		allowedHosts: [
			"coinos.io",
			"6un2jrlcumn5vduhbq6i3i2wrwiydamwjwop472obg6cy2bfo6ua3oad.onion",
			"vm7h454g5hiy2nt3u5o7evtz3vigtypo2mkyausakvdkbmd7wpyhx5qd.onion",
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
							? `${parts[0]}/${parts[1]}`
							: parts[0];
						return `vendor-${pkg}`;
					}
				},
			},
		},
	},
});
