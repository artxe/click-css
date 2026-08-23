import { readFileSync } from "node:fs"
/**
 * @param {string} css
 * @returns {string}
 */
export function declarations(css) {
	let out = css
	for (let depth = css[0] == "@" ? 2 : 1; depth--;) {
		const i = find_brace(out)
		if (i < 0) return ""
		out = out.slice(i + 1, out.lastIndexOf("}"))
	}
	return out
}
/**
 * @param {string} text
 * @returns {string}
 */
function decode_entities(text) {
	return text
		.replace(/&lt;/g, "<")
		.replace(/&gt;/g, ">")
		.replace(/&quot;/g, "\"")
		.replace(/&nbsp;/g, "\xa0")
		.replace(/&amp;/g, "&")
}
/**
 * @param {string | null} class_attribute
 * @param {ElementStub[]} [descendants]
 * @returns {ElementStub}
 */
function element(class_attribute, descendants = []) {
	return (
		{
			contains: () => false,
			getAttribute: name => name == "class" ? class_attribute : null,
			nodeType: 1,
			querySelectorAll: () => descendants.filter(e => e.getAttribute("class") !== null)
		}
	)
}
/**
 * @param {string} value
 * @returns {string}
 */
export function escape(value) {
	const s = String(value)
	let out = ""
	for (let i = 0; i < s.length; i++) {
		const c = s.charCodeAt(i)
		if (c === 0) {
			out += "�"
		} else if (
			(c >= 0x1 && c <= 0x1f) || c === 0x7f
			|| (i === 0 && c >= 0x30 && c <= 0x39)
			|| (i === 1 && c >= 0x30 && c <= 0x39 && s.charCodeAt(0) === 0x2d)
		) {
			out += "\\" + c.toString(16) + " "
		} else if (i === 0 && c === 0x2d && s.length === 1) {
			out += "\\" + s[i]
		} else if (
			c >= 0x80 || c === 0x2d || c === 0x5f
			|| (c >= 0x30 && c <= 0x39) || (c >= 0x41 && c <= 0x5a) || (c >= 0x61 && c <= 0x7a)
		) {
			out += s[i]
		} else {
			out += "\\" + s[i]
		}
	}
	return out
}
/**
 * @param {string} css
 * @returns {number}
 */
function find_brace(css) {
	for (let i = 0; i < css.length; i++) {
		if (css[i] == "\\") i++
		else if (css[i] == "{") return i
	}
	return -1
}
/**
 * @param {string} html
 * @returns {ElementStub}
 */
export function parse_html(html) {
	const tags = [ ...html.matchAll(/<[a-zA-Z][^\s/>]*([^>]*)>/g) ].map(
		m => {
			const value = (m[1] ?? "").match(/(?:^|\s)class="([^"]*)"/)?.[1]
			return element(
				value === undefined ? null : decode_entities(value)
			)
		}
	)
	const [ root = element(null), ...descendants ] = tags
	return element(root.getAttribute("class"), descendants)
}
/**
 * @param {string} css
 * @returns {string}
 */
export function prelude(css) {
	return css[0] == "@" ? css.slice(0, find_brace(css)).trim() : ""
}
/**
 * @param {string} text
 * @returns {string}
 */
export function serialize_attribute(text) {
	return text
		.replace(/&/g, "&amp;")
		.replace(/ /g, "&nbsp;")
		.replace(/</g, "&lt;")
		.replace(/>/g, "&gt;")
		.replace(/"/g, "&quot;")
}
const default_source = readFileSync(
	new URL("../src/click-css.js", import.meta.url),
	"utf8"
)
/**
 * @param {...string} names
 * @returns {string}
 */
export function compile(...names) {
	const a = load().via_class_change(...names)
	const b = load().via_insertion(...names)
	if (a !== b) {
		throw Error(
			"the collection paths diverged\n  class change: " + JSON.stringify(a)
			+ "\n  insertion: " + JSON.stringify(b)
		)
	}
	return a
}
/**
 * @param {string} [source]
 * @returns {Instance}
 */
export function load(source = default_source) {
	const style = { setAttribute() {}, textContent: "" }
	/** @type {((records: MutationRecordStub[]) => void)[]} */
	const observers = []
	let theme = /** @type {string | null} */(null)/**/
	Object.assign(
		globalThis,
		{
			CSS: { escape },
			MutationObserver: class {
				/** @param {(records: MutationRecordStub[]) => void} callback */
				constructor(callback) {
					observers.push(callback)
				}
				observe() {}
			},
			document: {
				createElement: () => style,
				documentElement: {},
				head: { append() {} }
			},
			localStorage: { getItem: () => theme }
		}
	)
	new Function(source)()
	const build = globalThis.click
	build()
	const reset = style.textContent
	function added() {
		return style.textContent.slice(reset.length)
	}
	const on_attribute = /** @type {(records: MutationRecordStub[]) => void} */(observers[0])/**/
	const on_child_list = /** @type {(records: MutationRecordStub[]) => void} */(observers[1])/**/
	return {
		rebuild: next => {
			theme = next ?? null
			build()
			return style.textContent
		},
		reset,
		via_class_change: (...names) => {
			on_attribute([ { target: element(names.join(" ")) } ])
			return added()
		},
		via_insertion: (...names) => {
			const attribute = serialize_attribute(names.join(" "))
			on_child_list(
				[
					{
						target: parse_html(`<div class="${attribute}"></div>`)
					}
				]
			)
			return added()
		},
		via_insertion_html: outer_html => {
			on_child_list([ { target: parse_html(outer_html) } ])
			return added()
		}
	}
}