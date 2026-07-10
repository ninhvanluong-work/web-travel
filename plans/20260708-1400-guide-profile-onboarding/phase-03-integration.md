# Phase 03 — Integrate into GuideProfilePage + ActionBar Replay Button

## Context Links

- Spec: `D:/Remote/web-travel/docs/spec-guide-profile-onboarding.md`
- Plan overview: `D:/Remote/web-travel/plans/20260708-1400-guide-profile-onboarding/plan.md`
- Phase 01: `D:/Remote/web-travel/plans/20260708-1400-guide-profile-onboarding/phase-01-setup.md`
- Phase 02: `D:/Remote/web-travel/plans/20260708-1400-guide-profile-onboarding/phase-02-onboarding-component.md`
- `index.tsx`: `D:/Remote/web-travel/src/modules/GuideProfilePage/index.tsx`
- `action-bar.tsx`: `D:/Remote/web-travel/src/modules/GuideProfilePage/components/action-bar.tsx`

## Overview

- **Date:** 2026-07-08
- **Priority:** High
- **Status:** Pending
- Wire `ProfileOnboarding` into `GuideProfilePage`. Add `replayTrigger` state in `index.tsx`, pass it down to both `ActionBar` (for the "?" button to increment it) and `ProfileOnboarding` (to re-fire the tutorial). Guard the entire feature behind `isOwner`.

## Key Insights

- `index.tsx` already computes `isOwner` — no new logic needed, just guard.
- `isReady` derives directly from `!isLoading && !!data` which already exist in `index.tsx`.
- `replayTrigger` is a plain `useState<number>(0)`. Incrementing it re-runs the `useEffect` inside `ProfileOnboarding` because it's in the deps array.
- `ActionBar` receives `onReplayTutorial?: () => void` as a new optional prop — optional so the prop is only wired when `isOwner` is true.
- "?" button goes after the Share button (rightmost position in the ActionBar row) but is only rendered when `onReplayTutorial` is defined.
- `<ProfileOnboarding />` is placed **after** the loading guard (`if (isLoading) return <GuideProfileSkeleton />`) in the JSX tree, so it only mounts when DOM nodes are present. Place it as the first child inside the scrollable `<div>`, before `<HeroBanner>`.
- Do not modify any existing logic in `index.tsx` — only add imports and the new state + JSX nodes.
- `useProfileTutorial` hook is called unconditionally (rules of hooks), but `ProfileOnboarding` is rendered conditionally behind `isOwner`.

## Requirements

**Functional:**

- Tutorial auto-starts once per device when `isOwner === true` and `hasSeen === false`.
- "?" button visible only when `isOwner === true`.
- Pressing "?" resets LocalStorage via `resetTutorial()` and increments `replayTrigger` to trigger replay.
- Tutorial does not appear for non-owner visitors.

**Non-functional:**

- No changes to existing scroll, touch, or IntersectionObserver logic.
- `ActionBar` prop interface is backward-compatible (new prop is optional).

## Architecture

```
GuideProfilePage (index.tsx)
  ├── useProfileTutorial()           → { hasSeen, markAsSeen, resetTutorial }
  ├── useState(replayTrigger, 0)
  ├── handleReplay()                 → resetTutorial() + setReplayTrigger(n => n + 1)
  │
  ├── [isOwner] <ProfileOnboarding
  │     isReady={!isLoading && !!data}
  │     replayTrigger={replayTrigger}
  │     hasSeen={hasSeen}
  │     markAsSeen={markAsSeen}
  │   />
  │
  └── <ActionBar
        guide={data}
        isOwner={isOwner}
        onReplayTutorial={isOwner ? handleReplay : undefined}
      />

ActionBar (action-bar.tsx)
  ├── receives onReplayTutorial?: () => void
  └── renders "?" button when onReplayTutorial is defined
```

## Related Code Files

| Path                                                     | Action | Note                                                                                                 |
| -------------------------------------------------------- | ------ | ---------------------------------------------------------------------------------------------------- |
| `src/modules/GuideProfilePage/index.tsx`                 | MODIFY | Add imports, hook call, state, `handleReplay`, `<ProfileOnboarding />`, updated `<ActionBar />` prop |
| `src/modules/GuideProfilePage/components/action-bar.tsx` | MODIFY | Add `onReplayTutorial?: () => void` to interface + "?" button                                        |

## Implementation Steps

### Step 1 — Update `ActionBar` interface and add "?" button

In `action-bar.tsx`:

1. Add `onReplayTutorial?: () => void` to `ActionBarProps`:

```typescript
interface ActionBarProps {
  guide: Pick<ITourGuideProfile, 'id' | 'name'>;
  isOwner: boolean;
  onReplayTutorial?: () => void;
}
```

2. Destructure in the function signature:

```typescript
export default function ActionBar({ guide, isOwner, onReplayTutorial }: ActionBarProps) {
```

3. Add the "?" button as the **last** button in the flex row, after the Share button, conditional on `onReplayTutorial`:

```tsx
{
  onReplayTutorial && (
    <motion.button
      whileHover={{ scale: 1.1 }}
      transition={{ duration: 0.15 }}
      onClick={onReplayTutorial}
      aria-label="Replay tutorial"
      className="p-3 rounded-md border border-neutral-200 text-[13px] font-medium text-neutral-500"
    >
      ?
    </motion.button>
  );
}
```

