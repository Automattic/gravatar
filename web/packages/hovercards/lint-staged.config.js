module.exports = {
	'*.{js,jsx,ts,tsx}': [ () => 'npm run type-check', 'npm run lint:js' ],
	'*.{css,scss}': 'npm run lint:style',
	'*.md': 'npm run lint:md:docs',
	'*.{js,jsx,ts,tsx,json,yaml,yml}': 'npm run format',
};
