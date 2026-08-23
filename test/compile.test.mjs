import { compile, declarations } from "./dom.mjs"
import assert from "node:assert/strict"
import { describe, it } from "node:test"
/** @param {Record<string, string>} cases */
function declares(cases) {
	for (const [ cname, expected ] of Object.entries(cases)) {
		it(
			cname + "  →  " + (expected || "(ignored)"),
			() => {
				const css = compile(cname)
				if (!expected) return assert.equal(css, "", "should be ignored")
				assert.notEqual(css, "", "no rule was generated")
				assert.equal(declarations(css), expected)
			}
		)
	}
}
describe(
	"a class that would break the sheet is dropped",
	() => {
		declares(
			{
				":not(.a/c=red": "",
				"[data-x=y/c=red": "",
				"bgi=url(a.png": "",
				"ct=\"a": "",
				"ct='a": "",
				"w=)": "",
				"w=100\\": "",
				"w=calc(1": ""
			}
		)
	}
)
describe(
	"a class with no value is left alone",
	() => {
		declares({ "container": "", "my-component": "" })
	}
)
describe(
	"custom properties",
	() => {
		declares(
			{
				"--gap=10;p=--gap": "--gap:10px;padding:var(--gap)",
				"bd=1_solid_--line": "border:1px solid var(--line)",
				"bd=var(--w)_solid_--line": "border:var(--w) solid var(--line)",
				"bgc=rgb(--r,--g,--b)": "background-color:rgb(--r,--g,--b)",
				"c=--fg": "color:var(--fg)",
				"t=anchor(--card_bottom)": "top:anchor(--card bottom)",
				"w=calc(--gap_*_2)": "width:calc(--gap * 2)",
				"w=calc(100%_-_--gap)": "width:calc(100% - --gap)"
			}
		)
	}
)
describe(
	"default unit",
	() => {
		declares(
			{
				"bd=1_solid_#000": "border:1px solid #000",
				"border-start-end-radius=8": "border-start-end-radius:8px",
				"br=8": "border-radius:8px",
				"fs=16": "font-size:16px",
				"g=10_20": "gap:10px 20px",
				"gtc=100_1fr": "grid-template-columns:100px 1fr",
				"h=100": "height:100px",
				"in=0": "inset:0px",
				"inset-inline-start=10": "inset-inline-start:10px",
				"ls=-1": "letter-spacing:-1px",
				"m=-10_0": "margin:-10px 0px",
				"max-height=100": "max-height:100px",
				"min-width=100": "min-width:100px",
				"outline=2_dashed_red": "outline:2px dashed red",
				"p=10": "padding:10px",
				"scroll-margin-block-end=10": "scroll-margin-block-end:10px",
				"text-shadow=1_1_2_#000": "text-shadow:1px 1px 2px #000",
				"w=100": "width:100px"
			}
		)
	}
)
describe(
	"escapes",
	() => {
		declares(
			{
				"--my\\_var=10px": "--my_var:10px",
				"bgi=url(/a.png?v\\=1)": "background-image:url(/a.png?v=1)",
				"bgi=url(/img/hero\\_bg.png)": "background-image:url(/img/hero_bg.png)",
				"c=--my\\_color": "color:var(--my_color)",
				"ct='a\\=b'": "content:'a=b'",
				"ct='a\\_b'": "content:'a_b'",
				"ff=Roboto_Mono": "font-family:Roboto Mono",
				"m=1px_5px": "margin:1px 5px"
			}
		)
	}
)
describe(
	"logical properties",
	() => {
		declares(
			{
				"bdi=1_solid_red": "border-inline:1px solid red",
				"border-block=1": "border-block:1px",
				"brbr=8": "border-bottom-right-radius:8px",
				"brtl=8": "border-top-left-radius:8px",
				"bs=100": "block-size:100px",
				"inset-block=10": "inset-block:10px",
				"inset-inline=10": "inset-inline:10px",
				"is=100": "inline-size:100px",
				"mah=100": "max-height:100px",
				"maw=100": "max-width:100px",
				"max-block-size=100": "max-block-size:100px",
				"mih=100": "min-height:100px",
				"min-inline-size=100": "min-inline-size:100px",
				"miw=100": "min-width:100px",
				"mx=10": "margin-inline:10px",
				"my=10": "margin-block:10px",
				"px=10": "padding-inline:10px",
				"py=10": "padding-block:10px"
			}
		)
	}
)
describe(
	"priority",
	() => {
		it(
			"a trailing ! stacks [class]",
			() => {
				assert.match(compile("w=100!"), /^\[class\]\./)
				assert.match(compile("w=100!!"), /^\[class\]\[class\]\./)
				assert.equal(compile("w=100!!").slice(-13), "{width:100px}")
			}
		)
		it(
			"no ! means no prefix",
			() => {
				assert.match(compile("w=100"), /^\./)
			}
		)
	}
)
describe(
	"properties that must not get a unit",
	() => {
		declares(
			{
				"-webkit-text-size-adjust=100%": "-webkit-text-size-adjust:100%",
				"ar=16/9": "aspect-ratio:16/9",
				"box-sizing=border-box": "box-sizing:border-box",
				"f=1": "flex:1",
				"font-size-adjust=0.5": "font-size-adjust:0.5",
				"fw=700": "font-weight:700",
				"grid-column-end=3": "grid-column-end:3",
				"grid-column-start=2": "grid-column-start:2",
				"grid-row-end=3": "grid-row-end:3",
				"grid-row-start=1": "grid-row-start:1",
				"lh=1.5": "line-height:1.5",
				"line-height=1.5": "line-height:1.5",
				"op=0.5": "opacity:0.5",
				"resize=none": "resize:none",
				"z=10": "z-index:10"
			}
		)
	}
)
describe(
	"quoted text is not a block, so it is kept",
	() => {
		declares(
			{
				"ct=\"it's\"": "content:\"it's\"",
				"ct='('": "content:'('",
				"ct=')'": "content:')'",
				"ct='['": "content:'['",
				"ct=']'": "content:']'",
				"ct='it\\'s'": "content:'it\\'s'",
				"ct='{'": "content:'{'"
			}
		)
	}
)
describe(
	"shorthands",
	() => {
		declares(
			{
				"absolute;t=0;l=0": "position:absolute;top:0px;left:0px",
				"c=red;bg=blue": "color:red;background:blue",
				"flex": "display:flex",
				"flex;jc=center": "display:flex;justify-content:center",
				"nowrap": "flex-wrap:nowrap",
				"row": "flex-direction:row",
				"tf=none": "transform:none",
				"tr=all_.2s": "transition:all .2s",
				"tt=uppercase": "text-transform:uppercase"
			}
		)
	}
)
describe(
	"the inside of parentheses passes through as written",
	() => {
		declares(
			{
				"bd=1_solid_rgb(0_0_0_/_.2)": "border:1px solid rgb(0 0 0 / .2)",
				"br=50%_/_20": "border-radius:50% / 20px",
				"bsd=0_2_4_rgb(0_0_0_/_.1)": "box-shadow:0px 2px 4px rgb(0 0 0 / .1)",
				"gtc=100_1fr_minmax(0,_1fr)": "grid-template-columns:100px 1fr minmax(0, 1fr)",
				"h=calc(100vh_-_var(--header-height))": "height:calc(100vh - var(--header-height))",
				"outline=2_solid_oklch(0.7_0.1_200)": "outline:2px solid oklch(0.7 0.1 200)",
				"p=env(safe-area-inset-bottom)": "padding:env(safe-area-inset-bottom)",
				"text-shadow=1_1_2_rgb(0_0_0_/_.5)": "text-shadow:1px 1px 2px rgb(0 0 0 / .5)",
				"w=calc((100%_-_10px)_/_2)": "width:calc((100% - 10px) / 2)",
				"w=calc(100%_-_16px)": "width:calc(100% - 16px)",
				"w=calc(100%_-_env(safe-area-inset-left))": "width:calc(100% - env(safe-area-inset-left))",
				"w=calc(100%_-_min-content)": "width:calc(100% - min-content)",
				"w=calc(100%_-_var(--gap))": "width:calc(100% - var(--gap))",
				"w=calc(min(10px,5%)_+_2px)": "width:calc(min(10px,5%) + 2px)"
			}
		)
	}
)
/**
 * @param {string} css
 * @returns {boolean}
 */
