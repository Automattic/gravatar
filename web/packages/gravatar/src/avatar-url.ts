import { sha256 } from 'js-sha256';

const AVATAR_BASE_URL = 'https://gravatar.com/avatar/';

export const MIN_SIZE = 1;
export const MAX_SIZE = 2048;

/**
 * Built-in default images. Any publicly reachable image URL is also accepted.
 *
 * @see https://docs.gravatar.com/sdk/images/#default-image
 */
export type GravatarDefaultImage =
	| 'initials'
	| 'color'
	| '404'
	| 'mp'
	| 'identicon'
	| 'monsterid'
	| 'wavatar'
	| 'retro'
	| 'robohash'
	| 'blank';

export type GravatarRating = 'g' | 'pg' | 'r' | 'x';

export interface GravatarImageOptions {
	/** Email address. Hashed (SHA256) client-side. Ignored when `hash` is set. */
	email?: string;
	/** Precomputed SHA256 hash of the trimmed, lowercased email address. */
	hash?: string;
	/** Image size in pixels, 1–2048 (`s`). */
	size?: number;
	/** Built-in default keyword or URL of a custom default image (`d`). */
	default?: GravatarDefaultImage | ( string & {} );
	/** Always serve the default image (`f=y`). */
	forceDefault?: boolean;
	/** Maximum image rating (`r`). */
	rating?: GravatarRating;
	/** Initials to show with `default="initials"` (`initials`). */
	initials?: string;
	/** Name to extract initials from with `default="initials"` (`name`). */
	name?: string;
}

export function getHash( email = '' ): string {
	const normalized = email.trim().toLowerCase();
	return normalized ? sha256( normalized ) : '';
}

/**
 * Builds a Gravatar image URL.
 *
 * @see https://docs.gravatar.com/sdk/images/
 */
export function getGravatarImageUrl( {
	email,
	hash,
	size,
	default: defaultImage,
	forceDefault,
	rating,
	initials,
	name,
}: GravatarImageOptions ): string {
	const params = new URLSearchParams();

	if ( size !== undefined ) {
		const clamped = Math.min( MAX_SIZE, Math.max( MIN_SIZE, Math.round( size ) ) );
		params.set( 's', String( clamped ) );
	}
	if ( defaultImage ) {
		params.set( 'd', defaultImage );
	}
	if ( forceDefault ) {
		params.set( 'f', 'y' );
	}
	if ( rating ) {
		params.set( 'r', rating );
	}
	if ( initials ) {
		params.set( 'initials', initials );
	}
	if ( name ) {
		params.set( 'name', name );
	}

	const query = params.toString();
	// An all-zero hash is what Gravatar serves the default image for.
	const resolvedHash = hash || getHash( email ) || '0'.repeat( 64 );
	return `${ AVATAR_BASE_URL }${ resolvedHash }${ query ? `?${ query }` : '' }`;
}
