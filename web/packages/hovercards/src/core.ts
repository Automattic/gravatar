import type { Placement } from './assign-position';
import assignPosition from './assign-position';
import { escHtml, escSafeUrl, escImgUrl } from './sanitizer';
import addQueryArg from './add-query-arg';
import __t from './i18n';

interface AccountData {
	service_type: string;
	service_label: string;
	service_icon: string;
	url: string;
	is_hidden: boolean;
}

export interface VerifiedAccount {
	type: string;
	label: string;
	icon: string;
	url: string;
	isHidden: boolean;
}

export type ContactInfo = Partial< {
	home_phone: string;
	work_phone: string;
	cell_phone: string;
	email: string;
	contact_form: string;
	calendar: string;
	calendly: string;
} >;

export interface PaymentLink {
	label: string;
	url: string;
}

export interface CryptoWallet {
	label: string;
	address: string;
}

export type Payments = Partial< {
	links: PaymentLink[];
	crypto_wallets: CryptoWallet[];
} >;

export interface ProfileData {
	hash: string;
	avatarUrl: string;
	profileUrl: string;
	displayName: string;
	location?: string;
	description?: string;
	jobTitle?: string;
	company?: string;
	headerImage?: string;
	hideDefaultHeaderImage?: boolean;
	backgroundColor?: string;
	verifiedAccounts?: VerifiedAccount[];
	contactInfo?: ContactInfo;
	payments?: Payments;
}

export interface CreateHovercardOptions {
	additionalClass?: string;
	myHash?: string;
	i18n?: Record< string, string >;
}

export type CreateHovercard = ( profileData: ProfileData, options?: CreateHovercardOptions ) => HTMLDivElement;

export interface CreateHovercardSkeletonOptions {
	additionalClass?: string;
}

export type CreateHovercardSkeleton = ( options?: CreateHovercardSkeletonOptions ) => HTMLDivElement;

export interface CreateHovercardErrorOptions {
	avatarAlt?: string;
	additionalClass?: string;
	additionalMessage?: string;
}

export type CreateHovercardError = (
	avatarUrl: string,
	message: string,
	options?: CreateHovercardErrorOptions
) => HTMLDivElement;

export type Attach = ( target: HTMLElement, options?: { dataAttributeName?: string; ignoreSelector?: string } ) => void;

export type Detach = () => void;

export type OnQueryHovercardRef = ( ref: HTMLElement ) => HTMLElement;

export type OnFetchProfileStart = ( hash: string ) => void;

export type OnFetchProfileSuccess = ( hash: string, profileData: ProfileData ) => void;

export type FetchProfileError = { code: number; message: string };

export type OnFetchProfileFailure = ( hash: string, error: FetchProfileError ) => void;

export type OnHovercardShown = ( hash: string, hovercard: HTMLDivElement ) => void;

export type OnHovercardHidden = ( hash: string, hovercard: HTMLDivElement ) => void;

export type OnCanShowHovercard = ( hash: string ) => boolean;

export type Options = Partial< {
	placement: Placement;
	offset: number;
	autoFlip: boolean;
	autoShift: boolean;
	hideOnTargetClick: boolean;
	delayToShow: number;
	delayToHide: number;
	additionalClass: string;
	myHash: string;
	i18n: Record< string, string >;
	onQueryHovercardRef: OnQueryHovercardRef;
	onFetchProfileStart: OnFetchProfileStart;
	onFetchProfileSuccess: OnFetchProfileSuccess;
	onFetchProfileFailure: OnFetchProfileFailure;
	onHovercardShown: OnHovercardShown;
	onHovercardHidden: OnHovercardHidden;
	onCanShowHovercard: OnCanShowHovercard;
} >;

interface HovercardRef {
	id: string;
	hash: string;
	params: string;
	ref: HTMLElement;
	onEnter: ( e: MouseEvent ) => void;
	onLeave: ( e: MouseEvent ) => void;
	onClick: ( e: MouseEvent ) => void;
}

const BASE_API_URL = 'https://api.gravatar.com/v3/profiles';

const dc = document;

export default class Hovercards {
	// Options
	_placement: Placement;
	_offset: number;
	_autoFlip: boolean;
	_autoShift: boolean;
	_hideOnTargetClick: boolean;
	_delayToShow: number;
	_delayToHide: number;
	_additionalClass: string;
	_myHash: string;
	_onQueryHovercardRef: OnQueryHovercardRef;
	_onFetchProfileStart: OnFetchProfileStart;
	_onFetchProfileSuccess: OnFetchProfileSuccess;
	_onFetchProfileFailure: OnFetchProfileFailure;
	_onHovercardShown: OnHovercardShown;
	_onHovercardHidden: OnHovercardHidden;
	_canShowHovercard: OnCanShowHovercard;
	_i18n: Record< string, string > = {};

