# Phase 02: Refactor create-session-range-modal.tsx

**Status:** Pending  
**Effort:** ~30 min  
**Depends on:** Phase 01 (updated types).

---

## Context Links

- Spec: `docs/specs/admin/session-bulk-range-conflict-spec.md` § 4
- File: `src/modules/AdminProduct/ProductFormPage/components/sections/create-session-range-modal.tsx`
- Types: `src/api/session/types.ts` (post Phase 01)
- i18n: `public/locales/en/adminPage.json`, `public/locales/vi/adminPage.json`

---

## Overview

Replace the dynamic conflict-resolution table with a static two-card `duplicateStrategy` selector. Remove capacity, `useSessionList`, per-date conflict logic. Fix weekday encoding from JS `getDay()` (0–6) to spec (1–7). Produce a clean 5-section modal matching the spec wireframe exactly.

---

## Key Insights

- `useSessionList` was fetching existing sessions to compute `conflictDates`. This entire round-trip is removed — strategy is now a simple radio choice.
- JS `getDay()` returns 0=Sun, 1=Mon…6=Sat. Spec uses 1=Mon…7=Sun. Conversion: `specDay === 7 ? 0 : specDay` when filtering dates.
- `WEEKDAY_ORDER` must be `[1, 2, 3, 4, 5, 6, 7]` (spec values), not `[1,2,3,4,5,6,0]`.
- `WEEKDAY_KEY` must map 7 → `'sessionWeekSun'` (replaces 0).
- `toggleAllWeek(true)` sets `selectedWeekdays` to `[1,2,3,4,5,6,7]`, not `[0..6]`.
- Payload: `daysOfWeek` key omitted (not `[]`) when `selectedWeekdays.length === 7`.
- Icons: import `Shield` and `RefreshCw` from `lucide-react`; drop `CheckCircle2`.
- `AlertCircle` stays (used in date validation errors).
- `DAY_LABEL_VI` removed — no longer needed (conflict table gone).
- `sectionIndex` helper removed — sections are now fixed 1–5.
- `result` state removed — success is handled by `useAlertStore` only.
- Remove import of `useSessionList` from `@/api/session`.

---

## Requirements

1. Remove state: `capacity`, `conflictActions`, `result`.
2. Remove derived values: `conflictDates`, `existingDateSet`, `newDateCount`, `allSkip`, `allOverwrite`.
3. Remove helpers: `getAction`, `setAllAction`, `sectionIndex`.
4. Remove hook: `useSessionList` (call + import).
5. Add state: `duplicateStrategy: DuplicateStrategyType` (default `'skip'`).
6. Fix weekday constants (see Implementation Steps).
7. Fix `computeTargetDates` to translate spec→JS day.
8. Fix `reset()` to use new weekday encoding and omit removed fields.
9. Fix `handleSubmit` payload to match new `CreateSessionRangePayload`.
10. Replace Section 3 (conflict table) with duplicate strategy card selector.
11. Remove capacity input from Section 4 (status only).
12. Renumber sections: 1 Date Range, 2 Weekday Filter, 3 Duplicate Strategy, 4 Session Status, 5 Unit Prices.
13. Add 5 new i18n keys (see plan.md).

---

## Architecture

Component remains a controlled dialog. State shape after refactor:

```
fromDate, toDate          — date range (unchanged)
selectedWeekdays          — number[] values 1–7 (was 0–6)
status                    — 'active' | 'inactive' (unchanged)
duplicateStrategy         — 'skip' | 'overwrite' (NEW, replaces conflictActions)
prices                    — Record<string, number> (unchanged)
error                     — string | null (unchanged)
```

No new hooks. One mutation (`useCreateSessionRange`) — unchanged.

---

## Related Code Files

- `src/api/session/index.ts` — barrel; verify `useSessionList` export still present for other consumers
- `public/locales/en/adminPage.json` — add 5 keys
- `public/locales/vi/adminPage.json` — add 5 keys (Vietnamese translations)

---

## Implementation Steps

### Step 1 — Fix imports

```typescript
// Remove from lucide-react: CheckCircle2
// Add to lucide-react: Shield, RefreshCw
import { AlertCircle, CalendarRange, RefreshCw, Shield } from 'lucide-react';

// Remove useSessionList from api/session import
import { useCreateSessionRange } from '@/api/session';

// Add DuplicateStrategyType to types import (if needed by explicit annotation)
import type { DuplicateStrategyType } from '@/api/session/types';
```

### Step 2 — Fix weekday constants

```typescript
// Display order Mon→Sun using spec encoding 1–7
const WEEKDAY_ORDER = [1, 2, 3, 4, 5, 6, 7] as const;
const WEEKDAY_KEY: Record<number, string> = {
  1: 'sessionWeekMon',
  2: 'sessionWeekTue',
  3: 'sessionWeekWed',
  4: 'sessionWeekThu',
  5: 'sessionWeekFri',
  6: 'sessionWeekSat',
  7: 'sessionWeekSun',
};
// Remove DAY_LABEL_VI entirely
```

