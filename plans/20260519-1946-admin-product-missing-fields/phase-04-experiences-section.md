# Phase 04 — Experiences Section

**Date:** 2026-05-19  
**Priority:** Medium  
**Status:** Todo  
**Depends on:** Phase 01

---

## Context Links

- New file: `src/modules/AdminProduct/ProductFormPage/components/sections/experiences-section.tsx`
- Page index: `src/modules/AdminProduct/ProductFormPage/index.tsx`
- Pattern reference: `src/modules/AdminProduct/ProductFormPage/components/sections/time-itinerary-section.tsx`
- State lifted to: `src/hooks/use-product-form.ts`
- Image upload: `src/modules/AdminProduct/ProductFormPage/components/shared/image-upload-card.tsx`
- Schema type: `ExperienceFormValues` from `src/lib/validations/product.ts` (added in Phase 01)

---

## Overview

Create `ExperiencesSection` following the existing `useState` array pattern used by `itineraries` and `options`. State is lifted to `useProductForm` hook and passed via props — the section does NOT use `useFieldArray` or `useFormContext` for the array itself.

Add "Trai nghiem noi bat" to scroll-spy nav.

---

## Key Insights

- `ItineraryFormRow` and `OptionFormRow` both receive `{ value, index, onChange, onRemove }` — use identical prop pattern
- `ImageUploadCard` uses `useFormContext<ProductFormValues>()` internally and binds to a named field — it is NOT suitable for array item image fields. Use a plain `<input type="file">` with manual CDN upload, or a simpler inline preview component. See decision below.
- `ImageUploadCard` signature: `{ label, fieldName: keyof ProductFormValues }` — it only works for top-level RHF fields, not nested array items
- For experience image: use a self-contained `ExperienceImageField` inline component that accepts `value: string | null` and `onChange: (url: string | null) => void` — calls the same CDN upload API directly
- The CDN upload logic in `ImageUploadCard` uses `request.post('/media/upload', formData)` — replicate minimally

---

## Requirements

- State: `experiences: ExperienceFormValues[]` + `setExperiences` lifted to `useProductForm`, passed as props
- Each item row: image upload (CDN), `title` Input, `content` Textarea
- Add item button at bottom of list
- Remove item button per row
- Nav entry: `{ id: 'section-experiences', label: 'Trai nghiem', icon: Sparkles }` inserted after `section-quickfacts`

---

## Architecture

### State lifting in `src/hooks/use-product-form.ts`

Add alongside existing `itineraries` and `options` state (line 41–42):

```ts
import type { ExperienceFormValues } from '@/lib/validations/product';

const [experiences, setExperiences] = useState<ExperienceFormValues[]>([]);
```

Populate in the `useEffect` `form.reset` block — already handled in Phase 01 Step 5 (experiences reset). However, `experiences` array state also needs populating:

```ts
// Inside useEffect after form.reset call, add:
setExperiences(
  (productData.experience ?? []).map((e) => ({
    imageUrl: e.imageUrl ?? null,
    title: e.title,
    content: e.content ?? null,
  }))
);
```

Return `experiences` and `setExperiences` from `useProductForm`.

### `ExperiencesSection` props interface

```ts
interface ExperiencesSectionProps {
  experiences: ExperienceFormValues[];
  onChange: (items: ExperienceFormValues[]) => void;
}
```

### `ExperienceRow` sub-component (file-local)

```ts
interface ExperienceRowProps {
  value: ExperienceFormValues;
  index: number;
  onChange: (index: number, patch: Partial<ExperienceFormValues>) => void;
  onRemove: (index: number) => void;
}
```

Contains:

- `ExperienceImageField` (inline image upload, see below)
- `Input` for `title`
- `TextArea` for `content`

### `ExperienceImageField` (file-local)

Minimal CDN upload component — does NOT use `useFormContext`. Accepts `value` + `onChange`.

```ts
interface ExperienceImageFieldProps {
  value: string | null | undefined;
  onChange: (url: string | null) => void;
}
```

Implementation pattern:

1. Hidden `<input type="file" accept="image/*">`
2. On file select → POST `FormData` to `/media/upload` via `request.post`
3. On success → call `onChange(url)`
4. Show preview if `value` is set; show placeholder div if not
5. Use `AlertBanner` for upload errors

---

## Related Code Files

- `src/hooks/use-product-form.ts` (lines 41–42 for state, line 107 for return)
- `src/modules/AdminProduct/ProductFormPage/index.tsx` (NAV_SECTIONS, SectionCard render, props)
- `src/modules/AdminProduct/ProductFormPage/components/shared/image-upload-card.tsx` — reference for CDN upload pattern
- `src/modules/AdminProduct/ProductFormPage/components/shared/OptionFormRow.tsx` — reference for row pattern
- `src/api/axios.ts` — `request` instance for upload call
- `src/components/ui/alert-banner.tsx` (or wherever AlertBanner is defined)

