import { sha256 } from 'js-sha256';

const AVATAR_BASE_URL = 'https://www.gravatar.com/avatar/';
const PROFILE_BASE_URL = 'https://www.gravatar.com/';

// Gravatar profile formats
export enum GravatarFormat {
	HTML = '',
	JSON = 'json',
	XML = 'xml',
	PHP = 'php',
	VCF = 'vcf',
	QR = 'qr',
}

// Gravatar default images
export enum GravatarDefault {
	STATUS_404 = '404',
	MYSTERY_PERSON = 'mp',
	IDENTICON = 'identicon',
	MONSTERID = 'monsterid',
	WAVATAR = 'wavatar',
	RETRO = 'retro',
	ROBOHASH = 'robohash',
	TRANSPARENT_PNG = 'blank',
}

// Gravatar ratings
export enum GravatarRating {
	GENERAL = 'g',
	PARENTAL_GUIDANCE = 'pg',
	RESTRICTED = 'r',
	X = 'x',
}

interface GravatarAvatarOptions {
	default?: GravatarDefault | string;
	size?: number;
	rating?: GravatarRating;
	forceDefault?: boolean;
}

// Function to get the SHA256 hash of the email
function getHash( email: string ): string {
	if ( typeof email !== 'string' || email.trim() === '' ) {
		// eslint-disable-next-line no-console
		console.error( 'Valid email is required' );
		return '';
	}
	return sha256( email.trim().toLowerCase() );
}

// Function to validate the options
function validateOptions( options: GravatarAvatarOptions ): void {
	if ( options.size !== undefined ) {
		if ( typeof options.size !== 'number' || options.size <= 0 ) {
			// eslint-disable-next-line no-console
			console.error( "Invalid value for 'size'. It must be a positive number." );
		}
	}
	if ( options.default !== undefined ) {
		if ( ! Object.values( GravatarDefault ).includes( options.default as GravatarDefault ) ) {
			try {
				new URL( options.default );
			} catch {
				// eslint-disable-next-line no-console
				console.error(
					"Invalid value for 'default'. It must be one of the accepted default image types or a valid URL."
				);
			}
		}
	}
	if ( options.rating !== undefined ) {
		if ( ! Object.values( GravatarRating ).includes( options.rating ) ) {
			// eslint-disable-next-line no-console
			console.error( "Invalid value for 'rating'. It must be one of the accepted rating." );
		}
	}
	if ( options.forceDefault !== undefined ) {
		if ( typeof options.forceDefault !== 'boolean' ) {
			// eslint-disable-next-line no-console
			console.error( "Invalid value for 'forceDefault'. It must be a boolean." );
		}
	}
}

// Function to validate the format
function validateFormat( format: GravatarFormat ): void {
	if ( ! Object.values( GravatarFormat ).includes( format ) ) {
		// eslint-disable-next-line no-console
		console.error( "Invalid value for 'format'. It must be one of the accepted profile formats." );
	}
}

// Function to generate the query string from options
function getQueryString( options: GravatarAvatarOptions ): string {
	validateOptions( options );
	const params: Partial< Record< 'size' | 'default' | 'rating' | 'forcedefault', string > > = {};
	for ( const key in options ) {
		if ( key === 'size' ) {
			params.size = options.size.toString();
		} else if ( key === 'default' ) {
			params.default = options.default;
		} else if ( key === 'rating' ) {
			params.rating = options.rating;
		} else if ( key === 'forceDefault' ) {
			params.forcedefault = options.forceDefault ? 'y' : 'n';
		}
	}

	const queryParams = Object.entries( params )
		.map( ( [ key, value ] ) => `${ encodeURIComponent( key ) }=${ encodeURIComponent( value ) }` )
		.join( '&' );
	return queryParams ? `?${ queryParams }` : '';
}

// Generate the Gravatar image URL using SHA256 hash
// Documentation: https://docs.gravatar.com/api/avatars/images/
export function avatarUrl( email: string, options: GravatarAvatarOptions = {} ): string {
	validateOptions( options );
	const hash = getHash( email );
	const query = getQueryString( options );
	return `${ AVATAR_BASE_URL }${ hash }${ query }`;
}

// Generate the Gravatar profile URL using SHA256 hash
// Documentation: https://docs.gravatar.com/api/profiles/
export function profileUrl( email: string, format: GravatarFormat = GravatarFormat.HTML ): string {
	validateFormat( format );
	const hash = getHash( email );
	const formatString = format === GravatarFormat.HTML ? '' : `.${ format }`;
	return `${ PROFILE_BASE_URL }${ hash }${ formatString }`;
}
