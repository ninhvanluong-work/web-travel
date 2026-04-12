# Phase 01 — Toolbar: Single Row

[← plan.md](./plan.md)

## Overview

- **Date:** 2026-04-12
- **Priority:** High
- **Status:** Pending

## Context

Current `index.tsx` has:

- Page header (title + subtitle) in `flex justify-between` with "Thêm tour mới" button
- Separate card header inside main card (redundant title)
- `ProductFilterBar` rendered as full multi-row block inside card

Target (TailAdmin): Single toolbar row inside the main card header area:

```
[ 🔍 Search box ]          [ Export ]  [ Filter ▼ ]  [ + Thêm tour mới ]
```

## Implementation Steps

### 1. `index.tsx` changes

- Keep outer page header (h1 "Danh sách Tour") — **remove subtitle `<p>` tag**
- Remove the "Thêm tour mới" button from the page header (move it to toolbar)
- Inside the main card header, replace current `<div>` (title + subtitle + count badge) with a single toolbar row:
  ```tsx
  <div className="flex items-center gap-3 px-5 py-4 border-b border-gray-200 dark:border-gray-800">
    {/* Search — inline, 280px */}
    <Input size="sm" placeholder="Tìm kiếm tour..." value={keyword} onChange={...} prefix={<Search />} className="w-[280px]" />
    <div className="ml-auto flex items-center gap-2">
      {/* Export button */}
      <Button variant="outline" size="xs">Export</Button>
      {/* Filter toggle */}
      <Button variant="outline" size="xs" onClick={() => setFilterOpen(v => !v)}>
        <SlidersHorizontal size={14} /> Filter {hasActiveFilters && <span className="badge">●</span>}
      </Button>
      {/* Add */}
      <Button variant="primary" size="xs" onClick={() => router.push(ROUTE.ADMIN_PRODUCTS_CREATE)}>
        <PlusCircle size={14} /> Thêm tour mới
      </Button>
    </div>
  </div>
  ```
- Add `const [filterOpen, setFilterOpen] = useState(false)` local state
- Pass `keyword` / `setKeyword` directly to the inline search (remove from `ProductFilterBar` props)

### 2. State: `filterOpen`

- Default `false`
- When `hasActiveFilters === true`, auto-open (`useEffect` or derived open = `filterOpen || hasActiveFilters`)

## Related Files

- `src/modules/AdminProduct/ProductListPage/index.tsx`

## Success Criteria

- Toolbar renders in one row with 4 elements
- No subtitle below page h1
- Filter panel hidden by default
- "Thêm tour mới" only in toolbar, not in page header

## Risk

- Low — pure UI restructuring, no logic change
