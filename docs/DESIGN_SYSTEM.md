# GOKUL GHEE — Editorial Design System

## 1. Brand Personality & Aesthetic Direction

- **Brand Name:** GOKUL GHEE (*Anil Ji Ka Gokul Ghee*)
- **Tagline:** *Tradition in Every Taste.*
- **Visual Direction:** Heritage Indian gourmet storefront merging warm ivory handloom softness, deep temple-courtyard forest green, and brushed brass/gold restraint. Editorial pacing, generous whitespace, crisp borders, zero gaudy gradients or generic glassmorphism.

---

## 2. Color System

| Token | Hex | Usage |
|---|---|---|
| `--color-forest` | `#173D2B` | Primary brand color, announcement bar, primary CTAs, footer, dark editorial bands |
| `--color-forest-deep` | `#102B1E` | Hover states on primary actions, deep contrast panels |
| `--color-ivory` | `#F8F4E9` | Primary page canvas, warm surface backgrounds |
| `--color-ivory-card` | `#FCF9F2` | Elevated surface cards, modals, input backgrounds |
| `--color-sand` | `#EDE6D4` | Subtle dividers, image frames, soft alternate section tint |
| `--color-gold` | `#C9A34A` | Heritage accents, eyebrow rules, luxury highlights, active indicators |
| `--color-gold-muted` | `#A8832E` | Accessible gold text/icons on light ivory surfaces |
| `--color-charcoal` | `#242424` | Primary body copy and headings |
| `--color-muted` | `#5E5B52` | Captions, metadata, helper labels |
| `--color-border` | `rgba(23, 61, 43, 0.14)` | Crisp editorial hairlines |

---

## 3. Typography

- **Display / Editorial Serif:** `'Cormorant Garamond', Georgia, serif` — Hero titles, section headings, product titles, heritage storytelling quotes.
- **Body / UI Sans:** `'Plus Jakarta Sans', system-ui, -apple-system, sans-serif` — Navigation, filters, pricing, specifications, forms, buttons.
- **Numeric Precision:** `font-variant-numeric: tabular-nums` for INR currency (`₹`), weights (`250g`, `500g`, `1kg`), and pincodes.

---

## 4. Layout & Spacing Rhythm

- Max content container: `1280px` (`max-w-7xl`) with `px-4 sm:px-6 lg:px-8`
- Section vertical rhythm: `py-16 lg:py-24`
- Radius system: Restraint-first — `rounded-sm` (`4px`) to `rounded-lg` (`10px`) for editorial sharpness; pill badges only for compact status tags.
- Elevation: Hairline `1px` borders with gentle warm shadow on hover (`0 12px 32px -12px rgba(23, 61, 43, 0.12)`).
