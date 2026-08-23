# Changelog

## 2.0.0

### Breaking

- **Only an attribute named exactly `class` is collected.** `data-class="row"` and a framework
  binding such as `:class="…"` were compiled too, so `.row` could pick up a `flex-direction`
  nobody asked for. A page that leaned on that loses those rules: write the tokens in `class`,
  or, for a binding that Vue or Alpine renders into `class` anyway, nothing changes.
- **`inset` moves from `i` to `in`.** A one-letter code is the tier a property earns by being
  written constantly — `c`, `d`, `w`, `h`, `m`, `p`, and `t` / `r` / `b` / `l` for the physical
  offsets. `inset` is the logical property those four are usually written instead of, so it sits
  a tier down with the other two-letter codes. Rename `i=` to `in=`; nothing else changes.

  | old | new | property |
  |---|---|---|
  | `i` | `in` | `inset` |
- VSCode extension: requires VS Code 1.100 or newer, the first release that loads an extension
  written as an ES module. On an older VS Code, stay on the previous extension version.

### Fixed

- A leading `~` is dropped from every value, not only from one that starts with a number.
  `c=~#f00` produced `color:~#f00` and `--page=~#f8fafc` an unusable variable, though the README
  called `~` harmless anywhere. `c=~--muted` also skipped the `var()` wrap and now gets it.
- The README carries the full shorthand lists, the reset, the default unit's property matcher,
  how specificity decides between tokens (never the order rules land in the sheet, which in a
  single-page app depends on the pages visited) and the fact that every build reads `THEME`, so
  the spec no longer sends readers to the source. It also stops mentioning operator spacing, a
  transform that no longer exists, and says outright that a negative value is written as is.
- Nested parentheses no longer leak the value transforms. The skip saw one level only, so
  `w=calc(var(--gap)_*_2_+_4px)` produced `calc(var(--gap) * 2px + 4px)` and
  `w=calc(min(1px,2px)_+_--gap)` wrapped `--gap` in `var()`, while the unnested
  `w=calc(100%_-_--gap)` left it alone. Both now keep everything past the first `(` as written,
  which is what 1.1.0 promised.
- The default unit reaches a number that sits before `!important` or after a comma.
  `p=10!important` produced `padding:10!important` and `bsd=0_2_4_#000,0_1_2_#111` left the
  second shadow's first `0` bare — invalid either way, so the browser dropped the declaration.
- A `/` inside a value no longer starts a declaration. Only `^` and `;` anchor a shorthand, so
  `bgi=url(/img/w=100/a.png)` produced `url(/img/width:100/a.png)` and `f=1_1_0/none` produced
  `flex:1 1 0/display:none`. A property name can only follow `^` or `;`, so the `/` anchor
  matched inside values and nowhere else.
- `\=` in a selector is the literal `=` the grammar promises. `[data-x\=1]/c=red` emitted
  `[data-x\=1]`, an attribute *named* `data-x=1`, so the rule matched nothing; the escape was
  only undone on the value side.
- Media condition shorthands are read inside a comma-separated query list. `@sm,print@w=100`
  produced `@media sm,print`, which matches nothing.
- A media class with no second `@` is dropped instead of compiling. `@color=red` produced
  `@media (color:re){…{@color:red}}`.
- An unbalanced `{`, and any closing bracket that arrives before its opener, are caught by the
  same guard as `(` and `[`. `ct=a{b` compiled to `{content:a{b}` and swallowed every rule
  written after it.
- A class holding U+00A0 compiles wherever it appears. It compiled when set on an element that
  was already on the page and vanished when the element arrived in new markup, because the
  character was decoded before the attribute was split on whitespace.
- `THEME` set to anything but `DARK` or `LIGHT` follows the OS again. A third value such as
  `SYSTEM` rewrote every `prefers-color-scheme:dark` query to `@media ()`, which never matches.
- VSCode extension: the hover preview carries all of the above, and drops the classes the
  library drops.
- VSCode extension: `.md` and `.markdown` are read as Markdown rather than as one HTML
  document. Only fenced `html`, `htm`, `xml`, `svelte`, `vue` and `astro` blocks, plus prose
  outside code spans, reach the parser, so a `<script>` or `<style>` written inside backticks no
  longer opens an element that swallows the rest of the file. In this README every class after
  the first code block went unhighlighted.
- VSCode extension: a newline separates class tokens. A `class` attribute written over several
  lines was read as one long token, so none of it was underlined.

### Added

