# Web-Travel Project Scout Report

Date: 2026-02-28
Scope: D:\Remote\web-travel\src
Focus: Pages, modules, components, layouts, styling config, fonts

---

## Directory Structure

src/

- api/ (auth/, video/, axios.ts)
- assets/ (fonts.ts, icons.tsx, svg/)
- components/
  - layouts/ (MainLayout/, ModuleLayout.tsx)
  - ui/ (80+ components)
  - ErrorBoundary, FullScreenLoading, etc.
- config/ (site.ts)
- data/ (search.ts)
- hooks/ (10+ custom hooks)
- lib/ (utilities, Provider.tsx)
- modules/ (DetailSearchPage, HomePage, VideoDetailPage, button-page)
- pages/ (\_app.tsx, \_document.tsx, routes)
- stores/
- styles/ (globals.css)
- types/

---

## Configuration Files

### tailwind.config.ts (/d/Remote/web-travel/tailwind.config.ts)

Screens (Mobile-first): xss: 320px, xs: 375px, sm: 414px, md/lg/xl: 10000px
Font Families: dinpro (DINPro), dinprocond (DIN Pro Cond)
Font Sizes: d1-d3, h1-h6, body1-4, captions, overlines, buttons
Colors: neon, pink, neutral, blue, green, yellow, red (100-900 scales)
Main primary: #133C65
Border Radius: sm (4px), md (8px), lg (12px), xl (16px), 2xl (24px), 3xl (36px)
Default Border Width: 1.5px
Plugins: tailwindcss-animate, @tailwindcss/typography

### globals.css (/d/Remote/web-travel/src/styles/globals.css)

Font-Face: DINPro, DIN Pro Cond (weights 300, 500, bold, 900)
CSS Root Variables: background, foreground, primary, success, error, warning, info, divider
Dark Mode: .dark class with inverted colors
Body: position fixed, 100% width/height (fullscreen app)
Scrollbar: Custom webkit styling (6px, #b6b6b6 thumb)

---

## Pages (Next.js Routes)

/ (index.tsx) - Home page
/search (search.tsx) - Search page
/button (button.tsx) - Button showcase
/video/[id] ([id].tsx) - Video detail (dynamic)
/\* (404.tsx) - 404 error
\_app.tsx - App wrapper + globals
\_document.tsx - HTML structure

---

## DetailSearchPage Module (/src/modules/DetailSearchPage/)

index.tsx - Main container, fetches videos, filters by search
VideoCard.tsx - Video tile (3:4 aspect, lazy-loaded, muted, 105% hover scale)
VideoGrid.tsx - Responsive grid (2 cols mobile | 3 cols tablet | 4 cols desktop)
SearchInput.tsx - Search bar with back button, rounded pill, gray theme

---

## Layouts

MainLayout (/src/components/layouts/MainLayout/MainLayout.tsx):

- Phone container: max-w-[430px], max-h-[932px]
- Fixed positioning, centered on desktop
- Dark slate background (bg-slate-900)
- Sub: Header, Footer, Navbar, Sidebar

ModuleLayout (/src/components/layouts/ModuleLayout.tsx):

- NextNProgress bar (info blue, 3px height)
- TailwindIndicator (breakpoint display)

---

## Fonts

Google Fonts (Poppins): /src/assets/fonts.ts

- Weights: 400, 500, 600, 700

Custom Fonts (DINPro): from globals.css, /public/fonts/

- Weights: 300, 500, bold, 900

---

## \_app.tsx (/d/Remote/web-travel/src/pages/\_app.tsx)

Imports: globals.css, fonts, layouts, Provider
Features: dayjs extensions, layout composition, OG/Twitter meta, font injection

---

## \_document.tsx (/d/Remote/web-travel/src/pages/\_document.tsx)

Head: Favicons, manifest, theme colors, Apple meta, mask icon

---

## CSS Variables

Layout: --header-h: 6.375rem
Colors (HSL): background, foreground, card, primary, secondary, muted, accent, destructive, border, input, ring, popover, success, error, warning, info, divider
Dynamic Fonts: --font-sans, --font-serif (set in \_app.tsx)

---

## Key Code Snippets

Tailwind Main Color:
#133C65 (primary)
#ECF0F4 (0), #DBE4ED (10/20), #B4D2F0 (30), #6391C0 (40), #0B233A (60)

DetailSearchPage Filter:
Filters videos by title (case-insensitive, client-side)

VideoCard LazyLoading:
IntersectionObserver with threshold 0.5
Auto-plays when visible, pauses when hidden

MainLayout Container:
Fixed positioning, max-w-430px, max-h-932px, shadow-2xl

---

## File Paths

- /d/Remote/web-travel/tailwind.config.ts
- /d/Remote/web-travel/src/styles/globals.css
- /d/Remote/web-travel/src/pages/\_app.tsx
- /d/Remote/web-travel/src/pages/\_document.tsx
- /d/Remote/web-travel/src/modules/DetailSearchPage/index.tsx
- /d/Remote/web-travel/src/modules/DetailSearchPage/components/VideoCard.tsx
- /d/Remote/web-travel/src/modules/DetailSearchPage/components/VideoGrid.tsx
- /d/Remote/web-travel/src/modules/DetailSearchPage/components/SearchInput.tsx
- /d/Remote/web-travel/src/components/layouts/MainLayout/MainLayout.tsx
- /d/Remote/web-travel/src/components/layouts/ModuleLayout.tsx
- /d/Remote/web-travel/src/assets/fonts.ts

---

## Unresolved Questions

1. State management library (Redux, Zustand, Jotai, Context)?
2. API base URL and environment setup?
3. Video data endpoint (useListVideo implementation)?
4. Why double-wrap ModuleLayout + MainLayout?
5. Other modules using MainLayout layout pattern?
