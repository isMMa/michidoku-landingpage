# AGENTS.md

## Repo facts

Static, dependency-free landing page for **Michidoku**, published to GitHub Pages at `https://michidoku.devcodelight.com`. There is no build step, package manager, test suite, lint, or formatter. The repository root is the deployable site.

## Commands

```bash
# Serve from the repo root (required for directory routes and absolute paths)
python -m http.server 8080

# Fast syntax check after editing JS
node --check app.js && node --check cats.js && node --check caso/caso.js && node --check legal.js && node --check sw.js && node --check pwa.js

# Structural checks (manifest, icons, theme boot, sitemap, PWA wiring)
node .opencode/skills/site-change/scripts/check-site.mjs
```

Manual browser checks are the real verification. Exercise `/`, `/caso/?size=6&seed=123`, `/privacidad/`, `/terminos/`, `/404.html`, theme toggle, mobile nav, and the cat generator. Do not use `file://`; `/caso` and `/404.html` rely on server routing/root-absolute paths.

Deployment is automatic: push to `main` runs `.github/workflows/deploy.yml` (`rsync` the repo into `_site`, then deploy Pages). Anything at the repo root is public except `.git`, `.github`, `_site`, and `README.md`; never add secrets.

## Structure and wiring

- `index.html` + `app.js` + `styles.css`: main landing, interactions, and visual system.
- `cats.js`: shared deterministic cat-DNA/SVG generator, exposed as `window.MichidokuCats` and also `module.exports`. Load it before `app.js` / `caso/caso.js`; `404.html` loads it synchronously.
- `caso/`: shared-case fallback. Reads `?size=` and `?seed=`, then tries `michidoku://caso?...`.
- `privacidad/`, `terminos/`: legal pages using `legal.css` + `legal.js`; `privacidad.html` is a redirect kept for old links.
- `manifest.webmanifest` + `sw.js` + `pwa.js` + `offline.html`: PWA. `pwa.js` is registered on every page (resolve `sw.js` from its own URL); `sw.js` precaches the app shell and falls back to `offline.html`. Icons live in `assets/` (`icon-192`, `icon-512`, `icon-maskable-*`, `apple-touch-icon`).
- No templating or partials: header/footer/brand markup and page metadata are duplicated per HTML file. Update every affected page, including `404.html`, when changing shared navigation or branding.
- Subdirectory pages use `../` paths; `404.html` uses root-absolute paths (it can be served from any missing URL).

## Conventions and gotchas

- **Emails:** never write an email address (complete or obfuscated) in HTML or any static file. Legal pages use `[data-correo]` placeholders; `legal.js` injects the address (`contact@devcodelight.com`) and the `mailto:` link at runtime so bots cannot harvest it. Add new addresses to the JS constant, with a plain-text placeholder in the markup.
- **Theme:** `data-theme` is exactly `claro` or `noche`; persistence keys are `michidoku-theme-mode` (`claro`/`noche`/`auto`, landing selector) and `michidoku-theme` (resolved theme, shared with `/caso/` and legal pages). Each page has an inline `<head>` script that applies the saved theme before paint to avoid flashing. `auto` follows the OS preference; `caso/` and legal pages also honor `?tema=claro|noche`. Keep all boot scripts and storage keys in sync.
- **Modo incrustado móvil:** `?mobile=1` en `/privacidad/` y `/terminos/` marca `data-mobile="1"` en `<html>` desde el script de arranque del `<head>` (sin destello) y `legal.css` oculta la cabecera y el pie para mostrar solo el documento. `legal.js` conserva el parámetro al cambiar de idioma.
- **i18n:** the landing is Spanish-only. `/caso`, `/privacidad/`, and `/terminos/` are bilingual. Legal pages keep separate `[data-lang-block='es']` / `[data-lang-block='en']` articles and `data-title-es` / `data-title-en` on `<body>`; `legal.js` switches `document.documentElement.lang`. `/caso` keeps strings in `TEXTOS` in `caso.js` and uses `[data-i18n]`. Shared language key: `michidoku-lang`; `?lang=es|en` overrides it. When editing one language, update the counterpart (and legal-page TOC anchors).
- **Cat generator:** output is deterministic from the name (same name → same cat). `cats.js` mirrors `michidoku-catgame/src/util/cats/catDna.ts` and `CatKawaii.tsx`. Do not casually change the hash, name→color mappings, canonical names (`Simba`, `Silver`, `Dorado`), or trait mappings: that breaks parity with the game and the “same cat” promise. Cat CSS animations live in `styles.css` as `cat-*` classes.
- **Case-link contract:** `size` must be `4`, `6`, or `8`; `seed` is a non-negative safe integer written as 1–16 digits. Deep link format: `michidoku://caso?size=<size>&seed=<seed>`. Keep validation in `caso/caso.js` aligned with the app.
- **App links are launch-sensitive:** Android uses `.well-known/assetlinks.json` (replace the SHA-256 fingerprint with the production keystore); iOS currently has only `.well-known/apple-app-site-association.example` and needs the real Team ID file. Store buttons on `index.html` are still “Muy pronto” placeholders.
- Respect `prefers-reduced-motion`: animations are disabled/reduced in both CSS files, and `app.js` skips particles/reveal/tilt effects when reduced motion is requested.
- **PWA:** `sw.js` precaches the app shell; bump `VERSION` in `sw.js` whenever a shell file changes (`styles.css`, `app.js`, `cats.js`, HTML, icons) or clients keep stale assets. CSS/JS references carry a cache-busting query (`?v=7`) in every page *and* in `PRECACHE_URLS`; bump that token together with `VERSION`. It exists because GitHub Pages serves static assets with a 4-hour `max-age` and the CDN edge can keep an old `app.js` while HTML already asks for the new one. `pwa.js` only registers on `https:`/`localhost`, so `file://` and plain HTTP without localhost skip it. `manifest.webmanifest` must keep `start_url`/`scope` at `/` and include 192/512 icons for both `any` and `maskable`; `offline.html` is the offline fallback and stays self-contained (no external fonts/CSS). `pwa.js` must be loaded on every page, including `404.html`.
- `/caso/` is `noindex, follow` and intentionally absent from `sitemap.xml`. If adding an indexable public page, update `sitemap.xml` (and `robots.txt` only if crawl rules change).
