module.exports = {
	parserOptions: {
		ecmaVersion: 'latest',
		sourceType: 'module',
	},
	extends: [ 'plugin:@wordpress/eslint-plugin/recommended' ],
	plugins: [ 'prettier' ],
	rules: {
		'prettier/prettier': [ 'error', require( './.prettierrc.js' ) ], // Uses our .prettierrc.js config
	},
};
