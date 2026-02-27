# Kiến trúc hệ thống — Web Travel

---

## Tóm tắt

Web Travel là ứng dụng **monolith Next.js 13** theo **Pages Router**, tổ chức theo pattern **Module + Component-based**. Ứng dụng tập trung vào trải nghiệm mobile-first với video streaming từ CDN DigitalOcean Spaces.

---

## Sơ đồ kiến trúc

```
┌─────────────────────────────────────────────────────┐
│                   Next.js 13 App                    │
│                  (Pages Router)                     │
│                                                     │
│  ┌──────────┐  ┌──────────────────────────────────┐ │
│  │  _app.tsx│  │         Pages Layer               │ │
│  │ Provider │  │  / → HomePage                     │ │
│  │ (global  │  │  /search → DetailSearchPage        │ │
│  │  setup)  │  │  /button → ButtonPage             │ │
│  └────┬─────┘  └──────────┬───────────────────────┘ │
│       │                   │                         │
│       ▼                   ▼                         │
│  ┌─────────────────────────────────────────────────┐ │
│  │              Modules Layer                      │ │
│  │  ┌─────────────────┐ ┌──────────────────────┐  │ │
│  │  │   HomePage      │ │  DetailSearchPage     │  │ │
│  │  │  - VideoPlayer  │ │  - SearchInput        │  │ │
│  │  │  - SearchBox    │ │  - VideoGrid          │  │ │
│  │  │  - Suggestions  │ │  - IntersectionObs    │  │ │
│  │  └─────────────────┘ └──────────────────────┘  │ │
│  └─────────────────────────────────────────────────┘ │
│                          │                           │
│       ┌──────────────────┼────────────────────┐     │
│       ▼                  ▼                    ▼     │
│  ┌─────────┐    ┌──────────────┐    ┌──────────────┐│
│  │ Stores  │    │   API Layer  │    │  Components  ││
│  │ Zustand │    │  TanStack Q  │    │  UI / Layout ││
│  │ (user)  │    │  + Axios     │    │  (Radix UI)  ││
│  └─────────┘    └──────┬───────┘    └──────────────┘│
│                         │                            │
└─────────────────────────┼────────────────────────────┘
                          │
                ┌─────────▼──────────┐
                │   External Sources │
                │  DigitalOcean CDN  │
                │  (Video streams)   │
                │  Backend API       │
                │  (JWT auth)        │
                └────────────────────┘
```

---

## Các tầng kiến trúc

### 1. Pages Layer (`src/pages/`)

Next.js Pages Router — mỗi file là một route. Pages chỉ re-export từ Modules:

```typescript
// src/pages/index.tsx
import HomePage from '@/modules/HomePage';
export default HomePage;
```

Pages không chứa logic — chỉ là entry point routing.

### 2. Modules Layer (`src/modules/`)

Feature-based modules, mỗi module chứa toàn bộ logic cho một trang:

| Module             | Route     | Chức năng                            |
| ------------------ | --------- | ------------------------------------ |
| `HomePage`         | `/`       | Video nền + search box + suggestions |
| `DetailSearchPage` | `/search` | Tìm kiếm + video grid với autoplay   |
| `button-page`      | `/button` | Demo components                      |

### 3. API Layer (`src/api/`)

Tổ chức theo domain với 3 file pattern:

```
src/api/
├── axios.ts              # Axios instance + interceptors (JWT auto-inject)
├── auth/
│   ├── types.ts          # TypeScript interfaces
│   ├── requests.ts       # HTTP functions
│   ├── queries.ts        # TanStack Query hooks
│   └── index.ts          # Re-exports
└── video/
    ├── types.ts
    ├── requests.ts       # Hiện tại: mock data (18 videos)
    ├── queries.ts
    └── index.ts
```

**Pattern TanStack Query + react-query-kit:**

```typescript
export const useListVideo = createQuery<IVideo[]>({
  primaryKey: '/videos',
  queryFn: getListVideo,
});
```

### 4. State Management

| Store               | Thư viện          | Persistence    | Mục đích                                |
| ------------------- | ----------------- | -------------- | --------------------------------------- |
| `UserStore`         | Zustand + persist | localStorage   | accessToken, refreshToken, user profile |
| `IntersectionStore` | Zustand           | Memory         | UI state cho IntersectionObserver       |
| Server state        | TanStack Query    | Memory + cache | API data fetching                       |

