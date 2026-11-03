const path = require( 'path' );
const { BannerPlugin } = require( 'webpack' );
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
			name: 'GravatarUrlUtils',
			type: 'assign-properties',
		},
	},
};

const cliConfig = {
	...commonConfig,
	entry: './src/cli.ts',
	output: {
		path: path.resolve( 'dist' ),
		filename: 'cli.js',
		library: {
			type: 'commonjs2',
		},
	},
	target: 'node',
	optimization: {
		...commonConfig.optimization,
		minimize: false,
	},
	plugins: [
		...commonConfig.plugins,
		new BannerPlugin( {
			banner: '#!/usr/bin/env node',
			raw: true,
			entryOnly: true,
		} ),
	],
};

module.exports = [ cjsConfig, esmConfig, mjsConfig, umdConfig, cliConfig ];
