---
name: Michidoku site change
description: Use when editing any Michidoku landing page, CSS, theme, navigation, shared header/footer, metadata, or static route. Covers the page map, theme boot invariants, and a structural verification script.
---

# Michidoku site change

## Workflow

1. Read `references/page-map.md` and the repository `AGENTS.md`.
2. Identify every page that shares the markup or behavior you are changing.
   There are no partials or templates; update each page explicitly.
3. Keep the theme boot script inline in `<head>` and preserve the
   `michidoku-theme` storage key and `data-theme="claro|noche"` values.
4. Put landing styles in `styles.css`. Use `legal.css` only for `/caso/` and
   legal pages; it is loaded after `styles.css` to reuse its tokens.
5. Run the structural check from the repository root:

   ```bash
   node .opencode/skills/site-change/scripts/check-site.mjs
   ```

6. Serve from the repository root and verify the affected routes in a browser:

   ```bash
   python -m http.server 8080
   ```

   Check `/`, `/caso/?size=6&seed=123`, `/privacidad/`, `/terminos/`, and
   `/404.html` as applicable.

## Rules

- Do not introduce a build step, package manager, framework, or bundler for a
  normal content/style edit.
- Do not move scripts out of their established order: `cats.js` must load
  before `app.js` and before `caso/caso.js`.
- Do not replace root-absolute paths in `404.html`; it can be served from any
  missing URL.
- Keep accessible names, focus behavior, skip links, and live regions intact.
- Keep reduced-motion behavior: update both CSS files and guard new JS motion.
- If the change adds a public route, update `sitemap.xml` and the page map in
  `references/page-map.md`.
- If the change affects shared branding or navigation, inspect `404.html`,
  `caso/index.html`, `privacidad/index.html`, and `terminos/index.html`, not
  just `index.html`.
