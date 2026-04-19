# Spec: Video Preload — Eliminating Swipe Stutter

**Trạng thái:** Ready for Implementation  
**Ngày:** 2026-04-17  
**Scope:** Mobile only — iOS Safari + Android Chrome  
**Constraint:** Chỉ có HLS qua `embedUrl` Bunny Stream — không dùng MP4 trực tiếp  
**Liên quan:** `VideoDetailPage`, `VideoSlide`, `BunnyVideoPlayer`, `use-video-detail-feed`, `use-shared-video`

---

## 1. Mô tả vấn đề

Khi user vuốt từ slide N → N+1, video bị **đen màn hình / khựng 1–2 giây** trước khi phát.  
Mục tiêu: video phải **sẵn sàng phát ≤ 150ms** sau khi snap animation kết thúc.

---

## 2. Tại sao TikTok/Reels không bị khựng? (Insight)

Họ dùng **real `<video>` element** để preload — không dùng `<link rel="preload">` hay `fetch()`. Lý do:

```
browser.fetch()   →  HTTP cache (Application layer)
<link as="fetch"> →  HTTP cache (Application layer)  ← CÙNG cache, nhưng...
<video src="..."> →  Media pipeline cache (OS level)  ← KHÁC HOÀN TOÀN trên iOS!
```

**Platform target:**

- **iOS Safari** → dùng **AVFoundation** (native HLS). AVFoundation có media cache riêng, không chia sẻ với HTTP cache. Chỉ `<video src>` mới trigger đúng cache này.
- **Android Chrome** → dùng **hls.js**. Manifest đã parse sẵn → fragment fetch bắt đầu sớm hơn.

**Nguyên tắc TikTok áp dụng:**

1. Ngay khi feed data về → gắn `src` vào hidden `<video>` element → browser tự buffer ngầm
2. Khi user vuốt đến → `canplay` đã fire từ trước → `play()` gần như instant

---

## 3. Root Cause Analysis

### 3.1 Pipeline hiện tại (tracing từ user swipe)

```
[User bắt đầu vuốt]
  → snap animation chạy ~150ms
  → IntersectionObserver (threshold=0.6) fire khi slide vào viewport
      → onVisible() → handleVideoTestVisible()
          → prefetchHls()    ← ❌ as="fetch" → iOS media cache miss
          → onIndexChange()  → slideRefs.get(i+1)?.preload()
              → hls.startLoad(0)  ← ❌ iOS: hlsRef = null (no-op!)
      → play() được gọi trên slide i
          → hls.startLoad(0) → fetch fragment 0 (~300ms, 200kB)
          → canplay fire → video phát

TOTAL DELAY sau khi slide full-screen: 300ms–1500ms
```

### 3.2 Chi tiết từng vấn đề (Mobile only)

| #     | Vấn đề                                                                               | Platform | File                            | Mức độ      |
| ----- | ------------------------------------------------------------------------------------ | -------- | ------------------------------- | ----------- |
| **A** | `prefetchHls()` dùng `as="fetch"` → iOS media pipeline cache miss                    | iOS      | `use-video-detail-feed.ts:L28`  | 🔴 Critical |
| **B** | `preload()` gọi `hls.startLoad()` nhưng iOS dùng native HLS → `hlsRef=null` → no-op  | iOS      | `BunnyVideoPlayer.tsx:L121`     | 🔴 Critical |
| **C** | `autoStartLoad: false` → fragment chỉ fetch khi `play()`, không fetch trước          | Android  | `BunnyVideoPlayer.tsx:L173`     | 🟠 High     |
| **D** | Preload slide `i+1` trigger **đồng thời** với `play()` slide `i` → cả hai cold-start | Both     | `index.tsx:L19`                 | 🟠 High     |
| **E** | Preload chỉ trigger khi `onVisible()` fire (quá muộn — user đã vuốt xong)            | Both     | `use-video-detail-feed.ts:L196` | 🟠 High     |
| **F** | Slide index=1 không có gì preload ngay khi feed data về (khựng ngay lần đầu)         | Both     | `index.tsx:L91`                 | 🟠 High     |
| **G** | Pool element `video.preload = 'none'`                                                | Both     | `use-shared-video.ts:L10`       | 🟡 Low      |

