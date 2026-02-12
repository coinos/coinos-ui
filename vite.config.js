import { sveltekit } from "@sveltejs/kit/vite";
import tailwindcss from "@tailwindcss/vite";
import { defineConfig, loadEnv } from "vite";

export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd(), "");

  return {
    plugins: [tailwindcss({ optimize: false }), sveltekit()],
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
                target: "http://localhost:3119",
                rewrite: (path) => path.replace(/^\/api\//, ""),
              },
            }
          : undefined,
    },
    build: {
      chunkSizeWarningLimit: 1000,
      reportCompressedSize: false,
      cssMinify: "lightningcss",
    },
  };
});
