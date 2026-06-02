# Phase 06 — Options: originalPrice Field

**Date:** 2026-05-19  
**Priority:** Low  
**Status:** Todo  
**Depends on:** Phase 01 (optionSchema already extended there)

---

## Context Links

- Schema: `src/lib/validations/product.ts` — `optionSchema` (Phase 01 adds `originalPrice`)
- Row component: `src/modules/AdminProduct/ProductFormPage/components/shared/OptionFormRow.tsx`
- Section: `src/modules/AdminProduct/ProductFormPage/components/sections/options-section.tsx`
- Note: `OptionsSection` is currently commented out in `index.tsx` (line 194–198)

---

## Overview

`OptionsSection` is hidden (`TẠM ẨN`). This phase only adds `originalPrice` to `optionSchema` (done in Phase 01) and to `OptionFormRow` UI. No changes to `index.tsx` — the section stays hidden until the team decides to re-enable it.

---

## Key Insights

- `OptionFormRow` is a pure controlled component: `{ value, index, onChange, onRemove }` — no RHF inside
- `originalPrice` renders as a Number Input alongside the existing price fields (`adultPrice`, `childPrice`, `infantPrice`)
- `OptionFormValues` type is derived from `optionSchema` via `z.infer` — adding `originalPrice` to the schema (Phase 01) automatically extends the type
- The `DEFAULT_OPTION` object (if it exists in `options-section.tsx`) needs `originalPrice: null` added

---

## Requirements

- Add `originalPrice` Input to `OptionFormRow` in the prices grid
- Add `originalPrice: null` to any default option object literals
- No changes to `index.tsx`, `use-product-form.ts`, or `toApiPayload()` (field is Group 2 — backend not confirmed)

---

## Related Code Files

- `src/modules/AdminProduct/ProductFormPage/components/shared/OptionFormRow.tsx` (lines 73–104, prices grid)
- `src/modules/AdminProduct/ProductFormPage/components/sections/options-section.tsx` — check for default option literal

---

## Implementation Steps

### Step 1 — Check `options-section.tsx` for default option literal

Open `src/modules/AdminProduct/ProductFormPage/components/sections/options-section.tsx`. Search for any object literal that initializes a new `OptionFormValues` (e.g., `{ id: undefined, title: '', adultPrice: 0, ... }`). Add `originalPrice: null` to it.

### Step 2 — Update `OptionFormRow.tsx`

In `src/modules/AdminProduct/ProductFormPage/components/shared/OptionFormRow.tsx`, the prices grid is at lines 73–104 (`<div className="grid grid-cols-3 gap-3">`).

Change `grid-cols-3` to `grid-cols-2 md:grid-cols-4` to accommodate the fourth price field, then add `originalPrice` as the first item (original/crossed-out price shown before sale prices):

```tsx
<div className="grid grid-cols-2 md:grid-cols-4 gap-3">
  <div className="space-y-1">
    <label className="text-xs font-medium text-gray-600">Gia goc</label>
    <Input
      type="number"
      size="sm"
      min={0}
      placeholder="0"
      value={value.originalPrice ?? ''}
      onChange={(e) => set({ originalPrice: e.target.value === '' ? null : Number(e.target.value) })}
    />
  </div>
  <div className="space-y-1">
    <label className="text-xs font-medium text-gray-600">Gia nguoi lon</label>
    <Input
      type="number"
      size="sm"
      min={0}
      value={value.adultPrice}
      onChange={(e) => set({ adultPrice: Number(e.target.value) })}
    />
  </div>
  <div className="space-y-1">
    <label className="text-xs font-medium text-gray-600">Gia tre em</label>
    <Input
      type="number"
      size="sm"
      min={0}
      value={value.childPrice}
      onChange={(e) => set({ childPrice: Number(e.target.value) })}
    />
  </div>
  <div className="space-y-1">
    <label className="text-xs font-medium text-gray-600">Gia em be</label>
    <Input
      type="number"
      size="sm"
      min={0}
      value={value.infantPrice}
      onChange={(e) => set({ infantPrice: Number(e.target.value) })}
    />
  </div>
</div>
```

---

## Todo Checklist

- [ ] Verify Phase 01 added `originalPrice` to `optionSchema` — `OptionFormValues` type includes it
- [ ] Check `options-section.tsx` for default option literal — add `originalPrice: null`
- [ ] Update price grid in `OptionFormRow.tsx` from 3-col to 4-col
- [ ] Add `originalPrice` Input as first column in the grid
- [ ] Run `pnpm check-types` — zero errors
- [ ] Run `pnpm lint` — zero warnings

---

## Success Criteria

- `OptionFormValues` TypeScript type includes `originalPrice?: number | null`
- `OptionFormRow` renders 4 price columns when `OptionsSection` is re-enabled
- Entering a value in "Gia goc" correctly updates `originalPrice` in parent state
- Clearing the field sets `originalPrice` to `null` (not `0`)

---

## Risk Assessment

| Risk                                                      | Impact | Mitigation                                                                            |
| --------------------------------------------------------- | ------ | ------------------------------------------------------------------------------------- |
| `grid-cols-3` to `grid-cols-4` breaks narrow screens      | Low    | Use `grid-cols-2 md:grid-cols-4` responsive classes                                   |
| `originalPrice` not in backend — sends in payload         | Low    | Phase 01 excludes it from `toApiPayload()`; field stays frontend-only until confirmed |
| Default option literal not found in `options-section.tsx` | Low    | Grep for `adultPrice` in the file to locate all default objects                       |
