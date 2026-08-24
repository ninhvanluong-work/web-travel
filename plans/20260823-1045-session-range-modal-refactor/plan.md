# Plan: CreateSessionRangeModal Refactor

**Date:** 2026-08-23  
**Branch:** dev  
**Goal:** Align modal + types with backend `POST /session/range` API contract.

---

## Context

Spec: `docs/specs/admin/session-bulk-range-conflict-spec.md`  
Related: `docs/spec-admin-session-crud-bmad.md`

Current code uses per-date conflict resolution table + capacity input + old weekday encoding (JS `getDay()` 0–6). Backend now expects a single `duplicateStrategy` field and `daysOfWeek` encoded as 1–7 (Mon=1, Sun=7). Capacity is always unlimited — field removed.

---

## Scope

Two files only:

| #   | File                                                                                          | Change type               |
| --- | --------------------------------------------------------------------------------------------- | ------------------------- |
| 1   | `src/api/session/types.ts`                                                                    | Type additions + removals |
| 2   | `src/modules/AdminProduct/ProductFormPage/components/sections/create-session-range-modal.tsx` | UI + logic refactor       |

No other files import `ConflictResolutionItem`, `ConflictResolutions`, or the old `weekdays` field — safe to remove.

---

## Phases

| Phase | File                           | Status  | Plan                                                       |
| ----- | ------------------------------ | ------- | ---------------------------------------------------------- |
| 01    | types.ts                       | Pending | [phase-01-types-update.md](./phase-01-types-update.md)     |
| 02    | create-session-range-modal.tsx | Pending | [phase-02-modal-refactor.md](./phase-02-modal-refactor.md) |

Execute Phase 01 first — Phase 02 depends on the updated types.

---

## Key Decisions

- `duplicateStrategy` defaults to `'skip'` (safe default per spec).
- `daysOfWeek` key omitted entirely from payload when all 7 days selected.
- Weekday encoding switches from JS `getDay()` (0=Sun…6=Sat) to spec encoding (1=Mon…7=Sun).
- `computeTargetDates` filter must translate spec day → JS day: `specDay === 7 ? 0 : specDay`.
- New Section 3 (Duplicate Strategy) replaces old dynamic conflict-table section.
- i18n keys for the two new cards (`sessionDuplicateSkip`, `sessionDuplicateOverwrite`, `sessionDuplicateStrategyTitle`) must be added to both `adminPage.json` locales.
- Remove: `capacity` state/UI, `conflictActions`, `useSessionList`, `conflictDates`, `getAction`, `setAllAction`, `sectionIndex`, `result` state, per-date table, `DAY_LABEL_VI`.

---

## i18n Keys Required (new)

Add to `public/locales/en/adminPage.json` and `public/locales/vi/adminPage.json`:

```
sessionDuplicateStrategyTitle  → "3. DUPLICATE STRATEGY"
sessionDuplicateSkipLabel      → "Skip Existing Sessions"
sessionDuplicateSkipDesc       → "Keep existing sessions unchanged. Only create sessions for new dates."
sessionDuplicateOverwriteLabel → "Overwrite Existing Sessions"
sessionDuplicateOverwriteDesc  → "Update status and prices for all conflicting dates in range."
```

Existing keys to remove from active usage (keep in locale files — other flows may reference): `sessionConflictTitle`, `sessionConflictDesc`, `sessionConflictDate`, `sessionConflictSkip`, `sessionConflictOverwrite`, `sessionConflictSkipAll`, `sessionConflictOverwriteAll`, `sessionConflictNote`, `sessionConflictCount`, `sessionCapacity`, `sessionCapacityPlaceholder`, `sessionRangeConflict`, `sessionSkipped`.
