---
name: Michidoku release audit
description: Use before publishing or announcing Michidoku, when changing app-link files, store buttons, CNAME, sitemap, or the GitHub Pages deploy workflow, or when asked whether the site is launch-ready.
---

# Michidoku release audit

## Workflow

1. Read `references/launch-checklist.md`.
2. Run the release check from the repository root:

   ```bash
   node .opencode/skills/release-audit/scripts/audit-release.mjs
   ```

   It intentionally fails while launch blockers such as the missing iOS
   association file or placeholder store buttons remain.
3. Treat the script as a baseline, not a substitute for the manual checks in
   the reference (real Android/iOS device, DNS, HTTPS, Lighthouse, mobile
   landscape/portrait).
4. Do not invent an Apple Team ID or production Android fingerprint. Ask for
   the real values and never commit a keystore or signing secret.
5. After changing a public route or launch copy, re-run the site structural
   check as well:

   ```bash
   node .opencode/skills/site-change/scripts/check-site.mjs
   ```

## Hard rules

- `.well-known/apple-app-site-association` must be the real file, not the
  `.example`; `REPLACE_WITH_APPLE_TEAM_ID` must not be published as the final
  value.
- `.well-known/assetlinks.json` must contain the production SHA-256
  fingerprint and package `com.michidoku.catgame`.
- Store badges must become real links (`<a href=...>`) only when the store
  listings exist; do not link to unpublished listings.
- Deployment is push-to-`main`; do not add a manual build or change the
  artifact exclusions without checking the workflow.
- `CNAME` and all canonical/OG/sitemap URLs must use
  `https://michidoku.devcodelight.com`.
- Never commit signing secrets, keystores, API keys, or private store
  credentials. The deploy workflow publishes the whole repo root except
  `.git`, `.github`, `_site`, and `README.md`.
