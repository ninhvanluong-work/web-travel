# Guide Profile Page Module - Scout Report Index

Scout completed: 2026-06-02

## Overview

This report provides comprehensive guidance for implementing a Guide Profile page module in the web-travel codebase. The module will display detailed information about a tour guide including profile, ratings, experience, reviews, and tours offered.

## Report Contents

### 1. scout-report.md

Complete architectural overview with 12 sections covering:

- Module structure and patterns (using /src/modules/)
- Page routing configuration (adding routes to /src/types/routes.ts)
- Tailwind design tokens (headings h1-h6, body sizes, colors)
- API layer architecture (requests.ts, queries.ts, types.ts pattern)
- Available UI components (shadcn/ui library in /src/components/ui/)
- Layout system (MainLayout phone-frame constraint)
- Existing guide UI patterns (GuideBlock component reference)
- State management (Zustand stores)
- Authentication and axios interceptors
- Video player component (BunnyVideoPlayer)
- Custom hooks available
- Critical implementation rules and do-nots

### 2. code-snippets.md

Ready-to-use code examples:

- API layer patterns (types, requests, queries)
- Routing configuration examples
- Page router pattern for /src/pages/guide/[id].tsx
- Module structure template
- Layout pattern with phone-frame constraint
- UI component usage examples (Button, Avatar, Card, Skeleton, Sheet)
- GuideBlock component reference (existing guide UI)
- Tailwind text sizes reference
- BunnyVideoPlayer usage
- Axios authentication pattern
- Module export patterns
- TypeScript type definitions

## Key Findings

### Module Structure

Existing modules follow thin router pattern:

- /src/pages/[path].tsx - Page entry point (re-exports module)
- /src/modules/ModuleName/ - All logic and UI
- /src/modules/ModuleName/components/ - Sub-components

### API Layer

- Location: /src/api/[domain]/
- 4-file pattern: types.ts, requests.ts, queries.ts, index.ts
- Existing: /src/api/tour-guide/ (list functionality)
- Need: Extend for guide detail endpoint (GET /tour-guide/{id})

### UI Library

Complete shadcn/ui library available at /src/components/ui/:

- button, card, avatar, skeleton
- sheet (for bottom sheets)
- tabs, badge, carousel
- All styled with Tailwind
- Custom variants for mobile-first design

### Layout Constraint

Critical: max-w-[430px] h-[100dvh] max-h-[932px]

- Centered phone frame on desktop
- All content must fit within this box
- Horizontal scrolling not allowed

### Design Tokens

Comprehensive Tailwind config at tailwind.config.ts:

- h1-h6 for headings
- body1-body4 for body text
- caption1-2 for small text
- button1-3 for button text
- overline1-3 for labels
- Complete color palettes (neutrals, brand, neon, pink, green)
- Custom spacing units (4, 8, 12, 16... up to 96)

## Implementation Roadmap

### Phase 1: Setup

1. Add routes to /src/types/routes.ts
   - GUIDE_PROFILE: '/guide/[id]'
   - GUIDE_PROFILE_PATH: (id: string) => `/guide/${id}`
2. Create /src/pages/guide/[id].tsx
   - Simple re-export from module
3. Create /src/modules/GuideProfilePage/index.tsx
   - Main component skeleton

### Phase 2: API Layer

1. Extend /src/api/tour-guide/ or create /src/api/guide/
2. Add getGuideDetail(id) in requests.ts
3. Add useGuideDetail(id) hook in queries.ts
4. Update types if needed

### Phase 3: Components

Build sub-components in /src/modules/GuideProfilePage/components/:

- guide-header.tsx - Avatar, name, rating
- guide-stats.tsx - Experience, tours count
- guide-reviews.tsx - Review list/grid
- [other sections]

### Phase 4: Polish

- Run pnpm lint:fix
- Run pnpm format:write
- Run pnpm check-types
- Test on mobile viewport

## Critical Rules

DO NOT modify without permission:

- Existing scroll behavior (snap-scroll, IntersectionObserver)
- Zustand store logic
- React Query cache strategy
- Video player preload/play gates
- MainLayout dimensions

## File Paths

### Key Reference Files

- /d/Remote/web-travel/src/types/routes.ts (add routes)
- /d/Remote/web-travel/tailwind.config.ts (design tokens)
- /d/Remote/web-travel/src/api/tour-guide/ (API pattern reference)
- /d/Remote/web-travel/src/api/product/types.ts (ApiTourGuide model)
- /d/Remote/web-travel/src/components/layouts/MainLayout/ (layout)
- /d/Remote/web-travel/src/components/ui/ (UI components)
- /d/Remote/web-travel/src/modules/ProductPage/ (full module example)
- /d/Remote/web-travel/src/modules/ProductPage/components/guide-block.tsx (guide UI ref)

### New Files to Create

- /d/Remote/web-travel/src/pages/guide/[id].tsx
- /d/Remote/web-travel/src/modules/GuideProfilePage/index.tsx
- /d/Remote/web-travel/src/modules/GuideProfilePage/components/[sub-components]
- (Optional) /d/Remote/web-travel/src/api/guide/[files] if separate API domain

## Next Steps

1. Review scout-report.md for architecture details
2. Review code-snippets.md for implementation examples
3. Start with Phase 1 (Setup) from roadmap
4. Follow existing patterns in ProductPage and DetailSearchPage modules
5. Use this index document to navigate between reports

## Contact & Questions

If implementation needs clarification:

- Check CLAUDE.md for project conventions
- Refer to existing modules (ProductPage) for patterns
- Review architecture rules in MEMORY.md
- Ask for explicit permission before modifying existing logic
