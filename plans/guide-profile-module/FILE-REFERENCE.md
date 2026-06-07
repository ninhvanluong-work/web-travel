# File Reference - Absolute Paths

## Report Documents

- /d/Remote/web-travel/plans/guide-profile-module/INDEX.md (start here)
- /d/Remote/web-travel/plans/guide-profile-module/reports/scout-report.md (architecture)
- /d/Remote/web-travel/plans/guide-profile-module/reports/code-snippets.md (examples)

## Key Reference Files - Routing

/d/Remote/web-travel/src/types/routes.ts

- Current routes defined here
- Add GUIDE_PROFILE and GUIDE_PROFILE_PATH

/d/Remote/web-travel/src/pages/video/[id].tsx (example page structure)
/d/Remote/web-travel/src/pages/product/[id].tsx (example page structure)
/d/Remote/web-travel/src/pages/search.tsx (example simple page)
/d/Remote/web-travel/src/pages/index.tsx (example simple page)

## Key Reference Files - API Layer

/d/Remote/web-travel/src/api/tour-guide/requests.ts (API calls pattern)
/d/Remote/web-travel/src/api/tour-guide/queries.ts (React Query hooks pattern)
/d/Remote/web-travel/src/api/tour-guide/index.ts (barrel export pattern)
/d/Remote/web-travel/src/api/product/types.ts (ApiTourGuide interface - lines 1-20)
/d/Remote/web-travel/src/api/axios.ts (HTTP client with auth interceptors)
/d/Remote/web-travel/src/api/video/ (alternative API domain example)
/d/Remote/web-travel/src/api/product/ (complex API domain example)

## Key Reference Files - UI Components

/d/Remote/web-travel/src/components/ui/button.tsx (Button component)
/d/Remote/web-travel/src/components/ui/avatar.tsx (Avatar component)
/d/Remote/web-travel/src/components/ui/card.tsx (Card component)
/d/Remote/web-travel/src/components/ui/skeleton.tsx (Skeleton loading)
/d/Remote/web-travel/src/components/ui/skeleton-wrapper.tsx (Loading wrapper)
/d/Remote/web-travel/src/components/ui/sheet.tsx (Bottom sheet/dialog)
/d/Remote/web-travel/src/components/ui/badge.tsx (Badge component)
/d/Remote/web-travel/src/components/ui/tabs.tsx (Tab component)
/d/Remote/web-travel/src/components/ui/carousel.tsx (Carousel)
/d/Remote/web-travel/src/components/ui/dialog.tsx (Modal dialog)
/d/Remote/web-travel/src/components/ui/form.tsx (React Hook Form wrapper)
/d/Remote/web-travel/src/components/ui/input.tsx (Input field)
/d/Remote/web-travel/src/components/ui/select.tsx (Select dropdown)
/d/Remote/web-travel/src/components/ui/alert.tsx (Alert component)

## Key Reference Files - Layout & Components

/d/Remote/web-travel/src/components/layouts/MainLayout/MainLayout.tsx (phone frame layout)
/d/Remote/web-travel/src/components/layouts/MainLayout/Header.tsx (header example)
/d/Remote/web-travel/src/components/layouts/MainLayout/Footer.tsx (footer example)
/d/Remote/web-travel/src/components/layouts/MainLayout/Navbar.tsx (navbar example)
/d/Remote/web-travel/src/components/BunnyVideoPlayer.tsx (HLS video player)
/d/Remote/web-travel/src/components/Tabs.tsx (custom tab implementation)

## Key Reference Files - Modules

/d/Remote/web-travel/src/modules/HomePage/index.tsx (simple module - video bg)
/d/Remote/web-travel/src/modules/DetailSearchPage/index.tsx (complex module - infinite scroll)
/d/Remote/web-travel/src/modules/VideoDetailPage/index.tsx (complex module - snap scroll)
/d/Remote/web-travel/src/modules/ProductPage/index.tsx (complex module - full page)
/d/Remote/web-travel/src/modules/ProductPage/components/guide-block.tsx (existing guide UI)
/d/Remote/web-travel/src/modules/ProductPage/components/hero-carousel.tsx (carousel example)
/d/Remote/web-travel/src/modules/ProductPage/components/reviews-section.tsx (reviews example)
/d/Remote/web-travel/src/modules/ProductPage/components/itinerary-accordion.tsx (accordion example)

