module.exports = {
	parserOptions: {
		ecmaVersion: 'latest',
		sourceType: 'module',
	},
	extends: ['plugin:@wordpress/eslint-plugin/recommended'],
	rules: {
		'@wordpress/i18n-no-variables': 'off',
	},
};
