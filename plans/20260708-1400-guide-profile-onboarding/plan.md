# Guide Profile Onboarding Tutorial

**Date:** 2026-07-08
**Status:** Pending
**Priority:** Medium

## Description

7-step Driver.js onboarding tutorial auto-triggered once for `isOwner` guides on `GuideProfilePage`. Highlights HeroBanner, ActionBar, StorytellingBlock, StatsBlock, MomentsGrid in sequence. State persisted to LocalStorage only. Replay via "?" button in ActionBar.

## Phases

| #   | Phase                                                       | Status  | File                                                                   |
| --- | ----------------------------------------------------------- | ------- | ---------------------------------------------------------------------- |
| 1   | Install driver.js + `useProfileTutorial` hook               | pending | [phase-01-setup.md](./phase-01-setup.md)                               |
| 2   | `ProfileOnboarding` component + add IDs to sub-components   | pending | [phase-02-onboarding-component.md](./phase-02-onboarding-component.md) |
| 3   | Integrate into `GuideProfilePage` + ActionBar replay button | pending | [phase-03-integration.md](./phase-03-integration.md)                   |

## Key Dependencies

- `driver.js` npm package (not yet installed)
- `isOwner` flag already computed in `index.tsx`
- All 5 target sub-components exist and render after loading guard
- No backend changes required

## Files Overview

**Create:**

- `src/hooks/useProfileTutorial.ts`
- `src/modules/GuideProfilePage/components/profile-onboarding.tsx`

**Modify (ID only):**

- `src/modules/GuideProfilePage/components/hero-banner.tsx`
- `src/modules/GuideProfilePage/components/storytelling-block.tsx`
- `src/modules/GuideProfilePage/components/stats-block.tsx`
- `src/modules/GuideProfilePage/components/moments-grid.tsx`

**Modify (ID + new button):**

- `src/modules/GuideProfilePage/components/action-bar.tsx`

**Modify (render + state):**

- `src/modules/GuideProfilePage/index.tsx`
