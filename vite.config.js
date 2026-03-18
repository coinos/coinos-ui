import path from "path";
import { sveltekit } from "@sveltejs/kit/vite";
import tailwindcss from "@tailwindcss/vite";
import Icons from "unplugin-icons/vite";
import { FileSystemIconLoader } from "unplugin-icons/loaders";
import { defineConfig, loadEnv } from "vite";

export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd(), "");

  return {
    plugins: [
      Icons({
        compiler: "svelte",
        scale: 0,
        customCollections: {
          coinos: FileSystemIconLoader("./src/icons"),
        },
      }),
      tailwindcss({ optimize: false }),
      sveltekit(),
    ],
    preview: {
      allowedHosts: [
        process.env.PUBLIC_DOMAIN || env.PUBLIC_DOMAIN || "coinos.io",
        ...(process.env.PUBLIC_EXTRA_HOSTS || env.PUBLIC_EXTRA_HOSTS || "")
          .split(",")
          .filter(Boolean),
      ],
    },
    server: {
      proxy:
        process.env.NODE_ENV === "development"
          ? {
              "/api/": {
                target: process.env.API_URL || "http://localhost:3119",
                rewrite: (path) => path.replace(/^\/api\//, ""),
              },
            }
          : undefined,
    },
    resolve: {
      alias: {
        "@arkade-os/sdk/wallet": path.resolve("node_modules/@arkade-os/sdk/dist/esm/wallet"),
        "@arkade-os/sdk/identity": path.resolve("node_modules/@arkade-os/sdk/dist/esm/identity"),
        "@arkade-os/sdk/providers": path.resolve("node_modules/@arkade-os/sdk/dist/esm/providers"),
        "@arkade-os/sdk/worker": path.resolve("node_modules/@arkade-os/sdk/dist/esm/worker"),
        "@internet-privacy/marmot-ts/media": path.resolve("node_modules/@internet-privacy/marmot-ts/dist/core/media.js"),
      },
    },
    build: {
      chunkSizeWarningLimit: 1100,
      reportCompressedSize: false,
      cssMinify: "lightningcss",
    },
  };
});
