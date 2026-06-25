# Auth Flow Implementation Plan

**Date:** 2026-06-24  
**Status:** Ready to implement

## Context

Auth pages (sign-in, sign-up) already exist with base logic. This plan details **what to change** from the current state to meet auth-spec.md decisions.

## Implementation Phases

| #   | Phase                                                                | Status  | Priority |
| --- | -------------------------------------------------------------------- | ------- | -------- |
| 1   | [SignUpPage Overhaul](./phase-01-signup-overhaul.md)                 | ✅ done | P0       |
| 2   | [SignInPage Polish](./phase-02-signin-polish.md)                     | ✅ done | P0       |
| 3   | [Staggered Animation + Micro-interactions](./phase-03-animations.md) | ✅ done | P1       |
| 4   | [Tour Guide FAB](./phase-04-tourguide-fab.md)                        | ✅ done | P1       |

## Research References

- [API Layer + UserStore](./research/researcher-01-api-store.md)
- [UI + i18n + Module Pattern](./research/researcher-02-ui-i18n.md)

## Key Constraints

- Do NOT touch: UserStore, axios, api/auth/queries.ts, api/auth/requests.ts (login mock)
- Do NOT modify existing logic without listing changes first (CLAUDE.md rule)
- All user-facing text via i18next (en + vi)
- Alert system: useAlertStore → addAlert with duration:2000 for errors
