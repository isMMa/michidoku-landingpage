/* Michidoku · landing interactions */
(function () {
  'use strict';

  var Cats = window.MichidokuCats;
  if (!Cats) return;

  var prefersReduced = window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  var $ = function (selector, scope) { return (scope || document).querySelector(selector); };
  var $$ = function (selector, scope) { return Array.prototype.slice.call((scope || document).querySelectorAll(selector)); };

  /* ---------------------------------------------------------------------- */
  /* Tema claro / oscuro / automático                                        */
  /* ---------------------------------------------------------------------- */
  var root = document.documentElement;
  var themeMeta = document.querySelector('meta[name="theme-color"]');
  var themeSwitch = $('#theme-switch');
  var themeButtons = $$('[data-theme-mode]');
  var lightQuery = window.matchMedia ? window.matchMedia('(prefers-color-scheme: light)') : null;

  function resolveTheme(mode) {
    if (mode === 'claro' || mode === 'noche') return mode;
    return lightQuery && lightQuery.matches ? 'claro' : 'noche';
  }

  function applyThemeMode(mode, persist) {
    if (mode !== 'claro' && mode !== 'noche' && mode !== 'auto') mode = 'auto';
    var theme = resolveTheme(mode);
    root.setAttribute('data-theme', theme);
    root.setAttribute('data-theme-mode', mode);
    if (themeMeta) themeMeta.setAttribute('content', theme === 'claro' ? '#fff8ef' : '#080b16');
    if (themeSwitch) themeSwitch.setAttribute('data-mode', mode);
    themeButtons.forEach(function (button) {
      button.setAttribute('aria-pressed', String(button.dataset.themeMode === mode));
    });
    if (persist) {
      try {
        localStorage.setItem('michidoku-theme-mode', mode);
        localStorage.setItem('michidoku-theme', theme);
      } catch (error) { /* sin almacenamiento */ }
    }
  }

  var storedMode = 'auto';
  try {
    storedMode = localStorage.getItem('michidoku-theme-mode');
    if (storedMode !== 'claro' && storedMode !== 'noche' && storedMode !== 'auto') {
      var storedTheme = localStorage.getItem('michidoku-theme');
      storedMode = storedTheme === 'claro' || storedTheme === 'noche' ? storedTheme : 'auto';
    }
  } catch (error) { /* sin almacenamiento */ }
  applyThemeMode(storedMode, false);

  themeButtons.forEach(function (button) {
    button.addEventListener('click', function () {
      applyThemeMode(button.dataset.themeMode, true);
    });
  });

  if (lightQuery) {
    var onSystemThemeChange = function () {
      if (root.getAttribute('data-theme-mode') === 'auto') applyThemeMode('auto', false);
    };
    if (lightQuery.addEventListener) lightQuery.addEventListener('change', onSystemThemeChange);
    else if (lightQuery.addListener) lightQuery.addListener(onSystemThemeChange);
  }

  /* ---------------------------------------------------------------------- */
  /* Cabecera y menú móvil                                                   */
  /* ---------------------------------------------------------------------- */
  var header = $('.site-header');
  var nav = $('#nav');
  var navToggle = $('#nav-toggle');

  function onScroll() {
    if (!header) return;
    header.classList.toggle('is-scrolled', window.scrollY > 10);
  }
  window.addEventListener('scroll', onScroll, { passive: true });
  onScroll();

  function closeNav() {
    if (!nav || !navToggle) return;
    nav.classList.remove('is-open');
    navToggle.setAttribute('aria-expanded', 'false');
    navToggle.setAttribute('aria-label', 'Abrir menú');
    var menu = $('.icon-menu', navToggle);
    var close = $('.icon-close', navToggle);
    if (menu) menu.style.display = '';
    if (close) close.style.display = 'none';
  }

  if (navToggle && nav) {
    navToggle.addEventListener('click', function () {
      var open = !nav.classList.contains('is-open');
      nav.classList.toggle('is-open', open);
      navToggle.setAttribute('aria-expanded', String(open));
      navToggle.setAttribute('aria-label', open ? 'Cerrar menú' : 'Abrir menú');
      var menu = $('.icon-menu', navToggle);
      var close = $('.icon-close', navToggle);
      if (menu) menu.style.display = open ? 'none' : '';
      if (close) close.style.display = open ? '' : 'none';
    });
    $$('a', nav).forEach(function (link) { link.addEventListener('click', closeNav); });
    document.addEventListener('click', function (event) {
      if (!nav.contains(event.target) && !navToggle.contains(event.target)) closeNav();
    });
    document.addEventListener('keydown', function (event) {
      if (event.key === 'Escape') closeNav();
    });
  }

  /* ---------------------------------------------------------------------- */
  /* Revelado al hacer scroll                                                */
  /* ---------------------------------------------------------------------- */
  var reveals = $$('.reveal');
  if ('IntersectionObserver' in window && !prefersReduced) {
    var revealObserver = new IntersectionObserver(function (entries) {
      entries.forEach(function (entry) {
        if (entry.isIntersecting) {
          entry.target.classList.add('is-visible');
          revealObserver.unobserve(entry.target);
        }
      });
    }, { threshold: 0.12, rootMargin: '0px 0px -8% 0px' });
    reveals.forEach(function (element) { revealObserver.observe(element); });
  } else {
    reveals.forEach(function (element) { element.classList.add('is-visible'); });
  }

  /* ---------------------------------------------------------------------- */
  /* Partículas del hero                                                     */
  /* ---------------------------------------------------------------------- */
  var particleHost = $('#hero-particles');
  if (particleHost && !prefersReduced) {
    for (var p = 0; p < 18; p++) {
      var particle = document.createElement('span');
      particle.className = 'particle';
      particle.style.left = (Math.random() * 100).toFixed(2) + '%';
      particle.style.bottom = (Math.random() * 55).toFixed(2) + '%';
      particle.style.animationDuration = (7 + Math.random() * 9).toFixed(2) + 's';
      particle.style.animationDelay = (-Math.random() * 14).toFixed(2) + 's';
      particle.style.width = particle.style.height = (2 + Math.random() * 3).toFixed(1) + 'px';
      particle.style.opacity = (0.25 + Math.random() * 0.4).toFixed(2);
      particleHost.appendChild(particle);
    }
  }

  /* ---------------------------------------------------------------------- */
  /* Escenario del hero                                                      */
  /* ---------------------------------------------------------------------- */
  var heroCatHost = $('#hero-cat');
  var heroCatName = $('#hero-cat-name');
  var heroRandom = $('#hero-random');
  var heroStage = $('#hero-stage');
  var heroWrap = heroStage ? heroStage.parentElement : null;
  var heroCurrent = 'Misi';

  function colorFor(name) {
    var key = String(name || '').trim().toLowerCase();
    for (var i = 0; i < Cats.NAMES.length; i++) {
      if (Cats.NAMES[i].name.toLowerCase() === key) return Cats.NAMES[i].color;
    }
    return undefined;
  }

  function renderHero(name) {
    if (!heroCatHost) return;
    heroCurrent = name;
    var golden = Cats.isGoldenName(name) || name === 'Dorado';
    heroCatHost.innerHTML = Cats.renderCat({
      name: name,
      color: colorFor(name),
      golden: golden,
      size: 420,
      label: 'Michi ' + name,
    });
    if (heroCatName) heroCatName.textContent = name;
  }

  if (heroCatHost) renderHero('Misi');
  if (heroRandom) {
    heroRandom.addEventListener('click', function () {
      var next = Math.random() < 0.09 ? 'Dorado' : Cats.randomName(heroCurrent);
      renderHero(next);
    });
  }

  if (heroStage && heroWrap && !prefersReduced) {
    heroWrap.addEventListener('pointermove', function (event) {
      var rect = heroStage.getBoundingClientRect();
      var x = (event.clientX - rect.left) / rect.width - 0.5;
      var y = (event.clientY - rect.top) / rect.height - 0.5;
      heroStage.style.setProperty('--tilt-y', (x * 7).toFixed(2));
      heroStage.style.setProperty('--tilt-x', (-y * 7).toFixed(2));
    });
    heroWrap.addEventListener('pointerleave', function () {
      heroStage.style.setProperty('--tilt-y', '0');
      heroStage.style.setProperty('--tilt-x', '0');
    });
  }

  /* ---------------------------------------------------------------------- */
  /* Casa de ejemplo                                                         */
  /* ---------------------------------------------------------------------- */
  var board = $('#case-board');

  function roomAt(row, column) {
    if (row <= 2) return column <= 3 ? 'salon' : 'cocina';
    if (column <= 1) return 'dormitorio';
    if (column <= 3) return 'bano';
    return 'terraza';
  }

  function positionStyle(row, column) {
    return 'left:' + (column * 100 / 6) + '%;top:' + (row * 100 / 6) + '%;width:' + (100 / 6) + '%;height:' + (100 / 6) + '%;';
  }

  function propMarkup(icon) {
    return '<svg aria-hidden="true"><use href="#' + icon + '"/></svg>';
  }

  if (board) {
    var labels = {
      '0-0': 'Salón',
      '0-4': 'Cocina',
      '3-0': 'Dormitorio',
      '3-2': 'Baño',
      '3-4': 'Terraza',
    };

    for (var row = 0; row < 6; row++) {
      for (var col = 0; col < 6; col++) {
        var cell = document.createElement('div');
        cell.className = 'cell room-' + roomAt(row, col);
        cell.dataset.row = row;
        cell.dataset.col = col;
        var label = labels[row + '-' + col];
        if (label) {
          var labelSpan = document.createElement('span');
          labelSpan.className = 'room-label';
          labelSpan.textContent = label;
          cell.appendChild(labelSpan);
        }
        board.appendChild(cell);
      }
    }

    var props = [
      { row: 4, col: 1, icon: 'i-box' },
      { row: 0, col: 4, icon: 'i-scratcher' },
      { row: 1, col: 5, icon: 'i-bowl' },
      { row: 0, col: 5, icon: 'i-plant' },
      { row: 5, col: 4, icon: 'i-litter' },
      { row: 0, col: 0, icon: 'i-sofa' },
    ];

    props.forEach(function (prop) {
      var element = document.createElement('div');
      element.className = 'board-prop';
      element.style.cssText = positionStyle(prop.row, prop.col);
      element.innerHTML = propMarkup(prop.icon);
      board.appendChild(element);
    });

    var yarn = document.createElement('div');
    yarn.className = 'board-yarn';
    yarn.style.cssText = positionStyle(4, 2);
    yarn.innerHTML = propMarkup('i-yarn');
    yarn.title = 'Ovillo roto · Baño';
    board.appendChild(yarn);

    var boardCats = [
      { name: 'Misi', row: 4, col: 0 },
      { name: 'Luna', row: 1, col: 4 },
      { name: 'Tom', row: 3, col: 2 },
    ];

    boardCats.forEach(function (data) {
      var button = document.createElement('button');
      button.type = 'button';
      button.className = 'board-cat';
      button.dataset.cat = data.name;
      button.dataset.row = data.row;
      button.dataset.col = data.col;
      button.style.cssText = positionStyle(data.row, data.col);
      button.setAttribute('aria-label', 'Michi ' + data.name + ', pista relacionada');
      button.innerHTML = Cats.renderCat({
        name: data.name,
        color: colorFor(data.name),
        size: 110,
        label: 'Michi ' + data.name,
      });
      board.appendChild(button);
    });

    var clues = $$('.clue');
    var pinned = null;

    function paintActive(name) {
      $$('.board-cat', board).forEach(function (cat) {
        var active = cat.dataset.cat === name;
        cat.classList.toggle('is-active', active);
        cat.classList.toggle('is-dimmed', Boolean(name) && !active);
      });
      $$('.cell', board).forEach(function (cell) {
        var cat = $$('.board-cat', board).find(function (item) { return item.dataset.cat === name; });
        if (!cat) {
          cell.classList.remove('is-hover-row', 'is-hover-col');
          return;
        }
        cell.classList.toggle('is-hover-row', cell.dataset.row === cat.dataset.row);
        cell.classList.toggle('is-hover-col', cell.dataset.col === cat.dataset.col);
      });
      clues.forEach(function (clue) {
        clue.classList.toggle('is-active', clue.dataset.cat === name);
      });
    }

    function hoverCat(name) {
      paintActive(name || pinned);
    }

    clues.forEach(function (clue) {
      var name = clue.dataset.cat;
      clue.addEventListener('mouseenter', function () { if (!pinned) paintActive(name); });
      clue.addEventListener('focus', function () { if (!pinned) paintActive(name); });
      clue.addEventListener('mouseleave', function () { if (!pinned) paintActive(null); });
      clue.addEventListener('blur', function () { if (!pinned) paintActive(null); });
      clue.addEventListener('click', function () {
        pinned = pinned === name ? null : name;
        paintActive(pinned);
      });
    });

    $$('.board-cat', board).forEach(function (cat) {
      cat.addEventListener('mouseenter', function () { paintActive(cat.dataset.cat); });
      cat.addEventListener('mouseleave', function () { paintActive(pinned); });
      cat.addEventListener('focus', function () { paintActive(cat.dataset.cat); });
      cat.addEventListener('blur', function () { paintActive(pinned); });
      cat.addEventListener('click', function () {
        pinned = pinned === cat.dataset.cat ? null : cat.dataset.cat;
        paintActive(pinned);
      });
    });
  }

  /* ---------------------------------------------------------------------- */
  /* Laboratorio de michis                                                   */
  /* ---------------------------------------------------------------------- */
  var previewHost = $('#cat-preview');
  var nameDisplay = $('#cat-name-display');
  var idDisplay = $('#cat-id');
  var traitsHost = $('#cat-traits');
  var nameInput = $('#cat-name');
  var accessoryChips = $$('#accessory-chips .chip');
  var galleryHost = $('#cat-gallery');
  var currentName = 'Michi';
  var currentAccessory = '';
  var currentDna = null;

  function normalizedName(value) {
    var clean = String(value || '').replace(/\s+/g, ' ').trim().slice(0, 12);
    return clean || 'Michi';
  }

  function paintTraits(dna, golden) {
    if (!traitsHost) return;
    var traits = Cats.catTraits(dna, golden);
    if (currentAccessory) {
      var labels = {
        none: 'Sin accesorio',
        bow: 'Lazo',
        glasses: 'Gafas',
        hat: 'Sombrero',
        mustache: 'Bigote',
        fiesta: 'Fiesta',
        corona: 'Corona',
        bufanda: 'Bufanda',
      };
      traits[traits.length - 1] = { label: 'Accesorio', value: labels[currentAccessory] || currentAccessory };
    }
    traitsHost.innerHTML = traits.map(function (trait) {
      return '<span class="trait"><b>' + Cats.escapeHtml(trait.label) + ':</b> ' + Cats.escapeHtml(trait.value) + '</span>';
    }).join('');
  }

  function renderPreview(name, options) {
    if (!previewHost) return;
    var opts = options || {};
    currentName = normalizedName(name);
    var golden = Cats.isGoldenName(currentName);
    var color = colorFor(currentName);
    currentDna = Cats.generateCatDna(currentName, color);
    previewHost.innerHTML = Cats.renderCat({
      name: currentName,
      color: color,
      golden: golden,
      accessory: currentAccessory || undefined,
      size: 440,
      label: 'Michi ' + currentName + ' generado',
    });
    if (nameDisplay) nameDisplay.textContent = currentName;
    if (idDisplay) idDisplay.textContent = 'ADN #' + currentDna.id.replace(/^cat/, '').toUpperCase();
    paintTraits(currentDna, golden);

    if (galleryHost) {
      $$('.gallery-cat', galleryHost).forEach(function (item) {
        item.classList.toggle('is-active', item.dataset.name === currentName);
      });
    }
  }

  function buildGallery(names) {
    if (!galleryHost) return;
    galleryHost.innerHTML = names.map(function (entry) {
      return '<button class="gallery-cat" type="button" data-name="' + Cats.escapeHtml(entry.name) + '" data-color="' + Cats.escapeHtml(entry.color || '') + '" aria-label="Ver el michi ' + Cats.escapeHtml(entry.name) + '">' +
        Cats.renderCat({ name: entry.name, color: entry.color, size: 96, label: 'Michi ' + entry.name }) +
        '<span>' + Cats.escapeHtml(entry.name) + '</span></button>';
    }).join('');
    $$('.gallery-cat', galleryHost).forEach(function (item) {
      item.classList.toggle('is-active', item.dataset.name === currentName);
      item.addEventListener('click', function () {
        if (nameInput) nameInput.value = item.dataset.name;
        renderPreview(item.dataset.name);
      });
    });
  }

  function randomGallery(count) {
    var pool = Cats.NAMES.slice();
    var chosen = [];
    while (chosen.length < count && pool.length) {
      chosen.push(pool.splice(Math.floor(Math.random() * pool.length), 1)[0]);
    }
    return chosen;
  }

  if (previewHost) {
    buildGallery(randomGallery(12));
    renderPreview('Michi');
  }

  if (nameInput) {
    nameInput.addEventListener('input', function () {
      renderPreview(nameInput.value);
    });
    nameInput.addEventListener('blur', function () {
      nameInput.value = normalizedName(nameInput.value);
      renderPreview(nameInput.value);
    });
    nameInput.addEventListener('keydown', function (event) {
      if (event.key === 'Enter') {
        event.preventDefault();
        nameInput.blur();
      }
    });
  }

  var randomButton = $('#cat-random');
  if (randomButton) {
    randomButton.addEventListener('click', function () {
      var next = Cats.randomName(currentName);
      if (nameInput) nameInput.value = next;
      renderPreview(next);
    });
  }

  var againButton = $('#cat-again');
  if (againButton) {
    againButton.addEventListener('click', function () {
      var next = Math.random() < 0.07 ? 'Dorado' : Cats.randomName(currentName);
      if (nameInput) nameInput.value = next;
      currentAccessory = '';
      accessoryChips.forEach(function (chip) { chip.classList.toggle('is-active', chip.dataset.accessory === ''); });
      renderPreview(next);
    });
  }

  accessoryChips.forEach(function (chip) {
    chip.addEventListener('click', function () {
      currentAccessory = chip.dataset.accessory || '';
      accessoryChips.forEach(function (other) { other.classList.toggle('is-active', other === chip); });
      renderPreview(currentName);
    });
  });

  var galleryRefresh = $('#gallery-refresh');
  if (galleryRefresh) {
    galleryRefresh.addEventListener('click', function () {
      buildGallery(randomGallery(12));
    });
  }

  var downloadButton = $('#cat-download');
  if (downloadButton) {
    downloadButton.addEventListener('click', function () {
      var svg = previewHost ? previewHost.querySelector('svg') : null;
      if (!svg) return;
      var clone = svg.cloneNode(true);
      clone.setAttribute('xmlns', 'http://www.w3.org/2000/svg');
      clone.setAttribute('width', '1024');
      clone.setAttribute('height', '1024');
      var source = '<?xml version="1.0" encoding="UTF-8"?>\n' + new XMLSerializer().serializeToString(clone);
      var blob = new Blob([source], { type: 'image/svg+xml;charset=utf-8' });
      var url = URL.createObjectURL(blob);
      var link = document.createElement('a');
      link.href = url;
      link.download = 'michidoku-' + currentName.toLowerCase().replace(/[^a-z0-9áéíóúüñ]+/gi, '-').replace(/^-|-$/g, '') + '.svg';
      document.body.appendChild(link);
      link.click();
      link.remove();
      setTimeout(function () { URL.revokeObjectURL(url); }, 1000);
    });
  }

  /* ---------------------------------------------------------------------- */
  /* Gato dorado, camada del CTA y año                                       */
  /* ---------------------------------------------------------------------- */
  var goldenHost = $('#golden-cat');
  if (goldenHost) {
    goldenHost.innerHTML = Cats.renderCat({
      name: 'Dorado',
      color: 'dorado',
      golden: true,
      size: 440,
      label: 'El legendario gato dorado con corona',
    });
  }

  var ctaCats = $('#cta-cats');
  if (ctaCats) {
    ['Misi', 'Luna', 'Tom', 'Chispa', 'Nube', 'Simba', 'Dorado'].forEach(function (name) {
      var wrapper = document.createElement('div');
      wrapper.innerHTML = Cats.renderCat({
        name: name,
        color: colorFor(name),
        golden: name === 'Dorado',
        size: 120,
        label: 'Michi ' + name,
      });
      ctaCats.appendChild(wrapper.firstElementChild);
    });
  }

  var year = $('#year');
  if (year) year.textContent = String(new Date().getFullYear());

  /* Aviso de lanzamiento */
  var storeNote = $('#store-note');
  $$('[data-store]').forEach(function (button) {
    button.addEventListener('click', function () {
      if (!storeNote) return;
      var store = button.dataset.store === 'ios' ? 'App Store' : 'Google Play';
      storeNote.textContent = 'Todavía estamos afinando la última versión para ' + store + '. Vuelve pronto: la casa abre sus puertas muy pronto.';
    });
  });
})();
