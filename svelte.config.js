// import adapter from '@sveltejs/adapter-node';
import adapter from "svelte-adapter-bun";
import { vitePreprocess } from "@sveltejs/vite-plugin-svelte";

const config = {
  preprocess: vitePreprocess(),
  kit: {
    adapter: adapter(),
    csrf: {
      trustedOrigins: ["*"],
    },
    alias: {
      $comp: "src/components",
    },
    prerender: {
      crawl: false,
      entries: [],
    },
  },
  onwarn: (warning, handler) => {
    if (warning.code.includes("caption") || warning.filename.includes("Toast"))
      return;
    handler(warning);
  },
};

export default config;
