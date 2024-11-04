/** @type {import('tailwindcss').Config} */
module.exports = {
	content: ["./src/**/*.{html,js,svelte}"],
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
	plugins: [require("tailwind-scrollbar"), require("daisyui")],
	daisyui: {
		themes: [
			{
				light: {
					...require("daisyui/src/theming/themes").lofi,
					primary: "#F5F7FA",
					secondary: "#70757E",
					gradient: "#C3CFE2",
					lightgrey: "#EAECEF",
					grey: "#70757E",
				},
			},
			{
				dark: {
					...require("daisyui/src/theming/themes").black,
					gradient: "#C3CFE2",
					lightgrey: "#EAECEF",
					grey: "#70757E",
				},
			},
		], // false: only light + dark | true: all themes | array: specific themes like this ["light", "dark", "cupcake"]
		darkTheme: "dark", // name of one of the included themes for dark mode
		base: true, // applies background color and foreground color for root element by default
		styled: true, // include daisyUI colors and design decisions for all components
		utils: true, // adds responsive and modifier utility classes
		prefix: "", // prefix for daisyUI classnames (components, modifiers and responsive class names. Not colors)
		logs: false, // Shows info about daisyUI version and used config in the console when building your CSS
		themeRoot: ":root", // The element that receives theme color CSS variables
	},
	safelist: ["w-16", "h-16", "w-20", "h-20", "w-24", "h-24"],
};