**UserStore với auto-selectors:**

```typescript
const useBaseUserStore = create<IMeQueryStore>()(
  persist(/* ... */, { name: 'user-store', storage: createJSONStorage(() => localStorage) })
);
export const useUserStore = createSelectorFunctions(useBaseUserStore);
```

### 5. Components Layer (`src/components/`)

```
components/
├── layouts/
│   ├── MainLayout/        # Header, Footer, Navbar, Sidebar
│   └── ModuleLayout.tsx   # Wrapper cho tất cả pages
├── ui/
│   ├── FormField/         # HoC fields (TextField, SelectField, DatePickerField...)
│   ├── Utilities/         # HStack, VStack, Show, CreateCard
│   └── [primitives]       # Button, Input, Dialog, Select, Tabs...
└── [globals]              # ThemeProvider, ErrorBoundary, Logo, Tabs
```

---

## Authentication & Authorization

**Flow JWT:**

```
Login → accessToken + refreshToken → localStorage (Zustand persist)
                                              ↓
Request → Axios interceptor injects Bearer token
                                              ↓
401 response → Auto refresh token → Retry request
                                              ↓
Refresh fails → Logout + redirect to /
```

**Axios interceptors:**

- **Request interceptor**: Auto-inject `Authorization: Bearer {accessToken}`
- **Response interceptor**: Catch 401 → gọi refresh token → retry original request

---

## Video Playback Architecture

### HomePage (Full-screen video)

- `<video>` cố định `position: fixed`, kích thước `max-w-[430px]` × `max-h-[932px]` (phone dimensions)
- Autoplay muted → unmute khi user tương tác (bypass browser policy)
- Mute/unmute button ở góc phải

### DetailSearchPage (Video Grid)

- Grid 2-4 cột responsive
- **IntersectionObserver**: Play khi 50% video visible, pause khi ra khỏi viewport
- Tất cả videos khởi tạo muted
- Per-video mute toggle button

---

## Data Flow

```
URL: /search?q=Sapa
    ↓
DetailSearchPage reads router.query.q
    ↓
useListVideo() → TanStack Query → getListVideo() → [mock/API]
    ↓
filteredVideos = useMemo filter by searchText
    ↓
<VideoGrid videos={filteredVideos} />
    ↓
IntersectionObserver → autoplay per video in viewport
```

---

## Styling System

- **TailwindCSS**: Utility-first, custom breakpoints (mobile-first: xss=320px, xs=375px, sm=414px)
- **Radix UI primitives**: Alert, Avatar, Dialog, Select, Tabs, Tooltip, Popover, etc.
- **Design tokens**: Custom colors (neon, pink, neutral, blue, green, yellow, red, main)
- **Dark mode**: `class` strategy, nhưng forced to `light` trong Provider
- **Fonts**: DINPro, DIN Pro Cond (custom fonts)
- **Animation**: animate.css + Framer Motion + tailwindcss-animate

---

## Build & Deployment

| Script  | Lệnh                      | Mục đích                                |
| ------- | ------------------------- | --------------------------------------- |
| Dev     | `pnpm dev`                | Development server (rimraf .next trước) |
| Build   | `pnpm build`              | Production build                        |
| Start   | `pnpm start -p 8080`      | Production server port 8080             |
| Analyze | `ANALYZE=true next build` | Bundle analyzer                         |

**Webpack extensions:**

- Audio file support (ogg, mp3, wav, mpeg)
- SVG as React component (`next-react-svg`)
- Bundle analyzer

---

## Quyết định kỹ thuật quan trọng

1. **Pages Router** thay vì App Router — phù hợp với Next.js 13 ổn định
2. **Module pattern** — pages delegate hoàn toàn cho modules, tách biệt routing và business logic
3. **Zustand + localStorage persist** — auth state survive page reload mà không cần server session
4. **Mock video data** — 18 videos trong `requests.ts`, chưa kết nối backend thật
5. **Mobile-first constraints** — max-w-[430px], max-h-[932px] để limit app trên desktop giống phone
6. **IntersectionObserver autoplay** — tiết kiệm bandwidth, chỉ play video trong viewport
