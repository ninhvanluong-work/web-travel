# Phase 01 — Install driver.js + `useProfileTutorial` Hook

## Context Links

- Spec: `D:/Remote/web-travel/docs/spec-guide-profile-onboarding.md`
- Plan overview: `D:/Remote/web-travel/plans/20260708-1400-guide-profile-onboarding/plan.md`
- Existing hooks pattern: `D:/Remote/web-travel/src/hooks/use-guide-profile.ts`
- Stores pattern: `D:/Remote/web-travel/src/stores/UserStore.ts`

## Overview

- **Date:** 2026-07-08
- **Priority:** High (blocks phases 2 and 3)
- **Status:** Pending
- Install driver.js as the only new dependency. Create a thin hook that reads/writes a single LocalStorage key and exposes three functions consumed by the onboarding component.

## Key Insights

- driver.js is ~5 KB gzipped, zero React dependencies — use via `useEffect` + vanilla JS API directly.
- LocalStorage is sufficient; no backend call required per decision in context research.
- Hook must be SSR-safe: all `localStorage` access must be guarded by `typeof window !== 'undefined'`.
- Pattern in this codebase: hooks live in `src/hooks/`, named `use-kebab-case.ts`.
- No Zustand store needed — hook encapsulates all tutorial state locally using React state + LocalStorage.

## Requirements

**Functional:**

- Read `'profile_tutorial_seen'` from LocalStorage on mount.
- Expose `hasSeen: boolean` (false = tutorial should auto-run).
- `markAsSeen()` — sets key to `'true'` in LocalStorage and flips `hasSeen`.
- `resetTutorial()` — removes key from LocalStorage and flips `hasSeen` back to `false`.

**Non-functional:**

- SSR-safe (Next.js Pages Router renders on server).
- No side effects at import time.
- Pure hook, no JSX.

## Architecture

```
useProfileTutorial
  ├── useState(hasSeen)       ← initialized from localStorage
  ├── markAsSeen()            ← localStorage.setItem + setState
  └── resetTutorial()         ← localStorage.removeItem + setState
```

Hook is stateless beyond local React state. No Zustand, no React Query.

## Related Code Files

| Path                              | Action | Note     |
| --------------------------------- | ------ | -------- |
| `src/hooks/useProfileTutorial.ts` | CREATE | New hook |

## Implementation Steps

### Step 1 — Install driver.js

```bash
pnpm add driver.js
```

Verify it appears in `package.json` under `dependencies`.

### Step 2 — Create `src/hooks/useProfileTutorial.ts`

```typescript
import { useState } from 'react';

const STORAGE_KEY = 'profile_tutorial_seen';

function readStorage(): boolean {
  if (typeof window === 'undefined') return true; // SSR: assume seen to avoid flash
  return localStorage.getItem(STORAGE_KEY) === 'true';
}

export interface UseProfileTutorialReturn {
  hasSeen: boolean;
  markAsSeen: () => void;
  resetTutorial: () => void;
}

export function useProfileTutorial(): UseProfileTutorialReturn {
  const [hasSeen, setHasSeen] = useState<boolean>(readStorage);

  const markAsSeen = () => {
    localStorage.setItem(STORAGE_KEY, 'true');
    setHasSeen(true);
  };

  const resetTutorial = () => {
    localStorage.removeItem(STORAGE_KEY);
    setHasSeen(false);
  };

  return { hasSeen, markAsSeen, resetTutorial };
}
```

Key decisions:

- `useState<boolean>(readStorage)` — lazy initializer; runs once on mount, skips on SSR.
- SSR guard returns `true` on server so the component never auto-starts on a server render.
- No `useEffect` needed — reading localStorage synchronously in the initializer is correct and avoids a flash.

## Todo List

- [ ] Run `pnpm add driver.js`
- [ ] Confirm `driver.js` entry in `package.json`
- [ ] Create `src/hooks/useProfileTutorial.ts` with exact content above
- [ ] Run `pnpm check-types` — no errors expected
- [ ] Run `pnpm lint` — fix any ESLint issues

## Success Criteria

- `pnpm check-types` passes with zero errors.
- `pnpm lint` passes.
- Hook file exists at `src/hooks/useProfileTutorial.ts`.
- `driver.js` present in `node_modules` and `package.json`.
- Calling `resetTutorial()` then reading `localStorage.getItem('profile_tutorial_seen')` returns `null`.
- Calling `markAsSeen()` then reading `localStorage.getItem('profile_tutorial_seen')` returns `'true'`.

## Risk Assessment

| Risk                                                  | Likelihood | Mitigation                                                                                              |
| ----------------------------------------------------- | ---------- | ------------------------------------------------------------------------------------------------------- |
| `driver.js` types missing                             | Low        | Package ships its own `.d.ts`; if missing, add `@types/driver.js`                                       |
| SSR hydration mismatch                                | Medium     | Guard with `typeof window !== 'undefined'`; SSR defaults to `true` so tutorial never starts server-side |
| LocalStorage unavailable (private mode some browsers) | Low        | Wrap in try/catch if needed; non-critical feature                                                       |

## Next Steps

- Phase 02 depends on this hook being available.
- Phase 02 imports `useProfileTutorial` and `driver.js`.
