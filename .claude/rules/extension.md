---
paths:
  - extension/**
---

`src/index.js` activates two features; the rest are helpers. `helper/compile_style.js` is a second copy of the library pipeline for hover previews, `helper/parse_dom.js` picks a `dom-eater` parser by file extension, `helper/get_config.js` reads the shorthand Maps from VSCode settings.

Duplication that `test/parity.test.mjs` enforces:

- The three shorthand Maps in `package.json` under `click-css.custom.*` equal `src/click-css.js`, and `default_unit` in `helper/get_config.js` equals the library's; both are compared directly.
- `helper/compile_style.js` emits the same declarations and at-rule preludes as the library. Selector notation differs on purpose (the extension writes `&` where the class goes), and the hover output is HTML, so `<` must be escaped.

The minimum VSCode version lives in four places that `test/build.test.mjs` compares; `.claude/skills/release` lists them.

- Recognised attribute names: `class`, `className`, `classs`.
- In `.cshtml` and `.razor` files a media token is written `@@sm@@`, because Razor reads `@@` as one `@`. Non-Razor files and nested C# strings keep `@@` as-is.
- Pug attribute values are in scope (including a Vue `pug` template); a Pug class literal (`.foo`) is not.
- Markdown is parsed once per region, never as one document: `mask_markdown` returns one full-length copy per markup fence plus one for prose, each keeping only its own region and spacing out the rest, so offsets stay absolute and an unbalanced snippet (open `<style>`, open `<!--`, open quote) cannot swallow the fences after it. Every other fence and every inline code span is spaced out everywhere. The copies are ordered by where their kept region ends, so the one holding the cursor is last and completion's `last_element` finds it.
- Rollup bundles to ESM `out/index.js` (VS Code loads ESM extensions from 1.100, so the floor stays there or higher) and `vsce package --no-dependencies` ships nothing from `node_modules`, so `dom-eater` must resolve at build time. `vscode` stays external: the extension host supplies it to `import`.
