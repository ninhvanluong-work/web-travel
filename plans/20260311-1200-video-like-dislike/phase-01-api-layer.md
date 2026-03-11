# Phase 01 — API Layer

## Context Links

- Parent plan: [plan.md](./plan.md)
- Spec: `docs/spec-video-like-dislike.md` §1
- File to edit: `src/api/video/requests.ts`
- Barrel export: `src/api/video/index.ts` (verify only — already `export * from './requests'`)
- Axios instance: `src/api/axios.ts` (reference only)

## Overview

- **Date**: 2026-03-11
- **Description**: Thêm 2 hàm POST vào `requests.ts` — `likeVideo(id)` và `dislikeVideo(id)`
- **Priority**: High (blocker cho Phase 03)
- **Implementation status**: Pending
- **Review status**: Pending

## Key Insights

- Tất cả request hiện tại dùng pattern: `request<ResponseType>({ url, method, params? })`
- Response `{ data: null, code: 200 }` — không có domain data → return type là `void`
- Errors bubble tự nhiên lên caller để xử lý rollback
- `index.ts` đã có `export * from './requests'` → không cần chỉnh

## Requirements

1. `likeVideo(id: string): Promise<void>` — POST `/video/{id}/like`
2. `dislikeVideo(id: string): Promise<void>` — POST `/video/{id}/dislike`
3. Cả hai phải throw on error để caller rollback UI
4. Không thêm package mới

## Architecture

```
VideoSlide.syncLikeToServer(targetState)   [debounced]
  ├── likeVideo(video.id)    → requests.ts
  └── dislikeVideo(video.id) → requests.ts
        └── request({ url, method: 'POST' })  → axios.ts
```

## Related Code Files

- `src/api/video/requests.ts` — append 2 functions tại cuối file
- `src/api/video/index.ts` — verify only, không edit
- `src/api/axios.ts` — reference only

## Implementation Steps

1. Mở `src/api/video/requests.ts`
2. Append đoạn code dưới vào cuối file (sau `getVideoBySlug`)
3. Verify `src/api/video/index.ts` có `export * from './requests'` → không cần edit

## Code Snippet — Append to `src/api/video/requests.ts`

```typescript
// ---------- Like / Dislike ----------

export const likeVideo = async (id: string): Promise<void> => {
  await request({ url: `/video/${id}/like`, method: 'POST' });
};

export const dislikeVideo = async (id: string): Promise<void> => {
  await request({ url: `/video/${id}/dislike`, method: 'POST' });
};
```

## Todo List

- [ ] Append `likeVideo` vào `requests.ts`
- [ ] Append `dislikeVideo` vào `requests.ts`
- [ ] `pnpm check-types` → 0 errors
- [ ] `pnpm lint` → 0 errors

## Success Criteria

- `import { likeVideo, dislikeVideo } from '@/api/video'` resolves không có TS error
- Return type là `Promise<void>`
- Không 404 runtime — base URL không có trailing slash (đã verify từ existing endpoints)

## Risk Assessment

- **Low** — Pure addition, không sửa code cũ
- Nếu `NEXT_PUBLIC_API_URL` có trailing slash sẽ double-slash → check env, existing endpoints OK

## Security Considerations

- Anonymous POST — không có PII hay token trong request body
- Axios interceptor attach Bearer token chỉ khi UserStore có token → anonymous user: no header

## Next Steps

→ Phase 02: Tạo `useLikedVideos` hook
