export type Placement =
	| 'top'
	| 'top-start'
	| 'top-end'
	| 'bottom'
	| 'bottom-start'
	| 'bottom-end'
	| 'left'
	| 'left-start'
	| 'left-end'
	| 'right'
	| 'right-start'
	| 'right-end';

type Options = Partial< {
	placement: Placement;
	offset: number;
	autoFlip: boolean;
} >;

interface ReturnValues {
	x: number;
	y: number;
	padding: 'paddingBottom' | 'paddingTop' | 'paddingRight' | 'paddingLeft';
	paddingValue: number;
}

const paddingMap: Record< string, ReturnValues[ 'padding' ] > = {
	top: 'paddingBottom',
	bottom: 'paddingTop',
	left: 'paddingRight',
	right: 'paddingLeft',
};

/**
 * Computes the position of a card relative to a ref element.
 *
 * @param {HTMLElement}    ref          - The ref element.
 * @param {HTMLDivElement} card         - The card element.
 * @param {Options}        [options={}] - The placement, offset, and auto-flip options.
 * @return {ReturnValues}               - The computed position values.
 */
export default function computingPosition(
	ref: HTMLElement,
	card: HTMLDivElement,
	{ placement = 'right', offset = 0, autoFlip = true }: Options = {}
): ReturnValues {
	const refRect = ref.getBoundingClientRect();
	const cardRect = card.getBoundingClientRect();
	const refScrollT = refRect.top + scrollY;
	const refScrollB = refRect.bottom + scrollY;
	const refScrollR = refRect.right + scrollX;
	const refScrollL = refRect.left + scrollX;
	let x = 0;
	let y = 0;
	let [ dir, align ] = placement.split( '-' );
	offset = Math.max( 0, offset );

	// Auto flip the card if there's not enough space
	// If both sides have not enough space, then the card will be placed on the side with more space
	if ( autoFlip ) {
		const topSpace = refRect.top;
		const bottomSpace = innerHeight - refRect.bottom;
		const leftSpace = refRect.left;
		const rightSpace = innerWidth - refRect.right;
		const floatingSpaceV = cardRect.height + offset;
		const floatingSpaceH = cardRect.width + offset;

		if ( dir === 'top' && topSpace < floatingSpaceV && bottomSpace > topSpace ) {
			dir = 'bottom';
		}

		if ( dir === 'bottom' && bottomSpace < floatingSpaceV && topSpace > bottomSpace ) {
			dir = 'top';
		}

		if ( dir === 'left' && leftSpace < floatingSpaceH && rightSpace > leftSpace ) {
			dir = 'right';
		}

		if ( dir === 'right' && rightSpace < floatingSpaceH && leftSpace > rightSpace ) {
			dir = 'left';
		}
	}

	// Calculate the position of the card
	if ( dir === 'top' || dir === 'bottom' ) {
		x = refScrollL + refRect.width / 2 - cardRect.width / 2;
		// The bottom offset will be filled with the card's padding
		y = dir === 'top' ? refScrollT - cardRect.height - offset : refScrollB;

		if ( align === 'start' ) {
			x = refScrollL;
		}

		if ( align === 'end' ) {
			x = refScrollR - cardRect.width;
		}
	} else {
		// The right offset will be filled with the card's padding
		x = dir === 'right' ? refScrollR : refScrollL - cardRect.width - offset;
		y = refScrollT + refRect.height / 2 - cardRect.height / 2;

		if ( align === 'start' ) {
			y = refScrollT;
		}

		if ( align === 'end' ) {
			y = refScrollB - cardRect.height;
		}
	}

	return { x, y, padding: paddingMap[ dir ], paddingValue: offset };
}
