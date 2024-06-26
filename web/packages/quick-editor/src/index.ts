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
		if ( ! event.origin.match( /https:\/\/([a-z]{2,3}\.)?gravatar.com/ ) ) {
			return;
		}

		if ( event.data?.type === 'avatar_updated' && avatarElement ) {
			if ( ! URL.canParse( avatarElement.src ) ) {
				return;
			}

			const avatarURL = new URL( avatarElement.src );
			avatarURL.searchParams.set( 't', new Date().getTime().toString() );

			//To give it some time for the cache to be cleaned
			setTimeout( () => {
				avatarElement.src = avatarURL.toString();
			}, 1000 );
		}
	} );

	function showPopup( email: string, scope: string ) {
		const width = 480;
		const height = 720;
		const left = window.screenLeft + ( window.outerWidth - width ) / 2;
		const top = window.screenTop + ( window.outerHeight - height ) / 2;

		window.open(
			`https://gravatar.com/profile?email=${ email }&scope=${ scope }&is_quick_editor`,
			'Gravatar',
			`popup,width=${ width },height=${ height },top=${ top },left=${ left }`,
		);
	}
} )