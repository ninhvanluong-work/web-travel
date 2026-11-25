# 05 · Client screens (phone frame)

Legend: **MNB** = must-not-break (intentional design, ask before changing — see CLAUDE.md).

## Route table

| Route | Page → Module | i18n | Main API |
| --- | --- | --- | --- |
| `/` | `pages/index.tsx` → `modules/HomePage` | common, homePage | — |
| `/search?q=` | `pages/search.tsx` → `modules/DetailSearchPage` | searchPage | `GET /video` (infinite) |
| `/video/[slug]` | `pages/video/[slug].tsx` → `modules/VideoDetailPage` | videoDetail | `GET /video/:slug`, `GET /video`, like/dislike |
| `/product/[id]` | `pages/product/[id].tsx` → `modules/ProductPage` | productPage | `GET /product/:id`, `/product/:id/review` |
| `/product/[id]/booking` | `pages/product/[id]/booking.tsx` → `BookingSheet` | productPage | `/product/:id/booking`, `/session`, `POST /booking`, payment |
| `/payment/vnpay/return` | `pages/payment/vnpay/return.tsx` | productPage | — (reads query) |
| `/guide/[id]` | `pages/guide/[id].tsx` → `modules/GuideProfilePage` | common, guidePage, adminPage | `/tour-guide/:id`, moments, reviews |
| `/sign-in`, `/sign-up`, `/forgot-password`, `/reset-password` | `modules/*Page` | common, authPage | `/auth/*` |

## Home `/`

- `SearchBox` → normalizes keyword (`normalizeSearchKeyword`) → `/search?q=`.
- `UserMenu` (top-left): logged out → "Sign in"; logged in → bottom Sheet (clamped to 430px) with profile, **Change password** (`ChangePasswordDialog scope="client"`), Logout (confirm).
- Background `<video>` `web-travel.b-cdn.net/village-tour.mp4`: try unmuted → fallback muted; first touch unmutes unless user muted.
- **MNB:** `visualViewport` resize/scroll + `requestAnimationFrame` → `translateY(vv.offsetTop)` keeps the search box above the mobile keyboard. Spec `docs/specs/homepage/searchbox-keyboard-fix.md`.

## Search `/search`

- Runs on **submit** (no debounce); `router.replace(?q, shallow)`; query gated until `router.isReady`.
- `useInfiniteListVideo` `pageSize=6`, cursor = `distanceScore`.
- **MNB:** infinite sentinel at `length - 3` (`useInView` 0.1), gated by `hasScrolled` + `fetchedRef` latch; **one audio at a time** via `activeAudioId` lifted to `VideoGrid` (others dimmed); `VideoCard` plays at ≥50% visible, staggered `index*100ms` (iOS); hidden `<video>` preload of first 2 items of the newest page.
- Click → `unlockVideoPool()` + `VideoListStore.setList(...)` → `/video/<slug>?autoplay=true`.
- Specs: `docs/specs/video-grid/*`, `docs/specs/search/*`, `docs/specs/nav/from-search.md`.

## Video detail `/video/[slug]` {#video-detail}

- Feed hook `use-video-detail-feed.ts`: from grid (store list + more via `rootId`) **or** reload/direct link (`GET /video/:slug` then feed).
- **MNB rules:**
  - `rootSlug` locked at first load; `currentSlug` changes per swipe via `router.replace(…, {shallow:true})` deferred in rAF.
  - Container `snap-y snap-mandatory`, slides `snap-start`.
  - `isNearView` `rootMargin 150%` mounts player (tuned to pool size 5); `isInView` threshold **0.6** → play + URL sync; out → pause.
  - **Reload gate**: `gated = autoplay !== 'true'` → scroll locked, `forcePause`, big Play button; tap → `unlockVideoPool()` + unmute + ungate. Keep this on reload.
  - Preload next slide: iOS `use-video-preloader` fetches m3u8 + first `.ts`; Android relies on hls.js.
  - Swipe-back (`use-swipe-back.ts`): right swipe ≥30% width or ≥0.3px/ms → `router.back()`.
  - Like: optimistic + `localStorage.likedVideoIds`, server sync debounced 500ms.
- Doc: `docs/video-detail-load-mechanism.md` (full flow), `docs/specs/video-detail/*`, `docs/specs/ios/*`.

## Product `/product/[id]`

Sections (framer fade-in): hero carousel (images + `BunnyVideoPlayer`), header, quick facts, experiences, operator, guide, itinerary (HTML via `dangerouslySetInnerHTML` — not sanitized), reviews, included, before-you-book, sticky CTA → `/product/[id]/booking`. Adapter `ProductPage/adapter.ts` maps API → UI model.

## Booking `/product/[id]/booking`

`BookingSheet` (`components/booking-sheet/`), state in `BookingStore`, logic in `use-booking-sheet-state.ts`.
| Step | Content | API |
| --- | --- | --- |
| 1 Info | date (default today) → session for that date → passengers per unit; contact name/phone/email/messenger | `GET /session?productId&fromDate=toDate=` (uses `items[0].sessionUnits`) |
| 2 Options | departure (auto if one), pickup predefined / **custom (Goong)**, package (option) | `GET /product/:id/booking` |
| 3 Review | summary + terms → create | `POST /booking {productId, optionId, tourSessionId, pickupLocationId, departureId, passengers[{unitId,count}], username, email, phone, messengerApp[]}` |
| 4 Payment | VND → VNPay (min 10,000; redirect, origin saved in `sessionStorage.vnpay_return_origin`); else PayPal (`usePaypalConfig`, hidden `PayPalButtons` overlay on custom button — intentional) | `/payment/vnpay/:id/create-payment-url`, `/payment/paypal/:id/create-order`, `/capture-order` |

- BE computes the price server-side (client total is display only).
- Known gaps: custom pickup not sent to BE (surcharge always 0); "Card" button has no handler; returning to step 3 after creating may create another booking. VNPay return page trusts query `status`.

## Guide profile `/guide/[id]`

- `isOwner = user.role === 'tour_guide' && user.tourGuideId === id` (UI only; BE enforces).
- Owner: Edit profile sheet (`use-edit-profile-form`, draft `guide_profile_draft_<id>`, `PUT /tour-guide/:id`), manage moments (tus upload, max 50MB mp4/webm/mov, `POST/PUT/DELETE /tour-guide/:id/moment`), onboarding (driver.js, `POST /tour-guide/onboarding`), logout.
- Others: "Rate me" → rating sheet (stars + criteria, media queue max 5×10MB) → `POST /review/tour-guide/:id`; QR (`qrcode.react`), share.
- Moments popup uses `BunnyVideoPlayer` (not iframe) so gestures work; review videos use Bunny iframe.
- `mock-adapter.ts` `mergeWithLocalStorage` overlays `localStorage.guide_profile_<id>` on API data (legacy).

## Auth pages

- Sign-in: `POST /auth/login` → store `{accessToken: token, refreshToken, user}`; redirect: safe `callbackUrl` → tour guide own profile → `/`.
- Sign-up: `POST /auth/register {email, password, role: isTourGuide ? 'tour_guide' : 'normal'}` → `/sign-in`.
- Forgot: `POST /auth/forgot-password`. Reset: `?token` → `POST /auth/reset-password {token,newPassword}`.
- Emails are trimmed + lowercased before submit (BE compares case-sensitively).

## Global

- `TourGuideFAB`: shown for tour guides except on own profile; raised above product CTA bars.
- `GlobalAlertProvider` renders `useAlertStore` toasts.
