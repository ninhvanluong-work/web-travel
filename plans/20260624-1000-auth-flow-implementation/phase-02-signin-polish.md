# Phase 02 — SignInPage Polish

**Parent:** [plan.md](./plan.md)  
**Date:** 2026-06-24  
**Priority:** P0  
**Status:** pending

---

## Overview

SignInPage is mostly complete. Needs: hide OAuthSection, hide Forgot Password link, and error toast auto-close (2s).

---

## Key Insights

- `OAuthSection` rendered at line 71 of SignInPage — must be removed (per decision 4.3)
- Forgot Password link at lines 121-127 — must be hidden (per decision: not implemented)
- Error alerts currently: `addAlert({ type: 'error', title: message })` with no duration → defaults to 0 (no auto-close) → spec requires 1-2s auto-close → add `duration: 2000`
- `keepLoggedIn` checkbox (rememberMe) not in spec — decision: **keep as-is** (not removing, only hiding was asked for OAuth/forgot)
- Redirect logic (guide → `/guide/${tourGuideId}`, user → HOME) already correct ✓

---

## Related Code Files

- `src/modules/SignInPage/index.tsx` — 3 targeted changes

---

## Implementation Steps

### Step 1 — Remove OAuthSection

Delete line: `<OAuthSection namespace="signIn" />`  
And its import if no longer used anywhere in this file.

### Step 2 — Remove Forgot Password link

Delete the entire `<Link href={ROUTE.FORGOT_PASSWORD} ...>` block (lines 121-127).  
The "keep logged in" checkbox row can stay, or simplify the flex row to just the checkbox.

### Step 3 — Add duration: 2000 to error alerts

Both error alert calls (line 49):

```typescript
useAlertStore.getState().addAlert({ type: 'error', title: message, duration: 2000 });
```

---

## Todo

- [ ] Remove `<OAuthSection />` from SignInPage (+ clean up import)
- [ ] Remove Forgot Password link
- [ ] Add `duration: 2000` to both addAlert error calls

---

## Success Criteria

- No Google button or "Or" divider visible on sign-in
- No "Forgot password?" link visible
- Error toasts auto-dismiss after 2 seconds
- Redirect logic unchanged and working

---

## Risk Assessment

- Minimal — all changes are removal/addition only, no logic change
