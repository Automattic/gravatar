module.exports = {
	'*.{js,jsx,ts,tsx}': [ () => 'yarn type-check', 'yarn lint:js' ],
	'*.{css,scss}': 'yarn lint:style',
	'*.md': 'yarn lint:md:docs',
	'*.{js,jsx,ts,tsx,json,yaml,yml}': 'yarn format',
};
