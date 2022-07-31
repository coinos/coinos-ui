/** @type {import('tailwindcss').Config} */
module.exports = {
	content: ['./src/**/*.{html,js,svelte}'],
	theme: {
		extend: {
			colors: {
				primary: '#F5F7FA',
				secondary: '#70757E',
				gradient: '#C3CFE2',
				lightgrey: '#EAECEF'
			}
		}
	},
	plugins: []
};
