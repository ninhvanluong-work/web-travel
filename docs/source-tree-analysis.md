# Phân tích cây thư mục — Web Travel

---

## Cấu trúc tổng quan

```
web-travel/
├── src/                          # Toàn bộ source code
│   ├── api/                      # API client layer (HTTP + TanStack Query hooks)
│   ├── assets/                   # Static assets (fonts, SVG icons)
│   ├── components/               # Shared reusable UI components
│   ├── config/                   # App configuration (site metadata)
│   ├── data/                     # Static data files
│   ├── hooks/                    # Custom React hooks
│   ├── lib/                      # Utilities, Provider, constants
│   ├── modules/                  # Feature modules (1 module = 1 page)
│   ├── pages/                    # Next.js routing (entry points only)
│   ├── stores/                   # Zustand global state stores
│   ├── styles/                   # Global CSS
│   └── types/                    # TypeScript type definitions
├── public/                       # Next.js public static folder
├── docs/                         # Project documentation (BMAD)
├── _bmad/                        # BMAD methodology framework
├── .claude/                      # Claude Code configuration
├── next.config.js                # Next.js configuration
├── tailwind.config.ts            # TailwindCSS configuration
├── tsconfig.json                 # TypeScript configuration
├── package.json                  # Dependencies & scripts
└── pnpm-lock.yaml                # pnpm lockfile
```

---

## Chi tiết từng thư mục

### `src/pages/` — Next.js Routing Layer

> Entry points thuần túy — không chứa logic, chỉ re-export từ modules.

```
src/pages/
├── _app.tsx          # App wrapper: Provider, ThemeProvider, Layout, meta tags
├── _document.tsx     # HTML document customization
├── index.tsx         # Route: / → re-export HomePage module
├── search.tsx        # Route: /search → re-export DetailSearchPage module
├── button.tsx        # Route: /button → demo button page
├── 404.tsx           # Custom 404 page
└── api/
    └── hello.ts      # Next.js API route (placeholder)
```

**Pattern:** Pages không làm gì ngoài:

```typescript
import HomePage from '@/modules/HomePage';
export default HomePage;
```

---

### `src/modules/` — Feature Modules (Business Logic)

> Mỗi module = một trang hoàn chỉnh với components riêng.

```
src/modules/
├── HomePage/
│   ├── index.tsx                 # 🎬 Full-screen video background + search overlay
│   └── components/
│       └── SearchBox.tsx         # Search input với transparent/outline variants
│
├── DetailSearchPage/
│   ├── index.tsx                 # 🔍 Search results với filter logic
│   └── components/
│       ├── SearchInput.tsx       # Search header với back button
│       └── VideoGrid.tsx         # Video grid với IntersectionObserver autoplay
│
└── button-page/
    └── index.tsx                 # 🔘 Button component showcase
```

---

### `src/api/` — API Client Layer

> HTTP functions + TanStack Query hooks, tổ chức theo domain.

```
src/api/
├── axios.ts                      # ⚡ Axios instance, JWT interceptors, refresh token logic
├── auth/
│   ├── index.ts                  # Re-exports
│   ├── types.ts                  # IUser, ILoginResponse, ILoginParams, IRegisterParams...
│   ├── requests.ts               # loginRequest, logoutRequest, getUserProfile, changePassword...
│   └── queries.ts                # TanStack Query hooks (useLogin, useGetProfile...)
└── video/
    ├── index.ts                  # Re-exports
    ├── types.ts                  # IVideo { id, link, title, description, thumbnail }
    ├── requests.ts               # getListVideo() — hiện tại mock 18 videos
    └── queries.ts                # useListVideo() — createQuery hook
```

---

### `src/components/` — Shared UI Components

> Components dùng lại, không chứa business logic.

