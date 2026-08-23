import { load, serialize_attribute } from "./dom.mjs"
import assert from "node:assert/strict"
import { describe, it } from "node:test"
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
		it(
			"is split into tokens once",
			() => {
				const app = load()
				const original = String.prototype.match
				let splits = 0
				String.prototype.match = function(/** @type {any} */ pattern) {
					if (pattern instanceof RegExp && pattern.source == String.raw`[^\t\n\f\r ]+`) splits++
					return original.call(this, pattern)
				}
				try {
					app.via_insertion_html(
						"<div class=\"w=1 h=2\"><p class=\"w=1 h=2\"></p><p class=\"w=1 h=2\"></p></div>"
					)
					app.via_insertion_html("<div class=\"w=1 h=2\"></div>")
				} finally {
					String.prototype.match = original
				}
				assert.equal(splits, 1)
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
		it(
			"the same with many classes at once",
			() => {
				const all = [ ...entity_bearing, ...plain ]
				assert.equal(
					load().via_class_change(...all),
					load().via_insertion(...all)
				)
			}
		)
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
		it(
			"these inputs really are escaped",
			() => {
				for (const cname of entity_bearing) {
					assert.notEqual(
						serialize_attribute(cname),
						cname,
						cname + " must change when serialized for this test to mean anything"
					)
				}
			}
		)
	}
)