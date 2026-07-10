# Phase 02 — `ProfileOnboarding` Component + Add IDs to Sub-Components

## Context Links

- Spec: `D:/Remote/web-travel/docs/spec-guide-profile-onboarding.md`
- Plan overview: `D:/Remote/web-travel/plans/20260708-1400-guide-profile-onboarding/plan.md`
- Phase 01: `D:/Remote/web-travel/plans/20260708-1400-guide-profile-onboarding/phase-01-setup.md`
- `hero-banner.tsx`: `D:/Remote/web-travel/src/modules/GuideProfilePage/components/hero-banner.tsx`
- `action-bar.tsx`: `D:/Remote/web-travel/src/modules/GuideProfilePage/components/action-bar.tsx`
- `storytelling-block.tsx`: `D:/Remote/web-travel/src/modules/GuideProfilePage/components/storytelling-block.tsx`
- `stats-block.tsx`: `D:/Remote/web-travel/src/modules/GuideProfilePage/components/stats-block.tsx`
- `moments-grid.tsx`: `D:/Remote/web-travel/src/modules/GuideProfilePage/components/moments-grid.tsx`

## Overview

- **Date:** 2026-07-08
- **Priority:** High
- **Status:** Pending
- Add `id` attributes to the five target sub-components so driver.js can spotlight them. Create `ProfileOnboarding` — a renderless component (returns `null`) that boots driver.js inside `useEffect` when conditions are met.

## Key Insights

- driver.js is vanilla JS; no React adapter needed. Mount via `useEffect`, destroy on cleanup.
- Component must return `null` — it produces no DOM. All work is side-effect (driver.js overlay injected into `document.body`).
- `isReady` prop gates the tutorial start: component must not run until `isLoading === false` AND `data !== null` so all target DOM nodes exist.
- `replayTrigger` prop (a number, incremented by the parent) re-fires the `useEffect` to restart the tutorial. This avoids prop drilling a callback and keeps the component's API minimal.
- `onDestroyed` fires on both Finish and Skip — use it as the single sink for `markAsSeen()`.
- Steps 1 and 7 use `element: undefined` for full-screen overlay (no spotlight). Driver.js renders popover in center when no element provided.
- driver.js adds its own overlay CSS to `<head>` on first call; no manual CSS import needed when importing the default export object.
- The app is mobile-first with `max-w-[430px]` phone frame. Driver.js default popover fits within that width without customization.
- Content strings in Vietnamese per spec; no i18n key needed (tutorial is one-time, not a repeated UI string).

## Requirements

**Functional:**

- Auto-start when `isReady === true` AND `hasSeen === false`.
- Re-start when `replayTrigger` increments (regardless of `hasSeen`).
- Call `markAsSeen()` on finish or skip.
- 7 steps in exact order per spec.
- Skip button (driver.js provides "X" by default via `showButtons: ['next', 'previous', 'close']`).

**Non-functional:**

- Zero DOM rendered by this component (`return null`).
- Cleanup on unmount: call `driverInstance.destroy()` if active.
- No Zustand dependency.

## Architecture

```
<ProfileOnboarding
  isReady={boolean}        // true when data loaded + not loading
  replayTrigger={number}   // increment to restart
  hasSeen={boolean}
  markAsSeen={() => void}
/>

useEffect deps: [isReady, replayTrigger, hasSeen, markAsSeen]
  → if (!isReady) return
  → if (hasSeen && replayTrigger === 0) return   // initial-render guard
  → build driver instance
  → driver.drive()
  → return () => driver.destroy()
```

The `replayTrigger` trick: phase 03 initializes it as `useState(0)`. On first render `replayTrigger === 0` so the guard `hasSeen && replayTrigger === 0` blocks replay for already-seen users. When user presses "?", parent sets `replayTrigger(n => n + 1)`, which breaks the guard.

## IDs to Add to Sub-Components

| File                     | Element to tag                                                                              | `id` value          |
| ------------------------ | ------------------------------------------------------------------------------------------- | ------------------- |
| `hero-banner.tsx`        | Outer `<div className="relative h-[280px] ...">`                                            | `tour-hero`         |
| `action-bar.tsx`         | Outer `<div className="p-[18px] flex gap-[10px] ...">`                                      | `tour-action-bar`   |
| `storytelling-block.tsx` | Outer `<div className="py-[22px] px-[18px] bg-white ...">`                                  | `tour-storytelling` |
| `stats-block.tsx`        | Outer `<div className="py-[22px] px-[18px] bg-white ...">`                                  | `tour-stats`        |
| `moments-grid.tsx`       | Outer `<div className="py-[22px] px-[18px] bg-white ...">` (in the non-empty return branch) | `tour-moments`      |

Note for `moments-grid.tsx`: the component has three return branches (loading skeleton, empty state, populated). Add `id="tour-moments"` to the outer `<div>` in **all three** non-skeleton branches (empty state `<div>` and populated `<div>`). The loading skeleton branch does not need an id as the tutorial only starts after `isReady === true`.

