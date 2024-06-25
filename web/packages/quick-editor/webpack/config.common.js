const path = require( 'path' );

module.exports = {
	context: path.resolve( __dirname, '..' ),
	module: {
		rules: [
			{
				test: /\.(ts|tsx)$/,
				exclude: /node_modules/,
				use: {
					loader: 'babel-loader'
				}
			}
		]
	},
	resolve: {
		extensions: [ '.ts', '.js', '.tsx', '.jsx' ]
	},
	plugins: []
};
