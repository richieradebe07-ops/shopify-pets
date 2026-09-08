# RL Paws Co. — Shopify Theme

"Better Product, Happier Paws" — a custom Online Store 2.0 theme built on
Dawn's architecture (JSON templates, schema-driven sections, vanilla JS,
no jQuery) for a high-tech, engineered pet gear brand. Confident and
clean — no cutesy pastel pet-shop clichés.

## Setup

1. Install the [Shopify CLI](https://shopify.dev/docs/api/shopify-cli).
2. From the repo root: `shopify theme dev --store <your-store>.myshopify.com`
   to preview locally, or `shopify theme push` to upload as a new theme.
3. Add a **main menu** (`main-menu`) and **footer menu** (`footer`) in
   Shopify admin → Navigation — the header and footer both look for these
   handles by default (editable in the customiser under Header/Footer).
4. Everything else — homepage content, product page copy, trust badges,
   testimonials — is pre-filled with RL Paws Co. placeholder copy and
   editable entirely from **Online Store → Customize**. No code changes
   required for day-to-day content edits.

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

CSS and JS are split per-component (`section-<name>.css/.js`,
`component-product-card.css`) rather than bundled, so a given page only
downloads styles/scripts for the sections it actually renders. Everything
is vanilla JS, loaded with `defer` — **total JS across every file in the
theme is ~31KB uncompressed / ~8KB gzipped**, and no single page loads all
of it (the heaviest page, product, loads ~26KB uncompressed / ~6.5KB
gzipped) — comfortably inside the 200KB budget for 4G Android traffic.

## Design tokens (`assets/base.css`)

All brand colour, type, spacing and motion values are CSS custom
properties on `:root`, so every section pulls from the same source of
truth.

| Token | Value | Use |
|---|---|---|
| `--ink` | `#0F1419` | Dark section backgrounds, primary text on light |
| `--bone` | `#FAF6F0` | Light section backgrounds, primary text on dark |
| `--signal` | `#14C8B4` | Primary CTAs, active states, functional/interactive accents (large fills, icons, borders) |
| `--signal-ink` | `#0E7A6E` | **Text-safe** teal — small text/icon strokes on light backgrounds |
| `--amber` | `#F2A65A` | Secondary accent — emotional/organic warmth (large fills, icons, borders) |
| `--amber-ink` | `#A85818` | **Text-safe** amber — small text/icon strokes on light backgrounds |
| `--slate-60` | `#5A6472` | Muted body copy (on light backgrounds only — see below) |
| `--line` | `#E4DDD2` | Hairline borders/dividers |

**Why the `-ink` variants exist:** raw `--signal` on `--bone` measures
~1.96:1 contrast, and raw `--amber` on `--bone` measures ~1.88:1 — both
fail WCAG AA at any text size (AA needs 4.5:1 for body text, 3:1 for large
text/UI). Rather than mute the brand swatches themselves, `--signal-ink`
and `--amber-ink` are darkened variants that pass AA (4.84:1 and 4.79:1 on
`--bone` respectively). **Rule of thumb: teal/amber for backgrounds, large
graphics, icons, and borders; the `-ink` version any time that colour sits
behind small text on a light surface.**

The same problem exists in reverse for muted text on dark sections:
`--slate-60` on `--ink` is only ~3.1:1, so dark-surface muted copy uses a
separate `.text-muted-inverse` utility (bone at 75% opacity, ~8.8:1 on
`--ink`) instead of `.text-muted`. Eyebrow labels get the same treatment —
`.surface-dark .eyebrow` swaps to raw `--signal` instead of `--signal-ink`,
since the latter is unreadable on a dark surface.

Typography: headings use Space Grotesk 600/700 at `-0.02em` tracking; body
uses Inter 400/500 at 16px / 1.6 line-height. Both load via Google Fonts
with `font-display: swap` and are preconnected in `layout/theme.liquid`.
The full type scale (`--text-xs` … `--text-5xl`) is fluid via `clamp()`,
scaling smoothly between a 320px and 1440px viewport with no breakpoint
jumps.

Motion tokens (`--ease-reveal`, `--duration-*`, `--stagger-step`) are
zeroed under `prefers-reduced-motion: reduce`, so most components don't
need their own reduced-motion override — they just stop moving because the
duration is `0ms`. Every JS-driven effect (cursor, tilt, magnetic buttons,
counters, marquee) additionally checks `matchMedia` and skips its own setup
entirely under reduced motion, rather than relying on CSS alone. Motion
never animates layout properties, only `transform`/`opacity` — the one
documented exception is the header's scroll-shrink `padding-block`, a rare
discrete state change (not a per-frame effect) explained in a comment in
`assets/section-header.css`.

## Sections (all schema-driven — no code edits needed)

| Section | What's editable |
|---|---|
| **Announcement bar** | Repeatable message blocks (text + link), rotation speed. Dismissible; dismissal is remembered for the browser session. |
| **Header** | Logo, logo width, menu, header shrink-on-scroll toggle. Desktop dropdown nav + mobile off-canvas menu (native `<details>` accordions), predictive search, cart trigger with live count badge. |
| **Hero** | Eyebrow, headline (reveals word-by-word on load, pure CSS), subheading, rich-text body, background image *or* video (slow Ken Burns drift), overlay darkness, alignment, two independent CTA buttons. |
| **Trust marquee** | Repeatable badge blocks (icon + label). Continuous CSS-only scroll; reduced motion swaps to a static scrollable row. |
| **Featured collection** | Eyebrow, heading, collection picker, product count, "view all" label. 3-up desktop / 2-up mobile tilt cards, teal underline-wipe titles, quick-add. |
| **Bundle showcase** | Bundle product picker + up to 4 component-product blocks. Rand saving is computed live from real product prices, not typed in by hand. |
| **Problem / solution** | Up to 4 alternating image/copy rows, each with its own pain-point line, solution heading, body and CTA link. |
| **Animated stats band** | Up to 4 stat blocks (value, decimals, suffix, label). Counts up on scroll into view; reduced motion shows the final number instantly. |
| **Testimonials** | Up to 12 blocks (photo, star rating, quote, author, location). Swipeable via native scroll-snap on touch; arrow buttons + keyboard arrows on desktop. |
| **Instagram grid** | Up to 6 image/link tiles, hover zoom. |
| **Newsletter** | Image, eyebrow, heading, body, button label. Wired to Shopify's native customer form (works with JS off); inline email validation on top. |
| **Footer** | Brand blurb, 4 social links, 3 configurable link-list columns, payment icons (from `shop.enabled_payment_types`), copyright suffix, legal link list (POPIA/privacy/terms). |
| **Product information** (product page) | Star rating toggle, trust-row copy (3 items), delivery estimate min/max business days, shipping & returns rich text, up to 3 "frequently bought together" product blocks. |
| **Cart drawer** | Free-shipping progress-bar threshold (defaults to R600, matching the announcement bar). |

Global custom cursor (`assets/cursor.js`) and scroll-reveal/magnetic-button
utilities (`assets/motion.js`) are theme-wide, not per-section settings.

## Product page

- Sticky add-to-cart bar slides in on mobile once the real button scrolls
  out of view (`IntersectionObserver`); tapping it submits the real form.
- Gallery: thumbnail strip + a full-screen lightbox on tap; the lightbox
  image uses `touch-action: pinch-zoom` so pinch-zoom is the browser's
  native gesture, not reimplemented in JS.
- Variant picker renders as pills (not a `<select>`), matched against an
  embedded JSON blob of all variants (id, price, availability, image) so
  switching is instant with no network round-trip.
- Delivery estimate walks forward N business days (skipping weekends) from
  today using the merchant-set min/max day range.
- Description / shipping / returns as native `<details>` accordions — free
  keyboard support and no JS required for the interaction itself.
- Frequently-bought-together: companion products are pre-checked with a
  live running total; "Add all to cart" posts a single multi-line
  `/cart/add.js` request.
- Cart drawer and product page both use Shopify's Ajax Cart API `sections`
  parameter so the drawer's own Liquid re-renders itself after every
  mutation — there's no hand-rolled client-side templating of cart line
  items to drift out of sync with the server-rendered markup.

## Accessibility

- Skip-to-content link, semantic landmarks, and a visible `--signal` focus
  ring on every interactive element (`:focus-visible` in `base.css`).
- All colour pairings are AA-checked — see the token table above for the
  two corrections made (the `-ink` variants and `.text-muted-inverse`).
- Form fields always keep the native cursor (`cursor: auto !important`) —
  the custom cursor never covers a text field's I-beam, and it hides
  itself over any field so the real I-beam is unambiguous.
- The custom cursor only initialises when `(hover: hover) and
  (pointer: fine)` matches and bails out entirely under reduced motion; it
  never calls `preventDefault`, so it can't block or delay a click.
- Icon-only buttons all carry `aria-label`; the variant picker uses
  `role="radiogroup"`/`role="radio"` with `aria-checked`, not a native
  `<select>`, since pills were a specific requirement — screen readers
  still get correct single-choice semantics.
- `assets/motion.js` marks `[data-reveal]` elements visible immediately if
  JavaScript never loads (the `.js` class is only added by an inline
  script in `<head>`, and `[data-reveal]`'s hidden starting state in
  `base.css` is scoped under `.js` — so content is never stuck invisible
  without JS).

## Performance

- Vanilla JS only, split into small single-purpose files loaded with
  `defer` so nothing blocks first paint. See the JS budget note above.
- Hero image loads eagerly with `fetchpriority="high"` and a full
  responsive `srcset` (640–2560w); every other image (collection grids,
  UGC tiles, product gallery thumbnails, testimonials) uses
  `loading="lazy"` with responsive `srcset`/`sizes` via Shopify's
  `image_url` filter.
- Money formatting for dynamic (JS-driven) price updates — variant
  switching, cart totals — is pre-rendered server-side into embedded JSON
  (`{{ variant.price | money }}`) rather than reimplemented in JS, so
  currency/locale formatting always matches the shop's actual settings.

## Known simplifications (documented trade-offs, not oversights)

- Quick-add on collection grids only works for single-variant products;
  multi-variant products link to the product page ("Select options")
  instead of trying to cram a variant picker into a card.
- The dedicated `/cart` page uses a standard (non-AJAX) form post — the
  cart *drawer* is the fast AJAX path for the common add/adjust flow; the
  full cart page is the no-JS-safe fallback.
- Predictive search hits `/search/suggest.json` directly for a lightweight
  top-5 dropdown; it's a progressive enhancement over the real `/search`
  results page, not a replacement for it.
