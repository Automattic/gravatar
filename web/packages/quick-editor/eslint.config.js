const wordpress = require( '@wordpress/eslint-plugin' );

module.exports = [
	{
		ignores: [ 'dist/', 'release/' ],
	},
	...wordpress.configs.recommended,
	{
		rules: {
			'prettier/prettier': [ 'error', require( './.prettierrc.js' ) ], // Uses our .prettierrc.js config
			'@wordpress/i18n-no-variables': 'off',
		},
	},
	{
		// Allow intentionally unused `_`-prefixed caught errors and destructured array
		// elements, as the previous lint setup did.
		files: [ '**/*.ts', '**/*.tsx' ],
		rules: {
			'@typescript-eslint/no-unused-vars': [
				'error',
				{
					ignoreRestSiblings: true,
					caughtErrorsIgnorePattern: '^_',
					destructuredArrayIgnorePattern: '^_',
				},
			],
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
