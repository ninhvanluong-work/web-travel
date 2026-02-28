# Spec: Video Feed & TikTok-style Detail Page

**Ngày tạo:** 2026-02-28  
**Trạng thái:** Approved — sẵn sàng implement

---

## Tổng quan

Xây dựng luồng hoàn chỉnh:

- Grid video autoplay tại `DetailSearchPage`
- Click video → mở Detail Page kiểu TikTok (fullscreen, cuộn dọc, Like)

---

## Tài nguyên tái sử dụng

| Tài nguyên                        | Vị trí              | Dùng cho                        |
| --------------------------------- | ------------------- | ------------------------------- |
| `useInView` hook                  | `@/hooks/useInview` | Autoplay khi video vào viewport |
| `Icons.volume2` / `Icons.volumeX` | `@/assets/icons`    | Nút mute/unmute                 |
| `Icons.chevronLeft`               | `@/assets/icons`    | Nút Back                        |
| `Icons.play` / `Icons.playSolid`  | `@/assets/icons`    | Nút Play/Pause                  |
| Mute pattern                      | `VideoCard.tsx`     | `useState(true)` cho muted      |
| Autoplay pattern                  | `VideoGrid.tsx`     | threshold 0.5                   |

---

## Thay đổi cần thực hiện

### 1. `src/api/video/types.ts`

- Thêm field `likeCount: number` vào `IVideo`

### 2. `src/api/video/requests.ts`

- Thêm `likeCount` (100–9999) vào 18 fake videos

### 3. `src/modules/DetailSearchPage/components/VideoGrid.tsx`

- Click card → `router.push('/video/:id?ids=id1,id2,...')` truyền thứ tự search result

### 4. `src/modules/VideoDetailPage/index.tsx` _(rebuild hoàn toàn)_

**Layout:**

```
[Container: h-dvh, overflow-hidden, bg-black]
  ├── [Back button — top-left, dùng Icons.chevronLeft]
  └── [Scroll container: snap-y snap-mandatory]
        └── videos.map → VideoSlide (h-dvh, snap-start)
              ├── <video> autoplay via useInView
              ├── [Overlay bottom-left]: title, description
              └── [Action bar bottom-right]:
                    ├── Like button (heart SVG) + count
                    └── Mute button (Icons.volume2 / Icons.volumeX)
```

**Key behaviour:**
| Feature | Cơ chế |
|---|---|
| Autoplay | `useInView` (threshold 0.8) |
| Cuộn | CSS `scroll-snap-type: y mandatory` |
| Like | Local `useState` — toggle, không gọi API |
| URL sync | `router.replace(..., { shallow: true })` |
| Khởi đầu | `scrollIntoView()` đến đúng video từ URL `id` |

---

## Verification

| #   | Test                | Pass condition                       |
| --- | ------------------- | ------------------------------------ |
| 1   | Grid autoplay       | Video play/pause theo viewport       |
| 2   | Click card → Detail | Đúng video, không phải đầu danh sách |
| 3   | Scroll TikTok       | Fullscreen per video, URL cập nhật   |
| 4   | Like toggle         | Tăng/giảm khi click                  |
| 5   | Mute toggle         | Icon đổi `volume2` ↔ `volumeX`       |
| 6   | Back button         | Quay lại search page                 |