	// Variables
	_hovercardRefs: HovercardRef[] = [];
	_showHovercardTimeoutIds = new Map< string, ReturnType< typeof setTimeout > >();
	_hideHovercardTimeoutIds = new Map< string, ReturnType< typeof setTimeout > >();
	_cachedProfiles = new Map< string, ProfileData >();

	constructor( {
		placement = 'right-start',
		offset = 10,
		autoFlip = true,
		autoShift = true,
		hideOnTargetClick = false,
		delayToShow = 500,
		delayToHide = 300,
		additionalClass = '',
		myHash = '',
		onQueryHovercardRef = ( ref ) => ref,
		onFetchProfileStart = () => {},
		onFetchProfileSuccess = () => {},
		onFetchProfileFailure = () => {},
		onHovercardShown = () => {},
		onHovercardHidden = () => {},
		onCanShowHovercard = () => true,
		i18n = {},
	}: Options = {} ) {
		this._placement = placement;
		this._offset = offset;
		this._autoFlip = autoFlip;
		this._autoShift = autoShift;
		this._hideOnTargetClick = hideOnTargetClick;
		this._delayToShow = delayToShow;
		this._delayToHide = delayToHide;
		this._additionalClass = additionalClass;
		this._myHash = myHash;
		this._onQueryHovercardRef = onQueryHovercardRef;
		this._onFetchProfileStart = onFetchProfileStart;
		this._onFetchProfileSuccess = onFetchProfileSuccess;
		this._onFetchProfileFailure = onFetchProfileFailure;
		this._onHovercardShown = onHovercardShown;
		this._onHovercardHidden = onHovercardHidden;
		this._canShowHovercard = onCanShowHovercard;
		this._i18n = i18n;
	}

	/**
	 * Queries hovercard refs on or within the target element.
	 *
	 * @param {HTMLElement} target            - The element to query.
	 * @param {string}      dataAttributeName - Data attribute name associated with Gravatar hashes.
	 * @param {string}      [ignoreSelector]  - The selector to ignore certain elements.
	 * @return {HovercardRef[]}               - The queried hovercard refs.
	 * @private
	 */
	_queryHovercardRefs( target: HTMLElement, dataAttributeName: string, ignoreSelector?: string ): HovercardRef[] {
		let refs: HTMLElement[] = [];
		const camelAttrName = dataAttributeName.replace( /-([a-z])/g, ( g ) => g[ 1 ].toUpperCase() );
		const ignoreRefs = ignoreSelector ? Array.from( dc.querySelectorAll( ignoreSelector ) ) : [];
		const matchPath = 'gravatar.com/avatar/';

		if (
			( camelAttrName && target.dataset[ camelAttrName ] ) ||
			( target.tagName === 'IMG' && ( target as HTMLImageElement ).src.includes( matchPath ) )
		) {
			refs = [ target ];
		} else {
			refs = Array.from( target.querySelectorAll( `img[src*="${ matchPath }"]` ) );

			if ( dataAttributeName ) {
				refs = [
					// Filter out images that already have the data attribute
					...refs.filter( ( img ) => ! img.hasAttribute( `data-${ dataAttributeName }` ) ),
					...Array.from< HTMLElement >( target.querySelectorAll( `[data-${ dataAttributeName }]` ) ),
				];
			}
		}

		this._hovercardRefs = refs
			.map( ( ref, idx ) => {
				if ( ignoreRefs.includes( ref ) ) {
					return null;
				}

				let hash;
				let params;
				const dataAttrValue = ref.dataset[ camelAttrName ];

				if ( dataAttrValue ) {
					const part = dataAttrValue.split( '?' );

					hash = part[ 0 ];
					params = part.length > 1 ? part[ 1 ] : '';
				} else if ( ref.tagName === 'IMG' ) {
					const part = ( ref as HTMLImageElement ).src.split( '/' ).pop().split( '?' );

					hash = part[ 0 ];
					params = part.length > 1 ? part[ 1 ] : '';
				}

				if ( ! hash ) {
					return null;
				}

				const p = new URLSearchParams( params );
				const d = p.get( 'd' ) || p.get( 'default' );
				const f = p.get( 'f' ) || p.get( 'forcedefault' );
				const r = p.get( 'r' ) || p.get( 'rating' );
				const initials = p.get( 'initials' );
				const name = p.get( 'name' );
				const txtColor = p.get( 'txt_color' );
				const bgColor = p.get( 'bg_color' );

				params = [
					d && `d=${ d }`,
					f && `f=${ f }`,
					r && `r=${ r }`,
					initials && `initials=${ initials }`,
					name && `name=${ name }`,
					txtColor && `txt_color=${ txtColor }`,
					bgColor && `bg_color=${ bgColor }`,
				]
					.filter( Boolean )
					.join( '&' );

				return {
					id: `gravatar-hovercard-${ hash }-${ idx }`,
					hash,
					params: params ? `?${ params }` : '',
					ref: this._onQueryHovercardRef( ref ) || ref,
				};
			} )
			.filter( Boolean )
			.map( ( hovercardRef: HovercardRef ) => ( {
				...hovercardRef,
				onEnter: ( e: MouseEvent ) => this._handleMouseEnter( e, hovercardRef ),
				onLeave: ( e: MouseEvent ) => this._handleMouseLeave( e, hovercardRef ),
				onClick: () => this._handleMouseClick( hovercardRef ),
			} ) );

		return this._hovercardRefs;
	}

