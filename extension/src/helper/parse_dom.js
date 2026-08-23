import {
	parseHtml,
	parseJsx,
	parsePug,
	parseRazor,
	parseRazorComponent,
	parseScript
} from "dom-eater"
const blank_regex = /[^\n\r]/g
const code_span_regex = /`[^`\n]*`/g
const fence_regex = /^[ \t]{0,3}(`{3,}|~{3,})[ \t]*([^\s`]*)/
const line_regex = /[^\n]*\n?/g
const markdown_extensions = new Set([ "markdown", "md" ])
const markup_languages = new Set(
	[
		"astro",
		"htm",
		"html",
		"svelte",
		"vue",
		"xml"
	]
)
const jsx_extensions = new Set(
	[
		"astro",
		"cjs",
		"js",
		"jsx",
		"mjs",
		"tsx"
	]
)
const pug_extensions = new Set([ "jade", "pug" ])
const script_extensions = new Set([ "cts", "mts", "ts" ])
/**
 * @param {string} line
 * @returns {string}
 */
function blank(line) {
	return line.replace(blank_regex, " ")
}
/**
 * @param {string} text
 * @returns {string[]}
 */
function mask_markdown(text) {
	/** @type {[ number, number ][]} */
	let fences = []
	let prose = ""
	let prose_end = 0
	let fence = ""
	let start = 0
	let index = 0
	for (let [ line ] of text.matchAll(line_regex)) {
		if (!line) break
		if (fence) {
			if (line.trimStart().startsWith(fence)) {
				if (start) fences.push([ start, index ])
				fence = ""
				start = 0
			}
			prose += blank(line)
		} else {
			let match = fence_regex.exec(line)
			if (match) {
				fence = /** @type {string} */(match[1])/**/
				start = markup_languages.has(
					/** @type {string} */(match[2])/**/.toLowerCase()
				)
					? index + line.length
					: 0
				prose += blank(line)
			} else {
				prose += line.replace(code_span_regex, blank)
				prose_end = index + line.length
			}
		}
		index += line.length
	}
	if (fence && start) fences.push([ start, index ])
	return [
		{ end: prose_end, source: prose },
		...fences.map(
			([ from, to ]) => (
				{
					end: to,
					source: blank(text.slice(0, from))
						+ text.slice(from, to)
						+ blank(text.slice(to))
				}
			)
		)
	]
		.sort((a, b) => a.end - b.end)
		.map(masked => masked.source)
}
/**
 * @param {string} file_name
 * @param {string} text
 * @returns {import("dom-eater").AstNode[]}
 */
export default (file_name, text) => {
	const index = file_name.lastIndexOf(".")
	if (index < 0) return []
	const extension = file_name.slice(index + 1).toLowerCase()
	if (extension == "cshtml") return parseRazor(text).ast
	if (extension == "razor") return parseRazorComponent(text).ast
	if (jsx_extensions.has(extension)) return parseJsx(text).ast
	if (markdown_extensions.has(extension)) {
		return mask_markdown(text).flatMap(
			masked => parseHtml(masked).ast
		)
	}
	if (pug_extensions.has(extension)) return parsePug(text).ast
	if (script_extensions.has(extension)) return parseScript(text).ast
	return parseHtml(text).ast
}