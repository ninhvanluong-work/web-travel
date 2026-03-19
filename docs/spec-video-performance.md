# Spec: Video Performance — Phân Tích & Thảo Luận

> **Liên quan:** [video-format-strategy.md](./video-format-strategy.md) — encoding standards, CDN, format decisions
> **Scope của doc này:** Frontend loading behavior, preload strategy, UX perceived performance

---

## 1. Vấn đề

User phản ánh video **load chậm** — cả trong grid search lẫn feed TikTok-style. Cần xác định rõ nguyên nhân trước khi fix để tránh làm sai chỗ.

**Mục tiêu thảo luận:**

- Xác nhận các vấn đề thực sự đang xảy ra (vs vấn đề perceived)
- Đồng thuận về giải pháp nào implement trước
- Phân công frontend vs backend

---

## 2. Hiện trạng code

### 2.1 VideoCard — Grid Search (`src/modules/DetailSearchPage/components/VideoCard.tsx`)

```
preload="auto"          ← browser load ngay khi element mount
+
isNear effect (500px)   ← JS gọi videoEl.load() khi gần viewport
```

**Xung đột:** Hai cơ chế cùng trigger loading. `preload="auto"` khiến browser bắt đầu tải khi card mount (dù còn rất xa viewport), sau đó `isNear` lại gọi `.load()` lần nữa → **double load, tốn băng thông**.

Logic `isNear` đang làm đúng việc (control timing của load), nhưng `preload="auto"` đang "phá" nó.

### 2.2 DetailSearchPage — Ghost Preloader (`src/modules/DetailSearchPage/index.tsx:61-76`)

```js
// Tạo hidden <video> elements, gọi .load(), xong destroy
const el = document.createElement('video');
el.src = v.shortUrl;
el.preload = 'auto';
el.load();
```

**Mục đích:** Workaround iOS Safari ignore `<link rel="preload">` và `preload="auto"` trên video elements — cách duy nhất force browser prime HTTP cache là explicit `.load()` call.

**Vấn đề:** Load toàn bộ 6 video của page mới **ngay khi API trả về**, dù user chưa scroll tới. Không có visibility check → lãng phí bandwidth nếu user không scroll thêm.

### 2.3 VideoDetailPage — TikTok Feed (không có vấn đề lớn)

Preload theo distance — pattern tốt:

| Khoảng cách với video hiện tại | `preload` attribute |
| ------------------------------ | ------------------- |
| 0 (current), +1 (next)         | `auto`              |
| ±1 đến ±2                      | `metadata`          |
| Còn lại                        | `none`              |

→ Không cần thay đổi phần này.

### 2.4 Backend/Infrastructure (tham chiếu video-format-strategy.md)

- Raw MP4, không có HLS adaptive bitrate
- CDN: DigitalOcean Spaces — **chưa rõ đã bật Spaces CDN chưa** (xem [video-format-strategy.md §5](./video-format-strategy.md))
- Không rõ `movflags +faststart` có được áp dụng cho video hiện tại không

---

## 3. Vấn đề được xác định

| #   | Vấn đề                                                              | Severity | Scope          |
| --- | ------------------------------------------------------------------- | -------- | -------------- |
| P1  | `preload="auto"` conflict với `isNear` trong VideoCard              | HIGH     | Frontend       |
| P2  | Ghost preloader không kiểm soát visibility                          | MEDIUM   | Frontend       |
| P3  | Video thiếu `movflags +faststart` (play phải load xong mới bắt đầu) | HIGH     | Backend/Upload |
| P4  | CDN chưa bật hoặc chưa verify                                       | HIGH     | Infrastructure |
| P5  | Không có adaptive bitrate (HLS)                                     | MEDIUM   | Backend        |
| P6  | Không có loading skeleton                                           | LOW      | Frontend (UX)  |

> **P3 & P4 có thể là nguyên nhân chính** — nếu video không có faststart và CDN chưa bật thì dù frontend tốt đến mấy vẫn chậm.

---

## 4. Giải pháp đề xuất

### S1 — Fix `preload="none"` trong VideoCard

**Làm gì:** Đổi `preload="auto"` → `preload="none"`, để `isNear` effect hoàn toàn kiểm soát timing.

```diff
// VideoCard.tsx:73
- preload="auto"
+ preload="none"
```

**Effort:** Very Low | **Impact:** Medium | **Scope:** Frontend only
**Trade-off:** Không còn browser-native preload hint, nhưng `isNear` (500px margin) đã xử lý tốt việc này.

---

### S2 — Refactor Ghost Preloader

