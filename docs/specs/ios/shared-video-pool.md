---
title: 'iOS Autoplay — Shared Video Element Pool (kiến trúc hiện tại)'
created: '2026-03-15'
status: 'implemented'
domain: 'ios'
supersedes: 'autoplay-old.md'
---

# Spec: Giải quyết lỗi Autoplay iOS bằng Kiến trúc Shared Video Element Pool (Hook-based)

## 1. Bối cảnh & Vấn đề (Context & Problem)

Video Feed trên iOS Safari đang gặp 2 lỗi nghiêm trọng liên quan đến quyền phát âm thanh (Autoplay Unmuted):

1. **Lỗi ấn từ Grid:** Nhấn vào `VideoCard` từ màn Grid để vào `VideoDetailPage` nhưng video không phát ngay, bắt người dùng phải Tap thêm một lần nữa. Mặc dù đã dùng trick `new Audio(VIDEO_SILENT_MP3).play()` nhưng cách này chỉ Unlock cho `Audio` element, không thừa kế quyền xuống các `<video>` element.
2. **Lỗi khi vuốt (Swipe):** Mỗi lần vuốt xuống slide tiếp theo, video cần thời gian tải HLS (`canplay` async). Do delay bất đồng bộ này, tín hiệu User Gesture từ cú vuốt bị Safari huỷ bỏ. Khi Component cố gọi `video.muted = false` và `video.play()`, Safari đánh giá đây là hành vi tự ý phát tiếng và sẽ PAUSE video lại, ép người dùng Tap để xem tiếp.

**Nguyên nhân gốc rễ:**
iOS Safari quản lý quyền "Phát video có tiếng" theo từng thực thể `<video>` (HTMLMediaElement instance) độc lập. Cứ mỗi lần React render sinh ra thẻ `<video>` mới, Safari lại đóng chặt quyền của thẻ đó. Sự kiện tải mạng (HLS) càng làm tình hình tệ hơn vì nó phá vỡ chuỗi đồng bộ của sự kiện chạm màn hình.

---

## 2. Giải pháp Kiến trúc: Global Unlocked Video Element Pool

Thay vì để React tự do sinh ra hàng loạt `<video>` (Virtual DOM) rồi bị Safari chặn, chúng ta sẽ áp dụng **Object Pooling** (Tái chế thẻ đã được cấp phép) - đây là chuẩn công nghiệp (Industry Standard) đằng sau TikTok Web, Instagram Reels.

Để không làm hỏng cấu trúc Code React "sạch", quá trình thao tác DOM thủ công thô kệch (Vanilla JS) sẽ được đóng gói gọn gàng (Encapsulation) vảo một **React Custom Hook** chuyên dụng: `useSharedVideo`.

### Vòng đời hoạt động của Kiến trúc

1. **Khởi tạo Pool (Singleton):** Một `VideoPoolManager` ẩn chứa tĩnh 3 đối tượng `document.createElement('video')` trong bộ nhớ RAM từ khi ứng dụng tải trang.
2. **Xin quyền Tập thể (Unlock All in One Gesture):** Khi người dùng Tap vào `VideoCard` ngoài Grid, ta ép 3 thẻ Video ẩn kia gọi lệnh `.play()` và `.pause()` ngay lập tức. _Kết quả: Safari ghi nhận người dùng đã tương tác với 3 thẻ Video này và cấp "Kim bài Miễn tử" (User Gesture Token) cho phép chúng phát tiếng bất cứ lúc nào trong tương lai._
3. **Mượn/Trả thẻ tự động (Hook-based Lifecycle):**
   - Component `BunnyVideoPlayer` không chứa dòng `<video>...</video>` nữa. Nó chỉ chuẩn bị một thẻ vỏ `<div ref={containerRef}>`.
   - Component gọi hook `const video = useSharedVideo(containerRef)`.
   - Hook tự lọt vào Pool lấy ra một thẻ đã Unlock, cắm (`appendChild`) vào `containerRef`.
   - Vì thẻ Video này đã có Kim bài Miễn tử từ màn Grid, nên khi tải HLS xong, nó tự gọi `video.play()` báo tiếng ầm ầm mà Safari không hề bắt lỗi.
   - Khi lướt qua slide khác (Video trượt khỏi màn hình), Hook tự rút thẻ ra (`removeChild`), dọn sạch bộ nhớ (`.removeAttribute('src')`, `.load()`) và ném trả vào Pool để các slide phía dưới xoay vòng sử dụng tiếp.

---

## 3. Các thay đổi kỹ thuật (Proposed Changes)

### Tầng 0: Pool Eviction Policy (Ràng buộc bắt buộc)

