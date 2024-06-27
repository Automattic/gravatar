import GravatarQuickEditor from '../dist';

document.addEventListener( 'DOMContentLoaded', () => {
	new GravatarQuickEditor( '#button', 'joao.heringer@automattic.com', {
		avatarSelector: '.avatar',
		scope: [ 'avatars' ]
	} );
} );