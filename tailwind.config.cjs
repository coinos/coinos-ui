/** @type {import('tailwindcss').Config} */
module.exports = {
	content: ['./src/**/*.{html,js,svelte}'],
	theme: {
		extend: {
			colors: {
				primary: '#7105f3',
				secondary: '#70757E',
				yellow: '#FFEA01',
				gradient: '#C3CFE2',
				lightgrey: '#EAECEF',
				grey: '#70757E'
			}
		}
	},
	plugins: [require('tailwind-scrollbar')],
	safelist: ['w-16', 'h-16', 'w-20', 'h-20', 'w-24', 'h-24']
};
