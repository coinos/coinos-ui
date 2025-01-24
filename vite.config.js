import { sveltekit } from "@sveltejs/kit/vite";

import path from "path";

/** @type {import('vite').UserConfig} */
const config = {
	plugins: [sveltekit()],
	resolve: {
		alias: {
			$comp: path.resolve("src/components"),
		},
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
};

export default config;
