import {
	shorthand_for_media_condition,
	shorthand_for_properties,
	shorthand_for_values
} from "../helper/get_config.js"
import parse_dom from "../helper/parse_dom.js"
import * as vscode from "vscode"
/**
 * @param {vscode.ExtensionContext} context
 * @returns {void}
 */
export default context => {
	/**
	 * @param {vscode.TextDocument} document
	 * @param {vscode.Position} position
	 * @returns {boolean}
	 */
	function is_in_class_name(document, position) {
		const offset = document.offsetAt(position)
		const text = document.getText().slice(0, offset)
		const element = last_element(
			parse_dom(document.fileName, text)
		)
		const attribute = element?.attributes[element.attributes.length - 1]
		if (!attribute) return false
		if (attribute.name != "class" && attribute.name != "className" && attribute.name != "classs") return false
		if (text[attribute.start] == ".") return false
		if (typeof attribute.value == "boolean") return attribute.end == offset && text[offset - 1] == "="
		const value = attribute.value
		if (value.end != offset) return false
		const closing = value.type == "Script"
			? "}"
			: value.subType == "unquoted"
				? ""
				: text[value.start]
		return !closing || value.end - value.start == 1 || text[value.end - 1] != closing
	}
	/**
	 * @param {import("dom-eater").AstNode[]} nodes
	 * @returns {import("dom-eater").Element | undefined}
	 */
	function last_element(nodes) {
		const node = nodes[nodes.length - 1]
		if (node?.type == "Script") return last_element(
			"elements" in node ? node.elements : []
		)
		if (node?.type != "Element") return
		return last_element(node.children) ?? node
	}
	const razor_file_regex = /\.(?:cshtml|razor)$/i
	const selector = [ "*" ]
	const trigger_characters = [ "\"", "'", " ", "/", ";" ]
	context.subscriptions.push(
		vscode.languages.registerCompletionItemProvider(
			selector,
			{
				/**
				 * @param {vscode.TextDocument} document
				 * @param {vscode.Position} position
				 * @returns {vscode.ProviderResult<vscode.CompletionItem[]>}
				 */
				provideCompletionItems(document, position) {
					if (is_in_class_name(document, position)) {
						const keys = [ ...shorthand_for_properties ].map(
							([ k, v ]) => {
								const comp = new vscode.CompletionItem(v + ":?")
								comp.insertText = k + "="
								comp.kind = vscode.CompletionItemKind.EnumMember
								comp.detail = `${k}= * * * shorthand_for_properties of click-css`
								comp.sortText = v
								return comp
							}
						)
						const values = [ ...shorthand_for_values ].map(
							([ k, v ]) => {
								const comp = new vscode.CompletionItem(v)
								comp.insertText = k
								comp.kind = vscode.CompletionItemKind.Value
								comp.detail = `${k} * * * shorthand_for_values of click-css`
								comp.sortText = v
								return comp
							}
						)
						return [ ...keys, ...values ]
					}
					return undefined
				}
			},
			...trigger_characters
		),
		vscode.languages.registerCompletionItemProvider(
			selector,
			{
				/**
				 * @param {vscode.TextDocument} document
				 * @param {vscode.Position} position
				 * @returns {vscode.ProviderResult<vscode.CompletionItem[]>}
				 */
				provideCompletionItems(document, position) {
					if (is_in_class_name(document, position)) {
						const at = razor_file_regex.test(document.fileName)
							? "@@"
							: "@"
						const medias = [
							...shorthand_for_media_condition
						].map(
							([ k, v ]) => {
								const comp = new vscode.CompletionItem("@media " + v)
								comp.insertText = at + k + at
								comp.kind = vscode.CompletionItemKind.Constructor
								comp.detail = `${at}${k}${at} * * * shorthand_for_media_condition of click-css`
								comp.sortText = v
								comp.command = {
									"command": "editor.action.triggerSuggest",
									"title": "Re-trigger completions..."
								}
								return comp
							}
						)
						return [ ...medias ]
					}
					return undefined
				}
			},
			...trigger_characters
		)
	)
}