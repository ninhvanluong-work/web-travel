# Plan: Banner Drag & Drop + Tus Video Upload

**Date:** 2026-05-21  
**Spec:** `docs/spec-admin-product-form-video.md`  
**Target:** `src/modules/AdminProduct/ProductFormPage/components/sections/banner-section.tsx`

---

## Scope

1. **Phase 1** — Drag & Drop reordering (Framer Motion `Reorder`) → [phase-01-drag-drop.md](./phase-01-drag-drop.md)
2. **Phase 2** — Direct Tus video upload inside BannerItem → [phase-02-video-upload.md](./phase-02-video-upload.md)
3. **Phase 3** — Auto-save badge — **de-scoped** (see Q3 below)

---

## Ambiguities Resolved

| #   | Issue                                                            | Decision                                                           |
| --- | ---------------------------------------------------------------- | ------------------------------------------------------------------ |
| A   | `type` field: §3.2 says `'product_banner'`, §6.2 says `'normal'` | Use **`'normal'`** — matches TypeScript `'hero' \| 'normal'` union |
| C   | Auth on `/upload/video` fetch                                    | Mirror `VideoUploadCard` pattern (raw `fetch`)                     |
| D   | File types: spec says `video/*`, existing only allows `mp4`      | Banner uses own validator: `mp4 + mov`, 100MB max                  |
| E   | Phase 3 auto-save badge                                          | De-scoped — no spec detail exists                                  |

---

## Files Affected

| File                                                                              | Action | Change                                            |
| --------------------------------------------------------------------------------- | ------ | ------------------------------------------------- |
| `src/modules/AdminProduct/ProductFormPage/components/sections/banner-section.tsx` | modify | Add Reorder DnD + BannerVideoUpload + mode toggle |
| `.env.example`                                                                    | modify | Add `NEXT_PUBLIC_BUNNY_TUS_ENDPOINT`              |

No new files — `BannerVideoUpload` co-located inside `banner-section.tsx`.

---

## Unresolved Questions (BLOCKING)

**Q1 (BLOCKING):** `tag` value for `createVideo` has conflict:

- §3.2 says `tag: 'product'`
- §6.2 says `tag: 'product_banner'`
  → Which is correct?

**Q2 (MINOR):** Should auth token be added to `fetch('/upload/video')` call?  
→ `VideoUploadCard` uses raw fetch without Bearer token — confirm same is OK for banner upload.

**Q3 (DE-SCOPED):** Phase 3 "Auto-save Badge" has zero spec detail.  
→ Confirm skip until spec is written.
