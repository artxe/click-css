import {
	default_unit,
	shorthand_for_media_condition,
	shorthand_for_properties,
	shorthand_for_values
} from "./get_config.js"
const RE = RegExp
const declaration_gap = "; "
const replace_default_unit_inner_regex = /(?:^|[ ,])-?(?:\d*\.)?\d+(?=[ ,!]|$)/g
const replace_default_unit_regex = /((?:^|;|-)(?:basis|block|border|bottom|gap|grid-(?:auto|template)-(?:columns|rows)|(?<!line-)height|indent|inline|inset(?:-[a-z]+)*|left|(?:margin|padding)(?:-[a-z]+)*|offset|origin|outline|perspective|position|radius|right|shadow|size|spacing|top|translate|(?<!stroke-)width):)(.+?)(?=;|$)/g
const check_has_value_regex = RE(
	".[:=].|"
	+ [ ...shorthand_for_values.keys() ].join("|")
)
const replace_and_regex = /&/g
const escape_less_than_regex = /</g
const replace_colon_regex = /\\?=/g
const replace_condition_regex = /[^ ,]+(?<![<>=])=[^ ,]+/g
const replace_media_condition_regex = RE(
	"(^|[ ,])("
	+ [
		...shorthand_for_media_condition.keys()
	].join("|")
	+ ")(?=[ ,]|$)",
	"g"
)
const replace_shorthand_regex = RE(
	"(^|;)(?:("
	+ [
		...shorthand_for_properties.keys()
	].join("|")
	+ ")(?=:)|("
	+ [ ...shorthand_for_values.keys() ].join("|")
	+ ")(?=;|!|$))",
	"g"
)
const replace_escape_regex = /\\=/g
const replace_space_regex = /\\?_/g
const replace_var_regex = /[: ,]~?--[^ ;,)]+|(?<=:)~|(?<=[ ,])~(?=[-.\d])/g
/**
 * @param {string} cname
 * @returns {boolean}
 */
function check_is_declaration(cname) {
	const c = /** @type {string} */(cname[0])/**/
	return c == "-" || c >= "a" && c <= "z"
}
/**
 * @param {string} cname
 * @returns {string | number | boolean}
 */
function check_is_open(cname) {
	let quote = ""
	let depth = 0
	for (let i = 0; i < cname.length; i++) {
		const c = cname[i]
		if (c == "\\") i++
		else if (quote) quote = c == quote ? "" : quote
		else if (c == "'" || c == "\"") quote = c
		else if (c == "(" || c == "[" || c == "{") depth++
		else if ((c == ")" || c == "]" || c == "}") && depth-- < 1) return true
	}
	return quote || depth || cname[cname.length - 1] == "\\"
}
/**
 * @param {string} css
 * @returns {string[]}
 */
function colorize(css) {
	/** @type {string[]} */
	const out = []
	let quote = ""
	let depth = 0
	let start = 0
	let colon = -1
	for (let i = 0; i <= css.length; i++) {
		const c = css[i]
		if (i == css.length || c == ";" && !depth && !quote) {
			out.push(
				colorize_declaration(
					css.slice(start, i),
					colon - start
				)
			)
			start = i + 1
			colon = -1
		} else if (c == "\\") i++
		else if (quote) quote = c == quote ? "" : quote
		else if (c == "'" || c == "\"") quote = c
		else if (c == "(" || c == "[") depth++
		else if (c == ")" || c == "]") depth--
		else if (c == ":" && !depth && colon < 0) colon = i
	}
	return out
}
/**
 * @param {string} decl
 * @param {number} i
 * @returns {string}
 */
function colorize_declaration(decl, i) {
	return i < 0
		? decl.replace(escape_less_than_regex, "&lt;")
		: `<span style="color:#9cdcfe;">${decl.slice(0, i)}</span>: `
			+ `<span style="color:#ce9178;">${
				decl.slice(i + 1).replace(escape_less_than_regex, "&lt;")
			}</span>`
}
/**
 * @param {string} cname
 * @returns {string}
 */
function compile_declaration(cname) {
	return "{ " + parse_value(cname).join(declaration_gap) + " }"
}
/**
 * @param {string} cname
 * @returns {string}
 */
function compile_media(cname) {
	const i = cname.indexOf("@", 2)
	if (i < 0 || i == cname.length - 1) return ""
	const query = cname.slice(1, i)
	const name = cname.slice(i + 1)
	return parse_query(query) + "&nbsp;&nbsp;&nbsp;&nbsp;"
		+ get_priority(name)
		+ (check_is_declaration(name)
			? "<span style=\"color:#d7ba7d;\">&</span> " + compile_declaration(name)
			: compile_selector(name))
		+ "<br>}"
}
/**
 * @param {string} cname
 * @returns {string}
 */
function compile_selector(cname) {
	const i = get_selector_end(cname)
	const selector = i < 0
		? ""
		: cname.slice(0, i).replace(
			replace_space_regex,
			replace_space_handler
		)
			.replace(replace_escape_regex, "=")
			.replace(escape_less_than_regex, "&lt;")
	return `<span style="color:#d7ba7d;">&${selector}</span> { ${
		parse_value(cname.slice(i + 1)).join(declaration_gap)
	} }`
}
/**
 * @param {string} cname
 * @returns {string}
 */