function leaves_block_open(css) {
	let quote = ""
	let depth = 0
	for (let i = 0; i < css.length; i++) {
		const c = css[i]
		if (c == "\\") i++
		else if (quote) {
			if (c == quote) quote = ""
		} else if (c == "'" || c == "\"") quote = c
		else if (c == "(" || c == "[" || c == "{") depth++
		else if (c == ")" || c == "]" || c == "}") depth--
	}
	return !!quote || depth != 0
}
describe(
	"; is an anchor, not a separator",
	() => {
		declares(
			{
				"bgi=url(a;b);w=10": "background-image:url(a;b);width:10px",
				"bgi=url(data:image/png;base64,iVBOR)":
					"background-image:url(data:image/png;base64,iVBOR)",
				"bgi=url(data:image/svg+xml;utf8,%3Csvg%3E)":
					"background-image:url(data:image/svg+xml;utf8,%3Csvg%3E)",
				"ct='1;2;3'": "content:'1;2;3'",
				"ct='a;B=c'": "content:'a;B:c'",
				"ct='a;b'": "content:'a;b'",
				"ct='a;b=c'": "content:'a;bottom:c'",
				"ct='a;b\\=c'": "content:'a;b=c'",
				"ct='a;b_c'": "content:'a;b c'",
				"ct='a;bbbbb=c'": "content:'a;bbbbb:c'",
				"ct='a;w=1'": "content:'a;width:1'",
				"ct='a\\3b_b=c'": "content:'a\\3b b:c'"
			}
		)
	}
)
describe(
	"a / inside a value does not start a declaration",
	() => {
		declares(
			{
				"bgi=url(/a/b=c.png)": "background-image:url(/a/b:c.png)",
				"bgi=url(/img/w=100/a.png)": "background-image:url(/img/w:100/a.png)",
				"br=50%/20%": "border-radius:50%/20%",
				"ct='a/b=c'": "content:'a/b:c'",
				"f=1_1_0/none": "flex:1 1 0/none",
				"gr=1_/_3": "grid-row:1 / 3"
			}
		)
	}
)
describe(
	"a class with unbalanced braces is dropped",
	() => {
		declares(
			{
				"ct='{'": "content:'{'",
				"ct='}'": "content:'}'",
				"ct=)(": "",
				"ct=][": "",
				"ct=a{b": "",
				"ct=a}b": "",
				"w=100}": ""
			}
		)
	}
)
describe(
	"a leading ~ is dropped even from a value with no number",
	() => {
		declares(
			{
				"--page=~#f8fafc": "--page:#f8fafc",
				"--page=~#f8fafc;bg=--page": "--page:#f8fafc;background:var(--page)",
				"bd=~1px_solid_#000": "border:1px solid #000",
				"bgi=~url(a.png)": "background-image:url(a.png)",
				"c=~#f00": "color:#f00",
				"c=~--muted": "color:var(--muted)",
				"ct='a_~b'": "content:'a ~b'",
				"d=~flex": "display:flex",
				"ff=a,~b": "font-family:a,~b",
				"ff=~system-ui,sans-serif": "font-family:system-ui,sans-serif"
			}
		)
	}
)
describe(
	"a media class with no style part is dropped",
	() => {
		declares(
			{
				"@@supports_display=grid@": "",
				"@color=red": "",
				"@sm@": ""
			}
		)
	}
)
describe(
	"a selector-shaped class with no top-level /",
	() => {
		declares(
			{
				"#id[a=b]": "#id[a:b]",
				":hover:focus": ":hover:focus",
				"[a=b]": "[a:b]",
				"[data-x=y]": "[data-x:y]"
			}
		)
	}
)
describe(
	"a value starting with ~ gets no default unit",
	() => {
		declares(
			{
				"border-image-width=2": "border-image-width:2px",
				"border-image-width=~2_3_4_5": "border-image-width:2 3 4 5",
				"ct='~'": "content:'~'",
				"ct='~1'": "content:'~1'",
				"grid-row-start=~2": "grid-row-start:2",
				"lh=~1.5": "line-height:1.5",
				"m=~-10_0": "margin:-10 0",
				"mask-border=~url(m.png)_30_/_20px": "mask-border:url(m.png) 30 / 20px",
				"p=~8_~16": "padding:8 16",
				"some-new-width=~2": "some-new-width:2",
				"stroke-width=~1.5": "stroke-width:1.5",
				"tab-size=4": "tab-size:4px",
				"w=100": "width:100px",
				"w=calc(100%_-_~2)": "width:calc(100% - ~2)",
				"w=~100": "width:100"
			}
		)
	}
)
describe(
	"comma-separated values get the default unit too",
	() => {
		declares(
			{
				"background-size=100_100,cover": "background-size:100px 100px,cover",
				"bsd=0_2_4_#000,0_1_2_#111": "box-shadow:0px 2px 4px #000,0px 1px 2px #111",
				"bsd=~0_2,0_1": "box-shadow:0 2,0 1",
				"text-shadow=1_1_#000,2_2_#111": "text-shadow:1px 1px #000,2px 2px #111"
			}
		)
	}
)
describe(
	"common length properties get the default unit too",
	() => {
		declares(
			{
				"background-position=10_20": "background-position:10px 20px",
				"flex-basis=100": "flex-basis:100px",
				"grid-auto-columns=100": "grid-auto-columns:100px",
				"grid-auto-rows=100": "grid-auto-rows:100px",
				"object-position=10_20": "object-position:10px 20px",
				"outline-offset=2": "outline-offset:2px",
				"perspective=800": "perspective:800px",
				"text-indent=10": "text-indent:10px",
				"text-underline-offset=2": "text-underline-offset:2px",
				"translate=10_20": "translate:10px 20px"
			}
		)
	}
)
describe(
	"neighbours where a unitless number is normal are left alone",
	() => {
		declares(
			{
				"absolute": "position:absolute",
				"ar=16/9": "aspect-ratio:16/9",
				"border-image-outset=2": "border-image-outset:2",
				"columns=2_100": "columns:2 100",
				"f=1_1_0": "flex:1 1 0",
				"fg=2": "flex-grow:2",
				"order=2": "order:2",
				"stroke-dasharray=4_2": "stroke-dasharray:4 2",
				"stroke-dashoffset=4": "stroke-dashoffset:4",
				"tf=translate(10px,20px)": "transform:translate(10px,20px)",
				"transform=translate(10px,20px)": "transform:translate(10px,20px)",
				"z=10": "z-index:10"
			}
		)
	}
)
describe(
	"no class leaves the sheet open",
	() => {
		const corpus = [
			"[a=b]",
			"[data-x=y]",
			"#id[a=b]",
			"[a=b]/c=red",
			"[href='/docs']/c=red",
			":not(.a/b)/c=red",
			"ct='('",
			"ct=')'",
			"ct='['",
			"ct=']'",
			"ct='{'",
			"ct='}'",
			"ct=\"it's\"",
			"ct='it\'s'",
			"w=calc(100%_-_var(--gap))",
			"bgi=url(a(b).png)",
			"@sm@[a=b]",
			"@sm@:hover/c=red",
			"w=100!!",
			"bd=1_solid_rgb(0_0_0_/_.2)",
			"gtc=repeat(auto-fill,_minmax(200,_1fr))",
			">div/c=red",
			"flex"
		]
		for (const cname of corpus) {
			it(
				cname,
				() => {
					const css = compile(cname)
					assert.ok(
						!leaves_block_open(css),
						"ends with a block still open: " + JSON.stringify(css)
					)
				}
			)
		}
	}
)
describe(
	"properties the README lists as getting the default unit or not",
	() => {
		declares(
			{
				"--gap=12": "--gap:12px",
				"border-top-width=2": "border-top-width:2px",
				"fs=16": "font-size:16px",
				"fw=600": "font-weight:600",
				"g=4-2": "gap:4-2",
				"lh=2": "line-height:2",
				"ml=-4_0": "margin-left:-4px 0px",
				"op=0": "opacity:0",
				"order=-1": "order:-1",
				"outline-offset=-1": "outline-offset:-1px",
				"scroll-padding-left=4": "scroll-padding-left:4px",
				"stroke-width=2": "stroke-width:2",
				"t=-14": "top:-14px",
				"t=-14px": "top:-14px",
				"z=2": "z-index:2"
			}
		)
	}
)
describe(
	"properties whose name matches the unit list but whose value is unitless",
	() => {
		declares(
			{
				"border-image-width=~2": "border-image-width:2",
				"border-inline-start-width=2": "border-inline-start-width:2px",
				"border-top-width=2": "border-top-width:2px",
				"border-width=2": "border-width:2px",
				"column-rule-width=2": "column-rule-width:2px",
				"grid-row-start=2": "grid-row-start:2",
				"line-height=1.5": "line-height:1.5",
				"mask-border-width=~2": "mask-border-width:2",
				"max-width=2": "max-width:2px",
				"min-width=2": "min-width:2px",
				"outline-width=2": "outline-width:2px",
				"stroke-width=1.5": "stroke-width:1.5",
				"tab-size=~4": "tab-size:4",
				"width=2": "width:2px"
			}
		)
	}
)
describe(
	"the default unit reaches a number before !important",
	() => {
		declares(
			{
				"flex!important": "display:flex!important",
				"lh=1.5!important": "line-height:1.5!important",
				"m=0_auto!important": "margin:0px auto!important",
				"p=10!important": "padding:10px!important",
				"w=100px!important": "width:100px!important",
				"w=~100!important": "width:100!important"
			}
		)
	}
)
describe(
	"value transforms do not reach into nested parentheses",
	() => {
		declares(
			{
				"gtc=repeat(2,_minmax(0,_1fr))_100":
					"grid-template-columns:repeat(2, minmax(0, 1fr)) 100px",
				"p=calc(min(1px,2px))_10": "padding:calc(min(1px,2px)) 10px",
				"w=calc(min(1px,2px)_+_--gap)": "width:calc(min(1px,2px) + --gap)",
				"w=calc(min(1px,2px)_+_2_+_3px)": "width:calc(min(1px,2px) + 2 + 3px)",
				"w=calc(var(--a)_+_--b)": "width:calc(var(--a) + --b)",
				"w=calc(var(--gap)_*_2_+_4px)": "width:calc(var(--gap) * 2 + 4px)"
			}
		)
	}
)