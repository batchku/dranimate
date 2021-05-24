module.exports = {
	root: true,
	parser: '@typescript-eslint/parser',
	plugins: [
		'@typescript-eslint',
	],
	extends: [
		'eslint:recommended',
		'plugin:react/recommended',
		'plugin:@typescript-eslint/eslint-recommended',
		'plugin:@typescript-eslint/recommended',
		'plugin:@typescript-eslint/recommended-requiring-type-checking'
	],
	parserOptions: {
		tsconfigRootDir: '.',
		project: [
			'./tsconfig.json'
		]
	},
	rules: {
		'@typescript-eslint/unbound-method': 'off',
		"no-undef": 'off',
		"react/prop-types": "off"
	}
};