#!/usr/bin/env node
import { existsSync, readFileSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { spawnSync } from 'node:child_process';
import { fileURLToPath } from 'node:url';

const root = fileURLToPath(new URL('../../../../', import.meta.url));
const failures = [];
const warnings = [];

function fail(message) {
  failures.push(message);
}

function warn(message) {
  warnings.push(message);
}

function read(relative) {
  return readFileSync(join(root, relative), 'utf8');
}

function requireFile(relative) {
  if (!existsSync(join(root, relative))) fail(`missing ${relative}`);
}

const required = [
  'index.html',
  'styles.css',
  'cats.js',
  'app.js',
  '404.html',
  'caso/index.html',
  'caso/caso.js',
  'privacidad/index.html',
  'terminos/index.html',
  'legal.css',
  'legal.js',
  'CNAME',
  '.nojekyll',
  'manifest.webmanifest',
  'sw.js',
  'pwa.js',
  'offline.html',
  'assets/icon-192.png',
  'assets/icon-512.png',
  'assets/icon-maskable-192.png',
  'assets/icon-maskable-512.png',
  'assets/apple-touch-icon.png',
  'robots.txt',
  'sitemap.xml',
  '.well-known/assetlinks.json',
];
required.forEach(requireFile);

for (const file of ['app.js', 'cats.js', 'caso/caso.js', 'legal.js', 'sw.js', 'pwa.js']) {
  if (!existsSync(join(root, file))) continue;
  const result = spawnSync(process.execPath, ['--check', join(root, file)], {
    encoding: 'utf8',
  });
  if (result.status !== 0) {
    fail(`syntax error in ${file}\n${result.stderr.trim()}`);
  }
}

const htmlPages = [
  'index.html',
  '404.html',
  'caso/index.html',
  'privacidad/index.html',
  'terminos/index.html',
];
for (const file of htmlPages) {
  if (!existsSync(join(root, file))) continue;
  const html = read(file);
  if (!html.includes('data-theme="noche"')) fail(`${file}: missing default data-theme="noche"`);
  if (!html.includes('michidoku-theme')) fail(`${file}: missing michidoku-theme boot script`);
  if (html.includes('michidoku-tema')) fail(`${file}: stale michidoku-tema storage key`);
  if (!/rel="manifest"/.test(html)) fail(`${file}: missing <link rel="manifest">`);
  if (!/src="(\/|\.\.\/)?pwa\.js"/.test(html)) fail(`${file}: missing pwa.js service worker registration`);
}

const index = read('index.html');
if (index.indexOf('cats.js') > index.indexOf('app.js')) {
  fail('index.html: cats.js must load before app.js');
}

const caso = read('caso/index.html');
if (caso.indexOf('cats.js') > caso.indexOf('caso.js')) {
  fail('caso/index.html: cats.js must load before caso.js');
}

const casoJs = read('caso/caso.js');
if (!/numero === 4 \|\| numero === 6 \|\| numero === 8/.test(casoJs)) {
  fail('caso/caso.js: size validation must accept exactly 4, 6, and 8');
}
if (!casoJs.includes("'michidoku://caso?size='")) {
  fail('caso/caso.js: deep link scheme changed unexpectedly');
}

const styles = read('styles.css');
const legalCss = read('legal.css');
if (!styles.includes('prefers-reduced-motion')) fail('styles.css: missing reduced-motion handling');
if (!legalCss.includes('prefers-reduced-motion')) fail('legal.css: missing reduced-motion handling');

for (const file of ['manifest.webmanifest', '.well-known/assetlinks.json']) {
  if (!existsSync(join(root, file))) continue;
  try {
    JSON.parse(read(file));
  } catch (error) {
    fail(`${file}: invalid JSON (${error.message})`);
  }
}

const manifest = JSON.parse(read('manifest.webmanifest'));
if (manifest.start_url !== '/' || manifest.scope !== '/') {
  fail('manifest.webmanifest: start_url and scope must stay at /');
}
if (manifest.display !== 'standalone') {
  fail('manifest.webmanifest: display must stay standalone');
}
const iconPurposes = new Set();
for (const icon of manifest.icons || []) {
  const src = String(icon.src || '');
  if (!src.startsWith('/')) fail(`manifest.webmanifest: icon ${src} must use a root-absolute path`);
  if (!existsSync(join(root, src.replace(/^\//, '')))) fail(`manifest.webmanifest: missing icon file ${src}`);
  iconPurposes.add(`${icon.purpose || 'any'}:${icon.sizes}`);
}
for (const expected of ['any:192x192', 'any:512x512', 'maskable:192x192', 'maskable:512x512']) {
  if (!iconPurposes.has(expected)) fail(`manifest.webmanifest: missing ${expected} icon`);
}

const sw = read('sw.js');
if (!sw.includes("'/offline.html'") && !sw.includes('OFFLINE_URL')) {
  fail('sw.js: expected an offline.html fallback');
}
for (const asset of ['/styles.css', '/app.js', '/cats.js', '/pwa.js', '/offline.html']) {
  if (!sw.includes(`'${asset}'`)) fail(`sw.js: ${asset} missing from precache list`);
}

const cname = read('CNAME').trim();
if (cname !== 'michidoku.devcodelight.com') {
  fail(`CNAME: expected michidoku.devcodelight.com, found ${cname || '(empty)'}`);
}

const sitemap = read('sitemap.xml');
// /caso/ is intentionally noindex (shared, query-driven) and must stay out of the sitemap.
for (const route of ['/', '/privacidad/', '/terminos/']) {
  if (!sitemap.includes(`https://${cname}${route}`)) {
    fail(`sitemap.xml: missing ${route}`);
  }
}
if (sitemap.includes(`https://${cname}/caso/`)) {
  fail('sitemap.xml: /caso/ is noindex and must not be listed');
}

const legalPages = ['privacidad/index.html', 'terminos/index.html'];
for (const file of legalPages) {
  const html = read(file);
  if (!html.includes('data-lang-block="es"') || !html.includes('data-lang-block="en"')) {
    fail(`${file}: missing one of the bilingual article blocks`);
  }
  if (!html.includes('data-title-es=') || !html.includes('data-title-en=')) {
    fail(`${file}: missing bilingual <body> title attributes`);
  }
}

if (!read('app.js').includes('window.MichidokuCats')) {
  warn('app.js: expected to consume window.MichidokuCats');
}

const cats = read('cats.js');
if (!cats.includes('global.MichidokuCats = api')) fail('cats.js: missing window.MichidokuCats export');
if (!cats.includes('module.exports = api')) fail('cats.js: missing CommonJS export');

if (failures.length) {
  console.error(`FAIL (${failures.length})`);
  for (const message of failures) console.error(`- ${message}`);
  process.exit(1);
}

console.log('Site structural checks passed.');
if (warnings.length) {
  for (const message of warnings) console.warn(`warning: ${message}`);
}
