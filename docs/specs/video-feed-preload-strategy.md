# Spec: Video Feed Preload Strategy

**Ngày tạo:** 2026-03-31  
**Trạng thái:** Ready for implementation  
**Ưu tiên:** High

---

## 1. Bối cảnh & Vấn đề

Khi user vuốt sang slide tiếp theo trong `VideoDetailPage`, xuất hiện hiện tượng **khựng 1-2 giây** trước khi video bắt đầu phát. Root cause:

```
User vuốt → isNearView fire (IntersectionObserver ~100-300ms delay)
         → BunnyVideoPlayer mount
         → useSharedVideo inject pool element
         → video.src = m3u8
         → iOS AVFoundation / HLS.js fetch manifest (~200-400ms)
         → fetch segment đầu (~300-600ms)
         → canplay → play()
         ↳ TỔNG: 800ms - 1300ms khựng
```

Vấn đề hiện tại với `prefetchHls()`:

```
handleVideoTestVisible (slide N visible) → prefetchHls(N+1), prefetchHls(N+2)
  ↓ fetch bắt đầu...
User vuốt sang N+1 NGAY (~300ms sau)
  ↓ fetch chưa xong
video.src = m3u8 → iOS phải fetch lại vì cache chưa warm
```

→ `prefetchHls()` hiệu quả khi user xem lâu (> 1s) nhưng không đủ khi swipe nhanh.

---

## 2. Mục tiêu

- Loại bỏ hoàn toàn hiện tượng khựng khi vuốt sang slide tiếp theo
- **Giữ nguyên iOS hardware decoder constraint**: tối đa 2 active HLS instance đồng thời
- Không tăng thêm memory pressure đáng kể trên thiết bị cũ

---

## 3. Phạm vi thay đổi

| File                                                     | Giai đoạn | Loại thay đổi                           |
| -------------------------------------------------------- | --------- | --------------------------------------- |
| `src/pages/_document.tsx`                                | 1         | Add `<link>` hints                      |
| `src/hooks/use-video-detail-feed.ts`                     | 1         | Early prefetch khi list load            |
| `src/modules/VideoDetailPage/index.tsx`                  | 2         | Truyền `preloadNext` prop               |
| `src/modules/VideoDetailPage/components/video-slide.tsx` | 2         | Nhận `preloadNext`, override activation |

---

## 4. Giai đoạn 1 — Network Warm-up (Quick Wins)

### 4.1. Preconnect CDN trong `_document.tsx`

Thêm vào `<Head>`:

```tsx
// src/pages/_document.tsx
<link rel="preconnect" href="https://vz-186cf1b9-231.b-cdn.net" crossOrigin="anonymous" />
<link rel="dns-prefetch" href="https://vz-186cf1b9-231.b-cdn.net" />
```

**Effect:** TCP + TLS handshake với Bunny CDN thực hiện ngay khi page load, tránh latency khi request đầu tiên.  
**iOS safe:** ✅ Không tạo decoder, không tốn memory.

---

### 4.2. Early prefetch khi video list available

**File:** `src/hooks/use-video-detail-feed.ts`

Hiện tại `prefetchHls()` chỉ được gọi trong `handleVideoTestVisible` (khi slide đang xem). Thêm early batch prefetch ngay khi `videos` có data lần đầu:

```ts
// Prefetch HLS cho các video xung quanh initialIndex ngay khi list có data.
// Mục tiêu: warm HTTP cache trước khi user bắt đầu swipe.
// Chỉ fire 1 lần duy nhất (deps: videos.length > 0).
const eagerPrefetchDone = useRef(false);
useEffect(() => {
  if (eagerPrefetchDone.current || videos.length === 0) return;
  eagerPrefetchDone.current = true;

  // Prefetch: initialIndex (current), initialIndex+1, initialIndex+2
  [initialIndex, initialIndex + 1, initialIndex + 2].forEach((i) => {
    const v = videos[i];
    if (v?.embedUrl) prefetchHls(v.embedUrl);
  });
}, [videos.length > 0]); // eslint-disable-line react-hooks/exhaustive-deps
```

