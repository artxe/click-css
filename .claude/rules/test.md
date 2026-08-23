---
paths:
  - test/**
---

Test names and failure messages are English; comments are type-only.

`dom.mjs` is the only stub boundary: `click-css.js` runs verbatim, a `MutationObserver` stub captures the two callbacks the library registers, elements are stubs with `getAttribute` and `querySelectorAll` (`via_insertion` parses HTML and decodes entities first, as a browser would), and a test pushes classes through the real entry points and reads the real `<style>` back. `CSS.escape` is reimplemented there because Node has none, so selector assertions sit in `selector.test.mjs` only and `compile.test.mjs` asserts declarations.

| file | covers |
|---|---|
| `compile.test.mjs` | declarations per token, through both collection paths |
| `selector.test.mjs` | selector text and escaping |
| `collect.test.mjs` | attribute-change path vs inserted-markup path; entity decoding, which the stub's `parse_html` does as a browser would; a repeated `class` string is split once |
| `parity.test.mjs` | library vs `extension/src/helper/compile_style.js` over a token corpus; the extension's settings defaults and `default_unit` equal the source |
| `vsce.test.mjs` | extension parser routing, highlighter, completion |
| `build.test.mjs` | `docs/min.js` matches the source; version stamp; extension version equals the root; VSCode floor; README shorthand lists and reset block match the source; README size bounds hold |

`parity.test.mjs` and `vsce.test.mjs` load the extension's own source: `registerHooks` resolves `vscode` to a mock and the shorthand Maps come from `extension/package.json` defaults, so `dom-eater` must be installed for `extension`.

A new token wants a case in `compile.test.mjs`, plus the `parity.test.mjs` corpus whenever the extension can show it in a hover.
