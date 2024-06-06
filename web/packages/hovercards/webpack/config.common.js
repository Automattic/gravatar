const path = require( 'path' );
const MiniCssExtractPlugin = require( 'mini-css-extract-plugin' );
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
	plugins: [ new RemoveEmptyScriptsPlugin(), new MiniCssExtractPlugin() ],
	module: {
		rules: [
			{
				test: /\.(jsx?|tsx?)$/i,
				loader: 'babel-loader',
				exclude: [ '/node_modules/' ],
			},
			{
				test: /\.s[ac]ss$/i,
				use: [ MiniCssExtractPlugin.loader, 'css-loader', 'postcss-loader', 'sass-loader' ],
			},
			{
				test: /\.css$/i,
				use: [ MiniCssExtractPlugin.loader, 'css-loader', 'postcss-loader' ],
			},
			{
				test: /\.(eot|svg|ttf|woff|woff2|png|jpg|gif)$/i,
				type: 'asset',
			},
		],
	},
	resolve: {
		extensions: [ '.tsx', '.ts', '.jsx', '.js', '.mjs' ],
	},
};
