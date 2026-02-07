import { sveltekit } from "@sveltejs/kit/vite";
import tailwindcss from "@tailwindcss/vite";

import { defineConfig } from "vite";

import path from "path";

export default defineConfig({
	plugins: [tailwindcss(), sveltekit()],
	resolve: {
		alias: {
			$comp: path.resolve("src/components"),
		},
	},
	preview: {
		allowedHosts: [
			"staging.coinos.io",
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
});