```
src/components/
├── layouts/
│   ├── MainLayout/
│   │   ├── index.tsx             # 🏗️ Main layout wrapper
│   │   ├── Header.tsx            # App header
│   │   ├── Footer.tsx            # App footer
│   │   ├── Navbar.tsx            # Navigation bar
│   │   └── Sidebar.tsx           # Sidebar navigation
│   ├── ModuleLayout.tsx          # Wrapper toàn app (trong _app.tsx)
│   └── index.tsx                 # Re-exports
│
├── ui/
│   ├── FormField/                # High-order form field components
│   │   ├── TextField.tsx         # Text input + label + error
│   │   ├── TextAreaField.tsx     # Textarea field
│   │   ├── SelectField.tsx       # Select dropdown field
│   │   ├── SelectWithSearchField.tsx
│   │   ├── CheckboxField.tsx
│   │   ├── RadioGroupField.tsx
│   │   ├── SwitchField.tsx
│   │   ├── DatePickerField.tsx
│   │   ├── AvatarUploadField.tsx
│   │   ├── UploadButtonField.tsx
│   │   └── index.tsx
│   │
│   ├── Utilities/                # Layout utility components
│   │   ├── h-stack.tsx           # Horizontal flex stack
│   │   ├── v-stack.tsx           # Vertical flex stack
│   │   ├── show.tsx              # Conditional rendering
│   │   ├── create-card.tsx       # Card creator utility
│   │   ├── transition-surface.tsx
│   │   └── index.ts
│   │
│   └── [Radix UI primitives]     # shadcn/ui pattern components
│       ├── button.tsx, input.tsx, select.tsx
│       ├── dialog.tsx, alert-dialog.tsx
│       ├── tabs.tsx, calendar.tsx, date-picker.tsx
│       ├── avatar.tsx, badge.tsx, card.tsx, chip.tsx
│       ├── checkbox.tsx, radio-group.tsx, switch.tsx, slider.tsx
│       ├── dropdown-menu.tsx, navigation-menu.tsx, popover.tsx
│       ├── command.tsx, autocomplete.tsx, multiple-autocomplete.tsx
│       ├── tooltip.tsx, separator.tsx, sheet.tsx
│       ├── table.tsx, scrollArea.tsx, skeleton.tsx, spinner.tsx
│       ├── form.tsx, label.tsx, textarea.tsx
│       └── ...
│
├── ThemeProvider.tsx             # next-themes provider
├── ErrorBoundary.tsx             # React error boundary
├── Logo.tsx                      # App logo
├── Tabs.tsx / TabsVertical.tsx   # Custom tab components
├── FullScreenLoading.tsx         # Loading overlay
└── ToggleThemeButton.tsx         # Dark/light mode toggle
```

---

### `src/stores/` — State Management

```
src/stores/
├── index.ts                      # Re-exports
├── UserStore.ts                  # Auth state (accessToken, refreshToken, user)
│                                 # Persisted to localStorage
└── IntersectionStore.ts          # UI state cho IntersectionObserver
```

---

### `src/hooks/` — Custom Hooks

```
src/hooks/
├── useAuth.ts                    # Authentication helper
├── useUser.ts                    # User data access
├── useCopy.ts                    # Clipboard copy
├── useImageAspect.ts             # Image aspect ratio
├── useInview.ts                  # In-viewport detection
├── usePopover.ts                 # Popover state management
├── useRouterId.ts                # Get router ID param
├── use-mounted.ts                # Component mounted state
├── use-lock-body.ts              # Lock body scroll
└── breakpoint/
    ├── index.ts
    ├── useMobile.ts              # Detect mobile viewport
    └── useTablet.ts              # Detect tablet viewport
```

---

### `src/lib/` — Utilities & Infrastructure

```
src/lib/
├── Provider.tsx                  # Root providers (QueryClient, ThemeProvider, Toaster)
├── const.ts                      # App constants (env variables)
├── common.ts                     # Common utilities
├── utils.ts                      # cn() và các helpers
├── image.ts                      # Image utilities
├── json.ts                       # JSON utilities
├── mime.ts                       # MIME type utilities
├── regex.ts                      # Regex patterns
├── getMutateError.ts             # Error extraction from mutations
└── validations/
    ├── auth.ts                   # Zod schemas cho auth forms
    ├── email.ts                  # Email validation
    ├── og.ts                     # Open Graph validation
    └── validation.utility.ts    # Reusable validation helpers
```

---

### `src/assets/` — Static Assets

```
src/assets/
├── fonts.ts                      # next/font definitions (fontSans, fontSerif)
└── svg/                          # SVG icons as React components (via next-react-svg)
    ├── search.svg, arrow-*.svg   # Navigation icons
    ├── user.svg, camera.svg      # User/media icons
    ├── star.svg, bookmark.svg    # Action icons
    ├── facebook.svg, google.svg  # Social icons
    └── [65+ SVG files total]
```

---

### `src/data/` — Static Data

```
src/data/
└── search.ts                     # SEARCH_SUGGESTIONS array
                                  # ['Miền Bắc', 'Miền Trung', 'Sapa', 'Hà Giang'...]
```

---

## Entry Points

| File                      | Mục đích                                         |
| ------------------------- | ------------------------------------------------ |
| `src/pages/_app.tsx`      | App root — setup providers, layouts, fonts, meta |
| `src/pages/index.tsx`     | Route `/` — HomePage                             |
| `src/pages/search.tsx`    | Route `/search` — DetailSearchPage               |
| `src/api/axios.ts`        | HTTP client với JWT logic                        |
| `src/lib/Provider.tsx`    | Global React providers                           |
| `src/stores/UserStore.ts` | Persisted auth state                             |
