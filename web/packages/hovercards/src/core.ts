import type { Placement } from './compute-position';
import computePosition from './compute-position';
import { escUrl, escHtml } from './sanitizer';
import __ from './i18n';

type AccountData = Record<'service_type' | 'service_label' | 'service_icon' | 'url', string>;

export type VerifiedAccount = Record<'type' | 'label' | 'icon' | 'url', string>;

export interface ProfileData {
	hash: string;
	avatarUrl: string;
	profileUrl: string;
	displayName: string;
	location?: string;
	description?: string;
	jobTitle?: string;
	company?: string;
	verifiedAccounts?: VerifiedAccount[];
}

export type CreateHovercard = (
	profileData: ProfileData,
	options?: { additionalClass?: string; myHash?: string; i18n?: Record<string, string> }
) => HTMLDivElement;

export type Attach = (target: HTMLElement, options?: { dataAttributeName?: string; ignoreSelector?: string }) => void;

export type Detach = () => void;

export type OnQueryHovercardRef = (ref: HTMLElement) => HTMLElement;

export type OnFetchProfileStart = (hash: string) => void;

export type OnFetchProfileSuccess = (hash: string, profileData: ProfileData) => void;

export type FetchProfileError = { code: number; message: string };

export type OnFetchProfileFailure = (hash: string, error: FetchProfileError) => void;

export type OnHovercardShown = (hash: string, hovercard: HTMLDivElement) => void;

export type OnHovercardHidden = (hash: string, hovercard: HTMLDivElement) => void;

export type Options = Partial<{
	placement: Placement;
	offset: number;
	autoFlip: boolean;
	delayToShow: number;
	delayToHide: number;
	additionalClass: string;
	myHash: string;
	i18n: Record<string, string>;
	onQueryHovercardRef: OnQueryHovercardRef;
	onFetchProfileStart: OnFetchProfileStart;
	onFetchProfileSuccess: OnFetchProfileSuccess;
	onFetchProfileFailure: OnFetchProfileFailure;
	onHovercardShown: OnHovercardShown;
	onHovercardHidden: OnHovercardHidden;
}>;

interface HovercardRef {
	id: string;
	hash: string;
	params: string;
	ref: HTMLElement;
}

const BASE_API_URL = 'https://api.gravatar.com/v3/profiles';

const dc = document;

export default class Hovercards {
	// Options
	_placement: Placement;
	_offset: number;
	_autoFlip: boolean;
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
	_i18n: Record<string, string> = {};

	// Variables
	_hovercardRefs: HovercardRef[] = [];
	_showHovercardTimeoutIds = new Map<string, ReturnType<typeof setTimeout>>();
	_hideHovercardTimeoutIds = new Map<string, ReturnType<typeof setTimeout>>();
	_cachedProfiles = new Map<string, ProfileData>();

	constructor({
		placement = 'right',
		autoFlip = true,
		offset = 10,
		delayToShow = 500,
		delayToHide = 300,
		additionalClass = '',
		myHash = '',
		onQueryHovercardRef = (ref) => ref,
		onFetchProfileStart = () => {},
		onFetchProfileSuccess = () => {},
		onFetchProfileFailure = () => {},
		onHovercardShown = () => {},
		onHovercardHidden = () => {},
		i18n = {},
	}: Options = {}) {
		this._placement = placement;
		this._autoFlip = autoFlip;
		this._offset = offset;
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
		this._i18n = i18n;
	}

