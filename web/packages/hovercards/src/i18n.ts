import { escHtml } from './sanitizer';

// Returns the translated string as plain text.
export function translate( i18n: Record< string, string >, key: string ) {
	return i18n[ key ] || key;
}

// Returns the translated string, escaped for use in HTML.
export default function __t( i18n: Record< string, string >, key: string ) {
	return escHtml( translate( i18n, key ) );
}
