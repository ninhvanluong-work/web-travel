# Báo Cáo: Tiêu Chuẩn Upload Video Tốt Nhất

## Dành Cho Đối Tác & Khách Hàng Cung Cấp Nội Dung

> **Ngày:** 02/03/2026
> **Phiên bản:** 1.0
> **Đối tượng:** Đối tác, admin nội dung, nhà cung cấp video

---

## Mục Lục

1. [Tóm Tắt Điều Hành](#1-tóm-tắt-điều-hành)
2. [Tại Sao Video Cần Chuẩn Hóa?](#2-tại-sao-video-cần-chuẩn-hóa)
3. [Tiêu Chuẩn Bắt Buộc](#3-tiêu-chuẩn-bắt-buộc)
4. [Hướng Dẫn Thực Hành](#4-hướng-dẫn-thực-hành)
5. [Lỗi Thường Gặp & Cách Tránh](#5-lỗi-thường-gặp--cách-tránh)
6. [So Sánh Kỹ Thuật](#6-so-sánh-kỹ-thuật)
7. [Khuyến Nghị Ưu Tiên](#7-khuyến-nghị-ưu-tiên)
8. [Checklist Upload](#8-checklist-upload)

---

## 1. Tóm Tắt Điều Hành

Ứng dụng du lịch hiển thị **đồng thời 4 video** trong một màn hình theo dạng lưới dọc. Mỗi video phát tự động, lặp vòng, không tiếng. Đây là điều kiện kỹ thuật khác biệt hoàn toàn so với upload video thông thường lên YouTube hay Facebook.

**3 yêu cầu cốt lõi:**

- File `.mp4` — chạy được trên mọi điện thoại kể cả iPhone
- Dọc (portrait) — khớp với layout grid của app
- Nhỏ gọn (≤ 5 MB) — 4 video load cùng lúc, file nặng gây giật lag

Video đạt chuẩn sẽ **load gần như tức thì**, loop mượt mà, và không hao pin người dùng. Video không đạt chuẩn gây giật lag, crop xấu, hoặc không chạy được trên một số điện thoại.

---

## 2. Tại Sao Video Cần Chuẩn Hóa?

### Bối cảnh kỹ thuật của ứng dụng

```
┌─────────────────────────────┐
│         Màn hình app        │
│  ┌──────────┬──────────┐   │
│  │ Video 1  │ Video 2  │   │
│  │ (tự play)│ (tự play)│   │
│  ├──────────┼──────────┤   │
│  │ Video 3  │ Video 4  │   │
│  │ (tự play)│ (tự play)│   │
│  └──────────┴──────────┘   │
└─────────────────────────────┘
  4 video phát đồng thời
```

### Vì sao file nặng = trải nghiệm xấu?

| Kịch bản                     | File/video | 4 video cùng lúc | Kết quả                      |
| ---------------------------- | ---------- | ---------------- | ---------------------------- |
| File nặng (50 MB, 5 phút)    | 50 MB      | 200 MB           | Treo máy, chờ hàng chục giây |
| File chuẩn (3–5 MB, 30 giây) | 4 MB       | 16 MB            | Load tức thì, mượt mà        |

**Người dùng 4G Việt Nam** (trung bình 15–25 Mbps) với video chuẩn: tải xong trong < 3 giây.
Với file nặng 50 MB: chờ 20–30 giây — đủ để người dùng thoát app.

---

## 3. Tiêu Chuẩn Bắt Buộc

| Tiêu chí             | Yêu cầu                       | Lý do                                        |
| -------------------- | ----------------------------- | -------------------------------------------- |
| **Định dạng file**   | `.mp4`                        | Chạy được trên 100% điện thoại, kể cả iPhone |
| **Hướng quay**       | Dọc (portrait) — cao hơn rộng | Grid app hiển thị theo chiều dọc             |
| **Tỉ lệ khung hình** | 3:4 (vd: 720×960)             | Khớp chính xác với ô grid                    |
| **Thời lượng**       | 15–30 giây                    | Loop tự nhiên, load nhanh                    |
| **Dung lượng**       | Tối đa 5 MB                   | 4 video đồng thời, tránh giật lag            |
| **Chất lượng hình**  | Rõ nét, không vỡ hạt          | Màn hình HD hiện đại                         |

### Giải thích tỉ lệ 3:4

```
❌ Video ngang (16:9)    ✅ Video dọc (3:4)
┌────────────────────┐   ┌──────────┐
│                    │   │          │
│  ← landscape →     │   │          │
│                    │   │          │
└────────────────────┘   │          │
Khi hiển thị trên grid:  │          │
┌──────┐                 └──────────┘
│ crop │  ← chỉ thấy     Hiển thị đầy
│ bị   │     phần giữa   đủ, đẹp
│ mất  │
└──────┘
```

---

## 4. Hướng Dẫn Thực Hành

### Bước 1 — Quay video đúng cách

- **Cầm điện thoại dọc** khi quay (portrait mode)
- Quay 20–40 giây (có thêm buffer để cắt)
- Chọn cảnh đẹp, ánh sáng tốt — màn hình nhỏ cần hình sắc nét

### Bước 2 — Compress video trước khi upload

#### Cách A: HandBrake (Miễn phí, khuyến nghị)

1. Tải tại **https://handbrake.fr** → cài đặt
2. Kéo thả file video vào HandBrake
3. Chọn preset **"Fast 720p30"**
4. Tab **Video**: đảm bảo `Codec: H.264`, `RF: 26`, `FPS: 30`
5. Tab **Dimensions**: `Width: 720`, bật `Keep Aspect Ratio`
6. Nhấn **Start Encode** → đợi xong
7. Kiểm tra: file < 5 MB và hình rõ nét → upload được

#### Cách B: Tool online (Không cần cài phần mềm)

| Tool    | Link                                         | Ghi chú             |
| ------- | -------------------------------------------- | ------------------- |
| Clideo  | https://clideo.com/compress-video            | Đơn giản, nhanh     |
| Kapwing | https://www.kapwing.com/tools/compress-video | Thêm tính năng edit |

> ⚠️ Tool online không kiểm soát chất lượng tốt bằng HandBrake. Ưu tiên dùng HandBrake nếu có thể.

### Bước 3 — Kiểm tra trước khi upload

```
✅ Đuôi file .mp4
✅ Video chiều dọc (cao hơn rộng)
✅ Thời lượng ≤ 30 giây
✅ Dung lượng ≤ 5 MB  (chuột phải → Properties để kiểm tra)
✅ Xem lại: rõ nét, không vỡ hạt, không bị kéo méo
✅ Chuẩn bị thumbnail (ảnh tĩnh đẹp nhất của video)
```

---

## 5. Lỗi Thường Gặp & Cách Tránh

| Lỗi phổ biến                 | Hậu quả                           | Cách khắc phục                  |
| ---------------------------- | --------------------------------- | ------------------------------- |
| Upload file `.mov` từ iPhone | Không chạy trên Android           | Convert sang .mp4 qua HandBrake |
| Quay ngang (landscape)       | Bị crop xấu, mất nội dung hai bên | Cầm điện thoại dọc khi quay     |
| File > 20 MB                 | Load rất chậm, giật lag           | Compress xuống < 5 MB           |
| Video dài > 2 phút           | Tốn data người dùng, loop lộ      | Cắt còn 15–30 giây              |
| Video mờ, pixelated          | Trải nghiệm kém                   | Dùng CRF 26 trong HandBrake     |
| Video quá ngắn (< 10s)       | Vòng lặp lộ rõ, giật cục          | Quay đủ 15–30 giây              |

### Lưu ý đặc biệt với iPhone

iPhone mặc định quay ra file `.mov` hoặc `.hevc`. Cần convert sang `.mp4` trước khi upload:

- **HandBrake** trên máy tính: kéo thả, chọn preset, encode xong
- **iMovie** trên iPhone: export → chọn "Video" format MP4

---

## 6. So Sánh Kỹ Thuật

_(Dành cho đối tác muốn hiểu sâu hơn)_

### So sánh định dạng file

| Định dạng          | iPhone/Safari | Android | Phù hợp 4 video đồng thời |
| ------------------ | :-----------: | :-----: | :-----------------------: |
| **MP4 (H.264)** ✅ |      ✅       |   ✅    |        ✅ Tốt nhất        |
| MP4 (H.265)        |      ✅       |   ⚠️    |          ✅ Tốt           |
| WebM (VP9)         |      ❌       |   ✅    |       ❌ Không dùng       |

→ **Lý do chọn MP4 H.264:** Chạy được trên 100% điện thoại, phần cứng xử lý nhẹ → pin tiết kiệm khi 4 video chạy cùng lúc.

### So sánh độ phân giải

| Độ phân giải | Chất lượng     | Dung lượng (30s) | Khuyến nghị       |
| ------------ | -------------- | ---------------- | ----------------- |
| 1080×1440    | Quá cao (thừa) | ~10 MB           | ❌ Quá nặng       |
| **720×960**  | Sắc nét vừa đủ | ~4 MB            | ✅ Tốt nhất       |
| 540×720      | OK             | ~2.5 MB          | ✅ Chấp nhận được |
| 360×480      | Thấp           | ~1.5 MB          | ❌ Tránh          |

> **Lưu ý:** Mỗi ô video trên app chỉ rộng ~190px trên iPhone 14. 720px là đủ sắc nét, cao hơn là lãng phí dung lượng.

### So sánh thời lượng

| Thời lượng     | Dung lượng | Loop         | Đánh giá        |
| -------------- | ---------- | ------------ | --------------- |
| < 10 giây      | < 1.4 MB   | Lộ rõ, giật  | ⚠️ Quá ngắn     |
| **15–30 giây** | **2–4 MB** | **Tự nhiên** | **✅ Tốt nhất** |
| 30–60 giây     | 4–8 MB     | OK           | ✅ Chấp nhận    |
| > 90 giây      | > 12 MB    | Tốt          | ❌ Load chậm    |

---

## 7. Khuyến Nghị Ưu Tiên

Xếp theo thứ tự tác động từ cao → thấp:

### Ưu tiên #1 — Bật CDN (Tác động lớn nhất)

Hệ thống lưu video trên DigitalOcean Spaces. Khi bật CDN:

- Latency giảm từ ~50ms xuống ~5ms (10× nhanh hơn)
- Video được cache tại edge gần người dùng
- 4 video load gần như tức thì dù mạng 4G

**→ Đây là việc quan trọng nhất, cần làm ngay.**

### Ưu tiên #2 — Tuân thủ giới hạn 5 MB

File nặng ảnh hưởng trực tiếp đến 100% người dùng. Compress video đúng cách trước mỗi lần upload.

### Ưu tiên #3 — Đúng định dạng MP4 + Chiều dọc

Tránh upload `.mov` hoặc video ngang — lỗi hiển thị nghiêm trọng, không thể sửa sau khi đã upload.

### Ưu tiên #4 — Thời lượng 15–30 giây

Tối ưu trải nghiệm loop và tốc độ load. Ảnh hưởng đến trải nghiệm nhưng ít nghiêm trọng hơn #2 và #3.

---

## 8. Checklist Upload

Sao chép và sử dụng checklist này trước mỗi lần upload:

```
CHECKLIST VIDEO UPLOAD
======================
[ ] File có đuôi .mp4 (không phải .mov, .avi, .mkv)
[ ] Video chiều DỌC (cao hơn rộng, tỉ lệ 3:4)
[ ] Thời lượng: 15–30 giây
[ ] Dung lượng: ≤ 5 MB
    (Windows: chuột phải file → Properties → Size)
    (Mac: chuột phải → Get Info → Size)
[ ] Xem lại video: rõ nét, không vỡ hạt, không méo
[ ] Có thumbnail (ảnh đại diện đẹp cho video)
[ ] Đã điền đầy đủ thông tin: tên địa điểm, mô tả
```

---

## Phụ Lục: Thông Số Kỹ Thuật Tham Khảo

_(Dành cho đội kỹ thuật)_

**Thông số encode chuẩn:**

| Thông số          | Giá trị                                       |
| ----------------- | --------------------------------------------- |
| Container         | MP4                                           |
| Video codec       | H.264 (libx264), profile `main`               |
| Audio codec       | AAC 96 kbps                                   |
| Độ phân giải      | 720×960 (3:4)                                 |
| Bitrate video     | ~1000 kbps (CRF 26)                           |
| Framerate         | 30fps                                         |
| Thời lượng tối đa | 30 giây                                       |
| Dung lượng tối đa | 5 MB/file                                     |
| Metadata          | `+faststart` (play ngay, không cần load xong) |

**FFmpeg command chuẩn:**

```bash
ffmpeg -i input.mp4 \
  -vf "scale=720:960:force_original_aspect_ratio=decrease,pad=720:960:(ow-iw)/2:(oh-ih)/2,fps=30" \
  -c:v libx264 -profile:v main -crf 26 -preset slow \
  -c:a aac -b:a 96k \
  -movflags +faststart \
  -t 30 \
  output.mp4
```

---

_Tài liệu này được tổng hợp từ phân tích kỹ thuật nội bộ._
_Cập nhật: 02/03/2026 — Phiên bản 1.0_
