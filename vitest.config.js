import { fileURLToPath } from "node:url"
import { configDefaults, defineConfig } from "vitest/config"
export default defineConfig(
	{
		plugins: [
			{
				name: "click-css-factory",
				transform(code, id) {
					return id.endsWith("/src/click-css.js?factory")
						? {
							code: `export default function () {${code}\n}`,
							map: null
						}
						: null
				}
			}
		],
		resolve: {
			alias: {
				vscode: fileURLToPath(new URL("./test/vscode.js", import.meta.url))
			}
		},
		test: {
			exclude: [ ...configDefaults.exclude, ".tmp/**" ],
			include: [ "test/*.test.js" ]
		}
	}
)