**Làm gì:** Thay vì load tất cả 6 video ngay khi page data về, chỉ load khi sentinel element gần viewport (lazy ghost preload).

**Effort:** Low | **Impact:** Low-Medium | **Scope:** Frontend only
**Trade-off:** Mất đi "tải trước khi user thấy" nhưng tiết kiệm bandwidth đáng kể nếu user không scroll.
**Câu hỏi:** Ghost preloader hiện tại có thực sự giúp ích không? Cần đo trước khi refactor.

---

### S3 — Verify + Bật Spaces CDN

**Làm gì:** Kiểm tra DigitalOcean Spaces console → bật CDN endpoint. Cập nhật `NEXT_PUBLIC_API_URL` hoặc video URLs dùng CDN domain.

**Effort:** Very Low | **Impact:** Very High | **Scope:** Infrastructure
**Trade-off:** Không có — đây là việc bắt buộc phải làm.
**Note:** Chi tiết xem [video-format-strategy.md §5](./video-format-strategy.md).

---

### S4 — Re-encode Video với `+faststart`

**Làm gì:** Batch re-encode toàn bộ video hiện tại với `movflags +faststart`. Video mới upload phải pass qua pipeline encode chuẩn.

```bash
# Encode chuẩn — chi tiết tại video-format-strategy.md §6
ffmpeg -i input.mp4 -movflags +faststart ... output.mp4
```

**Effort:** Medium (cần script + thời gian encode) | **Impact:** High | **Scope:** Backend
**Trade-off:** Cần thời gian, có thể ảnh hưởng URL nếu thay file.

---

### S5 — HLS Adaptive Bitrate Streaming

**Làm gì:** Convert video → HLS (`.m3u8` + segments), dùng `hls.js` trên frontend. Browser tự chọn quality phù hợp với bandwidth.

```
1080p: 3000 kbps → cho WiFi
720p:  1000 kbps → cho 4G  ← default
480p:   500 kbps → cho 3G yếu
```

**Effort:** High | **Impact:** Very High (đặc biệt mạng yếu) | **Scope:** Backend + Frontend
**Trade-off:** Phức tạp hơn nhiều, cần storage thêm (nhiều file per video), cần backend transcoding pipeline.
**Note:** Chỉ nên làm sau khi S3 + S4 đã xong và vẫn chưa đủ.

---

### S6 — Loading Skeleton cho Video Grid

**Làm gì:** Hiển thị skeleton cards trong khi API đang fetch, thay vì màn hình trống.

**Effort:** Low | **Impact:** Medium (perceived performance) | **Scope:** Frontend
**Trade-off:** Không có — đây là UX improvement đơn thuần.

---

## 5. Ma trận quyết định

| Giải pháp                     | Effort   | Impact    | Priority | Ghi chú                   |
| ----------------------------- | -------- | --------- | -------- | ------------------------- |
| S3 — Bật CDN                  | Very Low | Very High | **#1**   | Làm ngay                  |
| S4 — Faststart re-encode      | Medium   | High      | **#2**   | Làm ngay nếu CDN chưa bật |
| S1 — Fix preload="none"       | Very Low | Medium    | **#3**   | Quick win, 1 line change  |
| S6 — Skeleton                 | Low      | Medium    | **#4**   | UX, độc lập               |
| S2 — Ghost preloader refactor | Low      | Low-Med   | **#5**   | Cần đo trước              |
| S5 — HLS                      | High     | Very High | **#6**   | Long-term                 |

---

## 6. Câu hỏi cần align

1. **CDN đã bật chưa?** — Check DO Spaces console. Nếu chưa thì đây là việc #1.
2. **Video hiện tại có `faststart` không?** — Check bằng `ffprobe -v quiet -print_format json -show_format video.mp4 | grep start`.
3. **Ghost preloader (S2) có hiệu quả thực tế không?** — Đánh giá bằng Network tab DevTools, xem có cache hit không.
4. **Short URL (`shortUrl`) và full URL (`link`) khác nhau thế nào?** — File riêng hay cùng file? Resolution khác nhau? Nếu `shortUrl` vẫn dùng file full-res thì grid đang load file quá nặng.
5. **HLS (S5) có trong roadmap không?** — Quyết định này ảnh hưởng đến backend architecture.

---

## 7. Đề xuất action ngay (không cần thảo luận thêm)

Những việc này an toàn, effort thấp, không có risk:

- [ ] Verify CDN status trên DigitalOcean Spaces
- [ ] Fix `preload="none"` trong `VideoCard.tsx` (1 line)
- [ ] Thêm loading skeleton cho video grid

---

_Tạo: 2026-03-19_
