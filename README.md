# Michidoku · landing

Landing estática de **Michidoku**, el juego de deducción gatuna. Está pensada para GitHub Pages y para el dominio **https://michidoku.devcodelight.com**.

No necesita build, dependencias ni framework: HTML, CSS y JavaScript puro. Los gatos animados son SVG generados en el navegador con el mismo ADN que usa el juego.

---

## Vista rápida

- **Hero** con un michi generado al azar y escenario con inclinación 3D.
- **Casa de ejemplo** interactiva: pistas, gatos, muebles y ovillo.
- **Generador de michis** determinista: mismo nombre → mismo gato. Incluye accesorios, rasgos, galería y descarga en SVG.
- **Modos de juego**, gato dorado, camino de 20 niveles y FAQ.
- **Tema día / noche** inspirado en los temas de la app.
- **Responsive**, accesible y respeta `prefers-reduced-motion`.
- Página **`/caso`** para enlaces compartidos y fallback si la app no está instalada.
- **404** y **privacidad** con la misma identidad visual.

---

## Probar en local

Cualquier servidor estático sirve. Por ejemplo:

```bash
python -m http.server 8080
```

Abre `http://localhost:8080/`.

También puedes usar `npx serve .` si prefieres Node. No abras `index.html` con `file://` si quieres probar rutas como `/caso`.

---

## Estructura

```
.
├─ index.html                  Landing principal
├─ styles.css                  Sistema visual y animaciones
├─ cats.js                     Generador de gatos (ADN + SVG)
├─ app.js                      Interacciones de la landing
├─ caso/index.html             Fallback de enlaces /caso?size=…&seed=…
├─ caso/caso.js                Render del caso compartido
├─ 404.html                    Página no encontrada
├─ privacidad/index.html       Política de privacidad (ES/EN)
├─ terminos/index.html         Condiciones de uso (ES/EN)
├─ privacidad.html             Redirección a /privacidad/
├─ legal.css · legal.js        Estilos y cambio de idioma de las páginas legales
├─ sw.js                       Service worker (app-shell + fallback offline)
├─ pwa.js                      Registro del service worker (todas las páginas)
├─ offline.html                Página de sin conexión
├─ manifest.webmanifest        Manifiesto de la PWA
├─ assets/
│  ├─ icon.png                 Icono base 1024 (también OG image)
│  ├─ icon-192.png · icon-512.png
│  ├─ icon-maskable-192.png · icon-maskable-512.png
│  ├─ apple-touch-icon.png     Icono iOS 180
│  └─ michidoku-icon.svg       Icono vectorial
├─ .well-known/
│  ├─ assetlinks.json          App Links de Android
│  └─ apple-app-site-association.example
├─ .github/workflows/deploy.yml
├─ CNAME                       Dominio personalizado de Pages
├─ .nojekyll                   Evita el procesado de Jekyll
├─ robots.txt · sitemap.xml
└─ README.md
```

---

## PWA (instalable y offline)

El sitio es una Progressive Web App sin build:

- `manifest.webmanifest` declara nombre, `start_url`, `display: standalone` e iconos 192/512 `any` y `maskable`.
- `pwa.js` registra `sw.js` en todas las páginas (solo en `https:` o `localhost`).
- `sw.js` precachea el app-shell (`/`, `/caso/`, legales, CSS, JS, iconos) al instalar.
  - Navegaciones: red primero y, si falla, copia cacheada; si no hay copia, `offline.html`.
  - CSS/JS/iconos: caché primero con refresco en segundo plano.
  - Fuentes de Google: caché aparte, también con refresco en segundo plano.
- `offline.html` es autónoma (CSS y fuentes del sistema, sin dependencias de red).

**Al cambiar cualquier archivo del app-shell** (`styles.css`, `app.js`, `cats.js`, HTML, iconos), sube `VERSION` en `sw.js`. La versión nueva instala su propia caché, `activate` borra las anteriores y el cliente la activa en la siguiente carga.

Prueba la PWA en local con `python -m http.server 8080`: en Chrome, DevTools → Application → Manifest / Service Workers, y marca *Offline* para ver el fallback. En iOS, “Compartir → Añadir a pantalla de inicio”; el modo standalone depende de `apple-mobile-web-app-capable` porque iOS no usa el manifiesto.