---

## 4. Giải pháp: Shadow Preload Element

### 4.1 Core Concept

Giống TikTok — dùng **1 `<video>` element ẩn** (ngoài pool, ngoài DOM) để warm-up HLS trước khi user vuốt đến:

```
                     Invisible to user
                    ┌─────────────────┐
videos[i+1].url ──► │  Shadow Element  │ ──► buffer 2–3s ngầm
                    │  (off-DOM, muted) │     trong background
                    └─────────────────┘

User vuốt đến slide i+1:
  Pool element mount → attach HLS hoặc set src
  Segments đã có trong media cache (iOS) / HTTP cache (Android)
  canplay fire nhanh hơn ~300-800ms
```

### 4.2 Tại sao Shadow Element work cho cả iOS và Android?

**iOS Safari (Native HLS):**

```
Shadow element set src = "playlist.m3u8"
  → AVFoundation fetch manifest + segment files
  → Lưu vào iOS media cache (shared per URL, cùng process)

Pool element sau đó set src = "playlist.m3u8" (cùng URL)
  → AVFoundation check media cache → HIT → không fetch lại
  → canplay fire nhanh ✅
```

**Android Chrome (hls.js):**

```
Shadow hls.js attach → manifest parse xong ngay
  → Segment fetch bắt đầu sớm hơn ~300ms so với hiện tại
  → Nếu Bunny CDN có Cache-Control: max-age > 0:
       Pool hls.js → HTTP cache HIT → canplay ngay
  → Nếu Bunny CDN có Cache-Control: no-cache:
       Pool hls.js vẫn benefit vì manifest đã warm,
       chỉ cần fetch segments (không thêm round-trip manifest)
       → Giảm ~150-200ms delay ✅
```

> ✅ **Không cần verify Cache-Control:** Shadow element vẫn có hiệu quả trên Android dù CDN không cache, vì manifest parse overhead (~100-200ms) được loại bỏ.

### 4.3 Trigger Timing — "Preload ngay khi data về"

Insight từ TikTok: **không đợi user vuốt**, preload ngay khi URL có trong `videos` array:

```
Hiện tại:  videos data về → user vuốt → onVisible() → preload(i+1)
                                                         ↑ QUÁ MUỘN

Mới:       videos data về → preload(initialIndex+1) ngay lập tức
           onVisible(i)   → preload(i+1) [slide kế tiếp]
                                    ↑ SỚM HƠN, trước khi user vuốt
```

---

## 5. Implementation Plan

### 5.1 [NEW] `src/hooks/use-video-preloader.ts`

Hook quản lý shadow preload element. Singleton pattern — 1 element cho toàn app.

```typescript
// Pseudocode
const shadowVideo = createHiddenVideoElement(); // ngoài DOM, muted, playsInline
let shadowHls: Hls | null = null;
let currentUrl: string | null = null;

function preload(embedUrl: string) {
  const m3u8Url = extractM3u8Url(embedUrl);
  if (currentUrl === m3u8Url) return; // already preloading this URL

  cancel(); // cleanup previous
  currentUrl = m3u8Url;

  // iOS Safari — native HLS
  if (shadowVideo.canPlayType('application/vnd.apple.mpegurl')) {
    shadowVideo.src = m3u8Url;
    shadowVideo.load(); // trigger native buffer
    return;
  }

  // Android Chrome — hls.js
  if (Hls.isSupported()) {
    shadowHls = new Hls({
      autoStartLoad: true, // KHÁC pool player: load fragment ngay
      maxBufferLength: 3, // Chỉ buffer 3s, tránh waste bandwidth
      startLevel: 0, // 240p trước
    });
    shadowHls.loadSource(m3u8Url);
    shadowHls.attachMedia(shadowVideo);
  }
}

function cancel() {
  shadowVideo.src = '';
  shadowVideo.load();
  shadowHls?.destroy();
  shadowHls = null;
  currentUrl = null;
}

export function useVideoPreloader() {
  return { preload, cancel };
}
```