	/**
	 * Creates a hovercard element with the provided profile data.
	 *
	 * @param {ProfileData} profileData               - The profile data to populate the hovercard.
	 * @param {Object}      [options]                 - Optional parameters for the hovercard.
	 * @param {string}      [options.additionalClass] - Additional CSS class for the hovercard.
	 * @param {string}      [options.myHash]          - The hash of the current user.
	 * @param {Object}      [options.i18n]            - The i18n object.
	 * @return {HTMLDivElement}                       - The created hovercard element.
	 */
	static createHovercard: CreateHovercard = (
		profileData,
		{ additionalClass, myHash, i18n = {} } = {}
	): HTMLDivElement => {
		const {
			hash,
			avatarUrl,
			profileUrl,
			displayName,
			location,
			description,
			jobTitle,
			company,
			headerImage,
			hideDefaultHeaderImage,
			verifiedAccounts = [],
			payments,
			contactInfo,
			backgroundColor,
		} = profileData;

		const hovercard = dc.createElement( 'div' );
		hovercard.className = `gravatar-hovercard${ additionalClass ? ` ${ additionalClass }` : '' }`;

		const calendly = verifiedAccounts.find( ( account ) => account.type === 'calendly' && ! account.isHidden );
		if ( contactInfo && calendly ) {
			contactInfo.calendly = calendly.url;
		}

		const trackedProfileUrl = escSafeUrl( addQueryArg( profileUrl, 'utm_source', 'hovercard' ) );
		const username = escHtml( displayName );
		const isEditProfile = ! description && myHash === hash;
		const jobInfo = [ jobTitle, company ].filter( Boolean ).join( ', ' );
		const hasPayments = payments?.links?.length || payments?.crypto_wallets?.length;
		const nonEmptyContacts = Object.entries( contactInfo || {} ).filter( ( [ _, value ] ) => !! value );

		const renderSocialLinks = verifiedAccounts
			.slice( 0, 3 )
			.reduce< string[] >( ( links, { label, icon, url, type, isHidden } ) => {
				const safeUrl = escSafeUrl( url );

				if ( isHidden || ! safeUrl ) {
					return links;
				}

				links.push( `
					<a class="gravatar-hovercard__social-link" href="${ safeUrl }" target="_blank" data-service-name="${ escHtml( type ) }">
						<img class="gravatar-hovercard__social-icon" src="${ escImgUrl( icon ) }" width="32" height="32" alt="${ escHtml(
							label
						) }" />
					</a>
				` );

				return links;
			}, [] )
			.join( '' );

		let headerImageHtml = '';
		let ctaButtons = '';
		let contactsDrawer = '';
		let sendMoneyDrawer = '';

		if ( headerImage || ! hideDefaultHeaderImage ) {
			const img = `<img class="gravatar-hovercard__header-image-img" src="${ escImgUrl( avatarUrl ) }" alt=""/>`;
			headerImageHtml = `<div class="gravatar-hovercard__header-image">${ ! headerImage ? img : '' }</div>`;
		}

		if ( nonEmptyContacts.length || hasPayments ) {
			if ( nonEmptyContacts.length ) {
				ctaButtons += `
					<button class="gravatar-hovercard__button" data-target-drawer="contact">${ __t( i18n, 'Contact' ) }</button>
				`;

				contactsDrawer = Hovercards._createDrawer(
					'contact',
					__t( i18n, 'Contact' ),
					Hovercards._createContactDrawerContent( nonEmptyContacts, { i18n } )
				);
			}

			if ( hasPayments ) {
				ctaButtons += `
					<button class="gravatar-hovercard__button" data-target-drawer="send-money">${ __t( i18n, 'Send money' ) }</button>
				`;

				sendMoneyDrawer = Hovercards._createDrawer(
					'send-money',
					__t( i18n, 'Send money' ),
					Hovercards._createSendMoneyDrawerContent( payments )
				);
			}

			ctaButtons = `
				<div class="gravatar-hovercard__buttons">${ ctaButtons }</div>
			`;
		}

		hovercard.innerHTML = `
			<div class="gravatar-hovercard__inner">
				${ headerImageHtml }
				<div class="gravatar-hovercard__header">
					<a class="gravatar-hovercard__avatar-link" href="${ trackedProfileUrl }" target="_blank">
						<img class="gravatar-hovercard__avatar" src="${ escImgUrl(
							avatarUrl
						) }" width="104" height="104" alt="${ username }" />
					</a>
					<a class="gravatar-hovercard__personal-info-link" href="${ trackedProfileUrl }" target="_blank">
						<h4 class="gravatar-hovercard__name">${ username }</h4>
						${ jobInfo ? `<p class="gravatar-hovercard__job">${ escHtml( jobInfo ) }</p>` : '' }
						${ location ? `<p class="gravatar-hovercard__location">${ escHtml( location ) }</p>` : '' }
					</a>
				</div>
				${
					description
						? `<div class="gravatar-hovercard__body">
								<p class="gravatar-hovercard__description">${ escHtml( description ) }</p>
							</div>`
						: ''
				}
				<div class="gravatar-hovercard__social-links">
					<a class="gravatar-hovercard__social-link" href="${ trackedProfileUrl }" target="_blank" data-service-name="gravatar">
						<img class="gravatar-hovercard__social-icon" src="https://s.gravatar.com/icons/gravatar.svg" width="32" height="32" alt="Gravatar" />
					</a>
					${ renderSocialLinks }
				</div>
				${ ctaButtons }
				<div class="gravatar-hovercard__footer">
					<a class="gravatar-hovercard__profile-url" title="${ escHtml(
						profileUrl
					) }" href="${ trackedProfileUrl }" target="_blank">
						${ escHtml( profileUrl.replace( 'https://', '' ) ) }
					</a>
					<a
						class="gravatar-hovercard__profile-link${ isEditProfile ? ' gravatar-hovercard__profile-link--edit' : '' }"
						href="${ isEditProfile ? 'https://gravatar.com/profiles/edit?utm_source=hovercard' : trackedProfileUrl }"
						target="_blank"
					>
						${ isEditProfile ? __t( i18n, 'Edit your profile →' ) : __t( i18n, 'View profile →' ) }
					</a>
				</div>
				${ contactsDrawer }
				${ sendMoneyDrawer }
				${ backgroundColor ? '<div class="gravatar-hovercard__profile-color"></div>' : '' }
			</div>
		`;

		const hovercardInner = hovercard.querySelector< HTMLElement >( '.gravatar-hovercard__inner' );
		const headerImageEl = hovercardInner.querySelector< HTMLDivElement >( '.gravatar-hovercard__header-image' );
		const profileColorEl = hovercardInner.querySelector< HTMLDivElement >( '.gravatar-hovercard__profile-color' );

		if ( headerImage && headerImageEl ) {
			headerImageEl.style.background = headerImage;
		}

		if ( backgroundColor && profileColorEl ) {
			profileColorEl.style.background = backgroundColor;
		}

		hovercardInner.querySelectorAll( '.gravatar-hovercard__button' ).forEach( ( el: HTMLButtonElement ) => {
			el.addEventListener( 'click', () => Hovercards._openDrawer( el, hovercardInner ) );
		} );
		hovercardInner.querySelectorAll( '.gravatar-hovercard__drawer-close' ).forEach( ( el: HTMLButtonElement ) => {
			el.addEventListener( 'click', () => Hovercards._closeDrawer( el, hovercardInner ) );
		} );
		hovercardInner.querySelectorAll( '.gravatar-hovercard__drawer-backdrop' ).forEach( ( el: HTMLDivElement ) => {
			el.addEventListener( 'click', () => Hovercards._closeDrawer( el, hovercardInner ) );
		} );

		return hovercard;
	};

