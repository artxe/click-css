import { compile, declarations, prelude } from "./dom.mjs"
import assert from "node:assert/strict"
import { readFileSync } from "node:fs"
import { registerHooks } from "node:module"
import { describe, it } from "node:test"
const vsce_root = new URL("../extension/", import.meta.url)
/** @type {Record<string, { default: [ string, string ][] }>} */
const configuration = {}
/** @type {{ contributes: { configuration: { properties: typeof configuration }[] } }} */
const manifest = JSON.parse(
	readFileSync(new URL("./package.json", vsce_root), "utf8")
)
for (const section of manifest.contributes.configuration) {
	Object.assign(configuration, section.properties)
}
Object.assign(
	globalThis,
	{
		__vscode_mock: {
			workspace: {
				getConfiguration: () => ({
					/** @param {string} key */
					get: key =>
						/** @type {{ default: [ string, string ][] }} */(configuration[key])/**/
							.default
				})
			}
		}
	}
)
registerHooks(
	{
		load(url, context, next) {
			return url == "vscode:mock"
				? {
					format: "module",
					shortCircuit: true,
					source: "export const workspace = globalThis.__vscode_mock.workspace"
				}
				: next(url, context)
		},
		resolve(specifier, context, next) {
			return specifier == "vscode"
				? { shortCircuit: true, url: "vscode:mock" }
				: next(specifier, context)
		}
	}
)
/** @type {typeof import("../extension/src/helper/compile_style.js")} */
const { default: compile_vsce } = await import(
	new URL("./src/helper/compile_style.js", vsce_root).href
)
/**
 * @param {string} css
 * @returns {string}
 */
function normalize(css) {
	return css.trim().replace(/([:;])\s+/g, "$1")
}
/**
 * @param {string} html
 * @returns {string}
 */
function plain(html) {
	return html
		.replace(/<\/?(?:span|br)\b[^>]*>/g, "")
		.replace(/&nbsp;/g, " ")
		.replace(/&lt;/g, "<")
}
const corpus = [
	"w=100",
	"lh=1.5",
	"c=red;bg=blue",
	"flex",
	"flex;jc=center",
	"absolute;t=0;l=0",
	"bd=1_solid_rgb(0_0_0_/_.2)",
	"bdi=1_solid_red",
	"inset-inline=10",
	"is=100",
	"bs=100",
	"w=calc(100%_-_var(--gap))",
	"h=calc(100vh_-_var(--header-height))",
	"bgi=url(/img/hero\\_bg.png?v\\=2)",
	"ct='a\\_b'",
	"--gap=10;p=--gap",
	"bd=1_solid_--line",
	"m=0_auto",
	"g=10_20",
	"br=50%_/_20",
	"gtc=repeat(auto-fill,_minmax(200,_1fr))",
	"tab-size=~4",
	"c=~#f00",
	"--page=~#f8fafc;bg=--page",
	"grid-row-end=3",
	"w=100!!",
	"p=10!important",
	":hover/c=red",
	">div/c=red",
	"_[type=number]/fs=2em",
	"[href='/docs']/c=red",
	":not(.a/b)/c=red",
	"::after/ct=''",
	":is(:hover,:focus)/c=red",
	"@sm@w=100",
	"@sm&dark@c=red",
	"@min-width=640px@w=100",
	"@(width>=640px)@w=100",
	"@(400px<=width<=700px)@w=100",
	"@@supports_(display=grid)@d=grid",
	"@sm@:hover/c=red",
	"@dark@w=100!",
	"ff=Arial,_sans-serif",
	"tr=all_.3s_cubic-bezier(.4,0,.2,1)",
	"tt=uppercase",
	"ct='('",
	"ct=\"it's\"",
	"w=calc(1",
	"[data-x=y/c=red",
	"w=calc(min(1px,2px)_+_2_+_3px)",
	"w=calc(var(--gap)_*_2_+_4px)",
	"w=calc(var(--a)_+_--b)",
	"gtc=repeat(2,_minmax(0,_1fr))_100",
	"bsd=0_2_4_#000,0_1_2_#111",
	"@sm,print@w=100",
	"@print,dark@c=red",
	"ct=a{b",
	"ct=)(",
	"@color=red",
	"@@supports_display=grid@",
	"bgi=url(/img/w=100/a.png)",
	"ct='a/b=c'",
	"f=1_1_0/none",
	"[data-x\\=1]/c=red",
	"text-indent=10",
	"flex-basis=100",
	"translate=10_20",
	"grid-auto-rows=100",
	"stroke-dashoffset=4"
]
describe(
	"extension settings defaults ↔ library",
	() => {
		const source = readFileSync(
			new URL("../src/click-css.js", import.meta.url),
			"utf8"
		)
		/**
		 * @param {string} name
		 * @returns {[string, string][]}
		 */
		function map_of(name) {
			return [
				...((source.split("let " + name + " ")[1] ?? "").split("\n\t)")[0] ?? "").matchAll(/\[ "([^"]+)", "([^"]+)" \]/g)
			].map(m => [ m[1] ?? "", m[2] ?? "" ])
		}
		for (const name of [
			"shorthand_for_properties",
			"shorthand_for_values",
			"shorthand_for_media_condition"
		]) {
			it(
				name + " is equal",
				() => {
					const defaults = configuration["click-css.custom." + name]?.default
					assert.ok(
						map_of(name).length > 0,
						"could not read the Map from the source"
					)
					assert.deepEqual(defaults, map_of(name))
				}
			)
		}
		it(
			"default_unit is equal",
			() => {
				const unit = /let default_unit = ("[^"]*")/.exec(source)?.[1]
				const copied = /export const default_unit = ("[^"]*")/.exec(
					readFileSync(
						new URL("./src/helper/get_config.js", vsce_root),
						"utf8"
					)
				)?.[1]
				assert.ok(unit, "could not read default_unit from the source")
				assert.equal(copied, unit)
			}
		)
	}
)
describe(
	"lib ↔ vsce extension",
	() => {
		it(
			"loads the real extension source",
			() => {
				assert.equal(typeof compile_vsce, "function")
				assert.ok(
					readFileSync(
						new URL("./src/helper/compile_style.js", vsce_root),
						"utf8"
					).includes("check_is_open")
				)
			}
		)
		for (const cname of corpus) {
			it(
				cname,
				() => {
					const lib = compile(cname)
					const vsce = plain(compile_vsce(cname))
					if (!lib) return assert.equal(
						vsce,
						"",
						"the extension shows a class the library dropped"
					)
					assert.equal(
						normalize(declarations(vsce)),
						normalize(declarations(lib)),
						"declarations differ"
					)
					assert.equal(
						normalize(prelude(vsce)),
						normalize(prelude(lib)),
						"at-rule preludes differ"
					)
				}
			)
		}
	}
)
describe(
	"the extension hover is HTML",
	() => {
		for (const cname of [
			"@(400px<=width<=700px)@w=100",
			"@(width<640px)@w=100",
			"ct='a<b'"
		]) {
			it(
				cname + ": < is escaped",
				() => {
					const html = compile_vsce(cname).replace(/<\/?(?:span|br)\b[^>]*>/g, "")
					assert.doesNotMatch(
						html,
						/</,
						"an unescaped < is read as a tag and breaks the preview"
					)
				}
			)
		}
	}
)