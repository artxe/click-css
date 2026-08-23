const EXAMPLES = Object.freeze(
	{
		grammar: `<main class="mih=100% p=32 bg=#f6f7fb c=#181922 ff=Inter,ui-sans-serif,system-ui,sans-serif
	_dl/grid;gtc=max-content_minmax(0,1fr);g=14_22;ai=center;mt=26
	_dt/ff=ui-monospace,Menlo,Consolas,monospace;fs=12;c=#6154d8;ws=nowrap
	_dd/fs=14;lh=1.5
	@max-width=560px@p=18
	@max-width=560px@_dl/gtc=1fr;g=6
	@max-width=560px@_dt/ws=normal
	@max-width=560px@_dd/mb=10
	@dark@bg=#0f1015;c=#f1f1f4
	@dark@_dt/c=#bcb5ff">
	<h1 class="fs=26 fw=800 ls=-.03em">Grammar tour</h1>
	<p class="mt=6 c=#565966 fs=14 lh=1.6 @dark@c=#c0c1ca">Each row is styled by the class on its left. Open the CSS tab to read what it compiled to.</p>

	<dl>
		<dt>w=160 h=10 br=999 bg=#7c6cff</dt>
		<dd><span class="d=block w=160 h=10 br=999 bg=#7c6cff"></span></dd>

		<dt>tab-size=~4</dt>
		<dd><pre class="m=0 tab-size=~4 ff=ui-monospace,Menlo,Consolas,monospace fs=13">if (ok) {
	return 4 // one tab, four columns wide
}</pre></dd>

		<dt>::before/ct='hero\\_bg.png?v\\=2'</dt>
		<dd><span class="::before/ct='hero\\_bg.png?v\\=2';ff=ui-monospace,Menlo,Consolas,monospace;fs=13"></span> escaped _ and = stay literal</dd>

		<dt>--accent=#59d499 c=--accent bd=2_solid_--accent</dt>
		<dd><span class="--accent=#59d499 c=--accent bd=2_solid_--accent d=inline-block p=4_10 br=8 fw=700">var() is written for you</span></dd>

		<dt>c=#7c6cff! c=red</dt>
		<dd><span class="c=#7c6cff! c=red fw=700">! beats the later rule, so this is never red</span></dd>

		<dt>>b/c=#d66c3c</dt>
		<dd><span class=">b/c=#d66c3c">the <b>bold child</b> is styled from its parent</span></dd>

		<dt>@sm@none · none @sm@d=inline</dt>
		<dd><span class="@sm@none">the preview is narrower than 640px</span><span class="none @sm@d=inline">the preview is 640px or wider</span></dd>

		<dt>@@supports_display=grid@c=#59d499</dt>
		<dd><span class="@@supports_display=grid@c=#59d499 fw=700">a raw at-rule, and key=value becomes (display: grid)</span></dd>

		<dt>@dark@c=#ffd166</dt>
		<dd><span class="@dark@c=#ffd166 fw=700">gold in dark mode. Toggle the preview theme in the top bar.</span></dd>

		<dt>flex ai=center g=8</dt>
		<dd><span class="flex ai=center g=8 _i/w=14;h=14;br=4;bg=#7c6cff"><i></i><i></i><i></i>value shorthands need no = at all</span></dd>
	</dl>
</main>`,
		profile: `<main class="mih=100% flex ai=center jc=center p=32 bg=#eef1f8 ff=Inter,ui-sans-serif,system-ui,sans-serif @max-width=460px@p=18 @dark@bg=#0f1015">
	<article class="w=380 maw=100% bg=white br=28 p=30 c=#181922 bsd=0_24_70_rgba(34,38,67,.16) tr=transform_.2s_ease,box-shadow_.2s_ease :hover/tf=translateY(-4px);bsd=0_30_80_rgba(34,38,67,.2) @dark@bg=#171821;c=#f7f7fb">
		<header class="flex ai=center g=16">
			<div class="w=64 h=64 br=20 flex ai=center jc=center bg=linear-gradient(135deg,#7c6cff,#b56cff) c=white fs=21 fw=800 bsd=0_10_28_rgba(124,108,255,.34)">CC</div>
			<div class="fg=1">
				<p class="mb=4 c=#7c6cff fs=12 fw=700 ls=.08em tt=uppercase">Creator spotlight</p>
				<h1 class="fs=22 fw=800 ls=-.025em">Mina Park</h1>
				<p class="mt=3 c=#747785 fs=14 @dark@c=#a8a9b3">Interface designer · Seoul</p>
			</div>
		</header>

		<p class="mt=24 lh=1.7 c=#565966 fs=14 @dark@c=#c0c1ca">Building playful interfaces with less ceremony and more character.</p>

		<div class="flex g=9 mt=24">
			<a class="fg=1 ta=center p=11 br=12 bg=#7c6cff c=white fs=13 fw=700 tr=transform_.18s_ease,background_.18s_ease :hover/bg=#6959ee;tf=translateY(-1px)" href="#follow">Follow</a>
			<a class="p=11_15 br=12 bg=#f0efff c=#6154d8 fs=13 fw=700 :hover/bg=#e7e4ff @dark@bg=#292638;c=#bcb5ff" href="#message">Message</a>
		</div>
	</article>
</main>`,
		responsive: `<main class="mih=100% p=40 bg=#f6f7fb ff=Inter,ui-sans-serif,system-ui,sans-serif @max-width=560px@p=18 @dark@bg=#0f1015">
	<div class="maw=980 m=0_auto">
		<header class="mb=26">
			<p class="mb=7 c=#7064e9 fs=12 fw=800 ls=.1em tt=uppercase">Responsive by class</p>
			<h1 class="c=#181922 fs=32 fw=800 ls=-.04em @max-width=560px@fs=25 @dark@c=#f7f7fb">One source, every viewport.</h1>
			<p class="mt=8 c=#747784 fs=14 lh=1.65 @dark@c=#a8a9b3">One column, two from 640px, three from 768px. Both queries match past 768px, so the wider one carries a !. Drag the divider: the grid follows the preview width.</p>
		</header>

		<section class="grid g=16 gtc=1fr @sm@gtc=repeat(2,1fr) @md@gtc=repeat(3,1fr)!">
			<article class="p=22 bg=white br=18 bd=1_solid_#e8e9f0 tr=transform_.2s_ease,border-color_.2s_ease :hover/tf=translateY(-3px);bdc=#b9b1ff @dark@bg=#171821;bdc=#2a2b36">
				<span class="flex ai=center jc=center w=38 h=38 mb=28 br=11 bg=#edeaff c=#6c5ce7 fs=17 fw=800">01</span>
				<h2 class="mb=8 c=#20212a fs=17 fw=700 @dark@c=#f1f1f4">No build step</h2>
				<p class="c=#747784 fs=13 lh=1.65 @dark@c=#a8a9b3">Write the CSS you already know directly in class names.</p>
			</article>

			<article class="p=22 bg=white br=18 bd=1_solid_#e8e9f0 tr=transform_.2s_ease,border-color_.2s_ease :hover/tf=translateY(-3px);bdc=#9edec4 @dark@bg=#171821;bdc=#2a2b36">
				<span class="flex ai=center jc=center w=38 h=38 mb=28 br=11 bg=#e5f8f0 c=#26956a fs=17 fw=800">02</span>
				<h2 class="mb=8 c=#20212a fs=17 fw=700 @dark@c=#f1f1f4">Tiny runtime</h2>
				<p class="c=#747784 fs=13 lh=1.65 @dark@c=#a8a9b3">Classes are discovered and compiled while your DOM changes.</p>
			</article>

			<article class="p=22 bg=white br=18 bd=1_solid_#e8e9f0 tr=transform_.2s_ease,border-color_.2s_ease :hover/tf=translateY(-3px);bdc=#ffc2a7 @dark@bg=#171821;bdc=#2a2b36">
				<span class="flex ai=center jc=center w=38 h=38 mb=28 br=11 bg=#fff0e9 c=#d66c3c fs=17 fw=800">03</span>
				<h2 class="mb=8 c=#20212a fs=17 fw=700 @dark@c=#f1f1f4">Native syntax</h2>
				<p class="c=#747784 fs=13 lh=1.65 @dark@c=#a8a9b3">Selectors, media queries, variables and calc are all at hand.</p>
			</article>
		</section>
	</div>
</main>`,
		selectors: `<main class="mih=100% flex ai=center jc=center p=28 bg=#15151b ff=Inter,ui-sans-serif,system-ui,sans-serif">
	<section class="w=560 maw=100% p=32 br=24 bg=#1e1f27 bd=1_solid_#30313d c=#f5f5f7
		_code/ff=ui-monospace,Menlo,Consolas,monospace;fs=11;c=#9fa1ad">
		<p class="mb=8 c=#9c93ff fs=12 fw=800 ls=.1em tt=uppercase">Selector playground</p>
		<h1 class="mb=12 fs=28 fw=800 ls=-.035em">Hover the rows.</h1>
		<p class="mb=28 c=#9fa1ad fs=14 lh=1.65">Everything below is styled from its class attribute. Each row names the tokens doing the work.</p>

		<div class="grid g=10">
			<a class="flex ai=center g=12 p=14_16 br=13 bg=#272832 c=#f5f5f7 tr=background_.18s_ease,transform_.18s_ease
				:hover/bg=#302e48;tf=translateX(4px)
				>span:last-child/ml=auto;c=#8f88e8;tr=transform_.18s_ease
				:hover>span:last-child/tf=translateX(3px)" href="#selectors">
				<span class="flex ai=center jc=center w=34 h=34 br=10 bg=#3b3760 c=#c9c4ff fw=800">S</span>
				<span class="miw=0 fsk=1">
					<strong class="d=block fs=14">Scoped selectors</strong>
					<code>:hover/ >span:last-child/ :hover>span:last-child/ _code/</code>
				</span>
				<span>→</span>
			</a>

			<a class="flex ai=center g=12 p=14_16 br=13 bg=#272832 c=#f5f5f7 tr=background_.18s_ease,transform_.18s_ease
				@hover@:hover/bg=#293d38;tf=translateX(4px)" href="#media">
				<span class="flex ai=center jc=center w=34 h=34 br=10 bg=#29463d c=#91dfc2 fw=800">@</span>
				<span class="miw=0 fsk=1">
					<strong class="d=block fs=14">Media conditions</strong>
					<code>@hover@:hover/ · @sm@none · none @sm@d=inline</code>
				</span>
				<span class="ml=auto p=3_9 br=999 bg=#29463d c=#91dfc2 fs=11 fw=700 ws=nowrap"><span class="@sm@none">under 640px</span><span class="none @sm@d=inline">640px and up</span></span>
			</a>

			<a class="flex ai=center g=12 p=14_16 br=13 bg=#272832 c=#f5f5f7 tr=background_.18s_ease,transform_.18s_ease
				:hover/bg=#46342d;tf=translateX(4px)
				>span:last-child/ml=auto;c=#e6a083;tr=transform_.18s_ease
				:hover>span:last-child/tf=translateX(3px)" href="#priority">
				<span class="flex ai=center jc=center w=34 h=34 br=10 bg=#533b31!! bg=red! c=#ffc0a5 fw=800">!</span>
				<span class="miw=0 fsk=1">
					<strong class="d=block fs=14">Stackable priority</strong>
					<code>bg=#533b31!! bg=red! · two ! beat one, so red never shows</code>
				</span>
				<span>→</span>
			</a>
		</div>
	</section>
</main>`
	}
)
const STORAGE = Object.freeze(
	{
		source: "click-css-playground:source:v1",
		splitHorizontal: "click-css-playground:split-horizontal:v1",
		splitVertical: "click-css-playground:split-vertical:v1",
		theme: "click-css-playground:theme:v1"
	}
)
// "" follows the OS setting; the other two are what click-css reads from localStorage.THEME.
const THEMES = Object.freeze([ "", "LIGHT", "DARK" ])
const THEME_LABELS = Object.freeze({ "": "System", DARK: "Dark", LIGHT: "Light" })
const RUNTIME_URL = new URL("./min.js", document.baseURI).href
const RENDER_TIMEOUT = 5000
const LOADER_DELAY = 300
const stacked_layout = window.matchMedia("(max-width: 820px)")
const editor = document.querySelector("#editor")
const line_numbers = document.querySelector("#line-numbers")
const cursor_position = document.querySelector("#cursor-position")
const example_select = document.querySelector("#example-select")
const preview_frames = [ ...document.querySelectorAll(".preview-frame") ]
const preview_loader = document.querySelector("#preview-loader")
const css_output = document.querySelector("#css-output")
const css_size = document.querySelector("#css-size")
const preview_view = document.querySelector("#preview-view")
const css_view = document.querySelector("#css-view")
const preview_tab = document.querySelector("#preview-tab")
const css_tab = document.querySelector("#css-tab")
const status = document.querySelector("#live-status")
const status_label = document.querySelector("#status-label")
const theme_button = document.querySelector("#theme-button")
const theme_label = document.querySelector("#theme-label")
const divider = document.querySelector("#divider")
const workspace = document.querySelector("#workspace")
const toast = document.querySelector("#toast")
let active_example = "profile"
let render_timer
let render_timeout
let loader_timer
let toast_timer
let render_id = 0
let active_frame = 0
let is_dragging = false
let let_tab_leave_editor = false
let preview_theme = ""
let horizontal_split = read_number(STORAGE.splitHorizontal, 48)
let vertical_split = read_number(STORAGE.splitVertical, 48)
function activate_output(name, focus = false) {
	const show_preview = name === "preview"
	preview_view.hidden = !show_preview
	css_view.hidden = show_preview
	preview_tab.classList.toggle("is-active", show_preview)
	css_tab.classList.toggle("is-active", !show_preview)
	preview_tab.setAttribute("aria-selected", String(show_preview))
	css_tab.setAttribute("aria-selected", String(!show_preview))
	preview_tab.tabIndex = show_preview ? 0 : -1
	css_tab.tabIndex = show_preview ? -1 : 0
	if (focus) (show_preview ? preview_tab : css_tab).focus()
}
// A complete document for the preview frame: the user's markup with its own copy of
// click-css in <head>, a localStorage shim carrying the chosen THEME (the sandbox has no
// storage of its own), and a reporter that posts the compiled CSS back once the page loads.
function build_preview_document(source, theme, id) {
	const doc = sanitize_document(source)
	const shim = doc.createElement("script")
	shim.textContent = `Object.defineProperty(window, "localStorage", { value: { length: 0, key: () => null, getItem: key => key === "THEME" ? ${JSON.stringify(theme || null)} : null, setItem() {}, removeItem() {}, clear() {} } })`
	const runtime = doc.createElement("script")
	runtime.setAttribute("src", RUNTIME_URL)
	const reporter = doc.createElement("script")
	reporter.textContent = `(() => {
	function post(message) {
		return parent.postMessage(Object.assign({ id: ${id} }, message), "*")
	}
	let reset = ""
	try {
		click()
		reset = document.querySelector("style[click]").textContent
	} catch (error) {
		addEventListener("load", () => post({ type: "click-css:error", message: String(error) }))
		return
	}
	addEventListener("click", event => {
		if (event.target instanceof Element && event.target.closest("a")) event.preventDefault()
	})
	addEventListener("submit", event => event.preventDefault())
	addEventListener("load", () => setTimeout(() => {
		const sheet = document.querySelector("style[click]")
		post({ type: "click-css:css", css: sheet ? sheet.textContent.slice(reset.length) : "" })
	}))
})()`
	doc.head.prepend(shim, runtime, reporter)
	return "<!doctype html>" + doc.documentElement.outerHTML
}
function clamp(value, minimum, maximum) {
	return Math.min(maximum, Math.max(minimum, value))
}
async function copy_source() {
	try {
		await write_clipboard(editor.value)
		show_toast("HTML copied to clipboard.")
	} catch {
		show_toast("Could not access the clipboard.", "error")
	}
}
function fail_render(message) {
	window.clearTimeout(render_timeout)
	window.clearTimeout(loader_timer)
	preview_loader.classList.remove("is-visible")
	set_status("Runtime error", "error")
	show_toast(message, "error")
}
function find_matching_example(source) {
	return Object.keys(EXAMPLES).find(key => EXAMPLES[key] === source) ?? "custom"
}
function finish_render(css) {
	window.clearTimeout(render_timeout)
	window.clearTimeout(loader_timer)
	preview_frames[active_frame].classList.add("is-standby")
	active_frame = 1 - active_frame
	preview_frames[active_frame].classList.remove("is-standby")
	update_generated_css(css)
	preview_loader.classList.remove("is-visible")
	set_status("Live")
}
function format_bytes(css) {
	const bytes = new TextEncoder().encode(css).length
	if (bytes < 1000) return `${bytes} B`
	return `${(bytes / 1000).toFixed(bytes < 10_000 ? 1 : 0)} kB`
}
function format_css(css) {
	let formatted = ""
	let indentation = 0
	let quote = ""
	let escaped = false
	let css_escaped = false
	let parentheses = 0
	let at_line_start = true
	function append(value) {
		if (at_line_start && value !== "\n") {
			formatted += "  ".repeat(indentation)
			at_line_start = false
		}
		formatted += value
		if (value.endsWith("\n")) at_line_start = true
	}
	for (const character of css.trim()) {
		if (quote) {
			append(character)
			if (escaped) escaped = false
			else if (character === "\\") escaped = true
			else if (character === quote) quote = ""
			continue
		}
		if (css_escaped) {
			append(character)
			css_escaped = false
			continue
		}
		if (character === "\\") {
			append(character)
			css_escaped = true
			continue
		}
		if (character === "\"" || character === "'") {
			quote = character
			append(character)
			continue
		}
		if (character === "(") parentheses += 1
		if (character === ")") parentheses = Math.max(0, parentheses - 1)
		if (parentheses === 0 && character === "{") {
			formatted = formatted.trimEnd()
			append(" {\n")
			indentation += 1
		} else if (parentheses === 0 && character === ";") {
			append(";\n")
		} else if (parentheses === 0 && character === "}") {
			formatted = formatted.trimEnd()
			formatted += "\n"
			at_line_start = true
			indentation = Math.max(0, indentation - 1)
			append("}\n")
		} else {
			append(character)
		}
	}
	return formatted.trim() || "/* No Click CSS rules yet. */"
}
function get_shared_source() {
	const parameters = new URLSearchParams(window.location.hash.slice(1))
	if (!parameters.has("code")) return null
	const source = parameters.get("code") ?? ""
	return source.length <= 100_000 ? source : null
}
function handle_divider_keydown(event) {
	const amount = event.shiftKey ? 5 : 1
	const current = stacked_layout.matches ? vertical_split : horizontal_split
	let next = current
	if (event.key === "Home") next = 25
	else if (event.key === "End") next = 75
	else if (event.key === "ArrowLeft" || event.key === "ArrowUp") next -= amount
	else if (event.key === "ArrowRight" || event.key === "ArrowDown") next += amount
	else return
	event.preventDefault()
	set_split(next)
}
function handle_editor_keydown(event) {
	if (event.key === "Escape") {
		let_tab_leave_editor = true
		show_toast("Press Tab to leave the editor.")
		return
	}
	if (event.key === "Enter" && (event.ctrlKey || event.metaKey)) {
		let_tab_leave_editor = false
		event.preventDefault()
		render()
		return
	}
	if (event.key !== "Tab") {
		let_tab_leave_editor = false
		return
	}
	if (let_tab_leave_editor) {
		let_tab_leave_editor = false
		return
	}
	const start = editor.selectionStart
	const end = editor.selectionEnd
	const value = editor.value
	if (event.shiftKey) {
		const line_start = value.lastIndexOf("\n", start - 1) + 1
		const removable = value.slice(line_start, line_start + 2).match(/^(?:\t| {1,2})/)?.[0] ?? ""
		if (!removable) return
		event.preventDefault()
		editor.setRangeText(
			"",
			line_start,
			line_start + removable.length,
			"preserve"
		)
		editor.selectionStart = Math.max(line_start, start - removable.length)
		editor.selectionEnd = Math.max(line_start, end - removable.length)
	} else {
		event.preventDefault()
		editor.setRangeText("\t", start, end, "end")
	}
	on_editor_input()
}
function initial_source() {
	const shared = get_shared_source()
	if (shared !== null) return shared
	return read_storage(STORAGE.source) ?? EXAMPLES.profile
}
function on_editor_input() {
	write_storage(STORAGE.source, editor.value)
	example_select.value = "custom"
	update_line_numbers()
	update_cursor_position()
	if (window.location.hash.includes("code=")) {
		history.replaceState(
			null,
			"",
			`${window.location.pathname}${window.location.search}`
		)
	}
	schedule_render()
}
function read_number(key, fallback) {
	const stored = read_storage(key)
	if (stored === null) return fallback
	const value = Number(stored)
	return Number.isFinite(value) ? clamp(value, 25, 75) : fallback
}
function read_storage(key) {
	try {
		return localStorage.getItem(key)
	} catch {
		return null
	}
}
function read_theme() {
	const stored = read_storage(STORAGE.theme) ?? ""
	return THEMES.includes(stored) ? stored : ""
}
// Two frames alternate: the standby frame loads the new document while the active one stays
// visible, and they swap once the new document reports its CSS. No flash between edits.
function render() {
	window.clearTimeout(render_timer)
	window.clearTimeout(render_timeout)
	window.clearTimeout(loader_timer)
	set_status("Rendering…", "busy")
	loader_timer = window.setTimeout(
		() => preview_loader.classList.add("is-visible"),
		LOADER_DELAY
	)
	const id = ++render_id
	preview_frames[1 - active_frame].srcdoc = build_preview_document(editor.value, preview_theme, id)
	render_timeout = window.setTimeout(
		() => fail_render("The preview did not respond."),
		RENDER_TIMEOUT
	)
}
function resize_from_pointer(event) {
	if (!is_dragging) return
	const bounds = workspace.getBoundingClientRect()
	const percentage = stacked_layout.matches
		? (event.clientY - bounds.top) / bounds.height * 100
		: (event.clientX - bounds.left) / bounds.width * 100
	set_split(percentage)
}
// The preview runs in a sandboxed iframe with an opaque origin, so this is defence in depth:
// scripts and handlers are removed mostly so a typo cannot lock up the tab.
function sanitize_document(source) {
	const doc = new DOMParser().parseFromString(source, "text/html")
	for (const blocked of doc.querySelectorAll("script, iframe, object, embed, base, meta")) blocked.remove()
	for (const element of doc.querySelectorAll("*")) {
		for (const attribute of [ ...element.attributes ]) {
			const name = attribute.name.toLowerCase()
			const unsafe_url = [ "href", "src", "xlink:href", "formaction", "action" ].includes(name)
				&& /^\s*(?:javascript|vbscript):/i.test(attribute.value)
			if (name.startsWith("on") || name === "srcdoc" || unsafe_url) {
				element.removeAttribute(attribute.name)
			}
		}
	}
	return doc
}
function schedule_render() {
	window.clearTimeout(render_timer)
	set_status("Editing…", "busy")
	render_timer = window.setTimeout(render, 160)
}
function set_editor_source(source, example = "custom") {
	editor.value = source
	active_example = example === "custom" ? active_example : example
	example_select.value = example
	write_storage(STORAGE.source, source)
	update_line_numbers()
	update_cursor_position()
	render()
}
function set_split(value, stacked = stacked_layout.matches) {
	const percentage = clamp(value, 25, 75)
	if (stacked) {
		vertical_split = percentage
		workspace.style.setProperty("--editor-block-size", `${percentage}%`)
		write_storage(STORAGE.splitVertical, percentage)
	} else {
		horizontal_split = percentage
		workspace.style.setProperty("--editor-size", `${percentage}%`)
		write_storage(STORAGE.splitHorizontal, percentage)
	}
	divider.setAttribute("aria-valuenow", String(Math.round(percentage)))
}
function set_status(label, mode = "live") {
	status_label.textContent = label
	status.classList.toggle("is-busy", mode === "busy")
	status.classList.toggle("is-error", mode === "error")
}
function set_theme(theme) {
	preview_theme = theme
	write_storage(STORAGE.theme, theme)
	theme_label.textContent = THEME_LABELS[theme]
	theme_button.setAttribute(
		"aria-label",
		`Preview color scheme: ${THEME_LABELS[theme]}`
	)
	// SVG elements have no `hidden` IDL property, so toggle the attribute and style it ourselves.
	for (const icon of theme_button.querySelectorAll("svg")) {
		icon.toggleAttribute("hidden", icon.dataset.theme !== theme)
	}
}
async function share_source() {
	if (editor.value.length > 100_000) {
		show_toast(
			"This source is too large to share as a URL.",
			"error"
		)
		return
	}
	const base_url = window.location.href.split("#")[0]
	const share_url = `${base_url}#code=${encodeURIComponent(editor.value)}`
	try {
		history.replaceState(null, "", share_url)
		await write_clipboard(share_url)
		show_toast("Share link copied.")
	} catch {
		show_toast("Could not copy the share link.", "error")
	}
}
function show_toast(message, mode = "default") {
	window.clearTimeout(toast_timer)
	toast.textContent = message
	toast.classList.toggle("is-error", mode === "error")
	toast.classList.add("is-visible")
	toast_timer = window.setTimeout(() => toast.classList.remove("is-visible"), 2200)
}
function stop_dragging(event) {
	if (!is_dragging) return
	is_dragging = false
	divider.classList.remove("is-dragging")
	if (event.pointerId !== undefined && divider.hasPointerCapture(event.pointerId)) {
		divider.releasePointerCapture(event.pointerId)
	}
}
function update_cursor_position() {
	const before_cursor = editor.value.slice(0, editor.selectionStart)
	const lines = before_cursor.split("\n")
	cursor_position.textContent = `Ln ${lines.length}, Col ${lines.at(-1).length + 1}`
}
function update_divider_orientation() {
	divider.setAttribute(
		"aria-orientation",
		stacked_layout.matches ? "horizontal" : "vertical"
	)
	set_split(
		stacked_layout.matches ? vertical_split : horizontal_split
	)
}
function update_generated_css(css) {
	css_output.textContent = format_css(css)
	css_size.textContent = format_bytes(css)
}
function update_line_numbers() {
	const count = editor.value.split("\n").length
	line_numbers.textContent = Array.from({ length: count }, (_, index) => index + 1).join("\n")
	line_numbers.scrollTop = editor.scrollTop
}
async function write_clipboard(text) {
	if (navigator.clipboard?.writeText && window.isSecureContext) {
		await navigator.clipboard.writeText(text)
		return
	}
	const helper = document.createElement("textarea")
	helper.value = text
	helper.setAttribute("readonly", "")
	helper.style.position = "fixed"
	helper.style.opacity = "0"
	document.body.append(helper)
	helper.select()
	const copied = document.execCommand("copy")
	helper.remove()
	if (!copied) throw new Error("Clipboard is unavailable")
}
function write_storage(key, value) {
	try {
		localStorage.setItem(key, value)
	} catch {
		// Storage can be unavailable in private browsing contexts.
	}
}
window.addEventListener(
	"message",
	event => {
		const data = event.data
		if (event.source !== preview_frames[1 - active_frame].contentWindow) return
		if (!data || typeof data !== "object" || data.id !== render_id) return
		if (data.type === "click-css:css") finish_render(typeof data.css === "string" ? data.css : "")
		else if (data.type === "click-css:error") fail_render("Click CSS failed to load in the preview.")
	}
)
editor.addEventListener("input", on_editor_input)
editor.addEventListener("keydown", handle_editor_keydown)
editor.addEventListener("keyup", update_cursor_position)
editor.addEventListener("click", update_cursor_position)
editor.addEventListener("select", update_cursor_position)
editor.addEventListener(
	"scroll",
	() => {
		line_numbers.scrollTop = editor.scrollTop
	}
)
example_select.addEventListener(
	"change",
	() => {
		const key = example_select.value
		if (!(key in EXAMPLES)) return
		set_editor_source(EXAMPLES[key], key)
	}
)
theme_button.addEventListener(
	"click",
	() => {
		set_theme(
			THEMES[(THEMES.indexOf(preview_theme) + 1) % THEMES.length]
		)
		render()
	}
)
document.querySelector("#reset-button").addEventListener(
	"click",
	() => {
		set_editor_source(EXAMPLES[active_example], active_example)
		show_toast("Example reset.")
	}
)
document.querySelector("#copy-button").addEventListener("click", copy_source)
document.querySelector("#share-button").addEventListener("click", share_source)
document.querySelector("#run-button").addEventListener("click", render)
preview_tab.addEventListener("click", () => activate_output("preview"))
css_tab.addEventListener("click", () => activate_output("css"))
for (const tab of [ preview_tab, css_tab ]) {
	tab.addEventListener(
		"keydown",
		event => {
			if (event.key !== "ArrowLeft" && event.key !== "ArrowRight") return
			event.preventDefault()
			activate_output(tab === preview_tab ? "css" : "preview", true)
		}
	)
}
divider.addEventListener(
	"pointerdown",
	event => {
		is_dragging = true
		divider.classList.add("is-dragging")
		divider.setPointerCapture(event.pointerId)
		resize_from_pointer(event)
	}
)
divider.addEventListener("pointermove", resize_from_pointer)
divider.addEventListener("pointerup", stop_dragging)
divider.addEventListener("pointercancel", stop_dragging)
divider.addEventListener("keydown", handle_divider_keydown)
window.addEventListener(
	"hashchange",
	() => {
		const shared = get_shared_source()
		if (shared !== null && shared !== editor.value) {
			set_editor_source(shared, find_matching_example(shared))
		}
	}
)
stacked_layout.addEventListener("change", update_divider_orientation)
const source = initial_source()
const matching_example = find_matching_example(source)
if (matching_example !== "custom") active_example = matching_example
editor.value = source
example_select.value = matching_example
update_line_numbers()
update_cursor_position()
set_split(horizontal_split, false)
set_split(vertical_split, true)
update_divider_orientation()
set_theme(read_theme())
activate_output("preview")
render()