### Step 3 — Fix computeTargetDates

```typescript
function computeTargetDates(from: Date, to: Date, weekdays: number[]): string[] {
  if (from > to || weekdays.length === 0) return [];
  const jsSet = new Set(weekdays.map((d) => (d === 7 ? 0 : d)));
  return eachDayOfInterval({ start: from, end: to })
    .filter((d) => jsSet.has(getDay(d)))
    .map((d) => format(d, 'yyyy-MM-dd'));
}
```

### Step 4 — Update state declarations

```typescript
// Remove: capacity, conflictActions, result
// Add:
const [duplicateStrategy, setDuplicateStrategy] = useState<DuplicateStrategyType>('skip');

// Change selectedWeekdays initial value:
const [selectedWeekdays, setSelectedWeekdays] = useState<number[]>([1, 2, 3, 4, 5, 6, 7]);
```

### Step 5 — Remove derived values and helpers

Delete these lines entirely:

- `useSessionList` hook call + its variables (`fromDateStr`, `toDateStr` still needed for payload)
- `existingDateSet`, `conflictDates`, `newDateCount`
- `getAction`, `allSkip`, `allOverwrite`, `setAllAction`
- `sectionIndex` function

### Step 6 — Fix weekday toggle helpers

```typescript
function toggleAllWeek(checked: boolean) {
  setSelectedWeekdays(checked ? [1, 2, 3, 4, 5, 6, 7] : []);
}
// toggleWeekday(day) — unchanged logic, just operates on new encoding
```

### Step 7 — Fix reset()

```typescript
function reset() {
  setFromDate(undefined);
  setToDate(undefined);
  setSelectedWeekdays([1, 2, 3, 4, 5, 6, 7]);
  setStatus('active');
  setDuplicateStrategy('skip');
  setPrices({});
  setError(null);
}
```

### Step 8 — Fix handleSubmit

```typescript
function handleSubmit() {
  if (!isValidRange || targetDates.length === 0) return;
  setError(null);

  const isAllWeek = selectedWeekdays.length === 7;
  const sessionUnits = units.map((u) => ({ unitId: u.id, price: prices[u.id] ?? 0 }));

  mutate(
    {
      productId,
      fromDate: format(fromDate!, 'yyyy-MM-dd'),
      toDate: format(toDate!, 'yyyy-MM-dd'),
      status,
      duplicateStrategy,
      ...(isAllWeek ? {} : { daysOfWeek: selectedWeekdays.sort((a, b) => a - b) }),
      sessionUnits: sessionUnits.length > 0 ? sessionUnits : undefined,
    },
    {
      onSuccess: (sessions) => {
        queryClient.invalidateQueries({ queryKey: ['/session'] });
        useAlertStore.getState().addAlert({
          type: 'success',
          title: t('sessionCreateRangeSuccess', { count: sessions.length }),
        });
        handleClose();
      },
      onError: (err: any) => {
        const msg = err?.response?.data?.message;
        const text = Array.isArray(msg) ? msg.join(', ') : msg ?? t('genericError');
        setError(text);
      },
    }
  );
}
```

Note: `handleClose()` called on success (closes modal). No `result` state needed.

### Step 9 — Update JSX sections

**Section 1 (Date Range)** — unchanged except remove `isCheckingConflicts` badge.

**Section 2 (Weekday Filter)** — unchanged logic; update `allWeekChecked` initial + `toggleAllWeek` already fixed in Step 6. Remove the conflict count badge from summary badges block.

**Section 3 — Replace conflict table with duplicate strategy cards:**

```tsx
{
  /* ── 3. Duplicate Strategy ──────────────────────────────── */
}
<section className="space-y-2">
  <p className="text-[11px] font-bold uppercase tracking-wider text-slate-400">
    3. {t('sessionDuplicateStrategyTitle')}
  </p>
  <div className="grid grid-cols-2 gap-3">
    {/* Skip card */}
    <button
      type="button"
      onClick={() => setDuplicateStrategy('skip')}
      className={`flex flex-col gap-1.5 rounded-xl border p-3 text-left transition-colors ${
        duplicateStrategy === 'skip'
          ? 'border-brand-400 bg-brand-50 ring-1 ring-brand-300'
          : 'border-slate-200 bg-white hover:border-slate-300'
      }`}
    >
      <span className="flex items-center gap-1.5 text-xs font-semibold text-slate-700">
        <Shield size={14} className="text-slate-500 shrink-0" />
        {t('sessionDuplicateSkipLabel')}
      </span>
      <span className="text-[10px] text-slate-500 leading-snug">{t('sessionDuplicateSkipDesc')}</span>
    </button>
    {/* Overwrite card */}
    <button
      type="button"
      onClick={() => setDuplicateStrategy('overwrite')}
      className={`flex flex-col gap-1.5 rounded-xl border p-3 text-left transition-colors ${
        duplicateStrategy === 'overwrite'
          ? 'border-amber-400 bg-amber-50 ring-1 ring-amber-300'
          : 'border-slate-200 bg-white hover:border-slate-300'
      }`}
    >
      <span className="flex items-center gap-1.5 text-xs font-semibold text-slate-700">
        <RefreshCw size={14} className="text-amber-500 shrink-0" />
        {t('sessionDuplicateOverwriteLabel')}
      </span>
      <span className="text-[10px] text-slate-500 leading-snug">{t('sessionDuplicateOverwriteDesc')}</span>
    </button>
  </div>
</section>;
```

