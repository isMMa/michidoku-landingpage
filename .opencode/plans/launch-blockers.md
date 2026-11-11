# Plan de lanzamiento · bloqueos pendientes

Estado a 11 nov 2026: el sitio ya está publicado en
`https://michidoku.devcodelight.com` (GitHub Pages + dominio propio, HTTPS
forzado). Lo que queda son los tres bloqueos que detecta
`.opencode/skills/release-audit/scripts/audit-release.mjs`.

Comprobación de partida:

```bash
node .opencode/skills/release-audit/scripts/audit-release.mjs
# RELEASE BLOCKED (3)
```

## 1. Universal Links de iOS

- Falta `.well-known/apple-app-site-association` (solo existe el
  `.example`).
- Hace falta el **Team ID real de Apple** y el bundle identifier definitivo.
  No inventarlo ni publicar el placeholder `REPLACE_WITH_APPLE_TEAM_ID`.
- Pasos:
  1. Obtener Team ID (Apple Developer → Membership) y bundle id de la app.
  2. Copiar `.well-known/apple-app-site-association.example` al archivo real
     y sustituir `TEAMID.bundleid` por el valor definitivo.
  3. Servir sin extensión y con `Content-Type: application/json`
     (GitHub Pages ya sirve JSON para archivos sin extensión; verificar con
     `curl -I`).
  4. Validar en un dispositivo real abriendo
     `https://michidoku.devcodelight.com/caso/?size=6&seed=123`.

## 2. App Links de Android

- `.well-known/assetlinks.json` todavía lleva la huella SHA-256 de un build de
  desarrollo/prueba.
- Pasos:
  1. Obtener la huella del keystore de producción:
     `keytool -list -v -keystore <keystore> -alias <alias>` (SHA-256).
  2. Sustituirla en `.well-known/assetlinks.json` manteniendo el paquete
     `com.michidoku.catgame`.
  3. Verificar con
     `https://developers.google.com/digital-asset-links/tools/generator`.
  4. Probar el deep link `michidoku://caso?size=6&seed=123` en un dispositivo
     con el build de producción.

## 3. Botones de tienda

- `index.html` sigue con botones «Muy pronto» (Google Play / App Store) y el
  copy «Muy pronto en Google Play y App Store».
- Pasos:
  1. Publicar la app y obtener las URLs definitivas de las fichas.
  2. Convertir los botones en `<a>` reales (con `rel="noopener"`), sin
     romper el layout de `.store-btn`.
  3. Revisar el bloque JSON-LD `VideoGame` (`installUrl` / `sameAs`) y la meta
     description / OG description, que mencionan «Muy pronto».
  4. Volver a ejecutar `audit-release.mjs` y `check-site.mjs`.

## Verificación final (manual)

- Lighthouse móvil y escritorio; revisar retrato y paisaje.
- `prefers-reduced-motion` activo.
- Rutas: `/`, `/caso/?size=6&seed=123`, `/privacidad/`, `/terminos/`,
  `/404.html`, `/privacidad.html` (redirección).
- DNS `michidoku` → `ismma.github.io.`, «Enforce HTTPS» activo en Pages.
- Service worker: subir `VERSION` en `sw.js` tras cualquier cambio del app
  shell.

## Nota de higiene (no bloqueante)

El `rsync` de `.github/workflows/deploy.yml` no excluye `.opencode/`, así que
las skills y estos planes se publican como archivos estáticos del sitio.
Añadir `--exclude='.opencode'` cuando se toque el workflow.
