# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Commands

```bash
pnpm dev          # Start dev server (clears .next/out first)
pnpm build        # Production build
pnpm start        # Start on port 8080
pnpm lint         # ESLint check
pnpm lint:fix     # ESLint auto-fix
pnpm check-types  # TypeScript check (tsc --noEmit)
pnpm format:write # Prettier format all TS/TSX/MDX files
```

There are no tests in this project.

## Architecture

This is a **mobile-first travel video app** (max-width 430px, max-height 932px) built with Next.js 13 Pages Router. The UI is always centered in a fixed phone-frame container — all layouts must respect this constraint.

### Layout System

`_app.tsx` wraps every page in `ModuleLayout → MainLayout` by default. Pages can opt out by defining `Component.getLayout`. `MainLayout` renders a centered phone-frame (`max-w-[430px] h-[100dvh] max-h-[932px]`) against a dark background — all content must stay within this box.

### Page → Module Pattern

Pages in `src/pages/` are thin re-exports; all logic and UI lives in the corresponding `src/modules/` feature module:

- `/` → `modules/HomePage` — fullscreen video background, overlaid search box
- `/search` → `modules/DetailSearchPage` — infinite-scroll video grid with debounced search
- `/video/[id]` → `modules/VideoDetailPage` — TikTok-style vertical snap-scroll feed

### API Layer (`src/api/`)

Each domain has its own folder with four files:

- `types.ts` — domain model + raw API response types (kept separate; mappers convert between them)
- `requests.ts` — axios calls + mapping from raw API → domain model
- `queries.ts` — React Query hooks via `react-query-kit` (`createQuery` / `createInfiniteQuery`)
- `index.ts` — barrel export

The shared axios instance (`src/api/axios.ts`) reads `NEXT_PUBLIC_API_URL`, attaches Bearer tokens from Zustand, and handles 401 → token refresh automatically.

### State Management

Zustand stores live in `src/stores/`. `UserStore` is persisted to `localStorage` via `zustand/middleware`. `createSelectorFunctions` from `auto-zustand-selectors-hook` is used — access store values as `useUserStore.use.accessToken()` rather than subscribing to the whole store.

### Video Interaction Patterns

- **HomePage**: Uses `visualViewport` API + `requestAnimationFrame` to keep the search box correctly positioned when the mobile keyboard opens.
- **VideoDetailPage**: Snap-scroll feed where each slide uses `IntersectionObserver` (`useInView`) at 80% threshold to auto-play/pause and update the URL via `router.replace` (shallow).
- **VideoGrid (search results)**: Infinite scroll triggered by a sentinel element 3 items before the end of the list. Audio is mutually exclusive across cards — managed by lifting `activeAudioId` state up to the grid.

### Path Aliases

`@/` maps to `src/`. All imports should use this alias.

### Environment Variables

`NEXT_PUBLIC_API_URL` — base URL for the backend API. Must be set for any API calls to work.
