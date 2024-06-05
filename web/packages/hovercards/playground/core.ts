/* eslint-disable import/no-unresolved */

import type { Options, Attach } from '../dist';
import { Hovercards } from '../dist';

addEventListener( 'DOMContentLoaded', () => {
	// To test types
	const options: Options = {
		placement: 'right',
		// To test the empty about me case
		myHash: '99c3338797c95c418d9996bd39931506',
		i18n: {
			'View profile': 'View profile 😜',
		},
	};
	const hovercards = new Hovercards( options );

	// To test type
	const attach: Attach = ( target, opts ) => {
		hovercards.attach( target, opts );
	};
	attach( document.body, { ignoreSelector: '' } );

	// To test sanitization
	document.getElementById( 'inline-hovercard' )?.appendChild(
		Hovercards.createHovercard( {
			hash: '99c3338797c95c418d9996bd39931506',
			avatarUrl: 'https://www.gravatar.com/avatar/99c3338797c95c418d9996bd39931506?s=60&d=retro&r=g&esc=^^',
			profileUrl: 'https://gravatar.com/wellyshen',
			displayName: '<i>gyp</i>',
			location: '<i>Earth</i>',
			description: '<i>Test</i>, &amp;, &lt;, &gt;, &quot;, &#39;, &#x60;',
		} )
	);
} );
