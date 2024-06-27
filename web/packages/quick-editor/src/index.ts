export type GravatarQuickEditorOptions = {
	avatarSelector?: string;
	scope?: string[];
}

export default class GravatarQuickEditor {
	_triggerElement: HTMLElement;
	_avatarElements: NodeListOf<HTMLImageElement>;
	_email: string;
	_scope: string[];

	constructor( triggerSelector: string, email: string, options: GravatarQuickEditorOptions ) {
		this._triggerElement = document.querySelector( triggerSelector );
		this._email = email;

		if ( ! this._triggerElement ) {
			console.error( 'Gravatar Quick Editor: Trigger element not found' );
			return;
		}

		if ( ! this._email ) {
			console.error( 'Gravatar Quick Editor: Email not provided' );
			return;
		}

		if ( options.scope ) {
			this._scope = options.scope;
		}

		if ( options.avatarSelector ) {
			this._avatarElements = document.querySelectorAll<HTMLImageElement>( options.avatarSelector );
		}

		this.setupEvents();
	}

	setupEvents() {
		this._triggerElement.addEventListener( 'click', () => {
			this.showPopup()
		} );

		window.addEventListener( 'message', ( event ) => {
			if ( ! event.origin.match( /https:\/\/([a-z]{2,3}\.)?gravatar.com/ ) ) {
				return;
			}

			if ( event.data?.type === 'avatar_updated' && this._avatarElements.length > 0 ) {

				this._avatarElements.forEach( avatarElement => {
					if ( ! URL.canParse( avatarElement.src ) ) {
						return;
					}

					const avatarURL = new URL( avatarElement.src );
					avatarURL.searchParams.set( 't', new Date().getTime().toString() );

					//To give it some time for the cache to be cleaned
					setTimeout( () => {
						avatarElement.src = avatarURL.toString();
					}, 1000 );
				} )
			}
		} );
	}

	showPopup() {
		const width = 400;
		const height = 720;
		const left = window.screenLeft + ( window.outerWidth - width ) / 2;
		const top = window.screenTop + ( window.outerHeight - height ) / 2;

		window.open(
			`https://gravatar.com/profile?email=${ this._email }&scope=${ this._scope.join( ',' ) }&is_quick_editor`,
			'Gravatar',
			`popup,width=${ width },height=${ height },top=${ top },left=${ left }`,
		);
	}
}