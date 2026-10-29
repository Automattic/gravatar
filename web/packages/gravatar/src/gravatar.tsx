import { forwardRef } from 'react';
import { Avatar } from '@wordpress/ui';
import { getGravatarImageUrl, MAX_SIZE } from './avatar-url';
import type { GravatarImageOptions } from './avatar-url';

type AvatarRootProps = React.ComponentProps< typeof Avatar.Root >;
type SizeToken = NonNullable< AvatarRootProps[ 'size' ] >;

/** Pixel sizes of the `@wordpress/ui` avatar size tokens with the default design tokens. */
const TOKEN_PIXELS: Record< SizeToken, number > = {
	xs: 16,
	sm: 24,
	md: 32,
	lg: 40,
	xl: 64,
};

/** Request twice the displayed size so the image stays sharp on high-density screens. */
const PIXEL_DENSITY = 2;

export type GravatarProps = Omit< AvatarRootProps, 'children' | 'size' > &
	Omit< GravatarImageOptions, 'size' > & {
		/**
		 * Displayed size: a `@wordpress/ui` avatar token, or a pixel number (1–1024).
		 * The image is requested from Gravatar at twice this size (`s`).
		 *
		 * @default "md"
		 */
		size?: SizeToken | number;
		/**
		 * Accessible name for the avatar. Omit and the avatar is decorative (`aria-hidden`),
		 * for use next to text that already names the person.
		 */
		alt?: string;
		/**
		 * Delay in ms before the fallback is shown while the image loads.
		 */
		fallbackDelay?: number;
	};

/**
 * A Gravatar profile image, built on the `@wordpress/ui` Avatar.
 *
 * ```jsx
 * <Gravatar email="alex@example.com" size="lg" alt="Alex Morgan" default="initials" name="Alex Morgan" />
 * ```
 */
export const Gravatar = forwardRef< HTMLSpanElement, GravatarProps >( function Gravatar(
	{
		email,
		hash,
		size = 'md',
		default: defaultImage,
		forceDefault,
		rating,
		initials,
		name,
		alt,
		fallbackDelay,
		style,
		...rootProps
	},
	ref
) {
	const pixels = typeof size === 'number' ? size : TOKEN_PIXELS[ size ];
	const src = getGravatarImageUrl( {
		email,
		hash,
		size: Math.min( MAX_SIZE, pixels * PIXEL_DENSITY ),
		default: defaultImage,
		forceDefault,
		rating,
		initials,
		name,
	} );

	const a11yProps = alt
		? { role: 'img', 'aria-label': alt }
		: { 'aria-hidden': true as const };

	return (
		<Avatar.Root
			ref={ ref }
			size={ typeof size === 'number' ? undefined : size }
			style={
				typeof size === 'number'
					? { inlineSize: pixels, blockSize: pixels, ...style }
					: style
			}
			{ ...a11yProps }
			{ ...rootProps }
		>
			{ name ? (
				<Avatar.Initials name={ name } delay={ fallbackDelay } />
			) : (
				<Avatar.Fallback delay={ fallbackDelay } />
			) }
			<Avatar.Image src={ src } alt="" />
		</Avatar.Root>
	);
} );