**Lưu ý thiết kế:**

- Shadow element **không** được append vào DOM → tránh layout impact
- Shadow element **không** phát tiếng (muted=true, không gọi play())
- iOS: chỉ gọi `load()`, không `play()` → không chiếm hardware decoder slot
- Android: hls.js với `maxBufferLength: 3` → buffer ~3s ≈ 600kB, đủ cho smooth swipe

---

### 5.2 [MODIFY] `src/components/BunnyVideoPlayer.tsx`

Fix `preload()` cho iOS native path (hiện là no-op):

```typescript
// Thêm: ref lưu src để preload() có thể dùng
const srcRef = useRef(src);
srcRef.current = src;

preload: () => {
  shouldPreloadRef.current = true;
  const video = videoElRef.current;

  // iOS native HLS path — hlsRef.current luôn null trên iOS
  if (video && video.canPlayType('application/vnd.apple.mpegurl')) {
    if (!video.src) {
      video.src = srcRef.current; // kick off native buffer
      video.load();
    }
    return;
  }

  // hls.js path — giữ nguyên
  hlsRef.current?.startLoad(0);
},
```

---

### 5.3 [MODIFY] `src/modules/VideoDetailPage/index.tsx`

Thêm 2 trigger points:

```typescript
const { preload: preloadVideo } = useVideoPreloader();

// Trigger 1: Ngay khi feed data về — preload slide kế initialIndex
// Fix: khựng ngay từ slide 1 → 2 (lần đầu)
useEffect(() => {
  if (videos.length === 0) return;
  const nextVideo = videos[initialIndex + 1];
  if (nextVideo?.embedUrl) preloadVideo(nextVideo.embedUrl);
}, [videos, initialIndex]);

// Trigger 2: Mỗi lần visible slide thay đổi — preload slide tiếp theo
const { videos, handleVideoTestVisible, isReloadInitializing, initialIndex } = useVideoDetailFeed(
  currentSlug,
  (newIndex) => {
    const nextVideo = videos[newIndex + 1];
    if (nextVideo?.embedUrl) preloadVideo(nextVideo.embedUrl);
    slideRefs.current.get(newIndex + 1)?.preload(); // vẫn giữ: warmup pool element
  }
);
```

> **Tại sao giữ cả 2 trigger?**
>
> - Trigger 1: Fix slide 1→2 (lần đầu tiên, trước khi user vuốt)
> - Trigger 2: Fix slide N→N+1 (mọi swipe tiếp theo)

---

### 5.4 [MODIFY] `src/hooks/use-video-detail-feed.ts`

Bỏ `prefetchHls()` — không hiệu quả (`as="fetch"` không work trên iOS mobile):

```typescript
// XÓA: function prefetchHls() và toàn bộ <link rel="preload"> logic
// XÓA: các dòng gọi prefetchHls() trong handleVideoTestVisible
// GIỮ: onIndexChange callback (useVideoPreloader xử lý thay thế)
```

---

### 5.5 [MODIFY] `src/hooks/use-shared-video.ts`

Minor fix — hint browser sớm hơn:

```typescript
// Thay:
video.preload = 'none';
// Thành:
video.preload = 'metadata'; // cho phép browser fetch đủ metadata, không block
```

---

## 6. Timeline so sánh (sau khi fix)

### Slide 1 → 2 (lần đầu):

```
t=0ms      Feed API response về → videos[1] có URL
t=5ms      Trigger 1: preloadVideo(videos[1].embedUrl) → shadow element bắt đầu buffer

[User chưa vuốt gì cả, shadow đang buffer ngầm]

t=~400ms   Shadow element: manifest parsed + fragment 0 buffer xong
t=???ms    User bắt đầu vuốt (có thể là sau vài giây)
t=+10ms    snap animation kết thúc → play() gọi → Media cache HIT (iOS) / manifest warm (Android)
t=+50ms    canplay fire → VIDEO PHÁT ✅
```

