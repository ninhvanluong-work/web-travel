# Spec: Video Feed Preload Strategy

**Ngày tạo:** 2026-03-31
**Cập nhật:** 2026-04-02
**Trạng thái:** Implemented
**Ưu tiên:** High

---

## 1. Bối cảnh & Vấn đề

Khi user vuốt sang slide tiếp theo trong `VideoDetailPage`, xuất hiện hiện tượng **khựng 1-2 giây** trước khi video bắt đầu phát. Root cause:

```
User vuốt → isNearView fire (IntersectionObserver ~100-300ms delay)
         → BunnyVideoPlayer mount
         → useSharedVideo inject pool element (preload='none')
         → video.src = m3u8
         → iOS AVFoundation fetch manifest (~200-400ms)
         → fetch segment đầu (~300-600ms)
         → canplay → play()
         ↳ TỔNG: 800ms - 1300ms khựng
```

**Vấn đề phát hiện thêm khi phân tích sâu:**

1. `pool elements` được tạo với `video.preload = 'none'` → dù `video.src` được set sớm, iOS không fetch gì cho đến khi `play()` được gọi. Toàn bộ preload không có tác dụng nếu thiếu `video.load()`.

2. Activation logic dùng `isNearView` (rootMargin 100%) → N-1, N, N+1 đều activated = **3 iOS hardware decoder đồng thời**, vi phạm giới hạn 2 decoder của thiết bị cũ.

3. `prefetchHls()` hiệu quả khi user xem lâu (>1s) nhưng không đủ khi swipe nhanh vì HTTP cache chưa warm kịp.

---

## 2. Mục tiêu

- Loại bỏ khựng khi vuốt ở tốc độ bình thường (> 400ms/slide)
- Giảm tối đa khựng khi vuốt nhanh (200-400ms/slide): mục tiêu < 200ms
- **Strict 2 active iOS hardware decoder** mọi thời điểm
- Không tăng memory pressure đáng kể trên thiết bị cũ

---

## 3. Phạm vi thay đổi

| File                                                     | Thay đổi                                 |
| -------------------------------------------------------- | ---------------------------------------- |
| `src/pages/_document.tsx`                                | Add `<link>` preconnect hints            |
| `src/hooks/use-video-detail-feed.ts`                     | Thêm `currentIndexReady`, eager prefetch |
| `src/components/BunnyVideoPlayer.tsx`                    | Add `video.load()` sau `video.src = src` |
| `src/modules/VideoDetailPage/index.tsx`                  | Dùng `isCurrentOrNext` prop              |
| `src/modules/VideoDetailPage/components/video-slide.tsx` | Thay activation bằng `isCurrentOrNext`   |

---

## 4. Giai đoạn 1 — Network Warm-up

### 4.1. Preconnect CDN trong `_document.tsx`

```tsx
<link rel="preconnect" href="https://vz-186cf1b9-231.b-cdn.net" crossOrigin="anonymous" />
<link rel="dns-prefetch" href="https://vz-186cf1b9-231.b-cdn.net" />
```

**Effect:** TCP + TLS handshake với Bunny CDN thực hiện ngay khi page load.
**iOS safe:** ✅ Không tạo decoder, không tốn memory.

### 4.2. Eager prefetch khi video list available

**File:** `src/hooks/use-video-detail-feed.ts`

```ts
const eagerPrefetchDone = useRef(false);
useEffect(() => {
  if (eagerPrefetchDone.current || videos.length === 0) return;
  eagerPrefetchDone.current = true;
  [initialIndex, initialIndex + 1, initialIndex + 2].forEach((i) => {
    const v = videos[i];
    if (v?.embedUrl) prefetchHls(v.embedUrl);
  });
  // eslint-disable-next-line react-hooks/exhaustive-deps
}, [videos.length, initialIndex]);
```

> Dùng `initialIndex` (không phải `currentIndex`) — `currentIndex` bắt đầu là 0 và được set đúng sau effect, trong khi `initialIndex` từ `useMemo` đã chính xác ngay lần render đầu.

---

## 5. Giai đoạn 2 — Player Preload (Core Fix)

### 5.1. Fix `preload='none'` trong BunnyVideoPlayer

**Vấn đề:** `useSharedVideo` tạo pool elements với `video.preload = 'none'`. Khi `video.src = src` được set trên iOS với `preload='none'`, iOS **không fetch gì** — decoder không khởi động cho đến khi `play()` được gọi.

**Fix:** Thêm `video.load()` explicit sau `video.src`:

```ts
// BunnyVideoPlayer.tsx — iOS path
video.src = src;
video.load(); // override preload='none': ép iOS bắt đầu fetch manifest + init decoder ngay khi mount
```

`video.load()` bỏ qua `preload` attribute, buộc iOS AVFoundation bắt đầu fetch + allocate hardware decoder.

### 5.2. State machine: strict 2-decoder

```
RULE: Tối đa 2 active HLS instance (= 2 iOS hardware decoder) đồng thời

Khi currentIndex = N:
  index < N    →  deactivated (unmount)
  index = N    →  active + playing        (decoder 1)
  index = N+1  →  preloaded, không play   (decoder 2)
  index > N+1  →  not mounted
```

### 5.3. `currentIndexReady` flag trong hook

`currentIndex` khởi tạo `useState(0)`. Trước khi `indexInitialized` effect chạy, `currentIndex=0` dù `initialIndex` có thể khác 0 → kích hoạt sai slides.

