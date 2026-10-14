# Design System Master File — Kilowott CRM

> **LOGIC:** This master design system defines the "Lumora-style editorial studio" aesthetic for Kilowott CRM.
> Where aesthetic guidance meets accessibility, accessibility (WCAG 2.1 AA, 4.5:1 minimum contrast, 44px touch targets, prefers-reduced-motion) strictly governs interaction and readability.

---

**Project:** Kilowott CRM (WooCommerce Integration & Agentic AI)  
**Aesthetic Identity:** Lumora-style editorial studio (Light, editorial, premium. Near-white surfaces, deep near-black ink cards, burnt-orange accent, giant radii, pill buttons, springy motion).  
**Generated:** 2026-10-14  

---

## 1. Global Tokens & Theme Specifications

### Color Palette

| Token Name | Hex Value | CSS Variable | Semantic Usage | Minimum Contrast |
|---|---|---|---|---|
| **Background** | `#ffffff` | `--background` | Page background, canvas backing | 21:1 against Ink |
| **Foreground** | `#111111` | `--foreground` | Default high-contrast body text | > 16:1 against Surface |
| **Ink** | `#0a0a0a` | `--ink` | Deep near-black cards, dark header/footer, hero loader | > 18:1 against white text |
| **Muted** | `#8d8d8d` | `--muted` | Secondary labels, timestamps, metadata | >= 4.5:1 against #0a0a0a & #ffffff |
| **Subtle** | `#b6b6b6` | `--subtle` | Subtle helper text, disabled states | Informational non-text elements |
| **Line** | `#e6e5e2` | `--line` | Hairline borders, dividers | Structural separation |
| **Surface** | `#f1f0ee` | `--surface` | Warm near-white cards, pill backgrounds | Primary container surface |
| **Surface-2** | `#e3e2df` | `--surface-2` | Interactive hover fills, table header surface | Interactive surface |
| **Accent** | `#b15f2c` | `--accent` | Warm burnt-orange primary accent | >= 4.5:1 on light and dark |
| **Accent-From** | `#cf8047` | `--accent-from` | Warm burnt-orange gradient start | Gradient accent |
| **Accent-To** | `#97501f` | `--accent-to` | Deep terracotta gradient stop | Gradient accent |
| **Hero-Bg** | `#c9c9c9` | `--hero-bg` | Neutral backdrop tone | Visual framing |

### Radii Scale

- **Pill**: `9999px` (`rounded-full`) — Action buttons, status chips, navigation links
- **Card**: `2rem` (`32px` / `rounded-[2rem]`) — Main section containers, feature panels
- **Card-SM**: `1.25rem` (`20px` / `rounded-[1.25rem]`) — Metric cards, modal panels, drawers
- **Control**: `0.875rem` (`14px` / `rounded-[0.875rem]`) — Input fields, select dropdowns

### Layout Dimensions

- **Container Max-Width**: `88rem` (`1408px`)
- **Page Padding**: `1.25rem` (`20px`) on mobile (< 640px), `2rem` (`32px`) from `sm` breakpoint up
- **Root Font-Scale**: Viewport scaled in `vw` for precision editorial hierarchy:
  - `< 640px`: `4.444444vw`
  - `640px – 1024px`: `1.5625vw`
  - `1024px – 1440px`: `1.111111vw`
  - `1440px – 1920px`: `0.833333vw`

---

## 2. Typography

- **Font Family:** `Onest` (via `next/font/google`, weights 400, 500, 600, 700).
- **Headings Tracking:** Tight tracking `-0.02em` (`tracking-[-0.02em]`).
- **Heading Line-Balance:** Balance headings to avoid orphan words (`text-wrap: balance`).
- **Line Length:** Kept under 80 characters for optimal reading comfort.

---

## 3. Brand Mark & Iconography

- **Brand Mark SVG:**
  ```svg
  <svg viewBox="0 0 48 48" fill="currentColor" class="w-6 h-6">
    <path d="M24 2c2.2 13.8 7.9 19.6 22 22-14.1 2.4-19.8 8.2-22 22-2.2-13.8-7.9-19.6-22-22 14.1-2.4 19.8-8.2 22-22Z" />
  </svg>
  ```
- **Icon Set:** Lucide React icons with explicit `aria-hidden="true"` for decorative icons and `aria-label` on icon-only buttons.
- **Rule:** Never use raw emojis as UI icons.

---

## 4. Motion & Spring Physics

- **Framework:** `framer-motion` springs + `lenis` smooth scroll (paused during modal/drawer overlays).
- **Reveals:** `stiffness: 210, damping: 26`
- **Hovers:** `stiffness: 320, damping: 18, scale: 1.04` on pills.
- **Heading Reveal:** Line-by-line slide up clipped over 900ms.
- **Statement Reveal:** Word-by-word reveal with 35ms stagger.
- **Accessibility:** Fully respects `@media (prefers-reduced-motion: reduce)`. Touch devices disable hover scaling.

---

## 5. Accessibility & UX Contracts

- **Touch Targets:** Minimum `44px x 44px` interactive area on all buttons, links, and triggers.
- **Focus States:** High-visibility outline `focus-visible:ring-2 focus-visible:ring-[#b15f2c] focus-visible:ring-offset-2`.
- **Keyboard Navigation:** Full Tab order, Esc key closes all modals/drawers, focus trapping inside active dialogs.
- **Skip Link:** Accessible skip link to jump directly to `#main-content`.
- **Semantic Structure:** Native `<header>`, `<main>`, `<section>`, `<nav>`, `<footer>`, `<aside>`, `<dialog>` / ARIA role structures.

---

## 6. Pre-Delivery Checklist

- [x] Onest typography loaded with weights 400/500/600/700 and -0.02em heading tracking.
- [x] Design tokens mapped via CSS variables into Tailwind CSS.
- [x] 44px minimum touch targets on all interactive controls.
- [x] 4.5:1 minimum text contrast verified for light and ink surfaces.
- [x] Prefers-reduced-motion media query respected across animations.
- [x] Lenis smooth scrolling configured and stopped during overlays.
- [x] Preserved testids for Vitest and Playwright test suites.
- [x] Zero console warnings and error-free TypeScript build.
