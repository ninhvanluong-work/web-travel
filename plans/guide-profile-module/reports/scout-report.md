# Scout Report: Guide Profile Page Module Implementation

**Date**: 2026-06-02  
**Scope**: Guide Profile module implementation based on existing codebase patterns

---

## 1. Module Structure

### Existing Modules in /src/modules/

- HomePage - Landing page with video background + search
- DetailSearchPage - Search results with infinite-scroll video grid
- VideoDetailPage - TikTok-style vertical snap-scroll feed
- ProductPage - Product detail page with multiple sections
- AdminProduct - Admin product management
- AdminVideo - Admin video management
- button-page - Component showcase

### Pattern for New Module

Create /src/modules/GuideProfilePage/ with structure:

```
GuideProfilePage/
  index.tsx (main component)
  components/
    guide-header.tsx
    guide-stats.tsx
    guide-reviews.tsx
    [other sub-components]
```

---

## 2. Page Routing

### Current Routes (/src/types/routes.ts)

HOME: '/'
SEARCH: '/search'
VIDEO_DETAIL: '/video/[slug]'
PRODUCT: '/product/[id]'
ADMIN_PRODUCTS: '/admin/products'
ADMIN_VIDEOS: '/admin/videos'

### Action Required

Add to routes.ts:

- GUIDE_PROFILE: '/guide/[id]'
- GUIDE_PROFILE_PATH: (id: string) => `/guide/${id}`

New Page File: /src/pages/guide/[id].tsx

```
import GuideProfilePage from '@modules/GuideProfilePage';
export { default } from '@modules/GuideProfilePage';
```

---

## 3. Tailwind Configuration & Typography Tokens

### Available Text Sizes (tailwind.config.ts)

- Headings: h1-h6 (4rem to 1.5rem)
- Body: body1-body4 (1.25rem to 0.75rem)
- Captions: caption1, caption2
- Buttons: button1-button3
- Overlines: overline1-overline3

### Relevant Colors

- Neutrals: neutral-white, neutral-100 to neutral-900, neutral-black
- Brand: blue gradients (brand-50 to brand-950)
- Neon, Pink, Green: Full color palettes

### Font Families

- font-dinpro (DINPro, sans-serif)
- font-dinprocond (DIN Pro Cond, sans-serif)

---

## 4. API Layer Architecture

### Pattern: Domain Folders

Each domain has 4 files in /src/api/[domain]/:

1. types.ts - Domain models + raw API response types
2. requests.ts - Axios calls + raw->domain mapping
3. queries.ts - React Query hooks via react-query-kit
4. index.ts - Barrel export

### Existing Tour Guide API (/src/api/tour-guide/)

- getTourGuidePage(page): TourGuidePage
- useTourGuideListInfinite: createInfiniteQuery hook
- staleTime: 5 _ 60 _ 1000

### Tour Guide Domain Model (/src/api/product/types.ts)

```
ApiTourGuide {
  id, createdAt, updatedAt, deletedAt
  name, avatar
  ratingCount, expYear, ratingStar
}
```

### Action Required

Create /src/api/guide/ with:

- Fetch full guide profile: GET /tour-guide/{id}
- Fetch guide reviews: GET /tour-guide/{id}/reviews (if separate)
- Create requests.ts and queries.ts

---

## 5. UI Components Available

### shadcn/ui Base (/src/components/ui/)

- button, card, avatar
- skeleton, skeleton-wrapper
- sheet (bottom sheet/panel)
- badge, tabs, carousel
- dialog, form, input, select
- radio-group, checkbox, alert

### Custom Components (/src/components/)

- BunnyVideoPlayer.tsx - HLS video with adaptive bitrate
- Tabs.tsx - Horizontal tab navigation
- TabsVertical.tsx - Vertical tab navigation

---

## 6. Layout System

### MainLayout (/src/components/layouts/MainLayout/MainLayout.tsx)

Constraint: max-w-[430px] h-[100dvh] max-h-[932px] centered phone frame

All content must fit within this box.

### Layout Pattern (\_app.tsx)