> **Đảm bảo tối đa 3 slides được mount đồng thời tại mọi thời điểm**

Đây là điều kiện tiên quyết để pool size = 3 không bao giờ bị cạn kiệt (starvation).

**Thắt chặt `isNearView` trong `video-slide.tsx`:**

```tsx
// TRƯỚC (quá rộng — slide chậm được deactivate, dễ có 4-5 slides active cùng lúc)
const isNearView = useInView(containerEl, { rootMargin: '200% 0px', threshold: 0 });

// SAU (slide deactivate sớm hơn — đảm bảo slot pool được trả trước khi slide xa cần)
const isNearView = useInView(containerEl, { rootMargin: '100% 0px', threshold: 0 });
```

**Thắt chặt `autoLoad` trong `VideoDetailPage/index.tsx`:**

```tsx
// TRƯỚC
autoLoad={index <= initialIndex + 2}  // có thể mount nhiều hơn 3 lúc khởi tạo

// SAU — chỉ mount đúng 3: prev (nếu có), current, next
autoLoad={Math.abs(index - initialIndex) <= 1}
```

**Lý do:** Nếu slide N-2 chưa kịp deactivate khi slide N+1 cần pool element, hook sẽ nhận về `null` → crash. Eviction policy chặt là điều kiện đủ để pool luôn có ít nhất 1 slot trống khi cần.

---

### Tầng 1: Quản lý Pool & API (Vanilla JS + Hook)

> **Tạo file: `src/hooks/use-shared-video.ts`**

**Khởi tạo pool element với CSS inline ngay tại createElement:**

```ts
function createPoolElement(): HTMLVideoElement {
  const video = document.createElement('video');
  // CSS phải set bằng JS — Tailwind không hoạt động với element ngoài React tree
  video.style.cssText = 'position:absolute;inset:0;width:100%;height:100%;object-fit:cover';
  video.playsInline = true;
  video.loop = true;
  video.muted = true;
  video.preload = 'none';
  return video;
}

const pool: HTMLVideoElement[] = [createPoolElement(), createPoolElement(), createPoolElement()];
const available: HTMLVideoElement[] = [...pool];
```

**Export `unlockVideoPool()`:**

```ts
// Chỉ gọi trong user gesture (onClick), KHÔNG gọi khi reload
export function unlockVideoPool(): void {
  pool.forEach((video) => {
    video.play().catch(() => {});
    // play() là async — token được Safari ghi nhận ngay lúc gọi,
    // không cần await. pause() gọi ngay để không thực sự phát tiếng.
    video.pause();
  });
}
```

**Custom Hook `useSharedVideo(containerRef, options)`:**

```ts
interface SharedVideoOptions {
  poster?: string;
  loop?: boolean;
}

export function useSharedVideo(
  containerRef: React.RefObject<HTMLDivElement>,
  options: SharedVideoOptions = {}
): HTMLVideoElement | null {
  const videoRef = useRef<HTMLVideoElement | null>(null);

  useEffect(() => {
    if (!containerRef.current) return;

    // Mượn element từ pool — nếu pool cạn (eviction chậm) thì trả null
    const video = available.pop() ?? null;
    if (!video) {
      console.warn('[VideoPool] Pool exhausted — slide activated too fast');
      return;
    }

    // Set options imperatively (poster, loop không thể dùng React props)
    video.poster = options.poster ?? '';
    video.loop = options.loop ?? true;
    video.muted = true; // luôn bắt đầu muted

    containerRef.current.appendChild(video);
    videoRef.current = video;

    return () => {
      // 1. HLS phải được destroy TRƯỚC khi reset src (xem Tầng 3)
      //    BunnyVideoPlayer sẽ gọi hls.destroy() trong useEffect cleanup của nó,
      //    sau đó hook cleanup này chạy → thứ tự đảm bảo vì React cleanup chạy từ trong ra ngoài.
      // 2. Reset element về trạng thái sạch
      video.pause();
      video.removeAttribute('src');
      video.poster = '';
      video.load(); // giải phóng iOS hardware decoder slot
      containerRef.current?.removeChild(video);
      videoRef.current = null;
      // 3. Trả về pool
      available.push(video);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []); // chỉ chạy 1 lần khi mount/unmount

  return videoRef.current;
}
```

---

### Tầng 2: Xin Quyền Khi Chạm (Trigger)

> **Sửa file: `src/modules/DetailSearchPage/components/VideoCard.tsx`**

- Trong sự kiện `onClick` của Card:
  - Xóa đoạn hack `new Audio(VIDEO_SILENT_MP3).play()` hiện tại.
  - Thay bằng `unlockVideoPool()` để xin giấy phép tập thể.

