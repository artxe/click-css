---
paths:
  - docs/**
---

GitHub Pages serves `docs`, which is also where the built `min.js` lives. `min.js` is generated, never edit it; `build.test.mjs` compares it with the source.

`index.html` is styled with Click CSS itself; `app.css` holds only two `@keyframes`.

The preview is a sandboxed `srcdoc` iframe (`sandbox="allow-scripts"`, opaque origin) with its own copy of `min.js`. Two frames alternate so a rebuild does not flash, the frame posts its compiled CSS back with `postMessage`, and the chosen `THEME` reaches it through a `localStorage` shim injected into `<head>` because the sandbox has no storage. Removing `script`, `iframe`, `object`, `embed`, `base` and `meta`, event-handler and `srcdoc` attributes, and `javascript:` URLs before injection is defence in depth, not the boundary.
