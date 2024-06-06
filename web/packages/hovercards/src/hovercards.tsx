import type { ReactNode, CSSProperties } from 'react';
import { useEffect, useRef } from 'react';

import type { Options } from './core';
import useLatest from './use-latest';
import useHovercards from './use-hovercards';

export type HovercardsProps = Options &
	Partial< {
		children: ReactNode;
		attach: HTMLElement;
		dataAttributeName: string;
		ignoreSelector: string;
		className: string;
		style: CSSProperties;
	} >;

export default function Hovercards( {
	children,
	attach,
	dataAttributeName,
	ignoreSelector,
	className,
	style,
	...options
}: HovercardsProps = {} ) {
	const { attach: attachTo } = useHovercards( options );
	const containerRef = useRef( null );
	const attachRef = useLatest( attach );

	useEffect( () => {
		const target = attachRef.current || containerRef.current;

		if ( target ) {
			attachTo( target, { dataAttributeName, ignoreSelector } );
		}
	}, [ attachTo, attachRef, dataAttributeName, ignoreSelector ] );

	if ( attach || ! children ) {
		return null;
	}

	return (
		<div ref={ containerRef } className={ className } style={ style }>
			{ children }
		</div>
	);
}
