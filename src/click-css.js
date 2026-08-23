{
	let dom = document
	let escape = CSS.escape
	let RE = RegExp
	let M = Map
	let MO = MutationObserver
	let reset_style = "*{margin:0;padding:0;font:inherit;color:inherit}"
		+ "*,:after,:before{box-sizing:border-box;flex-shrink:0}"
		+ "html,body{height:100%;max-height:100%}"
		+ "ol,ul,menu,dir{list-style:none}"
		+ "img,svg,video,canvas,audio,iframe,embed,object{vertical-align:bottom;max-width:100%}"
		+ "button{background:none;border:0;cursor:pointer}"
		+ "b,strong{font-weight:bold}"
		+ "a{text-decoration:none}"
		+ "pre{white-space:pre-wrap}"
		+ "table{border-collapse:collapse;border-spacing:0}"
		+ ":root{-webkit-tap-highlight-color:transparent;text-size-adjust:100%;-webkit-text-size-adjust:100%;line-height:1.5;overflow-wrap:break-word;word-break:break-word;tab-size:4}"
	let shorthand_for_properties = new M(
		[
			[ "ac", "align-content" ],
			[ "ai", "align-items" ],
			[ "as", "align-self" ],
			[ "a", "animation" ],
			[ "ar", "aspect-ratio" ],
			[ "bf", "backdrop-filter" ],
			[ "bg", "background" ],
			[ "bgc", "background-color" ],
			[ "bgi", "background-image" ],
			[ "bgp", "background-position" ],
			[ "bgr", "background-repeat" ],
			[ "bgs", "background-size" ],
			[ "bs", "block-size" ],
			[ "bd", "border" ],
			[ "bdb", "border-bottom" ],
			[ "brbl", "border-bottom-left-radius" ],
			[ "brbr", "border-bottom-right-radius" ],
			[ "bdc", "border-color" ],
			[ "bdi", "border-inline" ],
			[ "bdl", "border-left" ],
			[ "br", "border-radius" ],
			[ "bdr", "border-right" ],
			[ "bds", "border-style" ],
			[ "bdt", "border-top" ],
			[ "brtl", "border-top-left-radius" ],
			[ "brtr", "border-top-right-radius" ],
			[ "bdw", "border-width" ],
			[ "b", "bottom" ],
			[ "bsd", "box-shadow" ],
			[ "c", "color" ],
			[ "csm", "color-scheme" ],
			[ "gx", "column-gap" ],
			[ "cq", "container" ],
			[ "cqn", "container-name" ],
			[ "cqt", "container-type" ],
			[ "ct", "content" ],
			[ "cs", "cursor" ],
			[ "d", "display" ],
			[ "ft", "filter" ],
			[ "f", "flex" ],
			[ "fb", "flex-basis" ],
			[ "fg", "flex-grow" ],
			[ "fsk", "flex-shrink" ],
			[ "ff", "font-family" ],
			[ "fs", "font-size" ],
			[ "fst", "font-style" ],
			[ "fw", "font-weight" ],
			[ "g", "gap" ],
			[ "ga", "grid-area" ],
			[ "gaf", "grid-auto-flow" ],
			[ "gc", "grid-column" ],
			[ "gr", "grid-row" ],
			[ "gta", "grid-template-areas" ],
			[ "gtc", "grid-template-columns" ],
			[ "gtr", "grid-template-rows" ],
			[ "h", "height" ],
			[ "is", "inline-size" ],
			[ "in", "inset" ],
			[ "jc", "justify-content" ],
			[ "ji", "justify-items" ],
			[ "js", "justify-self" ],
			[ "l", "left" ],
			[ "ls", "letter-spacing" ],
			[ "lh", "line-height" ],
			[ "m", "margin" ],
			[ "my", "margin-block" ],
			[ "mb", "margin-bottom" ],
			[ "mx", "margin-inline" ],
			[ "ml", "margin-left" ],
			[ "mr", "margin-right" ],
			[ "mt", "margin-top" ],
			[ "mah", "max-height" ],
			[ "maw", "max-width" ],
			[ "mih", "min-height" ],
			[ "miw", "min-width" ],
			[ "of", "object-fit" ],
			[ "op", "opacity" ],
			[ "od", "order" ],
			[ "ol", "outline" ],
			[ "o", "overflow" ],
			[ "ow", "overflow-wrap" ],
			[ "ox", "overflow-x" ],
			[ "oy", "overflow-y" ],
			[ "p", "padding" ],
			[ "py", "padding-block" ],
			[ "pb", "padding-bottom" ],
			[ "px", "padding-inline" ],
			[ "pl", "padding-left" ],
			[ "pr", "padding-right" ],
			[ "pt", "padding-top" ],
			[ "pcc", "place-content" ],
			[ "pci", "place-items" ],
			[ "pcs", "place-self" ],
			[ "pe", "pointer-events" ],
			[ "r", "right" ],
			[ "rt", "rotate" ],
			[ "gy", "row-gap" ],
			[ "sc", "scale" ],
			[ "ta", "text-align" ],
			[ "td", "text-decoration" ],
			[ "to", "text-overflow" ],
			[ "ts", "text-shadow" ],
			[ "tt", "text-transform" ],
			[ "tw", "text-wrap" ],
			[ "t", "top" ],
			[ "tf", "transform" ],
			[ "tr", "transition" ],
			[ "tl", "translate" ],
			[ "us", "user-select" ],
			[ "vs", "visibility" ],
			[ "ws", "white-space" ],
			[ "w", "width" ],
			[ "wb", "word-break" ],
			[ "z", "z-index" ]
		]
	)
	let shorthand_for_values = new M(
		[
			[ "block", "display:block" ],
			[ "flex", "display:flex" ],
			[ "grid", "display:grid" ],
			[ "inline", "display:inline" ],
			[ "inline-block", "display:inline-block" ],
			[ "none", "display:none" ],
			[ "column", "flex-direction:column" ],
			[ "column-reverse", "flex-direction:column-reverse" ],
			[ "row", "flex-direction:row" ],
			[ "row-reverse", "flex-direction:row-reverse" ],
			[ "nowrap", "flex-wrap:nowrap" ],
			[ "wrap", "flex-wrap:wrap" ],
			[ "wrap-reverse", "flex-wrap:wrap-reverse" ],
			[ "isolate", "isolation:isolate" ],
			[ "absolute", "position:absolute" ],
			[ "fixed", "position:fixed" ],
			[ "relative", "position:relative" ],
			[ "static", "position:static" ],
			[ "sticky", "position:sticky" ]
		]
	)
	let shorthand_for_media_condition = new M(
		[
			[ "hover", "(hover:hover)" ],
			[ "sm", "(min-width:640px)" ],
			[ "md", "(min-width:768px)" ],
			[ "lg", "(min-width:1024px)" ],
			[ "xl", "(min-width:1280px)" ],
			[ "2xl", "(min-width:1536px)" ],
			[ "landscape", "(orientation:landscape)" ],
			[ "portrait", "(orientation:portrait)" ],
			[ "coarse", "(pointer:coarse)" ],
			[ "fine", "(pointer:fine)" ],
			[ "dark", "(prefers-color-scheme:dark)" ],
			[ "reduce", "(prefers-reduced-motion:reduce)" ]
		]
	)
	let replace_default_unit_inner_regex = /(?:^|[ ,])-?(?:\d*\.)?\d+(?=[ ,!]|$)/g
	let replace_default_unit_regex = /((?:^|;|-)(?:basis|block|border|bottom|gap|grid-(?:auto|template)-(?:columns|rows)|(?<!line-)height|indent|inline|inset(?:-[a-z]+)*|left|(?:margin|padding)(?:-[a-z]+)*|offset|origin|outline|perspective|position|radius|right|shadow|size|spacing|top|translate|(?<!stroke-)width):)(.+?)(?=;|$)/g
	let default_unit = "px"
	let style_sheet = dom.createElement("style")
	/** @type {Set<string>} */
	let classes = new Set()
	/** @type {Set<string>} */
	let class_attributes = new Set()
	/** @type {Set<Element>} */
	let pending_elements = new Set()
	let plain_style = ""
	let media_style = ""
	/** @type {RegExp} */
	let check_has_value_regex = RE(
		".[:=].|"
		+ [ ...shorthand_for_values.keys() ].join("|")
	)
	let split_cname_regex = /[^\t\n\f\r ]+/g
	let dark_theme_regex = /prefers-color-scheme:dark/g
	let replace_and_regex = /&/g
	let replace_colon_regex = /\\?=/g
	let replace_condition_regex = /[^ ,]+(?<![<>=])=[^ ,]+/g
	/** @type {RegExp} */
	let replace_media_condition_regex = RE(
		"(^|[ ,])("
		+ [ ...shorthand_for_media_condition.keys() ].join("|")
		+ ")(?=[ ,]|$)",
		"g"
	)
	/** @type {RegExp} */
	let replace_shorthand_regex = RE(
		"(^|;)(?:("
		+ [ ...shorthand_for_properties.keys() ].join("|")
		+ ")(?=:)|("
		+ [ ...shorthand_for_values.keys() ].join("|")
		+ ")(?=;|!|$))",
		"g"
	)
	let replace_escape_regex = /\\=/g
	let replace_space_regex = /\\?_/g
	let replace_var_regex = /[: ,]~?--[^ ;,)]+|(?<=:)~|(?<=[ ,])~(?=[-.\d])/g
	/** @returns {void} */
	click = () => {
		let theme = localStorage.getItem("THEME")
		style_sheet.textContent = reset_style + plain_style + (
			theme == "DARK" || theme == "LIGHT"
				? media_style.replace(dark_theme_regex, theme == "DARK" ? "color" : "")
				: media_style
		)
	}
	/**
	 * @param {string} cname
	 * @returns {void}
	 */
	function add_cname(cname) {
		if (!classes.has(cname)) {
			classes.add(cname)
			compile_cname(cname)
		}
	}
	/**
	 * @param {string} cname
	 * @returns {boolean}
	 */
	function check_is_declaration(cname) {
		let c = /** @type {string} */(cname[0])/**/
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
			let c = cname[i]
			if (c == "\\") i++
			else if (quote) quote = c == quote ? "" : quote
			else if (c == "'" || c == "\"") quote = c
			else if (c == "(" || c == "[" || c == "{") depth++
			else if ((c == ")" || c == "]" || c == "}") && depth-- < 1) return true
		}
		return quote || depth || cname[cname.length - 1] == "\\"
	}
	/**
	 * @param {Element} target
	 * @returns {void}
	 */
	function collect_unique_top_nodes(target) {
		if (target.nodeType != 1 || pending_elements.has(target)) return
		for (let e of pending_elements) {
			if (e.contains(target)) return
			if (target.contains(e)) pending_elements.delete(e)
		}
		pending_elements.add(target)
	}
	/**
	 * @param {string} cname
	 * @returns {void}
	 */
	function compile_cname(cname) {
		if (check_has_value_regex.test(cname) && !check_is_open(cname)) {
			if (check_is_declaration(cname)) plain_style += get_priority(cname) + "." + compile_declaration(cname)
			else if (cname[0] == "@") compile_media(cname)
			else plain_style += get_priority(cname) + "." + compile_selector(cname)
		}
	}
	/**
	 * @param {string} cname
	 * @returns {string}
	 */
	function compile_declaration(cname) {
		return escape(cname) + "{" + parse_value(cname) + "}"
	}
	/**
	 * @param {string} cname
	 * @returns {void}
	 */
	function compile_media(cname) {
		let i = cname.indexOf("@", 2)
		if (i < 0 || i == cname.length - 1) return
		let query = cname.slice(1, i)
		let name = cname.slice(i + 1)
		media_style += parse_query(query) + get_priority(name) + ".\\@" + escape(query) + "\\@"
			+ (check_is_declaration(name) ? compile_declaration : compile_selector)(name) + "}"
	}
	/**
	 * @param {string} cname
	 * @returns {string}
	 */
	function compile_selector(cname) {
		let i = get_selector_end(cname)
		return escape(cname) + (i < 0
			? ""
			: cname.slice(0, i).replace(replace_space_regex, replace_space_handler)
				.replace(replace_escape_regex, "="))
			+ "{" + parse_value(cname.slice(i + 1)) + "}"
	}
	/**
	 * @param {Element} target
	 * @returns {void}
	 */
	function detect_class_attribute(target) {
		let class_attribute = target.getAttribute("class")
		if (class_attribute && !class_attributes.has(class_attribute)) {
			class_attributes.add(class_attribute)
			class_attribute.match(split_cname_regex)?.forEach(add_cname)
		}
	}
	/**
	 * @param {Element} target
	 * @returns {void}
	 */
	function detect_subtree_classes(target) {
		detect_class_attribute(target)
		for (let e of target.querySelectorAll("[class]")) detect_class_attribute(e)
	}
	/**
	 * @param {string} cname
	 * @returns {string}
	 */
	function get_priority(cname) {
		let i = cname.length - 1
		if (cname[i] != "!") return ""
		let prefix = "[class]"
		while (cname[--i] == "!") prefix += "[class]"
		return prefix
	}
	/**
	 * @param {string} cname
	 * @returns {number}
	 */
	function get_selector_end(cname) {
		let quote = ""
		let depth = 0
		for (let i = 0; i < cname.length; i++) {
			let c = cname[i]
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
		let i = substr.indexOf("=")
		return "(" + substr.slice(0, i) + ":" + substr.slice(i + 1) + ")"
	}
	/**
	 * @param {string} query
	 * @returns {string}
	 */
	function parse_query(query) {
		let char = query[0]
		query = char == "@"
			? query.slice(1)
			: "media " + query
		return "@" + query.replace(replace_space_regex, replace_space_handler)
			.replace(replace_and_regex, " and ")
			.replace(replace_condition_regex, parse_condition)
			.replace(
				replace_media_condition_regex,
				replace_media_condition_handler
			) + "{"
	}
	/**
	 * @param {string} cname
	 * @returns {string}
	 */
	function parse_value(cname) {
		let i = cname.length
		if (cname[--i] == "!") {
			while (cname[--i] == "!");
			cname = cname.slice(0, i + 1)
		}
		return replace_outside_parens(
			cname.replace(replace_space_regex, replace_space_handler)
				.replace(replace_colon_regex, replace_colon_handler)
				.replace(replace_shorthand_regex, replace_shorthand_handler)
				.replace(
					replace_default_unit_regex,
					replace_default_unit_handler
				),
			replace_var_regex,
			replace_var_handler
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
			let c = value[i]
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
		let tail = value.slice(start)
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
	style_sheet.setAttribute("click", "v2.0.0")
	dom.head.append(style_sheet)
	new MO(
		mr_list => {
			let size = classes.size
			for (let mr of mr_list) pending_elements.add(/** @type {Element} */(mr.target)/**/)
			for (let e of pending_elements) detect_class_attribute(e)
			pending_elements.clear()
			if (classes.size != size) click()
		}
	).observe(
		dom.documentElement,
		{ attributeFilter: [ "class" ], subtree: true }
	)
	new MO(
		mr_list => {
			let size = classes.size
			for (let mr of mr_list) collect_unique_top_nodes(/** @type {Element} */(mr.target)/**/)
			for (let e of pending_elements) detect_subtree_classes(e)
			pending_elements.clear()
			if (classes.size != size) click()
		}
	).observe(
		dom.documentElement,
		{ childList: true, subtree: true }
	)
}