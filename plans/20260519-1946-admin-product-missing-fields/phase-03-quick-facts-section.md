# Phase 03 — QuickFacts Section (elements)

**Date:** 2026-05-19  
**Priority:** High  
**Status:** Todo  
**Depends on:** Phase 01

---

## Context Links

- New file: `src/modules/AdminProduct/ProductFormPage/components/sections/quick-facts-section.tsx`
- Page index: `src/modules/AdminProduct/ProductFormPage/index.tsx`
- Schema: `src/lib/validations/product.ts` (`elements` field added in Phase 01)
- UI: `src/components/ui/input.tsx`, `src/components/ui/select.tsx`, `src/components/ui/checkbox.tsx`

---

## Overview

Create a new `QuickFactsSection` component mapping to the `elements` object in `ProductFormValues`. Register it as a new scroll-spy section "Thong tin nhanh" between `section-itinerary` and `section-details` in `ProductFormPage/index.tsx`.

---

## Key Insights

- `elements` is a flat object in form state (not an array) — all fields use `Controller` with path `elements.fieldName`
- `language` is a `string[]` inside `elements` — use a checkbox group with a fixed list of options
- `difficulty` is a Select with 3 values: `easy`, `medium`, `hard`
- All other `elements` sub-fields are plain text inputs
- `QuickFactsSection` uses `useFormContext<ProductFormValues>()` — same pattern as `BasicInfoSection` and `DetailsSection`
- No state lifting needed — entirely RHF-controlled via `elements.*` paths

---

## Requirements

- `departurePoint`: Input, label "Diem khoi hanh"
- `pickup`: Input, label "Don khach"
- `dropOff`: Input, label "Tra khach"
- `groupSize`: Input, label "Quy mo nhom"
- `language`: Multi-checkbox group — options: `{ label: 'Tieng Viet', value: 'VI' }`, `{ label: 'Tieng Anh', value: 'EN' }`, `{ label: 'Tieng Phap', value: 'FR' }`, `{ label: 'Tieng Nhat', value: 'JP' }` — stored as `string[]`
- `difficulty`: Select — options: `easy` / `medium` / `hard`, labels "De" / "Trung binh" / "Kho"
- Add nav entry `{ id: 'section-quickfacts', label: 'Thong tin nhanh', icon: MapPin }` to `NAV_SECTIONS` in `index.tsx`
- Render `<SectionCard id="section-quickfacts" ...>` between `section-itinerary` and the commented-out `section-pricing` block in `index.tsx`

---

## Architecture

### File: `src/modules/AdminProduct/ProductFormPage/components/sections/quick-facts-section.tsx`

```tsx
'use client'; // not needed — Pages Router, omit this

import { Controller, useFormContext } from 'react-hook-form';

import { Checkbox } from '@/components/ui/checkbox';
import { FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import type { ProductFormValues } from '@/lib/validations/product';

const LANGUAGE_OPTIONS = [
  { label: 'Tieng Viet', value: 'VI' },
  { label: 'Tieng Anh', value: 'EN' },
  { label: 'Tieng Phap', value: 'FR' },
  { label: 'Tieng Nhat', value: 'JP' },
];

const DIFFICULTY_OPTIONS = [
  { label: 'De', value: 'easy' },
  { label: 'Trung binh', value: 'medium' },
  { label: 'Kho', value: 'hard' },
];

export function QuickFactsSection() {
  const { control } = useFormContext<ProductFormValues>();

  return (
    <div className="space-y-6">
      {/* Row 1: departurePoint + pickup */}
      <div className="flex flex-row gap-5">
        <FormField control={control} name="elements.departurePoint" render={...} />
        <FormField control={control} name="elements.pickup" render={...} />
      </div>

      {/* Row 2: dropOff + groupSize */}
      <div className="flex flex-row gap-5">
        <FormField control={control} name="elements.dropOff" render={...} />
        <FormField control={control} name="elements.groupSize" render={...} />
      </div>

      {/* Row 3: difficulty */}
      <FormField control={control} name="elements.difficulty" render={...Select...} />

      {/* Row 4: language checkboxes */}
      <Controller
        control={control}
        name="elements.language"
        render={({ field }) => (
          <FormItem className="space-y-2">
            <FormLabel className="text-[13px] text-slate-500 font-medium">Ngon ngu</FormLabel>
            <div className="flex flex-wrap gap-4">
              {LANGUAGE_OPTIONS.map((opt) => (
                <label key={opt.value} className="flex items-center gap-2 cursor-pointer">
                  <Checkbox
                    checked={(field.value ?? []).includes(opt.value)}
                    onCheckedChange={(checked) => {
                      const current = field.value ?? [];
                      field.onChange(
                        checked
                          ? [...current, opt.value]
                          : current.filter((v) => v !== opt.value)
                      );
                    }}
                  />
                  <span className="text-[13px] text-slate-700">{opt.label}</span>
                </label>
              ))}
            </div>
          </FormItem>
        )}
      />
    </div>
  );
}
```

