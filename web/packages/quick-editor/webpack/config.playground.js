const HtmlWebpackPlugin = require( 'html-webpack-plugin' );

const commonConfig = require( './config.common' );

module.exports = {
	...commonConfig,
	mode: "development",
	entry: './src/index.ts',
	devServer: {
		open: true,
		static: './playground/index.html',
	},
	plugins: [
		...commonConfig.plugins,
		new HtmlWebpackPlugin( {
			template: './playground/index.html',
		} ),
	],
};
