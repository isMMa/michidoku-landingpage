# Cat generator contract

## Source of truth

`cats.js` is a pure-JavaScript port of these game files (per `README.md`):

- `michidoku-catgame/src/util/cats/catDna.ts` — deterministic DNA.
- `michidoku-catgame/src/util/cats/CatKawaii.tsx` — kawaii SVG drawing.

If the game changes those files, port the change deliberately; do not invent
a landing-only variant of an existing trait.

## Public API

Attached as `window.MichidokuCats` and `module.exports`:

- `generateCatDna(name, color?)` → DNA object.
- `renderCat(options)` → SVG string.
- `catTraits(dna, golden?)` → six `{ label, value }` traits.
- `isGoldenName(name)` → boolean.
- `randomName(previous?)` → name string from `NAMES`.
- `escapeHtml(value)` / `escapeAttr(value)`.
- Data: `NAMES`, `TRAITS`, `COATS`.

`renderCat` options: `name`, `color`, `golden`, `accessory`, `size`,
`animated`, `label`, `className`.

## Determinism

`generateCatDna` hashes the trimmed, lowercased name with FNV-1a, then seeds
`mulberry32`. That sequence drives coat, iris, ears, pattern, eyes, mouth,
brows, accessory, animation timing, and idle offsets.

Consequences:

- Same name + same color → identical DNA.
- Changing the hash, the order of random draws, or a mapping changes every
  existing cat.
- `renderCat` increments a module-level `uid` for gradient/clip IDs. Two
  renders of the same cat are visually identical but not byte-identical.
- Canonical names (`Simba`, `Silver`, `Dorado`) and their secrets/colors must
  not drift.

## Golden cat

`GOLDEN_NAMES = ['dorado', 'golden', 'michidoku']`. The golden form uses special
gold gradients, halo, sparkles, and a crown. `renderCat({ golden: true })`
overrides the normal accessory (except `bufanda`/`bow` body extras are still
drawn where applicable); do not rely on the DNA accessory for the crown.

## Name/color families

`NAMES` entries pair a display name with a color key used by
`COATS_POR_COLOR` (`naranja`, `negro`, `naranja-atigrado`, `gris-oscuro`,
`dorado`, `atigrado`, `gris`, `siames`, `blanco`, `chocolate`). The color
keeps the coat plausible (for example Simba is `naranja-atigrado`).

## Animation and accessibility

- CSS animation classes: `cat-svg`, `cat-svg--still`, `cat-root`, `cat-tail`,
  `cat-head`, `cat-ear`, `cat-blink`, `cat-gaze`, `cat-tongue`, `cat-halo`,
  `cat-sparkle`, `cat-shine`, `cat-*--delay` custom properties.
- Animations live in `styles.css`; `prefers-reduced-motion` must disable them.
- SVG output must keep `role="img"`, `<title>`, and `aria-label`.
- The download flow clones the rendered SVG, sets 1024×1024, and serializes
  it; keep the SVG self-contained (no external CSS needed for the static file
  to look correct).
