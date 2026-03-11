# Phase 02 — localStorage Hook: `useLikedVideos`

## Context Links

- Parent plan: [plan.md](./plan.md)
- Spec: `docs/spec-video-like-dislike.md` §2
- New file: `src/hooks/useLikedVideos.ts`
- SSR reference: `src/hooks/use-mounted.ts`
- Store reference: `src/stores/UserStore.ts`

## Overview

- **Date**: 2026-03-11
- **Description**: Hook quản lý `Set<string>` video IDs đã like trong `localStorage`
- **Priority**: High (blocker cho Phase 03)
- **Implementation status**: Pending
- **Review status**: Pending

## Key Insights

- App ẩn danh → BE không trả `isLiked` per user → FE tự persist bằng localStorage
- SSR guard cần thiết: Next.js server render không có `window.localStorage`
- `useState` với Set → React re-render khi toggle → UI đồng bộ ngay
- Không cần Zustand — data quá đơn giản (chỉ array of UUIDs)
- `src/hooks/index.ts` không tồn tại → import trực tiếp bằng path

## Requirements

1. `localStorage` key: `"likedVideoIds"` (JSON array of UUID strings)
2. `isLiked(id: string): boolean` — query thuần, không side effect
3. `toggleLike(id: string): void` — add/remove ID, persist, trigger re-render
4. SSR guard: `typeof window === 'undefined'` → `isLiked` trả `false`, `toggleLike` no-op
5. Không thêm package mới

## Architecture

```
useLikedVideos()
  ├── state: Set<string>          ← init từ localStorage khi mount
  ├── isLiked(id) → boolean
  └── toggleLike(id) → void
        ├── mutate Set (add/remove)
        ├── writeToStorage(next)
        └── setState(next)        ← trigger re-render
```

## Related Code Files

- `src/hooks/useLikedVideos.ts` — CREATE (new file)
- `src/hooks/use-mounted.ts` — SSR pattern reference
- `src/stores/UserStore.ts` — localStorage pattern reference

## Implementation Steps

1. Tạo file mới: `src/hooks/useLikedVideos.ts`
2. Không cần cập nhật barrel export (không có `src/hooks/index.ts`)

## Full Code — `src/hooks/useLikedVideos.ts`

```typescript
import { useCallback, useState } from 'react';

const STORAGE_KEY = 'likedVideoIds';

function readFromStorage(): Set<string> {
  if (typeof window === 'undefined') return new Set();
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return new Set();
    const parsed = JSON.parse(raw) as unknown;
    if (!Array.isArray(parsed)) return new Set();
    return new Set(parsed as string[]);
  } catch {
    return new Set();
  }
}

function writeToStorage(ids: Set<string>): void {
  if (typeof window === 'undefined') return;
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(Array.from(ids)));
  } catch {
    // localStorage full hoặc unavailable — silently fail
  }
}

export function useLikedVideos() {
  const [likedIds, setLikedIds] = useState<Set<string>>(() => readFromStorage());

  const isLiked = useCallback((id: string): boolean => likedIds.has(id), [likedIds]);

  const toggleLike = useCallback((id: string): void => {
    setLikedIds((prev) => {
      const next = new Set(prev);
      if (next.has(id)) {
        next.delete(id);
      } else {
        next.add(id);
      }
      writeToStorage(next);
      return next;
    });
  }, []);

  return { isLiked, toggleLike };
}
```

## Todo List

- [ ] Tạo `src/hooks/useLikedVideos.ts`
- [ ] `pnpm check-types` → 0 errors
- [ ] Manual test: DevTools > Application > localStorage → `likedVideoIds` update đúng khi toggle
- [ ] `pnpm build` → không có "localStorage is not defined" server-side error

## Success Criteria

- `import { useLikedVideos } from '@/hooks/useLikedVideos'` resolves không có TS error
- Toggle 2 lần → state về original (idempotent)
- Sau page refresh → video đã like vẫn hiển thị liked state
- `pnpm build` pass không có SSR error

## Risk Assessment

- **Low** — File mới hoàn toàn, không động đến code cũ
- localStorage quota đầy: silently catch → UI đúng nhưng không persist. Chấp nhận được
- Multi-tab: mỗi tab init Set riêng từ localStorage lúc mount. Cross-tab sync out of scope

## Security Considerations

- Chỉ lưu video UUID (không nhạy cảm). Không có PII, không có token
- `JSON.parse` wrapped trong try/catch — xử lý localStorage bị corrupt an toàn

## Next Steps

→ Phase 03: Tích hợp vào `video-slide.tsx`
