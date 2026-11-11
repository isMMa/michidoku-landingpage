/* Registro del service worker de Michidoku.
   Se carga con `defer` en todas las páginas; resuelve `sw.js` desde su propia
   URL, así funciona igual en la raíz (`pwa.js`) y en subdirectorios (`../pwa.js`). */
(function () {
  'use strict';

  if (!('serviceWorker' in navigator)) return;

  var esSeguro = location.protocol === 'https:' ||
    location.hostname === 'localhost' ||
    location.hostname === '127.0.0.1';
  if (!esSeguro) return;

  var origen = document.currentScript && document.currentScript.src;
  var swUrl = new URL('sw.js', origen || location.href).href;

  function registrar() {
    navigator.serviceWorker.register(swUrl).then(function (registro) {
      // Si hay una versión nueva esperando, se activa en la siguiente carga.
      if (registro.waiting) registro.waiting.postMessage({ type: 'SKIP_WAITING' });
    }).catch(function (error) {
      console.warn('[Michidoku] No se pudo registrar el service worker:', error);
    });
  }

  if (document.readyState === 'complete') {
    registrar();
  } else {
    window.addEventListener('load', registrar, { once: true });
  }
})();