**Fix:** Export `currentIndexReady` để VideoDetailPage chỉ dùng `currentIndex` khi đã chính xác:

```ts
// use-video-detail-feed.ts
const [currentIndexReady, setCurrentIndexReady] = useState(false);

useEffect(() => {
  if (indexInitialized.current || videos.length === 0) return;
  setCurrentIndex(initialIndex);
  setCurrentIndexReady(true); // ← đánh dấu currentIndex đã được set đúng
  indexInitialized.current = true;
}, [initialIndex, videos.length]);
```

### 5.4. `isCurrentOrNext` prop thay thế `isNearView` activation

**VideoDetailPage:**

```tsx
<VideoSlide
  autoLoad={index === initialIndex || index === initialIndex + 1}
  isCurrentOrNext={currentIndexReady && (index === currentIndex || index === currentIndex + 1)}
  // ...
/>
```

- `autoLoad`: seed initial `activated` state (dùng `initialIndex` — luôn đúng)
- `isCurrentOrNext`: ongoing activation sau khi `currentIndex` ready

**VideoSlide — thay activation effect:**

```tsx
// Bỏ: const isNearView = useInView(containerEl, { rootMargin: '100% 0px', threshold: 0 });

React.useEffect(() => {
  if (isCurrentOrNext) {
    hasActivatedOnce.current = true;
    setActivated(true);
  } else if (hasActivatedOnce.current) {
    setActivated(false);
    setVideoReady(false);
  }
}, [isCurrentOrNext]);
```

---

## 6. Luồng hoạt động sau khi implement

```
Page load (currentIndex = initialIndex = N):
  → eagerPrefetch fires → prefetchHls(N), prefetchHls(N+1), prefetchHls(N+2)
     [HTTP cache warming bắt đầu]
  → currentIndexReady=true → VideoSlide N+1: isCurrentOrNext=true
     → BunnyVideoPlayer mount → video.src + video.load()
     → iOS: fetch manifest từ HTTP cache (~20-50ms) → decoder alloc (~50-150ms)
     → canplay fires → N+1 SẴNSÀNG
  → VideoSlide N: playing (autoLoad + isCurrentOrNext)

User swipe lên (N → N+1, > 400ms sau load):
  → currentIndex = N+1
  → VideoSlide N+1: isInView=true → play() → [decoder đã sẵn sàng] → phát NGAY
  → VideoSlide N: isCurrentOrNext=false, hasActivatedOnce=true → deactivated
     [iOS decoder N được giải phóng]
  → VideoSlide N+2: isCurrentOrNext=true → mount + video.load() → bắt đầu preload
```

---

## 7. Giới hạn với fast swipe

| Tốc độ      | Interval  | Kết quả        |
| ----------- | --------- | -------------- |
| Bình thường | > 400ms   | ✅ 0ms stutter |
| Nhanh       | 200-400ms | ⚠️ 0-100ms     |
| Rất nhanh   | < 200ms   | ⚠️ 100-200ms   |

**iOS hardware decoder alloc (~50-150ms) là OS-level operation — không thể cache hay bypass.** Đây là giới hạn cứng của iOS, không phải bug trong implementation.

---

## 8. Quyết định thiết kế

| Điểm                                | Quyết định          | Lý do                                                            |
| ----------------------------------- | ------------------- | ---------------------------------------------------------------- |
| `video.load()` explicit             | Bắt buộc            | Pool elements có `preload='none'` → không load nếu thiếu         |
| `isCurrentOrNext` thay `isNearView` | Dùng `currentIndex` | `isNearView` (100% rootMargin) = 3 decoder, vi phạm iOS limit    |
| `currentIndexReady` flag            | Bắt buộc            | Tránh `currentIndex=0` kích hoạt sai slides khi initialIndex>0   |
| `autoLoad` cho initial state        | Giữ nguyên          | Dùng `initialIndex` (đúng ngay lần đầu) làm seed activated state |
| Preload N+1 only, không N+2         | Giữ nguyên          | Max 2 decoder: N (playing) + N+1 (preloaded)                     |
| Eager prefetch dùng `initialIndex`  | Bắt buộc            | `currentIndex=0` trước init — prefetch sai nếu dùng currentIndex |

---

## 9. Verification

| #   | Test                                    | Pass condition                                            |
| --- | --------------------------------------- | --------------------------------------------------------- |
| 1   | DevTools Network → filter `vz-186cf1b9` | `playlist.m3u8` của N+1 được fetch trước khi user swipe   |
| 2   | Swipe từ N sang N+1 (bình thường)       | Video N+1 play trong < 200ms                              |
| 3   | Swipe nhanh liên tục (stress test)      | Không có slide nào black screen > 500ms                   |
| 4   | iOS Safari — swipe 5 slide              | Không freeze, không crash, tiếng liên tục                 |
| 5   | DevTools Memory                         | Chỉ 2 active video element có src tại mọi thời điểm       |
| 6   | iOS Instruments                         | Không có VideoToolbox error (no software decode fallback) |
| 7   | Reload URL → bấm Gate                   | Gate mở → N phát → swipe N+1 không khựng                  |

---

## 10. Không thuộc scope

- Blur-up thumbnail
- Preload N-1 (prev slide)
- Android/Chrome optimization (hls.js path khác — đánh giá sau)
- Adaptive preload theo network speed