	/**
	 * Queries hovercard refs on or within the target element
	 *
	 * @param {HTMLElement} target            - The element to query.
	 * @param {string}      dataAttributeName - Data attribute name associated with Gravatar hashes.
	 * @param {string}      [ignoreSelector]  - The selector to ignore certain elements.
	 * @return {HTMLElement[]}                - The queried hovercard refs.
	 * @private
	 */
	_queryHovercardRefs(target: HTMLElement, dataAttributeName: string, ignoreSelector?: string) {
		let refs: HTMLElement[] = [];
		const camelAttrName = dataAttributeName.replace(/-([a-z])/g, (g) => g[1].toUpperCase());
		const ignoreRefs = ignoreSelector ? Array.from(dc.querySelectorAll(ignoreSelector)) : [];
		const matchPath = 'gravatar.com/avatar/';

		if (
			(camelAttrName && target.dataset[camelAttrName]) ||
			(target.tagName === 'IMG' && (target as HTMLImageElement).src.includes(matchPath))
		) {
			refs = [target];
		} else {
			refs = Array.from(target.querySelectorAll(`img[src*="${matchPath}"]`));

			if (dataAttributeName) {
				refs = [
					// Filter out images that already have the data attribute
					...refs.filter((img) => !img.hasAttribute(`data-${dataAttributeName}`)),
					...Array.from<HTMLElement>(target.querySelectorAll(`[data-${dataAttributeName}]`)),
				];
			}
		}

		this._hovercardRefs = refs
			.map((ref, idx) => {
				if (ignoreRefs.includes(ref)) {
					return null;
				}

				let hash;
				let params;
				const dataAttrValue = ref.dataset[camelAttrName];

				if (dataAttrValue) {
					hash = dataAttrValue.split('?')[0];
					params = dataAttrValue;
				} else if (ref.tagName === 'IMG') {
					hash = (ref as HTMLImageElement).src.split('/').pop().split('?')[0];
					params = (ref as HTMLImageElement).src;
				}

				if (!hash) {
					return null;
				}

				const p = new URLSearchParams(params);
				const d = p.get('d') || p.get('default');
				const f = p.get('f') || p.get('forcedefault');
				const r = p.get('r') || p.get('rating');
				params = [d && `d=${d}`, f && `f=${f}`, r && `r=${r}`].filter(Boolean).join('&');

				return {
					id: `gravatar-hovercard-${hash}-${idx}`,
					hash,
					params: params ? `?${params}` : '',
					ref: this._onQueryHovercardRef(ref) || ref,
				};
			})
			.filter(Boolean);

		return this._hovercardRefs;
	}

