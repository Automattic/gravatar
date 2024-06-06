const path = require( 'path' );

const commonConfig = require( './config.common' );

const baseConfig = {
	...commonConfig,
	entry: './src/index.react.ts',
	output: {
		path: path.resolve( 'dist' ),
	},
	externals: {
		react: 'react',
		'react-dom': 'react-dom',
	},
};

const cjsConfig = {
	...baseConfig,
	output: {
		...baseConfig.output,
		filename: 'index.react.js',
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

const mjsConfig = {
	...baseConfig,
	output: {
		...baseConfig.output,
		filename: 'index.react.mjs',
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

const umdConfig = {
	...baseConfig,
	output: {
		...baseConfig.output,
		filename: 'index.react.umd.js',
		library: {
			name: 'Gravatar',
			type: 'umd',
			umdNamedDefine: true,
		},
	},
	externals: {
		react: 'React',
		'react-dom': 'ReactDOM',
	},
};

module.exports = [ cjsConfig, mjsConfig, umdConfig ];