	/**
	 * Creates a hovercard drawer.
	 *
	 * @param {string} name      - The drawer name.
	 * @param {string} titleText - The title shown at the drawer's header.
	 * @param {string} content   - The drawer inner content.
	 * @return {string}          - The drawer HTML string.
	 * @private
	 */
	private static _createDrawer( name: string, titleText: string, content: string ): string {
		return `
			<div class="gravatar-hovercard__drawer" data-drawer-name="${ name }">
				<div class="gravatar-hovercard__drawer-backdrop" data-target-drawer="${ name }"></div>
				<div class="gravatar-hovercard__drawer-card">
					<div class="gravatar-hovercard__drawer-header">
						<h2 class="gravatar-hovercard__drawer-title">${ titleText }</h2>
						<button class="gravatar-hovercard__drawer-close" data-target-drawer="${ name }">
							<svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
								<path d="M12 13.0607L15.7123 16.773L16.773 15.7123L13.0607 12L16.773 8.28772L15.7123 7.22706L12 10.9394L8.28771 7.22705L7.22705 8.28771L10.9394 12L7.22706 15.7123L8.28772 16.773L12 13.0607Z" fill="#101517"></path>
							</svg>
						</button>
					</div>
					<ul class="gravatar-hovercard__drawer-items">
						${ content }
					</ul>
				</div>
			</div>
		`;
	}