---

## Implementation Steps

### Step 1 — Extend `use-product-form.ts`

In `src/hooks/use-product-form.ts`:

a) Add import after existing imports:

```ts
import type { ExperienceFormValues, ItineraryFormValues, OptionFormValues } from '@/lib/validations/product';
```

(merge with existing import on line 9)

b) After line 42 (`const [options, setOptions] = useState<OptionFormValues[]>([]);`), add:

```ts
const [experiences, setExperiences] = useState<ExperienceFormValues[]>([]);
```

c) Inside the `useEffect` (line 53), after the `form.reset({ ... })` call closing brace, add:

```ts
setExperiences(
  (productData.experience ?? []).map((e) => ({
    imageUrl: e.imageUrl ?? null,
    title: e.title,
    content: e.content ?? null,
  }))
);
```

d) In the return object on line 107, add `experiences, setExperiences`:

```ts
return {
  form,
  isEdit,
  productData,
  itineraries,
  setItineraries,
  options,
  setOptions,
  experiences,
  setExperiences,
  onSubmit,
  isPending,
  draft,
};
```

### Step 2 — Create `experiences-section.tsx`

Create `src/modules/AdminProduct/ProductFormPage/components/sections/experiences-section.tsx`:

```tsx
import { Plus, Trash2 } from 'lucide-react';
import { useRef, useState } from 'react';

import { request } from '@/api/axios';
import { AlertBanner } from '@/components/ui/alert-banner';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { TextArea } from '@/components/ui/textarea';
import type { ExperienceFormValues } from '@/lib/validations/product';

// -- ExperienceImageField --

interface ExperienceImageFieldProps {
  value: string | null | undefined;
  onChange: (url: string | null) => void;
}

function ExperienceImageField({ value, onChange }: ExperienceImageFieldProps) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleFile(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    setUploading(true);
    setError(null);
    try {
      const formData = new FormData();
      formData.append('file', file);
      const { data } = await request.post<{ data: { url: string } }>('/media/upload', formData);
      onChange(data.data.url);
    } catch {
      setError('Upload failed. Please try again.');
    } finally {
      setUploading(false);
    }
  }

  return (
    <div className="space-y-1.5">
      <label className="text-xs font-medium text-gray-600">Hinh anh</label>
      <div
        className="relative w-full h-36 rounded-lg border border-dashed border-slate-300 bg-slate-50 flex items-center justify-center cursor-pointer overflow-hidden"
        onClick={() => inputRef.current?.click()}
      >
        {value ? (
          <img src={value} alt="" className="w-full h-full object-cover" />
        ) : (
          <span className="text-xs text-slate-400">{uploading ? 'Dang tai len...' : 'Bam de chon anh'}</span>
        )}
        <input ref={inputRef} type="file" accept="image/*" className="hidden" onChange={handleFile} />
      </div>
      {error && <AlertBanner variant="error" message={error} />}
      {value && (
        <button type="button" className="text-[11px] text-red-500 hover:underline" onClick={() => onChange(null)}>
          Xoa anh
        </button>
      )}
    </div>
  );
}

// -- ExperienceRow --

interface ExperienceRowProps {
  value: ExperienceFormValues;
  index: number;
  onChange: (index: number, patch: Partial<ExperienceFormValues>) => void;
  onRemove: (index: number) => void;
}

function ExperienceRow({ value, index, onChange, onRemove }: ExperienceRowProps) {
  const set = (patch: Partial<ExperienceFormValues>) => onChange(index, patch);

  return (
    <div className="border border-gray-200 rounded-lg p-4 space-y-3 bg-gray-50">
      <div className="flex items-center justify-between">
        <span className="text-sm font-semibold text-gray-700">Trai nghiem {index + 1}</span>
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

      <ExperienceImageField value={value.imageUrl} onChange={(url) => set({ imageUrl: url })} />

      <div className="space-y-1">
        <label className="text-xs font-medium text-gray-600">Tieu de *</label>
        <Input
          size="sm"
          placeholder="VD: Kham pha van hoa dia phuong"
          value={value.title}
          onChange={(e) => set({ title: e.target.value })}
        />
      </div>

      <div className="space-y-1">
        <label className="text-xs font-medium text-gray-600">Noi dung</label>
        <TextArea
          rows={3}
          fullWidth
          placeholder="Mo ta trai nghiem..."
          value={value.content ?? ''}
          onChange={(e) => set({ content: e.target.value })}
        />
      </div>
    </div>
  );
}

// -- ExperiencesSection --

interface ExperiencesSectionProps {
  experiences: ExperienceFormValues[];
  onChange: (items: ExperienceFormValues[]) => void;
}

export function ExperiencesSection({ experiences, onChange }: ExperiencesSectionProps) {
  function handleChange(index: number, patch: Partial<ExperienceFormValues>) {
    onChange(experiences.map((item, i) => (i === index ? { ...item, ...patch } : item)));
  }

  function handleRemove(index: number) {
    onChange(experiences.filter((_, i) => i !== index));
  }

  function handleAdd() {
    onChange([...experiences, { imageUrl: null, title: '', content: null }]);
  }

  return (
    <div className="space-y-4">
      {experiences.map((item, index) => (
        <ExperienceRow key={index} value={item} index={index} onChange={handleChange} onRemove={handleRemove} />
      ))}
      <Button type="button" variant="outline" size="sm" onClick={handleAdd} className="w-full">
        <Plus size={14} className="mr-1.5" />
        Them trai nghiem
      </Button>
    </div>
  );
}
```

