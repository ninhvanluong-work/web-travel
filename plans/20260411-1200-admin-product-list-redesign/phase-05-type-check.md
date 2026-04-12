# Phase 05 — Type Check + Lint

[← plan.md](./plan.md)

## Overview

- **Date:** 2026-04-12
- **Priority:** Low
- **Status:** Pending

## Steps

1. Run `pnpm check-types` — fix any TS errors introduced (prop interface changes in FilterBar/Table/Row)
2. Run `lint-changed.bat` — auto-fix ESLint/Prettier on changed files
3. Verify no runtime console errors in dev

## Key type changes to verify

- `ProductFilterBar` props: `keyword` + `onKeywordChange` removed — ensure no call sites still pass them
- `ProductTable` props: new `selectedIds`, `onToggle`, `onToggleAll` added — all optional with defaults if desired
- `ProductTableRow` props: new `selected`, `onToggle` — mark optional if bulk-select is optional feature

## Risk

- Low — straightforward interface updates
