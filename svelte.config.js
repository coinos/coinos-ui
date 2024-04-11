// import adapter from '@sveltejs/adapter-node';
import adapter from "svelte-adapter-bun";
import preprocess from "svelte-preprocess";

const config = {
  preprocess: [
    preprocess({
      postcss: true,
    }),
  ],
  kit: {
    adapter: adapter(),
    csrf: {
      checkOrigin: false,
    },
    prerender: {
      crawl: false,
      entries: [],
    },
    serviceWorker: {
      register: false
    }
  },
  onwarn: (warning, handler) => {
    if (warning.code.includes("caption") || warning.filename.includes("Toast"))
      return;
    handler(warning);
  },
};

export default config;
