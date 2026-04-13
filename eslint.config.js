import eslint from "@eslint/js";
import tseslint from "typescript-eslint";
import prettierConfig from "eslint-config-prettier";

export default tseslint.config(
	eslint.configs.recommended,
	...tseslint.configs.recommendedTypeChecked,
	...tseslint.configs.strictTypeChecked,
	...tseslint.configs.stylisticTypeChecked,
	{
		languageOptions: {
			parserOptions: {
				project: true,
				tsconfigRootDir: import.meta.dirname,
			},
		},
	},
	{
		files: ["src/**/*.ts"],
		rules: {
			"class-methods-use-this": "off",
			"guard-for-in": "off",
			"no-restricted-syntax": ["error", "ForInStatement", "LabeledStatement", "WithStatement"],
			"prefer-destructuring": ["error", { object: true, array: false }],
			"no-underscore-dangle": "off",

			"@typescript-eslint/lines-between-class-members": "off",
			"@typescript-eslint/no-floating-promises": "warn",
			"@typescript-eslint/no-explicit-any": "off", // Maintain existing pragmatism
			"@typescript-eslint/no-unused-vars": [
				"warn",
				{
					argsIgnorePattern: "^_",
					varsIgnorePattern: "^_",
				},
			],

			// These rules require strictNullChecks in tsconfig.json to work correctly.
			// Since the project is currently non-strict, we disable them to avoid false-positive lint errors.
			"@typescript-eslint/no-unnecessary-condition": "off",
			"@typescript-eslint/prefer-nullish-coalescing": "off",
			"@typescript-eslint/no-unnecessary-boolean-literal-compare": "off",
			"@typescript-eslint/no-useless-default-assignment": "off",

			// Pragmatic Strict Rules
			"@typescript-eslint/restrict-template-expressions": [
				"error",
				{
					allowNumber: true,
					allowBoolean: true,
				},
			],
			"@typescript-eslint/no-unsafe-member-access": "warn",
			"@typescript-eslint/no-unsafe-assignment": "warn",
			"@typescript-eslint/no-unsafe-call": "warn",
			"@typescript-eslint/no-unsafe-return": "warn",
			"@typescript-eslint/no-unsafe-argument": "warn",
			"@typescript-eslint/no-misused-promises": [
				"error",
				{
					checksVoidReturn: false, // Vital for Discord event handlers
				},
			],
			"@typescript-eslint/use-unknown-in-catch-callback-variable": "off",
			"@typescript-eslint/no-deprecated": "warn",
			"@typescript-eslint/no-unnecessary-type-parameters": "off",
			"@typescript-eslint/no-unsafe-enum-comparison": "off",
		},
	},
	{
		// Disable rules for JS files (like config files)
		files: ["**/*.js", "**/*.cjs", "**/*.mjs"],
		...tseslint.configs.disableTypeChecked,
	},
	prettierConfig,
);
