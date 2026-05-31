# Shared Component Audit Report

## Summary

Audited 12 files for shared component violations. Found **8 violations** across 5 files. Violations are mostly inline `<button>` elements that should use the shared `<Button>` component, and one custom SVG star rating that should use a shared component.

---

## Violations Found

### 1. `/d/Remote/web-travel/src/modules/AdminProduct/ProductFormPage/components/sections/quick-facts-section.tsx`

**Line 123-129: Inline `<button>` for remove row action**

- Currently: `<button type="button" onClick={() => removeRow(row.rowKey)} className="..."`
- Should use: `<Button>` from `@/components/ui/button` (or `<IconButton>` if available)
- Details: Remove button with Trash2 icon that could be a `<Button variant="ghost" size="icon">`

---

### 2. `/d/Remote/web-travel/src/modules/AdminProduct/ProductFormPage/components/shared/element-value-combobox.tsx`

**Line 101-107: Inline `<button>` for clear action (suffix)**

- Currently: `<button type="button" onMouseDown={handleClear} className="..."`
- Should use: `<Button>` from `@/components/ui/button`
- Details: Clear/close button in input suffix that could be `<Button variant="ghost" size="icon">`

**Line 146-159: Inline `<button>` for dropdown items**

- Currently: `<button type="button" onMouseDown={() => handleSelect(el)} className={`...`}`
- Should use: Either a shared dropdown/menu component or `<Button>` with proper styling
- Details: These are custom dropdown items in a custom dropdown UI; should use `<DropdownMenu>` from `@/components/ui/dropdown-menu` or similar

---

### 3. `/d/Remote/web-travel/src/modules/AdminProduct/ProductFormPage/index.tsx`

**Line 100-113: Inline `<button>` for section navigation**

- Currently: `<button type="button" onClick={() => document.getElementById(id)?.scrollIntoView(...)} className={`...`}`
- Should use: `<Button>` from `@/components/ui/button`
- Details: Navigation buttons in left sidebar for section scroll-spy; could be `<Button variant="ghost" size="sm">`

---

### 4. `/d/Remote/web-travel/src/modules/AdminProduct/ProductListPage/components/ProductTableRow.tsx`

**Line 30-48: Custom `<svg>` star rating component**

- Currently: Inline SVG polygon stars with custom styling
- Should use: Either a shared `<StarRating>` component or use lucide's `Star` icon
- Details: This is a reusable pattern (star ratings appear elsewhere) that should be extracted to `src/components/ui/` or `src/components/`

**Line 149-154: Inline `<button>` for dropdown trigger**

- Currently: `<button type="button" className="inline-flex items-center justify-center..."`
- Should use: Already using `<DropdownMenuTrigger asChild>` wrapper, but the inner `<button>` could be replaced with `<Button variant="icon">`
- Details: Minor — the button is already wrapped correctly, but could use `<Button>` for consistency

---

### 5. `/d/Remote/web-travel/src/modules/ProductPage/adapter.ts`

**No violations found** — This is a data adapter file with no UI components.

---

### 6. `/d/Remote/web-travel/src/modules/AdminProduct/ProductListPage/components/ProductTable.tsx`

**Line 37-45: Inline `<button>` for sortable header**

- Currently: `<button type="button" onClick={() => onSort(sortKey)} className="flex items-center gap-1..."`
- Should use: `<Button>` from `@/components/ui/button` or a shared `<SortableHeader>` component
- Details: This could be `<Button variant="ghost" size="sm">`

---

### 7. `/d/Remote/web-travel/src/hooks/use-video-detail-feed.ts`

**No violations found** — This is a custom hook with no UI components.

---

### 8. `/d/Remote/web-travel/src/modules/DetailSearchPage/index.tsx`

**Line 81-85: Inline backdrop `<div>` overlay**

- Currently: `<div className="fixed inset-0 bg-black/60 z-40 animate__animated animate__fadeIn" onClick={() => setIsFocused(false)} />`
- Observation: Backdrop divs are not technically "violations" since there's no shared Backdrop/Overlay component, but this pattern repeats elsewhere (HomePage)
- Recommendation: Consider creating a shared `<Backdrop>` or `<Modal>` overlay component if this pattern repeats in many places

