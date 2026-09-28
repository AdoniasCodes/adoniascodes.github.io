# Design System: adoniasnigussie portfolio ("Signal", 2026 redesign)

Branch `redesign-2026` replaces the warm brutalist-lite system (still on `main` until approved). Copy, routes, and links are unchanged; only the look and motion changed.

Scene: a founder or hiring manager opens the link from a LinkedIn DM or cold email on a laptop during the workday and decides in ten seconds whether this is a real growth operator. So: loud, confident, numbers first, fast.

## Palette (OKLCH, tokens in `src/styles/global.css`)

| Token | Value | Hex | Use |
|---|---|---|---|
| `--signal` | oklch(0.64 0.2 36) | #ec5022 | Committed brand color: home hero drench, highlight bars, CTAs on ink |
| `--ink` | oklch(0.2 0.014 40) | #1c1411 | Text, borders, metrics band, footer, last service panel |
| `--base` | oklch(0.972 0.004 40) | #f8f5f4 | Page background (true off-white, not cream) |
| `--base-2` | oklch(0.935 0.008 40) | #efe8e5 | Alt sections (services, remote) |
| `--amber` | oklch(0.83 0.15 78) | #fcba43 | Figures on ink, tags, stickers |
| `--signal-deep` | oklch(0.5 0.18 36) | #b22900 | Small signal-colored text on base (6:1) |

Contrast rules: text on `--signal` is always `--ink` (4.9:1), never `--ink-2` (fails). Body on base uses `--ink-2` (10:1).

## Type

One family, chosen deliberately: **Archivo Variable with the width axis** (`@fontsource-variable/archivo/wdth.css`, self-hosted, latin file preloaded). Display = weight 860 to 900 at `font-stretch: 125%`, uppercase, tight leading. Body = 100% width, 400 to 650. Width is the signature: headings with `data-stretch` widen from 68% to 125% as they scroll in (growth, literally).

## 3D and motion

- **Hero growth engine** (`src/scripts/growth-engine.js`, three.js Points + custom shader): leads swirl into a funnel behind the portrait and leave as a rising revenue curve. Leans toward the cursor. Loads after the `load` event plus idle, so it never touches LCP. Reduced motion renders one still frame.
- **Globe** (`src/scripts/globe.js`): Natural Earth 110m land rasterised to a bitmask (`land-mask.js`), arcs from Addis to Estonia, UK, Italy. Drag to spin (horizontal only, `touch-action: pan-y` keeps page scroll), arrow keys when focused. Mounted 600px before it enters view.
- **Scroll** (`src/scripts/scroll.js`): Lenis smooth scroll + GSAP ScrollTrigger. Nav melts into the hero, turns solid, hides on scroll down. Ticker speed follows scroll velocity. Metrics wipe in and widen. Service panels stack (sticky) and tip back. Quotes counter-rotate. Footer name rises and widens.
- **Pointer**: magnetic buttons, 3D tilt on photos, work rows get an ink wipe plus a cursor-following vermilion preview card (fine pointer, 60rem+ only).
- Page transitions: CSS cross-document view transitions (no JS).
- Everything is enhancement: content is visible with JS off, and `prefers-reduced-motion` disables Lenis, GSAP, and all transitions.

## Performance budget (Lighthouse, 2026-09-28)

Mobile 97 / 100 / 100 / 100, desktop 100 across the board. CSS is inlined (`build.inlineStylesheets: 'always'`). three.js (~129KB gz) is lazy-loaded only on the home page.

## Hard bans (unchanged intent)

Em dashes in any copy · cream/sand body backgrounds · gradient text · glassmorphism · identical card grids · numbered section eyebrows · vanishing toasts (contact form uses a blocking dialog with OK) · text overflow at any breakpoint.

## Gotchas

- `public/.nojekyll` MUST exist or GitHub Pages drops `_astro/` and the site loses CSS.
- Astro JSX: a newline between `{expr}` and `<span>` renders a space (it broke "$22K" into "$ 22 K" once). Keep numeral parts on one line.
- GSAP `filter` tweens from `none` start at brightness(0). Always `fromTo` with `brightness(1)`.
