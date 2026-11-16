# 04 · Source map (where things live)

```
src/
├─ pages/                 routes (thin). admin/* use AdminLayout via getLayout
├─ modules/               one folder per screen (all UI + logic)
│  ├─ HomePage  DetailSearchPage  VideoDetailPage  ProductPage  GuideProfilePage
│  ├─ SignInPage  SignUpPage  ForgotPasswordPage  ResetPasswordPage  auth-shared
│  ├─ AdminLogin  AdminProduct  AdminDestination  AdminTourGuide  AdminSupplier
│  ├─ AdminVideo  AdminBooking  AdminUser
│  └─ button-page         demo route /button (not a product feature)
├─ api/<domain>/          types · requests · queries · index  (+ axios.ts, admin-auth-guard.ts)
│     auth booking departure-time destination element option payment pickup-location
│     product (+lookup.ts) session supplier supplier-payment tag tour-guide tour-session
│     upload user video
├─ hooks/                 shared hooks: forms (use-*-form), filters, video, auth, misc
├─ stores/                zustand stores
├─ lib/                   utils, text-normalize, validations/*, logger, goong, bunny, const, password, regex
├─ components/
│  ├─ ui/                 shadcn wrappers + shared app UI (admin-*, AlertBanner, FormField/*, change-password-dialog…)
│  ├─ layouts/            MainLayout (phone frame) · ModuleLayout · AdminLayout (Sidebar, AdminHeader)
│  └─ BunnyVideoPlayer.tsx, ErrorBoundary, ThemeProvider…
├─ types/routes.ts        ROUTE constants (+ API_ROUTE)
├─ config/site.ts         meta
├─ data/search.ts         search suggestion chips
├─ styles/                globals.css (imports fonts, design-tokens, animations, driver-onboarding, tiptap[legacy])
└─ assets/fonts.ts        Outfit via next/font/local
public/locales/{en,vi}/   i18n: common homePage searchPage videoDetail productPage guidePage authPage adminPage adminDestination adminUser
public/fonts/             DINPro*, Outfit-Variable-latin.woff2
docs/                     specs (docs/specs/<domain>/*.md), BE reports (docs/be-reports), reviews
documents/                ← this AI-oriented documentation set
.claude/                  agents, skills (web-travel-db), hooks, mcp/web-travel-openapi.mjs
```

## Shared hooks (`src/hooks`)

| Hook | Purpose |
| --- | --- |
| `useAuth` | `{isLoggedIn, isAdmin, user, accessToken}` from both stores |
| `useLogout` / `useAdminLogout` | logout + clear cache + redirect |
| `use-change-password` | scope `admin`/`client`; stores the new token pair returned by BE |
| `use-product-form`, `use-product-draft`, `use-product-filters` | admin product form, draft autosave, list filters |
| `use-destination-form`, `use-destination-filters` | admin destination |
| `use-admin-user-form`, `use-admin-user-filters` | admin users |
| `use-booking-cancel-action` | admin cancel booking |
| `use-edit-profile-form`, `use-guide-profile` | client guide profile |
| `use-shared-video`, `use-video-preloader`, `use-video-detail-feed`, `useVideoSlideLike`, `useLikedVideos`, `use-swipe-back`, `useInview` | video feed |
| `use-search-keyword`, `use-debounce`, `use-scroll-spy`, `use-mounted`, `use-lock-body`, `useCopy`, `usePopover`, `useProfileTutorial`, `useTypeSafeTranslation`, `breakpoint/*` | misc |

## Shared UI to reuse (do not re-create)

| Component | Use for |
| --- | --- |
| `ui/admin-confirm-dialog.tsx` `AdminConfirmDialog` | any confirm (tone danger/primary, `isPending`, `confirmDisabled`, `children`) + `DIALOG_*_CLASS` |
| `ui/admin-pagination.tsx` | "Showing x–y / total" + page buttons |
| `ui/admin-table-state.tsx` | table loading row / empty row / clear-filters button |
| `ui/admin-search-input.tsx` | debounced (400ms) + Enter, normalized keyword |
| `ui/back-to-list-button.tsx` | form header "List" button |
| `ui/AlertBanner` | inline success/error/warning/info box (`message` is a string) |
| `ui/change-password-dialog.tsx` | change password (admin sidebar + client user menu) |
| `ui/stat-card.tsx` | KPI cards |
| `ui/FormField/*` | RHF-bound fields (Text, TextArea, Select, Checkbox, DatePicker, AvatarUpload…) |
| `ui/price-input.tsx`, `phone-input.tsx`, `time-select-picker.tsx`, `select-with-search.tsx` | inputs |
