const path = require( 'path' );
const commonConfig = require( './config.common' );

module.exports = {
	...commonConfig,
	entry: './src/index.ts',
	output: {
		path: path.resolve( __dirname, 'dist' ),
		filename: 'index.js'
	}
};
