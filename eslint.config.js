const js = require('@eslint/js');
const globals = require('globals');

module.exports = [
	js.configs.recommended,
	{
		files: ['**/*.js'],
		languageOptions: {
			sourceType: 'commonjs',
			globals: globals.node
		}
	},
	{
		files: ['client/**/*.js'],
		languageOptions: {
			sourceType: 'script',
			globals: { ...globals.browser, io: 'readonly' }
		}
	}
];
