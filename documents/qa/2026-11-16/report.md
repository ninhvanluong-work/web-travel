# Báo cáo kiểm thử — web-travel · 16/11/2026

- **Môi trường:** https://web-travel-theta.vercel.app/vi (bản đã deploy) · BE `web-travel-be.fly.dev` · DB dùng chung
- **Người thực hiện:** agent `qa-tester` (Playwright + kiểm tra DB chỉ đọc)
- **Tài liệu kèm theo:** [test-plan.md](./test-plan.md) · [test-data.md](./test-data.md) · [test-cases.md](./test-cases.md) · ảnh bằng chứng trong `evidence/`
- **Bản dễ đọc cho người không chuyên:** [report.html](./report.html)

## 1. Kết luận

> **CHƯA THỂ phát hành phần thanh toán.** Khách đặt tour được, nhưng **thanh toán VNPay bị cổng thanh toán từ chối** ngay từ đầu (D-01). Các phần còn lại phần lớn hoạt động tốt.

| Tổng | Đạt | Lỗi | Bị chặn | Chưa chạy | Tỉ lệ đạt (trên số đã chạy) |
| --- | --- | --- | --- | --- | --- |
| 53 | 37 | 13 | 2 | 1 | **74%** (37/50) |

## 2. Kết quả theo nhóm

| Nhóm | Tổng | Đạt | Lỗi | Chặn | Chưa chạy | Đánh giá |
| --- | --- | --- | --- | --- | --- | --- |
| S1 Tìm tour bằng video | 8 | 7 | 1 | 0 | 0 | 🟢 |
| S2 Đặt tour | 6 | 4 | 2 | 0 | 0 | 🟡 |
| S3 Thanh toán | 6 | 1 | 3 | 2 | 0 | 🔴 |
| S4 Tài khoản | 9 | 6 | 3 | 0 | 0 | 🟡 |
| S5 Hướng dẫn viên | 5 | 4 | 0 | 0 | 1 | 🟢 |
| S6 Admin – danh mục | 6 | 6 | 0 | 0 | 0 | 🟢 |
| S7 Admin – đơn đặt | 4 | 2 | 2 | 0 | 0 | 🟡 |
| S8 Đúng người đúng việc | 6 | 6 | 0 | 0 | 0 | 🟢 |
| S9 Giao diện | 3 | 1 | 2 | 0 | 0 | 🟡 |

## 3. Danh sách lỗi

| Mã | Mức | Lỗi (mô tả dễ hiểu) | Test case · ảnh | Ai sửa | Đã biết? |
| --- | --- | --- | --- | --- | --- |
| D-01 | 🔴 Nghiêm trọng | Bấm **Thanh toán qua VNPAY** → cổng VNPay báo *"Website này chưa được phê duyệt"* (mã 71), không tới được trang nhập thẻ | S3-01 · `S3-01-2.jpg` | BE / cấu hình VNPay | Mới |
| D-02 | 🟠 Cao | Trang kết quả thanh toán hiện **"Thanh toán thành công"** chỉ dựa vào đường link; sửa link là ra "thành công" dù đơn vẫn **chờ xử lý** | S3-05 · `S3-04-1.jpg` | FE (+ BE trả trạng thái) | Có (M7) |
| D-03 | 🟡 Trung bình | Thẻ thống kê ở **Admin → Booking** cộng chung tiền VND và USD, hiển thị ký hiệu **$** (vd "$3,000,032" cho 3 đơn huỷ toàn VND) | S7-04 · `S8-01-2.jpg` | FE / BE | Mới |
| D-04 | 🟡 Trung bình | Ô **Số điện thoại** khi đặt tour chấp nhận "+84 12" và vẫn cho **Tiếp tục** | S2-03 · `S2-03-2.jpg` | FE | Mới |
| D-05 | 🟡 Trung bình | Quay lại từ bước 2 về bước 1 thì **số khách bị về 0** (thông tin liên hệ vẫn giữ) | S2-05 · `S2-05-2.jpg` | FE | Có (M23) |
| D-06 | 🟢 Thấp | Chi tiết đơn ở trang quản trị ghi tên khách là **"Tên hướng dẫn viên"**; "Tên sản phẩm \*" có dấu bắt buộc ở chỗ chỉ xem | S7-01 · `S7-01-3.jpg` | FE | Mới |
| D-07 | 🟢 Thấp | Thông báo lỗi ở Đăng nhập / Đăng ký / Quên mật khẩu bằng **tiếng Anh** ("Email is required"…) | S4-01, S4-07, S4-09 | FE (+ BE) | Có (M45) |
| D-08 | 🟢 Thấp | Chữ tiếng Anh trên giao diện tiếng Việt: thanh bước "Info/Options/Review/Payment", ngày "Mon, Nov 16, 2026", "Chat App", "… More", trang 404, nút "Save Changes" / "Hide Product" | S9-02 | FE | Một phần (M46) |
| D-09 | 🟢 Thấp | Tìm từ khoá vô nghĩa vẫn ra 6 video "gần giống" — không bao giờ có màn "không tìm thấy" | S1-02 | BE / PO quyết định | Mới |
| D-10 | 🟢 Thấp | Lỗi trong console: video thiếu đoạn `video1.ts`/`video2.ts` (404); hộp chi tiết đơn thiếu tiêu đề cho trình đọc màn hình | S9-03 | FE | Mới |
| D-11 | 🟢 Thấp | Tour không có ảnh/video hiện "1 / 0"; giá hiện "USD350,000" (thiếu khoảng trắng, dữ liệu giá có vẻ sai) | S1-07 | FE / dữ liệu | Mới |
| D-12 | 🟢 Thấp | Nút **Thanh toán bằng thẻ** bấm không có tác dụng | S3-06 | FE | Có (M25) |

