# Plan: Admin Product List UI Redesign (TailAdmin Style)

**Date:** 2026-04-12 | **Priority:** Medium | **Status:** In Progress

## Objective

Redesign Admin Product List page to fully match TailAdmin Products List UI:

- Single-row toolbar (search + Export + Filter + Add)
- Collapsible filter panel (hidden by default)
- Table with checkbox, thumbnail, sort icons, simplified status badge, "..." only actions
- Keep stat cards at top

## Phases

| #   | Phase                                                                                    | Status     |
| --- | ---------------------------------------------------------------------------------------- | ---------- |
| 1   | [Toolbar: collapse filter bar into single row with Filter toggle](./phase-01-toolbar.md) | 🔄 Pending |
| 2   | [Filter Panel: collapsible panel toggled by Filter button](./phase-02-filter-panel.md)   | 🔄 Pending |
| 3   | [Table: checkbox + thumbnail + sort icons + simplified status](./phase-03-table.md)      | 🔄 Pending |
| 4   | [Row actions: merge pencil into "..." menu](./phase-04-row-actions.md)                   | 🔄 Pending |
| 5   | [Type check + lint](./phase-05-type-check.md)                                            | 🔄 Pending |

## Files Changed

- `src/modules/AdminProduct/ProductListPage/index.tsx`
- `src/modules/AdminProduct/ProductListPage/components/ProductFilterBar.tsx`
- `src/modules/AdminProduct/ProductListPage/components/ProductTable.tsx`
- `src/modules/AdminProduct/ProductListPage/components/ProductTableRow.tsx`