function get_priority(cname) {
	let index = cname.length - 1
	if (cname[index] != "!") return ""
	let prefix = "[class]"
	while (cname[--index] == "!") prefix += "[class]"
	return prefix ? `<span style="color:#d7ba7d;">${prefix}</span> ` : ""
}
/**
 * @param {string} cname
 * @returns {number}
 */
function get_selector_end(cname) {
	let quote = ""
	let depth = 0
	for (let i = 0; i < cname.length; i++) {
		const c = cname[i]
		if (c == "\\") i++
		else if (quote) quote = c == quote ? "" : quote
		else if (c == "'" || c == "\"") quote = c
		else if (c == "(" || c == "[") depth++
		else if (c == ")" || c == "]") depth--
		else if (c == "/" && !depth) return i
	}
	return -1
}
/**
 * @param {string} substr
 * @returns {string}
 */
function parse_condition(substr) {
	const i = substr.indexOf("=")
	return "(" + substr.slice(0, i) + ":" + substr.slice(i + 1) + ")"
}
/**
 * @param {string} query
 * @returns {string}
 */
function parse_query(query) {
	const char = query[0]
	query = char == "@"
		? query.slice(1)
		: "media " + query
	return `<span style="color:#b67bb1;">@${
		query.replace(replace_space_regex, replace_space_handler)
			.replace(replace_and_regex, " and ")
			.replace(replace_condition_regex, parse_condition)
			.replace(replace_media_condition_regex, replace_media_condition_handler)
			.replace(escape_less_than_regex, "&lt;")
	}</span> {<br>`
}
/**
 * @param {string} cname
 * @returns {string[]}
 */
function parse_value(cname) {
	let i = cname.length
	if (cname[--i] == "!") {
		while (cname[--i] == "!");
		cname = cname.slice(0, i + 1)
	}
	return colorize(
		replace_outside_parens(
			cname.replace(
				replace_space_regex,
				replace_space_handler
			)
				.replace(
					replace_colon_regex,
					replace_colon_handler
				)
				.replace(
					replace_shorthand_regex,
					replace_shorthand_handler
				)
				.replace(
					replace_default_unit_regex,
					replace_default_unit_handler
				),
			replace_var_regex,
			replace_var_handler
		)
	)
}
/**
 * @param {string} substr
 * @returns {string}
 */
function replace_colon_handler(substr) {
	return substr.length > 1 ? "=" : ":"
}
/**
 * @param {string} _
 * @param {string} prefix
 * @param {string} substr
 * @returns {string}
 */
function replace_default_unit_handler(_, prefix, substr) {
	return prefix + (substr[0] == "~"
		? substr.slice(1)
		: replace_outside_parens(
			substr,
			replace_default_unit_inner_regex,
			replace_default_unit_inner_handler
		))
}
/**
 * @param {string} substr
 * @returns {string}
 */
function replace_default_unit_inner_handler(substr) {
	return substr + default_unit
}
/**
 * @param {string} _
 * @param {string} prefix
 * @param {string} substr
 * @returns {string}
 */
function replace_media_condition_handler(_, prefix, substr) {
	return prefix + shorthand_for_media_condition.get(substr)
}
/**
 * @param {string} value
 * @param {RegExp} regex
 * @param {(substr: string) => string} handler
 * @returns {string}
 */
function replace_outside_parens(value, regex, handler) {
	let out = ""
	let start = 0
	let depth = 0
	for (let i = 0; i < value.length; i++) {
		const c = value[i]
		if (c == "(") {
			if (!depth++) {
				out += value.slice(start, i).replace(regex, handler)
				start = i
			}
		} else if (c == ")" && depth && !--depth) {
			out += value.slice(start, i + 1)
			start = i + 1
		}
	}
	const tail = value.slice(start)
	return out + (depth ? tail : tail.replace(regex, handler))
}
/**
 * @param {string} _
 * @param {string} prefix
 * @param {string} property
 * @param {string} value
 * @returns {string}
 */
function replace_shorthand_handler(_, prefix, property, value) {
	return prefix + (property
		? shorthand_for_properties.get(property)
		: shorthand_for_values.get(value))
}
/**
 * @param {string} substr
 * @returns {string}
 */
function replace_space_handler(substr) {
	return substr.length > 1 ? "_" : " "
}
/**
 * @param {string} substr
 * @returns {string}
 */
function replace_var_handler(substr) {
	return substr[0] == "~"
		? ""
		: substr[0] + "var(" + substr.slice(substr[1] == "~" ? 2 : 1) + ")"
}
/**
 * @param {string} cname
 * @returns {string}
 */
export default cname => check_has_value_regex.test(cname) && !check_is_open(cname)
	? check_is_declaration(cname)
		? get_priority(cname) + compile_declaration(cname)
		: cname[0] == "@"
			? compile_media(cname)
			: get_priority(cname) + compile_selector(cname)
	: ""
export { get_selector_end }