---

### 9. `/d/Remote/web-travel/src/modules/DetailSearchPage/components/VideoGrid.tsx`

**No violations found** — Uses `Icons.*` correctly from `src/assets/icons.tsx`, no inline components.

---

### 10. `/d/Remote/web-travel/src/modules/HomePage/index.tsx`

**Line 169-183: Inline `<button>` for mute toggle**

- Currently: `<button className="fixed top-4 right-4 p-3 bg-black/50 rounded-full..."`
- Should use: `<Button>` from `@/components/ui/button`
- Details: Could be `<Button variant="glass" rounded="full" size="icon">`

**Line 81-85: Inline backdrop `<div>` overlay**

- Currently: `<div className="fixed inset-0 bg-black/60 z-20 animate__animated animate__fadeIn" onClick={(e) => {...}}`
- Observation: Same pattern as DetailSearchPage; not a violation per se, but repeats

---

### 11. `/d/Remote/web-travel/src/modules/HomePage/components/SearchBox.tsx`

**No violations found** — Uses `<Input>` from `@/components/ui/input` correctly, uses `lucide-react` icons (Search), no inline duplicates.

---

## Summary Table

| File                       | Line(s) | Current                            | Recommendation                             | Severity |
| -------------------------- | ------- | ---------------------------------- | ------------------------------------------ | -------- |
| quick-facts-section.tsx    | 123-129 | `<button>`                         | `<Button variant="ghost" size="icon"`      | Medium   |
| element-value-combobox.tsx | 101-107 | `<button>` for clear               | `<Button variant="ghost" size="icon"`      | Medium   |
| element-value-combobox.tsx | 146-159 | `<button>` for dropdown items      | Use `<DropdownMenu>` or `<Button>`         | Medium   |
| ProductFormPage/index.tsx  | 100-113 | `<button>` for nav                 | `<Button variant="ghost" size="sm"`        | Medium   |
| ProductTableRow.tsx        | 30-48   | Custom `<svg>` stars               | Extract to shared `<StarRating>` component | High     |
| ProductTableRow.tsx        | 149-154 | `<button>` inside dropdown trigger | `<Button variant="icon"`                   | Low      |
| ProductTable.tsx           | 37-45   | `<button>` for sortable header     | `<Button variant="ghost" size="sm"`        | Medium   |
| HomePage/index.tsx         | 169-183 | `<button>` for mute                | `<Button variant="glass" rounded="full"`   | Medium   |

---

## Priority Fixes

### High Priority

1. **Extract StarRating component** (ProductTableRow.tsx:30-48)
   - This is a reusable UI pattern that appears at least in product tables
   - Create `src/components/ui/star-rating.tsx`
   - Import and use throughout codebase

### Medium Priority

2. **Replace inline buttons** with `<Button>` in:
   - quick-facts-section.tsx (line 123)
   - element-value-combobox.tsx (lines 101, 146)
   - ProductFormPage/index.tsx (line 100)
   - ProductTable.tsx (line 37)
   - HomePage/index.tsx (line 169)

### Low Priority

3. **Consider shared Backdrop component** if modal/overlay pattern repeats >2 places
   - Currently in: DetailSearchPage, HomePage
   - Could create `src/components/ui/backdrop.tsx`

---

## No Violations

The following files are compliant:

- `src/modules/ProductPage/adapter.ts` (data layer, no UI)
- `src/hooks/use-video-detail-feed.ts` (custom hook, no UI)
- `src/modules/DetailSearchPage/components/VideoGrid.tsx` (uses Icons correctly)
- `src/modules/HomePage/components/SearchBox.tsx` (uses Input correctly)

---

## Notes

- **Available shared button variants**: primary, secondary, ghost, icon, glass, glassLight, overlay, transparent
- **Available shared icons**: All from `src/assets/icons.tsx` should be used as `Icons.*` rather than lucide-react direct imports
- **Input component**: Already in use correctly in SearchBox.tsx; has support for `prefix`, `suffix`, `size`, `fullWidth`
- **Table components**: `Table`, `TableRow`, `TableHead`, `TableBody`, `TableCell` are already being used correctly in ProductTable.tsx
