---
title: 'VideoDetailPage — Native HLS Autoplay Journey'
created: '2026-03-10'
status: 'reference'
domain: 'ios'
---

# Spec: VideoDetailPage — Native HLS Autoplay (Bunny Direct Play)

## Tóm Tắt Hành Trình

| Giai đoạn                             | Phương án                                        | Kết quả                                          |
| ------------------------------------- | ------------------------------------------------ | ------------------------------------------------ |
| **1. Iframe + Hack Overlay**          | Bắt `onClick` overlay để unlock AudioContext     | ✅ Hoạt động nhưng UX xấu                        |
| **2. Iframe + Touchend Hack**         | Bắt `onTouchEnd` vuốt để gọi `unmute()`          | ❌ Bất ổn, race condition với postMessage        |
| **3. Iframe + Framer Motion Drag**    | Bắt `onDragEnd` để gọi `playAndUnmute()` đồng bộ | ❌ Bunny iframe tự `pause()` trong lúc animation |
| **4. Native HLS + Bunny Direct Play** | Bật Direct Play → `<video>` + `hls.js`           | ✅ **GIẢI PHÁP CHỐT**                            |

---

## Vấn Đề Gốc Rễ (Why Iframe Failed)

iOS Safari áp dụng **chính sách Cross-Origin Autoplay** cho iframe:

- Lệnh `play()` / `unmute()` gửi qua `postMessage` là **bất đồng bộ** → dễ bị race condition
- `IntersectionObserver` chạy ngầm **không được tính là User Gesture** → Safari block
- Bunny Player SDK tự `pause()` video khi iframe ra khỏi viewport → gây delay 300ms khi cuộn

**Giải pháp triệt để:** Dùng thẻ `<video>` native (Sân Nhà), thoát hoàn toàn khỏi iframe.

---

## Cấu Hình Bunny Dashboard (Đã Thực Hiện)

| Cài đặt                      | Giá trị                                                                                         | Ghi chú                             |
| ---------------------------- | ----------------------------------------------------------------------------------------------- | ----------------------------------- |
| Enable direct play           | ✅ BẬT                                                                                          | Mở khoá link m3u8                   |
| Block direct url file access | ❌ TẮT                                                                                          | Cho phép CDN truy cập tự do         |
| Embed view token auth        | ❌ TẮT                                                                                          | Không cần token                     |
| CDN token authentication     | ❌ TẮT                                                                                          | Không cần token                     |
| Allowed domains              | `localhost`, `web-travel-theta.vercel.app`, `web-travel-git-dev-luongworks-projects.vercel.app` | Cho phép truy cập từ các domain này |

---

## Kiến Trúc Kỹ Thuật Hiện Tại

### URL Pattern

```
embedUrl (từ API DB):
  https://player.mediadelivery.net/embed/622547/{videoGuid}

Trích xuất videoGuid → Build m3u8 URL:
  https://vz-186cf1b9-231.b-cdn.net/{videoGuid}/playlist.m3u8
```

### `BunnyVideoPlayer.tsx`

```tsx
const BUNNY_CDN_DOMAIN = 'vz-186cf1b9-231.b-cdn.net';

// Safari iOS → native HLS (canPlayType mpegurl)
// Chrome/Android → hls.js bridge
```

### `video-slide.tsx` (Đơn giản hóa tối đa)

```tsx
// Không cần User Gesture! IntersectionObserver gọi play() + unmute() tự do
React.useEffect(() => {
  if (isInView) {
    playerRef.current?.play();
    if (!muted) playerRef.current?.unmute();
  } else {
    playerRef.current?.pause();
  }
}, [isInView, muted]);
```

---

## Điểm Còn Cần Thảo Luận

### 1. 🔴 Security — CDN hiện đang mở hoàn toàn

**Vấn đề:** `Block direct url file access` đang tắt → Bất kỳ ai biết link m3u8 đều tải được video không giới hạn.

**Phương án:**

- **A. Giữ nguyên (hiện tại):** Đơn giản, không cần cấu hình thêm. Phù hợp môi trường dev/staging.
- **B. Bật lại + Allowed domains:** Chỉ cho phép domain chính thức. Cần thêm đầy đủ domain production vào list.
- **C. CDN Token Authentication:** Bảo mật cao nhất. Backend cần ký token có thời hạn và trả về `streamUrl` có token. Phức tạp hơn nhưng an toàn tuyệt đối.

### 2. 🟡 Backend — Cần thêm field `streamUrl` vào API

**Hiện tại:** Frontend tự extract `videoGuid` từ `embedUrl` và hardcode CDN domain.

**Vấn đề:** Nếu Bunny thay đổi pullzone domain hoặc cấu trúc URL, cần deploy lại Frontend.

**Đề xuất:** Backend thêm field `streamUrl` vào response:

```json
{ "streamUrl": "https://vz-186cf1b9-231.b-cdn.net/{guid}/playlist.m3u8" }
```

### 3. 🟡 `defaultPaused` Logic

Hiện tại slide đầu tiên khi vào từ lịch sử trình duyệt (`autoplay !== 'true'`) bị paused. Cần cân nhắc UX: có nên tự phát ngay không hay cần user tap?

### 4. 🟢 Production Domains

Cần thêm domain production thật vào Allowed domains của Bunny khi go-live:

- `web-travel.vn` (hoặc tên miền thực tế)

---

## Kết Quả Đạt Được

- ✅ Video phát ngay lập tức khi scroll vào màn hình (0ms delay)
- ✅ Audio hoạt động trên iOS Safari không cần User Gesture
- ✅ Xóa bỏ hoàn toàn mọi hack phức tạp (overlay, touchend, postMessage)
- ✅ Code đơn giản, dễ maintain
- ✅ Native HLS Adaptive Bitrate (tự chọn 360p/720p/1080p theo mạng)