	/**
	 * Opens a hovercard drawer.
	 *
	 * @param {HTMLElement} target    - The target drawer.
	 * @param {HTMLElement} container - The container context to search for the drawer.
	 * @return {void}
	 * @private
	 */
	private static _openDrawer( target: HTMLElement, container: HTMLElement ): void {
		const drawer = container.querySelector(
			`.gravatar-hovercard__drawer[data-drawer-name="${ target.dataset.targetDrawer }"]`
		);

		if ( ! drawer ) {
			return;
		}

		drawer.classList.add( 'gravatar-hovercard__drawer--open' );
	}

	/**
	 * Closes a hovercard drawer.
	 *
	 * @param {HTMLElement} target    - The drawer selector.
	 * @param {HTMLElement} container - The container context to search for the drawer.
	 * @return {void}
	 * @private
	 */
	private static _closeDrawer( target: HTMLElement, container: HTMLElement ): void {
		const drawer = container.querySelector(
			`.gravatar-hovercard__drawer[data-drawer-name="${ target.dataset.targetDrawer }"]`
		);

		if ( ! drawer ) {
			return;
		}

		drawer.classList.add( 'gravatar-hovercard__drawer--closing' );
		drawer.classList.remove( 'gravatar-hovercard__drawer--open' );

		setTimeout( () => {
			drawer.classList.remove( 'gravatar-hovercard__drawer--closing' );
		}, 300 );
	}

	/**
	 * Creates the contact drawer content.
	 *
	 * @param {Record< string, any >[]} contactsData   - The user's contact data.
	 * @param {Object}                  [options]      - Optional parameters for the contact drawer.
	 * @param {Record<string, string>}  [options.i18n] - The i18n object.
	 * @return {string}                               - The contact drawer content.
	 * @private
	 */
	private static _createContactDrawerContent(
		contactsData: Record< string, any >[],
		{ i18n = {} }: { i18n?: Record< string, string > } = {}
	): string {
		const icons: Record< string, string > = {
			email: 'icons/mail.svg',
			home_phone: 'icons/home-phone.svg',
			work_phone: 'icons/work-phone.svg',
			cell_phone: 'icons/mobile-phone.svg',
			contact_form: 'icons/envelope.svg',
			calendar: 'icons/calendar.svg',
			calendly: 'icons/calendly.svg',
		};

		const labels: Record< string, string > = {
			email: __t( i18n, 'Email' ),
			home_phone: __t( i18n, 'Home Phone' ),
			work_phone: __t( i18n, 'Work Phone' ),
			cell_phone: __t( i18n, 'Cell Phone' ),
			contact_form: __t( i18n, 'Contact Form' ),
			calendar: __t( i18n, 'Calendar' ),
		};

		const getUrl = ( type: string, value: string ) => {
			switch ( type ) {
				case 'email':
					return escSafeUrl( `mailto:${ value }`, [ 'mailto:' ] );
				case 'contact_form':
				case 'calendar':
				case 'calendly':
					return escSafeUrl( value.startsWith( 'http' ) ? value : `https://${ value }` );
				default:
					return null;
			}
		};

		const items = contactsData.map( ( [ key, value ]: string[] ) => {
			const url = getUrl( key, value );
			let text = value.replace( /^(https?:\/\/)?(www\.)?/, '' );
			text = escHtml( text.endsWith( '/' ) ? text.slice( 0, -1 ) : text );

			if ( url ) {
				text = `<a class="gravatar-hovercard__drawer-item-link" href="${ url }" target="_blank">${ text }</a>`;
			}

			return `
				<li class="gravatar-hovercard__drawer-item">
					<img
						class="gravatar-hovercard__drawer-item-icon"
						width="24"
						height="24"
						src="https://s.gravatar.com/${ icons[ key ] }"
						alt=""
					>
					<div class="gravatar-hovercard__drawer-item-info">
						<span class="gravatar-hovercard__drawer-item-label">${ labels[ key ] ?? escHtml( key.replace( '_', ' ' ) ) }</span>
						<span class="gravatar-hovercard__drawer-item-text">${ text }</span>
					</div>
				</li>
			`;
		} );

		return items.join( '' );
	}

