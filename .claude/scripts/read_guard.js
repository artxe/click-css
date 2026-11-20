import { readFileSync } from "node:fs"
import { basename, extname } from "node:path"
import { pathToFileURL } from "node:url"
const BIG_READ = 300
const NEW_LINE = 10
const TODO_FILE = /^TODO.*\.md$/i
const WHOLE = new Set(
	[
		".gif",
		".ipynb",
		".jpeg",
		".jpg",
		".pdf",
		".png",
		".svg",
		".webp"
	]
)
/**
 * @param {string} input the hook's JSON from stdin
 * @returns {string} the hook's answer, empty when the read may go ahead
 */
export function answer(input) {
	/** @type {{ tool_input?: { file_path?: unknown, limit?: unknown, offset?: unknown } }} */
	let hook
	try {
		hook = JSON.parse(input)
	} catch {
		return ""
	}
	const { file_path: path, limit, offset } = hook.tool_input ?? {}
	if (typeof path != "string" || limit != null || offset != null || WHOLE.has(extname(path).toLowerCase())) {
		return ""
	}
	let lines = 1
	try {
		for (const byte of readFileSync(path)) {
			if (byte == NEW_LINE) {
				lines += 1
			}
		}
	} catch {
		return ""
	}
	if (lines <= BIG_READ) {
		return ""
	}
	const todo = TODO_FILE.test(basename(path))
	const reason = todo
		? `${path} has ${lines} lines. Run the level check its head names, if any, for the ready items; otherwise Grep its headings and the ids you need. Then Read only those lines with offset and limit.`
		: `${path} has ${lines} lines. Grep first, then Read only the lines you need with offset and limit.`
	return JSON.stringify(
		{
			hookSpecificOutput: {
				hookEventName: "PreToolUse",
				permissionDecision: "deny",
				permissionDecisionReason: reason
			}
		}
	)
}
if (process.argv[1] && import.meta.url == pathToFileURL(process.argv[1]).href) {
	const output = answer(readFileSync(0, "utf8"))
	if (output) {
		process.stdout.write(`${output}\n`)
	}
}