---

## Publicar en GitHub Pages

1. Sube el contenido a la rama `main` del repositorio `isMMa/michidoku-landingpage`.
2. En **Settings → Pages**, elige **Source: GitHub Actions**.
3. El workflow `.github/workflows/deploy.yml` publica el sitio en cada push a `main`.
4. En **Settings → Pages → Custom domain**, escribe `michidoku.devcodelight.com` (el archivo `CNAME` ya lo incluye).
5. En el DNS del dominio `devcodelight.com`, crea un registro:

   | Tipo  | Nombre      | Valor              |
   |-------|-------------|--------------------|
   | CNAME | `michidoku` | `ismma.github.io.` |

6. Espera a que GitHub valide el DNS y activa **Enforce HTTPS**.

> Si el repositorio cambia de propietario, actualiza el destino del CNAME.

---

## Enlaces de casos (`/caso`)

El juego comparte casos con URLs del tipo:

```
https://michidoku.devcodelight.com/caso?size=6&seed=123
```

La página `caso/index.html`:

- lee `size` y `seed` de la URL (con validación),
- intenta abrir `michidoku://caso?...` en móviles,
- muestra un fallback cuidado si la app no está instalada,
- mantiene el diseño y el tema de la landing.

### Android App Links

`.well-known/assetlinks.json` viene del repositorio del juego. **Antes de publicar**, sustituye la huella por la del keystore de producción:

```bash
keytool -list -v -keystore <ruta-al-keystore> -alias <alias> | grep SHA256
```

### iOS Universal Links

Apple necesita el Team ID real. Copia el ejemplo y renómbralo cuando lo tengas:

```bash
cp .well-known/apple-app-site-association.example .well-known/apple-app-site-association
```

Después sustituye `REPLACE_WITH_APPLE_TEAM_ID` por tu Team ID. Mientras el archivo no exista con un valor válido, iOS simplemente abrirá la web (que es el fallback correcto).

---

## Activar las tiendas cuando la app esté publicada

Ahora mismo los botones de descarga son informativos (“Muy pronto”) porque la app aún no está publicada. Cuando tengas las URLs:

1. En `index.html`, cambia los `<button class="store-badge" data-store="android">` y `data-store="ios"` por enlaces:

   ```html
   <a class="store-badge" href="https://play.google.com/store/apps/details?id=com.michidoku.catgame" target="_blank" rel="noreferrer">…</a>
   ```

2. Ajusta el texto de `#store-note` y las etiquetas “Pronto”.
3. Revisa el `JSON-LD` de `index.html` si quieres añadir `downloadUrl` o `installUrl`.
4. Actualiza la copia del juego y el dominio si cambia el identificador.

---

## Generador de gatos

`cats.js` es un puerto a JavaScript puro de:

- `michidoku-catgame/src/util/cats/catDna.ts` (ADN determinista),
- `michidoku-catgame/src/util/cats/CatKawaii.tsx` (dibujo SVG kawaii).

Incluye los mismos pelajes, patrones, orejas, ojos, bocas, accesorios y el gato dorado con corona. Los nombres canónicos (`Simba`, `Silver`, `Dorado`) mantienen sus secretos.

Para cambiar el catálogo de nombres de la galería, edita `NAMES` en `cats.js`. Para retocar el dibujo, edita `renderCat`; las animaciones viven en `styles.css` (clases `cat-*`).

---

## Checklist antes del lanzamiento

- [ ] Sustituir la huella de `assetlinks.json` por la de producción.
- [ ] Añadir `apple-app-site-association` con el Team ID real.
- [ ] Activar los enlaces de Google Play y App Store.
- [ ] Revisar el correo/contacto legal si se añade un canal distinto a GitHub Issues.
- [ ] Comprobar el dominio y HTTPS en GitHub Pages.
- [ ] Pasar Lighthouse y revisar en móvil real (landscape y portrait).
- [ ] Verificar que `/caso?size=6&seed=123` abre la app con una build de producción.

---

Hecho con cariño, muchas pistas y alguna siesta de gato por **DevCodeLight**.
