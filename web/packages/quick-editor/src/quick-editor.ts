import { GravatarQuickEditorCore, ProfileUpdatedType, Scope } from './quick-editor-core';

export type QuickEditorOptions = {
	email: string;
	editorTriggerSelector: string;
	avatarSelector?: string;
	scope?: Scope;
	local?: string;
	avatarRefreshDelay?: number;
}

export default class GravatarQuickEditor {
	_quickEditor: GravatarQuickEditorCore;
	_editorTrigger: HTMLElement;
	_avatarList: NodeListOf<HTMLImageElement>;
	_avatarRefreshDelay: number;

	constructor( { email, editorTriggerSelector, avatarSelector, scope, local, avatarRefreshDelay }: QuickEditorOptions ) {
		this._quickEditor = new GravatarQuickEditorCore( { email, scope, local, onProfileUpdated: this._onProfileUpdated.bind( this ) } );
		this._editorTrigger = document.querySelector( editorTriggerSelector );
		this._avatarList = document.querySelectorAll( avatarSelector );
		this._avatarRefreshDelay = avatarRefreshDelay || 1000;

		this._editorTrigger?.addEventListener( 'click', () => this._quickEditor.open() );
	}

	_onProfileUpdated( type: ProfileUpdatedType ) {
		if ( type !== 'avatar_updated' || this._avatarList.length === 0 ) {
			return;
		}

		this._avatarList.forEach( avatarElement => {
			if ( ! URL.canParse( avatarElement.src ) || ! avatarElement.src.includes( 'gravatar.com/avatar' ) ) {
				return;
			}

			const avatarURL = new URL( avatarElement.src );
			avatarURL.searchParams.set( 't', new Date().getTime().toString() );

			//To give it some time for the cache to be cleaned
			setTimeout( () => {
				avatarElement.src = avatarURL.toString();
			}, this._avatarRefreshDelay );
		} )
	}
}