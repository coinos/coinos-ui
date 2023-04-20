import { sveltekit } from '@sveltejs/kit/vite';

import path from 'path';

/** @type {import('vite').UserConfig} */
const config = {
	plugins: [sveltekit()],
	resolve: {
		alias: {
			$comp: path.resolve('src/components/index.js')
		}
	},
	server: {
		proxy: {
			'/api': {
				target: 'http://localhost:3119',
				rewrite: (path) => path.replace(/^\/api/, '')
			}
		}
	}
};

export default config;
