export type Scope = ( 'about' | 'avatars' | 'verified-accounts' | 'links' | 'interests' | 'contact-info' | 'wallet' | 'photos' | 'design' | 'privacy' )[];

export type ProfileUpdatedType = 'avatar_updated';

export type Open = ( email?: string ) => void;

export type OnProfileUpdated = ( type: ProfileUpdatedType ) => void;

export type OnOpened = () => void;

export type QuickEditorCoreOptions = Partial<{
	email: string;
	scope: Scope;
	local: string;
	onProfileUpdated: OnProfileUpdated;
	onOpened: OnOpened;
}>;

export class GravatarQuickEditorCore {
	_name: string;
	_email: string;
	_scope: Scope;
	_local: string;
	_onProfileUpdated: OnProfileUpdated;
	_onOpened: OnOpened;

	constructor( { email, scope = [], local, onProfileUpdated, onOpened }: QuickEditorCoreOptions ) {
		this._name = this._getName();
		this._email = email;
		this._scope = scope;
		this._local = local;
		this._onProfileUpdated = onProfileUpdated;
		this._onOpened = onOpened;

		window.addEventListener( 'message', this._onMessage.bind( this ) );
	}

	open: Open = ( email?: string ) => {
		email = email || this._email;

		if ( ! email ) {
			console.error( 'Gravatar Quick Editor: Email not provided' );
			return;
		}

		const width = 400;
		const height = 720;
		const left = window.screenLeft + ( window.outerWidth - width ) / 2;
		const top = window.screenTop + ( window.outerHeight - height ) / 2;
		const options = `popup,width=${ width },height=${ height },top=${ top },left=${ left }`;
		const host = this._local ? `https://${ this._local }.gravatar.com` : 'https://gravatar.com';
		const url = `${ host }/profile?email=${ email }&scope=${ this._scope.join( ',' ) }&is_quick_editor=true`;

		window.open( url, this._name, options );

		if ( this._onOpened ) {
			this._onOpened();
		}
	}

	_getName() {
		return `GravatarQuickEditor_${ new Date().getTime() }${ Math.floor( Math.random() * ( 9999 - 1000 ) + 1000 ) }`;
	}

	_onMessage( event: MessageEvent ) {
		if ( ! this._onProfileUpdated || ! event.origin.match( /https:\/\/([a-z\-]{2,5}\.)?gravatar.com/ ) ) {
			return;
		}

		if ( event.data?.name !== this._name ) {
			return;
		}

		this._onProfileUpdated( event.data.type );
	}
}