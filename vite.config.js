import { sveltekit } from '@sveltejs/kit/vite';
import { nodePolyfills } from 'vite-plugin-node-polyfills';

import wasm from 'vite-plugin-wasm';
import topLevelAwait from 'vite-plugin-top-level-await';
import path from 'path';

/** @type {import('vite').UserConfig} */
const config = {
	plugins: [nodePolyfills(), sveltekit(), topLevelAwait(), wasm()],
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
