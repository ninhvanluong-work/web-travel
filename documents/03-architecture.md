# 03 · Architecture

## Request → render pipeline

```
src/pages/<route>.tsx          thin: getServerSideProps(serverSideTranslations) + re-export module
  └─ src/modules/<Feature>/    all UI + logic for the screen
       ├─ components/          screen-specific components
       ├─ hooks/ (optional)    screen hooks (admin modules)
       └─ uses src/hooks/*     shared hooks (forms, filters, video)
            └─ src/api/<domain>/queries.ts   react-query-kit hooks
                 └─ requests.ts → src/api/axios.ts → BE (NEXT_PUBLIC_API_URL)
```

## App shell (`src/pages/_app.tsx`)

`Provider` (QueryClient + forced light ThemeProvider + Devtools) → `GlobalAlertProvider` (toasts from `useAlertStore`) + `TourGuideFAB` → `ModuleLayout` (NProgress, `showOnShallow=false`) → `Component.getLayout ?? MainLayout`.

- `MainLayout`: centered phone frame `max-w-[430px] h-[100dvh] max-h-[932px] overflow-hidden` on `bg-slate-900`. Pages scroll **inside** their own containers (`h-full overflow-y-auto`), `window` scroll barely fires.
- Admin pages: `Page.getLayout = (p) => <AdminLayout>{p}</AdminLayout>` (desktop sidebar). `admin/login` has its own layout.
- `_document.tsx`: viewport `maximum-scale=1, viewport-fit=cover, interactive-widget=resizes-content`; preconnect Bunny CDN.
- Every page uses `getServerSideProps` (+ `serverSideTranslations(locale, [ns…])`) except `/` and 404 (`getStaticProps`). A new namespace file must be listed in the page's `serverSideTranslations`.

## API layer (`src/api/<domain>/`)

| File | Role |
| --- | --- |
| `types.ts` | Domain model + raw `Api*` response types |
| `requests.ts` | axios calls + mapping raw → domain; admin writes call `ensureAdminAuth()` first |
| `queries.ts` | `createQuery({primaryKey:'/x/list', queryFn})`, `createMutation`, `createInfiniteQuery` |
| `index.ts` | barrel |

Response envelope from BE: `{ data, code, message, error }`; lists `data: { items, pagination{page,pageSize,total,totalPages}, stats? }`.

## Auth & tokens (`src/api/axios.ts`)

- Two **independent sessions**: client `useUserStore` (`localStorage.user-store`) and admin `useAdminStore` (`localStorage.admin-store`). Both hold `accessToken` + `refreshToken`.
- Request interceptor: no token for `/auth/*` except `/auth/logout`, `/auth/change-password`; **admin token if `Router.pathname` starts with `/admin` or URL starts with `/admin/`**, else user token.
- Response interceptor: on 401 → single-flight `POST /auth/access-token/renew` (queue others) → retry once. Fail: admin → `logoutAdmin` + `/admin/login`; client → `logout` + `/sign-in?callbackUrl=`.
- **Rejects with the BE body `{statusCode, message}`** (not AxiosError) → always read errors with `getApiErrorMessage(err, fallback)` (`src/lib/utils.ts`). Network errors still reject AxiosError ("Network Error").
- `ensureAdminAuth()` (`src/api/admin-auth-guard.ts`): no admin token → logout + redirect + throw. Put it in admin-only request fns; when a request fn is shared with the client (e.g. `updateTourGuide`), put it in the admin mutation hook instead.
- Logging in **anywhere** (curl, Swagger, MCP) as the same account revokes other sessions (BE refresh-token version) → browser gets logged out.
- Client guards are UI-only; BE enforces roles (`@Public`, `@Admin`, `@TourGuide`, `@SuperAdmin`, OR semantics).

## React Query conventions

- Global defaults (`src/lib/Provider.tsx`): `refetchOnMount:false`, `refetchOnWindowFocus:false`, `refetchOnReconnect:false`, `retry:false`.
- Consequence: after create/update, lists stay stale unless you **(a)** set `refetchOnMount: true` on the list query, or **(b)** `invalidateQueries({ queryKey, refetchType: 'all' })`, or **(c)** `removeQueries`. Keys match by **prefix of the array**: `['/product']` does not match `['/product/detail', …]`.
- Mutations: `isLoading` (v4). Lists: `isLoading` = first load, `isFetching && !isLoading` = background search spinner; `keepPreviousData: true` (needs `as any` with react-query-kit types).
- "Stay on form" pattern (admin): create → `router.replace(EDIT(id))`; update → stay, `form.reset(serverValues)`, seed detail cache with `setQueryData`.

## State (`src/stores`)

| Store | Persist | Purpose |
| --- | --- | --- |
| `UserStore` | `user-store` | client session (`!!accessToken` = logged in) |
| `AdminStore` | `admin-store` | admin session; `isAdmin` = token && role ∈ {admin, super_admin} (`useAuth`) |
| `BookingStore` | no | booking wizard state (reset on unmount) |
| `VideoListStore` | no | list handed from search grid to video feed |
| `IntersectionStore` | no | misc in-view flag |
| `use-alert-store` | no | toasts: `addAlert({type,title,description?,duration?})` |
| Other localStorage: `product-draft-{id | new}`, `guide*profile_draft*{id}`, `likedVideoIds`, `profile_tutorial_seen`. |

## Video architecture (client)

- `BunnyVideoPlayer` (`src/components/BunnyVideoPlayer.tsx`): hls.js (non-iOS) or native HLS (iOS) on a **pooled** `<video>`; `extractM3u8Url(embedUrl)` → `https://vz-186cf1b9-231.b-cdn.net/<guid>/playlist.m3u8`. Every `play()` starts muted then applies real muted state next frame.
- `use-shared-video.ts`: module-level pool of **5** `<video>` elements (iOS limits + copy protection); `unlockVideoPool()` must run inside a user gesture before playing with sound.
- Search grid uses plain MP4 `shortUrl` previews; the feed uses HLS.
- Details & must-not-break rules: [05-client-screens.md](./05-client-screens.md#video-detail).

## Uploads

- Images: `uploadImage(file)` → `POST /upload/img` (multipart) → URL on `web-travel.b-cdn.net`.
- Videos: raw `fetch POST {API}/upload/video {title}` → `{videoId, libraryId, expirationTime, signature}` → `tus.Upload` to `NEXT_PUBLIC_BUNNY_TUS_ENDPOINT` (default `https://video.bunnycdn.com/tusupload`) → then save via BE (`createVideo`, moment API…). Used in admin product (hero/banner), admin videos, guide moments, guide reviews.
