# Phase 1: Drag & Drop Reordering

## Problem with Spec's Proposed Code

Spec uses `fields.map()` (from `useFieldArray`) for rendering + `bannerValues` (from `watch`) for Reorder values, then calls `setValue` on reorder.

**Bug:** After `setValue('banner', newOrder)`, `fields` still has old insertion order. `fields[i].id ≠ bannerValues[i]` → wrong `key` props → broken animation identity + wrong `remove(index)` calls.

## Correct Approach: Use `move()`

```tsx
import { Reorder } from 'framer-motion';
import { Menu } from 'lucide-react';

export function BannerSection() {
  const { control, watch } = useFormContext<ProductFormValues>();
  const { fields, append, remove, move } = useFieldArray({ control, name: 'banner' });
  const bannerValues = watch('banner') ?? [];

  const handleReorder = (newValues: typeof bannerValues) => {
    // Apply moves in sequence to keep fields + bannerValues in sync
    newValues.forEach((val, newIdx) => {
      const oldIdx = bannerValues.indexOf(val);
      if (oldIdx !== -1 && oldIdx !== newIdx) move(oldIdx, newIdx);
    });
  };

  return (
    <div className="space-y-5">
      {fields.length === 0 && <EmptyBannerState />}

      <Reorder.Group axis="y" values={bannerValues} onReorder={handleReorder} className="space-y-4">
        {fields.map((item, index) => (
          <Reorder.Item
            key={item.id}
            value={bannerValues[index] ?? item}
            whileDrag={{
              scale: 0.99,
              boxShadow: '0 20px 25px -5px rgb(0 0 0 / 0.1), 0 8px 10px -6px rgb(0 0 0 / 0.1)',
              borderColor: 'rgb(99 102 241)',
            }}
            className="rounded-2xl"
          >
            <div className="flex items-start gap-2">
              <div className="mt-[22px] cursor-grab active:cursor-grabbing text-slate-300 hover:text-slate-500 p-1 shrink-0">
                <Menu size={16} />
              </div>
              <div className="flex-1 min-w-0">
                <BannerItem index={index} onRemove={() => remove(index)} />
              </div>
            </div>
          </Reorder.Item>
        ))}
      </Reorder.Group>

      <div className="flex flex-wrap items-center gap-3 pt-3 border-t border-slate-100">
        <Button
          type="button"
          variant="secondary"
          size="md"
          onClick={() => append({ type: 'image', url: '' })}
          className="gap-2 h-10 px-4 bg-white border border-slate-200 text-slate-700 hover:bg-slate-50 shadow-theme-xs rounded-lg font-medium"
        >
          <ImageIcon size={16} className="text-emerald-500" />
          Thêm hình ảnh
        </Button>
        <Button
          type="button"
          variant="primary"
          size="md"
          onClick={() => append({ type: 'video', url: '' })}
          className="gap-2 h-10 px-4 bg-brand-500 hover:bg-brand-600 text-white font-semibold shadow-theme-xs rounded-lg border-none"
        >
          <Video size={16} />
          Thêm video
        </Button>
      </div>
    </div>
  );
}
```

## Why `move()` not `setValue()`

- `move(from, to)` updates `fields` array in `useFieldArray` — keeps `fields[i].id` aligned with actual position
- `setValue` only updates RHF values store, not the `fields` array reference
- `Reorder.Item key={item.id}` relies on `fields` order → must stay in sync with rendered order

## Edge Cases

| Case                                                   | Handling                                                                                                                                       |
| ------------------------------------------------------ | ---------------------------------------------------------------------------------------------------------------------------------------------- |
| `bannerValues[index]` undefined during animation frame | Guard: `bannerValues[index] ?? item`                                                                                                           |
| Single item (no drag needed)                           | Reorder.Group still renders fine, no drag triggers                                                                                             |
| Drag handle vs content click                           | Drag handle uses `cursor-grab`; content click (select/input) still works because Framer Motion only intercepts pointer events on the drag zone |