### Slide N → N+1 (mọi swipe tiếp theo):

```
t=0ms      User đang xem slide N → onVisible(N) fire → Trigger 2: preloadVideo(N+1)
t=~400ms   Shadow buffer xong trước khi user kịp vuốt

[User vuốt]
t=+50ms    Video N+1 phát ngay ✅
```

---

## 7. Files cần thay đổi

| File                                    | Action       | Mô tả                                     |
| --------------------------------------- | ------------ | ----------------------------------------- |
| `src/hooks/use-video-preloader.ts`      | **[NEW]**    | Shadow preload element + hls.js warm-up   |
| `src/components/BunnyVideoPlayer.tsx`   | **[MODIFY]** | Fix `preload()` cho iOS native path       |
| `src/modules/VideoDetailPage/index.tsx` | **[MODIFY]** | 2 trigger points: onMount + onIndexChange |
| `src/hooks/use-video-detail-feed.ts`    | **[MODIFY]** | Xóa `prefetchHls()`                       |
| `src/hooks/use-shared-video.ts`         | **[MODIFY]** | `preload='metadata'`                      |

---

## 8. Open Questions

> [!IMPORTANT] > **Q1: Shadow element khi app vào background (iOS)?**
> iOS có thể suspend network loading khi tab không active. Shadow element không phát tiếng nhưng vẫn dùng network.
> → Handle bằng `document.addEventListener('visibilitychange', cancel)` — nếu tab hidden thì cancel preload.
> → Edge case, implement sau nếu cần.

> [!TIP] > **Q2: Preload 1 hay 2 slides trước?**
> Spec hiện tại preload 1 slide trước (`i+1`). Nếu user swipe rất nhanh thì chưa đủ.
> → Đề xuất: bắt đầu với 1, measure trên device thực, quyết định sau.

> [!TIP] > **Q3: Shadow element maxBufferLength trên 3G?** > `maxBufferLength: 3` tương đương ~600kB. Trên 3G (~1Mbps) = 5 giây fetch.
> → Có thể check `navigator.connection?.effectiveType` để giảm xuống 1s nếu 3G.

---

## 9. Verification Plan

- [ ] **Metric chính:** Chrome DevTools Performance → Record → Swipe → đo `play()` đến first painted frame
- [ ] iOS Safari: vuốt slide 1→2, `canplay` phải fire ≤ 150ms sau snap animation
- [ ] Android Chrome: Network tab — `.ts` segment phải có `(disk cache)` hoặc `(memory cache)`
- [ ] Không xuất hiện `[VideoPool] Pool exhausted` warning
- [ ] Không có 2 video cùng phát tiếng khi swipe nhanh
- [ ] Gate flow: reload → bật loa → vuốt (shadow preload không conflict với gate)
- [ ] Swipe ngược (xuống): shadow element chỉ preload forward, không backward

---

## 10. Rủi ro & Mitigation (Mobile)

| Rủi ro                                    | Platform | Xác suất   | Mitigation                                                         |
| ----------------------------------------- | -------- | ---------- | ------------------------------------------------------------------ |
| Shadow element chiếm iOS hardware decoder | iOS      | Thấp       | Không gọi `play()` — AVFoundation chỉ cấp decoder khi play         |
| 2 hls.js instances cùng fetch cùng URL    | Android  | Thấp       | Shadow cancel ngay khi `onVisible(i+1)` fire                       |
| Bandwidth waste trên 3G mobile            | Both     | Trung bình | `maxBufferLength: 3` (~600kB); có thể check `navigator.connection` |
| iOS suspend network khi background        | iOS      | Thấp       | Handle bằng `visibilitychange` cancel                              |
| Pool exhausted (3 elements không đủ)      | Both     | Rất thấp   | Shadow element không từ pool, không ảnh hưởng                      |
