// @ts-ignore
import { GravatarQuickEditor, GravatarQuickEditorCore } from '../dist';
// @ts-ignore
import type { ProfileUpdatedType } from '../dist';

document.addEventListener( 'DOMContentLoaded', () => {
	const closeButton = document.querySelector( '#edit-avatar-core-close' ) as HTMLButtonElement | null;

	if ( ! closeButton ) {
		return;
	}

	new GravatarQuickEditor( {
		email: 'joao.heringer@automattic.com',
		scope: [ 'avatars' ],
		editorTriggerSelector: '#edit-avatar',
		avatarSelector: '.avatar',
	} );

	const quickEditorCore = new GravatarQuickEditorCore( {
		email: 'joao.heringer@automattic.com',
		scope: [ 'avatars', 'about' ],
		locale: 'es',
		utm: 'jetpack-comments',
		onProfileUpdated: ( type: ProfileUpdatedType ) => {
			// eslint-disable-next-line
			console.log( type );
		},
		onOpened: () => {
			// eslint-disable-next-line
			console.log( 'opened' );

			// eslint-disable-next-line
			console.log( 'isOpen = ' + quickEditorCore.isOpen() );

			closeButton.disabled = false;
		},
		onClosed: () => {
			// eslint-disable-next-line
			console.log( 'closed' );

			closeButton.disabled = true;
		},
	} );

	closeButton.addEventListener( 'click', () => {
		quickEditorCore.close();
	} );

	document.querySelector( '#edit-avatar-core' )?.addEventListener( 'click', () => {
		quickEditorCore.open();
	} );
} );
