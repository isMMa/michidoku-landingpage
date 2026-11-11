# Launch checklist

## App links

- Replace the Android SHA-256 fingerprint in `.well-known/assetlinks.json`
  with the production keystore fingerprint:

  ```bash
  keytool -list -v -keystore <keystore> -alias <alias> | grep SHA256
  ```

- Create `.well-known/apple-app-site-association` from
  `.well-known/apple-app-site-association.example` and replace
  `REPLACE_WITH_APPLE_TEAM_ID` with the real Apple Team ID. The `appID` must
  remain `<TEAM_ID>.com.michidoku.catgame` and the component path must remain
  `/caso`.
- Verify `michidoku://caso?size=6&seed=123` opens a production build on real
  Android and iOS devices from the public HTTPS URL, not just locally.
- Confirm the Android app manifest uses `autoVerify` and the same package name;
  the site cannot fix that from here.

## Stores and landing copy

- Replace the `data-store` buttons in `index.html` with real store links when
  the listings are live; update the “Muy pronto”/“Pronto” copy and
  `#store-note`.
- Review the JSON-LD `VideoGame` block in `index.html` if adding
  `downloadUrl`/`installUrl`.
- Keep the legal contact details accurate if a support channel other than
  GitHub Issues is added.

## Hosting

- GitHub Pages source must be **GitHub Actions**; pushes to `main` deploy via
  `.github/workflows/deploy.yml`.
- `CNAME` must be `michidoku.devcodelight.com`; DNS should be a CNAME from
  `michidoku` to `ismma.github.io.`.
- Wait for GitHub DNS validation, then enable **Enforce HTTPS**.
- `.nojekyll` must stay present so paths such as `.well-known/` are served.
- If the repository owner changes, update the DNS target and re-check
  `CNAME`.

## Manual verification

- Lighthouse on `/` and `/caso/?size=6&seed=123`.
- Real mobile device in portrait and landscape; test the mobile nav, theme
  toggle, cat generator, SVG download, and copy-link toast.
- Reduced-motion mode.
- Confirm `/privacidad/`, `/terminos/`, `/caso/`, and `/404.html` load with
  correct relative assets and both languages.
- Confirm `sitemap.xml`, `robots.txt`, canonical URLs, and OG image URLs all
  use the custom domain.
