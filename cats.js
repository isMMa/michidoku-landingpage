/*
 * Michidoku · generador de michis
 * ------------------------------------------------------------------
 * Puerto a JavaScript puro del ADN de gatos del juego
 * (`src/util/cats/catDna.ts` + `CatKawaii.tsx`). Mismo nombre = mismo
 * michi, siempre. Sin dependencias: devuelve SVG como texto para que
 * la landing pueda pintar gatos animados en cualquier parte.
 */
(function (global) {
  'use strict';

  const INK = '#3A2E3F';
  const PINK = '#FF8FA3';
  const TAU = Math.PI * 2;

  const EARS = {
    pointy: { outer: 'M24 38 L24 12 L46 26 Z', inner: 'M29 33 L28 19 L40 27 Z' },
    round: { outer: 'M22 38 Q18 10 44 24 Z', inner: 'M28 32 Q26 18 39 25 Z' },
    tall: { outer: 'M25 38 L21 5 L46 25 Z', inner: 'M30 31 L26 15 L40 26 Z' },
    floppy: { outer: 'M24 34 Q8 34 12 56 Q28 52 38 30 Z', inner: '' },
  };

  const EYE_L = { cx: 38, cy: 46 };
  const EYE_R = { cx: 62, cy: 46 };

  const COATS = [
    { fur: '#F4A259', accent: '#D9772B', muzzle: '#FFE3C2', label: 'Naranja' },
    { fur: '#9AA5B1', accent: '#6B7785', muzzle: '#E6EBF0', label: 'Gris' },
    { fur: '#43404F', accent: '#24222D', muzzle: '#8C8A9B', label: 'Negro' },
    { fur: '#F7F3EE', accent: '#F0A55E', muzzle: '#FFFFFF', label: 'Blanco' },
    { fur: '#EBDCC8', accent: '#6B4F3A', muzzle: '#F8F0E4', label: 'Siamés' },
    { fur: '#8B5E3C', accent: '#5E3A21', muzzle: '#D7B898', label: 'Chocolate' },
    { fur: '#F6D9A8', accent: '#E1AE66', muzzle: '#FFF3DE', label: 'Crema' },
    { fur: '#D98E6A', accent: '#A95B36', muzzle: '#F7DCC8', label: 'Canela' },
    { fur: '#C9B7A6', accent: '#96806C', muzzle: '#F2E9DF', label: 'Beige' },
    { fur: '#B8A9C9', accent: '#8A79A3', muzzle: '#EDE7F3', label: 'Lila' },
    { fur: '#A8DCC7', accent: '#5FB596', muzzle: '#EAF8F2', label: 'Menta' },
    { fur: '#F2B8C6', accent: '#D9879C', muzzle: '#FFEAF0', label: 'Rosa' },
    { fur: '#9FD3E8', accent: '#4FA3C7', muzzle: '#E7F6FB', label: 'Cielo' },
    { fur: '#D9B3E8', accent: '#A86CC7', muzzle: '#F4E7FB', label: 'Orquídea' },
    { fur: '#C9D98A', accent: '#8FAE3F', muzzle: '#F1F7DA', label: 'Lima' },
  ];

  const COATS_POR_COLOR = {
    naranja: [
      { fur: '#F4A259', accent: '#D9772B', muzzle: '#FFE3C2', label: 'Naranja' },
      { fur: '#F7B267', accent: '#E08A32', muzzle: '#FFEBD0', label: 'Naranja' },
      { fur: '#E88C3C', accent: '#BF6320', muzzle: '#FFDDBB', label: 'Naranja' },
    ],
    negro: [
      { fur: '#43404F', accent: '#24222D', muzzle: '#8C8A9B', label: 'Negro' },
      { fur: '#33303D', accent: '#1A1822', muzzle: '#7E7B8C', label: 'Negro' },
    ],
    dorado: [
      { fur: '#E8C15A', accent: '#C99A2E', muzzle: '#FFF1C9', label: 'Dorado' },
      { fur: '#F2CF74', accent: '#D4A63A', muzzle: '#FFF6DA', label: 'Dorado' },
    ],
    atigrado: [
      { fur: '#B98A5A', accent: '#7A4E28', muzzle: '#EED7BA', label: 'Atigrado' },
      { fur: '#A9784A', accent: '#6B431F', muzzle: '#E9CFAE', label: 'Atigrado' },
    ],
    'naranja-atigrado': [
      { fur: '#EE9846', accent: '#A85212', muzzle: '#FFE0BE', label: 'Naranja atigrado' },
      { fur: '#F4A259', accent: '#B45E1A', muzzle: '#FFE3C2', label: 'Naranja atigrado' },
    ],
    'gris-oscuro': [
      { fur: '#5C6470', accent: '#2B2F36', muzzle: '#9AA0A8', label: 'Gris oscuro' },
      { fur: '#56606B', accent: '#22262C', muzzle: '#949BA3', label: 'Gris oscuro' },
    ],
    blanco: [
      { fur: '#F7F3EE', accent: '#E8D9C6', muzzle: '#FFFFFF', label: 'Blanco' },
      { fur: '#FBF8F3', accent: '#F0A55E', muzzle: '#FFFFFF', label: 'Blanco' },
    ],
    siames: [
      { fur: '#EBDCC8', accent: '#6B4F3A', muzzle: '#F8F0E4', label: 'Siamés' },
      { fur: '#E3D0B8', accent: '#5A402D', muzzle: '#F5EBDD', label: 'Siamés' },
    ],
    gris: [
      { fur: '#9AA5B1', accent: '#6B7785', muzzle: '#E6EBF0', label: 'Gris' },
      { fur: '#AFB8C2', accent: '#7C8794', muzzle: '#EEF2F6', label: 'Gris' },
      { fur: '#7F8B99', accent: '#5A6673', muzzle: '#DCE3EA', label: 'Gris' },
    ],
  };

  const PATRON_POR_COLOR = {
    'naranja-atigrado': 'stripes',
    'gris-oscuro': 'stripes',
  };

  const COAT_POR_NOMBRE = {
    silver: { fur: '#26242E', accent: '#9AA5B1', muzzle: '#C3C8CE', label: 'Negro ahumado' },
    simba: { fur: '#EE9846', accent: '#A85212', muzzle: '#FFE0BE', label: 'Naranja atigrado' },
  };

  const PATRON_POR_NOMBRE = {
    silver: 'stripes',
    simba: 'stripes',
  };

  const IRISES = ['#4CAF50', '#F5B700', '#3FA7F5', '#8E6BDB', '#E8743B'];

  const TRAITS = {
    ears: { pointy: 'Puntiagudas', round: 'Redondas', tall: 'Altas', floppy: 'Caídas' },
    pattern: { plain: 'Liso', stripes: 'Atigrado', spots: 'Moteado', eyepatch: 'Antifaz', split: 'Bicolor' },
    eyes: { normal: 'Despiertos', crossed: 'Bizco', sleepy: 'Dormilones', wide: 'Muy abiertos', sideeye: 'De reojo' },
    mouth: { smile: 'Sonrisa', blep: 'Lengüita', open: 'Boca abierta', grumpy: 'Gruñón', cheeky: 'Pícaro' },
    brows: { none: 'Tranquilo', raised: 'Sorprendido', angry: 'Enfadado', skeptic: 'Escéptico' },
    accessory: {
      none: 'Sin accesorio',
      bow: 'Lazo',
      hat: 'Sombrero',
      mustache: 'Bigote',
      glasses: 'Gafas',
      fiesta: 'De fiesta',
      corona: 'Corona',
      bufanda: 'Bufanda',
    },
  };

  // Nombres del juego + un puñado de invitados. El color se mantiene para
  // que el pelaje de cada nombre tenga sentido (Simba naranja atigrado, etc.).
  const NAMES = [
    { name: 'Misi', color: 'naranja' },
    { name: 'Zumo', color: 'naranja' },
    { name: 'Otoño', color: 'naranja' },
    { name: 'Cheddar', color: 'naranja' },
    { name: 'Naranjo', color: 'naranja' },
    { name: 'Tom', color: 'negro' },
    { name: 'Sombra', color: 'negro' },
    { name: 'Noche', color: 'negro' },
    { name: 'Carbón', color: 'negro' },
    { name: 'Onyx', color: 'negro' },
    { name: 'Simba', color: 'naranja-atigrado' },
    { name: 'Mango', color: 'naranja-atigrado' },
    { name: 'Tigre', color: 'naranja-atigrado' },
    { name: 'Chispa', color: 'gris-oscuro' },
    { name: 'Humo', color: 'gris-oscuro' },
    { name: 'Grafito', color: 'gris-oscuro' },
    { name: 'Dorado', color: 'dorado' },
    { name: 'Sol', color: 'dorado' },
    { name: 'Miel', color: 'dorado' },
    { name: 'Ámbar', color: 'dorado' },
    { name: 'Waffle', color: 'dorado' },
    { name: 'Rayas', color: 'atigrado' },
    { name: 'Canelo', color: 'atigrado' },
    { name: 'Mapache', color: 'atigrado' },
    { name: 'Luna', color: 'gris' },
    { name: 'Nube', color: 'gris' },
    { name: 'Trufa', color: 'siames' },
    { name: 'Bigotes', color: 'blanco' },
    { name: 'Medias', color: 'blanco' },
    { name: 'Tofu', color: 'blanco' },
    { name: 'Olivia', color: 'siames' },
    { name: 'Ramón', color: 'negro' },
    { name: 'Coco', color: 'chocolate' },
  ];

  const GOLDEN_NAMES = ['dorado', 'golden', 'michidoku'];

  let uid = 0;

  function hashString(str) {
    let h = 2166136261;
    for (let i = 0; i < str.length; i++) {
      h ^= str.charCodeAt(i);
      h = Math.imul(h, 16777619);
    }
    return h >>> 0;
  }

  function mulberry32(seed) {
    return function () {
      seed |= 0;
      seed = (seed + 0x6d2b79f5) | 0;
      let t = Math.imul(seed ^ (seed >>> 15), 1 | seed);
      t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
      return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
    };
  }

  function weighted(rand, items) {
    const total = items.reduce(function (sum, item) { return sum + item[1]; }, 0);
    let r = rand() * total;
    for (let i = 0; i < items.length; i++) {
      r -= items[i][1];
      if (r <= 0) return items[i][0];
    }
    return items[items.length - 1][0];
  }

  function shade(hex, factor) {
    const n = parseInt(hex.slice(1), 16);
    const channel = function (value) {
      return Math.max(0, Math.min(255, Math.round(value * factor))).toString(16).padStart(2, '0');
    };
    return '#' + channel((n >> 16) & 255) + channel((n >> 8) & 255) + channel(n & 255);
  }

  function generateCatDna(name, color) {
    const key = String(name == null ? '' : name).trim().toLowerCase() || 'gato';
    const rand = mulberry32(hashString(key));

    const familia = color ? COATS_POR_COLOR[String(color).trim().toLowerCase()] : undefined;
    const coatBase = familia
      ? familia[Math.floor(rand() * familia.length)]
      : COATS[Math.floor(rand() * COATS.length)];
    const coat = COAT_POR_NOMBRE[key] || coatBase;
    const iris = IRISES[Math.floor(rand() * IRISES.length)];

    const ears = weighted(rand, [['pointy', 4], ['round', 3], ['tall', 2], ['floppy', 2]]);
    const patternBase = weighted(rand, [['plain', 3], ['stripes', 3], ['spots', 2], ['eyepatch', 2], ['split', 1.5]]);
    const pattern =
      PATRON_POR_NOMBRE[key] ||
      (color && PATRON_POR_COLOR[String(color).trim().toLowerCase()]) ||
      patternBase;
    const eyes = weighted(rand, [['normal', 4], ['crossed', 2], ['sleepy', 2], ['wide', 2], ['sideeye', 2]]);
    const mouth = weighted(rand, [['smile', 3], ['blep', 3], ['open', 2], ['grumpy', 2], ['cheeky', 2]]);
    const accessory = weighted(rand, [['none', 5], ['bow', 1.5], ['hat', 1.5], ['mustache', 1.2], ['glasses', 1.5], ['fiesta', 0.8]]);

    let brows = weighted(rand, [['none', 4], ['raised', 1], ['angry', 1], ['skeptic', 1]]);
    if (eyes === 'wide') brows = 'raised';
    if (eyes === 'sideeye') brows = 'skeptic';
    if (eyes === 'sleepy') brows = 'none';
    if (mouth === 'grumpy') brows = 'angry';

    return {
      id: 'cat' + hashString(key).toString(36),
      name: String(name == null ? '' : name).trim() || 'Michi',
      color: color || null,
      coat: coat,
      iris: iris,
      ears: ears,
      pattern: pattern,
      eyes: eyes,
      mouth: mouth,
      brows: brows,
      accessory: accessory,
      period: 3200 + Math.floor(rand() * 2400),
      offset: rand(),
      blinkAt: 0.3 + rand() * 0.5,
      doubleBlink: rand() < 0.35,
      earAt: 0.1 + rand() * 0.7,
      // Pequeñas variaciones para el idle de la web.
      gazeX: Math.round((rand() * 2 - 1) * 22) / 10,
      gazeY: Math.round((rand() * 2 - 1) * 10) / 10,
      gazeDelay: Math.round(rand() * 90) / 10,
      earDelayL: Math.round(rand() * 90) / 10,
      earDelayR: Math.round(rand() * 90) / 10,
      tailDelay: Math.round(rand() * 80) / 10,
      blinkDelay: Math.round(rand() * 70) / 10,
    };
  }

  function isGoldenName(name) {
    return GOLDEN_NAMES.indexOf(String(name || '').trim().toLowerCase()) !== -1;
  }

  function eyeMarkup(eye, side, dna, id) {
    const cx = eye.cx;
    const cy = eye.cy;
    const dx = dna.eyes === 'crossed' ? (side === 'l' ? 3 : -3) : 0;
    let shape;
    if (dna.eyes === 'sleepy') {
      shape = '<path d="M' + (cx - 5) + ' ' + cy + ' Q' + cx + ' ' + (cy + 5.5) + ' ' + (cx + 5) + ' ' + cy + '" stroke="' + INK + '" stroke-width="2.2" stroke-linecap="round" fill="none"/>';
    } else if (dna.eyes === 'wide') {
      shape = '<circle cx="' + cx + '" cy="' + cy + '" r="6.2" fill="#FFFFFF" stroke="' + INK + '" stroke-width="1.2"/><circle cx="' + cx + '" cy="' + cy + '" r="1.9" fill="' + INK + '"/>';
    } else if (dna.eyes === 'sideeye') {
      shape = '<ellipse cx="' + cx + '" cy="' + cy + '" rx="5.2" ry="4.6" fill="#FFFFFF" stroke="' + INK + '" stroke-width="1.2"/><circle cx="' + (cx + 2.6) + '" cy="' + cy + '" r="2.5" fill="' + INK + '"/>';
    } else {
      shape = '<ellipse cx="' + (cx + dx) + '" cy="' + cy + '" rx="3.4" ry="4" fill="' + INK + '"/><circle cx="' + (cx + dx + 1.1) + '" cy="' + (cy - 1.4) + '" r="1.2" fill="#FFFFFF"/>';
    }
    return '<g class="cat-gaze"><g class="cat-blink">' + shape + '</g></g>';
  }

  function accessoryMarkup(accessory, golden) {
    if (accessory === 'glasses') {
      return '<g stroke="' + INK + '" stroke-width="1.9" stroke-linecap="round" fill="none">' +
        '<circle cx="38" cy="46" r="8.5" fill="#FFFFFF" fill-opacity="0.2"/>' +
        '<circle cx="62" cy="46" r="8.5" fill="#FFFFFF" fill-opacity="0.2"/>' +
        '<path d="M46.5 45 Q50 43.5 53.5 45"/></g>';
    }
    if (accessory === 'mustache') {
      return '<path d="M50 52 Q46 49 40 51 Q43 57 50 54 Q57 57 60 51 Q54 49 50 52 Z" fill="#5A3A2A"/>';
    }
    if (accessory === 'hat' && !golden) {
      return '<path d="M40 25 Q50 28.5 60 25 L50 2 Z" fill="#7C6CFF"/>' +
        '<path d="M44 15 L56 15" stroke="#FFD84D" stroke-width="2.6" stroke-linecap="round"/>' +
        '<circle cx="50" cy="3" r="3.4" fill="#FFD84D"/>';
    }
    if (accessory === 'fiesta' && !golden) {
      return '<path d="M35 32 L50 6 L65 32 Z" fill="#FF5C8A"/>' +
        '<path d="M40 23 L60 23" stroke="#FFD84D" stroke-width="3.4"/>' +
        '<path d="M37 29 L63 29" stroke="#00C2D1" stroke-width="3.4"/>' +
        '<circle cx="50" cy="5.5" r="4" fill="#FFD84D"/>';
    }
    if (accessory === 'corona' && !golden) {
      return '<path d="M33 28 L37 15 L44 23 L50 11 L56 23 L63 15 L67 28 Z" fill="#C98A4B" stroke="' + INK + '" stroke-width="1.4" stroke-linejoin="round"/>' +
        '<path d="M33 28 L67 28 L67 32 L33 32 Z" fill="#A96B32" stroke="' + INK + '" stroke-width="1.2" stroke-linejoin="round"/>' +
        '<circle cx="37" cy="14" r="2.6" fill="#FF5C8A"/><circle cx="50" cy="10" r="2.8" fill="#00C2D1"/><circle cx="63" cy="14" r="2.6" fill="#FF5C8A"/>';
    }
    return '';
  }

  function crownMarkup(id) {
    return '<g class="cat-crown">' +
      '<circle class="cat-crown-glow" cx="50" cy="19" r="24" fill="url(#' + id + '-corona)"/>' +
      '<path d="M33 28 L34.5 12 L43.5 20 L50 7 L56.5 20 L65.5 12 L67 28 Z" fill="url(#' + id + '-gold-deep)" stroke="#8A5A00" stroke-width="1.4" stroke-linejoin="round"/>' +
      '<path d="M35 25 L66 25" stroke="#FFF3A8" stroke-width="1.6" stroke-linecap="round" opacity="0.9"/>' +
      '<circle cx="35" cy="12" r="2.4" fill="#FFF7C2" stroke="#8A5A00" stroke-width="0.8"/>' +
      '<circle cx="50" cy="7" r="2.6" fill="#FFF7C2" stroke="#8A5A00" stroke-width="0.8"/>' +
      '<circle cx="65" cy="12" r="2.4" fill="#FFF7C2" stroke="#8A5A00" stroke-width="0.8"/>' +
      '<circle cx="50" cy="23.5" r="2.1" fill="#E53935"/>' +
      '<circle cx="50" cy="22.9" r="0.7" fill="#FFCDD2"/>' +
      '<circle cx="42" cy="24.5" r="1.4" fill="#4FC3F7"/>' +
      '<circle cx="58" cy="24.5" r="1.4" fill="#4FC3F7"/>' +
      '<path class="cat-shine" d="M50 10 L51.4 13.6 L55 15 L51.4 16.4 L50 20 L48.6 16.4 L45 15 L48.6 13.6 Z" fill="#FFFFFF"/>' +
      '</g>';
  }

  function renderCat(options) {
    const opts = options || {};
    const name = opts.name || 'Michi';
    const dna = generateCatDna(name, opts.color);
    const golden = opts.golden != null ? Boolean(opts.golden) : isGoldenName(name);
    const accessory = opts.accessory || (golden ? 'none' : dna.accessory);
    const size = Number(opts.size) || 64;
    const id = (dna.id || 'cat') + '-' + (++uid);
    const animated = opts.animated !== false;
    const label = opts.label || ('Michi ' + dna.name);
    const coat = dna.coat;
    const fur = golden ? 'url(#' + id + '-gold)' : coat.fur;
    const accent = golden ? 'url(#' + id + '-gold-deep)' : coat.accent;
    const muzzle = golden ? '#FFF6D5' : coat.muzzle;
    const tailColor = golden ? '#F6C945' : coat.fur;
    const leftEarFill = golden ? 'url(#' + id + '-gold-deep)' : (dna.pattern === 'eyepatch' || dna.pattern === 'split') ? coat.accent : coat.fur;
    const tipColor = golden ? '#C98A00' : dna.pattern === 'plain' ? coat.fur : coat.accent;
    const sock = golden ? '#FFE9A8' : coat.muzzle;
    const ear = EARS[dna.ears];

    const defs = [];
    if (golden) {
      defs.push(
        '<linearGradient id="' + id + '-gold" x1="16" y1="6" x2="86" y2="96" gradientUnits="userSpaceOnUse">' +
          '<stop offset="0" stop-color="#FFF7C2"/><stop offset="0.28" stop-color="#FFE066"/>' +
          '<stop offset="0.55" stop-color="#FFC93C"/><stop offset="0.8" stop-color="#F0A500"/>' +
          '<stop offset="1" stop-color="#C98A00"/></linearGradient>' +
        '<linearGradient id="' + id + '-gold-deep" x1="20" y1="10" x2="80" y2="90" gradientUnits="userSpaceOnUse">' +
          '<stop offset="0" stop-color="#FFD24D"/><stop offset="0.55" stop-color="#E8A800"/>' +
          '<stop offset="1" stop-color="#A97600"/></linearGradient>' +
        '<radialGradient id="' + id + '-halo" cx="50" cy="55" r="50" gradientUnits="userSpaceOnUse">' +
          '<stop offset="0" stop-color="#FFF0A0" stop-opacity="0.55"/>' +
          '<stop offset="0.5" stop-color="#FFC93C" stop-opacity="0.3"/>' +
          '<stop offset="1" stop-color="#FFC93C" stop-opacity="0"/></radialGradient>' +
        '<radialGradient id="' + id + '-corona" cx="50" cy="18" r="24" gradientUnits="userSpaceOnUse">' +
          '<stop offset="0" stop-color="#FFF9D6" stop-opacity="0.95"/>' +
          '<stop offset="0.45" stop-color="#FFD84D" stop-opacity="0.55"/>' +
          '<stop offset="1" stop-color="#FFC93C" stop-opacity="0"/></radialGradient>'
      );
    }
    defs.push(
      '<clipPath id="' + id + '-kh"><ellipse cx="50" cy="44" rx="30" ry="24"/></clipPath>' +
      '<clipPath id="' + id + '-kb"><path d="M50 52 C22 52 18 80 24 90 Q50 100 76 90 C82 80 78 52 50 52 Z"/></clipPath>'
    );

    const bodyPattern =
      (dna.pattern === 'stripes' ? '<g stroke="' + accent + '" stroke-width="3.5" stroke-linecap="round"><path d="M24 66 L34 68"/><path d="M23 75 L33 76"/><path d="M76 66 L66 68"/><path d="M77 75 L67 76"/></g>' : '') +
      (dna.pattern === 'spots' ? '<g fill="' + accent + '"><circle cx="30" cy="74" r="6"/><circle cx="70" cy="80" r="5"/></g>' : '') +
      (dna.pattern === 'split' ? '<path d="M0 0 H50 V100 H0 Z" fill="' + accent + '"/>' : '');

    const headPattern =
      (dna.pattern === 'stripes' ? '<g stroke="' + accent + '" stroke-width="3.5" stroke-linecap="round"><path d="M50 20 L50 30"/><path d="M41 21 L43 29"/><path d="M59 21 L57 29"/></g>' : '') +
      (dna.pattern === 'spots' ? '<g fill="' + accent + '"><circle cx="33" cy="29" r="5.5"/><circle cx="66" cy="31" r="4.5"/></g>' : '') +
      (dna.pattern === 'eyepatch' ? '<ellipse cx="37" cy="46" rx="11.5" ry="11" fill="' + accent + '"/>' : '') +
      (dna.pattern === 'split' ? '<path d="M0 0 H50 V100 H0 Z" fill="' + accent + '"/>' : '');

    const brows =
      dna.brows === 'angry' ? '<path d="M31 38 L43 41"/><path d="M69 38 L57 41"/>' :
      dna.brows === 'raised' ? '<path d="M32 37 Q38 33.5 44 37"/><path d="M56 37 Q62 33.5 68 37"/>' :
      dna.brows === 'skeptic' ? '<path d="M32 39 L44 39"/><path d="M56 36 Q62 31.5 68 35"/>' : '';

    const mouth = dna.mouth === 'grumpy'
      ? '<path d="M44.5 56 Q50 51.5 55.5 56"/>'
      : dna.mouth === 'open'
        ? ''
        : '<path d="M50 51.5 Q47 55.5 44.5 52.5"/><path d="M50 51.5 Q53 55.5 55.5 52.5"/>';

    const sparkles = golden
      ? '<circle class="cat-halo" cx="50" cy="54" r="50" fill="url(#' + id + '-halo)"/>' +
        '<path class="cat-sparkle cat-sparkle-a" d="M16 7 L18.4 13.6 L25 16 L18.4 18.4 L16 25 L13.6 18.4 L7 16 L13.6 13.6 Z" fill="#FFF6C0"/>' +
        '<path class="cat-sparkle cat-sparkle-b" d="M84 21 L85.8 25.2 L90 27 L85.8 28.8 L84 33 L82.2 28.8 L78 27 L82.2 25.2 Z" fill="#FFF6C0"/>'
      : '';

    const styleVars = [
      '--cat-period:' + (dna.period / 1000) + 's',
      '--cat-delay:-' + (dna.offset * 6).toFixed(2) + 's',
      '--cat-blink-delay:-' + dna.blinkDelay + 's',
      '--cat-ear-l-delay:-' + dna.earDelayL + 's',
      '--cat-ear-r-delay:-' + dna.earDelayR + 's',
      '--cat-tail-delay:-' + dna.tailDelay + 's',
      '--cat-gaze-x:' + dna.gazeX + 'px',
      '--cat-gaze-y:' + dna.gazeY + 'px',
      '--cat-gaze-delay:-' + dna.gazeDelay + 's',
    ].join(';');

    const cssClass = 'cat-svg' + (animated ? '' : ' cat-svg--still') + (opts.className ? ' ' + opts.className : '');

    return '<svg xmlns="http://www.w3.org/2000/svg" class="' + cssClass + '" width="' + size + '" height="' + size + '" viewBox="0 0 100 100" role="img" aria-label="' + escapeAttr(label) + '" style="' + styleVars + '">' +
      '<title>' + escapeHtml(label) + '</title>' +
      '<defs>' + defs.join('') + '</defs>' +
      '<g class="cat-root">' +
        sparkles +
        '<g class="cat-tail">' +
          '<path d="M72 88 Q94 90 88 60" stroke="' + tailColor + '" stroke-width="8" stroke-linecap="round" fill="none"/>' +
          '<path d="M89 68 L88 60" stroke="' + tipColor + '" stroke-width="8" stroke-linecap="round" fill="none"/>' +
        '</g>' +
        '<path d="M50 52 C22 52 18 80 24 90 Q50 100 76 90 C82 80 78 52 50 52 Z" fill="' + fur + '"/>' +
        '<g clip-path="url(#' + id + '-kb)">' + bodyPattern + '</g>' +
        '<ellipse cx="50" cy="81" rx="13" ry="12" fill="' + muzzle + '"/>' +
        '<ellipse cx="40" cy="93" rx="10.5" ry="5.5" fill="' + sock + '"/>' +
        '<ellipse cx="60" cy="93" rx="10.5" ry="5.5" fill="' + sock + '"/>' +
        '<ellipse cx="50" cy="68" rx="17" ry="4" fill="' + (golden ? '#C98A00' : shade(coat.fur, 0.8)) + '" opacity="0.3"/>' +
        (golden ? '<ellipse cx="50" cy="70" rx="9" ry="15" fill="#FFF5B8" opacity="0.22"/>' : '') +
        '<g class="cat-head">' +
          '<g class="cat-ear cat-ear-l">' +
            '<path d="' + ear.outer + '" fill="' + leftEarFill + '"/>' +
            (ear.inner ? '<path d="' + ear.inner + '" fill="#F7A8B8"/>' : '') +
          '</g>' +
          '<g transform="translate(100 0) scale(-1 1)">' +
            '<g class="cat-ear cat-ear-r">' +
              '<path d="' + ear.outer + '" fill="' + fur + '"/>' +
              (ear.inner ? '<path d="' + ear.inner + '" fill="#F7A8B8"/>' : '') +
            '</g>' +
          '</g>' +
          '<ellipse cx="50" cy="44" rx="30" ry="24" fill="' + fur + '"/>' +
          '<g clip-path="url(#' + id + '-kh)">' + headPattern + '</g>' +
          (golden ? crownMarkup(id) : '') +
          '<ellipse cx="29" cy="54" rx="5.2" ry="3.2" fill="' + PINK + '" opacity="0.5"/>' +
          '<ellipse cx="71" cy="54" rx="5.2" ry="3.2" fill="' + PINK + '" opacity="0.5"/>' +
          '<ellipse cx="50" cy="53" rx="9.5" ry="6.5" fill="' + muzzle + '"/>' +
          eyeMarkup(EYE_L, 'l', dna, id) +
          eyeMarkup(EYE_R, 'r', dna, id) +
          '<g stroke="' + INK + '" stroke-width="1.8" stroke-linecap="round" fill="none">' + brows + '</g>' +
          (dna.mouth === 'blep' ? '<g class="cat-tongue"><path d="M47.5 55 Q47.5 61 50 61 Q52.5 61 52.5 55 Z" fill="' + PINK + '"/></g>' : '') +
          (dna.mouth === 'open' ? '<ellipse cx="50" cy="56" rx="3.8" ry="4.2" fill="#6B2336"/><ellipse cx="50" cy="58" rx="2.4" ry="1.8" fill="' + PINK + '"/>' : '') +
          '<g stroke="' + INK + '" stroke-width="1.6" stroke-linecap="round" fill="none">' + mouth + '</g>' +
          (dna.mouth === 'cheeky' ? '<path d="M52.5 54 L55.5 53.4 L54.2 56.6 Z" fill="#FFFFFF"/>' : '') +
          '<ellipse cx="50" cy="50" rx="2.3" ry="1.7" fill="#F08A9B"/>' +
          '<g stroke="' + INK + '" stroke-width="1" stroke-linecap="round" opacity="0.35">' +
            '<path d="M40 53 L24 50"/><path d="M40 56 L25 57"/><path d="M60 53 L76 50"/><path d="M60 56 L75 57"/>' +
          '</g>' +
          accessoryMarkup(accessory, golden) +
        '</g>' +
        (accessory === 'bufanda' ?
          '<path d="M35 69 Q50 79 65 69 L65 75 Q50 85 35 75 Z" fill="#00B8D4"/>' +
          '<path d="M57 75 L64 89 L56 90 L51 78 Z" fill="#0097B2"/>' +
          '<path d="M38 72 Q50 79 62 72" stroke="#7BE0F0" stroke-width="2" fill="none" stroke-linecap="round"/>' : '') +
        (accessory === 'bow' ?
          '<path d="M50 70 L39 63 L39 77 Z" fill="#FF5C8A"/><path d="M50 70 L61 63 L61 77 Z" fill="#FF5C8A"/><circle cx="50" cy="70" r="3.2" fill="#FF86AA"/>' : '') +
      '</g>' +
    '</svg>';
  }

  function catTraits(dna, golden) {
    return [
      { label: 'Pelaje', value: golden ? 'Dorado legendario' : dna.coat.label },
      { label: 'Orejas', value: TRAITS.ears[dna.ears] },
      { label: 'Patrón', value: TRAITS.pattern[dna.pattern] },
      { label: 'Ojos', value: TRAITS.eyes[dna.eyes] },
      { label: 'Carácter', value: TRAITS.mouth[dna.mouth] },
      { label: 'Accesorio', value: golden ? 'Corona' : TRAITS.accessory[dna.accessory] },
    ];
  }

  function randomName(previous) {
    let pick = NAMES[Math.floor(Math.random() * NAMES.length)];
    if (previous && NAMES.length > 1) {
      let guard = 0;
      while (pick.name === previous && guard < 12) {
        pick = NAMES[Math.floor(Math.random() * NAMES.length)];
        guard++;
      }
    }
    return pick.name;
  }

  function escapeHtml(value) {
    return String(value == null ? '' : value)
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;')
      .replace(/'/g, '&#039;');
  }

  function escapeAttr(value) {
    return escapeHtml(value);
  }

  const api = {
    generateCatDna: generateCatDna,
    renderCat: renderCat,
    catTraits: catTraits,
    isGoldenName: isGoldenName,
    randomName: randomName,
    escapeHtml: escapeHtml,
    NAMES: NAMES,
    TRAITS: TRAITS,
    COATS: COATS,
  };

  global.MichidokuCats = api;
  if (typeof module !== 'undefined' && module.exports) module.exports = api;
})(typeof window !== 'undefined' ? window : globalThis);