Pages wrap with ModuleLayout -> MainLayout by default.
Pages can opt out via Component.getLayout.

---

## 7. Existing Guide UI Pattern

### GuideBlock (/src/modules/ProductPage/components/guide-block.tsx)

Existing guide preview card shows:

- initials (avatar)
- name
- rating
- yearsExperience
- toursInArea
- area

This is a small preview. Full profile page will expand on this.

---

## 8. State Management

### Zustand Store (/src/stores/)

- Use auto-zustand-selectors-hook for selector functions
- Access: useStore.use.selector() instead of whole store subscription
- useUserStore: accessToken, refreshToken, setAccessToken(), logout()

---

## 9. Axios & Request Interceptors

### Shared Axios Instance (/src/api/axios.ts)

- Reads NEXT_PUBLIC_API_URL from env
- Automatically attaches Bearer tokens from Zustand
- Handles 401 -> token refresh + retry
- Maps error responses

---

## 10. Video Player Component

### BunnyVideoPlayer.tsx

Handles HLS streaming with adaptive bitrate.

Interface BunnyPlayerHandle:

```
play(): Promise<void>
pause(): void
unmute(): void
mute(): void
isPlaying(): boolean
preload(): void
```

Use when displaying guide testimonials/portfolio videos.

---

## 11. Custom Hooks

### Available Hooks (/src/hooks/)

- use-swipe-back - Swipe gesture detection
- use-video-detail-feed - Video feed management
- use-video-preloader - HLS preloading
- use-shared-video - Shared video element pool

---

## 12. Critical Implementation Rules

### DO NOT modify without permission:

- Existing scroll behavior (snap-scroll, IntersectionObserver)
- Zustand store logic
- React Query cache strategy
- Video player preload/play gates
- MainLayout dimensions (phone frame)

### Implementation Steps:

1. Add routes to /src/types/routes.ts
2. Create page file: /src/pages/guide/[id].tsx
3. Create module: /src/modules/GuideProfilePage/
4. Create/extend API layer (guide detail, reviews)
5. Build sub-components in /src/modules/GuideProfilePage/components/
6. Use existing UI components from /src/components/ui/
7. Follow Tailwind tokens from config
8. Run pnpm lint:fix and pnpm check-types

---

## File Paths Summary

### Key Existing Files

- /d/Remote/web-travel/src/types/routes.ts
- /d/Remote/web-travel/tailwind.config.ts
- /d/Remote/web-travel/src/api/axios.ts
- /d/Remote/web-travel/src/api/tour-guide/requests.ts
- /d/Remote/web-travel/src/api/tour-guide/queries.ts
- /d/Remote/web-travel/src/api/product/types.ts
- /d/Remote/web-travel/src/components/layouts/MainLayout/MainLayout.tsx
- /d/Remote/web-travel/src/components/ui/button.tsx
- /d/Remote/web-travel/src/components/ui/avatar.tsx
- /d/Remote/web-travel/src/components/ui/skeleton.tsx
- /d/Remote/web-travel/src/components/ui/sheet.tsx
- /d/Remote/web-travel/src/components/ui/card.tsx
- /d/Remote/web-travel/src/modules/ProductPage/index.tsx
- /d/Remote/web-travel/src/modules/ProductPage/components/guide-block.tsx
- /d/Remote/web-travel/src/components/BunnyVideoPlayer.tsx

### New Files to Create

- /d/Remote/web-travel/src/pages/guide/[id].tsx
- /d/Remote/web-travel/src/modules/GuideProfilePage/index.tsx
- /d/Remote/web-travel/src/modules/GuideProfilePage/components/[sub-components]
- /d/Remote/web-travel/src/api/guide/ (if separate from tour-guide)

---

## Environment & Build

- Phone Frame: max-w-[430px] h-[100dvh] max-h-[932px]
- No Tests: Project has no test suite
- ESLint: pnpm lint:fix
- Format: pnpm format:write
- TypeScript: pnpm check-types
- Dev: pnpm dev (clears .next/out first)
