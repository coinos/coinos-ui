module.exports = {
  apps: [
    {
      name: "v2",
      watch: ["src"],
      script: "build/index.js",
      env: {
        COMMON_VARIABLE: "true",
        PORT: 3002,
      },
      env_production: {
        NODE_ENV: "production",
      },
    },
  ],
};