> **Note:** deps array dùng `videos.length > 0` (boolean) thay vì `videos` để tránh re-run mỗi khi list grow (infinite scroll append thêm items). Guard `eagerPrefetchDone.current` đảm bảo chỉ fire 1 lần.

**Effect:** Segments video N, N+1, N+2 bắt đầu vào browser HTTP cache ngay khi data về, thay vì chờ user đến slide đó mới fetch.  
**iOS safe:** ✅ Chỉ là HTTP fetch, không tạo HTMLVideoElement hay decoder.

---

## 5. Giai đoạn 2 — Player Preload (Core Fix)

### 5.1. Nguyên tắc thiết kế

```
RULE: Tối đa 2 active HLS instance (= 2 iOS hardware decoder) đồng thời
RULE: Deactivate phải xảy ra TRƯỚC activation (không để IntersectionObserver quyết định)
RULE: Chỉ preload slide TIẾP THEO (N+1), không preload N+2

State machine khi currentIndex = N:
  index < N-1  →  deactivated (unmount)
  index = N-1  →  deactivated (unmount ngay khi N mở)
  index = N    →  active + playing
  index = N+1  →  preloaded (mounted, src loaded, PAUSE — chờ user đến)
  index > N+1  →  not mounted
```

### 5.2. Thay đổi trong `VideoDetailPage/index.tsx`

Export `currentIndex` từ hook (đã có sẵn, chỉ cần destructure thêm):

```tsx
const { videos, handleVideoTestVisible, isReloadInitializing, initialIndex, currentIndex } =
  useVideoDetailFeed(currentSlug);
```

Tính `preloadNext` cho mỗi slide:

```tsx
{
  videos.map((video, index) => (
    <VideoSlide
      key={video.slug}
      video={video}
      muted={muted}
      onVisible={handleVideoTestVisible}
      onMutedChange={handleMutedChange}
      onGateOpen={() => setGated(false)}
      autoLoad={Math.abs(index - initialIndex) <= 1}
      preloadNext={index === currentIndex + 1} // NEW: preload slide kế tiếp
      forcePause={gated}
    />
  ));
}
```

### 5.3. Thay đổi trong `VideoSlide`

**Thêm prop `preloadNext`:**

```tsx
interface Props {
  video: IVideo;
  muted: boolean;
  onVisible: (slug: string) => void;
  onMutedChange: (muted: boolean) => void;
  onGateOpen?: () => void;
  autoLoad?: boolean;
  preloadNext?: boolean; // NEW: true khi slide này là N+1
  forcePause?: boolean;
}
```

**Override activation logic:**

```tsx
// Hiện tại: chỉ IntersectionObserver (isNearView) quyết định activated
// Mới: preloadNext cũng có thể force activate

React.useEffect(() => {
  if (isNearView || preloadNext) {
    // Activate: mount BunnyVideoPlayer, bắt đầu load HLS
    hasActivatedOnce.current = true;
    setActivated(true);
  } else if (hasActivatedOnce.current) {
    // Deactivate: unmount player, trả pool element, giải phóng iOS decoder
    setActivated(false);
    setVideoReady(false);
  }
}, [isNearView, preloadNext]);
```

**Quan trọng — Không auto-play khi preload:**

Logic play hiện tại trong effect `[isInView, ...]` đã đúng — chỉ play khi `isInView = true`. Khi `preloadNext = true` nhưng `isInView = false` → player mounted và load HLS nhưng **không play**. Không cần thay đổi.

---

## 6. Luồng hoạt động sau khi implement

```
Page load (currentIndex = N = initialIndex):
  → eagerPrefetchDone fires → prefetchHls(N), prefetchHls(N+1), prefetchHls(N+2)
     [HTTP cache warming bắt đầu]
  → preloadNext = (N+1): VideoSlide N+1 được mounted, BunnyVideoPlayer init
     video.src = m3u8 → iOS kéo từ HTTP cache → decoder init ngầm
  → VideoSlide N: playing (có tiếng)

User bắt đầu swipe lên (hướng N+1):
  → snap → currentIndex = N+1
  → VideoSlide N+1: isInView = true → play() → [video đã sẵn sàng!] → phát NGAY
  → VideoSlide N: isInView = false → pause()
  → preloadNext update: N+2 bắt đầu preload
  → VideoSlide N-1: preloadNext = false, isNearView = false → deactivated
     [iOS decoder N-1 được giải phóng]
```

