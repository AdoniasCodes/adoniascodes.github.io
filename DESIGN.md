# Design System: adoniasnigussie portfolio

Locked direction: **Warm brutalist-lite** (mockup C base) + the **live timezone-overlap chart** grafted from mockup B, restyled to C's language. Source of truth for every page and component. Reference implementations: `mockups/direction-c.html` (layout, palette, type, motion) and `mockups/direction-b.html` (timezone chart logic only).

## Palette

| Token | Hex | Use |
|---|---|---|
| `--sand` | `#F5EDDC` | Page background |
| `--sand-deep` | `#ECDFC4` | Bands, surfaces, alt sections |
| `--ink` | `#221A12` | Text, borders, ink blocks. Never pure #000 |
| `--tomato` | `#D9411E` | Accent: chunky underlines, hard offset shadows, primary buttons |
| `--marigold` | `#F2A93B` | Ticker band, tags, stickers, metric figures on ink |
| `--cobalt` | `#2438B8` | Footer CTA band ONLY. Nowhere else |

## Typography

- **Display:** Archivo Black, uppercase, tight leading. Headlines, metric figures, buttons.
- **Body/labels:** Archivo (variable). One grotesque family across the site; no second family, no mono.
- Self-hosted via @fontsource (no Google Fonts CDN in production).

## Signature moves

- 3px ink borders; 6px hard offset shadows (tomato or ink) that press in on hover (translate + shadow shrink).
- Rotated marigold "GMT+3 · ADDIS ABABA" sticker breaking the hero grid.
- Marigold skills marquee/ticker inside an overflow-hidden band; freezes on prefers-reduced-motion; never causes horizontal page scroll.
- Staircase-indented "Selected work" ledger rows (no card grid).
- Testimonial blocks rotated -1deg with tomato shadow.
- Ink-block metrics ledger with marigold figures.
- **Timezone chart (from B):** 24-hour dual-bar diagram mapping US CST and EU CET business hours onto Addis time, live "now" marker via Africa/Addis_Ababa clock. Restyle: sand/ink/tomato, Archivo labels, 3px borders. Lives on the home hero or remote-readiness section.

## Motion

- IntersectionObserver scroll reveals, expo/quint ease-out only. Staggered hero rise on load.
- No bounce, no elastic, no parallax. Content fully visible without JS (`.js` gate). `prefers-reduced-motion` disables everything.

## Hard bans

Inter/Roboto/Arial/system-ui as visible fonts · purple or blue-purple gradients · pure #000/#fff · untinted grays · uniform 16px radius (radius is 0 to 2px here) · cards nested in cards · bento reflex grids · glassmorphism/radial glows · em dashes in any copy · lorem ipsum · vanishing toast errors (blocking modal with OK instead).

## Components

Nav (wordmark + Work/About/Contact, wraps on mobile) · Footer (cobalt CTA band) · MetricsLedger · WorkLedger (staircase) · Testimonial · TimezoneChart · Ticker · Sticker · ContactForm (Netlify, blocking success/error modals) · ScrollReveal script.
