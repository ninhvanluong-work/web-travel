# Hướng Dẫn Upload Video — Dành Cho Admin

> Không cần hiểu kỹ thuật. Chỉ cần làm đúng theo hướng dẫn là video sẽ chạy mượt trên app.
> Phân tích kỹ thuật đầy đủ: xem [video-format-strategy.md](./video-format-strategy.md)

---

## Tiêu chuẩn bắt buộc

| Tiêu chí            | Yêu cầu                       | Lý do                                                |
| ------------------- | ----------------------------- | ---------------------------------------------------- |
| **Định dạng file**  | `.mp4`                        | Chạy được trên mọi điện thoại kể cả iPhone           |
| **Hướng video**     | Dọc (portrait) — cao hơn rộng | Grid hiển thị theo tỉ lệ đứng                        |
| **Thời lượng**      | **15–30 giây**                | Loop đẹp, load nhanh                                 |
| **Dung lượng file** | **Tối đa 5 MB**               | App hiển thị 4 video cùng lúc — file nặng → giật lag |
| **Chất lượng**      | Rõ nét, không vỡ hạt          | Hiển thị trên màn hình HD                            |

---

## Tại sao phải giữ video ngắn và nhỏ?

App hiển thị **4 video phát đồng thời**. Nếu mỗi video nặng 50 MB, dài 5 phút:

- Điện thoại phải load **200 MB cùng lúc** → treo máy, giật lag
- Người dùng 4G chờ hàng chục giây mới xem được

Nếu mỗi video chỉ 3–5 MB, dài 30 giây:

- Load gần như tức thì
- Vòng lặp (loop) tự nhiên, người dùng không nhận ra đang loop
- Điện thoại chạy mát, không hao pin

---

## Cách compress video trước khi upload

### Cách 1 — HandBrake (Khuyến nghị, miễn phí)

1. Tải tại **https://handbrake.fr** → cài đặt bình thường
2. Mở HandBrake → kéo thả file video vào
3. Chọn preset **"Fast 720p30"** ở cột bên phải
4. Tab **Video** → kiểm tra:
   - `Codec: H.264 (x264)`
   - `Framerate: 30`
   - `Constant Quality: RF 26`
5. Tab **Dimensions** → `Width: 720`, tick `Keep Aspect Ratio`
6. Nhấn **Start Encode** → đợi xong
7. Kiểm tra file output: nếu < 5 MB và vẫn rõ nét → upload được

### Cách 2 — Tool online (nhanh, không cần cài)

- **Clideo:** https://clideo.com/compress-video
- **Kapwing:** https://www.kapwing.com/tools/compress-video

> ⚠️ Tool online không kiểm soát chất lượng tốt bằng HandBrake. Chỉ dùng khi không có máy cài HandBrake.

---

## Checklist trước khi upload

```
[ ] File có đuôi .mp4
[ ] Video quay dọc (portrait), không phải ngang
[ ] Thời lượng ≤ 30 giây
[ ] Dung lượng ≤ 5 MB  (chuột phải file → Properties để kiểm tra)
[ ] Xem lại video — rõ nét, không vỡ hạt, không bị kéo méo
[ ] Đã chuẩn bị thumbnail (ảnh tĩnh đẹp nhất của video)
```

---

## Lỗi thường gặp cần tránh

| Lỗi                          | Hậu quả                 | Cách tránh                       |
| ---------------------------- | ----------------------- | -------------------------------- |
| Upload file `.mov` từ iPhone | Không chạy trên Android | Convert sang .mp4 bằng HandBrake |
| Video ngang (landscape)      | Bị crop xấu trên grid   | Quay hoặc edit thành video dọc   |
| File > 20 MB                 | Load rất chậm, giật lag | Compress xuống < 5 MB            |
| Video dài > 2 phút           | Tốn data, loop lộ       | Cắt còn 15–30 giây               |
| Video mờ, pixelated          | Trải nghiệm xấu         | Dùng RF 26 trong HandBrake       |

---

_Cập nhật lần cuối: 2026-03-01_
