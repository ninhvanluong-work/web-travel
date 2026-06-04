# Code Review: Guide Profile Page

**Date:** 2026-06-03  
**Reviewer:** code-review agent  
**Branch:** dev

---

## Scope

- Files reviewed: 19 new + 4 modified (see task brief)
- Lines of code analyzed: ~600
- Review focus: new GuideProfilePage module + minor ProductPage changes

---

## Overall Assessment

Implementation is solid. Structure follows project conventions (thin page, feature module, hooks), mock data types are well-defined, component decomposition is logical, and empty states are handled. The `pnpm check-types` passes clean.

**14 lint errors** exist — all mechanical (Prettier formatting + import-sort). No logic, no type, no security defects from lint.

Two real issues to address before the feature is usable: (1) the `card-flip-badge` component is missing (plan checklist item unmet), and (2) `DestinationsChart`/`GuestFeedback` hard-code the guide's name "Minh" instead of reading from props.

---

## Critical Issues

None.

---

## Important Findings

### 1. `card-flip-badge` component is missing — plan item not completed

Phase 2, task 9 calls for `card-flip-badge.tsx` (CSS 3D flip of the `#HN-2847` pill). `HeroBanner` currently renders a static `<span>`. The plan checklist has `- [ ] Badge flip hoạt động` still unchecked.

This is not a bug in what exists — but the plan marks it incomplete and it is the only interactive item missing from the UI.

### 2. Hard-coded guide name "Minh" in two components

`destinations-chart.tsx` line 14:

```tsx
<p className="text-[14px] font-medium text-neutral-900 mb-1">Những nơi Minh dẫn tour</p>
```

`guest-feedback.tsx` line 15:

```tsx
<p className="text-[14px] font-medium text-neutral-900 mb-1">Khách nói gì về Minh</p>
```

Both components receive no `name` prop. When used with a different guide, the heading will always say "Minh". Fix: accept `name` prop or derive first name from the parent-level `data.name`.

### 3. `GuideProfileSkeleton` uses `min-h-screen` instead of `h-full`

```tsx
// guide-profile-skeleton.tsx line 5
<div className="bg-[#F3F3F7] min-h-screen">
```

`MainLayout` wraps `<main>` with `h-full overflow-hidden`. `min-h-screen` will overflow the phone frame during the loading state — the skeleton will look taller than the actual page. The main module index uses `h-full overflow-y-auto` correctly; skeleton should match.

### 4. `handleShare` in `action-bar.tsx` — clipboard call not awaited on error path (minor race), but real issue is missing error feedback

`navigator.share` cancellation is silently swallowed (expected). However, `navigator.clipboard.writeText` can throw (permissions denied) and the error is unhandled — the `addAlert` call on line 31 would not execute:

```ts
// current
if (navigator.clipboard) {
  await navigator.clipboard.writeText(url);  // throws if permission denied
}
useAlertStore.getState().addAlert(...);       // unreachable if above throws
```

Wrap in try/catch:

```ts
try {
  await navigator.clipboard.writeText(url);
  useAlertStore.getState().addAlert({ type: 'success', title: 'Đã sao chép liên kết' });
} catch {
  useAlertStore.getState().addAlert({ type: 'error', title: 'Không thể sao chép liên kết' });
}
```

### 5. Plan specifies `toast` from `use-toast.ts`, implementation uses `useAlertStore`

Phase 2 task 11 says: `toast({ description: '...' })` from `src/components/ui/use-toast.ts`. The actual code uses `useAlertStore.getState().addAlert(...)`. This is a deviation — but `useAlertStore` is the newer, project-preferred approach (commit `4877f87`). Deviation is fine; the plan text is outdated. No action needed except updating the plan.

---

## Medium Priority Improvements

### 6. `'use client'` directives in a Pages Router project are no-ops

`index.tsx`, `action-bar.tsx`, `criteria-bar.tsx`, `destinations-chart.tsx`, `moments-grid.tsx`, `qr-sheet.tsx`, `stats-block.tsx` all have `'use client'` at the top. Pages Router does not use this directive — it is an App Router concept. The directive is silently ignored, so no breakage, but it is misleading noise. Remove from all files in this module.

### 7. `MomentsGrid` uses `role="button"` div instead of `<button>`

```tsx
<div role="button" tabIndex={0} onClick={...} onKeyDown={...}>
```

A native `<button>` handles keyboard events, focus styles, and assistive technology automatically. The `onKeyDown` here only handles `Enter`, missing `Space`. Use `<button>` and let the browser handle it.

### 8. `FeaturedReviews` — "Xem tất cả" button has no `onClick` handler

```tsx
<button className="w-full text-[12px] text-neutral-500 py-[9px]">Xem tất cả {totalReviews} đánh giá khách</button>
```

Similarly in `MomentsGrid` the "Xem tất cả khoảnh khắc" button is inert. If these are intentional placeholders for a future feature, add `disabled` and a visual affordance, or remove until wired up (YAGNI).

### 9. `useGuideProfile` ignores the `id` param entirely

```ts
export function useGuideProfile(_id: string | undefined) {
  // always returns MOCK_GUIDE regardless of id
```