### Step 3 — Update `index.tsx`

a) Add import after line 17:

```ts
import { ExperiencesSection } from './components/sections/experiences-section';
```

b) Add `Sparkles` to lucide-react import on line 1:

```ts
import {
  AlignLeft,
  ArrowLeft,
  Calendar,
  DollarSign,
  FileText,
  ImageIcon,
  Loader2,
  MapPin,
  Sparkles,
} from 'lucide-react';
```

c) Add to `NAV_SECTIONS` after `section-quickfacts` entry:

```ts
{ id: 'section-experiences', label: 'Trai nghiem', icon: Sparkles },
```

d) Destructure `experiences` and `setExperiences` from `useProductForm` (line 63–74):

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
  onSubmit,
  isPending,
  draft,
} = useProductForm(productId);
```

e) Render after the `section-quickfacts` SectionCard:

```tsx
<SectionCard id="section-experiences" label="Trai nghiem noi bat">
  <ExperiencesSection experiences={experiences} onChange={setExperiences} />
</SectionCard>
```

### Step 4 — Wire experiences into payload

Phase 01 already handles `toApiPayload()`. The `experiences` array state is separate from RHF form state — it must be passed to `onSubmit`. Currently `onSubmit` only receives `ProductFormValues` (RHF data). Options and itineraries have the same gap.

**Do not change the existing `onSubmit` signature without permission.** Instead, note this as a known limitation: `experiences`, like `itineraries` and `options`, is stored in component state and not automatically included in the form submit payload. Raise with the team whether to merge array states into form submit or use separate API calls post-create. Do not implement a solution without confirmation.

---

## Todo Checklist

- [ ] Add `experiences` + `setExperiences` state to `use-product-form.ts`
- [ ] Populate `experiences` state in `useEffect` from `productData`
- [ ] Return `experiences`, `setExperiences` from `useProductForm`
- [ ] Create `experiences-section.tsx` with `ExperienceImageField`, `ExperienceRow`, `ExperiencesSection`
- [ ] Add `Sparkles` + `MapPin` to lucide import in `index.tsx` (MapPin added in Phase 03)
- [ ] Import `ExperiencesSection` in `index.tsx`
- [ ] Add `section-experiences` to `NAV_SECTIONS`
- [ ] Destructure `experiences`, `setExperiences` from `useProductForm` in `index.tsx`
- [ ] Render `<SectionCard id="section-experiences">` after quickfacts section
- [ ] Run `pnpm check-types` — zero errors
- [ ] Run `pnpm lint` — zero warnings

---

## Success Criteria

- "Trai nghiem" entry appears in scroll-spy nav
- Adding an experience creates a new row with image/title/content fields
- Image upload sends file to `/media/upload` and displays preview on success
- Removing a row updates the list correctly
- `experiences` array state is accessible in `ProductFormPage`

---

## Risk Assessment

| Risk                                                                      | Impact | Mitigation                                                                                                    |
| ------------------------------------------------------------------------- | ------ | ------------------------------------------------------------------------------------------------------------- |
| `/media/upload` endpoint shape differs from assumed                       | Medium | Check `ImageUploadCard` source for exact endpoint + response shape before implementing `ExperienceImageField` |
| `experiences` state not sent in API payload                               | High   | Document as known gap; do not silently drop data — coordinate with team                                       |
| `AlertBanner` import path incorrect                                       | Low    | Grep for `AlertBanner` export in `src/components/ui/` to confirm path                                         |
| `key={index}` on list items causes React reconciliation issues on reorder | Low    | No reorder feature planned; acceptable for now                                                                |

---

## Unresolved Questions

1. Does `/media/upload` return `{ data: { url: string } }` or a different shape? Check `ImageUploadCard` implementation before coding `ExperienceImageField`.
2. Should `experiences` be sent as part of the main product update payload, or via a separate endpoint (like `/product/:id/experiences`)?