	/**
	 * Creates the send money drawer content.
	 *
	 * @param {Payments} payments - The user's payment data.
	 * @return {string}           - The send money drawer content.
	 * @private
	 */
	private static _createSendMoneyDrawerContent( payments: Payments ): string {
		const items: string[] = [];

		payments.links?.forEach( ( item ) => {
			const url = escSafeUrl( item.url );
			const text = escHtml( String( item.url ?? '' ).replace( /^(https?:\/\/)/, '' ) );

			items.push( `
				<li class="gravatar-hovercard__drawer-item">
					<img class="gravatar-hovercard__drawer-item-icon" width="24" height="24" src="https://s.gravatar.com/icons/link.svg" alt="">
					<div class="gravatar-hovercard__drawer-item-info">
						<span class="gravatar-hovercard__drawer-item-label">${ escHtml( item.label ) }</span>
						<span class="gravatar-hovercard__drawer-item-text">
							${ url ? `<a class="gravatar-hovercard__drawer-item-link" href="${ url }" target="_blank">${ text }</a>` : text }
						</span>
					</div>
				</li>
			` );
		} );

		payments.crypto_wallets?.forEach( ( item ) => {
			items.push( `
				<li class="gravatar-hovercard__drawer-item">
					<img class="gravatar-hovercard__drawer-item-icon" width="24" height="24" src="https://s.gravatar.com/icons/link.svg" alt="">
					<div class="gravatar-hovercard__drawer-item-info">
						<span class="gravatar-hovercard__drawer-item-label">${ escHtml( item.label ) }</span>
						<span class="gravatar-hovercard__drawer-item-text">${ escHtml( item.address ) }</span>
					</div>
				</li>
			` );
		} );

		return items.join( '' );
	}

	/**
	 * Creates a skeleton hovercard element.
	 *
	 * @param {Object} [options]                 - Optional parameters for the skeleton hovercard.
	 * @param {string} [options.additionalClass] - Additional CSS class for the skeleton hovercard.
	 * @return {HTMLDivElement}                  - The created skeleton hovercard element.
	 */
	static createHovercardSkeleton: CreateHovercardSkeleton = ( { additionalClass } = {} ): HTMLDivElement => {
		const hovercard = dc.createElement( 'div' );
		hovercard.className = `gravatar-hovercard gravatar-hovercard--skeleton${
			additionalClass ? ` ${ additionalClass }` : ''
		}`;

		hovercard.innerHTML = `
			<div class="gravatar-hovercard__inner">
				<div class="gravatar-hovercard__header">
					<div class="gravatar-hovercard__avatar-link"></div>
					<div class="gravatar-hovercard__personal-info-link"></div>
				</div>
				<div class="gravatar-hovercard__social-links">
					<div class="gravatar-hovercard__social-link"></div>
					<div class="gravatar-hovercard__social-link"></div>
				</div>
				<div class="gravatar-hovercard__footer">
					<div class="gravatar-hovercard__profile-url"></div>
					<div class="gravatar-hovercard__profile-link"></div>
				</div>
			</div>
		`;

		return hovercard;
	};

	/**
	 * Creates an error hovercard element.
	 *
	 * @param {string} avatarUrl                   - The URL of the avatar image.
	 * @param {string} message                     - The error message to display.
	 * @param {Object} [options]                   - Optional parameters for the error hovercard.
	 * @param {string} [options.avatarAlt]         - The alt text for the avatar image.
	 * @param {string} [options.additionalClass]   - Additional CSS class for the error hovercard.
	 * @param {string} [options.additionalMessage] - Additional message to display in the error hovercard.
	 * @return {HTMLDivElement}                    - The created error hovercard element.
	 */
	static createHovercardError: CreateHovercardError = (
		avatarUrl,
		message,
		{ avatarAlt = 'Avatar', additionalClass, additionalMessage = '' } = {}
	): HTMLDivElement => {
		const hovercard = dc.createElement( 'div' );
		hovercard.className = `gravatar-hovercard gravatar-hovercard--error${
			additionalClass ? ` ${ additionalClass }` : ''
		}`;

		hovercard.innerHTML = `
			<div class="gravatar-hovercard__inner">
				<img class="gravatar-hovercard__avatar" src="${ escImgUrl( avatarUrl ) }" width="104" height="104" alt="${ escHtml(
					avatarAlt
				) }" />
				<div class="gravatar-hovercard__error-message-wrapper">
					<i class="gravatar-hovercard__error-message">${ escHtml( message ) }</i>
					${ additionalMessage }
				</div>
			</div>
		`;

		return hovercard;
	};

