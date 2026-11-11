#!/usr/bin/env node
import { existsSync, readFileSync } from 'node:fs';
import { join } from 'node:path';
import { fileURLToPath } from 'node:url';

const root = fileURLToPath(new URL('../../../../', import.meta.url));
const failures = [];
const manual = [];

function fail(message) {
  failures.push(message);
}

function read(relative) {
  return readFileSync(join(root, relative), 'utf8');
}

function requireFile(relative) {
  if (!existsSync(join(root, relative))) fail(`missing ${relative}`);
}

const required = [
  'index.html',
  'CNAME',
  '.nojekyll',
  'robots.txt',
  'sitemap.xml',
  'manifest.webmanifest',
  '.well-known/assetlinks.json',
  '.well-known/apple-app-site-association',
  '.github/workflows/deploy.yml',
];
required.forEach(requireFile);

const cname = existsSync(join(root, 'CNAME')) ? read('CNAME').trim() : '';
if (cname !== 'michidoku.devcodelight.com') {
  fail(`CNAME: expected michidoku.devcodelight.com, found ${cname || '(empty)'}`);
}

if (existsSync(join(root, '.well-known/assetlinks.json'))) {
  try {
    const data = JSON.parse(read('.well-known/assetlinks.json'));
    const target = data?.[0]?.target;
    if (target?.package_name !== 'com.michidoku.catgame') {
      fail(`assetlinks.json: unexpected package ${target?.package_name || '(missing)'}`);
    }
    const fingerprints = target?.sha256_cert_fingerprints || [];
    if (!fingerprints.length) {
      fail('assetlinks.json: missing sha256_cert_fingerprints');
    }
    for (const fingerprint of fingerprints) {
      if (!/^([0-9A-F]{2}:){31}[0-9A-F]{2}$/i.test(fingerprint)) {
        fail(`assetlinks.json: invalid SHA-256 fingerprint ${fingerprint}`);
      }
    }
    manual.push('Confirm assetlinks.json uses the production keystore fingerprint, not a dev build.');
  } catch (error) {
    fail(`assetlinks.json: invalid JSON (${error.message})`);
  }
}

const aasaPath = join(root, '.well-known/apple-app-site-association');
if (existsSync(aasaPath)) {
  const source = readFileSync(aasaPath, 'utf8');
  if (source.includes('REPLACE_WITH')) {
    fail('apple-app-site-association: replace REPLACE_WITH_APPLE_TEAM_ID');
  }
  try {
    const data = JSON.parse(source);
    const details = data?.applinks?.details || [];
    const appIds = details.flatMap((entry) => entry.appIDs || []);
    if (!appIds.some((id) => id.endsWith('.com.michidoku.catgame'))) {
      fail('apple-app-site-association: missing appID ending in .com.michidoku.catgame');
    }
    const paths = details.flatMap((entry) => (entry.components || []).map((item) => item['/']));
    if (!paths.includes('/caso')) {
      fail('apple-app-site-association: missing /caso component');
    }
  } catch (error) {
    fail(`apple-app-site-association: invalid JSON (${error.message})`);
  }
}

if (existsSync(join(root, 'index.html'))) {
  const index = read('index.html');
  if (/<button[^>]*\bdata-store=/.test(index)) {
    fail('index.html: store badges are still buttons; replace them with real store links');
  }
  if (index.includes('Muy pronto en Google Play y App Store')) {
    fail('index.html: launch copy still says “Muy pronto en Google Play y App Store”');
  }
  if (!index.includes(`https://${cname}/`)) {
    fail('index.html: canonical/OG URLs do not use the custom domain');
  }
  manual.push('Review the JSON-LD VideoGame block after adding store URLs.');
}

if (existsSync(join(root, 'sitemap.xml'))) {
  const sitemap = read('sitemap.xml');
  for (const route of ['/', '/privacidad/', '/terminos/']) {
    if (!sitemap.includes(`https://${cname}${route}`)) {
      fail(`sitemap.xml: missing https://${cname}${route}`);
    }
  }
  if (sitemap.includes(`https://${cname}/caso/`)) {
    fail('sitemap.xml: /caso/ is noindex and must not be listed');
  }
}

if (existsSync(join(root, 'robots.txt'))) {
  const robots = read('robots.txt');
  if (!robots.includes(`https://${cname}/sitemap.xml`)) {
    fail('robots.txt: sitemap URL does not use the custom domain');
  }
}

if (existsSync(join(root, '.github/workflows/deploy.yml'))) {
  const workflow = read('.github/workflows/deploy.yml');
  if (!/branches:\s*\[main\]/.test(workflow)) {
    fail('deploy.yml: expected push deployment from main');
  }
  if (!workflow.includes('actions/deploy-pages')) {
    fail('deploy.yml: GitHub Pages deploy action missing');
  }
}

if (existsSync(join(root, 'manifest.webmanifest'))) {
  try {
    const manifest = JSON.parse(read('manifest.webmanifest'));
    for (const icon of manifest.icons || []) {
      const path = icon.src?.replace(/^\//, '');
      if (path && !existsSync(join(root, path))) {
        fail(`manifest.webmanifest: icon not found at ${icon.src}`);
      }
    }
  } catch (error) {
    fail(`manifest.webmanifest: invalid JSON (${error.message})`);
  }
}

manual.push('Verify Android/iOS deep link on real devices from the public HTTPS URL.');
manual.push('Run Lighthouse and check mobile portrait/landscape and reduced motion.');
manual.push('Confirm GitHub Pages uses GitHub Actions, DNS is valid, and Enforce HTTPS is on.');

if (failures.length) {
  console.error(`RELEASE BLOCKED (${failures.length})`);
  for (const message of failures) console.error(`- ${message}`);
} else {
  console.log('Automated release checks passed.');
}

console.log('\nManual checks still required:');
for (const message of manual) console.log(`- ${message}`);

if (failures.length) process.exit(1);
