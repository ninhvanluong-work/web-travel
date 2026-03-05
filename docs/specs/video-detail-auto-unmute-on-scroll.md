# Spec: Auto-Unmute When Scrolling to Next Video

**Ngày tạo:** 2026-03-05  
**Trạng thái:** Draft — đang thảo luận

---

## Bối cảnh

Hiện tại tại `VideoDetailPage`, mỗi `VideoSlide` nhận prop `initialMuted`:

```tsx
// VideoDetailPage/index.tsx
<VideoSlide
  initialMuted={video.id !== id} // ← chỉ video đầu tiên (từ URL) mới unmuted
/>
```

```tsx
// video-slide.tsx
const [muted, setMuted] = useState(initialMuted);
```

**Vấn đề:** `initialMuted` chỉ được tính một lần khi component mount (do `useState`). Khi người dùng swipe xuống video tiếp theo:

- Video mới vào viewport → `play()` được gọi
- Nhưng `muted` vẫn là `true` (giá trị khởi tạo)
- ⇒ **Video phát nhưng tắt tiếng**, người dùng phải bấm nút loa thủ công

---

## Mục tiêu

> Khi người dùng swipe sang video tiếp theo trong `VideoDetailPage`, video đó phải **phát có tiếng ngay lập tức** — giống hành vi của TikTok / Reels.

---

## Hành vi mong muốn

| Tình huống                                     | Hành vi                                                       |
| ---------------------------------------------- | ------------------------------------------------------------- |
| Mở `VideoDetailPage` lần đầu từ video đang xem | Video hiện tại phát có tiếng (giữ nguyên trạng thái hiện tại) |
| Swipe xuống video tiếp theo                    | Video mới tự động **unmute** và phát có tiếng                 |
| Swipe lên video trước đó                       | Video cũng tự động **unmute** và phát có tiếng                |
| Người dùng bấm nút mute thủ công trong khi xem | Video hiện tại tắt tiếng                                      |
| Swipe sang video khác sau khi đã mute thủ công | Video mới **vẫn unmute** (mute state không được kế thừa)      |

---

## Phân tích kỹ thuật

### Cơ chế hiện tại

```
VideoDetailPage
  └── VideoSlide (initialMuted = video.id !== currentId)
        └── useState(initialMuted)  ← cố định từ lúc mount
```

### Thay đổi cần thiết

Cần một cơ chế để **reset `muted` về `false`** mỗi khi video trở nên visible (vào viewport):

#### Phương án A — Đồng hồ bên ngoài (lift state lên parent) ✅ Đề xuất

- `VideoDetailPage` giữ `activeId` (video đang visible)
- Truyền `isActive: boolean` vào `VideoSlide`
- `VideoSlide` dùng `useEffect([isActive])` → khi `isActive` chuyển `true`: `setMuted(false)`

```tsx
// VideoDetailPage
const [activeId, setActiveId] = useState(id as string);

<VideoSlide isActive={video.id === activeId} onVisible={() => setActiveId(video.id)} />;

// VideoSlide
useEffect(() => {
  if (isActive) setMuted(false);
}, [isActive]);
```

**Ưu điểm:** Rõ ràng, dễ test, không phá vỡ pattern hiện tại  
**Nhược điểm:** Parent cần thêm state

#### Phương án B — Self-managed trong VideoSlide

- Trong `useEffect([isInView])` của `video-slide.tsx`, khi `isInView = true` → `setMuted(false)`

```tsx
useEffect(() => {
  if (isInView) {
    videoEl?.play().catch(() => {});
    setMuted(false); // ← thêm dòng này
    onVisibleRef.current();
  } else {
    videoEl?.pause();
  }
}, [isInView, videoEl]);
```

**Ưu điểm:** Thay đổi rất nhỏ, chỉ sửa 1 dòng  
**Nhược điểm:** Mất khả năng user chọn mute rồi giữ mute khi scroll qua lại (nhưng theo bảng hành vi mong muốn ở trên, đây là hành vi chúng ta **muốn**)

---

## Câu hỏi cần thảo luận

1. **Phương án nào được chọn?** A hay B?

   - Phương án B đơn giản hơn nhiều và đáp ứng đúng yêu cầu đề ra.
   - Phương án A linh hoạt hơn nếu sau này cần "nhớ mute state per video".

2. **Mute state có được nhớ theo từng video không?**

   - Ví dụ: User mute video 2 → swipe sang video 3 → swipe lại video 2 → video 2 có còn muted không?
   - Nếu **có**: dùng Phương án A + map `{ [videoId]: boolean }`
   - Nếu **không** (mặc định unmute mỗi lần): dùng Phương án B

3. **Video đầu tiên khi mở page có unmute không?**
   - Hiện tại: video đầu tiên unmuted (vì `video.id === id`)
   - Giữ nguyên hành vi này hay đổi luôn thành luôn unmuted?

---

## Verification

| #   | Test                                                   | Pass condition                         |
| --- | ------------------------------------------------------ | -------------------------------------- |
| 1   | Mở `VideoDetailPage`, swipe xuống video 2              | Video 2 phát **có tiếng** ngay lập tức |
| 2   | Mute thủ công video đang xem, swipe sang video kế tiếp | Video mới **unmute**                   |
| 3   | Swipe lên video trước đó                               | Video trước **unmute**                 |
| 4   | Mute video, giữ nguyên, không swipe                    | Âm thanh tắt (không bị ảnh hưởng)      |