	/**
	 * Waits for a specified delay and fetches the user's profile data,
	 * then shows the hovercard relative to the ref element.
	 *
	 * @param {HovercardRef} hovercardRef - The hovercard ref object.
	 * @return {void}
	 * @private
	 */
	_showHovercard( { id, hash, params, ref }: HovercardRef ): void {
		const timeoutId = setTimeout( () => {
			if ( dc.getElementById( id ) ) {
				return;
			}

			// Let client decide if we can show the hovercard
			if ( ! this._canShowHovercard( hash ) ) {
				return;
			}

			const urlParams = new URLSearchParams( params );
			urlParams.delete( 'size' );
			urlParams.set( 's', '256' );
			params = `?${ urlParams.toString() }`;

			let hovercard: HTMLDivElement;
			const positionOptions = {
				placement: this._placement,
				offset: this._offset,
				autoFlip: this._autoFlip,
				autoShift: this._autoShift,
			};

			if ( this._cachedProfiles.has( hash ) ) {
				const profile = this._cachedProfiles.get( hash );

				hovercard = Hovercards.createHovercard(
					{ ...profile, avatarUrl: profile.avatarUrl + params },
					{
						additionalClass: this._additionalClass,
						myHash: this._myHash,
						i18n: this._i18n,
					}
				);

				this._onHovercardShown( hash, hovercard );
			} else {
				hovercard = Hovercards.createHovercardSkeleton( { additionalClass: this._additionalClass } );

				this._onFetchProfileStart( hash );

				fetch( addQueryArg( `${ BASE_API_URL }/${ hash }`, 'source', 'hovercard' ) )
					.then( ( res ) => {
						// API error handling
						if ( res.status !== 200 ) {
							throw res.status;
						}

						return res.json();
					} )
					.then( ( data ) => {
						this._cachedProfiles.set( hash, {
							hash: data.hash,
							avatarUrl: data.avatar_url,
							profileUrl: data.profile_url,
							displayName: data.display_name,
							location: data.location,
							description: data.description,
							jobTitle: data.job_title,
							company: data.company,
							headerImage: data.header_image,
							hideDefaultHeaderImage: data.hide_default_header_image,
							backgroundColor: data.background_color,
							verifiedAccounts: data.verified_accounts?.map( ( account: AccountData ) => ( {
								type: account.service_type,
								label: account.service_label,
								icon: account.service_icon,
								url: account.url,
								isHidden: account.is_hidden,
							} ) ),
							contactInfo: data.contact_info,
							payments: data.payments,
						} );

						const profile = this._cachedProfiles.get( hash );
						const hovercardInner = Hovercards.createHovercard(
							{ ...profile, avatarUrl: profile.avatarUrl + params },
							{
								additionalClass: this._additionalClass,
								myHash: this._myHash,
								i18n: this._i18n,
							}
						).firstElementChild;

						hovercard.classList.remove( 'gravatar-hovercard--skeleton' );
						hovercard.replaceChildren( hovercardInner );

						// Recalculate the hovercard position after fetching the user data
						assignPosition( ref, hovercard, positionOptions );

						this._onFetchProfileSuccess( hash, this._cachedProfiles.get( hash ) );
						this._onHovercardShown( hash, hovercard );
					} )
					.catch( ( code ) => {
						let message = __t( this._i18n, 'Sorry, we are unable to load this Gravatar profile.' );

						switch ( code ) {
							case 403:
								message = __t( this._i18n, 'This profile is private.' );
								break;
							case 404:
								message = __t( this._i18n, 'Gravatar not found.' );
								break;
							case 429:
								message = __t( this._i18n, 'Too Many Requests.' );
								break;
							case 500:
								message = __t( this._i18n, 'Internal Server Error.' );
								break;
						}

						const additionalMessage =
							code === 404
								? `
								<i class="gravatar-hovercard__error-message gravatar-hovercard__error-message--claim-gravatar">
									${ __t( this._i18n, 'Is this you?' ) } 
									<a href="https://gravatar.com/signup?utm_source=hovercard" target="_blank">
										${ __t( this._i18n, 'Claim your free profile.' ) }
									</a>
								</i>
								`
								: '';

						const hovercardInner = Hovercards.createHovercardError(
							`https://0.gravatar.com/avatar/${ hash }${ params }`,
							message,
							{ additionalClass: this._additionalClass, additionalMessage }
						).firstElementChild;

						hovercard.classList.add( 'gravatar-hovercard--error' );
						hovercard.classList.remove( 'gravatar-hovercard--skeleton' );
						hovercard.replaceChildren( hovercardInner );

						this._onFetchProfileFailure( hash, { code, message } );
					} );
			}

			// Set the hovercard ID here to avoid the show / hide side effect
			hovercard.id = id;
			// Don't hide the hovercard when the mouse is over the hovercard from the ref
			hovercard.addEventListener( 'mouseenter', () => clearInterval( this._hideHovercardTimeoutIds.get( id ) ) );
			hovercard.addEventListener( 'mouseleave', () => this._hideHovercard( id ) );

			// Placing the hovercard at the top-level of the document to avoid being clipped by overflow
			dc.body.appendChild( hovercard );

			assignPosition( ref, hovercard, positionOptions );
		}, this._delayToShow );

		this._showHovercardTimeoutIds.set( id, timeoutId );
	}