<details><summary>Chi tiết kỹ thuật D-01</summary>

`POST /payment/vnpay/<bookingId>/create-payment-url` → 201 → trình duyệt tới `sandbox.vnpayment.vn/paymentv2/vpcpay.html?...vnp_TmnCode=RNC9AYTP...&vnp_ReturnUrl=https://web-travel-be.fly.dev/payment/vnpay/return` → 302 `Error.html?code=71`. Thử lại không gửi Referer vẫn lỗi → không phải do domain FE. Nhiều khả năng mã merchant `RNC9AYTP` chưa được kích hoạt/duyệt trên sandbox. DB: 7 giao dịch VNPay đang `pending`, lần `succeed` gần nhất 20/08/2026.
</details>

## 4. Điểm làm tốt
- Tìm tour bằng gợi ý, cuộn tải thêm (6 → 18 video), chỉ một video phát tiếng, mở tour từ video, nút Play khi mở link chia sẻ.
- Đặt tour: chặn ngày không có lịch, chặn email sai, bắt buộc đồng ý điều khoản; đơn tạo đúng tổng tiền (1.000.000đ) và đúng dữ liệu.
- Tài khoản: email tự viết thường, sai mật khẩu báo đúng, đổi mật khẩu (sai xác nhận / sai mật khẩu cũ / thành công), đăng xuất có xác nhận.
- Quản trị: tạo điểm đến xong ở lại form, sửa lưu được, rời trang khi chưa lưu có hỏi, tìm không thấy + xoá tìm kiếm ở 6 màn; huỷ đơn bắt buộc lý do và có cảnh báo thanh toán đang chờ.
- Phân quyền: chưa đăng nhập bị đưa về đăng nhập quản trị; khách không vào được quản trị; admin thường không gán được quyền admin / chỉ xem được tài khoản cấp cao.
- Không tràn khung trên 9 màn hình điện thoại (430px).

## 5. Bị chặn / chưa chạy
- **S3-02** (thanh toán thành công → đơn "Đã thanh toán") và **S3-03** (huỷ ở trang VNPay): bị chặn bởi D-01.
- **S5-05** (hướng dẫn lần đầu cho HDV): không chạy được vì tài khoản test đã xem hướng dẫn từ trước.
- Ngoài phạm vi lần này: tải video khoảnh khắc, gửi đánh giá HDV, thêm/sửa Tour / Nhà cung cấp / HDV / Người dùng, PayPal.

## 6. Dữ liệu test đã tạo (cần dọn)

| Bản ghi | Định danh | Trạng thái cuối | Việc cần làm |
| --- | --- | --- | --- |
| Booking | `BKMWJC44UC17ABC2` (id `94604ee5-…`), khách "ZZ QA Khach Test", 1.000.000đ | Đã huỷ (bởi admin test) | Không bắt buộc |
| Giao dịch VNPay | id `cfe5a1e2-…`, TxnRef `D789XH6V3RK5` | Chờ xử lý | Chuyển "thất bại" hoặc xoá mềm (BE) |
| Người dùng | `zz.qa+1794838113156@example.com` (id `8a521ad3-…`) | Hoạt động | Xoá mềm |
| Điểm đến | "ZZ QA Destination 20261116" (id `f7f604c1-…`) | Hoạt động | Xoá ở Admin → Điểm đến |
| Mật khẩu tài khoản khách test | Đổi tạm rồi đổi lại | Không đổi | — |

Không có thanh toán thành công nào; không dữ liệu của người khác bị thay đổi.

## 7. Việc cần làm tiếp
1. **BE / VNPay:** kích hoạt mã merchant sandbox `RNC9AYTP` (D-01), rồi chạy lại S3-01 → S3-03.
2. **Dữ liệu:** thêm lịch có giá cho tour dùng để test (tour "Nhed hehee" chỉ còn 1 lịch hôm nay, 0 chỗ).
3. **FE ưu tiên:** D-02, D-03, D-04, D-05; sau đó chữ tiếng Anh / nhãn sai (D-06 → D-08).
4. Dọn dữ liệu ở mục 6.

## 8. Ghi chú khác (không tính là lỗi)
- Menu "⋯" ở danh sách tour bản đã deploy chỉ có "Chỉnh sửa / Ẩn"; lịch & giá mở từ biểu tượng lịch hoặc trang sửa tour.
- Trang kết quả thanh toán hiện mã nội bộ (UUID) thay vì mã đặt tour.
- Đơn đã huỷ vẫn còn giao dịch VNPay "chờ xử lý".
- Trang Đăng ký vẫn mở được khi đã đăng nhập.
- Đăng nhập `zz.admin` ở trình duyệt test sẽ đăng xuất phiên `zz.admin` ở nơi khác.
