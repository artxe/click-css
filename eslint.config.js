import parser from "@typescript-eslint/parser"
import lube from "eslint-plugin-lube"
/** @type {import("eslint").Linter.Config[]} */
export default [
	{ ignores: [ "docs/min.js", "extension/out/**" ] },
	{
		files: [ "**/*.js", "**/*.json", "**/*.mjs", "**/*.ts" ],
		languageOptions: { ecmaVersion: "latest", parser, sourceType: "module" },
		plugins: lube.configs.strict.plugins,
		rules: { ...lube.configs.strict.rules, "prefer-const": "off" }
	},
	{
		ignores: [ "extension/**" ],
		rules: {
			"lube/pretty-sequence": [ "error", { "maxLength": 50 } ]
		}
	}
]