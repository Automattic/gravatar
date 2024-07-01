const path = require( 'path' );
const RemoveEmptyScriptsPlugin = require( 'webpack-remove-empty-scripts' );
const TerserPlugin = require( 'terser-webpack-plugin' );

const isProduction = process.env.NODE_ENV === 'production';

module.exports = {
	context: path.resolve( __dirname, '..' ),
	mode: isProduction ? 'production' : 'development',
	devtool: isProduction ? 'source-map' : 'eval-source-map',
	optimization: {
		minimizer: [
			new TerserPlugin( {
				extractComments: false,
				terserOptions: {
					format: {
						comments: false,
					},
				},
			} ),
		],
	},
	plugins: [ new RemoveEmptyScriptsPlugin() ],
	module: {
		rules: [
			{
				test: /\.(js?|jsx?|ts?|tsx?)$/i,
				loader: 'babel-loader',
				exclude: [ '/node_modules/' ],
			},
		],
	},
	resolve: {
		extensions: [ '.tsx', '.ts', '.jsx', '.js', '.mjs' ],
	},
};
