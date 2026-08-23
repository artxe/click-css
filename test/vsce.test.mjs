import assert from "node:assert/strict"
import { readFileSync } from "node:fs"
import { registerHooks } from "node:module"
import { describe, it } from "node:test"
const vsce_root = new URL("../extension/", import.meta.url)
const src_root = new URL("./src/", vsce_root)
/** @type {Record<string, { default: [ string, string ][] }>} */
const configuration = {}
/** @type {{ contributes: { configuration: { properties: typeof configuration }[] } }} */
const manifest = JSON.parse(
	readFileSync(new URL("./package.json", vsce_root), "utf8")
)
for (const section of manifest.contributes.configuration) {
	Object.assign(configuration, section.properties)
}
/** @typedef {ReturnType<typeof import("../extension/src/helper/parse_dom.js").default>[number]} AstNode */
/** @typedef {ReturnType<typeof text_document>} TextDocument */
/** @typedef {{ hoverMessage: MarkdownString, range: Range }} Decoration */
/** @typedef {{ dispose: () => void }} Disposable */
/**
 * @typedef {{
 *   provideCompletionItems: (
 *     document: TextDocument,
 *     position: { offset: number }
 *   ) => CompletionItem[] | undefined
 * }} Provider
 */
/**
 * @type {{
 *   document: TextDocument,
 *   setDecorations: (
 *     decorator: { index: number },
 *     ranges: (Decoration | Range)[]
 *   ) => void
 * } | undefined}
 */
let active_editor
/** @type {Provider[]} */
let providers = []
/** @type {{ index: number }[]} */
let decorators = []
class Range {
	/**
	 * @param {{ offset: number }} start
	 * @param {{ offset: number }} end
	 */
	constructor(start, end) {
		this.start = start
		this.end = end
	}
}
class MarkdownString {
	value = ""
	supportHtml = false
	/** @param {string} value */
	appendMarkdown(value) {
		this.value += value
	}
}
class CompletionItem {
	/** @type {string | undefined} */
	insertText
	/** @param {string} label */
	constructor(label) {
		this.label = label
	}
}
const vscode = {
	CompletionItem,
	CompletionItemKind: { Constructor: 3, EnumMember: 19, Value: 11 },
	MarkdownString,
	Range,
	languages: {
		/**
		 * @param {string[]} _
		 * @param {Provider} provider
		 * @returns {Disposable}
		 */
		registerCompletionItemProvider: (_, provider) => {
			providers.push(provider)
			return { dispose() {} }
		}
	},
	window: {
		get activeTextEditor() {
			return active_editor
		},
		createTextEditorDecorationType: () => {
			let decorator = { index: decorators.length }
			decorators.push(decorator)
			return decorator
		},
		onDidChangeActiveTextEditor: () => ({ dispose() {} })
	},
	workspace: {
		getConfiguration: () => ({
			/** @param {string} key */
			get: key =>
				/** @type {{ default: [ string, string ][] }} */(configuration[key])/**/
					.default
		}),
		onDidChangeTextDocument: () => ({ dispose() {} })
	}
}
Object.assign(globalThis, { __vscode_mock: vscode })
const vscode_source = Object.keys(vscode)
	.map(
		key => `export const ${key} = globalThis.__vscode_mock[${JSON.stringify(key)}]`
	)
	.join("\n")
