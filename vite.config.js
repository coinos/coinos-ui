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