### Changes to `src/modules/AdminProduct/ProductFormPage/index.tsx`

**Change 1 — Import:**  
Add to imports (after line 17, after `TimeItinerarySection` import):

```ts
import { QuickFactsSection } from './components/sections/quick-facts-section';
```

Also add `MapPin` to the lucide-react import on line 1:

```ts
import { AlignLeft, ArrowLeft, Calendar, DollarSign, FileText, ImageIcon, Loader2, MapPin } from 'lucide-react';
```

**Change 2 — NAV_SECTIONS (line 29–35):**  
Insert new entry after `section-itinerary`:

```ts
{ id: 'section-quickfacts', label: 'Thong tin nhanh', icon: MapPin },
```

**Change 3 — SECTION_IDS:**  
`SECTION_IDS` is derived from `NAV_SECTIONS.map(...)` on line 37 — no manual change needed; it updates automatically.

**Change 4 — Render block (after line 193, after `<SectionCard id="section-itinerary" ...>`):**

```tsx
<SectionCard id="section-quickfacts" label="Thong tin nhanh">
  <QuickFactsSection />
</SectionCard>
```

---

## Related Code Files

- `src/modules/AdminProduct/ProductFormPage/index.tsx` (lines 1, 29–35, 37, 191–198)
- `src/modules/AdminProduct/ProductFormPage/components/sections/basic-info-section.tsx` — reference for FormField pattern
- `src/modules/AdminProduct/ProductFormPage/components/sections/details-section.tsx` — reference for `useFormContext` pattern
- `src/components/ui/checkbox.tsx`
- `src/components/ui/select.tsx`

---

## Implementation Steps

### Step 1 — Create `quick-facts-section.tsx`

Create `src/modules/AdminProduct/ProductFormPage/components/sections/quick-facts-section.tsx`.

Full component structure:

```tsx
import { Controller, useFormContext } from 'react-hook-form';

import { Checkbox } from '@/components/ui/checkbox';
import { FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import type { ProductFormValues } from '@/lib/validations/product';

const LANGUAGE_OPTIONS = [
  { label: 'Tieng Viet', value: 'VI' },
  { label: 'Tieng Anh', value: 'EN' },
  { label: 'Tieng Phap', value: 'FR' },
  { label: 'Tieng Nhat', value: 'JP' },
];

const DIFFICULTY_OPTIONS = [
  { label: 'De', value: 'easy' },
  { label: 'Trung binh', value: 'medium' },
  { label: 'Kho', value: 'hard' },
];

function TextInputField({
  control,
  name,
  label,
  placeholder,
}: {
  control: any;
  name: string;
  label: string;
  placeholder?: string;
}) {
  return (
    <FormField
      control={control}
      name={name}
      render={({ field }) => (
        <FormItem className="flex-1 min-w-0 space-y-1.5">
          <FormLabel className="text-[13px] text-slate-500 font-medium">{label}</FormLabel>
          <FormControl>
            <Input size="sm" placeholder={placeholder} value={field.value ?? ''} onChange={field.onChange} />
          </FormControl>
          <FormMessage />
        </FormItem>
      )}
    />
  );
}

export function QuickFactsSection() {
  const { control } = useFormContext<ProductFormValues>();

  return (
    <div className="space-y-6">
      <div className="flex flex-row gap-5">
        <TextInputField
          control={control}
          name="elements.departurePoint"
          label="Diem khoi hanh"
          placeholder="VD: San bay Noi Bai"
        />
        <TextInputField
          control={control}
          name="elements.pickup"
          label="Don khach"
          placeholder="VD: Khach san trung tam"
        />
      </div>

      <div className="flex flex-row gap-5">
        <TextInputField
          control={control}
          name="elements.dropOff"
          label="Tra khach"
          placeholder="VD: Khach san trung tam"
        />
        <TextInputField control={control} name="elements.groupSize" label="Quy mo nhom" placeholder="VD: 2–15 nguoi" />
      </div>

      <FormField
        control={control}
        name="elements.difficulty"
        render={({ field }) => (
          <FormItem className="space-y-1.5">
            <FormLabel className="text-[13px] text-slate-500 font-medium">Do kho</FormLabel>
            <Select onValueChange={field.onChange} value={field.value ?? undefined}>
              <FormControl>
                <SelectTrigger inputSize="sm" className="bg-slate-50/50 border-slate-200 shadow-none">
                  <SelectValue placeholder="Chon do kho" />
                </SelectTrigger>
              </FormControl>
              <SelectContent>
                {DIFFICULTY_OPTIONS.map((opt) => (
                  <SelectItem key={opt.value} value={opt.value}>
                    {opt.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <FormMessage />
          </FormItem>
        )}
      />

      <Controller
        control={control}
        name="elements.language"
        render={({ field }) => (
          <FormItem className="space-y-2">
            <FormLabel className="text-[13px] text-slate-500 font-medium">Ngon ngu</FormLabel>
            <div className="flex flex-wrap gap-x-6 gap-y-2">
              {LANGUAGE_OPTIONS.map((opt) => (
                <label key={opt.value} className="flex items-center gap-2 cursor-pointer select-none">
                  <Checkbox
                    checked={(field.value ?? []).includes(opt.value)}
                    onCheckedChange={(checked) => {
                      const current = field.value ?? [];
                      field.onChange(
                        checked ? [...current, opt.value] : current.filter((v: string) => v !== opt.value)
                      );
                    }}
                  />
                  <span className="text-[13px] text-slate-700">{opt.label}</span>
                </label>
              ))}
            </div>
          </FormItem>
        )}
      />
    </div>
  );
}
```

