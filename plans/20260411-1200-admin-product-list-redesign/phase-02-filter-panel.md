# Phase 02 — Filter Panel: Collapsible

[← plan.md](./plan.md)

## Overview

- **Date:** 2026-04-12
- **Priority:** High
- **Status:** Pending

## Context

Current `ProductFilterBar` renders keyword + 4 dropdowns always-visible in a multi-row layout.

Target: Filter panel is **hidden by default**, appears below toolbar when Filter button is toggled.

## Implementation Steps

### 1. `ProductFilterBar.tsx` changes

- **Remove** the `keyword` / `onKeywordChange` props — search moves to toolbar
- **Remove** the keyword `<Input>` block (first div)
- Keep: supplier, destination, status, date range dropdowns + reset button
- Change outer wrapper to a simple horizontal flex row (no `flex-wrap`, all in one line or 2-column grid):
  ```tsx
  <div className="px-5 py-4 border-b border-gray-200 dark:border-gray-800 flex flex-wrap items-end gap-4">
    {/* Supplier select */}
    {/* Destination select */}
    {/* Status select */}
    {/* DateRange */}
    {/* Reset */}
  </div>
  ```
- Remove per-field `<label>` text (inline selects with placeholder are enough, like TailAdmin)

### 2. `index.tsx` integration

- Wrap `<ProductFilterBar ...>` in:
  ```tsx
  {(filterOpen || hasActiveFilters) && (
    <ProductFilterBar ... />
  )}
  ```
- `keyword` prop removed from `ProductFilterBar` — now handled inline in toolbar search

### 3. Animation (optional, low priority)

- Could use `transition-all` + max-height trick if user wants smooth animation. Skip for now unless requested.

## Updated Props Interface

```ts
interface Props {
  // REMOVED: keyword, onKeywordChange
  selects: ProductSelectFilters;
  suppliers: LookupItem[];
  destinations: LookupItem[];
  hasActiveFilters: boolean;
  onSelectChange: (patch: Partial<ProductSelectFilters>) => void;
  onReset: () => void;
}
```

## Related Files

- `src/modules/AdminProduct/ProductListPage/components/ProductFilterBar.tsx`
- `src/modules/AdminProduct/ProductListPage/index.tsx`

## Success Criteria

- Filter panel hidden when `filterOpen === false` and no active filters
- Filter panel shows when Filter button clicked or when active filters exist
- Search input works independently in toolbar

## Risk

- Low — removing keyword from FilterBar, ensuring hook still works (keyword stays in hook, just input moves)
