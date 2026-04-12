# Phase 03 — Table: Checkbox + Thumbnail + Sort Icons + Simplified Status

[← plan.md](./plan.md)

## Overview

- **Date:** 2026-04-12
- **Priority:** High
- **Status:** Pending

## Context

Current table: 9 columns — #, Tên tour, Nhà cung cấp, Điểm đến, Trạng thái, Giá từ, Đánh giá, Ngày tạo, Actions

Target (TailAdmin):

- Add checkbox column (select all + per-row)
- Add image/thumbnail in tour name cell
- Sort icons on key columns (Tên tour, Giá từ, Ngày tạo)
- Status badge: static display only (no inline dropdown)
- Actions: only "..." menu

## Implementation Steps

### 1. `ProductTable.tsx` — Header changes

**New COLUMNS array:**

```ts
const COLUMNS = [
  { label: 'checkbox', className: 'w-10 px-5' }, // checkbox
  { label: 'Tên tour', className: 'min-w-[220px]', sortable: true },
  { label: 'Nhà cung cấp', className: 'min-w-[140px]' },
  { label: 'Điểm đến', className: 'min-w-[110px]' },
  { label: 'Trạng thái', className: 'whitespace-nowrap' },
  { label: 'Giá từ', className: 'whitespace-nowrap', sortable: true },
  { label: 'Đánh giá', className: 'min-w-[110px]' },
  { label: 'Ngày tạo', className: 'whitespace-nowrap', sortable: true },
  { label: '', className: 'w-16' },
];
```

**Checkbox header cell:**

```tsx
<TableHead className="w-10 px-5">
  <input type="checkbox" checked={allSelected} onChange={toggleAll} className="rounded border-gray-300" />
</TableHead>
```

**Sort icon header:**

```tsx
{
  col.sortable ? (
    <button onClick={() => handleSort(col.key)} className="flex items-center gap-1 group">
      {col.label}
      <ChevronsUpDown size={13} className="text-gray-400 group-hover:text-gray-600" />
    </button>
  ) : (
    col.label
  );
}
```

**Add sort state:**

```ts
const [sort, setSort] = useState<{ key: string; dir: 'asc' | 'desc' } | null>(null);
```

Note: Sort is client-side only (current data in page) unless API supports it. Mark as visual-only for now.

**Pass `selectedIds` + `onToggle` + `onToggleAll` to rows:**

```ts
const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());
```

### 2. `ProductTableRow.tsx` — Checkbox + Thumbnail

**New first cell (checkbox):**

```tsx
<TableCell className="w-10 px-5">
  <input type="checkbox" checked={selected} onChange={() => onToggle(product.id)} className="rounded border-gray-300" />
</TableCell>
```

**Tour name cell — add thumbnail avatar:**

```tsx
<TableCell>
  <div className="flex items-center gap-3">
    {/* Thumbnail: use first video thumbnail or color avatar fallback */}
    <div className={cn('w-10 h-10 rounded-lg flex-shrink-0 flex items-center justify-center text-white text-sm font-bold', getAvatarColor(product.name))}>
      {product.name[0].toUpperCase()}
    </div>
    <div>
      <Link href={...} className="font-semibold text-sm ...line-clamp-1">{product.name}</Link>
      {product.code && <p className="text-[11px] text-gray-400">{product.code}</p>}
    </div>
  </div>
</TableCell>
```

**Status badge — static, no dropdown:**

```tsx
<TableCell>
  <span
    className={cn('inline-flex items-center text-xs font-medium px-2 py-0.5 rounded-full ring-1', statusCfg.className)}
  >
    {statusCfg.label}
  </span>
</TableCell>
```

(Remove the `<DropdownMenu>` wrapping the badge — status change moves to "..." menu)

## Related Files

- `src/modules/AdminProduct/ProductListPage/components/ProductTable.tsx`
- `src/modules/AdminProduct/ProductListPage/components/ProductTableRow.tsx`

## Success Criteria

- Checkbox column works (select/deselect rows, select all)
- Thumbnail shown in tour name cell
- Sort icon buttons render on Tên tour / Giá từ / Ngày tạo headers
- Status is a static badge (no clickable dropdown on the badge itself)

## Risk

- Medium: adding checkbox state to table — keep it local (no parent state needed unless bulk actions added later)
- Status change from inline badge → must move to "..." menu (Phase 04)
