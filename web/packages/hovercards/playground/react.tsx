import { createRoot } from 'react-dom/client';
import { useRef, useEffect, useState } from 'react';

import type { HovercardsProps } from '../dist/index.react.d';
import { useHovercards, Hovercards } from '../dist/index.react';

// Test types
const props: HovercardsProps = {
	// attach: document.body,
	// placement: 'top',
	// ignoreSelector: '#grav-img-1',
	hideOnTargetClick: true,
	i18n: {
		'View profile →': 'Voir le profil →',
	},
};

function App() {
	const { attach } = useHovercards( {
		hideOnTargetClick: true,
		// eslint-disable-next-line no-console
		onFetchProfileSuccess: ( hash ) => console.log( hash ),
		onCanShowHovercard: ( hash ) => {
			// eslint-disable-next-line no-console
			console.log( 'Can show hovercard: ', hash );
			return true;
		},
	} );
	const containerRef = useRef( null );
	const attacherRef = useRef( null );
	const [ hashes, setHashes ] = useState( [
		'33252cd1f33526af53580fcb1736172f06e6716f32afdd1be19ec3096d15dea5',
		'c3bb8d897bb538896708195dd9eb162f585654611c50a3a1c9a16a7b64f33270',
		'20e74a1399c883caeeba81b57007bcaa058940dcdffca01babfddbaefa5c3c4a',
	] );

	useEffect( () => {
		if ( containerRef.current ) {
			attach( containerRef.current );
		}
	}, [ attach ] );

	function recycle() {
		const newHashes = [ ...hashes ];

		for ( let i = newHashes.length - 1; i > 0; i-- ) {
			const j = Math.floor( Math.random() * ( i + 1 ) );
			[ newHashes[ i ], newHashes[ j ] ] = [ newHashes[ j ], newHashes[ i ] ];
		}

		setHashes( newHashes );

		if ( attacherRef.current ) {
			attach( attacherRef.current );
		}
	}

	return (
		<div style={ { display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '5rem' } }>
			<div>
				<div ref={ containerRef } style={ { display: 'flex', flexDirection: 'column', gap: '5rem' } }>
					{ hashes.map( ( hash ) => (
						<img
							key={ hash }
							src={ `https://gravatar.com/avatar/${ hash }?s=128&d=retro&r=g` }
							width="60"
							height="60"
							alt="Gravatar"
						/>
					) ) }
				</div>
			</div>
			<Hovercards
				style={ { display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '5rem' } }
				{ ...props }
			>
				<img
					src="https://gravatar.com/avatar/20e74a1399c883caeeba81b57007bcaa058940dcdffca01babfddbaefa5c3c4a?s=60&d=retro&r=g"
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

			<div className="gravatar-hovercard-attacher">
				<button type="button" onClick={ recycle }>
					Recycle
				</button>
			</div>
		</div>
	);
}

const root = createRoot( document.getElementById( 'react-app' )! );
root.render( <App /> );
