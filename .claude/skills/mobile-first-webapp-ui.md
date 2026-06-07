---
name: mobile-first-webapp-ui
description: >
  Professional UI/UX design skill for mobile-first web applications. Use when
  designing or building responsive webapps, SaaS dashboards, landing pages,
  PWAs, or any browser-based interface where the mobile viewport is the primary
  design target. Triggers on: "design a mobile-first page", "make this
  responsive", "build a webapp UI", "create a SaaS dashboard", "design an
  onboarding flow", "improve the mobile UX", "build a responsive component".
---

Great mobile-first web UI isn't about flashiness — it's about intentionality.
Every spacing value, breakpoint, and color choice should serve the user on the
smallest screen first, then scale up gracefully.

## Core Philosophy

Design for the 320–390px viewport first. Everything else is progressive
enhancement. If it works beautifully on a small phone, it will work everywhere.

## Design Laws (non-negotiable)

- **60/30/10 Color Rule** — 60% neutral background, 30% complementary surface,
  10% accent/action color.
- **8-Point Spacing Grid** — All padding, margin, and gap values must be
  multiples of 4 or 8 (4, 8, 12, 16, 24, 32, 48, 64…). Never use arbitrary
  values like 13px or 22px.
- **Touch Target Minimum** — Interactive elements must be at least 44×44px
  (48px preferred). Never make tap targets smaller to save space.
- **Thumb Zone** — Primary CTAs and navigation live in the bottom 40% of the
  viewport on mobile. Top-left/top-right corners are hardest to reach; use them
  only for passive elements (logo, back button).
- **Typography Hierarchy** — Maximum 3–4 type sizes per screen. Use fluid
  typography (`clamp()`) so text scales between breakpoints without jumps.
- **F / Z Pattern** — Users scan left-to-right, top-to-bottom. Place the most
  important content and actions along this natural path.
- **Peak-End Rule** — Users remember the most emotionally intense moment and the
  final moment of a flow. Design those two moments with extra care.

## 5-Step Design Process

### 1. Context
Before writing a single line, answer:
- What is the user trying to accomplish on this screen?
- What device/viewport is most likely? (default: mobile 390px)
- What is the emotional tone? (calm/trustworthy, energetic/playful, premium/minimal…)
- What is the ONE action this screen exists to drive?

### 2. Structure (mobile skeleton first)
- Define the content hierarchy: what is H1, what is body, what is metadata?
- Place the primary CTA in thumb reach (bottom area on mobile).
- Decide navigation pattern: bottom nav bar, hamburger, tab bar, or none.
- Use a single-column layout by default. Introduce 2+ columns only at ≥768px.

### 3. Visual Design
Apply the rules below. Do not deviate.

**Typography**
```
Display / Hero:  clamp(28px, 5vw, 48px),  weight 700–900
Section title:   clamp(20px, 3.5vw, 32px), weight 600–700
Body:            clamp(15px, 2vw, 17px),   weight 400, line-height 1.5–1.65
Caption / meta:  13–14px,                  weight 400–500, muted color
```
Choose fonts that have character. Avoid Inter, Roboto, Arial, system-ui as
primary display fonts — they read as generic. Pair a distinctive display font
with a clean body font. Import from Google Fonts or use a web-safe alternative.

**Color**
- Define a CSS custom property palette: `--color-bg`, `--color-surface`,
  `--color-border`, `--color-text`, `--color-text-muted`, `--color-accent`,
  `--color-accent-hover`.
- Maintain WCAG AA contrast (4.5:1 for body text, 3:1 for large text/UI).
- Use a single accent color for all interactive elements (links, buttons,
  focus rings). Consistency = trust.

**Spacing**
Always use the 8-point grid. In Tailwind: stick to `p-2 p-3 p-4 p-6 p-8 p-12
p-16`. Never mix arbitrary values in the same component.

**Shadows & Depth**
Mobile-first means flat-first. Use shadows sparingly — only to lift interactive
cards or modals above the content layer. One shadow scale is enough:
```css
--shadow-sm: 0 1px 3px rgb(0 0 0 / 0.08);
--shadow-md: 0 4px 16px rgb(0 0 0 / 0.10);
--shadow-lg: 0 8px 32px rgb(0 0 0 / 0.14);
```

### 4. Responsive Scaling

Design breakpoints (mobile-first, min-width):
```
Default (mobile):  0px     — single column, stacked layout
sm:               480px    — minor adjustments, larger touch targets
md:               768px    — optional 2-column, sidebar appears
lg:               1024px   — full desktop layout unlocked
xl:               1280px   — max-width container, generous whitespace
```

Rules for scaling up:
- Increase font sizes via `clamp()`, not media query overrides.
- Side navigation replaces bottom nav at `md:`.
- Cards can go from full-width to grid at `md:` or `lg:`.
- Max content width: 1200–1440px, always centered.
- Never hide mobile-only content on desktop with `hidden md:block` tricks —
  restructure instead so all content is meaningful at every breakpoint.

