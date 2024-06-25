document.addEventListener( 'DOMContentLoaded', () => {
	const popupTrigger = document.querySelector( '[data-gravatar-email]' ) as HTMLElement;
	const avatarElement = document.querySelector( 'img[data-gravatar-avatar]' ) as HTMLImageElement;
	const globalScope = 'avatars';

	if ( ! popupTrigger ) {
		return;
	}

	popupTrigger.addEventListener( 'click', () => {
		const email = popupTrigger.dataset.gravatarEmail;
		const scope = popupTrigger.dataset.gravatarScope || globalScope;

		if ( ! email ) {
			return;
		}

		showPopup( email, scope )
	} );

	window.addEventListener( 'message', ( event ) => {
		//TODO: Handle localized origin
		if ( event.origin !== 'https://gravatar.com' ) {
			return;
		}

		if ( event.data?.type === 'avatar_updated' && avatarElement ) {
			if ( ! URL.canParse( avatarElement.src ) ) {
				return;
			}

			const avatarURL = new URL( avatarElement.src );
			avatarURL.searchParams.set( 't', new Date().getTime().toString() );

			setTimeout( () => {
				avatarElement.src = avatarURL.toString();
			}, 1000 );
		} else if ( event.data?.type === 'profile_updated') {
			window.dispatchEvent( new CustomEvent( 'GravatarProfileUpdated', { detail: event.data?.body } ) );
		}
	} );

	function showPopup( email: string, scope: string ) {
		const width = 480;
		const height = 720;
		const left = window.screenLeft + ( window.outerWidth - width ) / 2;
		const top = window.screenTop + ( window.outerHeight - height ) / 2;

		window.open(
			`https://gravatar.com/profile?email=${ email }&scope=${ scope }`,
			'Gravatar',
			`popup,width=${ width },height=${ height },top=${ top },left=${ left }`,
		);
	}
} )