	/**
	 * Waits for a specified delay and hides the hovercard.
	 *
	 * @param {string} id      - The ID associated with the hovercard.
	 * @param {number} [delay] - The delay in milliseconds before hiding the hovercard.
	 * @return {void}
	 * @private
	 */
	_hideHovercard( id: string, delay = this._delayToHide ): void {
		const timeoutId = setTimeout( () => {
			const hovercard = dc.getElementById( id );

			if ( hovercard ) {
				hovercard.remove();
				this._onHovercardHidden( id, hovercard as HTMLDivElement );
			}
		}, delay );

		this._hideHovercardTimeoutIds.set( id, timeoutId );
	}

	/**
	 * Handles the mouseenter event for hovercard refs.
	 *
	 * @param {MouseEvent}   e            - The mouseenter event object.
	 * @param {HovercardRef} hovercardRef - The hovercard ref object.
	 * @return {void}
	 * @private
	 */
	_handleMouseEnter( e: MouseEvent, hovercardRef: HovercardRef ): void {
		if ( 'ontouchstart' in dc ) {
			return;
		}

		e.stopImmediatePropagation();

		// Don't hide the hovercard when the mouse is over the ref from the hovercard
		clearInterval( this._hideHovercardTimeoutIds.get( hovercardRef.id ) );
		this._showHovercard( hovercardRef );
	}

	/**
	 * Handles the mouseleave event for hovercard refs.
	 *
	 * @param {MouseEvent}   e               - The mouseleave event object.
	 * @param {HovercardRef} hovercardRef    - The hovercard ref object.
	 * @param {string}       hovercardRef.id - The ID associated with the hovercard.
	 * @return {void}
	 * @private
	 */
	_handleMouseLeave( e: MouseEvent, { id }: HovercardRef ): void {
		if ( 'ontouchstart' in dc ) {
			return;
		}

		e.stopImmediatePropagation();

		clearInterval( this._showHovercardTimeoutIds.get( id ) );
		this._hideHovercard( id );
	}

	/**
	 * Handles the click event for hovercard refs.
	 *
	 * @param {HovercardRef} hovercardRef    - The hovercard ref object.
	 * @param {string}       hovercardRef.id - The ID associated with the hovercard.
	 * @return {void}
	 * @private
	 */
	_handleMouseClick( { id }: HovercardRef ): void {
		if ( 'ontouchstart' in dc || ! this._hideOnTargetClick ) {
			return;
		}

		clearInterval( this._showHovercardTimeoutIds.get( id ) );
		this._hideHovercard( id, 0 );
	}

	/**
	 * Attaches event listeners on or within the target element.
	 *
	 * @param {HTMLElement} target                    - The target element to set.
	 * @param {Object}      [options={}]              - The optional parameters.
	 * @param {string}      options.dataAttributeName - Data attribute name associated with Gravatar hashes.
	 * @param {string}      options.ignoreSelector    - The selector to ignore certain elements.
	 * @return {void}
	 */
	attach: Attach = ( target, { dataAttributeName = 'gravatar-hash', ignoreSelector } = {} ): void => {
		if ( ! target ) {
			return;
		}

		this.detach();

		this._queryHovercardRefs( target, dataAttributeName, ignoreSelector ).forEach( ( hovercardRef ) => {
			hovercardRef.ref.addEventListener( 'mouseenter', hovercardRef.onEnter );
			hovercardRef.ref.addEventListener( 'mouseleave', hovercardRef.onLeave );
			hovercardRef.ref.addEventListener( 'click', hovercardRef.onClick );
		} );
	};

	/**
	 * Removes event listeners from hovercard refs and resets the stored list of these refs.
	 *
	 * @return {void}
	 */
	detach: Detach = (): void => {
		if ( ! this._hovercardRefs.length ) {
			return;
		}

		this._hovercardRefs.forEach( ( hovercardRef ) => {
			hovercardRef.ref.removeEventListener( 'mouseenter', hovercardRef.onEnter );
			hovercardRef.ref.removeEventListener( 'mouseleave', hovercardRef.onLeave );
			hovercardRef.ref.removeEventListener( 'click', hovercardRef.onClick );

			// Clear the hovercard show timeout and remove the hovercard element.
			clearInterval( this._showHovercardTimeoutIds.get( hovercardRef.id ) );
			dc.getElementById( hovercardRef.id )?.remove();
		} );

		this._hovercardRefs = [];
	};
}
