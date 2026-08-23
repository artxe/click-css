import compile_style, { get_selector_end } from "../helper/compile_style.js"
import parse_dom from "../helper/parse_dom.js"
import * as vscode from "vscode"
/**
 * @param {vscode.ExtensionContext} context
 * @returns {void}
 */
export default context => {
	const decorator = vscode.window.createTextEditorDecorationType
	/** @type {NodeJS.Timeout | 0} */
	let timeout
	let active_editor = vscode.window.activeTextEditor
	const razor_file_regex = /\.(?:cshtml|razor)$/i
	const token_regex = /\S+/g
	const token_decorator = decorator({})
	const media_query_decorator = decorator(
		{
			border: "solid #b67bb177",
			borderWidth: "0 0 3px 0"
		}
	)
	const selector_decorator = decorator(
		{
			border: "solid #d7ba7d77",
			borderWidth: "0 0 3px 0"
		}
	)
	const property_decorator = decorator(
		{
			border: "solid #9cdcfe77",
			borderWidth: "0 0 3px 0"
		}
	)
	const value_decorator = decorator(
		{
			border: "solid #ce917877",
			borderWidth: "0 0 3px 0"
		}
	)
	/**
	 * @param {string} text
	 * @param {import("dom-eater").String} str_node
	 * @param {{ offsets: number[] | undefined, start: number, text: string }[]} class_names
	 * @param {boolean} razor
	 * @returns {void}
	 */
	function analysis_class_name(text, str_node, class_names, razor) {
		const quote = str_node.subType == "unquoted"
			? ""
			: text.charAt(str_node.start)
		const end = quote && str_node.end - str_node.start > 1 && text[str_node.end - 1] == quote
			? str_node.end - 1
			: str_node.end
		let index = str_node.start + quote.length
		for (const script of str_node.scripts) {
			if (script.start > index) {
				push_class_name(
					class_names,
					text,
					index,
					script.start,
					razor
				)
			}
			for (const string of script.strings) {
				analysis_class_name(text, string, class_names, false)
			}
			index = script.end
		}
		if (index < end) {
			push_class_name(class_names, text, index, end, razor)
		}
	}
	/**
	 * @param {string} cname
	 * @param {number} index
	 * @returns {boolean}
	 */
	function check_is_special(cname, index) {
		const c = /** @type {string} */(cname[index])/**/
		return c != "-" && (c < "a" || c > "z")
	}
	/**
	 * @param {string} text
	 * @param {import("dom-eater").AstNode} node
	 * @param {{ offsets: number[] | undefined, start: number, text: string }[]} class_names
	 * @param {boolean} razor
	 * @returns {void}
	 */
	function dfs_ast(text, node, class_names, razor) {
		if (node.type == "Element") {
			for (const attr of node.attributes) {
				if (typeof attr.value == "boolean") continue
				if (attr.name == "class" || attr.name == "className" || attr.name == "classs") {
					if (attr.value.type == "String") {
						analysis_class_name(text, attr.value, class_names, razor)
					} else {
						for (const string of attr.value.strings) {
							analysis_class_name(text, string, class_names, false)
						}
					}
				}
				const scripts = attr.value.type == "String"
					? attr.value.scripts
					: [ attr.value ]
				for (const script of scripts) {
					dfs_ast(text, script, class_names, razor)
				}
			}
			for (const child of node.children) {
				dfs_ast(text, child, class_names, razor)
			}
		} else if (node.type == "Script") {
			for (const element of "elements" in node ? node.elements : []) {
				dfs_ast(text, element, class_names, razor)
			}
		}
	}
	/**
	 * @param {{ offsets: number[] | undefined, start: number, text: string }[]} class_names
	 * @param {string} text
	 * @param {number} start
	 * @param {number} end
	 * @param {boolean} razor
	 * @returns {void}
	 */
	function push_class_name(class_names, text, start, end, razor) {
		const source = text.slice(start, end)
		if (!razor || !source.includes("@@")) {
			class_names.push(
				{
					offsets: undefined,
					start,
					text: source
				}
			)
			return
		}
		/** @type {number[]} */
		const offsets = []
		let unescaped = ""
		for (let i = start; i < end; i++) {
			offsets.push(i)
			unescaped += text[i]
			if (text[i] == "@" && text[i + 1] == "@" && i + 1 < end) i++
		}
		offsets.push(end)
		class_names.push(
			{ offsets, start, text: unescaped }
		)
	}
	function trigger_update_decorations(throttle = false) {
		if (timeout) {
			clearTimeout(timeout)
			timeout = 0
		}
		if (throttle) {
			timeout = setTimeout(update_decorations, 250)
		} else {
			update_decorations()
		}
	}
	async function update_decorations() {
		if (!active_editor) return
		const document = active_editor.document
		const text = document.getText()
		const ast = parse_dom(document.fileName, text)
		const razor = razor_file_regex.test(document.fileName)
		/** @type {vscode.DecorationOptions[]} */
		const cname_array = []
		/** @type {vscode.Range[]} */
		const media_query_array = []
		/** @type {vscode.Range[]} */
		const selector_array = []
		/** @type {vscode.Range[]} */
		const property_array = []
		/** @type {vscode.Range[]} */
		const value_array = []
		/** @type {{ offsets: number[] | undefined, start: number, text: string }[]} */
		const class_names = []
		for (const node of ast) {
			dfs_ast(text, node, class_names, razor)
		}
		/** @type {RegExpExecArray?} */
		let match
		for (const {
			offsets,
			start: class_name_index,
			text: class_name
		} of class_names) {
			while ((match = token_regex.exec(class_name))) {
				const cname = match[0]
				const style = compile_style(cname)
				if (!style) continue
				const cname_index = match.index
				/**
				 * @param {number} offset
				 * @returns {vscode.Position}
				 */
				function position(offset) {
					return document.positionAt(
						offsets
							? /** @type {number} */(offsets[cname_index + offset])/**/
							: class_name_index + cname_index + offset
					)
				}
				const cname_start = position(0)
				const cname_end = position(cname.length)
				let parse_index = 0
				if (cname[0] == "@") {
					const index = cname.indexOf("@", 2)
					if (index >= 0) {
						const media_query_start = position(0)
						const media_query_end = position(index + 1)
						media_query_array.push(
							new vscode.Range(
								media_query_start,
								media_query_end
							)
						)
						parse_index = index + 1
					}
				}
				if (check_is_special(cname, parse_index)) {
					const offset = get_selector_end(cname.slice(parse_index))
					const index = offset < 0 ? -1 : parse_index + offset
					if (index >= 0) {
						const selector_start = position(parse_index)
						const selector_end = position(index + 1)
						selector_array.push(
							new vscode.Range(selector_start, selector_end)
						)
						parse_index = index + 1
					}
				}
				/** @type {number[]} */
				const index_array = []
				let index = cname.indexOf("=", parse_index)
				if (index >= 0) {
					do {
						if (cname[index - 1] != "\\") index_array.push(index)
						index = cname.indexOf("=", index + 1)
					} while (index >= 0)
				}
				index = cname.indexOf(";", parse_index)
				if (index >= 0) {
					do {
						index_array.push(index)
						index = cname.indexOf(";", index + 1)
					} while (index >= 0)
				}
				index_array.sort((a, b) => a - b)
				index = parse_index
				for (const i of index_array) {
					const range = new vscode.Range(position(index), position(i + 1))
					if (cname[i] == "=") {
						property_array.push(range)
					} else {
						value_array.push(range)
					}
					index = i + 1
				}
				const range = new vscode.Range(position(index), cname_end)
				value_array.push(range)
				const hover_message = new vscode.MarkdownString()
				hover_message.supportHtml = true
				hover_message.appendMarkdown(
					"**" + compile_style(cname) + "**"
				)
				cname_array.push(
					{
						hoverMessage: hover_message,
						range: new vscode.Range(cname_start, cname_end)
					}
				)
			}
		}
		active_editor.setDecorations(token_decorator, cname_array)
		active_editor.setDecorations(
			media_query_decorator,
			media_query_array
		)
		active_editor.setDecorations(
			selector_decorator,
			selector_array
		)
		active_editor.setDecorations(
			property_decorator,
			property_array
		)
		active_editor.setDecorations(value_decorator, value_array)
	}
	if (active_editor) {
		trigger_update_decorations()
	}
	vscode.window.onDidChangeActiveTextEditor(
		editor => {
			active_editor = editor
			if (editor) {
				trigger_update_decorations()
			}
		},
		null,
		context.subscriptions
	)
	vscode.workspace.onDidChangeTextDocument(
		event => {
			if (active_editor && event.document === active_editor.document) {
				trigger_update_decorations(true)
			}
		},
		null,
		context.subscriptions
	)
}