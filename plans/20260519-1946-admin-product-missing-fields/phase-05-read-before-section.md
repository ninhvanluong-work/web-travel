# Phase 05 — ReadBefore Section

**Date:** 2026-05-19  
**Priority:** Medium  
**Status:** Todo  
**Depends on:** Phase 01

---

## Context Links

- New file: `src/modules/AdminProduct/ProductFormPage/components/sections/read-before-section.tsx`
- Page index: `src/modules/AdminProduct/ProductFormPage/index.tsx`
- Pattern reference: `src/modules/AdminProduct/ProductFormPage/components/shared/OptionFormRow.tsx`
- State lifted to: `src/hooks/use-product-form.ts`
- Schema type: `ReadBeforeFormValues` from `src/lib/validations/product.ts` (added in Phase 01)

---

## Overview

Create `ReadBeforeSection` following the exact same `useState` array + props pattern as `OptionsSection` / `TimeItinerarySection`. State lifted to `useProductForm`. Add "Luu y" to scroll-spy nav.

---

## Key Insights

- Identical architecture to `ExperiencesSection` (Phase 04) — no image upload, simpler
- `key` field is a Select from a fixed enum, not free text
- No RHF `useFormContext` inside the section — pure controlled component via props
- `ReadBeforeFormValues = { key: string; title: string; description?: string | null }`

---

## Requirements

- State: `readBefores: ReadBeforeFormValues[]` + `setReadBefores` lifted to `useProductForm`
- Each row: `key` Select (fixed options), `title` Input, `description` Textarea
- Add/remove item buttons
- Nav entry: `{ id: 'section-readbefore', label: 'Luu y', icon: BookOpen }` after `section-experiences`

### `key` Select options

| Value             | Label            |
| ----------------- | ---------------- |
| `passport`        | Giay to tuy than |
| `bring`           | Mang theo        |
| `not_recommended` | Khong nen        |
| `wear`            | Trang phuc       |
| `cultural`        | Van hoa          |
| `health`          | Suc khoe         |

---

## Architecture

### State lifting in `src/hooks/use-product-form.ts`

Add alongside `experiences` state (from Phase 04):

```ts
const [readBefores, setReadBefores] = useState<ReadBeforeFormValues[]>([]);
```

Populate inside `useEffect` after `form.reset`:

```ts
setReadBefores(
  (productData.readBefore ?? []).map((r) => ({
    key: r.key,
    title: r.title,
    description: r.description ?? null,
  }))
);
```

Return `readBefores` and `setReadBefores` from `useProductForm`.

### `ReadBeforeSection` props

```ts
interface ReadBeforeSectionProps {
  readBefores: ReadBeforeFormValues[];
  onChange: (items: ReadBeforeFormValues[]) => void;
}
```

### `ReadBeforeRow` sub-component (file-local)

```ts
interface ReadBeforeRowProps {
  value: ReadBeforeFormValues;
  index: number;
  onChange: (index: number, patch: Partial<ReadBeforeFormValues>) => void;
  onRemove: (index: number) => void;
}
```

---

## Related Code Files

- `src/hooks/use-product-form.ts` (lines 41–42, 107)
- `src/modules/AdminProduct/ProductFormPage/index.tsx` (NAV_SECTIONS, render, destructure)
- `src/modules/AdminProduct/ProductFormPage/components/shared/OptionFormRow.tsx` — row pattern reference
- `src/components/ui/select.tsx`
- `src/components/ui/textarea.tsx`

---

## Implementation Steps

### Step 1 — Extend `use-product-form.ts`

a) Merge `ReadBeforeFormValues` into existing import from `@/lib/validations/product` (line 9).

b) After the `experiences` state line (added in Phase 04), add:

```ts
const [readBefores, setReadBefores] = useState<ReadBeforeFormValues[]>([]);
```

c) Inside `useEffect`, after the `setExperiences(...)` call (Phase 04), add:

```ts
setReadBefores(
  (productData.readBefore ?? []).map((r) => ({
    key: r.key,
    title: r.title,
    description: r.description ?? null,
  }))
);
```

d) Add `readBefores, setReadBefores` to the return object.

### Step 2 — Create `read-before-section.tsx`

Create `src/modules/AdminProduct/ProductFormPage/components/sections/read-before-section.tsx`:

```tsx
import { Plus, Trash2 } from 'lucide-react';

import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { TextArea } from '@/components/ui/textarea';
import type { ReadBeforeFormValues } from '@/lib/validations/product';

const READ_BEFORE_KEY_OPTIONS = [
  { value: 'passport', label: 'Giay to tuy than' },
  { value: 'bring', label: 'Mang theo' },
  { value: 'not_recommended', label: 'Khong nen' },
  { value: 'wear', label: 'Trang phuc' },
  { value: 'cultural', label: 'Van hoa' },
  { value: 'health', label: 'Suc khoe' },
];

interface ReadBeforeRowProps {
  value: ReadBeforeFormValues;
  index: number;
  onChange: (index: number, patch: Partial<ReadBeforeFormValues>) => void;
  onRemove: (index: number) => void;
}

function ReadBeforeRow({ value, index, onChange, onRemove }: ReadBeforeRowProps) {
  const set = (patch: Partial<ReadBeforeFormValues>) => onChange(index, patch);

  return (
    <div className="border border-gray-200 rounded-lg p-4 space-y-3 bg-gray-50">
      <div className="flex items-center justify-between">
        <span className="text-sm font-semibold text-gray-700">Luu y {index + 1}</span>
        <Button
          variant="ghost"
          size="icon"
          rounded="md"
          type="button"
          className="text-red-500 hover:bg-red-50"
          onClick={() => onRemove(index)}
        >
          <Trash2 size={15} />
        </Button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
        <div className="space-y-1">
          <label className="text-xs font-medium text-gray-600">Loai luu y *</label>
          <Select value={value.key} onValueChange={(v) => set({ key: v })}>
            <SelectTrigger inputSize="sm">
              <SelectValue placeholder="Chon loai" />
            </SelectTrigger>
            <SelectContent>
              {READ_BEFORE_KEY_OPTIONS.map((opt) => (
                <SelectItem key={opt.value} value={opt.value}>
                  {opt.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div className="space-y-1">
          <label className="text-xs font-medium text-gray-600">Tieu de *</label>
          <Input
            size="sm"
            placeholder="VD: Mang theo CMND/Ho chieu"
            value={value.title}
            onChange={(e) => set({ title: e.target.value })}
          />
        </div>
      </div>

      <div className="space-y-1">
        <label className="text-xs font-medium text-gray-600">Mo ta</label>
        <TextArea
          rows={2}
          fullWidth
          placeholder="Chi tiet them ve luu y nay..."
          value={value.description ?? ''}
          onChange={(e) => set({ description: e.target.value })}
        />
      </div>
    </div>
  );
}

interface ReadBeforeSectionProps {
  readBefores: ReadBeforeFormValues[];
  onChange: (items: ReadBeforeFormValues[]) => void;
}

export function ReadBeforeSection({ readBefores, onChange }: ReadBeforeSectionProps) {
  function handleChange(index: number, patch: Partial<ReadBeforeFormValues>) {
    onChange(readBefores.map((item, i) => (i === index ? { ...item, ...patch } : item)));
  }

  function handleRemove(index: number) {
    onChange(readBefores.filter((_, i) => i !== index));
  }

  function handleAdd() {
    onChange([...readBefores, { key: 'bring', title: '', description: null }]);
  }

  return (
    <div className="space-y-4">
      {readBefores.map((item, index) => (
        <ReadBeforeRow key={index} value={item} index={index} onChange={handleChange} onRemove={handleRemove} />
      ))}
      <Button type="button" variant="outline" size="sm" onClick={handleAdd} className="w-full">
        <Plus size={14} className="mr-1.5" />
        Them luu y
      </Button>
    </div>
  );
}
```

### Step 3 — Update `index.tsx`

a) Add `BookOpen` to lucide-react import on line 1:

```ts
import {
  AlignLeft,
  ArrowLeft,
  BookOpen,
  Calendar,
  DollarSign,
  FileText,
  ImageIcon,
  Loader2,
  MapPin,
  Sparkles,
} from 'lucide-react';
```

b) Add import after `ExperiencesSection` import:

```ts
import { ReadBeforeSection } from './components/sections/read-before-section';
```

c) Add to `NAV_SECTIONS` after `section-experiences`:

```ts
{ id: 'section-readbefore', label: 'Luu y', icon: BookOpen },
```

d) Destructure `readBefores` and `setReadBefores` from `useProductForm`:

```ts
const {
  form,
  isEdit,
  productData: _productData,
  itineraries,
  setItineraries,
  options,
  setOptions,
  experiences,
  setExperiences,
  readBefores,
  setReadBefores,
  onSubmit,
  isPending,
  draft,
} = useProductForm(productId);
```

e) Render after `section-experiences` SectionCard:

```tsx
<SectionCard id="section-readbefore" label="Luu y truoc khi dat">
  <ReadBeforeSection readBefores={readBefores} onChange={setReadBefores} />
</SectionCard>
```

---

## Todo Checklist

- [ ] Add `readBefores` + `setReadBefores` state to `use-product-form.ts`
- [ ] Populate `readBefores` state in `useEffect` from `productData`
- [ ] Return `readBefores`, `setReadBefores` from `useProductForm`
- [ ] Create `read-before-section.tsx` with `ReadBeforeRow` + `ReadBeforeSection`
- [ ] Add `BookOpen` to lucide import in `index.tsx`
- [ ] Import `ReadBeforeSection` in `index.tsx`
- [ ] Add `section-readbefore` to `NAV_SECTIONS`
- [ ] Destructure `readBefores`, `setReadBefores` in `index.tsx`
- [ ] Render `<SectionCard id="section-readbefore">` after experiences section
- [ ] Run `pnpm check-types` — zero errors
- [ ] Run `pnpm lint` — zero warnings

---

## Success Criteria

- "Luu y" entry appears in scroll-spy nav
- Adding a row shows key Select + title Input + description Textarea
- Key Select contains all 6 options
- Remove button correctly splices the item from the list
- Default new item has `key: 'bring'` pre-selected

---

## Risk Assessment

| Risk                                                               | Impact | Mitigation                                                                               |
| ------------------------------------------------------------------ | ------ | ---------------------------------------------------------------------------------------- |
| `readBefore` vs `readBefores` naming mismatch between API and form | Low    | API uses `readBefore` (array); form uses `readBefores` — mapping handled in Phase 01     |
| `readBefores` not sent in API payload                              | High   | Same gap as `experiences` — coordinate with team on whether main payload or sub-endpoint |
| `key` values differ from backend enum                              | Medium | Confirm exact allowed `key` values with backend before release                           |

---

## Unresolved Questions

1. Same payload gap as Phase 04: should `readBefores` be sent via the main product PATCH or a separate endpoint?
2. Are the 6 `key` values (`passport`, `bring`, `not_recommended`, `wear`, `cultural`, `health`) the complete backend enum, or are there others?