	/**
	 * Creates a skeleton hovercard element.
	 *
	 * @return {HTMLDivElement} The created skeleton hovercard element.
	 */
	_createHovercardSkeleton() {
		const hovercard = dc.createElement('div');
		hovercard.className = `gravatar-hovercard gravatar-hovercard--skeleton${
			this._additionalClass ? ` ${this._additionalClass}` : ''
		}`;

		hovercard.innerHTML = `
			<div class="gravatar-hovercard__inner">
				<div class="gravatar-hovercard__header">
					<div class="gravatar-hovercard__avatar-link"></div>
					<div class="gravatar-hovercard__personal-info-link"></div>
				</div>
				<div class="gravatar-hovercard__footer">
					<div class="gravatar-hovercard__social-link"></div>
					<div class="gravatar-hovercard__profile-link""></div>
				</div>
			</div>
    `;

		return hovercard;
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
	static createHovercard: CreateHovercard = (profileData, { additionalClass, myHash, i18n = {} } = {}) => {
		const {
			hash,
			avatarUrl,
			profileUrl,
			displayName,
			location,
			description,
			jobTitle,
			company,
			verifiedAccounts = [],
		} = profileData;

		const hovercard = dc.createElement('div');
		hovercard.className = `gravatar-hovercard${additionalClass ? ` ${additionalClass}` : ''}`;

		const trackedProfileUrl = escUrl(`${profileUrl}?utm_source=hovercard`);
		const username = escHtml(displayName);
		const isEditProfile = !description && myHash === hash;
		const renderSocialLinks = verifiedAccounts
			.slice(0, 3)
			.reduce((links, { label, icon, url, type }) => {
				links.push(`
					<a class="gravatar-hovercard__social-link" href="${escUrl(url)}" target="_blank" data-service-name="${type}">
						<img class="gravatar-hovercard__social-icon" src="${escUrl(icon)}" width="32" height="32" alt="${escHtml(label)}" />
					</a>
				`);

				return links;
			}, [])
			.join('');

		const jobInfo = [jobTitle, company].filter(Boolean).join(', ');

		hovercard.innerHTML = `
			<div class="gravatar-hovercard__inner">
				<div class="gravatar-hovercard__header">
					<a class="gravatar-hovercard__avatar-link" href="${trackedProfileUrl}" target="_blank">
						<img class="gravatar-hovercard__avatar" src="${escUrl(avatarUrl)}" width="72" height="72" alt="${username}" />
					</a>
					<a class="gravatar-hovercard__personal-info-link" href="${trackedProfileUrl}" target="_blank">
						<h4 class="gravatar-hovercard__name">${username}</h4>
						${jobInfo ? `<p class="gravatar-hovercard__job">${escHtml(jobInfo)}</p>` : ''}
						${location ? `<p class="gravatar-hovercard__location">${escHtml(location)}</p>` : ''}
					</a>
				</div>
				<div class="gravatar-hovercard__body">
					${description ? `<p class="gravatar-hovercard__description">${escHtml(description)}</p>` : ''}
				</div>
				<div class="gravatar-hovercard__footer">
					<div class="gravatar-hovercard__social-links">
						<a class="gravatar-hovercard__social-link" href="${trackedProfileUrl}" target="_blank" data-service-name="gravatar">
							<img class="gravatar-hovercard__social-icon" src="https://secure.gravatar.com/icons/gravatar.svg" width="32" height="32" alt="Gravatar" />
						</a>
						${renderSocialLinks}
					</div>
					<a
						class="gravatar-hovercard__profile-link${isEditProfile ? ' gravatar-hovercard__profile-link--edit' : ''}"
						href="${isEditProfile ? 'https://gravatar.com/profiles/edit?utm_source=hovercard' : trackedProfileUrl}"
						target="_blank"
					>
						<span class="gravatar-hovercard__profile-link-text">
							${isEditProfile ? __(i18n, 'Edit your profile') : __(i18n, 'View profile')}
						</span>
						<svg width="16" height="16" viewBox="0 0 16 16" xmlns="http://www.w3.org/2000/svg">
							<path d="M12.6667 8.33338L9.16666 12.1667M12.6667 8.33338L2.66666 8.33338M12.6667 8.33338L9.16666 4.83338" stroke-width="1.5"/>
						</svg>
					</a>
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
	_showHovercard({ id, hash, params, ref }: HovercardRef) {
		const timeoutId = setTimeout(() => {
			if (dc.getElementById(id)) {
				return;
			}

			let hovercard: HTMLDivElement;

			if (this._cachedProfiles.has(hash)) {
				const profile = this._cachedProfiles.get(hash);

				hovercard = Hovercards.createHovercard(
					{ ...profile, avatarUrl: profile.avatarUrl + params },
					{
						additionalClass: this._additionalClass,
						myHash: this._myHash,
						i18n: this._i18n,
					}
				);
			} else {
				hovercard = this._createHovercardSkeleton();

				this._onFetchProfileStart(hash);

				fetch(`${BASE_API_URL}/${hash}?source=hovercard`)
					.then((res) => {
						// API error handling
						if (res.status !== 200) {
							throw res.status;
						}

						return res.json();
					})
					.then((data) => {
						this._cachedProfiles.set(hash, {
							hash: data.hash,
							avatarUrl: data.avatar_url,
							profileUrl: data.profile_url,
							displayName: data.display_name,
							location: data.location,
							description: data.description,
							jobTitle: data.job_title,
							company: data.company,
							verifiedAccounts: data.verified_accounts?.map((account: AccountData) => ({
								type: account.service_type,
								label: account.service_label,
								icon: account.service_icon,
								url: account.url,
							})),
						});

						const profile = this._cachedProfiles.get(hash);
						const hovercardInner = Hovercards.createHovercard(
							{ ...profile, avatarUrl: profile.avatarUrl + params },
							{
								additionalClass: this._additionalClass,
								myHash: this._myHash,
								i18n: this._i18n,
							}
						).firstElementChild;

						hovercard.classList.remove('gravatar-hovercard--skeleton');
						hovercard.replaceChildren(hovercardInner);

						this._onFetchProfileSuccess(hash, this._cachedProfiles.get(hash));
					})
					.catch((code) => {
						let message = __(
							this._i18n,
							'Sorry, we are unable to load this Gravatar profile. Please check your internet connection.'
						);

						if (code === 404) {
							message = __(this._i18n, 'Sorry, we are unable to load this Gravatar profile.');
						}

						if (code === 429) {
							message = __(this._i18n, 'Too Many Requests.');
						}

						if (code === 500) {
							message = __(this._i18n, 'Internal Server Error.');
						}

						hovercard.firstElementChild.classList.add('gravatar-hovercard__inner--error');
						hovercard.firstElementChild.innerHTML = `
							<img class="gravatar-hovercard__avatar" src="https://2.gravatar.com/avatar/${hash}${params}" width="72" height="72" alt="Avatar" />
							<i class="gravatar-hovercard__error-message">${message}</i>
						`;

						this._onFetchProfileFailure(hash, { code, message });
					});
			}

			// Set the hovercard ID here to avoid the show / hide side effect
			hovercard.id = id;
			// Don't hide the hovercard when the mouse is over the hovercard from the ref
			hovercard.addEventListener('mouseenter', () => clearInterval(this._hideHovercardTimeoutIds.get(id)));
			hovercard.addEventListener('mouseleave', () => this._hideHovercard(id));

			// Placing the hovercard at the top-level of the dc to avoid being clipped by overflow
			dc.body.appendChild(hovercard);

			const { x, y, padding, paddingValue } = computePosition(ref, hovercard, {
				placement: this._placement,
				offset: this._offset,
				autoFlip: this._autoFlip,
			});

			hovercard.style.position = 'absolute';
			hovercard.style.left = `${x}px`;
			hovercard.style.top = `${y}px`;
			// To bridge the gap between the ref and the hovercard,
			// ensuring that the hovercard remains visible when the mouse hovers over the gap
			hovercard.style[padding] = `${paddingValue}px`;

			this._onHovercardShown(hash, hovercard);
		}, this._delayToShow);

		this._showHovercardTimeoutIds.set(id, timeoutId);
	}

	/**
	 * Waits for a specified delay and hides the hovercard.
	 *
	 * @param {string} id - The ID associated with the hovercard.
	 * @return {void}
	 * @private
	 */
	_hideHovercard(id: string) {
		const timeoutId = setTimeout(() => {
			const hovercard = dc.getElementById(id);

			if (hovercard) {
				hovercard.remove();
				this._onHovercardHidden(id, hovercard as HTMLDivElement);
			}
		}, this._delayToHide);

		this._hideHovercardTimeoutIds.set(id, timeoutId);
	}

	/**
	 * Handles the mouseenter event for hovercard refs.
	 *
	 * @param {MouseEvent} e            - The mouseenter event object.
	 * @param              hovercardRef - The hovercard ref object.
	 * @return {void}
	 * @private
	 */
	_handleMouseEnter(e: MouseEvent, hovercardRef: HovercardRef) {
		if ('ontouchstart' in dc) {
			return;
		}

		e.stopImmediatePropagation();

		// Don't hide the hovercard when the mouse is over the ref from the hovercard
		clearInterval(this._hideHovercardTimeoutIds.get(hovercardRef.id));
		this._showHovercard(hovercardRef);
	}

	/**
	 * Handles the mouseleave event for hovercard refs.
	 *
	 * @param {MouseEvent} e               - The mouseleave event object.
	 * @param              hovercardRef    - The hovercard ref object.
	 * @param              hovercardRef.id - The ID associated with the hovercard.
	 * @return {void}
	 * @private
	 */
	_handleMouseLeave(e: MouseEvent, { id }: HovercardRef) {
		if ('ontouchstart' in dc) {
			return;
		}

		e.stopImmediatePropagation();

		clearInterval(this._showHovercardTimeoutIds.get(id));
		this._hideHovercard(id);
	}

	/**
	 * Attaches event listeners on or within the target element.
	 *
	 * @param {HTMLElement} target                    - The target element to set.
	 * @param {Object}      [options={}]              - The optional parameters.
	 * @param               options.dataAttributeName - Data attribute name associated with Gravatar hashes.
	 * @param               options.ignoreSelector    - The selector to ignore certain elements.
	 * @return {void}
	 */
	attach: Attach = (target, { dataAttributeName = 'gravatar-hash', ignoreSelector } = {}) => {
		if (!target) {
			return;
		}

		this.detach();

		this._queryHovercardRefs(target, dataAttributeName, ignoreSelector).forEach((hovercardRef) => {
			hovercardRef.ref.addEventListener('mouseenter', (e) => this._handleMouseEnter(e, hovercardRef));
			hovercardRef.ref.addEventListener('mouseleave', (e) => this._handleMouseLeave(e, hovercardRef));
		});
	};

	/**
	 * Removes event listeners from hovercard refs and resets the stored list of these refs.
	 *
	 * @return {void}
	 */
	detach: Detach = () => {
		if (!this._hovercardRefs.length) {
			return;
		}

		this._hovercardRefs.forEach(({ ref }) => {
			ref.removeEventListener('mouseenter', () => this._handleMouseEnter);
			ref.removeEventListener('mouseleave', () => this._handleMouseLeave);
		});

		this._hovercardRefs = [];
	};
}
