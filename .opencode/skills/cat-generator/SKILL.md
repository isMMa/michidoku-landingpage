---
name: Michidoku cat generator
description: Use when changing cats.js, cat names, DNA generation, SVG rendering, accessories, golden cats, cat animations, or anything that must stay visually and deterministically compatible with the Michidoku game.
---

# Michidoku cat generator

## Workflow

1. Read `references/cat-contract.md` and the relevant parts of `cats.js`.
2. Decide whether the change is a **port** from the game or a
   **landing-only** addition. If it is a port, compare against the game source
   named in the contract and keep the same behavior.
3. Make the change without altering the name hash, existing name→color
   mappings, trait mappings, or canonical-name secrets unless the game itself
   changed.
4. Run the contract check:

   ```bash
   node .opencode/skills/cat-generator/scripts/check-cat.mjs
   ```

5. Verify visually in a browser:

   ```bash
   python -m http.server 8080
   ```

   Check the hero, generator lab, accessory chips, download SVG, gallery,
   `/caso/?size=6&seed=123`, `/404.html`, and the golden cat. Also check with
   reduced motion enabled.

## Rules

- Determinism is in `generateCatDna`, not in the serialized SVG:
  `renderCat` adds a per-render `uid`, so two renders of the same cat have
  different internal IDs. Compare DNA, not full SVG strings.
- Keep the file usable both as a browser global and a CommonJS module.
- Do not call DOM APIs or `Math.random` during module initialization.
- Keep `renderCat` output accessible: `role="img"`, `<title>`, and
  `aria-label` must remain, and all user-controlled strings must go through
  `escapeHtml` / `escapeAttr`.
- Keep `animated: false` producing `cat-svg--still`; animations belong in
  `styles.css` under `cat-*` classes, not inline keyframes.
- Adding a gallery name means updating `NAMES` with a color that matches the
  coat family; do not add a name without checking `COATS_POR_COLOR` and
  `COAT_POR_NOMBRE`.
- The landing copy is Spanish; trait labels and generated names are Spanish.
  Do not introduce an English-only name unless the game does.
