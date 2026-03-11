# Plan: Video Like/Dislike Feature

## Summary

Integrate `POST /video/{id}/like` và `POST /video/{id}/dislike` vào `VideoSlide`.
Sử dụng Optimistic UI (instant feedback), debounce 500ms (native `useRef` — không thêm dependency),
localStorage để persist like-state cho anonymous user, rollback state khi API lỗi.

## Phases

| #   | Phase                  | File(s) Touched                                          | Status  |
| --- | ---------------------- | -------------------------------------------------------- | ------- |
| 1   | API layer              | `src/api/video/requests.ts`, `src/api/video/index.ts`    | pending |
| 2   | localStorage hook      | `src/hooks/useLikedVideos.ts` (NEW)                      | pending |
| 3   | VideoSlide integration | `src/modules/VideoDetailPage/components/video-slide.tsx` | pending |

## Phase Files

- [phase-01-api-layer.md](./phase-01-api-layer.md)
- [phase-02-localstorage-hook.md](./phase-02-localstorage-hook.md)
- [phase-03-video-slide-integration.md](./phase-03-video-slide-integration.md)

## Key Decisions

| Decision         | Chosen                      | Lý do                                       |
| ---------------- | --------------------------- | ------------------------------------------- |
| API param        | `video.id` (UUID)           | Spec nói `{id}`, khác với GET dùng slug     |
| Debounce         | native `useRef<setTimeout>` | `use-debounce` chưa cài; tránh thêm dep     |
| Rollback count   | `serverLikeCountRef`        | Spec dùng `video.likeCount` (stale) — buggy |
| Like persistence | `localStorage`              | App ẩn danh, BE không track user            |
| Format count     | `toLocaleString()`          | Spec yêu cầu bỏ K suffix                    |

## Resolved Ambiguities

1. **`id` vs `slug`**: Dùng `video.id` (UUID) cho like/dislike — không phải `slug`
2. **Debounce lib**: Native `setTimeout`/`clearTimeout` — zero new deps
3. **Rollback bug trong spec**: Dùng `serverLikeCountRef` thay vì `video.likeCount` (initial prop)
4. **`formatCount`**: Xóa, thay bằng `likeCount.toLocaleString()`
5. **SSR guard**: `typeof window === 'undefined'` trong hook
