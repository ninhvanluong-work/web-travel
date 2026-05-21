# Phase 02 — BasicInfoSection Additions

**Date:** 2026-05-19  
**Priority:** High  
**Status:** Todo  
**Depends on:** Phase 01 (schema fields must exist first)

---

## Context Links

- Target file: `src/modules/AdminProduct/ProductFormPage/components/sections/basic-info-section.tsx`
- Schema: `src/lib/validations/product.ts`
- UI components: `src/components/ui/input.tsx`, `src/components/ui/textarea.tsx`, `src/components/ui/badge.tsx`, `src/components/ui/switch.tsx`
- Form wrapper: `src/components/ui/form.tsx` — provides `FormField`, `FormItem`, `FormLabel`, `FormControl`, `FormMessage`

---

## Overview

Add four new fields to `BasicInfoSection`:

1. `shortDescription` — Textarea with live character counter (max 500)
2. `tags` — Inline tag-chip input: type + Enter/comma to add, click × on chip to remove
3. `isFreeCancellation` — Switch toggle
4. `cancellationDeadlineHours` — Number input, shown only when `isFreeCancellation` is `true`

All fields are placed **after the existing `description` TinyMCE field** (currently the last field in the component, lines 314–357).

---

## Key Insights

- `BasicInfoSection` uses `useFormContext<ProductFormValues>()` — all new fields follow the same pattern
- `shortDescription` is a plain Textarea (not TinyMCE — keep it simple, max 500 chars)
- `tags` is not a library component; build it inline using `Input` + `Badge` from `src/components/ui/`
- `isFreeCancellation` uses `Switch` (Radix primitive) with `Controller` pattern
- `cancellationDeadlineHours` uses `watch('isFreeCancellation')` to conditionally render — use the existing `watch` already destructured from `useFormContext`
- The existing `watch` is already used for `videoId` on line 26 — reuse it for `isFreeCancellation`
- No new state needs lifting to parent — all fields are RHF-controlled

---

## Requirements

- `shortDescription`: Textarea, max 500 chars, show `{charCount}/500` counter below
- `tags`: local component state `inputValue` for the typed-but-not-yet-added tag; form state (`tags` field) holds the array of committed tag strings
- `isFreeCancellation`: Switch, label "Miễn phí hủy tour"
- `cancellationDeadlineHours`: conditionally rendered Number Input, label "Hủy trước (giờ)", shown only when `isFreeCancellation === true`

---

## Architecture

### Placement in `basic-info-section.tsx`

Insertion point: after the closing `</FormField>` of the `description` block (line 357), before the final `</div>` (line 358).

New DOM structure appended inside the root `<div className="space-y-6">`:

```
[existing fields]
[description TinyMCE — lines 314–357]
↓ INSERT HERE
<shortDescription section>
<tags section>
<isFreeCancellation + cancellationDeadlineHours row>
```

### Inline `TagsInput` sub-component

Declare as a named function inside `basic-info-section.tsx` (above the exported `BasicInfoSection` function). It receives `value: string[]` and `onChange: (tags: string[]) => void` props — no direct RHF coupling inside the component.

```tsx
function TagsInput({ value, onChange }: { value: string[]; onChange: (tags: string[]) => void }) {
  const [input, setInput] = useState('');

  function addTag(raw: string) {
    const tag = raw.trim().replace(/,$/, '').trim();
    if (!tag || value.includes(tag)) return;
    onChange([...value, tag]);
    setInput('');
  }

  function removeTag(tag: string) {
    onChange(value.filter((t) => t !== tag));
  }

  function handleKeyDown(e: React.KeyboardEvent<HTMLInputElement>) {
    if (e.key === 'Enter' || e.key === ',') {
      e.preventDefault();
      addTag(input);
    }
    if (e.key === 'Backspace' && !input && value.length > 0) {
      onChange(value.slice(0, -1));
    }
  }

  return (
    <div className="flex flex-wrap gap-1.5 p-2 border border-slate-200 rounded-lg bg-slate-50/50 min-h-[38px]">
      {value.map((tag) => (
        <Badge key={tag} variant="secondary" className="flex items-center gap-1 text-xs">
          {tag}
          <button type="button" onClick={() => removeTag(tag)} className="ml-0.5 text-slate-400 hover:text-slate-700">
            <X size={11} />
          </button>
        </Badge>
      ))}
      <input
        className="flex-1 min-w-[120px] bg-transparent text-sm text-slate-700 placeholder-slate-400 outline-none"
        placeholder={value.length === 0 ? 'Nhập tag, nhấn Enter hoặc dấu phẩy...' : 'Thêm tag...'}
        value={input}
        onChange={(e) => setInput(e.target.value)}
        onKeyDown={handleKeyDown}
        onBlur={() => input && addTag(input)}
      />
    </div>
  );
}
```

---

## Related Code Files

- `src/modules/AdminProduct/ProductFormPage/components/sections/basic-info-section.tsx` (lines 1–360)
- `src/components/ui/badge.tsx`
- `src/components/ui/switch.tsx`
- `src/components/ui/textarea.tsx`
- `src/lib/validations/product.ts` (new fields from Phase 01)

---

## Implementation Steps

### Step 1 — Add imports to `basic-info-section.tsx`

At the top of the file, add to the existing import block:

