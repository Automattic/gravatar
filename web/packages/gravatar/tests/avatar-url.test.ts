import { describe, expect, it } from '@jest/globals';
import { getGravatarImageUrl, getHash } from '../src/avatar-url';

const HASH = '27205e5c51cb03f862138b22bcb5dc20f94a342e744ff6df1b8dc8af3c865109';

describe( 'getHash', () => {
	it( 'trims and lowercases before hashing', () => {
		expect( getHash( '  Foo@Example.com ' ) ).toBe( getHash( 'foo@example.com' ) );
		expect( getHash( 'foo@example.com' ) ).toHaveLength( 64 );
	} );

	it( 'returns an empty string for blank input', () => {
		expect( getHash( '  ' ) ).toBe( '' );
	} );
} );

describe( 'getGravatarImageUrl', () => {
	it( 'builds the base URL from a hash', () => {
		expect( getGravatarImageUrl( { hash: HASH } ) ).toBe( `https://gravatar.com/avatar/${ HASH }` );
	} );

	it( 'maps all options to query parameters', () => {
		const url = new URL(
			getGravatarImageUrl( {
				hash: HASH,
				size: 200,
				default: 'https://example.com/a.jpg',
				forceDefault: true,
				rating: 'pg',
				initials: 'AM',
				name: 'Alex Morgan',
			} )
		);
		expect( Object.fromEntries( url.searchParams ) ).toEqual( {
			s: '200',
			d: 'https://example.com/a.jpg',
			f: 'y',
			r: 'pg',
			initials: 'AM',
			name: 'Alex Morgan',
		} );
	} );

	it( 'clamps size to 1–2048', () => {
		expect( getGravatarImageUrl( { hash: HASH, size: 5000 } ) ).toContain( 's=2048' );
		expect( getGravatarImageUrl( { hash: HASH, size: 0 } ) ).toContain( 's=1' );
	} );

	it( 'falls back to an all-zero hash without email or hash', () => {
		expect( getGravatarImageUrl( {} ) ).toContain( '/avatar/' + '0'.repeat( 64 ) );
	} );
} );