```tsx
onClick={() => {
  // Unlock tất cả pool elements trong user gesture context.
  // CHỈ gọi ở đây (isFromGrid flow) — KHÔNG gọi khi reload page.
  unlockVideoPool();
  onVideoClick(video.id);
}}
```

---

### Tầng 3: Tái Cấu Trúc HLS Player (View)

> **Sửa file: `src/components/BunnyVideoPlayer.tsx`**

**Render:**

```tsx
// TRƯỚC
<video ref={videoRef} className="absolute inset-0 ..." ... />

// SAU — div vỏ rỗng, video element do hook inject vào
<div ref={containerRef} className={className} />
```

**Hook:**

```tsx
const videoElement = useSharedVideo(containerRef, { poster, loop: true });
```

**HLS lifecycle (quan trọng):**

```tsx
useEffect(() => {
  if (!videoElement) return; // pool exhausted — không làm gì

  // ... logic HLS giữ nguyên, chỉ thay videoRef.current → videoElement
  hls.attachMedia(videoElement);

  return () => {
    // hls.destroy() phải chạy TRƯỚC khi useSharedVideo hook cleanup reset src.
    // React đảm bảo useEffect cleanup chạy theo thứ tự inner → outer,
    // tức là cleanup của useEffect này (BunnyVideoPlayer) chạy trước cleanup
    // của useSharedVideo (được gọi trong useEffect bên trong hook).
    hls.destroy();
  };
}, [videoElement, src]);
```

---

### Tầng 4: Logic Trượt & Preload (Slide)

> **Sửa file: `src/modules/VideoDetailPage/components/video-slide.tsx`**

**KHÔNG thay đổi `forcePause` / gate logic.** Đây là behavior cố ý cho reload flow:

**Bổ sung `unlockVideoPool` cho Reload flow (Gate Logic):**

- Reload page (`isFromGrid=false`): pool chưa unlocked ban đầu → gate hiện, user bắt buộc tap 1 lần.
- Trong màn hình Gate của Slide đầ tiên, tích hợp `unlockVideoPool` để mượn cú Tap này unlock cho CHO CẢ 3 pool elements. Kết quả: Từ slide thứ 2 trở đi vuốt sẽ mượt như luồng Grid.

```tsx
onClick={() => {
  // [NEW] Triệu hồi Kim Bài Miễn Tử cho CẢ 3 thẻ Video trong Pool
  unlockVideoPool();

  // Vượt gác cổng: Bật tiếng cho thẻ hiện hành
  playerRef.current?.unmute();
  onMutedChange(false);
  onGateOpen?.();
}}
```

- Từ Grid (`isFromGrid=true`): pool đã unlocked từ Tầng 2 → gate không hiện, video tự phát tiếng ngay.

**Chỉ điều chỉnh 2 điểm:**

1. Đổi `rootMargin` của `isNearView` từ `'200% 0px'` → `'100% 0px'` (đã nêu ở Tầng 0).
2. Xóa logic `shouldPreload` + `playerRef.current?.preload()` — không còn cần thiết vì pool element tồn tại xuyên suốt, HLS của slide kế sẽ tự load khi component activate.

---

## 4. Ưu/Nhược điểm (Trade-offs)

### Ưu Điểm:

1. Giải quyết 100% bug Safari PAUSE video khi vuốt/khi load chậm HLS (với flow từ Grid).
2. Tiết kiệm tài nguyên phần cứng iOS. Safari không cấp phát hàng lô bộ giải mã (Hardware Decoder) mới mỗi lần swipe.
3. Hook hóa giúp giữ Component UI (BunnyVideoPlayer) tuyệt đối "Sạch".
4. Reload flow giữ nguyên UX: user vẫn phải tap Play trước khi scroll — behavior cố ý.

### Nhược Điểm:

1. Lập trình vòng đời DOM thật trong lòng React (được Encapsulate vào Hook nên chấp nhận được).
2. CSS Flash 1 frame có thể xảy ra nếu layout reflow chậm. Giảm thiểu bằng cách set `style.cssText` đầy đủ ngay tại `createPoolElement()`.
3. Pool exhausted (null) nếu Eviction Policy không được thực thi đúng (Tầng 0). Component render spinner thay vì crash khi nhận null từ hook.
4. Reload flow: User vẫn phải tap Gate 1 lần ở Video đầu tiên (do Safari block mặc định), nhưng các video sau đó đã được xử lý triệt để, scroll là có tiếng ngay.

---

_Tài liệu dành cho thảo luận kỹ thuật (Architecture Discussion)._
