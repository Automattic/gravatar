/* eslint-disable no-console */

import { avatarUrl, profileUrl } from '.';

function main() {
	const args = process.argv.slice( 2 );

	if ( args.length === 0 || args.includes( '--help' ) || args.includes( '-h' ) ) {
		console.log( 'Usage: cli [options] <email>' );
		console.log( 'Options:' );
		console.log( '  --help, -h     Show help' );
		console.log( '  --avatar, -a   Get avatar URL' );
		console.log( '  --profile, -p  Get profile URL' );
		process.exit( 0 );
	}

	const email = args.find( ( arg ) => ! arg.startsWith( '-' ) );

	if ( ! email ) {
		console.error( 'You need to provide an email address' );
		process.exit( 1 );
	}

	if ( args.includes( '--avatar' ) || args.includes( '-a' ) ) {
		console.log( avatarUrl( email ) );
	}

	if ( args.includes( '--profile' ) || args.includes( '-p' ) ) {
		console.log( profileUrl( email ) );
	}
}

main();
