import { element, load, text_node } from "./dom.js"
import assert from "node:assert/strict"
import { describe, it } from "vitest"
const entity_bearing = [
	"@sm&dark@c=red",
	"@max-width=200px&min-width=100px@w=100",
	"@(400px<=width<=700px)@w=100",
	"@(width>=640px)@w=100",
	">div/c=red",
	">div>p/c=red",
	"ct=\"hi\"",
	"[title=\"a\"]/c=red"
]
const plain = [
	"w=100",
	"flex",
	"c=red;bg=blue",
	"bd=1_solid_rgb(0_0_0_/_.2)",
	"[href='/docs']/c=red",
	":hover/c=red",
	"--gap=10;p=--gap",
	"w=100!!"
]
describe(
	"a duplicate class compiles once",
	() => {
		it(
			"one rule however often the name is added",
			() => {
				const app = load()
				const once = app.via_class_change("w=100")
				app.via_class_change("w=100", "w=100")
				assert.equal(app.via_class_change("w=100"), once)
			}
		)
	}
)
describe(
	"a repeated class attribute string",
	() => {
		it(
			"adds no rules when it comes back",
			() => {
				const app = load()
				const once = app.via_insertion_html("<div class=\"w=1 h=2\"></div>")
				assert.equal(
					app.via_insertion_html("<div class=\"w=1 h=2\"></div>"),
					once
				)
			}
		)
		it(
			"compiles a new token mixed into it",
			() => {
				const app = load()
				app.via_insertion_html("<div class=\"w=1 h=2\"></div>")
				assert.match(
					app.via_insertion_html("<div class=\"h=2 c=red\"></div>"),
					/color:red/
				)
			}
		)
	}
)
describe(
	"both collection paths give the same result",
	() => {
		for (const cname of [ ...entity_bearing, ...plain ]) {
			it(
				cname,
				() => {
					assert.equal(
						load().via_class_change(cname),
						load().via_insertion(cname),
						"the class-change and insertion paths diverged"
					)
				}
			)
		}
	}
)
describe(
	"entities are decoded inside the token",
	() => {
		it(
			"an &nbsp; inside a class does not split the token",
			() => {
				const cname = "ct='a b'"
				assert.equal(
					load().via_insertion(cname),
					load().via_class_change(cname),
					"the class-change and insertion paths diverged"
				)
			}
		)
	}
)
describe(
	"nodes inserted in one batch",
	() => {
		const expected = load().via_class_change("flex", "c=red")
		it(
			"a node inside another node of the batch is read with it",
			() => {
				const child = element("c=red")
				const parent = element("flex", [ child ])
				assert.equal(load().insert(parent, child), expected)
			}
		)
		it(
			"a node that holds an earlier node of the batch replaces it",
			() => {
				const child = element("c=red")
				const parent = element("flex", [ child ])
				assert.equal(load().insert(child, parent), expected)
			}
		)
		it(
			"a text node adds nothing and is never read",
			() => {
				assert.equal(load().insert(text_node()), "")
			}
		)
		it(
			"the same node twice is read once",
			() => {
				const node = element("flex c=red")
				assert.equal(load().insert(node, node), expected)
			}
		)
		it(
			"unrelated nodes are each read",
			() => {
				assert.equal(
					load().insert(element("flex"), element("c=red")),
					expected
				)
			}
		)
	}
)
describe(
	"other attributes ending in class are not collected",
	() => {
		for (const attribute of [ "data-class", ":class", "v-bind:class" ]) {
			it(
				attribute,
				() => {
					assert.equal(
						load().via_insertion_html("<div " + attribute + "=\"flex\"></div>"),
						""
					)
				}
			)
		}
		it(
			"the real class is still collected",
			() => {
				assert.equal(
					load().via_insertion_html("<div data-class=\"none\" class=\"flex\"></div>"),
					load().via_class_change("flex")
				)
			}
		)
	}
)
describe(
	"serialization escapes are undone",
	() => {
		it(
			"&amp; is decoded last, so &amp;lt; does not leak into <",
			() => {
				const css = load().via_insertion("ct='&lt;'")
				assert.match(css, /\{content:'&lt;'\}$/)
			}
		)
		it(
			"a leftover &amp; breaks the media query",
			() => {
				const css = load().via_insertion("@sm&dark@c=red")
				assert.doesNotMatch(css, /amp;/)
				assert.match(
					css,
					/@media \(min-width:640px\) and \(prefers-color-scheme:dark\)/
				)
			}
		)
		it(
			"a leftover &gt; breaks the child selector",
			() => {
				const css = load().via_insertion(">div/c=red")
				assert.doesNotMatch(css, /gt;/)
				assert.match(css, />div\{color:red\}$/)
			}
		)
		it(
			"a leftover &lt; breaks range syntax",
			() => {
				const css = load().via_insertion("@(400px<=width<=700px)@w=100")
				assert.doesNotMatch(css, /lt;/)
				assert.match(css, /@media \(400px<=width<=700px\)/)
			}
		)
		it(
			"a leftover &quot; breaks a quoted value",
			() => {
				const css = load().via_insertion("ct=\"hi\"")
				assert.doesNotMatch(css, /quot;/)
				assert.match(css, /\{content:"hi"\}$/)
			}
		)
	}
)
describe(
	"the reset",
	() => {
		it(
			"is in the sheet at startup, before any class arrives",
			() => {
				assert.match(load().reset, /^\*\{margin:0;/)
			}
		)
	}
)