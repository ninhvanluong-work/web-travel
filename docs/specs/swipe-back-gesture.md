# Spec: Swipe Back Gesture từ Giữa Màn Hình

**Date:** 2026-04-06
**Module:** `src/modules/VideoDetailPage/index.tsx`
**Status:** Ready to implement

---

## Vấn đề

Hiện tại, gesture vuốt trái để back chỉ hoạt động khi bắt đầu từ **viền màn hình** (browser native edge swipe). User không thể vuốt từ giữa màn hình để quay lại.

---

## Giải pháp

Kết hợp 3 kỹ thuật:

| Layer     | Kỹ thuật              | Mục đích                                                                  |
| --------- | --------------------- | ------------------------------------------------------------------------- |
| CSS       | `touch-action: pan-y` | Browser tự tách gesture dọc/ngang — không cần tự viết conflict resolution |
| JS        | Velocity threshold    | Detect swipe ngang từ bất kỳ điểm nào trên màn hình                       |
| Animation | Rubber band + snap    | Visual feedback tức thì, cảm giác native                                  |

---

## Behavior

### Khi user swipe trái từ bất kỳ đâu:

1. Ngón tay chạm màn hình (`pointerdown`) → bắt đầu track
2. Khi di chuyển (`pointermove`):
   - Nếu `deltaX > deltaY * 2` (rõ ràng là ngang hơn dọc) → bắt đầu kéo màn hình theo (`translateX`)
   - Màn hình slide sang trái theo ngón tay, có hiệu ứng rubber band nhẹ
3. Khi thả ngón (`pointerup`):
   - Nếu đã kéo qua **30% chiều rộng màn hình** → `router.back()`
   - Nếu chưa đủ ngưỡng → animate snap back về vị trí cũ

### Không trigger khi:

- `deltaY > deltaX` (gesture chủ yếu là dọc → scroll video)
- Swipe sang **trái** (không phải back gesture)
- `gated === true` (màn hình đang bị lock do reload gate)

---

## Implementation Plan

### Bước 1 — CSS

Thêm `touch-action: pan-y` vào scroll container trong `VideoDetailPage`:

```tsx
<div
  className={`h-dvh snap-y snap-mandatory scrollbar-hide overscroll-none ${
    gated ? 'overflow-hidden' : 'overflow-y-scroll'
  }`}
  style={{ touchAction: 'pan-y' }}   // add this
>
```

### Bước 2 — Hook mới

Tạo `src/hooks/use-swipe-back.ts`:

```ts
import { useRef } from 'react';
import { useRouter } from 'next/router';

interface Options {
  disabled?: boolean;
  threshold?: number; // fraction of screen width, default 0.3
  velocityMin?: number; // px/ms, default 0.3
}

export function useSwipeBack({ disabled = false, threshold = 0.3, velocityMin = 0.3 }: Options = {}) {
  const router = useRouter();
  const startX = useRef(0);
  const startY = useRef(0);
  const startTime = useRef(0);
  const dragging = useRef(false);
  const containerRef = useRef<HTMLDivElement>(null);

  const onPointerDown = (e: React.PointerEvent) => {
    if (disabled) return;
    startX.current = e.clientX;
    startY.current = e.clientY;
    startTime.current = Date.now();
    dragging.current = false;
  };

  const onPointerMove = (e: React.PointerEvent) => {
    if (disabled) return;
    const deltaX = e.clientX - startX.current; // positive = swiping right
    const deltaY = Math.abs(e.clientY - startY.current);

    // Only handle clear horizontal left swipe
    if (deltaX <= 0) return;
    if (deltaY > deltaX) return; // vertical gesture, ignore

    dragging.current = true;

    // Rubber band: follow finger
    if (containerRef.current) {
      containerRef.current.style.transform = `translateX(${-deltaX}px)`;
      containerRef.current.style.transition = 'none';
    }
  };

  const onPointerUp = (e: React.PointerEvent) => {
    if (disabled || !dragging.current) return;
    dragging.current = false;

    const deltaX = startX.current - e.clientX;
    const elapsed = Date.now() - startTime.current;
    const velocity = deltaX / elapsed;
    const screenWidth = window.innerWidth;
    const passedThreshold = deltaX / screenWidth >= threshold;
    const fastEnough = velocity >= velocityMin;

    if (passedThreshold || fastEnough) {
      router.back();
    } else {
      // Snap back to original position
      if (containerRef.current) {
        containerRef.current.style.transition = 'transform 0.25s ease-out';
        containerRef.current.style.transform = 'translateX(0)';
      }
    }
  };

  return { containerRef, onPointerDown, onPointerMove, onPointerUp };
}
```

### Bước 3 — Dùng hook trong VideoDetailPage

```tsx
const { containerRef, onPointerDown, onPointerMove, onPointerUp } = useSwipeBack({
  disabled: gated,
});

// Wrap return in a div that receives pointer events:
return (
  <div
    ref={containerRef}
    className="relative h-dvh overflow-hidden bg-black"
    onPointerDown={onPointerDown}
    onPointerMove={onPointerMove}
    onPointerUp={onPointerUp}
  >
    {/* ... existing content unchanged ... */}
  </div>
);
```

> **Lưu ý:** Chỉ thêm props vào div wrapper ngoài cùng. Không sửa bất kỳ logic nào bên trong.

---

## Edge Cases

| Tình huống               | Xử lý                                                                    |
| ------------------------ | ------------------------------------------------------------------------ |
| `gated === true`         | `disabled` truyền vào hook → không track gesture                         |
| Swipe nhanh (flick)      | `velocity >= velocityMin` → back dù chưa qua 30%                         |
| Swipe chậm, ngắn         | Cả 2 điều kiện đều fail → snap back                                      |
| Gesture dọc bị nhận nhầm | `deltaY > deltaX` check → bỏ qua ngay từ đầu                             |
| Multi-touch              | Chỉ track pointer đầu tiên (pointerdown/up match theo pointerId nếu cần) |

---

## Không thay đổi

- Logic `gated` / `forcePause` / reload gate giữ nguyên hoàn toàn
- `IntersectionObserver` trong VideoSlide không bị ảnh hưởng
- Snap-scroll dọc vẫn hoạt động bình thường (`touch-action: pan-y`)
- Back button (chevronLeft) vẫn giữ nguyên

---

## Files sẽ thay đổi

| File                                    | Thay đổi                                        |
| --------------------------------------- | ----------------------------------------------- |
| `src/hooks/use-swipe-back.ts`           | Tạo mới                                         |
| `src/modules/VideoDetailPage/index.tsx` | Thêm hook + `touch-action: pan-y` vào container |