registerHooks(
	{
		load(url, context, next) {
			return url == "vscode:mock"
				? {
					format: "module",
					shortCircuit: true,
					source: vscode_source
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
/** @type {typeof import("../extension/src/helper/parse_dom.js")} */
const { default: parse_dom } = await import(
	new URL("./helper/parse_dom.js", src_root).href
)
/**
 * @param {string} file_name
 * @param {string} text
 */
function text_document(file_name, text) {
	return ({
		fileName: file_name,
		getText: () => text,
		/** @param {{ offset: number }} position */
		offsetAt: position => position.offset,
		/** @param {number} offset */
		positionAt: offset => ({ offset })
	})
}
let activate_count = 0
/** @param {string} path */
async function activate(path) {
	/** @type {{ default: (context: { subscriptions: Disposable[] }) => void }} */
	const module = await import(
		`${new URL(path, src_root).href}?${++activate_count}`
	)
	module.default({ subscriptions: [] })
}
/**
 * @param {string} file_name
 * @param {string} text
 */
async function complete(file_name, text) {
	providers = []
	await activate("./extensions/auto_completion.js")
	let document = text_document(file_name, text)
	let [ properties, media ] = providers.map(
		provider => provider.provideCompletionItems(document, { offset: text.length })
	)
	return {
		media: media?.map(item => item.insertText),
		properties: properties?.map(item => item.insertText)
	}
}
/**
 * @param {string} file_name
 * @param {string} text
 */
async function highlight(file_name, text) {
	/** @type {Map<number, (Decoration | Range)[]>} */
	let decorations = new Map()
	decorators = []
	active_editor = {
		document: text_document(file_name, text),
		/**
		 * @param {{ index: number }} decorator
		 * @param {(Decoration | Range)[]} ranges
		 */
		setDecorations: (decorator, ranges) => decorations.set(decorator.index, ranges)
	}
	await activate("./extensions/highlighter.js")
	/**
	 * @param {number} index
	 * @returns {string[]}
	 */
	function slices(index) {
		return /** @type {Range[]} */(decorations.get(index) ?? [])/**/.map(
			range => text.slice(range.start.offset, range.end.offset)
		)
	}
	let tokens = /** @type {Decoration[]} */(decorations.get(0) ?? [])/**/
	return {
		hover: tokens.map(
			item => item.hoverMessage.value
				.replace(/<\/?(?:span|br)\b[^>]*>/g, " ")
				.replace(/&nbsp;/g, " ")
				.replace(/\s+/g, " ")
		),
		media: slices(1),
		property: slices(3),
		selector: slices(2),
		tokens: tokens.map(
			item => text.slice(item.range.start.offset, item.range.end.offset)
		),
		value: slices(4)
	}
}
/**
 * @template {AstNode["type"]} T
 * @param {AstNode | boolean | undefined} node
 * @param {T} type
 * @returns {Extract<AstNode, { type: T }>}
 */
function narrow(node, type) {
	assert.equal(typeof node == "object" ? node.type : node, type)
	return /** @type {Extract<AstNode, { type: T }>} */(node)/**/
}
describe(
	"class attributes over several lines",
	() => {
		it(
			"completion works in a multi-line value",
			async () => {
				const result = await complete("a.html", "<p class=\"\n\tc=red\n\t")
				assert.ok(result.media?.includes("@md@"))
			}
		)
		it(
			"reads around interpolations in a multi-line JSX template",
			async () => {
				const result = await highlight(
					"a.jsx",
					"<p className={`\n\tc=red\n\t${x}\n\td=flex\n`}></p>\n"
				)
				assert.deepEqual(result.tokens, [ "c=red", "d=flex" ])
			}
		)
		it(
			"reads every token of a value split by newlines",
			async () => {
				const result = await highlight(
					"a.html",
					"<p class=\"\n\tc=red\n\td=flex\n\"></p>\n"
				)
				assert.deepEqual(result.tokens, [ "c=red", "d=flex" ])
			}
		)
	}
)
describe(
	"completion",
	() => {
		it(
			"a Razor file inserts media conditions as @@…@@",
			async () => {
				for (let file_name of [ "a.cshtml", "a.razor" ]) {
					let result = await complete(file_name, "<p class=\"d=flex ")
					assert.ok(result.media?.includes("@@md@@"))
					assert.ok(!result.media?.includes("@md@"))
				}
			}
		)
		it(
			"does not suggest in a Pug class literal",
			async () => {
				assert.deepEqual(
					await complete("a.pug", "p.bt"),
					{ media: undefined, properties: undefined }
				)
			}
		)
		it(
			"does not suggest in attributes other than class or in a closed value",
			async () => {
				assert.deepEqual(
					await complete("a.html", "<p id=\""),
					{ media: undefined, properties: undefined }
				)
				assert.deepEqual(
					await complete("a.html", "<p class=\"a\""),
					{ media: undefined, properties: undefined }
				)
			}
		)
		it(
			"suggests in Pug attribute values and Vue pug templates",
			async () => {
				assert.ok(
					(await complete("a.pug", "ul\n  li(class=\"")).media?.includes("@md@")
				)
				assert.ok(
					(await complete("a.vue", "<template lang=\"pug\">\n  p(class=\"")).media?.includes("@md@")
				)
			}
		)
		it(
			"suggests shorthands and @…@ media conditions inside a class value",
			async () => {
				let result = await complete("a.html", "<p class=\"")
				assert.ok(result.properties?.length)
				assert.ok(result.media?.includes("@md@"))
			}
		)
	}
)
describe(
	"extension file routing",
	() => {
		it(
			"a file with no extension is not parsed",
			() => {
				assert.deepEqual(parse_dom("Makefile", "<p class=\"a\"></p>"), [])
			}
		)
		it(
			"a vue <template lang=\"pug\"> is read as Pug",
			() => {
				let template = narrow(
					parse_dom(
						"a.vue",
						"<template lang=\"pug\">\n  p.a\n</template>"
					)[0],
					"Element"
				)
				let element = narrow(template.children[0], "Element")
				assert.equal(element.name, "p")
				assert.equal(element.attributes[0]?.name, "class")
			}
		)
		it(
			"cshtml is read as a Razor view, leaving @ in attributes as C# code",
			() => {
				let [ attribute ] = narrow(
					parse_dom("a.cshtml", "<p @attrs class=\"a\"></p>")[0],
					"Element"
				).attributes
				assert.equal(attribute?.name, "")
				assert.equal(narrow(attribute?.value, "Script").subType, "razor")
			}
		)
		it(
			"pug and jade are read as Pug",
			() => {
				for (let file_name of [ "a.pug", "a.jade" ]) {
					let element = narrow(
						parse_dom(file_name, "p.a(title=\"b\")")[0],
						"Element"
					)
					assert.equal(element.name, "p")
					assert.deepEqual(
						element.attributes.map(attribute => attribute.name),
						[ "class", "title" ]
					)
				}
			}
		)
		it(
			"razor is read as a Razor component, with @onclick as an attribute name and a quoted C# expression as one value",
			() => {
				let element = narrow(
					parse_dom(
						"a.razor",
						"<p @onclick=\"Go\" class=\"@(on ? \"a\" : \"b\")\"></p>"
					)[0],
					"Element"
				)
				assert.deepEqual(
					element.attributes.map(attribute => attribute.name),
					[ "@onclick", "class" ]
				)
				assert.equal(
					narrow(
						narrow(element.attributes[1]?.value, "String").scripts[0],
						"Script"
					).subType,
					"razor"
				)
			}
		)
		it(
			"ts reads <T> as a type assertion and tsx as a tag",
			() => {
				assert.deepEqual(parse_dom("a.ts", "let a = <T>b"), [])
				assert.equal(
					narrow(parse_dom("a.tsx", "let a = <T>b</T>")[0], "Element").name,
					"T"
				)
			}
		)
	}
)
describe(
	"highlight",
	() => {
		it(
			"@@@@ in a Razor file reads as @@",
			async () => {
				let result = await highlight(
					"a.razor",
					"<p class=\"@@@@supports_display=grid@@d=grid\"></p>"
				)
				assert.deepEqual(result.media, [ "@@@@supports_display=grid@@" ])
				assert.match(
					String(result.hover[0]),
					/@supports \(display:grid\)/
				)
			}
		)
		it(
			"a Razor file reads @@ as @ and underlines at the source position",
			async () => {
				for (let file_name of [ "a.cshtml", "a.razor" ]) {
					let result = await highlight(file_name, "<p class=\"c=red @@md@@d=flex\"></p>")
					assert.deepEqual(result.tokens, [ "c=red", "@@md@@d=flex" ])
					assert.deepEqual(result.media, [ "@@md@@" ])
					assert.deepEqual(result.property, [ "c=", "d=" ])
					assert.deepEqual(result.value, [ "red", "flex" ])
					assert.match(
						String(result.hover[1]),
						/@media \(min-width:768px\) \{ & \{ display : flex \} \}/
					)
				}
			}
		)
		it(
			"a non-Razor file reads @@ as is",
			async () => {
				let result = await highlight(
					"a.html",
					"<p class=\"@@supports_display=grid@d=grid\"></p>"
				)
				assert.deepEqual(result.media, [ "@@supports_display=grid@" ])
				assert.match(
					String(result.hover[0]),
					/@supports \(display:grid\)/
				)
			}
		)
		it(
			"highlights Pug attribute values",
			async () => {
				let result = await highlight("a.pug", "ul\n  li(class=\"c=red @md@d=flex\") x")
				assert.deepEqual(result.tokens, [ "c=red", "@md@d=flex" ])
				assert.deepEqual(result.media, [ "@md@" ])
				assert.deepEqual(result.property, [ "c=", "d=" ])
				assert.deepEqual(result.value, [ "red", "flex" ])
			}
		)
		it(
			"inside a Razor C# string the output is literal, so nothing is unescaped",
			async () => {
				let result = await highlight(
					"a.cshtml",
					"<p class=\"@(on ? \"@@supports_display=grid@d=grid\" : \"\")\"></p>"
				)
				assert.deepEqual(result.media, [ "@@supports_display=grid@" ])
				assert.match(
					String(result.hover[0]),
					/@supports \(display:grid\)/
				)
			}
		)
		it(
			"underlines media query, property and value, and shows CSS on hover",
			async () => {
				let result = await highlight("a.html", "<p class=\"@md@d=flex\"></p>")
				assert.deepEqual(result.tokens, [ "@md@d=flex" ])
				assert.deepEqual(result.media, [ "@md@" ])
				assert.deepEqual(result.property, [ "d=" ])
				assert.deepEqual(result.value, [ "flex" ])
				assert.match(
					String(result.hover[0]),
					/@media \(min-width:768px\) \{ & \{ display : flex \} \}/
				)
			}
		)
	}
)
describe(
	"markdown",
	() => {
		it(
			"a code span in prose does not open a tag",
			async () => {
				const result = await highlight(
					"a.md",
					"Load it in `<head>` as a classic `<script>`.\n\n"
					+ "```html\n<p class=\"c=red\"></p>\n```\n"
				)
				assert.deepEqual(result.tokens, [ "c=red" ])
			}
		)
		it(
			"a non-markup fence is not read",
			async () => {
				const result = await highlight(
					"a.md",
					"```js\nconst html = `<p class=\"c=red\"></p>`\n```\n"
				)
				assert.deepEqual(result.tokens, [])
			}
		)
		it(
			"an unclosed comment does not swallow later fences",
			async () => {
				const result = await highlight(
					"a.md",
					"```html\n<p class=\"c=red\"></p><!-- open comment\n```\n\n"
					+ "```html\n<p class=\"d=flex\"></p>\n```\n"
				)
				assert.deepEqual(result.tokens, [ "c=red", "d=flex" ])
			}
		)
		it(
			"an unclosed quote does not swallow later fences",
			async () => {
				const result = await highlight(
					"a.md",
					"```html\n<input class=\"c=red\" value=\"open quote>\n```\n\n"
					+ "```html\n<p class=\"d=flex\"></p>\n```\n"
				)
				assert.deepEqual(result.tokens, [ "c=red", "d=flex" ])
			}
		)
		it(
			"an unclosed style does not swallow later fences",
			async () => {
				const result = await highlight(
					"a.md",
					"```html\n<div class=\"c=red\">\n  <style>\n</div>\n```\n\n"
					+ "```html\n<p class=\"d=flex\"></p>\n```\n"
				)
				assert.deepEqual(result.tokens, [ "c=red", "d=flex" ])
			}
		)
		it(
			"reads every html fence",
			async () => {
				const result = await highlight(
					"a.md",
					"```html\n<p class=\"c=red\"></p>\n```\n\n"
					+ "```css\n.x { color: red }\n```\n\n"
					+ "```html\n<p class=\"d=flex\"></p>\n```\n"
				)
				assert.deepEqual(result.tokens, [ "c=red", "d=flex" ])
			}
		)
		it(
			"reads up to the last html block of the README",
			async () => {
				const result = await highlight(
					"README.md",
					readFileSync(new URL("../README.md", import.meta.url), "utf8")
				)
				for (const cname of [
					"padding=24px",
					"@max-width=200px&min-width=100px@width=100px",
					"@prefers-color-scheme=dark@color=white",
					"tab-size=~4"
				]) {
					assert.ok(
						result.tokens.includes(cname),
						cname + " was not read"
					)
				}
			}
		)
		it(
			"real HTML outside fences is read",
			async () => {
				const result = await highlight("a.md", "<p class=\"c=red\"></p>\n")
				assert.deepEqual(result.tokens, [ "c=red" ])
			}
		)
		it(
			"suggests in prose after a fence and in later fences",
			async () => {
				const fence = "```html\n<p class=\"c=red\"></p>\n```\n\n"
				assert.ok(
					(await complete("a.md", fence + "<p class=\"")).media?.includes("@md@")
				)
				assert.ok(
					(await complete("a.md", fence + "```html\n<p class=\"")).media?.includes("@md@")
				)
			}
		)
	}
)