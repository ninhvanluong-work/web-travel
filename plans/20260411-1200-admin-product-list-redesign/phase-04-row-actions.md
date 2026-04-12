# Phase 04 — Row Actions: Consolidate into "..." Menu

[← plan.md](./plan.md)

## Overview

- **Date:** 2026-04-12
- **Priority:** Medium
- **Status:** Pending

## Context

Current actions column: `<Pencil>` icon link + `<MoreHorizontal>` menu (only Delete inside).
Current status change: badge itself is a dropdown.

Target (TailAdmin): Only `<MoreHorizontal>` menu with all actions inside:

- Chỉnh sửa (→ edit page)
- Change status submenu or items: Công khai / Bản nháp / Ẩn
- Xóa tour (destructive)

## Implementation Steps

### 1. `ProductTableRow.tsx` — Actions cell

Remove:

- `<Tooltip>` + `<Pencil>` link
- Status `<DropdownMenu>` on badge

Update `<DropdownMenuContent>` to include:

```tsx
<DropdownMenuContent align="end" className="min-w-[160px]">
  {/* Edit */}
  <DropdownMenuItem asChild>
    <Link href={`/admin/products/${product.id}/edit`}>
      <Pencil size={14} className="mr-2" /> Chỉnh sửa
    </Link>
  </DropdownMenuItem>

  <DropdownMenuSeparator />

  {/* Status change options (only those different from current) */}
  {STATUS_OPTIONS.filter((o) => o.value !== product.status).map((opt) => (
    <DropdownMenuItem key={opt.value} onSelect={() => onChangeStatus(product, opt.value)}>
      {opt.label}
    </DropdownMenuItem>
  ))}

  <DropdownMenuSeparator />

  {/* Delete */}
  <DropdownMenuItem className="text-red-600 focus:text-red-600 focus:bg-red-50" onSelect={() => onDelete(product)}>
    <Trash2 size={14} className="mr-2" /> Xóa tour
  </DropdownMenuItem>
</DropdownMenuContent>
```

### 2. Actions cell wrapper

```tsx
<TableCell className="w-14">
  <DropdownMenu>
    <DropdownMenuTrigger asChild>
      <button
        type="button"
        className="inline-flex items-center justify-center h-8 w-8 rounded-lg text-gray-400 hover:text-gray-700 hover:bg-gray-100 transition-colors"
      >
        <MoreHorizontal size={16} />
      </button>
    </DropdownMenuTrigger>
    {/* content above */}
  </DropdownMenu>
</TableCell>
```

## Import changes

- Remove: `Pencil` from lucide (still used inside menu item)
- Remove: `Tooltip` import
- Add: `DropdownMenuSeparator` if not already imported
- Keep `Link` for edit item

## Related Files

- `src/modules/AdminProduct/ProductListPage/components/ProductTableRow.tsx`

## Success Criteria

- No separate pencil icon in actions column
- "..." menu contains: Chỉnh sửa, status change options, Xóa tour
- Status badge is non-interactive (display only)
- Edit still navigates to edit page

## Risk

- Low — pure UI consolidation, same callbacks reused
