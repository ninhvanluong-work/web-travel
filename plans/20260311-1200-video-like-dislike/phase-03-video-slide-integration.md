# Phase 03 — VideoSlide Integration

## Context Links

- Parent plan: [plan.md](./plan.md)
- Spec: `docs/spec-video-like-dislike.md` §3, §4
- File to replace: `src/modules/VideoDetailPage/components/video-slide.tsx`
- Depends on: [phase-01](./phase-01-api-layer.md), [phase-02](./phase-02-localstorage-hook.md)

## Overview

- **Date**: 2026-03-11
- **Description**: Thay `toggleLike` stub bằng full optimistic UI + debounce + rollback
- **Priority**: High
- **Implementation status**: Pending
- **Review status**: Pending

## Key Insights

### Bug trong Spec — Rollback likeCount sai

Spec viết:

```tsx
setLikeCount(serverLikedRef.current ? video.likeCount + 1 : video.likeCount);
```

Dùng `video.likeCount` (initial prop) — **stale** sau khi có API call thành công trước đó.

**Fix**: Thêm `serverLikeCountRef = useRef(video.likeCount)` — update sau mỗi API success.

### Debounce Mechanics

```
click 1 (like)    → UI: +1, timer start 500ms
click 2 (dislike) → UI: -1, CANCEL timer, timer start 500ms
click 3 (like)    → UI: +1, CANCEL timer, timer start 500ms
... 500ms silence → API fires với state cuối (like)
```

Guard `if (targetLikedState === serverLikedRef.current) return` → tránh API thừa khi spam về đúng server state.

### localStorage Rollback

`persistLike(video.id)` là pure toggle trong hook. Khi:

- Optimistic: gọi 1 lần → state đúng
- Rollback: gọi lần 2 → state về original

### Cleanup on Unmount

`useEffect` cleanup `clearTimeout(debounceRef.current)` → tránh stale API call sau khi component unmount (user scroll nhanh).

## Requirements

1. `liked` init từ `useLikedVideos.isLiked(video.id)` — không hardcode `false`
2. `toggleLike` sync: optimistic UI + localStorage → async: debounced API
3. Debounce 500ms bằng `useRef<ReturnType<typeof setTimeout> | null>`
4. API success: update `serverLikedRef` + `serverLikeCountRef`
5. API error: rollback `liked`, `likeCount`, localStorage
6. Xóa `formatCount` → dùng `likeCount.toLocaleString()`
7. `clearTimeout` trong useEffect cleanup

## Architecture

```
VideoSlide
  ├── useLikedVideos()           → { isLiked, toggleLike: persistLike }
  ├── useState(liked)            ← init: isLiked(video.id)
  ├── useState(likeCount)        ← init: video.likeCount
  ├── useRef serverLikedRef      ← last server-confirmed liked state
  ├── useRef serverLikeCountRef  ← last server-confirmed likeCount
  ├── useRef debounceRef         ← setTimeout handle
  ├── useEffect (cleanup)        ← clearTimeout on unmount
  └── toggleLike()
        ├── optimistic: setLiked / setLikeCount / setLikeAnimKey
        ├── persistLike(video.id)   ← localStorage sync
        └── syncLikeToServer(newState, newCount)   [debounced 500ms]
              ├── guard: skip if newState === serverLikedRef.current
              ├── await likeVideo / dislikeVideo
              ├── success → serverLikedRef.current = newState
              │            serverLikeCountRef.current = newCount
              └── error  → setLiked(serverLikedRef.current)
                           setLikeCount(serverLikeCountRef.current)
                           persistLike(video.id)   ← revert localStorage
```

## Related Code Files

- `src/modules/VideoDetailPage/components/video-slide.tsx` — full replacement
- `src/api/video/requests.ts` — `likeVideo`, `dislikeVideo` (Phase 01)
- `src/hooks/useLikedVideos.ts` — `useLikedVideos` (Phase 02)

## Implementation Steps

1. Mở `src/modules/VideoDetailPage/components/video-slide.tsx`
2. Thay toàn bộ file bằng code trong [phase-03-video-slide-code.md](./phase-03-video-slide-code.md)
3. `pnpm check-types` → resolve errors nếu có
4. `pnpm lint:fix`

> Full code + rollback scenario table: **[phase-03-video-slide-code.md](./phase-03-video-slide-code.md)**

## Todo List

- [ ] Replace `src/modules/VideoDetailPage/components/video-slide.tsx` với full code trên
- [ ] Verify liked init từ localStorage khi load trang (DevTools > Application > Local Storage)
- [ ] Verify spam click → chỉ 1 network request (DevTools > Network, filter `/like`)
- [ ] Verify rollback: break endpoint URL tạm → UI revert sau error
- [ ] `pnpm check-types` → 0 errors
- [ ] `pnpm lint` → 0 errors
- [ ] `pnpm build` → không có SSR error

## Success Criteria

- Like video → refresh trang → heart vẫn xanh (localStorage persist)
- Spam click 5 lần / 1 giây → đúng 1 network request
- Network error → UI revert về state trước click, localStorage revert
- `likeCount` hiển thị có dấu phẩy (1,234), không có "K"
- TypeScript: 0 errors. ESLint: 0 errors. Build: pass

## Risk Assessment

- **Medium**: Rollback localStorage gọi `persistLike(video.id)` — là pure toggle. Chỉ đúng nếu gọi đúng 1 lần sau optimistic. Verify thủ công với scenario spam + error.
- **Low**: `isLiked(video.id)` gọi 2 lần lúc init (useState + serverLikedRef) — đọc cùng Set snapshot, consistent
- **Low**: `video.id` không bao giờ empty string (typed UUID từ API) — không cần guard

## Security Considerations

- Chỉ UUID được gửi lên API — không có PII
- `setTimeout` callback capture `video.id` by closure — immutable prop, safe
- `console.error` dùng cho dev — production nên thay bằng proper error reporter nếu có

## Next Steps

Sau khi 3 phases pass `pnpm check-types` và `pnpm build`:

1. Manual QA trên iOS Safari (app target mobile)
2. Verify `animate-like-pop` CSS animation trigger đúng với `key` prop change
3. Optional: Toast notification khi API error (nếu project thêm toast library sau)
