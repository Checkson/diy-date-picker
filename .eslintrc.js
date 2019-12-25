module.exports = {
	root: true,
	extends: 'standard',
	parserOptions: {
		sourceType: 'module'
	},
	env: {
		browser: true,
		node: true,
		jest: true,
		worker: true,
		amd: true
	},
	rules: {
		"indent": ["error", 2],
		"quotes": ["error", "single"],
		"semi": ["error", "always"],
		"no-console": "off",
		"arrow-parents": 0,
		"no-new": "off"
	}
};