- Classes are collected by reading `class` attributes (`querySelectorAll("[class]")` under
  inserted markup) instead of serializing it to `outerHTML`, and a `class` string already seen
  is not split again. Serializing repeated the whole document's text at every parser chunk, so
  page load spent several times longer in script on large pages; re-rendering repeated markup
  also costs about half as much.
- The default unit reaches nine more length properties, each one a place where a bare number is
  invalid and the missing `px` showed up as a silently ignored declaration: `text-indent`,
  `flex-basis`, `perspective`, `translate`, `grid-auto-columns` / `grid-auto-rows`, and anything
  ending in `-offset`, `-origin` or `-position` — `outline-offset`, `text-underline-offset`,
  `transform-origin`, `background-position`, `object-position`. Properties whose bare number is
  the ordinary spelling are still never matched: `scale`, `rotate`, `columns`,
  `border-image-slice` / `-outset`, `stroke-dasharray` / `-dashoffset`, `offset-distance`.
- Twenty-four more property shorthands, each a property written often enough to be worth two or
  three letters: `bgp` / `bgr` / `bgs` (`background-position` / `-repeat` / `-size`), `bdw` /
  `bds` (`border-width` / `-style`), `csm` (`color-scheme`), `fb` (`flex-basis`), `fst`
  (`font-style`), `ga` / `gaf` / `gta` (`grid-area`, `grid-auto-flow`, `grid-template-areas`),
  `gx` / `gy` (`column-gap` / `row-gap`, following the axis of `mx` / `my` and `ox` / `oy`),
  `ji` / `js` (`justify-items` / `justify-self`), `od` (`order`), `ow` (`overflow-wrap`), `pcc` /
  `pcs` (`place-content` / `place-self`, beside `pci`), `rt` / `sc` / `tl` (`rotate`, `scale`,
  `translate`, the individual transform properties), `to` (`text-overflow`) and `vs`
  (`visibility`). A property that has no shorthand was never blocked and still is not: write its
  full name. `min.js` grows to 7.5 KB, so the README bound on the raw file is 8 KB; gzip stays
  under 3 KB as before.
- Value shorthands `inline-block` (`display:inline-block`) and `wrap-reverse`
  (`flex-wrap:wrap-reverse`), the members their sets were missing beside `block` / `inline` and
  `nowrap` / `wrap`. Nothing else joins the bare-word layer: every one of these names is a class
  name nobody can use for anything else, so it is spent only on a value written constantly and
  spelled in a way no one would pick by hand. A value that has no bare word is written as a
  declaration, which is two characters longer: `d=inline-flex`.
- Media condition shorthands `coarse` (`pointer:coarse`) and `portrait`
  (`orientation:portrait`), the partners of `fine` and `landscape`. Written before, they fell
  through as media types: `@coarse@c=red` compiled to `@media coarse`, which matches nothing, so
  the rule quietly did nothing.

## 1.1.0

### Breaking

- **`calc()` no longer inserts operator spacing.** Write the spaces with `_`:
  `calc(100%-16px)` → `calc(100%_-_16px)`. The old form reaches CSS unchanged and is rejected
  silently, so audit every class containing `calc(` without `_`. This is what lets hyphenated
  identifiers survive: `calc(100vh-var(--header-height))` used to become
  `calc(100vh - var(- - header - height))`.
- **Parentheses stop the value transforms.** Neither the default unit nor `var()` wrapping
  reaches past a `(`: `calc(100%_-_16)` stays `calc(100% - 16)` and `calc(100%_-_--gap)` stays
  `calc(100% - --gap)` — write `16px` and `var(--gap)` yourself. Previously a `--name` after a
  space or comma was wrapped even inside a function, so `rgb(--r,--g,--b)` treated its first
  argument differently from the other two. The `_` and `=` aliases are character-level and
  still apply everywhere, parentheses included.
- **Safari 13.1+ → Safari 16.4+.** The property matcher now uses regex lookbehind. Chrome stays
  at 80; Firefox moves 74 → 78, since optional chaining and `matchAll` already set the floor.
- **Property shorthands were reorganised.** A family shares one prefix, and a member you reach
  for constantly keeps its own anchor — `border-radius` stays `br` while its corners move under
  it. Rename these:

  | old | new | property |
  |---|---|---|
  | `bblr` | `brbl` | border-bottom-left-radius |
  | `bbrr` | `brbr` | border-bottom-right-radius |
  | `btlr` | `brtl` | border-top-left-radius |
  | `btrr` | `brtr` | border-top-right-radius |
  | `mi` | `mx` | margin-inline |
  | `pi` | `px` | padding-inline |
  | `tt` | `tr` | transition |

  `tt` now means `text-transform`, so the text family reads `ta` `td` `ts` `tt` `tw`, and
  `tf` / `tr` pair transform with transition. Five shorthands were dropped — spell the property
  out: `at` accent-color, `cv` content-visibility, `ji` justify-items, `pc` place-content,
  `v` visibility.