### Step 2 — Update imports in `index.tsx`

In `src/modules/AdminProduct/ProductFormPage/index.tsx`:

Line 1 — add `MapPin` to lucide-react import:

```ts
import { AlignLeft, ArrowLeft, Calendar, DollarSign, FileText, ImageIcon, Loader2, MapPin } from 'lucide-react';
```

After line 17 — add section import:

```ts
import { QuickFactsSection } from './components/sections/quick-facts-section';
```

### Step 3 — Update `NAV_SECTIONS` in `index.tsx`

In the `NAV_SECTIONS` array (lines 29–35), insert after the `section-itinerary` entry:

```ts
{ id: 'section-quickfacts', label: 'Thong tin nhanh', icon: MapPin },
```

Result:

```ts
const NAV_SECTIONS = [
  { id: 'section-overview', label: 'Tong quan', icon: FileText },
  { id: 'section-images', label: 'Hinh anh', icon: ImageIcon },
  { id: 'section-itinerary', label: 'Lich trinh', icon: Calendar },
  { id: 'section-quickfacts', label: 'Thong tin nhanh', icon: MapPin }, // NEW
  { id: 'section-details', label: 'Chi tiet', icon: AlignLeft },
];
```

### Step 4 — Render section in `index.tsx`

After line 193 (`</SectionCard>` closing the `section-itinerary` block), add:

```tsx
<SectionCard id="section-quickfacts" label="Thong tin nhanh">
  <QuickFactsSection />
</SectionCard>
```

---

## Todo Checklist

- [ ] Create `quick-facts-section.tsx` with full component
- [ ] Add `MapPin` to lucide-react import in `index.tsx`
- [ ] Add `QuickFactsSection` import in `index.tsx`
- [ ] Add `section-quickfacts` entry to `NAV_SECTIONS`
- [ ] Render `<SectionCard id="section-quickfacts">` after itinerary section
- [ ] Run `pnpm check-types` — zero errors
- [ ] Run `pnpm lint` — zero warnings

---

## Success Criteria

- "Thong tin nhanh" appears in scroll-spy nav and scroll-highlights correctly
- All 6 sub-fields render and update RHF state
- Language checkboxes correctly add/remove values from `elements.language` array
- Difficulty select works with clear/select
- Form submit includes `elements` in payload (via Phase 01 `toApiPayload`)

---

## Risk Assessment

| Risk                                                               | Impact | Mitigation                                                      |
| ------------------------------------------------------------------ | ------ | --------------------------------------------------------------- |
| RHF nested path `elements.language` type inference failure         | Low    | Use `Controller` with explicit `name` cast if needed            |
| `Checkbox` `onCheckedChange` receives `boolean \| 'indeterminate'` | Low    | Cast: `if (checked === true)`                                   |
| Scroll-spy `SECTION_IDS` not updating                              | None   | Derived from `NAV_SECTIONS` automatically                       |
| `elements` API key values differ from `departurePoint` etc.        | High   | Cross-check with backend before sending payload (Phase 01 risk) |
