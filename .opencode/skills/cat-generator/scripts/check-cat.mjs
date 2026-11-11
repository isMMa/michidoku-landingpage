#!/usr/bin/env node
import { createRequire } from 'node:module';
import { join } from 'node:path';
import { fileURLToPath } from 'node:url';

const require = createRequire(import.meta.url);
const root = fileURLToPath(new URL('../../../../', import.meta.url));
const cats = require(join(root, 'cats.js'));

const failures = [];
function check(condition, message) {
  if (!condition) failures.push(message);
}

for (const name of [
  'generateCatDna',
  'renderCat',
  'catTraits',
  'isGoldenName',
  'randomName',
  'escapeHtml',
]) {
  check(typeof cats[name] === 'function', `missing API function ${name}`);
}

check(Array.isArray(cats.NAMES) && cats.NAMES.length > 0, 'NAMES must be a non-empty array');
const names = new Set();
for (const entry of cats.NAMES || []) {
  check(typeof entry.name === 'string' && entry.name.length > 0, 'NAMES entry missing name');
  check(typeof entry.color === 'string' && entry.color.length > 0, `NAMES ${entry.name}: missing color`);
  check(!names.has(entry.name), `duplicate NAMES entry: ${entry.name}`);
  names.add(entry.name);
}

const simba = (cats.NAMES || []).find((item) => item.name === 'Simba');
check(simba?.color === 'naranja-atigrado', 'canonical name Simba must keep color naranja-atigrado');

check(cats.isGoldenName('Dorado'), 'Dorado must be golden');
check(cats.isGoldenName('golden'), 'golden must be golden');
check(cats.isGoldenName('Michidoku'), 'Michidoku must be golden');
check(!cats.isGoldenName('Misi'), 'Misi must not be golden');
check(
  cats.renderCat({ name: 'Dorado', color: 'dorado' }).includes('cat-crown'),
  'Dorado must render the golden crown'
);

for (const [name, color] of [
  ['Misi', 'naranja'],
  ['Simba', 'naranja-atigrado'],
  ['Dorado', 'dorado'],
  ['michi-123', undefined],
]) {
  const first = cats.generateCatDna(name, color);
  const second = cats.generateCatDna(name, color);
  check(
    JSON.stringify(first) === JSON.stringify(second),
    `DNA for ${name} is not deterministic`
  );
  check(first.name === name.trim(), `DNA for ${name} changed the display name`);
}

const dna = cats.generateCatDna('Misi', 'naranja');
const rendered = cats.renderCat({
  name: 'Misi',
  color: 'naranja',
  size: 123,
  label: 'Michi Misi',
});
check(rendered.startsWith('<svg'), 'renderCat must return an SVG string');
check(rendered.includes('role="img"'), 'rendered SVG missing role="img"');
check(rendered.includes('<title>Michi Misi</title>'), 'rendered SVG missing escaped title');
check(rendered.includes('aria-label="Michi Misi"'), 'rendered SVG missing aria-label');
check(rendered.includes('width="123"'), 'renderCat did not honor size');
check(rendered.includes('cat-svg'), 'rendered SVG missing cat-svg class');

const still = cats.renderCat({ name: 'Misi', animated: false });
check(still.includes('cat-svg--still'), 'animated:false must add cat-svg--still');

const unsafe = cats.renderCat({ name: '<script>', label: '<script>' });
check(!unsafe.includes('<script>'), 'renderCat must escape user-controlled strings');
check(unsafe.includes('&lt;script&gt;'), 'renderCat did not HTML-escape the label');

const firstIds = [...rendered.matchAll(/\bid="([^"]+)"/g)].map((match) => match[1]);
const secondIds = [...cats.renderCat({ name: 'Misi' }).matchAll(/\bid="([^"]+)"/g)].map(
  (match) => match[1]
);
const sharedIds = firstIds.filter((id) => secondIds.includes(id));
check(firstIds.length > 0, 'rendered SVG must contain internal IDs');
check(sharedIds.length === 0, `repeated renders reused IDs: ${sharedIds.join(', ')}`);

const traits = cats.catTraits(dna, false);
check(Array.isArray(traits) && traits.length === 6, 'catTraits must return six traits');
check(traits.every((trait) => trait.label && trait.value), 'catTraits returned an empty trait');

const random = cats.randomName('Misi');
check(typeof random === 'string' && names.has(random), 'randomName must return a known name');

check(cats.escapeHtml('<>&"\'') === '&lt;&gt;&amp;&quot;&#039;', 'escapeHtml output changed');

if (failures.length) {
  console.error(`FAIL (${failures.length})`);
  for (const message of failures) console.error(`- ${message}`);
  process.exit(1);
}

console.log('Cat generator contract checks passed.');