## Related Code Files

| Path                                                             | Action | Note                                                               |
| ---------------------------------------------------------------- | ------ | ------------------------------------------------------------------ |
| `src/modules/GuideProfilePage/components/profile-onboarding.tsx` | CREATE | Renderless tutorial orchestrator                                   |
| `src/modules/GuideProfilePage/components/hero-banner.tsx`        | MODIFY | Add `id="tour-hero"` to outer div                                  |
| `src/modules/GuideProfilePage/components/action-bar.tsx`         | MODIFY | Add `id="tour-action-bar"` to inner div (not the fragment)         |
| `src/modules/GuideProfilePage/components/storytelling-block.tsx` | MODIFY | Add `id="tour-storytelling"` to outer div                          |
| `src/modules/GuideProfilePage/components/stats-block.tsx`        | MODIFY | Add `id="tour-stats"` to outer div                                 |
| `src/modules/GuideProfilePage/components/moments-grid.tsx`       | MODIFY | Add `id="tour-moments"` to outer div in empty + populated branches |

## Implementation Steps

### Step 1 — Add IDs to sub-components

**`hero-banner.tsx` — line 19:**

```tsx
// Before
<div className="relative h-[280px] overflow-hidden" style={...}>

// After
<div id="tour-hero" className="relative h-[280px] overflow-hidden" style={...}>
```

**`action-bar.tsx` — line 52 (the inner `<div>` inside the fragment):**

```tsx
// Before
<div className="p-[18px] flex gap-[10px] border-b border-neutral-200 bg-white">

// After
<div id="tour-action-bar" className="p-[18px] flex gap-[10px] border-b border-neutral-200 bg-white">
```

**`storytelling-block.tsx` — line 27:**

```tsx
// Before
<div className="py-[22px] px-[18px] bg-white border-b border-neutral-200">

// After
<div id="tour-storytelling" className="py-[22px] px-[18px] bg-white border-b border-neutral-200">
```

**`stats-block.tsx` — line 41:**

```tsx
// Before
<div className="py-[22px] px-[18px] bg-white border-b border-neutral-200">

// After
<div id="tour-stats" className="py-[22px] px-[18px] bg-white border-b border-neutral-200">
```

**`moments-grid.tsx` — two places (empty branch line 87, populated branch line 110):**

```tsx
// Both outer <div> elements:
// Before
<div className="py-[22px] px-[18px] bg-white border-b border-neutral-200">

// After
<div id="tour-moments" className="py-[22px] px-[18px] bg-white border-b border-neutral-200">
```

### Step 2 — Create `profile-onboarding.tsx`

Full file content:

```typescript
import { driver } from 'driver.js';
import 'driver.js/dist/driver.css';
import { useEffect } from 'react';

interface ProfileOnboardingProps {
  isReady: boolean;
  replayTrigger: number;
  hasSeen: boolean;
  markAsSeen: () => void;
}

export default function ProfileOnboarding({ isReady, replayTrigger, hasSeen, markAsSeen }: ProfileOnboardingProps) {
  useEffect(() => {
    if (!isReady) return;
    // On initial render (replayTrigger === 0), skip if already seen.
    // On replay (replayTrigger > 0), always run.
    if (hasSeen && replayTrigger === 0) return;

    const driverObj = driver({
      showProgress: true,
      animate: true,
      smoothScroll: true,
      allowClose: true,
      overlayOpacity: 0.65,
      nextBtnText: 'Tiếp tục →',
      prevBtnText: '← Quay lại',
      doneBtnText: 'Bắt đầu thôi!',
      onDestroyed: () => {
        markAsSeen();
      },
      steps: [
        {
          // Step 1: Welcome splash — no element = full-screen overlay
          popover: {
            title: 'Chào mừng đến với Hồ sơ của bạn! 🎉',
            description:
              'Đây là trang cá nhân của bạn, nơi du khách và các đơn vị lữ hành sẽ nhìn thấy. Hãy cùng khám phá cách làm cho hồ sơ của bạn thật ấn tượng nhé!',
            side: 'over' as const,
            align: 'center',
          },
        },
        {
          // Step 2: HeroBanner
          element: '#tour-hero',
          popover: {
            title: 'Ảnh đại diện & Ảnh bìa',
            description:
              'Một bức ảnh chuyên nghiệp và nụ cười rạng rỡ sẽ là điểm cộng lớn. Nhấn vào đây để cập nhật những hình ảnh đẹp nhất của bạn.',
            side: 'bottom',
            align: 'start',
          },
        },
        {
          // Step 3: ActionBar
          element: '#tour-action-bar',
          popover: {
            title: 'Thanh công cụ',
            description:
              'Nơi bạn có thể chỉnh sửa thông tin nhanh, chia sẻ hồ sơ (Share), hoặc xem các thống kê cá nhân (Insight).',
            side: 'bottom',
            align: 'start',
          },
        },
        {
          // Step 4: StorytellingBlock
          element: '#tour-storytelling',
          popover: {
            title: 'Câu chuyện của bạn',
            description:
              'Hãy kể cho du khách nghe về đam mê, kinh nghiệm và phong cách dẫn tour độc đáo của bạn. Một câu chuyện hay sẽ tạo nên sự kết nối tuyệt vời.',
            side: 'bottom',
            align: 'start',
          },
        },
        {
          // Step 5: StatsBlock
          element: '#tour-stats',
          popover: {
            title: 'Thành tích & Chỉ số',
            description:
              'Các con số biết nói! Nơi này tổng hợp số tour bạn đã dẫn, số điểm đánh giá trung bình và các huy hiệu bạn đạt được.',
            side: 'top',
            align: 'start',
          },
        },
        {
          // Step 6: MomentsGrid
          element: '#tour-moments',
          popover: {
            title: 'Khoảnh khắc đáng nhớ',
            description:
              'Đăng tải những bức ảnh tuyệt đẹp từ các chuyến đi của bạn. Đây là "portfolio" trực quan nhất để thuyết phục khách hàng.',
            side: 'top',
            align: 'start',
          },
        },
        {
          // Step 7: Closing splash — no element = full-screen overlay
          popover: {
            title: 'Bạn đã sẵn sàng! 🚀',
            description: 'Giờ thì hãy bắt đầu cập nhật thông tin và sẵn sàng cho những chuyến đi tuyệt vời sắp tới!',
            side: 'over' as const,
            align: 'center',
          },
        },
      ],
    });

    driverObj.drive();

    return () => {
      driverObj.destroy();
    };
    // replayTrigger in deps ensures re-run on increment
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isReady, replayTrigger]);

  return null;
}
```

