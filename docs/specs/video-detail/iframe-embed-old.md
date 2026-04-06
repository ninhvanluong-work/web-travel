---
title: 'Migration Native video → iframe Embed (cũ)'
created: '2026-03-03'
status: 'superseded'
domain: 'video-core'
superseded_by: '../ios/autoplay-native-hls.md'
---

> ⚠️ **SUPERSEDED** — Hướng iframe đã bị bỏ. Xem [`autoplay-native-hls.md`](../ios/autoplay-native-hls.md) (Native HLS).

# Specification: Migration from Native `<video>` to `<iframe>` Embed

**Khái quát:** Tài liệu này phân tích và đặc tả các bước kỹ thuật cần thiết để chuyển đổi player video từ `<video src="mp4_url">` truyền thống sang dùng `<iframe>` thông qua thuộc tính `embedUrl` của **Bunny.net/MediaDelivery** trong màn hình `VideoDetailPage` (Tiktok-style scroll).

---

## 1. Phân Tích Ảnh Hưởng (Impact Analysis & Risks)

Việc thay đổi sang tính năng nhúng (iframe) mang lại điểm lợi rất lớn về mặt stream video (HLS/DASH) phân giải tự động, tiết kiệm băng thông nhưng đi kèm các trade-off kỹ thuật như sau:

### 1.1 Khó khăn về Giao tiếp DOM (Native DOM Control)

- **Hiện tại:** Code file `video-slide.tsx` gọi trực tiếp `videoEl.play()`, `videoEl.pause()` và thao tác với properties `videoEl.muted`.
- **Khi dùng Iframe:** Việc gọi các DOM method trên sẽ không còn hiệu lực do quy tắc bảo mật cùng nguồn (CORS). Chúng ta buộc phải giao tiếp thông qua thư viện của Bunny Player hoặc gửi lệnh thuần túy thông qua hàm `window.postMessage`.

### 1.2 Quản lý Lỗi Autoplay (Autoplay Policies)

- **Hiện tại:** Giao diện bắt gọn gàng lỗi `NotAllowedError` từ Promise trả về của phương thức `.play()` để hiện ra Component `VideoPlayOverlay`.
- **Khi dùng Iframe:** Trình duyệt sẽ âm thầm chặn quyền autoplay của Iframe và không văng lỗi bên phía React Component. Trừ khi SDK của BunnyCDN có phát tín hiệu `autoplay_failed` qua Web API Message để chúng ta lắng nghe, thì khả năng Component VideoPlayOverlay sẽ không còn cơ chế hiển thị chính xác.

### 1.3 Hiệu Năng và Rò Rỉ Bộ Nhớ (Performance & Memory Leak)

- **Rủi ro lớn nhất:** Component `VideoDetailPage` tải nhiều slide (cơ chế preload). Việc render 5-10 video native khá nhẹ nhàng vì trình duyệt tối ưu hoá rất tốt. Tuy nhiên, load 10 cái `<iframe>` sẽ đính kèm 10 Document Windows độc lập (HTML, CSS và JS chuyên trách của Player BunnyCDN). Hậu quả trên máy cấu hình yếu/các trình duyệt trên di động:
  - Máy bị giật lag khi cuộn màn hình (`snap-y`).
  - Gây tràn RAM (Crash out of memory browser).
- **Giải pháp:** Chỉ render `<iframe>` với các video đang xuất hiện (`diff === 0`), và có thể preload nhẹ 1 thẻ trước/sau, các thẻ ở ngoài (xa hơn) phải unmount Iframe (hoặc load thẻ img thumbnail) ngay lập tức.

### 1.4 Khả năng bị nuốt Swipe/Touch Events

- Khung iframe sẽ bắt (intercept) toàn bộ sự kiện chạm và cuộn ngón tay. Việc thao tác vuốt chuyển video, double-tap để Like video sẽ bị Player gốc của BunnyCDN kiểm soát.
- **Giải pháp:** Cần phủ 1 thẻ `div` với thuộc tính `pointer-events-none` lên Iframe nếu muốn người dùng tiếp tục vuốt được mà không bị khựng, nhưng lúc đó ta lại không bấm được UI bên nội bộ trong Iframe (nếu có).

### 1.5 Xung đột giao diện Overlay (UI Clash)

- Player mặc định có các UI Controls riêng (nút Pause, Loa, Tua). Nếu ứng dụng ta đang đắp lên các lớp Overlay (Tim, âm lượng, mô tả) thì màn hình sẽ rác và chồng chéo.
- **Cách khắc phục:** Cần tắt control của BunnyCDN trong cấu hình URL (`controls=false`).

---

## 2. Đặc Tả Kỹ Thuật (Technical Specification)

Nếu quyết định triển khai, xin vui lòng xem kỹ Spec sau:

### Step 1: Bổ sung Backend Interface (Model)

Update Interface Data Model của Video (VD: thiết lập trong `src/api/video.ts`):

```typescript
export interface IVideo {
  id: string;
  slug: string;
  url: string; // Vẫn có thể giữ làm fallback cho Native player
  embedUrl: string; // URL dùng cho Iframe
  shortUrl?: string; // Tùy chọn thu gọn
  // ... các field cũ
}
```

### Step 2: Cập Nhật Vỏ Đựng (Markup) trong `video-slide.tsx`

Thay thế toàn bộ thẻ `<video ... />` ở file `src\modules\VideoDetailPage\components\video-slide.tsx` bằng thẻ `<iframe>`.

```tsx
<div className="absolute inset-0 w-full h-full pointer-events-none z-0">
  <iframe
    ref={setIframeEl} // thay bằng useRef<HTMLIFrameElement>
    src={`${video.embedUrl}?autoplay=false&loop=true&muted=${muted}&responsive=true&controls=false`}
    loading="lazy"
    className="border-0 w-full h-full absolute top-0 object-cover"
    allow="accelerometer;gyroscope;autoplay;encrypted-media;picture-in-picture;"
    allowFullScreen={true}
  ></iframe>
</div>
```

_(Ghi chú: Lớp `pointer-events-none` bắt buộc phải có để thanh cuộn `snap-mandatory` không bị Iframe nuốt mất sự kiện chạm)._

### Step 3: Tích hợp Giao tiếp qua `postMessage`

Cập nhật lại hook `useEffect` phụ trách lắng nghe state view `isInView` qua component `video-slide.tsx`:

```tsx
useEffect(() => {
  if (isInView && iframeEl.current?.contentWindow) {
    // Bắn lệnh PLAY cho Iframe theo document của mediadelivery
    iframeEl.current.contentWindow.postMessage(
      JSON.stringify({ method: 'play' }),
      '*' // Khuyên dùng targetOrigin cụ thể 'https://player.mediadelivery.net'
    );
    onVisibleRef.current(video.slug);
  } else {
    // Khi lướt qua video khác -> Bắn lệnh PAUSE
    if (iframeEl.current?.contentWindow) {
      iframeEl.current.contentWindow.postMessage(JSON.stringify({ method: 'pause' }), '*');
    }
    setShowPlayOverlay(false);
    onBlockedChangeRef.current?.(false);
  }
}, [isInView, video.slug]);
```

### Step 4: Xử Lý Trạng Thái UI Mute (Âm lượng)

Khi người dùng ấn vào Button góc dưới cùng bên phải, ta cần gửi tín hiệu mute/unmute xuống Player nội bộ của Bunny.

```tsx
const handleToggleMute = () => {
  const nextMuted = !muted;
  setMuted(nextMuted);

  if (iframeEl.current?.contentWindow) {
    iframeEl.current.contentWindow.postMessage(JSON.stringify({ method: nextMuted ? 'mute' : 'unmute' }), '*');
  }
};
```

### Step 5: Quản lý Component Overlay `VideoPlayOverlay`

Khi IFrame tự chặn Autoplay (hoặc user chưa active gesture trên trình duyệt), ta phải bắt Global Web Event từ Window Message của thẻ con truyền lên.

```tsx
useEffect(() => {
  const handleMessage = (event: MessageEvent) => {
    // Security Filter (Origin Của Bunny)
    if (!event.origin.includes('mediadelivery.net')) return;

    try {
      const data = typeof event.data === 'string' ? JSON.parse(event.data) : event.data;

      // Tùy theo cấu trúc data mà Bunny thực sự trả về (Dưới đây là mock logic)
      if (data.event === 'playing') {
        setShowPlayOverlay(false);
      } else if (data.event === 'autoplay_blocked') {
        // Bật cái nút Play bự thủ công ở chính giữa màn hình
        setShowPlayOverlay(true);
      }
    } catch (e) {}
  };

  window.addEventListener('message', handleMessage);
  return () => window.removeEventListener('message', handleMessage);
}, []);
```

---

### Kết Luận

- Giải pháp dùng `embedUrl (IFrame)` rất lý tưởng cho mục đích Streaming để tiết kiệm băng thông.
- Thế nhưng, kiến trúc luồng Video giống Reels/Tiktok áp dụng `<iframe>` đi chung với thuộc tính CSS `snap-scroll` sẽ làm phức tạp việc giao tiếp Event và quản lý RAM của trình duyệt.
- Để tránh bị Force Quit ứng dụng / Lag cục bộ, bắt buộc phải nâng cấp logic Load/Unmount, không được phép duy trì quá nhiều iframe render ngầm kể cả khi có tính năng lazy load.
