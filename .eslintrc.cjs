module.exports = {
	env: {
		browser: true,
		es2021: true,
	},
	extends: ["eslint:recommended", "plugin:@typescript-eslint/recommended"],
	overrides: [],
	parser: "@typescript-eslint/parser",
	parserOptions: {
		ecmaVersion: "latest",
		sourceType: "module",
	},
	plugins: ["@typescript-eslint", "prettier"],
	rules: {
		"linebreak-style": ["error", "unix"],
		"comma-dangle": [
			"warn",
			{
				arrays: "always-multiline",
				objects: "always-multiline",
			},
		],
		quotes: ["error", "double", { avoidEscape: true }],
		semi: ["error", "always"],
		"prettier/prettier": "warn",
		"no-restricted-syntax": [
			"error",
			{
				selector: "IfStatement > ExpressionStatement > AssignmentExpression",
				message: "Please avoid single-line if syntax.",
			},
			{
				selector: "IfStatement > ReturnStatement",
				message: "Please avoid single-line if syntax.",
			},
		],
	},
};