Notes on the implementation:

- `import 'driver.js/dist/driver.css'` — driver.js requires its CSS to be imported manually. This is a global style import; Next.js allows CSS imports in component files when they are global stylesheets.
- `side: 'over' as const` — driver.js v1+ uses `'over'` for centered full-screen popovers with no spotlight. Verify with installed version; fallback: omit `side` entirely for step 1/7 and driver will center by default.
- `onDestroyed` fires on both "done" and "X" (skip). This is the single place `markAsSeen()` is called.
- `eslint-disable-next-line react-hooks/exhaustive-deps` — intentionally excluding `hasSeen` and `markAsSeen` from deps after the guard check on mount, so replay works correctly. Explain in comment.
- Alternative if `side: 'over'` is not supported in installed version: use `element: '#non-existent-id-for-splash'` trick or check driver.js changelog.

## Todo List

- [ ] Add `id="tour-hero"` to `hero-banner.tsx` outer div
- [ ] Add `id="tour-action-bar"` to `action-bar.tsx` inner div
- [ ] Add `id="tour-storytelling"` to `storytelling-block.tsx` outer div
- [ ] Add `id="tour-stats"` to `stats-block.tsx` outer div
- [ ] Add `id="tour-moments"` to both empty-state and populated outer divs in `moments-grid.tsx`
- [ ] Create `src/modules/GuideProfilePage/components/profile-onboarding.tsx`
- [ ] Verify `driver.js/dist/driver.css` path is correct for installed version
- [ ] Run `pnpm check-types` — no errors
- [ ] Run `pnpm lint` — no errors

## Success Criteria

- `document.getElementById('tour-hero')` returns a DOM node when profile page is rendered.
- Same for `tour-action-bar`, `tour-storytelling`, `tour-stats`, `tour-moments`.
- `ProfileOnboarding` file exports a default function that returns `null`.
- TypeScript compiles with zero errors.
- ESLint passes.

## Risk Assessment

| Risk                                                              | Likelihood | Mitigation                                                                                             |
| ----------------------------------------------------------------- | ---------- | ------------------------------------------------------------------------------------------------------ |
| `driver.js/dist/driver.css` path differs across versions          | Medium     | Check actual installed path in `node_modules/driver.js/dist/`; may be `driver.css` or `driver.min.css` |
| `side: 'over'` not valid in older driver.js v1                    | Medium     | Omit `side` for splash steps; driver centers the popover by default when `element` is undefined        |
| Multiple IDs on page if component mounts twice (React StrictMode) | Low        | driver.js `destroy()` in cleanup handles this correctly                                                |
| `moments-grid.tsx` has three render branches — missed ID          | Medium     | Explicitly tag both empty-state and populated `<div>` per step 1 instructions                          |
| CSS import blocked by Next.js config                              | Low        | Next.js allows global CSS imports in `_app.tsx`; if blocked in component, move import to `_app.tsx`    |

## Next Steps

- Phase 03 imports `ProfileOnboarding` and wires `isReady`, `replayTrigger`, `hasSeen`, `markAsSeen` props.
- Phase 03 adds the "?" replay button to `ActionBar`.