Place it inside the `<div id="tour-action-bar" ...>` wrapper, after the Share `<motion.button>`.

### Step 2 — Update `GuideProfilePage` index.tsx

Full diff of changes (add only, no removals):

**Add imports** (after existing imports):

```typescript
import { useProfileTutorial } from '@/hooks/useProfileTutorial';
import ProfileOnboarding from './components/profile-onboarding';
```

**Add inside `GuideProfilePage` function** (after the `isOwner` line):

```typescript
const { hasSeen, markAsSeen, resetTutorial } = useProfileTutorial();
const [replayTrigger, setReplayTrigger] = useState(0);

const handleReplay = () => {
  resetTutorial();
  setReplayTrigger((n) => n + 1);
};
```

`useState` is already imported from React in the file (verify; if not, add it to the React import).

**Add `<ProfileOnboarding />` in JSX** — place it as the first child inside the scrollable `<div>`, before `<motion.div {...fadeUp(0)}>`:

```tsx
<div
  className="bg-[#F3F3F7] h-full overflow-y-auto scrollbar-hide font-dinpro"
  onTouchStart={handleTouchStart}
  onTouchEnd={handleTouchEnd}
>
  {isOwner && (
    <ProfileOnboarding
      isReady={!isLoading && !!data}
      replayTrigger={replayTrigger}
      hasSeen={hasSeen}
      markAsSeen={markAsSeen}
    />
  )}
  <motion.div {...fadeUp(0)}>
    <HeroBanner guide={data} />
  </motion.div>
  ...
```

**Update `<ActionBar />` call** — add the new prop:

```tsx
<ActionBar guide={data} isOwner={isOwner} onReplayTutorial={isOwner ? handleReplay : undefined} />
```

### Step 3 — Verify `useState` import

Check line 1 of `index.tsx`. Current imports:

```typescript
import { useRef } from 'react';
```

`useState` is not currently imported. Add it:

```typescript
import { useRef, useState } from 'react';
```

## Todo List

- [ ] Add `onReplayTutorial?: () => void` to `ActionBarProps` interface in `action-bar.tsx`
- [ ] Destructure `onReplayTutorial` in `ActionBar` function params
- [ ] Add "?" `<motion.button>` at end of ActionBar flex row, conditional on `onReplayTutorial`
- [ ] Add `id="tour-action-bar"` to the ActionBar inner div (from phase-02 step)
- [ ] Import `useState` in `index.tsx` (add to existing `react` import)
- [ ] Import `useProfileTutorial` in `index.tsx`
- [ ] Import `ProfileOnboarding` in `index.tsx`
- [ ] Add `useProfileTutorial()` call after `isOwner` line
- [ ] Add `replayTrigger` state and `handleReplay` function
- [ ] Render `{isOwner && <ProfileOnboarding ... />}` before first `<motion.div>` in JSX
- [ ] Update `<ActionBar />` call to pass `onReplayTutorial` prop
- [ ] Run `pnpm check-types` — zero errors
- [ ] Run `pnpm lint` — zero errors
- [ ] Manual smoke test: open guide profile as owner → tutorial auto-starts
- [ ] Manual smoke test: press "?" → tutorial replays
- [ ] Manual smoke test: open as non-owner → no tutorial, no "?" button

## Success Criteria

- `pnpm check-types` passes.
- `pnpm lint` passes.
- As owner: tutorial fires automatically on first visit (LocalStorage key absent).
- As owner: tutorial does NOT fire on second visit (LocalStorage key `'profile_tutorial_seen' === 'true'`).
- As owner: pressing "?" replays tutorial and re-sets LocalStorage key to absent during replay, then `'true'` after done.
- As non-owner: no tutorial overlay, no "?" button visible.
- Existing ActionBar buttons (Book Tour, Edit/Rate, QR, Share) are unaffected.
- Existing touch-swipe-back behavior in `index.tsx` is unaffected.

## Risk Assessment

| Risk                                                             | Likelihood        | Mitigation                                                                               |
| ---------------------------------------------------------------- | ----------------- | ---------------------------------------------------------------------------------------- |
| `useState` not imported in `index.tsx`                           | Confirmed missing | Add to React import in step 3                                                            |
| Tutorial fires before DOM nodes render                           | Low               | `isReady={!isLoading && !!data}` guards this; `ProfileOnboarding` is after loading guard |
| driver.js overlay z-index conflicts with framer-motion           | Low               | driver.js sets very high z-index (~99999); should clear all page elements                |
| "?" button overflows ActionBar on small screens                  | Low               | Button is small (`p-3`, single char); test at 375px width                                |
| `onDestroyed` fires on navigate away (component unmount)         | Medium            | `markAsSeen()` on unmount is acceptable; tutorial won't re-show                          |
| `replayTrigger` increment causes double-fire in React StrictMode | Low               | `useEffect` cleanup calls `driverObj.destroy()` before re-run; handled                   |

## Next Steps

- After all three phases complete, run `pnpm lint:fix` then `pnpm check-types` as final gate.
- Optionally run `lint-changed.bat` per project convention to auto-fix ESLint/Prettier on changed files only.
- No backend changes, no migration, no new routes required.
