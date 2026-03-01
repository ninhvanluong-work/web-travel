# Video Format Strategy — Phân Tích Kỹ Thuật

> **Ngữ cảnh:** Video lưu trên DigitalOcean Spaces, serve qua direct link.
> Frontend: `<video src={link} loop muted playsInline preload="metadata">`.
> Grid 2 cột → tối đa **4 video play đồng thời** trong viewport.
>
> Hướng dẫn đơn giản dành cho admin: xem [video-admin-guide.md](./video-admin-guide.md)

---

## 1. Pipeline & Hệ quả kỹ thuật

```
Upload thủ công → DigitalOcean Spaces → Direct link → <video src={link}>
```

- Không có transcoding tự động → format/chất lượng = đúng file được upload
- Không có adaptive streaming (HLS/DASH) → 1 quality cho mọi thiết bị
- Browser tự buffer từ link → phụ thuộc CDN + tốc độ mạng người dùng

---

## 2. So sánh format

| Tiêu chí                  | MP4 (H.264) | MP4 (H.265)    | WebM (VP9)   | WebM (AV1)   |
| ------------------------- | ----------- | -------------- | ------------ | ------------ |
| Browser support           | ✅ 100%     | ⚠️ Safari only | ✅ 95%+      | ⚠️ Chrome/FF |
| iOS/Safari                | ✅          | ✅             | ❌           | ❌           |
| File size so với H.264    | baseline    | ~35% nhỏ hơn   | ~25% nhỏ hơn | ~45% nhỏ hơn |
| CPU decode                | Thấp (HW)   | Thấp (HW)      | Trung bình   | Cao (SW)     |
| Phù hợp 4 video đồng thời | ✅ Tốt nhất | ✅ Tốt         | ⚠️ iOS fail  | ❌           |

**Kết luận: chọn MP4 + H.264**

- Code dùng `src={link}` đơn giản, không thể serve 2 format song song
- iOS/Safari bắt buộc phải có H.264
- Hardware decode → CPU thấp khi play nhiều video cùng lúc

---

## 3. So sánh thông số encode

### Resolution

| Resolution  | Tỉ lệ   | Ghi chú                                         |
| ----------- | ------- | ----------------------------------------------- |
| 1080×1440   | 3:4     | Overkill — mỗi ô grid chỉ ~190px trên iPhone 14 |
| **720×960** | **3:4** | **✅ Khuyến nghị — đủ sharp, file vừa phải**    |
| 540×720     | 3:4     | OK nếu ưu tiên tốc độ                           |
| 360×480     | 3:4     | Chất lượng thấp, tránh dùng                     |

### Bitrate

| Mục tiêu                   | Video         | Audio       | Tổng          | File 30s  |
| -------------------------- | ------------- | ----------- | ------------- | --------- |
| Ưu tiên chất lượng         | 1500 kbps     | 128 kbps    | ~1.6 Mbps     | ~6 MB     |
| **Cân bằng (khuyến nghị)** | **1000 kbps** | **96 kbps** | **~1.1 Mbps** | **~4 MB** |
| Ưu tiên tốc độ             | 700 kbps      | 64 kbps     | ~0.76 Mbps    | ~2.9 MB   |

> 4 video đồng thời = 4 × 1.1 Mbps = **~4.4 Mbps**
> 4G VN trung bình 15–25 Mbps → an toàn ✅ | 3G yếu 2–5 Mbps → có thể giật

### Framerate

| FPS       | Đánh giá                                     |
| --------- | -------------------------------------------- |
| 24fps     | File nhỏ hơn, cinematic — OK cho travel      |
| **30fps** | **✅ Chuẩn mobile, cân bằng tốt**            |
| 60fps     | File lớn ~2×, tốn CPU — không cần cho travel |

---

## 4. So sánh thời lượng

| Thời lượng | Dung lượng (~1.1 Mbps) | Trải nghiệm loop | Đánh giá        |
| ---------- | ---------------------- | ---------------- | --------------- |
| < 10s      | < 1.4 MB               | Lộ vòng lặp      | ⚠️ Quá ngắn     |
| **15–30s** | **2–4 MB**             | **Tự nhiên**     | **✅ Tốt nhất** |
| 30–60s     | 4–8 MB                 | OK               | ✅ Chấp nhận    |
| 60–90s     | 8–12 MB                | Tốt              | ⚠️ Load chậm    |
| > 90s      | > 12 MB                | Dư thừa          | ❌ Tránh        |

---

## 5. Tác động CDN

**Không có CDN:**

```
User (HN) ──────────────► DO Spaces (SGP) — ~50ms, không cache
```

4 video load cùng lúc × không cache = origin bị hit liên tục → chậm.

**Có Spaces CDN (miễn phí):**

```
User (HN) ──► CDN Edge (SGP/HK) ──► cache hit → ~5ms
```

Latency giảm 10×, file được cache → 4 video load gần như tức thì.

> ⚠️ **Bật CDN là việc ưu tiên #1, quan trọng hơn cả việc chọn format.**

---

## 6. FFmpeg encode chuẩn

```bash
ffmpeg -i input.mp4 \
  -vf "scale=720:960:force_original_aspect_ratio=decrease,pad=720:960:(ow-iw)/2:(oh-ih)/2,fps=30" \
  -c:v libx264 -profile:v main -crf 26 -preset slow \
  -c:a aac -b:a 96k \
  -movflags +faststart \
  -t 30 \
  output.mp4
```

| Flag                   | Ý nghĩa                                            |
| ---------------------- | -------------------------------------------------- |
| `scale=720:960`        | Resize về 3:4, pad nếu tỉ lệ lệch                  |
| `-crf 26`              | Quality target (thấp = đẹp hơn, cao = nhỏ hơn)     |
| `-preset slow`         | Encode chậm hơn nhưng file nhỏ hơn đáng kể         |
| `-movflags +faststart` | Metadata đầu file → play ngay, không cần load xong |
| `-t 30`                | Hard limit 30 giây                                 |

---

## 7. Quyết định cuối cùng

| Hạng mục          | Quyết định                              |
| ----------------- | --------------------------------------- |
| Format            | `.mp4` — H.264 (libx264) profile `main` |
| Audio             | AAC 96 kbps                             |
| Resolution        | 720×960                                 |
| Bitrate           | ~1000 kbps (CRF 26)                     |
| Framerate         | 30fps                                   |
| Thời lượng tối đa | 30 giây                                 |
| Dung lượng tối đa | 5 MB/file                               |
| CDN               | Bật Spaces CDN — bắt buộc               |
| `movflags`        | `+faststart` — bắt buộc                 |

---

## 8. Điểm còn mở

- [ ] CDN đã bật chưa? → Kiểm tra DigitalOcean Spaces settings
- [ ] Cần batch convert nhiều video không? → Script FFmpeg hoặc HandBrake CLI

---

_Cập nhật lần cuối: 2026-03-01_
