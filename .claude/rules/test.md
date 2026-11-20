---
paths:
  - test/**
---

Test names and failure messages are English.

`click-css.js` is not an ES module, so `vitest.config.js` wraps `src/click-css.js?factory` in a function that `dom.js` calls once per `load()`. `build.test.js` also runs the unwrapped source as a classic script against the same corpus. Unreachable code is deleted, never ignored.

`dom.js` is the only stub boundary: `click-css.js` runs verbatim, a `MutationObserver` stub captures the two callbacks the library registers, elements are stubs with `getAttribute` and `querySelectorAll` (`via_insertion` parses HTML and decodes entities first, as a browser would), and a test pushes classes through the real entry points and reads the real `<style>` back. `CSS.escape` is reimplemented there because Node has none, so selector assertions sit in `selector.test.js` only and `compile.test.js` asserts declarations.

| file | covers |
|---|---|
| `compile.test.js` | declarations per token, through both collection paths |
| `selector.test.js` | selector text and escaping |
| `collect.test.js` | attribute-change path vs inserted-markup path; entity decoding, which the stub's `parse_html` does as a browser would; a repeated `class` string is split once |
| `parity.test.js` | library vs `extension/src/helper/compile_style.js` over a token corpus; the extension's settings defaults and `default_unit` equal the source |
| `vsce.test.js` | extension parser routing, highlighter, completion |
| `build.test.js` | `docs/min.js` matches the source; version stamp; extension version equals the root; VSCode floor; README size bounds hold |

`parity.test.js` and `vsce.test.js` load the extension's own source: `vitest.config.js` aliases `vscode` to `test/vscode.js`, which re-exports the `globalThis.__vscode_mock` each test file sets, and the shorthand Maps come from `extension/package.json` defaults, so `dom-eater` must be installed for `extension`. `vsce.test.js` captures the editor and document listeners to drive the highlighter with fake timers.

A new token wants a case in `compile.test.js`, plus the `parity.test.js` corpus whenever the extension can show it in a hover.
