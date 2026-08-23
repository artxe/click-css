import auto_completion from "./extensions/auto_completion.js"
import highlighter from "./extensions/highlighter.js"
/**
 * @param {import("vscode").ExtensionContext} context
 * @returns {void}
 */
export function activate(context) {
	auto_completion(context)
	highlighter(context)
}