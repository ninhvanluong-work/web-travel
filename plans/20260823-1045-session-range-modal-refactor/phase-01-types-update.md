# Phase 01: Update session/types.ts

**Status:** Pending  
**Effort:** ~5 min  
**Depends on:** Nothing — execute first.

---

## Context Links

- Spec: `docs/specs/admin/session-bulk-range-conflict-spec.md` § 3.2
- File: `src/api/session/types.ts`
- Phase 02 depends on this file.

---

## Overview

Replace the old conflict-resolution types and `CreateSessionRangePayload` shape with the API-correct model. Add `DuplicateStrategyType`. Remove `ConflictResolutionItem` and `ConflictResolutions`.

---

## Key Insights

- `ConflictResolutionItem` and `ConflictResolutions` are only referenced in `create-session-range-modal.tsx`. No other consumers.
- `CreateSessionRangePayload.weekdays` used JS `getDay()` encoding (0–6). New field `daysOfWeek` uses spec encoding (1–7).
- `capacity` is always unlimited at the API level now — remove from payload.
- `conflictResolutions` is replaced by the single `duplicateStrategy` scalar.

---

## Requirements

1. Export `DuplicateStrategyType = 'skip' | 'overwrite'`.
2. `CreateSessionRangePayload` must match Swagger exactly:
   - Keep: `productId`, `fromDate`, `toDate`, `status?`, `sessionUnits?`
   - Add: `duplicateStrategy: DuplicateStrategyType`
   - Add: `daysOfWeek?: number[]` (values 1–7)
   - Remove: `weekdays?`, `capacity?`, `conflictResolutions?`
3. Delete `ConflictResolutionItem` and `ConflictResolutions` interfaces.

---

## Architecture

No structural change — pure type editing within the `Mutation payloads` section. All other interfaces (`ApiSessionItem`, `ISession`, etc.) remain untouched.

---

## Related Code Files

- `src/api/session/types.ts` — target file (lines 132–151 in current state)
- `src/api/session/requests.ts` — verify no direct reference to removed types
- `src/api/session/queries.ts` — verify no direct reference to removed types

---

## Implementation Steps

1. Open `src/api/session/types.ts`.

2. After `SessionUnitPayload` (line ~122), add:

   ```typescript
   export type DuplicateStrategyType = 'skip' | 'overwrite';
   ```

3. Delete the two interfaces (lines ~132–141):

   ```typescript
   // DELETE THESE:
   export interface ConflictResolutionItem { ... }
   export interface ConflictResolutions { ... }
   ```

4. Replace `CreateSessionRangePayload` (lines ~142–151) with:

   ```typescript
   export interface CreateSessionRangePayload {
     productId: string;
     fromDate: string; // YYYY-MM-DD
     toDate: string; // YYYY-MM-DD
     status?: 'active' | 'inactive';
     sessionUnits?: SessionUnitPayload[];
     duplicateStrategy: DuplicateStrategyType;
     daysOfWeek?: number[]; // [1..7], omit key when All Week
   }
   ```

5. Verify `requests.ts` and `queries.ts` compile — they only reference `CreateSessionRangePayload` as a parameter type, so renaming fields is safe as long as Phase 02 is applied next.

---

## Todo List

- [ ] Add `DuplicateStrategyType` export
- [ ] Remove `ConflictResolutionItem` interface
- [ ] Remove `ConflictResolutions` interface
- [ ] Update `CreateSessionRangePayload` (remove `weekdays`, `capacity`, `conflictResolutions`; add `duplicateStrategy`, `daysOfWeek`)
- [ ] Run `pnpm check-types` to confirm zero errors before Phase 02

---

## Success Criteria

- `pnpm check-types` passes after this file is saved (Phase 02 not yet done — expect errors in the modal file; that is acceptable at this intermediate step).
- `ConflictResolutionItem`, `ConflictResolutions` no longer exported.
- `CreateSessionRangePayload` has exactly: `productId`, `fromDate`, `toDate`, `status?`, `sessionUnits?`, `duplicateStrategy`, `daysOfWeek?`.

---

## Risk Assessment

- **Low.** Types are only consumed in one UI file. No API request code changes needed — `requests.ts` passes the payload through as-is.
- Intermediate TypeScript errors in the modal file are expected until Phase 02 is applied.

---

## Security Considerations

None — pure type definitions, no runtime code.

---

## Next Steps

Proceed to `phase-02-modal-refactor.md`.
