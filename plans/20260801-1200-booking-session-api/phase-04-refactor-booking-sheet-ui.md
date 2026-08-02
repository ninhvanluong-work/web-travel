# Phase 04 — Refactor BookingSheet UI

**Parent:** [plan.md](./plan.md)  
**Depends on:** Phase 01, 02, 03  
**Status:** ⏳ pending

## Files

### A. `booking-sheet/index.tsx`

**Changes:**

1. Remove `useOptionDetail` import + call
2. Remove `options?: ApiOptionDetail[]` from props (and the `defaultOption`/`optionId` derivation logic)
3. Add `productId: string` prop
4. Add `useProductBookingDetail({ variables: { id: productId }, enabled: !!productId })`
5. Derive `departureTimes`, `pickupLocations`, `options` from `bookingDetail`
6. Pass `options` down to `StepOptions`
7. Pass `productId` down to `StepInfo` (replaces `optionId`)
8. Update `useBookingSheetState` call: add `productId` param (needed for Phase 05)

**Prop diff:**

```ts
// BEFORE
interface BookingSheetProps {
  productName: string;
  duration: string;
  adultPrice: number;
  currency: string;
  options?: ApiOptionDetail[];
  onClose: () => void;
}
// AFTER
interface BookingSheetProps {
  productId: string;
  productName: string;
  duration: string;
  adultPrice: number;
  currency: string;
  onClose: () => void;
}
```

---

### B. `step-info.tsx`

**Changes:**

1. Replace `useTourSessions` with `useSessions` from `@/api/session`
2. Change prop `optionId` → `productId`
3. Update query variables: `optionId` → `productId`
4. Unit matching: replace name-based `.find()` with index-based access
   ```ts
   // BEFORE
   const adultRef = unitRefs.find((u) => u.name.toLowerCase().includes('adult'));
   const childRef = unitRefs.find((u) => u.name.toLowerCase().includes('child'));
   // AFTER
   const adultUnit = sessionUnits[0] ?? null; // index 0 = adult (backend order)
   const childUnit = sessionUnits[1] ?? null; // index 1 = child
   ```
5. Replace `unitReferences`/`remainingSlot` with `sessionUnits`/`capacity` shape:
   - `adultRef.price` → `adultUnit.price`
   - `adultRef.note` → `adultUnit.unit?.note`
   - `remainingSlot` usage removed — capacity not enforced (decision #5)
   - `isAdultAvailable: !!adultUnit` (no slot check)
   - `isChildAvailable: !!childUnit`
   - `adultMaxSlots` / `childMaxSlots` → set to large number (e.g. 99) since unlimited
6. Save `adultUnitId`, `childUnitId`, `sessionId` into store:
   ```ts
   setSessionPricing({
     ...
     adultUnitId: adultUnit?.unitId ?? null,
     childUnitId: childUnit?.unitId ?? null,
     sessionId: session?.id ?? null,
   });
   ```
7. Remove guest cap logic (`if cur.adults > remainingSlot ...`)
8. GuestCounter `max` prop: change from `sessionPricing.adultMaxSlots` to `99`

---

### C. `step-options.tsx`

**Changes:**

1. Add `options: ApiProductBookingOption[]` to props interface
2. Remove `PACKAGES` hardcoded array and its i18n keys
3. Auto-select default option in `useEffect`:
   ```ts
   const defaultOpt = options.find((o) => o.isDefault) ?? options[0];
   if (defaultOpt && !packageType) setPackageType(defaultOpt.id);
   ```
4. Auto-select first active departure slot (existing logic already correct — keep as-is, but change condition from `activeSlots.length === 1` to `activeSlots.length > 0` per spec)
5. Replace package render with dynamic `options.map()`:
   - Show `opt.title`, `opt.day` days `opt.night` nights
   - Show `opt.description` if present
   - No surcharge/note row (options are cosmetic)
   - Remove `Check` icon + features list (no features data from API)
6. Import `ApiProductBookingOption` from `@/api/product/types`
7. Remove `ApiDepartureTime`, `ApiPickupLocation` imports from `@/api/option/types` — replace with `ApiProductBookingDepartureTime`, `ApiProductBookingPickupLocation` from `@/api/product/types`

**i18n note:** `opt.title`, `opt.day`, `opt.night` are data from backend — no hardcoded text. The "X days Y nights" label format needs a translation key.

---

## Success Criteria

- `pnpm check-types` passes
- Step 1: date picker → loads session prices by order (adult/child)
- Step 2: departure times load from product booking API; options show dynamically; default auto-selected
- No hardcoded 'basic'/'premium' references remain
