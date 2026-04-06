---
title: 'Dim Effect Khi Bật Âm Thanh Trong VideoGrid'
created: '2026-03-03'
status: 'implemented'
domain: 'video-grid'
---

# Spec: Dim Effect Khi Bật Âm Thanh Trong VideoGrid

## Mô tả tính năng

Khi user bấm nút loa để bật âm thanh cho một video trong `DetailSearchPage`, các video **còn lại** sẽ mờ nhẹ xuống (dim) để làm nổi bật video đang phát âm thanh.

## UI Behavior

| Trạng thái                                       | Card đang active (có âm thanh) | Các card khác             |
| ------------------------------------------------ | ------------------------------ | ------------------------- |
| Không có video nào active                        | `opacity: 1`                   | `opacity: 1`              |
| Một video đang active                            | `opacity: 1` (bình thường)     | `opacity: 0.45` (dim nhẹ) |
| Scroll video active ra ngoài viewport → auto tắt | Tất cả `opacity: 1`            | Tất cả `opacity: 1`       |

**Lưu ý về mức độ mờ:**

- `opacity: 0.45` → đủ để user nhận ra sự "nổi bật" của video active, nhưng vẫn thấy được nội dung các card khác (không mất đi quá nhiều)
- Không nên dùng `opacity < 0.35` → tối quá, mất trải nghiệm

## Animation

- Transition: `opacity` với `duration: 300ms`, `ease: ease-in-out`
- Không cần scale, blur, hay hiệu ứng phức tạp khác — opacity đơn giản là đủ

---

## Implementation

### Thay đổi duy nhất trong `VideoCard.tsx`

Thêm prop `hasActiveAudio` (boolean: có card nào đó đang active — nhưng không phải card này):

**Cách truyền prop từ `VideoGrid`:**

```tsx
// VideoGrid.tsx
<VideoCard
  ...
  isAudioActive={activeAudioId === video.id}
  isDimmed={activeAudioId !== null && activeAudioId !== video.id}
  ...
/>
```

**Áp dụng trong `VideoCard.tsx`:**

```tsx
// Wrapper div của VideoCard
<div
  className={`group relative overflow-hidden bg-black cursor-pointer transition-opacity duration-300 ease-in-out ${
    isDimmed ? 'opacity-45' : 'opacity-100'
  }`}
  onClick={() => onVideoClick(video.id)}
>
```

### Thêm prop vào interface `VideoCard`

```tsx
interface Props {
  video: IVideo;
  isAudioActive: boolean;
  isDimmed: boolean; // 👈 thêm mới
  onRequestAudio: (id: string) => void;
  onAudioDeactivate: (id: string) => void;
  onVideoClick: (id: string) => void;
}
```

---

## Điểm cần lưu ý

- `opacity-45` là Tailwind class (v3.1+), tương đương `opacity: 0.45` — cần kiểm tra version Tailwind đang dùng. Nếu không có, dùng `style={{ opacity: isDimmed ? 0.45 : 1 }}`.
- `React.memo` đang được dùng trong `VideoCard` — khi `isDimmed` thay đổi sẽ trigger re-render đúng cách vì là primitive boolean.
- Không cần store thêm bất kỳ state nào — `activeAudioId` trong `VideoGrid` đã đủ để tính `isDimmed`.

---

## Checklist

- [ ] Thêm prop `isDimmed: boolean` vào interface `VideoCard`
- [ ] Tính `isDimmed` trong `VideoGrid` và truyền xuống
- [ ] Áp dụng class `transition-opacity duration-300 ease-in-out` + opacity conditional vào wrapper div của `VideoCard`
- [ ] Kiểm tra Tailwind có hỗ trợ `opacity-45` không (nếu không thì dùng inline style)
- [ ] Test thủ công: bấm loa → các card khác mờ nhẹ, bấm lại → tất cả về opacity 1