### 5. Polish & Micro-interactions

Add life without noise:
- **Hover states**: subtle background shift or scale(1.02) on cards/buttons.
- **Focus rings**: always visible, styled to match the accent color
  (`outline: 2px solid var(--color-accent); outline-offset: 2px`).
- **Loading states**: skeleton loaders (not spinners) for content areas.
- **Transitions**: `transition: all 150ms ease` on interactive elements. Never
  exceed 300ms for UI feedback; reserve 400–600ms for page-level transitions.
- **Empty states**: design them. A blank list or zero results state needs a
  message, an illustration or icon, and ideally a CTA.

## Navigation Patterns by Context

| Context | Mobile pattern | Desktop escalation |
|---|---|---|
| SaaS / dashboard | Bottom tab bar (4–5 items) | Left sidebar, always visible |
| Marketing / landing | Hamburger menu or scroll-driven | Inline top nav |
| E-commerce / catalog | Bottom bar + search icon | Top nav + mega menu |
| Onboarding flow | No nav, just progress indicator | Same, centered layout |
| Content / blog | Minimal top bar | Top nav + TOC sidebar |

## Component Patterns

**Buttons**
```
Primary:    bg-accent, text-white, rounded-lg, min-h-[44px], px-6, font-semibold
Secondary:  border border-accent, text-accent, bg-transparent (same sizing)
Ghost:      text-accent, no border (use only in toolbars/dense UIs)
Destructive: bg-red-600, text-white (same sizing as primary)
Full-width on mobile by default; auto-width at md:
```

**Cards**
- Rounded corners: `rounded-xl` (12px) for content cards, `rounded-2xl` (16px)
  for feature/hero cards.
- Padding: `p-4` on mobile, `p-6` at md+.
- Always define a hover state if the card is interactive.

**Forms**
- Input height minimum: 44px.
- Label always above the input, never placeholder-only.
- Error messages below the field, in red, with an icon.
- Keyboard type hints: `inputmode="numeric"`, `type="email"`, `type="tel"` etc.
- On mobile, the submit button must be visible without scrolling (sticky footer
  or positioned within thumb reach).

**Modals / Bottom Sheets**
- On mobile: use a bottom sheet (slides up from bottom) not a centered modal.
- Bottom sheet max-height: 90vh, with a drag handle indicator.
- At md+: switch to centered modal with backdrop.
- Always trap focus and support `Escape` to close.

## Webapp-Specific Patterns (NOT native app patterns)

These are browser-based webapps. Avoid native app conventions that feel wrong
on the web:

❌ Do NOT use:
- Swipe-to-delete (no browser fallback)
- Native-style tab bars with icons only (add labels)
- Platform-specific icons (SF Symbols, Material icons out of context)
- Full-screen takeover animations that fight browser chrome
- Scroll hijacking

✅ DO use:
- URL-based navigation (deep-linkable routes)
- Browser-native form behaviors (autofill, password manager support)
- Semantic HTML (`<nav>`, `<main>`, `<section>`, `<button>`, `<a>`)
- CSS scroll-snap for carousels/sliders
- `position: sticky` for headers and CTAs
- `@media (hover: hover)` to gate hover-only interactions

## Anti-Patterns (never do these)

- **Horizontal scroll on mobile** — unless it's an intentional carousel with
  visible affordance.
- **Text under 13px** — unreadable on most mobile screens.
- **Tap targets under 44px** — causes mis-taps, fails accessibility.
- **Auto-playing video/audio** — always user-initiated.
- **Modals on modals** — one layer of overlay maximum.
- **Disabled buttons with no explanation** — either explain why or hide the
  button until valid.
- **Infinite scroll with no footer** — trap. Use "Load more" or pagination.
- **Color as the only status indicator** — always pair with an icon or label
  (accessibility).
- **Fixed heights on text containers** — content will overflow on small screens
  or with dynamic data.

## Implementation Stack

This skill targets:
- **React + Tailwind CSS** (primary)
- **HTML + CSS custom properties** (for vanilla/artifact contexts)
- **Lucide React** for icons (consistent, tree-shakeable)
- **Recharts** for data visualization
- **CSS transitions** for micro-interactions (no heavy animation libraries
  unless the brief calls for it)

For Tailwind: always use the responsive prefix order `base → sm: → md: → lg:`.
Never write desktop styles first and override down.

## Quick Reference

```
Spacing grid:     4 / 8 / 12 / 16 / 24 / 32 / 48 / 64px
Touch minimum:    44×44px (48px preferred)
Body font size:   clamp(15px, 2vw, 17px)
Line height:      1.5–1.65 for body, 1.1–1.3 for headings
Border radius:    4px (inputs), 8px (buttons), 12px (cards), 16px (modals)
Transition:       150ms ease (UI), 250ms ease (layout), 400ms ease (page)
Max content width: 1200–1440px
Color contrast:   4.5:1 body, 3:1 large text / UI elements
Breakpoints:      480 / 768 / 1024 / 1280px (min-width, mobile-first)
```
