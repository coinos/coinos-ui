/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./src/**/*.{html,js,svelte}",
    "./node_modules/stwui/**/*.{svelte,js,ts,html}",
  ],
  stwui: {
    themes: [
      "light",
      "dark",
      {
        mytheme: {
          primary: "#2563eb",
          default: "#333",
          danger: "#dc2626",
          surface: "#ffffff",
          background: "#F0F2F5",
          border: "#E8E9EC",
          hover: "#000000",
        },
      },
    ],
  },
  theme: {
    extend: {
      colors: {
        primary: "#F5F7FA",
        secondary: "#70757E",
        gradient: "#C3CFE2",
        lightgrey: "#EAECEF",
        grey: "#70757E",
      },
    },
  },
  plugins: [
    require("tailwind-scrollbar"),
    require("@tailwindcss/forms"),
    require("stwui/plugin"),
  ],
  safelist: ["w-16", "h-16", "w-20", "h-20", "w-24", "h-24"],
};