```ts
// Add to lucide-react import (line 2): X is already imported — verify; if not, add X
import { Film, X } from 'lucide-react'; // X may already be present

// Add new UI imports after existing component imports (around line 12):
import { Badge } from '@/components/ui/badge';
import { Switch } from '@/components/ui/switch';
import { TextArea } from '@/components/ui/textarea';
```

Verify `X` is already imported from `lucide-react` (line 2 shows `Film, X`) — it is, no change needed.

### Step 2 — Add `TagsInput` component above `BasicInfoSection`

Insert the `TagsInput` function (shown in Architecture above) between the `useDebounce` hook (lines 14–21) and the `BasicInfoSection` export (line 23). This keeps it file-local, not exported.

### Step 3 — Extend `watch` usage in `BasicInfoSection`

On line 24, `watch` is already destructured from `useFormContext`. No change needed. Confirm it is present:

```ts
const { control, setValue, watch } = useFormContext<ProductFormValues>();
```

### Step 4 — Add `isFreeCancellation` watcher

After line 26 (`const currentVideoId = watch('videoId');`), add:

```ts
const isFreeCancellation = watch('isFreeCancellation');
```

### Step 5 — Append new field blocks after `description` FormField

After line 357 (closing `</FormField>` of `description` block), add the following three blocks inside the root `<div className="space-y-6">`:

**Block A — `shortDescription`:**

```tsx
<FormField
  control={control}
  name="shortDescription"
  render={({ field }) => (
    <FormItem className="space-y-1.5">
      <div className="flex items-center justify-between">
        <FormLabel className="text-[13px] text-slate-500 font-medium">Mo ta ngan</FormLabel>
        <span className="text-[11px] text-slate-400">{(field.value ?? '').length}/500</span>
      </div>
      <FormControl>
        <TextArea
          rows={3}
          fullWidth
          placeholder="Tom tat ngan gon ve tour..."
          maxLength={500}
          value={field.value ?? ''}
          onChange={field.onChange}
        />
      </FormControl>
      <FormMessage />
    </FormItem>
  )}
/>
```

**Block B — `tags`:**

```tsx
<FormField
  control={control}
  name="tags"
  render={({ field }) => (
    <FormItem className="space-y-1.5">
      <FormLabel className="text-[13px] text-slate-500 font-medium">Tags</FormLabel>
      <FormControl>
        <TagsInput value={field.value ?? []} onChange={field.onChange} />
      </FormControl>
      <FormMessage />
    </FormItem>
  )}
/>
```

**Block C — `isFreeCancellation` + conditional `cancellationDeadlineHours`:**

```tsx
<div className="flex flex-row gap-5 items-start">
  <FormField
    control={control}
    name="isFreeCancellation"
    render={({ field }) => (
      <FormItem className="flex-1 space-y-1.5">
        <FormLabel className="text-[13px] text-slate-500 font-medium">Mien phi huy tour</FormLabel>
        <FormControl>
          <div className="flex items-center h-9">
            <Switch checked={field.value ?? false} onCheckedChange={field.onChange} />
          </div>
        </FormControl>
        <FormMessage />
      </FormItem>
    )}
  />

  {isFreeCancellation && (
    <FormField
      control={control}
      name="cancellationDeadlineHours"
      render={({ field }) => (
        <FormItem className="flex-1 space-y-1.5">
          <FormLabel className="text-[13px] text-slate-500 font-medium">Huy truoc (gio)</FormLabel>
          <FormControl>
            <Input
              type="number"
              size="sm"
              min={0}
              placeholder="24"
              value={field.value ?? ''}
              onChange={field.onChange}
            />
          </FormControl>
          <FormMessage />
        </FormItem>
      )}
    />
  )}
</div>
```

---

## Todo Checklist

- [ ] Verify `X` and `Film` already imported from `lucide-react`
- [ ] Add `Badge`, `Switch`, `TextArea` imports
- [ ] Insert `TagsInput` function above `BasicInfoSection`
- [ ] Add `isFreeCancellation` watcher after `currentVideoId` watcher
- [ ] Append `shortDescription` FormField after `description` block
- [ ] Append `tags` FormField
- [ ] Append `isFreeCancellation` + conditional `cancellationDeadlineHours` row
- [ ] Run `pnpm check-types` — zero errors
- [ ] Run `pnpm lint` — zero warnings

---

## Success Criteria

- `shortDescription` textarea renders with live `{n}/500` counter
- Typing a tag + Enter or comma adds a chip; clicking × removes it
- `isFreeCancellation` switch toggles on/off
- `cancellationDeadlineHours` input appears only when toggle is on, disappears when toggle is off
- All fields are properly included in RHF form state (confirmed via React DevTools or form submission log)

---

## Risk Assessment

| Risk                                                                     | Impact | Mitigation                                                                            |
| ------------------------------------------------------------------------ | ------ | ------------------------------------------------------------------------------------- |
| `TextArea` import name conflict                                          | Low    | Confirm exact export name in `src/components/ui/textarea.tsx` — it exports `TextArea` |
| `Switch` `onCheckedChange` type mismatch with RHF `field.onChange`       | Low    | Both accept `boolean`; direct pass works                                              |
| Tags input losing focus on chip add/remove                               | Low    | `onBlur` on the inner `<input>` commits partial input — acceptable UX                 |
| `cancellationDeadlineHours` not in backend — sends to payload by mistake | Medium | Phase 01 explicitly excludes it from `toApiPayload()` until confirmed                 |
