const path = require( 'path' );
const commonConfig = require( './config.common' );

const baseConfig = {
	...commonConfig,
	entry: './src/index.ts',
	output: {
		path: path.resolve( 'dist' ),
	},
	externals: {
		react: 'react',
		'react/jsx-runtime': 'react/jsx-runtime',
		'@wordpress/ui': '@wordpress/ui',
	},
	optimization: { ...commonConfig.optimization, minimize: false },
};

const cjsConfig = {
	...baseConfig,
	target: 'node',
	output: {
		...baseConfig.output,
		filename: 'index.js',
		library: { type: 'commonjs2' },
	},
};

const mjsConfig = {
	...baseConfig,
	output: {
		...baseConfig.output,
		filename: 'index.mjs',
		library: { type: 'module' },
	},
	experiments: { outputModule: true },
	externalsType: 'module',
};

module.exports = [ cjsConfig, mjsConfig ];
