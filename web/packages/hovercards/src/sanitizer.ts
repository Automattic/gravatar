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

// Returns an attribute-safe URL, or an empty string if it can't be parsed or its protocol isn't allowed.
// Relative URLs are resolved against `base` when one is given.
export function escSafeUrl( url: string, allowedProtocols = [ 'http:', 'https:' ], base?: string ) {
	try {
		return allowedProtocols.includes( new URL( url, base ).protocol ) ? escHtml( url ) : '';
	} catch {
		return '';
	}
}

// Like escSafeUrl(), but for image sources: also allows relative, data: and blob: URLs.
export function escImgUrl( url: string ) {
	return escSafeUrl( url, [ 'http:', 'https:', 'data:', 'blob:' ], document.baseURI );
}
