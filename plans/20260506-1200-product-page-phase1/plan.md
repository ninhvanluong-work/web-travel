# ProductPage — Phase 1 Implementation Plan

**Date:** 2026-05-06  
**Status:** pending  
**Scope:** Full UI with mock data — 13 sections, SVG icons, accordion animation, hero carousel  
**Out of scope:** API integration, booking logic, save/share logic (Phase 2+)

---

## Objective

Build the ProductPage as a static, fully styled page using hardcoded mock data matching the Sapa 2D1N trek HTML mockup. All 13 sections must be visually complete and match the spec.

---

## Phases

| #   | File                                                   | Description                                                      | Status  |
| --- | ------------------------------------------------------ | ---------------------------------------------------------------- | ------- |
| 1   | [phase-01-svg-icons.md](./phase-01-svg-icons.md)       | Create 14 SVG files + register in `Icons`                        | pending |
| 2   | [phase-02-components.md](./phase-02-components.md)     | Build 11 section components in `ProductPage/components/`         | pending |
| 3   | [phase-03-module-index.md](./phase-03-module-index.md) | `ProductPage/index.tsx` — mock data + compose all sections       | pending |
| 4   | [phase-04-page-entry.md](./phase-04-page-entry.md)     | `src/pages/product.tsx` — page entry, no custom getLayout needed | pending |

---

## File Tree (final state)

```
src/
  pages/
    product.tsx
  modules/
    ProductPage/
      index.tsx
      components/
        hero-carousel.tsx
        product-header.tsx
        quick-facts-grid.tsx
        experience-cards.tsx
        operator-block.tsx
        guide-block.tsx
        itinerary-accordion.tsx
        before-you-book.tsx
        included-section.tsx
        reviews-section.tsx
        sticky-cta-bar.tsx
  assets/
    svg/
      clock.svg
      globe.svg
      group-people.svg
      person-pickup.svg
      mountain.svg
      trek-mountain.svg
      hearth-fire.svg
      person-home.svg
      sun-rise.svg
      person-best.svg
      warning-circle.svg
      house-bring.svg
      clothing-wear.svg
      cultural-smile.svg
    icons.tsx   ← append 14 new entries
```

---

## Key Design Decisions

- **Layout:** default `MainLayout` — no custom `getLayout` needed (no Header/Navbar in MainLayout by default for clean pages)
- **Scroll:** `flex flex-col h-full` root → `flex-1 overflow-y-auto scrollbar-hide pb-[calc(72px+env(safe-area-inset-bottom))]` scroll area → `flex-shrink-0` CTA bar
- **CTA bar:** natural bottom of flex column (not `position:fixed`), visually "sticky" within phone frame
- **Accordion:** framer-motion `AnimatePresence` + `motion.div` with `overflow: hidden`, height `0 → auto` via `initial/animate/exit`, single-expand state
- **Hero carousel:** CSS `scroll-snap-type: x mandatory` on container, `scroll-snap-align: start` on slides; `IntersectionObserver` for active dot tracking; `scrollTo` on dot tap
- **Fonts:** `font-dinpro` for body, `font-serif` (var(--font-serif)) for shortDescription / USP / review quotes

---

## Design Tokens (reference)

| Token            | Value                               |
| ---------------- | ----------------------------------- |
| Primary green    | `#0F6E56`                           |
| Primary light    | `#E1F5EE`                           |
| Primary dark     | `#04342C`                           |
| Surface cream    | `#F1EFE8`                           |
| Surface alt      | `#F8F6F0`                           |
| Text primary     | `#1A1A18`                           |
| Text secondary   | `#888884`                           |
| Text neutral     | `#444441`                           |
| Warning red bg   | `#FCEBEB`                           |
| Warning red text | `#791F1F`                           |
| Border           | `rgba(0,0,0,0.08)`                  |
| Card radius      | `14px` (Tailwind: `rounded-[14px]`) |
| Pill radius      | `99px` (Tailwind: `rounded-full`)   |

---

## References

- Spec: `docs/specs/product-page/spec-product-page-from-video.md`
- HTML mockup: `src/modules/vvv_product_page_v3_english.html`
- Existing icons: `src/assets/icons.tsx`
- Layout: `src/components/layouts/MainLayout/`
