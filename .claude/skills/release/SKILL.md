---
name: release
description: Move a Click CSS version number, whether the library/extension release version, the minimum VSCode version, or the browser floor. Use when cutting a release or bumping any of those, because each is written in several files that the tests compare against each other.
---

# Release

## Release version

1. `package.json` → `version`
2. `extension/package.json` → `version`
3. `src/click-css.js` → `style_sheet.setAttribute("click", "v<new>")`
4. `CHANGELOG.md` → a `## <new>` section; breaking changes first, each with its migration spelled out
5. `pnpm build` regenerates `docs/min.js` and the extension bundle; `build.mjs` throws if the stamp and the root `package.json` disagree
6. `pnpm test`: `build.test.mjs` re-asserts the stamp and that `min.js` compiles like the source

`docs/min.js` is committed; the `.vsix` is not.

## Minimum VSCode version

All four or `build.test.mjs` fails:

- `extension/package.json` → `engines.vscode`: `^X.Y.Z`
- `extension/package.json` → `devDependencies["@types/vscode"]`: exact `X.Y.Z`, no range, or `tsc` accepts API the floor lacks
- `extension/package.json` → `scripts.latest`: `pnpm i @types/vscode@X.Y.Z`, which undoes the bump `pnpm up --latest` makes
- `extension/README.md` → "VS Code X.Y or newer"

## Browser floor

Raising the floor (CLAUDE.md invariants) is a breaking change; list it under **Breaking** in `CHANGELOG.md`.
