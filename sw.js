/* Service worker de Michidoku.
   App-shell precacheado + fallback offline. Sin build: se sirve tal cual desde la raíz.
   Al cambiar los archivos del shell, sube VERSION para invalidar la caché. */
'use strict';

var VERSION = 'v6';
var SHELL_CACHE = 'michidoku-shell-' + VERSION;
var PAGE_CACHE = 'michidoku-pages-' + VERSION;
var FONT_CACHE = 'michidoku-fonts-' + VERSION;
var OFFLINE_URL = '/offline.html';
var PRECACHE_URLS = [
  '/',
  '/styles.css',
  '/app.js',
  '/cats.js',
  '/sonidos.js',
  '/assets/sonidos/toque.wav',
  '/assets/sonidos/seleccion.wav',
  '/assets/sonidos/exito.wav',
  '/assets/sonidos/aviso.wav',
  '/pwa.js',
  '/manifest.webmanifest',
  OFFLINE_URL,
  '/assets/michidoku-icon.svg',
  '/assets/logo.png',
  '/assets/icon-192.png',
  '/assets/icon-512.png',
  '/assets/apple-touch-icon.png',
  '/caso/',
  '/caso/caso.js',
  '/privacidad/',
  '/terminos/',
  '/legal.css',
  '/legal.js'
];

self.addEventListener('install', function (event) {
  event.waitUntil(precache().then(function () {
    return self.skipWaiting();
  }));
});

self.addEventListener('activate', function (event) {
  event.waitUntil(limpiarCaches().then(function () {
    return self.clients.claim();
  }));
});

self.addEventListener('message', function (event) {
  if (event.data && event.data.type === 'SKIP_WAITING') {
    self.skipWaiting();
  }
});

self.addEventListener('fetch', function (event) {
  var request = event.request;
  if (request.method !== 'GET') return;

  var url;
  try {
    url = new URL(request.url);
  } catch (error) {
    return;
  }

  // Nunca interceptar el propio service worker ni peticiones a otros orígenes
  // que no sean fuentes.
  if (url.origin === self.location.origin && url.pathname === '/sw.js') return;

  if (request.mode === 'navigate') {
    event.respondWith(navegacion(request));
    return;
  }

  if (url.origin === self.location.origin) {
    event.respondWith(cachePrimeroConRed(url, request, SHELL_CACHE));
    return;
  }

  if (url.hostname === 'fonts.googleapis.com' || url.hostname === 'fonts.gstatic.com') {
    event.respondWith(cachePrimeroConRed(url, request, FONT_CACHE));
  }
});

function precache() {
  return caches.open(SHELL_CACHE).then(function (cache) {
    // Se cachea uno a uno: addAll aborta si falla un solo recurso y dejaría la
    // app sin caché por un archivo ausente o renombrado.
    return Promise.all(PRECACHE_URLS.map(function (url) {
      return fetch(url, { cache: 'reload' }).then(function (respuesta) {
        if (!respuesta || !respuesta.ok) return undefined;
        return cache.put(url, respuesta);
      }).catch(function () {
        return undefined;
      });
    }));
  });
}

function limpiarCaches() {
  var vigentes = [SHELL_CACHE, PAGE_CACHE, FONT_CACHE];
  return caches.keys().then(function (nombres) {
    return Promise.all(nombres.map(function (nombre) {
      if (vigentes.indexOf(nombre) === -1) return caches.delete(nombre);
      return undefined;
    }));
  });
}

function navegacion(request) {
  return fetch(request).then(function (respuesta) {
    if (respuesta && respuesta.ok) {
      var copia = respuesta.clone();
      caches.open(PAGE_CACHE).then(function (cache) {
        cache.put(request, copia).catch(function () {});
      });
    }
    return respuesta;
  }).catch(function () {
    return caches.match(request, { ignoreSearch: true }).then(function (cacheada) {
      if (cacheada) return cacheada;
      return caches.match(OFFLINE_URL).then(function (offline) {
        return offline || respuestaOffline();
      });
    });
  });
}

function cachePrimeroConRed(url, request, cacheName) {
  return caches.match(request).then(function (cacheada) {
    if (cacheada) {
      actualizarEnSegundoPlano(cacheName, request);
      return cacheada;
    }
    return fetch(request).then(function (respuesta) {
      // Las respuestas opacas (fuentes de Google) no exponen .ok; se cachean igual.
      if (respuesta && (respuesta.ok || respuesta.type === 'opaque')) {
        var copia = respuesta.clone();
        caches.open(cacheName).then(function (cache) {
          cache.put(request, copia).catch(function () {});
        }).catch(function () {});
      }
      return respuesta;
    }).catch(function () {
      return caches.match(request, { ignoreSearch: url.origin === self.location.origin });
    });
  });
}

function actualizarEnSegundoPlano(cacheName, request) {
  fetch(request).then(function (respuesta) {
    if (!respuesta || !(respuesta.ok || respuesta.type === 'opaque')) return;
    caches.open(cacheName).then(function (cache) {
      cache.put(request, respuesta).catch(function () {});
    }).catch(function () {});
  }).catch(function () {});
}

function respuestaOffline() {
  return new Response(
    '<!doctype html><meta charset="utf-8"><title>Sin conexión</title>' +
      '<p>Sin conexión. Vuelve a intentarlo cuando recuperes internet.</p>',
    { status: 503, headers: { 'content-type': 'text/html; charset=utf-8' } }
  );
}
