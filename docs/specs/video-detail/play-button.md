---
title: 'Nút Play Overlay (Autoplay Policy Handling)'
created: '2026-03-05'
status: 'implemented'
domain: 'video-core'
---

# Spec: Nút Play Overlay (Autoplay Policy Handling)

## 1. Mục tiêu (Objective)

Cải thiện UX khi trình duyệt chặn autoplay video trên màn hình chi tiết video (khi user truy cập trực tiếp link hoặc reload trang).
Khi autoplay bị chặn, hiển thị overlay + nút Play để user chủ động phát video.

## 2. Phạm vi (Scope)

- **Files thay đổi:** `VideoSlide` (`src/modules/VideoDetailPage/components/video-slide.tsx`) và `VideoDetailPage` (`src/modules/VideoDetailPage/index.tsx`).
- **Trigger:** `play()` trả về Promise bị reject với `NotAllowedError` — chỉ xảy ra khi chưa có user gesture (lần đầu vào link / reload).
- **Không trigger:** Sau khi user đã bấm play một lần, mọi slide tiếp theo browser tự cấp quyền autoplay.

## 3. Thiết kế kỹ thuật

### 3.1. Giao diện (UI)

- **Overlay:** `bg-black/40 absolute inset-0` phủ toàn video.
- **Nút Play:** `Icons.playSolid`, kích thước `w-[60px] h-[60px]`, màu trắng, `drop-shadow`, `animate-pulse` khi idle.
- **Ẩn:** `transition-opacity duration-300 opacity-0` khi play thành công.

### 3.2. Hành vi khi bấm nút Play overlay

1. `setMuted(false)` — **vô điều kiện**, luôn bật loa vì đây là user gesture trực tiếp.
2. Gọi `videoEl.play()`.
3. Thành công → ẩn overlay.
4. Thất bại → `.catch(() => {})` im lặng — **không** hiện lại overlay vì sau user gesture browser không bao giờ throw `NotAllowedError`; lỗi còn lại chỉ là `AbortError` (scroll nhanh) hoặc network error — cả hai đều không cần phản hồi UI.

### 3.3. Scroll Lock — Chưa bấm Play thì không lướt được

| Trạng thái                               | Scroll                         |
| ---------------------------------------- | ------------------------------ |
| Overlay đang hiển thị (autoplay bị chặn) | ❌ Khóa                        |
| Đã bấm Play, video đang chạy             | ✅ Mở                          |
| Các video tiếp theo (user đã có gesture) | ✅ Autoplay + có tiếng tự động |

**Lý do:** Nếu user lướt sang video 2 trước khi bấm play → video 2 cũng bị block → cả feed đứng cụm. Buộc bấm play video đầu đảm bảo browser cấp quyền gesture cho toàn session.

**Cơ chế:**

- `VideoSlide` nhận prop `onBlockedChange?: (isBlocked: boolean) => void`.
- `VideoDetailPage` truyền `onBlockedChange={setScrollLocked}` cho **tất cả** slides (không filter theo index — vì user có thể reload ở bất kỳ video nào trong feed).
- `VideoDetailPage` toggle `overflow-hidden` trên scroll container khi `scrollLocked = true`.

> `overflow-hidden` override `overflow-y-scroll` → đủ để khóa scroll mà không cần `pointer-events: none` (click vẫn hoạt động).

### 3.4. Luồng hoàn chỉnh khi Reload

```
Reload trang
    ↓
VideoSlide mount → isInView = true → videoEl.play() → NotAllowedError
    ↓
setShowPlayOverlay(true) → onBlockedChange(true)
    ↓
[VideoDetailPage] scrollLocked = true → overflow-hidden (không lướt được)
    ↓
User bấm nút Play overlay
    ↓
setMuted(false) + videoEl.play() thành công → setShowPlayOverlay(false) → onBlockedChange(false)
    ↓
[VideoDetailPage] scrollLocked = false → scroll mở
    ↓
User lướt sang video 2 → browser autoplay + unmute (đã có gesture) → không có overlay
```

## 4. Quyết định thiết kế

| Điểm                                  | Quyết định                             | Lý do                                                                     |
| ------------------------------------- | -------------------------------------- | ------------------------------------------------------------------------- |
| Icon                                  | `Icons.playSolid`                      | Rõ nhất trên nền tối                                                      |
| Overlay style                         | `bg-black/40`                          | Đơn giản, hiệu năng tốt                                                   |
| Unmute khi bấm overlay                | Vô điều kiện `setMuted(false)`         | User gesture trực tiếp → luôn bật loa                                     |
| `setMuted` trong autoplay bình thường | Trong `.then()` của `play()`           | Tránh unmute khi play đang bị block                                       |
| Animation ẩn overlay                  | `transition-opacity duration-300`      | Mượt, không distract                                                      |
| Reset overlay khi scroll out          | Trước khi gọi `onBlockedChange(false)` | Tránh parent unlock scroll khi overlay vẫn còn render                     |
| `handleForcePlay` catch               | `.catch(() => {})` im lặng             | Sau gesture không có `NotAllowedError`; lỗi còn lại không cần UI phản hồi |
| `onBlockedChange` scope               | Tất cả slides                          | User có thể reload ở bất kỳ index nào                                     |
| Scroll lock cơ chế                    | `overflow-hidden` trên parent          | Tối giản, không ảnh hưởng click events                                    |

## 5. Cấu trúc Component (Pseudocode)

```tsx
// ── VideoSlide ──────────────────────────────────────────────
interface Props {
  video: IVideo;
  onVisible: (slug: string) => void;
  initialMuted?: boolean;
  autoUnmute?: boolean;
  preloadMode?: 'auto' | 'metadata' | 'none';
  onBlockedChange?: (isBlocked: boolean) => void; // NEW
}

const [showPlayOverlay, setShowPlayOverlay] = useState(false); // NEW

useEffect(() => {
  if (isInView && videoEl) {
    videoEl
      .play()
      .then(() => {
        if (autoUnmute) setMuted(false); // unmute CHỈ khi play thành công
      })
      .catch((error) => {
        if (error.name === 'NotAllowedError') {
          setShowPlayOverlay(true);
          onBlockedChange?.(true);
        }
      });
    onVisibleRef.current(video.slug);
  } else {
    videoEl?.pause();
    setShowPlayOverlay(false); // reset trước
    onBlockedChange?.(false); // rồi mới unlock scroll
  }
}, [isInView, videoEl, video.slug, autoUnmute]);

const handleForcePlay = () => {
  setMuted(false); // luôn bật loa
  setShowPlayOverlay(false);
  onBlockedChange?.(false);
  videoEl?.play().catch(() => {}); // im lặng — không hiện lại overlay
};
```

```tsx
// ── VideoDetailPage ─────────────────────────────────────────
const [scrollLocked, setScrollLocked] = useState(false); // NEW

// scroll container
<div className={`h-dvh overflow-y-scroll snap-y snap-mandatory scrollbar-hide overscroll-none ${
  scrollLocked ? 'overflow-hidden' : ''
}`}>

// tất cả slides đều nhận callback
<VideoSlide
  onBlockedChange={setScrollLocked}
  // ...existing props
/>
```