### Fixed

- `line-height`, `stroke-width`, `grid-row-start/end` and `grid-column-start/end` no longer get
  `px` appended. `lh=1.5` produced `line-height:1.5px`; `stroke-width=1.5` rendered at the wrong
  thickness in any SVG with a scaled `viewBox`. Audit bare numbers written for these — the
  meaning changes rather than breaking loudly: `lh=24` was `line-height:24px` and is now
  `line-height:24`, twenty-four times the font size. `tab-size`, `border-image-width` and
  `mask-border-width` take a bare number too and use the new `~` marker instead of a name rule.
- Numbers inside function arguments are left alone. `bd=1_solid_rgb(0_0_0_/_.2)` produced
  `rgb(0 0px 0px / .2)`.
- A `/` inside quotes, `()` or `[]` no longer splits selector from style.
  `[href='/docs']/c=red` produced `[href='{docs']/color:red}`.
- Class tokens collected while the page is parsing are decoded before use. Attribute
  serialization escapes `&`, `<`, `>`, `"` and U+00A0, so `@sm&dark@c=red` and
  `@(400px<=width<=700px)@w=100` only worked after the class attribute was mutated.
- Quoted text is no longer treated as a block, so `ct='('` and `ct="it's"` are kept. An
  unclosed `[` is now caught.
- A selector-shaped class with no `/` no longer loses its last character, which could leave the
  stylesheet open and swallow every rule after it.
- VSCode extension: the hover preview emitted unescaped `<`, breaking range queries.
- VSCode extension: the hover preview lost its colours from the first `;` inside a value, so
  `ct='a;b'` and data URIs previewed wrong. Declarations are now separated by the same quote-
  and bracket-aware scan the library uses.
- VSCode extension: the hover preview dropped the `&` when a media query carried plain
  declarations — `@max-width=820px@gtr=50px` previewed as
  `@media (max-width:820px) { { grid-template-rows: 50px } }`.
- VSCode extension: the selector underline stopped at the first `/`, so `[href='/docs']/color=red`
  was underlined as far as `[href='/`. An escaped `\=` is no longer underlined as a separator.
- VSCode extension: activates on `onStartupFinished` instead of five languages, so Astro, PHP,
  Markdown, Handlebars, Liquid, Twig, ERB, Blade and markup inside JS/TS template literals work.
- VSCode extension: `engines.vscode` was `^1.45.0` while calling `MarkdownString.supportHtml`
  (added in 1.62). The floor is now `^1.62.0`, with `@types/vscode` pinned exactly.

### Added

- `~` at the start of a value leaves its numbers without the default unit: `w=~100` is
  `width: 100`, `border-image-width=~2_3_4_5` is `border-image-width: 2 3 4 5`. Written once per
  value, and read whether or not a unit was going to be appended, so it is harmless on
  `line-height`. It also lets a brand-new CSS property be styled without waiting on a release.
- `\_` and `\=` escape to a literal `_` and `=`: `bgi=url(/img/hero\_bg.png?v\=2)`.
- Media Queries Level 4 range syntax: `@(width>=640px)@w=100`, `@(400px<=width<=700px)@w=100`.
- The default unit applies to `inline-size` / `block-size`, `border-inline` / `border-block`,
  `inset-inline` / `inset-block` and their longhands. `bdi=1_solid_red` produced
  `border-inline:1 solid red`.
- Shorthands `miw`, `maw`, `mih`, `mah` (min/max width and height), `my` / `py`
  (`margin-block` / `padding-block`) and `tt` (`text-transform`).
- `pnpm build` — terser, writes `packages/lib/min.js` and `docs/min.js`, fails if the version
  stamp disagrees with `package.json`.
- `pnpm test` — 288 tests over the real `click-css.js` through both collection paths, plus
  parity against the VSCode extension's copy of the pipeline.
- The build is published at `https://artxe.github.io/click-css/min.js` for trying the library in
  a `<script>` tag. Not a release channel: the URL carries no version and serves whatever `main`
  last built. Copy the file into your project before you ship.

## 1.0.0

- Renamed to Click CSS.
