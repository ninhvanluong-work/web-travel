# Plan: Admin Product Management

**Date:** 2026-03-30 | **Priority:** High | **Status:** In Progress

## Phases

| #   | Phase                                              | Status  | File                                  |
| --- | -------------------------------------------------- | ------- | ------------------------------------- |
| 1   | Shared foundations (validations, routes, layout)   | ✅ Done | [phase-01](./phase-01-foundations.md) |
| 2   | ProductListPage (list, table, filters, pagination) | ✅ Done | [phase-02](./phase-02-list-page.md)   |
| 3   | ProductFormPage (form, tabs, sidebar)              | ✅ Done | [phase-03](./phase-03-form-page.md)   |
| 4   | Pages + type-check                                 | ✅ Done | [phase-04](./phase-04-pages.md)       |

## Key Decisions

- localStorage for data (no backend API)
- Status: `draft | published | hidden`
- Images: `{ url: string }[]` in RHF, mapped to `string[]` on submit
- Options/Itineraries: stored inside ProductRow in localStorage
- Slug: auto-gen from name on Create only, not Edit
- slugify: custom Vietnamese-aware function (NFD normalize + diacritic strip)
- Admin pages opt-out of phone-frame via `Component.getLayout`
