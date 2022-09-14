module.exports = {
	apps: [
		{
			name: 'v2',
			watch: ['src'],
			script: 'build/index.js',
			env: {
				COMMON_VARIABLE: 'true',
				PORT: 3002,
				ORIGIN: 'https://v2.coinos.io'
			},
			env_production: {
				NODE_ENV: 'production'
			}
		}
	]
};