→ **User không thấy delay** — N+1 đã có decoder initialized và segments buffered.

---

## 7. Quyết định thiết kế

| Điểm                                | Quyết định                        | Lý do                                                                                                                                   |
| ----------------------------------- | --------------------------------- | --------------------------------------------------------------------------------------------------------------------------------------- |
| Preload bao nhiêu slide?            | Chỉ N+1 (1 slide kế tiếp)         | Max 2 decoder: N (playing) + N+1 (preloaded). N+2 trở đi chỉ warm HTTP cache.                                                           |
| Deactivate ngay N-1?                | Có — ngay khi currentIndex tăng   | Giải phóng decoder trước khi N+1 init, tránh exceed 2-decoder limit                                                                     |
| Preload N-1 (prev slide)?           | Không                             | User 99% swipe tiếp, không swipe lại. Tiết kiệm decoder cho N+1.                                                                        |
| `preloadNext` vs tăng `rootMargin`? | `preloadNext`                     | `rootMargin 200%` gây race condition: IntersectionObserver có thể fire N-1 = true trước khi N+1 deactivate. `currentIndex` precise hơn. |
| deps array của eagerPrefetch        | `[videos.length > 0]` + ref guard | Tránh re-run khi list grow. `useEffect` cần deps để lint pass, boolean đủ.                                                              |
| iOS decoder budget                  | Strict 2                          | iPhone cũ chỉ có 2 hardware slot. Vượt → software decode giật/nóng máy.                                                                 |

---

## 8. Verification

### Giai đoạn 1

| #   | Test                                    | Pass condition                                                               |
| --- | --------------------------------------- | ---------------------------------------------------------------------------- |
| 1   | DevTools Network → filter `vz-186cf1b9` | Thấy `preconnect` được resolve trước request đầu tiên                        |
| 2   | Mở feed, xem Network waterfall          | `playlist.m3u8` của video N+1 được fetch trước khi IntersectionObserver fire |

### Giai đoạn 2

| #   | Test                                 | Pass condition                                              |
| --- | ------------------------------------ | ----------------------------------------------------------- |
| 3   | Swipe từ slide N sang N+1            | Video N+1 play **trong < 200ms** (không thấy spinner)       |
| 4   | Swipe nhanh liên tục (stress test)   | Không có slide nào black screen > 500ms                     |
| 5   | iOS Safari — swipe 5 slide liên tiếp | Không freeze, không crash, tiếng liên tục                   |
| 6   | DevTools Memory (Chrome)             | Chỉ 2 active video element có src tại mọi thời điểm         |
| 7   | iOS — xDiagnose / Instruments        | Không có software decode fallback (no "VideoToolbox error") |
| 8   | Reload direct URL, bấm Gate          | Gate mở → video N phát → swipe N+1 không bị khựng           |

---

## 9. Rủi ro & Mitigations

| Rủi ro                                              | Khả năng     | Mitigation                                                                                               |
| --------------------------------------------------- | ------------ | -------------------------------------------------------------------------------------------------------- |
| iOS decoder exceed 2 trong race condition           | Thấp         | Deactivate N-1 synchronous khi currentIndex tăng (driven bởi prop, không phụ thuộc IntersectionObserver) |
| Pool exhausted (3 elements, 2 active)               | Rất thấp     | Pool = 3, max active = 2 → luôn còn 1 element available                                                  |
| `eagerPrefetchDone` fire trước `initialIndex` ready | Thấp         | Guard: `videos.length > 0 && initialIndex` — nếu `initialIndex` chưa tính được thì bỏ qua lần này        |
| Phát nhầm N+1 (preloaded) khi gated                 | Không xảy ra | `forcePause` prop vẫn có tác dụng, `play()` không được gọi khi `isInView = false`                        |

---

## 10. Không thuộc scope

- Blur-up thumbnail (UX polish — spec riêng nếu cần)
- Preload N-1 (prev slide)
- Preload trên Android/Chrome (HLS.js path khác biệt — đánh giá sau khi iOS fix ổn định)
- Adaptive preload dựa trên network speed
