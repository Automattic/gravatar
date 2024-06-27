const HtmlWebpackPlugin = require( 'html-webpack-plugin' );

const commonConfig = require( './config.common' );

module.exports = {
	...commonConfig,
	entry: './playground/index.ts',
	devServer: {
		open: true,
		watchFiles: [ 'playground' ],
	},
	plugins: [
		...commonConfig.plugins,
		new HtmlWebpackPlugin( {
			template: './playground/index.html',
		} ),
	],
};
