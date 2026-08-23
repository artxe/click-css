# Click CSS — working notes

`src/click-css.js` is the whole library: one top-level block, no imports, no build step for consumers. README.md is the user spec and links `click-css.js` by line number, so fix those links when lines move.

| path | contents |
|---|---|
| `src` | `click-css.js`, the source of truth |
| `test` | node:test suites over the real source |
| `extension` | VSCode extension `Artxe.intellisense-click-css`; ESM source bundled to ESM `out/index.js`, loaded by VS Code 1.100 or newer |
| `docs` | GitHub Pages playground; `pnpm build` writes `min.js` there |

```bash
pnpm test    # node --test over the real source, both collection paths + extension parity
pnpm build   # terser → docs/min.js, then the extension bundle; version stamp checked
pnpm lint    # eslint --fix (one root config, extension included), tsc, tsc -p extension
```

Root and `extension` share one version number; moving any version number follows `.claude/skills/release`.

## Invariants

- `click` is a bare global. Never make `click-css.js` a module or add `import`/`export`: strict mode throws and the rebuild hook disappears.
- The three shorthand Maps and `default_unit` are duplicated for the extension, and `extension/src/helper/compile_style.js` is a second copy of the pipeline. `parity.test.mjs` fails on drift.
- README lists the three shorthand Maps and prints `reset_style` verbatim; `build.test.mjs` fails on drift.
- Browser floor Chrome 80 / Firefox 78 / Safari 16.4, set by optional chaining, `matchAll` and regex lookbehind (`replace_default_unit_regex`, `replace_condition_regex`, `replace_var_regex`). Raising it is a breaking change.
- Value transforms (unit, `var()`) never reach past a `(`. That keeps `--header-height` and friends intact.

## Style

Tabs, no semicolons, `snake_case`, `let` everywhere (`prefer-const` off), JSDoc types under `checkJs` + `strict`. No prose comments in `src`, `test`, `extension/src` or configs: only type tags, casts and directives. Ambient types live in `private.d.ts`. eslint-plugin-lube; `lube/pretty-sequence` at maxLength 50 outside `extension`. A named helper is a `function` declaration, not an arrow assigned to a binding (`func-style`), which costs `docs/min.js` about 230 B against the README's 7 KB bound.
