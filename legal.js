/*
 * Documentos legales — selector de idioma y persistencia.
 * El español es el idioma por defecto y funciona sin JavaScript.
 */
(function () {
  'use strict';

  function idiomaInicial() {
    var candidato = null;
    try {
      candidato = new URLSearchParams(window.location.search).get('lang');
    } catch (error) {}
    if (candidato !== 'es' && candidato !== 'en') {
      try {
        candidato = localStorage.getItem('michidoku-lang');
      } catch (error) {}
    }
    if (candidato !== 'es' && candidato !== 'en') {
      candidato = (navigator.language || 'es').toLowerCase().indexOf('es') === 0 ? 'es' : 'en';
    }
    return candidato;
  }

  function aplicar(idioma) {
    document.documentElement.lang = idioma;
    Array.prototype.forEach.call(document.querySelectorAll('[data-lang]'), function (boton) {
      boton.setAttribute('aria-pressed', String(boton.getAttribute('data-lang') === idioma));
    });

    var titulo = document.body.getAttribute('data-title-' + idioma);
    if (titulo) document.title = titulo;

    try {
      localStorage.setItem('michidoku-lang', idioma);
    } catch (error) {}

    var url = new URL(window.location.href);
    url.searchParams.set('lang', idioma);
    try {
      window.history.replaceState({}, '', url.toString());
    } catch (error) {}
  }

  /**
   * Monta los buzones en tiempo de ejecución: el HTML solo contiene
   * "contact [at] devcodelight [dot] com" para que los bots de spam no
   * encuentren una dirección lista para cosechar.
   */
  function montarCorreos() {
    Array.prototype.forEach.call(document.querySelectorAll('[data-correo]'), function (nodo) {
      var usuario = nodo.getAttribute('data-usuario');
      var dominio = nodo.getAttribute('data-dominio');
      if (!usuario || !dominio) return;
      var correo = usuario + '@' + dominio;
      nodo.textContent = correo;
      nodo.setAttribute('href', 'mailto:' + correo);
      nodo.classList.add('correo');
    });
  }

  function iniciar() {
    montarCorreos();
    Array.prototype.forEach.call(document.querySelectorAll('[data-lang]'), function (boton) {
      boton.addEventListener('click', function () {
        aplicar(boton.getAttribute('data-lang'));
      });
    });
    aplicar(idiomaInicial());
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', iniciar);
  } else {
    iniciar();
  }
})();
