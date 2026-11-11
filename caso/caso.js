/*
 * Página /caso — lee size + seed, pinta el reto y ofrece abrir la app.
 * Sin dependencias ni cookies. La URL compartida solo contiene números.
 */
(function () {
  'use strict';

  var TEXTOS = {
    es: {
      title: function (medidas) {
        return 'Te han retado a un caso de ' + medidas;
      },
      lead:
        'Abre el enlace en el móvil y juega exactamente el mismo tablero que la otra persona. ' +
        'El caso es idéntico para todos: solo cambia cómo lo resuelves.',
      chipSize: 'Tamaño',
      chipGrid: 'Tablero',
      chipSeed: 'Semilla',
      abrir: 'Abrir en Michidoku',
      copiar: 'Copiar enlace',
      copiado: 'Enlace copiado al portapapeles.',
      copiarError: 'No se pudo copiar. Mantén pulsado el enlace para copiarlo a mano.',
      hint:
        '¿No se abre la app? Comprueba que Michidoku está instalada y vuelve a pulsar el botón. ' +
        'Si abres este enlace en un ordenador, copia el enlace y pégalo en el móvil.',
      descargar: '¿Aún no tienes Michidoku? Descárgala aquí.',
      abriendo: 'Abriendo Michidoku…',
      errorEyebrow: 'Enlace no válido',
      errorTitulo: 'Este enlace no lleva a ningún caso',
      errorTexto:
        'Puede que falte el tamaño o la semilla, o que el enlace se haya copiado incompleto. ' +
        'Pide que te lo compartan de nuevo.',
      errorBoton: 'Ir a la web de Michidoku',
      terminos: 'Condiciones de uso',
      privacidad: 'Privacidad',
      dificultad: { 4: 'Rápida', 6: 'Normal', 8: 'Difícil' },
    },
    en: {
      title: function (medidas) {
        return 'You have been challenged to a ' + medidas + ' case';
      },
      lead:
        'Open this link on your phone and play exactly the same board as the other person. ' +
        'The case is identical for everyone: only how you solve it changes.',
      chipSize: 'Size',
      chipGrid: 'Board',
      chipSeed: 'Seed',
      abrir: 'Open in Michidoku',
      copiar: 'Copy link',
      copiado: 'Link copied to the clipboard.',
      copiarError: 'Could not copy. Long-press the link to copy it manually.',
      hint:
        'App not opening? Check that Michidoku is installed and tap the button again. ' +
        'If you opened this link on a computer, copy it and paste it on your phone.',
      descargar: 'No Michidoku yet? Download it here.',
      abriendo: 'Opening Michidoku…',
      errorEyebrow: 'Invalid link',
      errorTitulo: 'This link does not point to a case',
      errorTexto:
        'The size or seed may be missing, or the link may have been copied incompletely. ' +
        'Ask them to share it again.',
      errorBoton: 'Go to the Michidoku website',
      terminos: 'Terms of use',
      privacidad: 'Privacy',
      dificultad: { 4: 'Quick', 6: 'Normal', 8: 'Hard' },
    },
  };

  var MEDIDAS = { 4: '4 × 4', 6: '6 × 8', 8: '8 × 10' };
  var idioma = 'es';

  function $(id) {
    return document.getElementById(id);
  }

  function normalizarTamano(valor) {
    var numero = Number(valor);
    return numero === 4 || numero === 6 || numero === 8 ? numero : null;
  }

  function normalizarSemilla(valor) {
    if (typeof valor !== 'string' || !/^\d{1,16}$/.test(valor)) return null;
    var numero = Number(valor);
    return Number.isSafeInteger(numero) && numero >= 0 ? numero : null;
  }

  function parametros() {
    var datos = {};
    try {
      var busqueda = new URLSearchParams(window.location.search);
      busqueda.forEach(function (valor, clave) {
        datos[clave] = valor;
      });
    } catch (error) {
      // Navegadores muy antiguos: lectura manual.
      var consulta = window.location.search.replace(/^\?/, '');
      consulta.split('&').forEach(function (trozo) {
        if (!trozo) return;
        var partes = trozo.split('=');
        datos[decodeURIComponent(partes[0])] = decodeURIComponent(partes.slice(1).join('='));
      });
    }
    return datos;
  }

  function pintarGato(contenedor, semilla) {
    if (!contenedor) return;
    var nombre = 'michi-' + semilla;
    try {
      if (window.MichidokuCats && window.MichidokuCats.renderCat) {
        contenedor.innerHTML = window.MichidokuCats.renderCat({
          name: nombre,
          size: 132,
          animated: false,
        });
        return;
      }
    } catch (error) {
      // Sin gato generado: se queda el icono de la app.
    }
    var img = document.createElement('img');
    img.src = '../assets/michidoku-icon.svg';
    img.alt = '';
    img.width = 120;
    img.height = 120;
    contenedor.appendChild(img);
  }

  function aplicarIdioma(nuevo) {
    idioma = nuevo === 'en' ? 'en' : 'es';
    var t = TEXTOS[idioma];
    document.documentElement.lang = idioma;

    Array.prototype.forEach.call(document.querySelectorAll('[data-lang]'), function (boton) {
      boton.setAttribute('aria-pressed', String(boton.getAttribute('data-lang') === idioma));
    });

    Array.prototype.forEach.call(document.querySelectorAll('[data-i18n]'), function (nodo) {
      var clave = nodo.getAttribute('data-i18n');
      if (!t[clave]) return;
      if (clave === 'title') return;
      nodo.textContent = t[clave];
    });

    var titulo = $('caso-title');
    var datos = parametros();
    var size = normalizarTamano(datos.size);
    if (titulo && size !== null) titulo.textContent = t.title(MEDIDAS[size]);

    var chipTamano = document.querySelector('.caso-chip [data-i18n="chipSize"]');
    if (chipTamano) chipTamano.textContent = t.chipSize;

    document.title =
      (size !== null ? t.title(MEDIDAS[size]) : t.errorTitulo) + ' · Michidoku';

    try {
      localStorage.setItem('michidoku-lang', idioma);
    } catch (error) {}

    var url = new URL(window.location.href);
    url.searchParams.set('lang', idioma);
    try {
      window.history.replaceState({}, '', url.toString());
    } catch (error) {}
  }

  function idiomaInicial() {
    var datos = parametros();
    var candidato = datos.lang;
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

  function esMovil() {
    return /Android|iPhone|iPad|iPod|Mobile/i.test(navigator.userAgent);
  }

  function copiar(texto, alTerminar) {
    if (navigator.clipboard && navigator.clipboard.writeText) {
      navigator.clipboard.writeText(texto).then(
        function () {
          alTerminar(true);
        },
        function () {
          alTerminar(false);
        }
      );
      return;
    }
    try {
      var area = document.createElement('textarea');
      area.value = texto;
      area.setAttribute('readonly', '');
      area.style.position = 'fixed';
      area.style.opacity = '0';
      document.body.appendChild(area);
      area.select();
      var ok = document.execCommand('copy');
      document.body.removeChild(area);
      alTerminar(ok);
    } catch (error) {
      alTerminar(false);
    }
  }

  function iniciar() {
    var datos = parametros();
    var size = normalizarTamano(datos.size);
    var seed = normalizarSemilla(datos.seed);
    var valido = size !== null && seed !== null;

    var tarjeta = $('caso');
    var invalido = $('invalido');
    if (!valido) {
      if (invalido) invalido.hidden = false;
      aplicarIdioma(idiomaInicial());
      var enlace = document.querySelector('.page-brand');
      if (enlace) enlace.focus();
      return;
    }

    if (tarjeta) tarjeta.hidden = false;
    pintarGato($('caso-cat'), seed);

    var medidas = MEDIDAS[size];
    var enlaceApp = 'michidoku://caso?size=' + size + '&seed=' + seed;

    var chipSize = $('chip-size');
    var chipGrid = $('chip-grid');
    var chipSeed = $('chip-seed');
    if (chipSize) chipSize.textContent = TEXTOS[idioma].dificultad[size];
    if (chipGrid) chipGrid.textContent = medidas;
    if (chipSeed) chipSeed.textContent = String(seed);

    var abrir = $('abrir');
    if (abrir) abrir.setAttribute('href', enlaceApp);

    var hint = $('caso-hint');
    var toast = $('caso-toast');
    var t = TEXTOS[idioma];

    function pintarPista() {
      if (!hint) return;
      hint.hidden = false;
      hint.classList.add('is-visible');
      hint.innerHTML = '';
      hint.appendChild(document.createTextNode(t.hint + ' '));
      var descarga = document.createElement('a');
      descarga.href = '../#descargar';
      descarga.textContent = t.descargar;
      hint.appendChild(descarga);
    }

    aplicarIdioma(idiomaInicial());
    t = TEXTOS[idioma];

    // El chip de tamaño se rellena después de fijar el idioma.
    if (chipSize) chipSize.textContent = t.dificultad[size];
    if (abrir) abrir.setAttribute('href', enlaceApp);

    Array.prototype.forEach.call(document.querySelectorAll('[data-lang]'), function (boton) {
      boton.addEventListener('click', function () {
        aplicarIdioma(boton.getAttribute('data-lang'));
        t = TEXTOS[idioma];
        if (chipSize) chipSize.textContent = t.dificultad[size];
        if (hint && !hint.hidden) pintarPista();
      });
    });

    var copiarBoton = $('copiar');
    if (copiarBoton) {
      copiarBoton.addEventListener('click', function () {
        copiar(window.location.href, function (ok) {
          if (!toast) return;
          toast.textContent = ok ? TEXTOS[idioma].copiado : TEXTOS[idioma].copiarError;
        });
      });
    }

    if (abrir) {
      abrir.addEventListener('click', function () {
        if (toast) toast.textContent = TEXTOS[idioma].abriendo;
        // Deja que el navegador procese el esquema y, si no ocurre nada,
        // muestra las instrucciones de respaldo.
        window.setTimeout(function () {
          if (hint && hint.hidden) pintarPista();
        }, 1600);
      });
    }

    // En móvil se intenta abrir la app una sola vez por sesión de página.
    // El botón siempre queda disponible como alternativa.
    if (esMovil()) {
      var clave = 'michidoku-auto-' + size + '-' + seed;
      var yaIntentado = false;
      try {
        yaIntentado = sessionStorage.getItem(clave) === '1';
      } catch (error) {}
      if (!yaIntentado) {
        window.setTimeout(function () {
          try {
            sessionStorage.setItem(clave, '1');
          } catch (error) {}
          window.location.href = enlaceApp;
          window.setTimeout(function () {
            if (hint && hint.hidden) pintarPista();
          }, 1400);
        }, 500);
      }
    } else if (hint) {
      // En escritorio el esquema no suele funcionar: se explica desde el inicio.
      pintarPista();
    }
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', iniciar);
  } else {
    iniciar();
  }
})();
