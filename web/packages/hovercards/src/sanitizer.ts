export function escHtml( str: string | null | undefined ) {
	const htmlEntities: Record< string, string > = {
		'&': '&amp;',
		'<': '&lt;',
		'>': '&gt;',
		'"': '&quot;',
		"'": '&#39;',
		'`': '&#x60;',
	};

	// Don't escape if already escaped.
	return String( str ?? '' ).replace( /&(amp|lt|gt|quot|#39|x60);|[\&<>"'`]/g, ( match ) =>
		match[ 0 ] === '&' ? match : htmlEntities[ match ]
	);
}

export function escUrl( url: string ) {
	return encodeURI( url );
}

// Returns an attribute-safe URL, or an empty string if it can't be parsed or its protocol isn't allowed.
export function escSafeUrl( url: string, allowedProtocols = [ 'http:', 'https:' ] ) {
	try {
		return allowedProtocols.includes( new URL( url ).protocol ) ? escHtml( url ) : '';
	} catch {
		return '';
	}
}
