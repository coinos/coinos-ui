/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ["./src/**/*.{html,js,svelte}"],
  plugins: [require("tailwind-scrollbar")],
  safelist: ["w-16", "h-16", "w-20", "h-20", "w-24", "h-24"],
};