## Key Reference Files - Styling & Config

/d/Remote/web-travel/tailwind.config.ts (design tokens)

- Text sizes: h1-h6, body1-body4, caption1-2, button1-3, overline1-3
- Colors: neutrals, brand, neon, pink, green, blue, yellow, red
- Spacing: 4, 8, 12, 16, 24, 32... 96 (all mapped to rem values)
- Custom configs: max-w, fonts, borderRadius, boxShadow, keyframes

/d/Remote/web-travel/src/lib/utils.ts (cn() utility for className merging)
/d/Remote/web-travel/src/lib/bunny.ts (video URL extraction)

## Key Reference Files - State & Hooks

/d/Remote/web-travel/src/stores/ (Zustand store directory)
/d/Remote/web-travel/src/hooks/ (custom hooks directory)
/d/Remote/web-travel/src/hooks/use-video-detail-feed.ts (complex hook example)
/d/Remote/web-travel/src/hooks/use-swipe-back.ts (gesture detection)
/d/Remote/web-travel/src/hooks/use-video-preloader.ts (video preloading)
/d/Remote/web-travel/src/hooks/use-shared-video.ts (shared video pool)

## Key Reference Files - Types

/d/Remote/web-travel/src/types/index.ts (NextPageWithLayout, FCC types)
/d/Remote/web-travel/src/types/routes.ts (route constants and types)

## New Files to Create

### Phase 1: Routes & Page

/d/Remote/web-travel/src/types/routes.ts (add routes)
/d/Remote/web-travel/src/pages/guide/[id].tsx (create new)

### Phase 2: Module

/d/Remote/web-travel/src/modules/GuideProfilePage/index.tsx (create new)

### Phase 3: Components

/d/Remote/web-travel/src/modules/GuideProfilePage/components/guide-header.tsx (create new)
/d/Remote/web-travel/src/modules/GuideProfilePage/components/guide-stats.tsx (create new)
/d/Remote/web-travel/src/modules/GuideProfilePage/components/guide-reviews.tsx (create new)
/d/Remote/web-travel/src/modules/GuideProfilePage/components/[other-components].tsx (create new)

### Phase 2 (Optional): API Extension

/d/Remote/web-travel/src/api/guide/types.ts (create if separate domain)
/d/Remote/web-travel/src/api/guide/requests.ts (create if separate domain)
/d/Remote/web-travel/src/api/guide/queries.ts (create if separate domain)
/d/Remote/web-travel/src/api/guide/index.ts (create if separate domain)

Or extend:
/d/Remote/web-travel/src/api/tour-guide/requests.ts (add getGuideDetail function)
/d/Remote/web-travel/src/api/tour-guide/queries.ts (add useGuideDetail hook)

## Project Configuration Files

/d/Remote/web-travel/CLAUDE.md (project guidelines)
/d/Remote/web-travel/package.json (dependencies, scripts)
/d/Remote/web-travel/tsconfig.json (TypeScript config)
/d/Remote/web-travel/next.config.js (Next.js config)
/d/Remote/web-travel/.env.example (environment template)

## Important Notes

### Phone Frame Constraint

All content in /d/Remote/web-travel/src/modules/ must fit within:
max-w-[430px] h-[100dvh] max-h-[932px]

This is enforced by MainLayout at:
/d/Remote/web-travel/src/components/layouts/MainLayout/MainLayout.tsx

### Key Patterns to Follow

- See /d/Remote/web-travel/src/modules/ProductPage/ for complex module example
- See /d/Remote/web-travel/src/modules/DetailSearchPage/ for infinite scroll example
- See /d/Remote/web-travel/src/modules/VideoDetailPage/ for snap-scroll example
- See /d/Remote/web-travel/src/api/tour-guide/ for API pattern

### Critical Rules

DO NOT modify without permission:

- /d/Remote/web-travel/src/components/layouts/MainLayout/ (phone frame)
- Scroll behavior in VideoDetailPage
- Zustand store logic in /src/stores/
- React Query cache patterns
- Video player preload gates
