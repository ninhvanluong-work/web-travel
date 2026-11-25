# [BE] Lỗi từ đợt kiểm thử 16/11: VNPay, thống kê booking, tìm kiếm, câu báo lỗi đăng ký

- **Ngày:** 2026-11-25
- **Môi trường:** `https://web-travel-be.fly.dev`
- **Nguồn:** báo cáo QA `documents/qa/2026-11-16/report.md` (ảnh bằng chứng trong `evidence/`)
- **Người báo:** FE (web-travel)

| #   | Mã QA | Vấn đề                                                         | Mức độ                 |
| --- | ----- | -------------------------------------------------------------- | ---------------------- |
| 1   | D-01  | VNPay sandbox từ chối merchant, không thanh toán được tour VND | 🔴 Nghiêm trọng        |
| 2   | D-03  | Thống kê booking cộng lẫn VND và USD thành một số              | 🟡 Trung bình          |
| 3   | D-09  | Tìm kiếm video không bao giờ trả về danh sách rỗng             | 🟢 Thấp (cần PO quyết) |
| 4   | D-07  | Câu báo lỗi đăng ký trùng email là tiếng Anh, sai ngữ pháp     | 🟢 Thấp                |

---

## 1. VNPay sandbox: "Website này chưa được phê duyệt" (mã 71)

### Hiện tượng

Ở bước 4 của một tour VND, bấm **Thanh toán qua VNPAY**:

1. `POST /payment/vnpay/{bookingId}/create-payment-url` → `201`, trả về `paymentUrl`.
2. Trình duyệt mở `https://sandbox.vnpayment.vn/paymentv2/vpcpay.html?...&vnp_TmnCode=RNC9AYTP&...&vnp_ReturnUrl=https://web-travel-be.fly.dev/payment/vnpay/return`.
3. VNPay trả `302` → `Error.html?code=71`, hiện chữ "Website này chưa được phê duyệt".

Thử lại mà không gửi `Referer` thì vẫn bị lỗi như trên, nên nguyên nhân không nằm ở domain FE. Ảnh: `S3-01-1.jpg`, `S3-01-2.jpg`.

### Dữ liệu

- 7 giao dịch VNPay đang `pending`. Lần `succeed` gần nhất là ngày 20/08/2026, tức cấu hình từng hoạt động.

### Cần BE làm

1. Kiểm tra merchant sandbox `RNC9AYTP` trên cổng VNPay sandbox: còn hiệu lực không, đã được duyệt chưa. Nếu không dùng được nữa thì đăng ký merchant sandbox mới và cập nhật `TMN code` + `hash secret` trong cấu hình BE.
2. Báo lại FE để chạy lại các case S3-01 → S3-03 trên bản Vercel bằng thẻ NCB sandbox.

---

## 2. Thống kê booking cộng lẫn VND và USD

### Hiện tượng

`GET /booking` (admin) trả về `stats.total.totalPrice`, `stats.paid.totalPrice`, … mỗi mục là **một con số** cộng tất cả booking, không phân biệt `currency`. Ví dụ: 3 đơn đã huỷ, toàn bộ bằng VND, ra 3.000.032. Ngoài ra, chỉ cần có thêm một đơn USD là con số này sai hoàn toàn. Ảnh: `S8-01-2.jpg`.

### Cần BE làm

Trả tổng tiền theo từng loại tiền, ví dụ:

```json
"stats": {
  "total": { "count": 12, "totalPrice": { "VND": 4200000, "USD": 135 } },
  "paid":  { "count": 2,  "totalPrice": { "USD": 135 } }
}
```

Khi BE đổi xong, FE sẽ sửa `BookingKpiCards.tsx` để hiển thị "₫… · $…". FE hiện đang luôn gắn ký hiệu `$`.

---

## 3. Tìm kiếm video không bao giờ "không thấy"

### Hiện tượng

`GET /video?query=zzqxnomatch&distanceScore=0` vẫn trả về 6 video. Tìm theo ngữ nghĩa luôn trả các video gần nhất. Điểm `stats.distanceScore` của từ khoá vô nghĩa là 0,29, còn của "Sapa" là 0,31, gần như bằng nhau, nên FE không tự đặt ngưỡng lọc được.

### Cần BE / PO quyết

- Thêm ngưỡng độ liên quan, hoặc kết hợp tìm theo từ khoá, rồi trả `items: []` khi không có kết quả khớp. FE đã có sẵn màn "không tìm thấy" và sẽ tự hiện khi danh sách rỗng.
- Nếu PO muốn giữ cách "luôn gợi ý", BE nên trả thêm một cờ, ví dụ `stats.exactMatch: false`, để FE ghi "Đây là các video gợi ý".

---

## 4. Câu báo lỗi đăng ký trùng email

`POST /auth/register` với email đã tồn tại trả `message: "email already register, please try to login!"`. Theo quy tắc của dự án, FE hiển thị nguyên văn câu `message` của BE. Vì vậy người dùng tiếng Việt thấy một câu tiếng Anh sai ngữ pháp (ảnh `S4-07-2.jpg`).

**Cần BE làm:** sửa câu thành "Email already registered. Please sign in.", hoặc trả thêm một mã lỗi (ví dụ `code: "EMAIL_EXISTS"`) để FE dịch theo ngôn ngữ đang dùng.
