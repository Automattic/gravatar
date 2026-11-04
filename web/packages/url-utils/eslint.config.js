const wordpress = require( '@wordpress/eslint-plugin' );

module.exports = [
	{
		ignores: [ 'dist/' ],
	},
	...wordpress.configs.recommended,
	{
		rules: {
			'prettier/prettier': [ 'error', require( './.prettierrc.js' ) ], // Uses our .prettierrc.js config
		},
	},
	{
		// Tooling config files load packages installed at the monorepo root.
		files: [ 'eslint.config.js', '.prettierrc.js' ],
		rules: {
			'import/no-extraneous-dependencies': 'off',
		},
	},
];
