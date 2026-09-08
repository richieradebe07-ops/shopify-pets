# RL Paws Co. — Shopify Theme

"Better Product, Happier Paws" — a custom Online Store 2.0 theme forked from
Dawn's architecture, built for a high-tech, engineered pet gear brand.
Confident and clean; no cutesy pastel pet-shop clichés.

**Status: work in progress.** This first pass ships the design token system
(`assets/base.css`) and the Hero section end-to-end (markup, styles, schema,
motion) as a checkpoint before the remaining sections and templates are
built out.

## Setup

1. Install the [Shopify CLI](https://shopify.dev/docs/api/shopify-cli).
2. From the repo root: `shopify theme dev --store <your-store>.myshopify.com`
   to preview locally, or `shopify theme push` to upload as a new theme.
3. In the theme customiser, the homepage (`templates/index.json`) already
   has a Hero section added with placeholder RL Paws Co. copy — edit its
   settings there, no code required.

## Directory structure

```
assets/     CSS/JS/SVG served as static files (one file = one HTTP asset)
config/     settings_schema.json (customiser panel) + settings_data.json
layout/     theme.liquid — the HTML shell every page renders inside
locales/    translatable / editable UI strings
sections/   customiser-editable, schema-driven page building blocks
snippets/   small reusable Liquid partials, included by sections/templates
templates/  JSON templates that assemble sections per page/resource type
```

## Design tokens (`assets/base.css`)

All brand colour, type, spacing and motion values are CSS custom properties
on `:root`, so every section pulls from the same source of truth.

| Token | Value | Use |
|---|---|---|
| `--ink` | `#0F1419` | Dark section backgrounds, primary text on light |
| `--bone` | `#FAF6F0` | Light section backgrounds, primary text on dark |
| `--signal` | `#14C8B4` | Primary CTAs, active states, functional/interactive accents (large fills, icons, borders) |
| `--signal-ink` | `#0E7A6E` | **Text-safe** teal — small text/icon strokes on light backgrounds |
| `--amber` | `#F2A65A` | Secondary accent — emotional/organic warmth (large fills, icons, borders) |
| `--amber-ink` | `#A85818` | **Text-safe** amber — small text/icon strokes on light backgrounds |
| `--slate-60` | `#5A6472` | Muted body copy |
| `--line` | `#E4DDD2` | Hairline borders/dividers |

**Why the `-ink` variants exist:** raw `--signal` on `--bone` measures
~1.96:1 contrast, and raw `--amber` on `--bone` measures ~1.88:1 — both fail
WCAG AA at any text size (AA needs 4.5:1 for body text, 3:1 for large
text/UI). Rather than mute the brand swatches themselves, `--signal-ink` and
`--amber-ink` are darkened variants that pass AA (4.84:1 and 4.79:1 on
`--bone` respectively). **Rule of thumb: teal/amber for backgrounds, large
graphics, icons, and borders; the `-ink` version any time that colour sits
behind small text on a light surface.**

Typography: headings use Space Grotesk 600/700 at `-0.02em` tracking; body
uses Inter 400/500 at 16px / 1.6 line-height. Both load via Google Fonts
with `font-display: swap` and are preconnected in `layout/theme.liquid`.
The full type scale (`--text-xs` … `--text-5xl`) is fluid via `clamp()`,
scaling smoothly between a 320px and 1440px viewport with no breakpoint
jumps.

Motion tokens (`--ease-reveal`, `--duration-*`, `--stagger-step`) are zeroed
under `prefers-reduced-motion: reduce`, so most components don't need their
own reduced-motion override — they just stop moving because the duration is
`0ms`. Motion never animates layout properties, only `transform`/`opacity`.

## Section-by-section editability

Every section under `sections/` is schema-driven — merchants edit copy,
media, links and layout options entirely from **Online Store → Customize**,
no code changes required. Current sections:

- **Hero** (`sections/hero.liquid`) — eyebrow, headline, subheading, rich
  text body, background image *or* video, overlay darkness (0–80%), content
  alignment, and two independently-configurable CTA buttons (label + link).
  The headline reveals word-by-word on load (pure CSS, staggered via a
  per-word custom property set in Liquid — no JS needed for this effect);
  the background does a slow Ken Burns drift. Both are disabled under
  `prefers-reduced-motion: reduce`.

Remaining sections (announcement bar, header, trust marquee, featured
collection, bundle showcase, problem/solution, stats band, testimonials,
UGC grid, newsletter, footer) and the product page are the next pass.

## Accessibility notes

- Skip-to-content link, semantic landmarks, and a visible `--signal` focus
  ring on every interactive element (`:focus-visible` in `base.css`).
- Form fields always keep the native cursor (`cursor: auto !important`) —
  the custom cursor never covers a text field's I-beam.
- The custom cursor (`assets/cursor.js`) only initialises when
  `(hover: hover) and (pointer: fine)` matches and bails out entirely under
  reduced motion; it never calls `preventDefault`, so it can't block or
  delay a click.
- `assets/motion.js` marks `[data-reveal]` elements visible immediately if
  JavaScript never loads (progressive enhancement — see the `.js` class
  toggle in `layout/theme.liquid` and its use in `base.css`), so content is
  never stuck invisible.

## Performance

- Vanilla JS only, split into small single-purpose files (`cursor.js`,
  `motion.js`, per-section scripts as they're added) and loaded with
  `defer` so nothing blocks first paint.
- Hero image loads eagerly with `fetchpriority="high"` and a full
  responsive `srcset` (640–2560w) via Shopify's `image_url` filter; every
  other section will lazy-load below-fold images.
- CSS is split per-component (`base.css` for tokens/global, `section-*.css`
  per section) so a template only downloads styles for the sections it
  actually renders.
