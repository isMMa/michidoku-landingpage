/* Michidoku · sonidos compartidos con la app.
   Replica los cuatro avisos de michidoku-catgame/src/util/sonidos.ts:
   toque, seleccion, exito y aviso. */
(function (global) {
  'use strict';

  var TIPOS = ['toque', 'seleccion', 'exito', 'aviso'];
  var VOLUMEN = 0.7;
  var CLAVE = 'michidoku-sonido';
  var ETIQUETAS = {
    es: { label: 'Sonido', on: 'Silenciar sonido', off: 'Activar sonido' },
    en: { label: 'Sound', on: 'Mute sound', off: 'Enable sound' }
  };

  // La base se resuelve desde la URL del propio script para que funcione igual
  // en la raíz, en /caso/, en /privacidad/ y en 404.html.
  var base = 'assets/sonidos/';
  var propio = document.currentScript;
  if (propio && propio.src) {
    try {
      base = new URL('assets/sonidos/', propio.src).href;
    } catch (error) { /* sin URL absoluta */ }
  }

  var jugadores = {};
  var botones = [];
  var idioma = 'es';
  var activo = leerPreferencia();

  function leerPreferencia() {
    try {
      if (localStorage.getItem(CLAVE) === 'off') return false;
    } catch (error) { /* sin almacenamiento */ }
    return true;
  }

  function crearJugador(tipo) {
    var audio = new Audio(base + tipo + '.wav');
    audio.preload = 'auto';
    audio.volume = VOLUMEN;
    return audio;
  }

  function reproducir(tipo) {
    if (!activo || TIPOS.indexOf(tipo) === -1) return;
    try {
      var jugador = jugadores[tipo] || (jugadores[tipo] = crearJugador(tipo));
      try { jugador.currentTime = 0; } catch (error) { /* aún no cargado */ }
      var intento = jugador.play();
      if (intento && typeof intento.catch === 'function') intento.catch(function () {});
    } catch (error) { /* audio no disponible */ }
  }

  function textos() {
    return ETIQUETAS[idioma] || ETIQUETAS.es;
  }

  function pintar() {
    var t = textos();
    botones.forEach(function (boton) {
      boton.setAttribute('aria-pressed', String(activo));
      boton.setAttribute('aria-label', t.label);
      boton.setAttribute('title', activo ? t.on : t.off);
    });
  }

  function fijar(valor, persistir) {
    activo = Boolean(valor);
    if (persistir) {
      try {
        localStorage.setItem(CLAVE, activo ? 'on' : 'off');
      } catch (error) { /* sin almacenamiento */ }
    }
    pintar();
  }

  function alternar() {
    fijar(!activo, true);
    if (activo) reproducir('seleccion');
  }

  function cambiarIdioma(nuevo) {
    if (nuevo !== 'es' && nuevo !== 'en') return;
    idioma = nuevo;
    pintar();
  }

  function iniciar() {
    botones = Array.prototype.slice.call(document.querySelectorAll('[data-sound-toggle]'));
    botones.forEach(function (boton) {
      boton.addEventListener('click', alternar);
    });
    pintar();
  }

  global.MichidokuSonidos = {
    reproducir: reproducir,
    alternar: alternar,
    estaActivo: function () { return activo; },
    fijar: fijar,
    idioma: cambiarIdioma,
    tipos: TIPOS.slice()
  };

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', iniciar);
  } else {
    iniciar();
  }
})(window);
