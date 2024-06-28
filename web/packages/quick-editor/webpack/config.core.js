const path = require( 'path' );
const commonConfig = require( './config.common' );

const baseConfig = {
	...commonConfig,
	entry: './src/index.ts',
	output: {
		path: path.resolve( 'dist' ),
	},
};

const cjsConfig = {
	...baseConfig,
	output: {
		...baseConfig.output,
		filename: 'index.js',
		library: {
			type: 'commonjs2',
		},
	},
	target: 'node',
	optimization: {
		...baseConfig.optimization,
		minimize: false,
	},
};

const esmConfig = {
	...baseConfig,
	output: {
		...baseConfig.output,
		filename: 'index.esm.js',
		library: {
			type: 'module',
		},
	},
	experiments: {
		outputModule: true,
	},
	optimization: {
		...baseConfig.optimization,
		minimize: false,
	},
};

const mjsConfig = {
	...esmConfig,
	output: {
		...esmConfig.output,
		filename: 'index.mjs',
	},
};

const umdConfig = {
	...baseConfig,
	output: {
		...baseConfig.output,
		filename: 'index.umd.js',
		library: {
			name: 'GravatarQuickEditor',
			type: 'umd',
			umdNamedDefine: true,
		},
	},
};

module.exports = [ cjsConfig, esmConfig, mjsConfig, umdConfig ];
