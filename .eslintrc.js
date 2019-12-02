module.exports = {
	root: true,
	extends: 'standard',
	parseOptions: {
		sourceType: 'module'
	},
	env: {
		node: true,
		jest: true
	},
	rules: {
		"indent": ["error", 2],
		"quotes": ["error", "single"],
		"semi": ["error", "always"],
		"no-console": "off",
		"arrow-parents": 0,
		"no-new": "off"
	}
}