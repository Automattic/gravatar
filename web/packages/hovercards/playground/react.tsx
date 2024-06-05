/* eslint-disable import/no-unresolved */

import { createRoot } from 'react-dom/client';
import React, { useRef, useEffect } from 'react';

import type { HovercardsProps } from '../dist/index.react.d';
import { useHovercards, Hovercards } from '../dist/index.react';

// Test types
const props: HovercardsProps = {
	// attach: document.body,
	// placement: 'top',
	// ignoreSelector: '#grav-img-1',
};

function App() {
	// eslint-disable-next-line no-console
	const { attach } = useHovercards( { onFetchProfileSuccess: ( hash ) => console.log( hash ) } );
	const containerRef = useRef( null );

	useEffect( () => {
		if ( containerRef.current ) {
			attach( containerRef.current );
		}
	}, [ attach ] );

	return (
		<div style={ { display: 'flex', flexDirection: 'column', gap: '5rem' } }>
			<div>
				<div ref={ containerRef } style={ { display: 'flex', flexDirection: 'column', gap: '5rem' } }>
					<img
						src="https://www.gravatar.com/avatar/33252cd1f33526af53580fcb1736172f06e6716f32afdd1be19ec3096d15dea5?s=60&d=retro&r=g"
						width="60"
						height="60"
						alt="Gravatar"
					/>
					<img
						src="https://www.gravatar.com/avatar/c3bb8d897bb538896708195dd9eb162f585654611c50a3a1c9a16a7b64f33270"
						width="60"
						height="60"
						alt="Gravatar"
					/>
				</div>
			</div>
			<Hovercards style={ { display: 'flex', flexDirection: 'column', gap: '5rem' } } { ...props }>
				<img
					src="https://www.gravatar.com/avatar/33252cd1f33526af53580fcb1736172f06e6716f32afdd1be19ec3096d15dea5?s=60&d=retro&r=g"
					width="60"
					height="60"
					alt="Gravatar"
				/>
				<img
					src="https://www.gravatar.com/avatar/c3bb8d897bb538896708195dd9eb162f585654611c50a3a1c9a16a7b64f33270"
					width="60"
					height="60"
					alt="Gravatar"
				/>
				<div
					id="attr"
					data-gravatar-hash="c3bb8d897bb538896708195dd9eb162f585654611c50a3a1c9a16a7b64f33270?s=60&d=retro&r=g"
				>
					@WellyTest
				</div>
			</Hovercards>
		</div>
	);
}

const root = createRoot( document.getElementById( 'react-app' )! );
root.render( <App /> );
