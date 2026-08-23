import { load } from "./dom.mjs"
import assert from "node:assert/strict"
import { readFileSync } from "node:fs"
import { describe, it } from "node:test"
import { gzipSync } from "node:zlib"
const targets = {
	"docs/min.js": new URL("../docs/min.js", import.meta.url)
}
const corpus = [
	"w=100",
	"lh=1.5",
	"flex",
	"c=red;bg=blue",
	"bdi=1_solid_red",
	"inset-inline=10",
	"bd=1_solid_rgb(0_0_0_/_.2)",
	"w=calc(100%_-_var(--gap))",
	"tab-size=~4",
	"bgi=url(/img/hero\\_bg.png?v\\=2)",
	"ct='('",
	"ct=\"it's\"",
	"w=100!!",
	":hover/c=red",
	">div/c=red",
	"[href='/docs']/c=red",
	":not(.a/b)/c=red",
	"@sm@w=100",
	"@sm&dark@c=red",
	"@(400px<=width<=700px)@w=100",
	"@@supports_(display=grid)@d=grid",
	"--gap=10;p=--gap",
	"w=calc(1",
	"[data-x=y/c=red"
]
const expected_class_change = load().via_class_change(...corpus)
const expected_insertion = load().via_insertion(...corpus)
const expected_reset = load().reset
describe(
	"README matches the source",
	() => {
		const source = readFileSync(
			new URL("../src/click-css.js", import.meta.url),
			"utf8"
		)
		const readme = readFileSync(new URL("../README.md", import.meta.url), "utf8")
		/**
		 * @param {string} label
		 * @returns {string[]}
		 */
		function list_of(label) {
			return ((readme.split("[" + label + "](")[1] ?? "").split("\n")[1] ?? "")
				.split(" · ")
				.map(item => item.replace(/`/g, ""))
				.sort()
		}
		/**
		 * @param {string} name
		 * @returns {string[]}
		 */
		function map_of(name) {
			return [
				...((source.split("let " + name + " ")[1] ?? "").split("\n\t)")[0] ?? "").matchAll(/\[ "([^"]+)", "([^"]+)" \]/g)
			]
				.map(m => m[1] + " " + m[2])
				.sort()
		}
		for (
			const [ label, name ] of /** @type {[string, string][]} */([
				[ "Properties", "shorthand_for_properties" ],
				[ "Values", "shorthand_for_values" ],
				[ "Media conditions", "shorthand_for_media_condition" ]
			])/**/
		) {
			it(
				label + " list equals the Map in the source",
				() => {
					assert.deepEqual(list_of(label), map_of(name))
				}
			)
		}
		it(
			"min.js stays under the size bounds the README states",
			() => {
				const [ , raw, gzip ] = readme.match(/Under (\d+) KB, under (\d+) KB gzip\./) ?? []
				assert.ok(
					raw && gzip,
					"the README opening has no size-bound sentence"
				)
				const built = readFileSync(targets["docs/min.js"])
				assert.ok(
					built.length < Number(raw) * 1024,
					"min.js is larger than the README bound"
				)
				assert.ok(
					gzipSync(built).length < Number(gzip) * 1024,
					"the gzip size is larger than the README bound"
				)
			}
		)
		it(
			"the CSS Reset block equals reset_style in the source",
			() => {
				const block = (readme.split("## CSS Reset")[1] ?? "").split("```css\n")[1]?.split("\n```")[0] ?? ""
				assert.equal(block.replace(/\n/g, ""), load().reset)
			}
		)
		it(
			"the README carries no hand-counted test total",
			() => {
				assert.doesNotMatch(readme, /\d+ tests/)
			}
		)
	}
)
describe(
	"VSCode extension minimum version",
	() => {
		/**
		 * @type {{
		 *   devDependencies: { "@types/vscode": string },
		 *   engines: { vscode: string },
		 *   main: string,
		 *   scripts: { latest: string },
		 *   type: string
		 * }}
		 */
		const manifest = JSON.parse(
			readFileSync(
				new URL("../extension/package.json", import.meta.url),
				"utf8"
			)
		)
		const pinned = manifest.devDependencies["@types/vscode"]
		/**
		 * @param {string} version
		 * @returns {string}
		 */
		function major_minor(version) {
			return version.split(".", 2).join(".")
		}
		it(
			"engines.vscode matches the pinned types version",
			() => {
				assert.equal(manifest.engines.vscode, "^" + pinned)
			}
		)
		it(
			"pins @types/vscode without a range",
			() => {
				assert.match(pinned, /^\d+\.\d+\.\d+$/)
			}
		)
		it(
			"the README states the same minimum version",
			() => {
				const readme = readFileSync(
					new URL("../extension/README.md", import.meta.url),
					"utf8"
				)
				const version = readme.match(/VS Code (\d+\.\d+(?:\.\d+)?) or newer/)?.[1]
				assert.ok(
					version,
					"the README does not state the minimum version"
				)
				assert.equal(major_minor(version), major_minor(pinned))
			}
		)
		it(
			"the entry point is an ES module and requires 1.100 or newer, which loads it",
			() => {
				assert.equal(manifest.type, "module")
				assert.match(manifest.main, /^out\/[\w-]+\.js$/)
				const [ major, minor ] = pinned.split(".").map(Number)
				assert.ok(
					/** @type {number} */(major)/**/ > 1 || /** @type {number} */(minor)/**/ >= 100,
					"VSCode loads ES module extensions from 1.100"
				)
			}
		)
		it(
			"the latest script restores the same version",
			() => {
				assert.ok(
					manifest.scripts.latest.includes("@types/vscode@" + pinned),
					"the types that pnpm up --latest bumps are not restored"
				)
			}
		)
	}
)
describe(
	"build output",
	() => {
		for (const [ name, url ] of Object.entries(targets)) {
			describe(
				name,
				() => {
					/** @type {string} */
					let minified
					it(
						"exists and is not empty",
						() => {
							minified = readFileSync(url, "utf8")
							assert.ok(
								minified.length > 1000,
								"the build did not run or was truncated"
							)
						}
					)
					it(
						"the class-change path matches the source",
						() => {
							assert.equal(
								load(minified).via_class_change(...corpus),
								expected_class_change
							)
						}
					)
					it(
						"the insertion path matches the source",
						() => {
							assert.equal(
								load(minified).via_insertion(...corpus),
								expected_insertion
							)
						}
					)
					it(
						"the reset matches the source",
						() => {
							assert.equal(load(minified).reset, expected_reset)
						}
					)
				}
			)
		}
		it(
			"stamps the version from package.json",
			() => {
				/** @type {{ version: string }} */
				const { version } = JSON.parse(
					readFileSync(new URL("../package.json", import.meta.url), "utf8")
				)
				for (const url of Object.values(targets)) {
					assert.match(
						readFileSync(url, "utf8"),
						new RegExp("\"v" + version + "\"")
					)
				}
			}
		)
		it(
			"the extension version equals the root version",
			() => {
				/** @type {{ version: string }} */
				const root = JSON.parse(
					readFileSync(new URL("../package.json", import.meta.url), "utf8")
				)
				/** @type {{ version: string }} */
				const extension = JSON.parse(
					readFileSync(
						new URL("../extension/package.json", import.meta.url),
						"utf8"
					)
				)
				assert.equal(extension.version, root.version)
			}
		)
	}
)