# Phase 03 — Update BookingStore

**Parent:** [plan.md](./plan.md)  
**File:** `src/stores/BookingStore.ts`  
**Status:** ⏳ pending

## Changes Required

### 1. `SessionPricing` interface — add 3 fields

```ts
// ADD after sessionError
adultUnitId: string | null;
childUnitId: string | null;
sessionId: string | null;
```

### 2. `BookingState.packageType` — widen type

```ts
// BEFORE
packageType: 'basic' | 'premium' | null;
// AFTER
packageType: string | null; // stores Option ID from API
```

### 3. `BookingActions.setPackageType` — widen param type

```ts
// BEFORE
setPackageType: (v: 'basic' | 'premium' | null) => void;
// AFTER
setPackageType: (v: string | null) => void;
```

### 4. `initialSessionPricing` — add 3 null defaults

```ts
adultUnitId: null,
childUnitId: null,
sessionId: null,
```

### 5. `CustomPickupLocation.surcharge` — keep as-is

The `surcharge` field stays in the type (used for display), but is no longer added to `runningTotal` (that change is in Phase 05).

## What NOT to change

- All other state fields, actions, and store structure remain identical
- `reset()` already spreads `initialState` so it picks up new fields automatically

## Success Criteria

- `pnpm check-types` passes
- No runtime errors in existing booking flow
