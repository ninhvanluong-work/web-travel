# 06 · Admin screens (`/admin`)

## Shell

- `AdminLayout` (`src/components/layouts/AdminLayout/`): waits for mount; `!isAdmin` → `/admin/login?callbackUrl=`. Sidebar items: Dashboard (`/admin` — **no page exists**), Products, Destinations, Tour Guides, Suppliers, Videos, Bookings, Users; footer: **Change password** (`ChangePasswordDialog scope="admin"`), Logout (confirm).
- Login `/admin/login` (`modules/AdminLogin`): `POST /auth/admin/login` → `setAdminStore` → safe `callbackUrl` or `/admin/products`.
- i18n: `adminPage` (most), `adminDestination`, `adminUser`, `common`.

## Modules

| Module | Routes | Key files | Form / validation | API hooks |
| --- | --- | --- | --- | --- |
| Product | `/admin/products`, `/create`, `/[id]/edit` | `ProductListPage/*`, `ProductFormPage/*` (sections/, shared/) | `src/hooks/use-product-form.ts`, `use-product-draft.ts`; `lib/validations/product.ts` | `useProductList` `/product`, `useProductById` `/product/detail`, create/update, `useUpdateProductStatus` |
| Destination | `/admin/destinations`, `/create`, `/[id]/edit` | `DestinationListPage/*`, `DestinationFormPage/*`, `constants.ts` | `src/hooks/use-destination-form.ts`; `lib/validations/destination.ts` | `useDestinationPagedList` (refetchOnMount true), `useDestinationById`, CRUD |
| Tour guide | `/admin/guides`, `/create`, `/[id]/edit` | `GuideListPage/*` (+ `hooks/use-guide-delete-impact.ts`), `GuideFormPage/*` (+ `sections/moments-section.tsx`) | `GuideFormPage/hooks/use-guide-form.ts`; `lib/validations/tour-guide.ts` | `useTourGuideList`, `useTourGuideById`, CRUD, `useAdminDeleteTourGuideMoment` |
| Supplier | `/admin/suppliers`, `/create`, `/[id]/edit` | `SupplierListPage.tsx`, `SupplierFormPage/*` (payment accounts) | `SupplierFormPage/hooks/use-supplier-form.ts` (hand-written validate, no zod) | `/supplier/*`, `/supplier-payment/*` |
| Video | `/admin/videos` | `VideoPage/*` (upload card, paged table) | — | `useListVideoAdminPaged`, `createVideo` |
| Booking | `/admin/bookings` | `BookingListPage.tsx`, `components/*` (drawer, cancel dialog) | `src/hooks/use-booking-cancel-action.ts` | `useBookingList` (+stats), `useBookingPayments`, `useBookingPaymentLogs`, `useCancelBooking` |
| User | `/admin/users`, `/create`, `/[id]/edit` | `UserListPage/*`, `UserFormPage/*`, `permissions.ts`, `components/*` | `src/hooks/use-admin-user-form.ts`; `lib/validations/admin-user.ts` | `useAdminUserList` (refetchOnMount true), `useAdminUserById`, CRUD, `useResetAdminUserPassword` |

There is **no AdminSession module**: sessions are managed inside Product ("Lịch & Giá").

## Feature matrix

| Module | List | KPI | Save behavior | Delete |
| --- | --- | --- | --- | --- |
| Product | `AdminSearchInput` + filter popover (supplier, destination, status, dates), server paging, inline pagination | total (server) + published/drafts (**current page only**) | create → `replace(EDIT)`; update stays; Publish/Hide = update then status call | **Hidden** (`PRODUCT_DELETE_ENABLED=false`, BE has no DELETE); use Hide |
| Destination | search + `AdminPagination` | total (separate query) | stay on form, `setQueryData`; leave-confirm; Ctrl/Cmd+Enter | `AdminConfirmDialog`, steps back a page if last row |
| Tour guide | search, inline pagination | total + 2 page-only stats | stay on form; leave guard (`beforeunload` + routeChange) | warns if linked account (first 50 tour_guide users) / has moments; Moments section: list + delete only |
| Supplier | **client-side** (loads 49) | count loaded | create → EDIT (payment accounts need id) | `SupplierDeleteModal` |
| Video | search, page size 10/20/50 | — | upload → refetch | none (copy embed only) |
| Booking | keyword, status, date range, supplier/product (first 50) | 4 cards from `data.stats` | — | **Cancel** (pending only) from drawer |
| User | search + role filter + `AdminPagination` | 4 cards (role totals, `pageSize:1` queries) | stay on form; role sent only if changed | `AdminConfirmDialog` (soft delete) |

## Product form details

- Sections (`NAV_SECTIONS`): banner (drag reorder, image/video), tags, overview (name, slug, min price, short desc, highlight, destination, supplier, tour guides, hero video), quick facts (elements), experiences, itinerary, read-before, details (include/exclude), options, pickups, departures, units.
- Header buttons: Save draft (forces `draft`), Save changes, Publish/Hide (update → `POST /product/:id/status/:status`), Manage sessions (edit only), List.
- Payload: one `POST/PUT /product` with nested options/departures(`HH:mm:00`)/pickups/units (`toApiPayload` in `src/api/product/requests.ts`). ⚠ empty arrays become `undefined` → BE keeps old tags/guides/itineraries.
- Draft: `localStorage.product-draft-{id|new}`, every 5s only when dirty and no pending draft; recovery banner only on create.
- **Sessions ("Lịch & Giá")**: `ProductSessionSheet` (from list row or form header) → `SessionSection`: filters, `SessionTable`, Create one day / Create range (≤366 days, weekdays 1=Mon…7=Sun, `duplicateStrategy skip|overwrite`, per-unit prices) / Edit / Delete. All invalidate `['/session']`.
- Side-nav scroll-spy exists but uses `hidden lg:flex` → never visible (lg = 10000px).

## Booking details

- Drawer tabs: Info (customer, tour, travel, total; **cancel info** when `cancel`; **Cancel booking** button when `pending`, separated at the bottom) and Payment (payments + status timeline).
- Cancel: `AdminConfirmDialog` with summary, required reason (≤500), warning if a payment is pending → `POST /booking/:id/cancel {reason}`; BE errors shown verbatim (`Booking is not pending` / 404 → close drawer + refetch).
- Spec: `docs/specs/admin/booking-cancel.md`.

## User permissions (`modules/AdminUser/permissions.ts`)

| Actor | Can assign | Can manage |
| --- | --- | --- |
| super_admin | normal, tour_guide, admin | everyone except super_admin targets |
| admin | normal, tour_guide | normal/tour_guide (+ self); not admin/super_admin |

Nobody can assign `super_admin`; no self role change/delete. Reset password: admin types/generates (`lib/password.ts`).

## Tour guide auth (BE, fixed 2026-11-03)

Admin may update/delete guides and delete moments; guides only manage their own. Still open on BE: `POST /tour-guide` is public, moment create/update lack ownership check. See `docs/be-reports/tour-guide-auth-2026-11-02.md`.
