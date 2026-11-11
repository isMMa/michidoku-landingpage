# Page map

| Route / file | Language | Scripts | Theme boot | CSS |
| --- | --- | --- | --- | --- |
| `/` `index.html` | Spanish | `cats.js` → `app.js` → `pwa.js` (`defer`) | localStorage only | `styles.css` |
| `/caso/` `caso/index.html` + `caso/caso.js` | ES/EN | `../cats.js` → `caso.js` → `../pwa.js` (`defer`) | localStorage, `?tema=claro\|noche`, OS preference | `styles.css`, `legal.css` |
| `/privacidad/` `privacidad/index.html` | ES/EN | `../legal.js` → `../pwa.js` (`defer`) | localStorage, `?tema=claro\|noche`, OS preference | `styles.css`, `legal.css` |
| `/terminos/` `terminos/index.html` | ES/EN | `../legal.js` → `../pwa.js` (`defer`) | localStorage, `?tema=claro\|noche`, OS preference | `styles.css`, `legal.css` |
| `/404.html` `404.html` | Spanish | `/cats.js` (synchronous) + inline render, `/pwa.js` (`defer`) | localStorage only | `styles.css` |
| `/offline.html` `offline.html` | Spanish | none (self-contained) | localStorage only | inline |
| `/privacidad.html` | — | inline redirect to `privacidad/` | — | — |

## Shared markup

- Landing header/nav/footer live in `index.html` and `404.html` (landing
  variant).
- Case and legal pages share the simplified `page-header` / `page-footer`
  structure.
- Brand asset: `assets/logo.png` (transparent adaptive icon); padded app/OG
  image: `assets/icon.png`. `assets/michidoku-icon.svg` is kept as legacy art. Social preview: `assets/og-image.png` (1200×630).
- `/caso/` is `noindex, follow` and intentionally excluded from `sitemap.xml`.

`/caso/` is `noindex, follow` because its content is query-driven; it is
intentionally absent from `sitemap.xml`. `/404.html` and the
`privacidad.html` redirect are also noindex.

## /caso contract

- Query parameters: `size` exactly `4`, `6`, or `8`; `seed` non-negative safe
  integer written as 1–16 digits.
- Deep link: `michidoku://caso?size=<size>&seed=<seed>`.
- Validation lives in `caso/caso.js` (`normalizarTamano`,
  `normalizarSemilla`). Keep it aligned with the game app.
- The page attempts the app once per session on mobile, then shows fallback
  instructions; desktop shows instructions immediately.

## Known i18n gap to re-check

Current `/caso/` markup has `data-i18n="eyebrow"` but `TEXTOS` has no
`eyebrow` key, and `#caso-lead` is not filled by `caso.js`. Do not assume every
visible string on `/caso/` switches language; verify before relying on it.

## Theme

- Attribute: `data-theme="noche"` (default) or `data-theme="claro"`.
- Landing selector modes: `claro`, `noche`, `auto` stored in
  `michidoku-theme-mode`; mode `auto` follows the OS preference.
- Resolved theme storage key (shared with other pages): `michidoku-theme`.
- `?tema=claro|noche` takes precedence on `/caso/` and legal pages.
- `index.html` and `404.html` restore the saved mode (default `auto`) before
  paint; legal/case pages restore the resolved saved theme.
- Theme-color meta is updated by `app.js`; the initial values are in each
  page's `<head>`.