For a mock this is acceptable, but the underscore prefix convention (`_id`) suggests it is intentionally unused. When real API integration lands, the hook signature is ready. The concern is only documentation: add a comment noting this is mock-only.

### 10. `SpecialtyTags` — dynamic Tailwind classes via `s.bg`/`s.text` from data

```tsx
<span className={`text-[12px] px-[11px] py-1.5 rounded-full ${s.bg} ${s.text}`}>
```

Tailwind purges classes it cannot statically analyze. Because `s.bg = 'bg-[#EEEDFE]'` and `s.text = 'text-[#3C3489]'` are arbitrary-value classes in mock data strings, Tailwind may purge them in production builds. Options:

- Move colors to `tailwind.config.ts` as named tokens and use those token class names in data
- Or safelist the patterns in `tailwind.config.ts`: `safelist: [{ pattern: /^(bg|text)-\[#/ }]`

---

## Low Priority Suggestions

### 11. `CriteriaBar` recalculates `widthPct` on every render

```ts
const widthPct = `${((score / 5) * 100).toFixed(0)}%`;
```

Score is a prop that never changes mid-render — this is fine. Just note it could be `useMemo` if it ever becomes expensive, but for now it is fine.

### 12. `DestinationsChart` `percentage` in mock data is pre-computed relative to max

The mock data's `percentage` field is a pre-computed relative percentage (Hà Nội = 100, Sapa = 61, etc.). If this comes from an API later, the field may mean an absolute percentage (e.g. "61% of all tours"). The field semantics are ambiguous. Document in the type or rename to `relativePercent` vs `absolutePercent`.

### 13. 14 Prettier/import-sort lint errors

Run `pnpm lint:fix` (or `lint-changed.bat`) to auto-fix all. Files affected:

- `action-bar.tsx` — import sort
- `dispatch-list.tsx` — 2 Prettier
- `featured-reviews.tsx` — 2 Prettier
- `guest-feedback.tsx` — import sort
- `moments-grid.tsx` — 2 Prettier
- `operator-reviews.tsx` — 2 Prettier
- `qr-sheet.tsx` — 1 Prettier
- `stats-block.tsx` — import sort
- `use-guide-profile.ts` — import sort
- `index.tsx` — import sort
- `guide-block.tsx` (ProductPage) — 1 Prettier

---

## Positive Observations

- Type-only imports (`import type`) used consistently
- `Pick<GuideProfileData, ...>` for component props is correct — props are narrowed, not over-broad
- Empty states handled in all three sections the plan required (dispatch, moments, operator-reviews)
- `useAlertStore.getState()` used in event handler (not in render) — correct pattern
- `whileInView` with `viewport={{ once: true }}` on progress bars — correct, avoids re-animation on scroll up
- `motion.div` stagger only on first four blocks (per spec) — well-reasoned
- QR sheet uses shared `Sheet` component from `src/components/ui/sheet` — follows shared-UI rule
- `ROUTE.GUIDE_PROFILE_PATH` added to `routes.ts` and consumed in `guide-block.tsx` — correct

---

## Recommended Actions

1. **[Lint]** Run `pnpm lint:fix` to auto-resolve all 14 errors.
2. **[Important]** Fix hard-coded "Minh" in `destinations-chart.tsx` and `guest-feedback.tsx` — pass `guideName` prop from parent.
3. **[Important]** Fix `GuideProfileSkeleton` `min-h-screen` → `h-full overflow-y-auto`.
4. **[Important]** Wrap `navigator.clipboard.writeText` call in try/catch in `action-bar.tsx`.
5. **[Medium]** Replace `role="button"` div in `moments-grid.tsx` with `<button>`.
6. **[Medium]** Remove `'use client'` from all files (Pages Router — no-op).
7. **[Medium]** Either wire up or remove the two inert buttons (`FeaturedReviews`, `MomentsGrid`).
8. **[Medium]** Safelist arbitrary Tailwind color classes used in `specialties` data array, or move colors to config tokens.
9. **[Low]** Implement `card-flip-badge` component to complete the unchecked plan item.

---

## Plan Checklist Status

From `phase-plan.md` final checklist:

| Item                                               | Status                                         |
| -------------------------------------------------- | ---------------------------------------------- |
| `pnpm check-types` pass                            | DONE                                           |
| `/guide/1` render đủ tất cả sections               | DONE                                           |
| Badge flip hoạt động                               | **NOT DONE** — component missing               |
| QR Sheet mở/đóng                                   | DONE                                           |
| Share button: Web Share API hoặc clipboard + toast | DONE (uses AlertStore, not toast — acceptable) |
| Dispatch list toggle                               | DONE                                           |
| Moments click navigate sang video                  | DONE                                           |
| Progress bars animate when in view                 | DONE                                           |
| CTA tap scale                                      | DONE                                           |
| Page entrance stagger                              | DONE                                           |
| Skeleton hiển thị khi loading                      | DONE                                           |
| Empty states cho 3 sections                        | DONE                                           |

---

## Metrics

- TypeScript errors: 0
- Lint errors: 14 (all auto-fixable — Prettier + import-sort)
- Security issues: 0
- Missing plan items: 1 (`card-flip-badge`)
