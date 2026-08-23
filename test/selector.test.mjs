import { compile, declarations, prelude } from "./dom.mjs"
import assert from "node:assert/strict"
import { describe, it } from "node:test"
/** @param {Record<string, [string, string]>} cases */
function rules(cases) {
	for (const [ cname, [ selector, body ] ] of Object.entries(cases)) {
		it(
			cname + "  →  " + selector,
			() => {
				const css = compile(cname)
				const i = css.lastIndexOf(body ? "{" + body + "}" : "{")
				assert.notEqual(
					i,
					-1,
					"declaration block not found: " + JSON.stringify(css)
				)
				assert.equal(declarations(css), body)
				assert.ok(
					css.slice(0, i).endsWith(selector),
					JSON.stringify(css.slice(0, i)) + " should end with " + JSON.stringify(selector)
				)
			}
		)
	}
}
describe(
	"THEME neither DARK nor LIGHT",
	() => {
		it(
			"leaves the media query alone and follows the OS",
			async () => {
				const { load } = await import("./dom.mjs")
				const app = load()
				app.via_class_change("@dark@c=white")
				assert.match(
					app.rebuild("SYSTEM"),
					/@media \(prefers-color-scheme:dark\)/
				)
			}
		)
	}
)
describe(
	"\\= in a selector is a literal = too",
	() => {
		rules(
			{
				"[data-x\\=1]/c=red": [ "[data-x=1]", "color:red" ],
				"[href\\=/docs]/c=red": [ "[href=/docs]", "color:red" ],
				"[type=number]/c=red": [ "[type=number]", "color:red" ],
				"_[data-x\\=1]_span/c=red": [ " [data-x=1] span", "color:red" ]
			}
		)
	}
)
describe(
	"comma-separated media query lists",
	() => {
		for (
			const [ cname, at ] of Object.entries(
				{
					"@max-width=600px,print@w=100": "@media (max-width:600px),print",
					"@print,dark@c=red": "@media print,(prefers-color-scheme:dark)",
					"@sm,md@w=100": "@media (min-width:640px),(min-width:768px)",
					"@sm,print@w=100": "@media (min-width:640px),print"
				}
			)
		) {
			it(
				cname + "  →  " + at,
				() => {
					assert.equal(prelude(compile(cname)), at)
				}
			)
		}
	}
)
describe(
	"dark theme switch",
	() => {
		it(
			"THEME=DARK rewrites it to an always-true query",
			async () => {
				const { load } = await import("./dom.mjs")
				const app = load()
				app.via_class_change("@dark@c=white")
				const css = app.rebuild("DARK")
				assert.match(css, /@media \(color\)/)
				assert.doesNotMatch(css, /prefers-color-scheme/)
			}
		)
		it(
			"THEME=LIGHT rewrites it to a never-matching query",
			async () => {
				const { load } = await import("./dom.mjs")
				const app = load()
				app.via_class_change("@dark@c=white")
				assert.match(app.rebuild("LIGHT"), /@media \(\)/)
			}
		)
		it(
			"without THEME, prefers-color-scheme stays as is",
			async () => {
				const { load } = await import("./dom.mjs")
				const app = load()
				app.via_class_change("@dark@c=white")
				assert.match(
					app.rebuild(),
					/@media \(prefers-color-scheme:dark\)/
				)
			}
		)
	}
)
describe(
	"media queries",
	() => {
		/** @param {Record<string, [string, string]>} cases */
		function queries(cases) {
			for (const [ cname, [ at, body ] ] of Object.entries(cases)) {
				it(
					cname + "  →  " + at,
					() => {
						const css = compile(cname)
						assert.equal(prelude(css), at)
						assert.equal(declarations(css), body)
					}
				)
			}
		}
		queries(
			{
				"@(400px<=width<=700px)@w=100": [ "@media (400px<=width<=700px)", "width:100px" ],
				"@(width>640px)@w=100": [ "@media (width>640px)", "width:100px" ],
				"@(width>=640px)@w=100": [ "@media (width>=640px)", "width:100px" ],
				"@2xl@w=100": [ "@media (min-width:1536px)", "width:100px" ],
				"@@container_card_(min-width=400px)@d=grid": [
					"@container card ((min-width:400px))",
					"display:grid"
				],
				"@@supports_(display=grid)@d=grid": [ "@supports ((display:grid))", "display:grid" ],
				"@dark@c=red": [ "@media (prefers-color-scheme:dark)", "color:red" ],
				"@max-width=200px&min-width=100px@w=100": [
					"@media (max-width:200px) and (min-width:100px)",
					"width:100px"
				],
				"@min-width=640px@w=100": [ "@media (min-width:640px)", "width:100px" ],
				"@sm&dark@c=red": [
					"@media (min-width:640px) and (prefers-color-scheme:dark)",
					"color:red"
				],
				"@sm@w=100": [ "@media (min-width:640px)", "width:100px" ]
			}
		)
		it(
			"selectors and priority work inside media too",
			() => {
				const css = compile("@sm@:hover/c=red")
				assert.equal(prelude(css), "@media (min-width:640px)")
				assert.equal(declarations(css), "color:red")
				assert.match(css, /:hover\{color:red\}\}$/)
				assert.match(compile("@dark@w=100!"), /\{\[class\]\./)
			}
		)
	}
)
describe(
	"only a top-level / ends the selector",
	() => {
		rules(
			{
				":not(.a/b)/c=red": [ ":not(.a/b)", "color:red" ],
				"[href='/docs']/c=red": [ "[href='/docs']", "color:red" ],
				"[title=\"a/b\"]/bg=red": [ "[title=\"a/b\"]", "background:red" ]
			}
		)
		it(
			"a / in the value is left alone",
			() => {
				assert.equal(
					declarations(compile(":hover/gr=1_/_3")),
					"grid-row:1 / 3"
				)
			}
		)
	}
)
describe(
	"rule order",
	() => {
		it(
			"! on an overlapping media rule raises specificity whatever the discovery order",
			async () => {
				const { load } = await import("./dom.mjs")
				for (const names of [
					[ "@md@p=32!", "@sm@p=24" ],
					[ "@sm@p=24", "@md@p=32!" ]
				]) {
					const css = load().via_class_change(...names)
					assert.match(
						css,
						/\(min-width:768px\)\{\[class\]\.\\@md\\@p\\=32\\!\{padding:32px\}\}/
					)
					assert.match(
						css,
						/\(min-width:640px\)\{\.\\@sm\\@p\\=24\{padding:24px\}\}/
					)
				}
			}
		)
		it(
			"a build not started by click() still reads THEME",
			async () => {
				const { load } = await import("./dom.mjs")
				const app = load()
				app.rebuild("DARK")
				assert.match(
					app.via_class_change("@dark@c=white"),
					/@media \(color\)/
				)
			}
		)
		it(
			"media rules come after plain rules seen earlier",
			async () => {
				const { load } = await import("./dom.mjs")
				const css = load().via_class_change("@sm@p=24", "p=16")
				assert.ok(css.indexOf(".p\\=16") < css.indexOf("@media"))
			}
		)
	}
)
describe(
	"selectors",
	() => {
		rules(
			{
				"::after/ct=''": [ "::after", "content:''" ],
				":hover/c=red": [ ":hover", "color:red" ],
				":is(:hover,:focus)/c=red": [ ":is(:hover,:focus)", "color:red" ],
				":not(.a)/c=red": [ ":not(.a)", "color:red" ],
				":nth-child(2n+1)/c=red": [ ":nth-child(2n+1)", "color:red" ],
				">div/c=red": [ ">div", "color:red" ],
				"_[type=number]/fs=2em": [ " [type=number]", "font-size:2em" ]
			}
		)
	}
)