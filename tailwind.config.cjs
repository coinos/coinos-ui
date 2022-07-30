/** @type {import('tailwindcss').Config} */
module.exports = {
	content: ['./src/**/*.{html,js,svelte}'],
	theme: {
		extend: {
			colors: {
				primary: '#F5F7FA',
				secondary: '#858A92',
				gradient: '#C3CFE2',
				lightgrey: '#eaecef'
			}
		}
	},
	plugins: []
};
