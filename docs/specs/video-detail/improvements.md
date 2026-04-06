---
title: 'VideoDetailPage — Auto Audio Scroll + Text Layout + Like Count Fix'
created: '2026-03-08'
status: 'implemented'
domain: 'video-core'
supersedes: 'auto-unmute-old.md'
---

# Spec: VideoDetailPage — Auto Audio Scroll + Text Layout + Like Count Fix

## Tổng quan

3 vấn đề cần giải quyết trong `VideoDetailPage` / `video-slide.tsx`:

1. **Auto-audio khi scroll** — khi cuộn sang video tiếp theo, muốn âm thanh tự bật theo (thay vì mute mặc định)
2. **Layout text** — redesign phần text bottom-left theo phong cách hình tham khảo
3. **Like count "undefined"** — API đôi khi trả `like: null` → crash `formatCount`

---

## 1. Auto-Audio Khi Scroll

### Vấn đề hiện tại

- Video đầu tiên (video được mở) có `initialMuted={false}` (do `video.id === id`)
- Các video tiếp theo có `initialMuted={true}` → khi scroll xuống, video tiếp theo **mute bởi default**
- Không có cơ chế tự bật âm thanh khi scroll

### Thảo luận: Nên auto-unmute khi scroll không?

**Option A — Auto-unmute theo video đang visible (như TikTok)**

- Khi video trở thành video "in view" → tự unmute
- Cần quản lý trạng thái `muted` từ parent (`VideoDetailPage`) thay vì local state trong `VideoSlide`
- Ưu điểm: UX mượt, nhất quán
- Nhược điểm: User mất control nếu họ chủ động mute

**Option B — Nhớ preference của user: nếu đang unmuted thì scroll xuống cũng unmuted**

- Lưu `globalMuted` state ở `VideoDetailPage`, truyền xuống từng slide
- Khi user tắt loa → `globalMuted = true`, giữ cho tất cả slide tiếp theo
- Khi user mở loa → `globalMuted = false`, giữ cho tất cả slide tiếp theo
- Ưu điểm: tôn trọng ý muốn user, đơn giản triển khai
- **→ Đề xuất Option B**

### Implementation Option B

```
VideoDetailPage
  └─ globalMuted: boolean (state, default: true — user chưa bật loa)
     ├─ truyền xuống mỗi VideoSlide: muted={globalMuted}
     └─ VideoSlide gọi onMuteChange(muted) khi user bấm nút loa
        → cập nhật globalMuted tại parent
```

**Files thay đổi:**

- `VideoDetailPage/index.tsx` — thêm `globalMuted` state
- `video-slide.tsx` — bỏ local `muted` state, nhận `muted` + `onMuteChange` từ props

---

## 2. Layout Text — Theo Hình Tham Khảo

### Hình tham khảo phân tích

```
┌─────────────────────────────────────┬──────┐
│                                     │  👍  │
│                                     │      │
│                                     │  ↑   │
│                                     │      │
│                                     │  🔊  │
├─────────────────────────────────────┴──────┤
│ 14-Day Magical Vietnam Super Sav...        │
│ View tour  →                               │
│ This & No Internet  See more               │
└────────────────────────────────────────────┘
```

### Layout hiện tại vs đề xuất

|             | Hiện tại                   | Đề xuất                                              |
| ----------- | -------------------------- | ---------------------------------------------------- |
| Title       | `font-bold text-[18px]`    | Giữ nguyên, nhưng `line-clamp-1` (1 dòng, dấu `...`) |
| CTA         | Không có                   | Thêm **"Xem tour →"** (link hoặc button nhỏ)         |
| Description | `text-[13px] line-clamp-3` | Rút về **1 dòng** + nút **"Xem thêm"** expand inline |

### Câu hỏi thảo luận

- **"Xem tour →"** link đến đâu? URL ngoài? Trang chi tiết tour? → Cần biết để implement
- **"Xem thêm"** expand: toggle trong slide (không navigate) hay mở popup/sheet?
- Description hiện tại trong API là plain text hay có format gì không?

### Implementation đề xuất (nếu đồng ý)

```tsx
{
  /* Info overlay */
}
<div className="absolute bottom-0 left-0 right-[72px] px-[18px] ...">
  {/* Title — 1 dòng */}
  <h2 className="text-white font-bold text-[16px] line-clamp-1">{video.title}</h2>

  {/* CTA — "Xem tour →" */}
  <button className="text-white font-bold text-[14px] mt-[4px]">
    Xem tour <span>→</span>
  </button>

  {/* Description + See more */}
  <p className="text-white/70 text-[12px] mt-[4px] line-clamp-1">
    {video.description}
    <button className="text-white font-bold ml-1">Xem thêm</button>
  </p>
</div>;
```

---

## 3. Like Count "undefined"

### Root cause

`formatCount(likeCount)` nhận `NaN` hoặc `undefined` khi API trả `like: null`.

Mapper trong `requests.ts`:

```ts
likeCount: item.like; // item.like có thể là null
```

### Fix

**Cách 1 — Fix tại mapper** (an toàn nhất):

```ts
likeCount: item.like ?? 0; // null → 0
```

**Cách 2 — Fake count tạm thời** (vì API chưa có data thật):

```ts
likeCount: item.like ?? Math.floor(Math.random() * 900 + 100); // random 100–999
```

**Cách 3 — Ẩn hẳn số like** khi không có data:

```tsx
{
  likeCount != null && <span>{formatCount(likeCount)}</span>;
}
```

> **→ Đề xuất: Cách 1 (fix mapper `?? 0`) + Cách 2 cho visual demo** — seed random bằng `video.id` để stable (không thay đổi mỗi re-render).

**Fake stable với seed:**

```ts
const fakeLike = (id: string) => {
  let hash = 0;
  for (const c of id) hash = (hash * 31 + c.charCodeAt(0)) & 0xffff;
  return 100 + (hash % 900); // 100–999
};

likeCount: item.like ?? fakeLike(item.id);
```

---

## Checklist

- [ ] **Auto-audio**: Thống nhất Option A hay B
- [ ] **Text layout**: Xác nhận "Xem tour →" link đến đâu + "Xem thêm" behavior
- [ ] **Like count**: Thống nhất fake strategy (random seed hay show 0)
