---
title: 'iOS Safari Video Feed — Phân tích vấn đề (cũ)'
created: '2026-03-08'
status: 'superseded'
domain: 'ios'
superseded_by: 'shared-video-pool.md'
---

> ⚠️ **SUPERSEDED** — Phân tích gốc. Giải pháp hiện tại: [`shared-video-pool.md`](./shared-video-pool.md).

# Feature Specification: Cải thiện trải nghiệm Video Feed trên iOS Safari

## 1. Bối cảnh & Vấn đề (Context & Problem)

Dự án `web-travel` hiện đang gặp 2 vấn đề rào cản nền tảng khi vận hành luồng Feed Video trên thiết bị iOS (trình duyệt Safari):

- **Audio Autoplay Blocked (Mất quyền tự động phát âm thanh):** Khi chuyển từ màn Grid (`DetailSearchPage`) sang Slide (`VideoDetailPage`), video bị câm hoặc sự kiện autoplay bị chặn đứng, bắt người dùng phải "chạm tay" màn hình để kích hoạt. Sự cố này xuất phát từ việc Next.js thực hiện Client-Side Routing giải quyết bất đồng bộ, khiến cờ "User Gesture Token" (Tín hiệu người dùng chạm thật) của Safari gửi tới bị rơi rụng giữa chừng. Code hiện hữu đang cố xin quyền thông qua `AudioContext` nhưng cơ chế thao túng này không tác dụng để lọt qua vòng kiểm duyệt mở khóa thẻ `<video>`.
- **Hardware Decoder Exhaustion (Treo thiết bị khi vuốt):** Kể từ slide thứ 3 trở đi, thẻ video bị đơ cứng, không phát video. Nguyên nhân là iOS Safari giới hạn ngặt nghèo dung lượng (thường dưới 4 luồng) của Media Decoder phần cứng ngầm. Nguyên lý Component `video-slide` trượt qua chỉ gọi lại lệnh `.pause()` chứ không giải phóng liên kết mạng `.src`. Do đó, thiết bị bị rò rỉ và tràn dung lượng bộ nhớ giải mã, từ chối cấp luồng mới.

## 2. Giải pháp Kiến trúc (Architectural Solution)

Để đảm bảo hiệu năng (Native Performance) cực mượt như Tiktok mà không gây Nợ Kỹ Thuật (Tech-Debt), cấu trúc giải quyết tuân theo 2 mũi nhọn:

### A. Lừa sóng Âm thanh (The Silent Audio Hack)

Giành lại quyền Media Engagement bị khuyết của Safari bằng trick HTML5 kinh điển:

- Trữ một biến Data MP3 tĩnh siêu nhỏ nhúng chuẩn Base64. (Chứa 0.1 giây khoảng lặng câm, nặng vài Bytes).
- Tại thời điểm phát sinh sự kiện `onClick` lên tấm hình Thumbnail Video, ta tạo đối tượng `new Audio(silentMp3)` và lập tức kích nổ còi `play()`.
- Trình duyệt Safari sẽ bị đánh lừa và kích hoạt chứng nhận "Web này được phép phát âm thanh ra loa vì người dùng vừa tự tay bấm vào nút mở một Media". Safari mở chốt Audio Session vĩnh viễn cho Tab đó.
- Lệnh `router.push('/video')` xử lý xong, đưa màn Slide mới lên, gọi lệnh `.play()` cho Video. Safari kiểm tra và gật đầu vượt vòng gửi xe! Bùm! Có tiếng lập tức mà không cần chạm lần 2.

### B. Cơ chế Ảo Hoá Động & Xả Nhớ Rỗng (DOM Virtualization)

Dọn dẹp triệt để hiện tượng tràn RAM, nghẽn Hardware Safari:

- Nâng cấp Component `BunnyVideoPlayer`: Bổ sung thêm luồng Cleanup Hủy Diệt tận gốc. Không chỉ `pause()` mà còn đánh rụng cả Source mạng `videoRef.current.removeAttribute('src'); videoRef.current.load();` và thủ tiêu luồng Stream giả `hls.destroy()`.
- Sửa móng `IntersectionObserver` ở `video-slide`: Hiện tại cờ trượt chỉ gán `activated = true` khi đến gần. Phải bổ sung luật bật ngửa về `activated = false` khi thẻ video rơi ra khỏi khoảng cách 2 màn hình.
- Ngay khi `activated == false`, React xé Component Player ra khỏi Cây Render (Unmount), trả Decoder cho RAM. Nếu người dùng lướt vuốt về tìm, Cờ bật lại thành `true`, Remount Player lên, hệ thống HLS sẽ tải cache m3u8 tức thời và mượt mà.

## 3. Các đầu mục công việc Triển khai (Actionable Tasks)

- **Task 1: Cập nhật biến tĩnh**
  - Chèn Data chuỗi base64 của file MP3 Im Lặng `VIDEO_SILENT_MP3` nhằm tránh phải Request mạng tốn băng thông.
- **Task 2: Tại `src/modules/DetailSearchPage/components/VideoCard.tsx`**
  - Xóa đoạn hack `AudioContext` cũ đi.
  - Thay thế bằng dòng đối tượng `new Audio(VIDEO_SILENT_MP3).play()`. Bọc Catch Error kĩ lưỡng để an toàn với mọi nền tảng trình duyệt.
- **Task 3: Tại `src/components/BunnyVideoPlayer.tsx`**
  - Thêm Hook `useEffect` canh chừng quá trình Unmount Component.
  - Gọi các lệnh xóa sạc tài nguyên, xóa Source Video và gỡ rối Hls.
- **Task 4: Tại `src/modules/VideoDetailPage/components/video-slide.tsx`**
  - Tại dòng: `if (isNearView) setActivated(true);` sửa thành gán hai chiều linh hoạt `setActivated(isNearView)`.
  - Phân vùng logic Unmount, đảm bảo Player rơi vào chăn Ngủ Đông khi người dùng trượt qua mặt xa hơn 2 ngàm mắt.
