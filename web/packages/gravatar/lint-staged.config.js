module.exports = {
	'*.{js,jsx,ts,tsx}': [ () => 'npm run type-check', 'npm run lint:js' ],
	'*.md': 'npm run lint:md',
	'*.{js,jsx,ts,tsx,json,yaml,yml}': 'npm run format',
};
