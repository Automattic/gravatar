export function escHtml( str: string ) {
	const htmlEntities: Record< string, string > = {
		'&': '&amp;',
		'<': '&lt;',
		'>': '&gt;',
		'"': '&quot;',
		"'": '&#39;',
		'`': '&#x60;',
	};

	// Don't escape if already escaped.
	return str.replace( /&(amp|lt|gt|quot|#39|x60);|[\&<>"'`]/g, ( match ) =>
		match[ 0 ] === '&' ? match : htmlEntities[ match ]
	);
}

export function escUrl( url: string ) {
	return encodeURI( url );
}