**Section 4 (Session Status)** — remove capacity input grid; keep only status `<Select>`.

```tsx
{
  /* ── 4. Session Status ──────────────────────────────────── */
}
<section className="space-y-2">
  <p className="text-[11px] font-bold uppercase tracking-wider text-slate-400">4. {t('sessionColStatus')}</p>
  <Select value={status} onValueChange={(v) => setStatus(v as 'active' | 'inactive')}>
    <SelectTrigger className="w-full rounded-xl text-xs">
      <SelectValue />
    </SelectTrigger>
    <SelectContent>
      <SelectItem value="active">{t('sessionActive')}</SelectItem>
      <SelectItem value="inactive">{t('sessionInactive')}</SelectItem>
    </SelectContent>
  </Select>
</section>;
```

**Section 5 (Unit Prices)** — update heading number from dynamic to fixed `5.`:

```tsx
<p className="text-[11px] font-bold uppercase tracking-wider text-slate-400">5. {t('sessionUnitPrices')}</p>
```

Remove the `result` AlertBanner at the top of the scroll area.

### Step 10 — Add i18n keys

**`public/locales/en/adminPage.json`** — add inside the session block:

```json
"sessionDuplicateStrategyTitle": "DUPLICATE STRATEGY",
"sessionDuplicateSkipLabel": "Skip Existing Sessions",
"sessionDuplicateSkipDesc": "Keep existing sessions unchanged. Only create sessions for new dates.",
"sessionDuplicateOverwriteLabel": "Overwrite Existing Sessions",
"sessionDuplicateOverwriteDesc": "Update status and prices for all conflicting dates in range."
```

**`public/locales/vi/adminPage.json`** — add equivalent Vietnamese translations.

---

## Todo List

- [ ] Fix imports (add Shield, RefreshCw; remove CheckCircle2, useSessionList)
- [ ] Fix `WEEKDAY_ORDER` and `WEEKDAY_KEY` constants
- [ ] Remove `DAY_LABEL_VI`
- [ ] Fix `computeTargetDates` (spec→JS day conversion)
- [ ] Add `duplicateStrategy` state, change `selectedWeekdays` initial value
- [ ] Remove `capacity`, `conflictActions`, `result` state
- [ ] Remove `useSessionList` hook call and all derived conflict variables
- [ ] Remove `getAction`, `setAllAction`, `sectionIndex` helpers
- [ ] Fix `toggleAllWeek` initial value
- [ ] Fix `reset()`
- [ ] Fix `handleSubmit` payload + call `handleClose()` on success
- [ ] Replace Section 3 conflict table with duplicate strategy cards
- [ ] Remove capacity input from old Section 4, renumber to Section 4 (status only)
- [ ] Add Section 5 heading for unit prices
- [ ] Remove `result` AlertBanner from scroll area top
- [ ] Add 5 i18n keys to EN locale
- [ ] Add 5 i18n keys to VI locale
- [ ] Run `pnpm check-types`
- [ ] Run `pnpm lint`

---

## Success Criteria

- Modal renders 5 sections: Date Range → Weekday Filter → Duplicate Strategy → Session Status → Unit Prices.
- No capacity input anywhere.
- No conflict table anywhere.
- Selecting all 7 weekdays and submitting sends payload **without** `daysOfWeek` key.
- Selecting specific weekdays sends `daysOfWeek: [1,3,5]` (sorted, 1-based).
- `duplicateStrategy` always present in payload.
- `pnpm check-types` zero errors.
- `pnpm lint` zero errors.

---

## Risk Assessment

- **Medium.** Weekday encoding change is a silent logic change — if conversion formula `specDay === 7 ? 0 : specDay` is wrong, wrong dates are created. Verify manually: picking "Sun (7)" should create sessions on Sundays.
- `fromDateStr` / `toDateStr` were computed for `useSessionList`. After removing that hook, they are no longer needed as intermediate `const` — `format(fromDate!, 'yyyy-MM-dd')` can be inlined in `handleSubmit`. Ensure no other JSX references them before deleting.
- `isCheckingConflicts` was used in summary badges. Remove that conditional span.

---

## Security Considerations

- Payload never includes `capacity` — backend treats absence as unlimited. No injection risk.
- `duplicateStrategy` is a literal union type; no user-string is sent raw.

---

## Next Steps

After both phases complete:

1. Manual test: create range All Week → verify no `daysOfWeek` in network request.
2. Manual test: create range Mon+Wed+Fri → verify `daysOfWeek: [1, 3, 5]`.
3. Manual test: overwrite strategy card selection → verify `duplicateStrategy: "overwrite"` in payload.
4. Run `pnpm check-types && pnpm lint`.
