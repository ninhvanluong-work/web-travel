# Dữ liệu kiểm thử — 2026-11-16

Các bước trong `test-cases.md` chỉ tham chiếu mã `TD-xx`. Mật khẩu, số thẻ, OTP **không** ghi ở đây — xem `documents/test-accounts.local.md` theo khoá.

| ID | Loại | Giá trị | Ghi chú |
| --- | --- | --- | --- |
| TD-01 | Thông tin liên hệ khách | Họ tên `ZZ QA Khach Test`; email `zz.qa.booking@example.com`; SĐT `+84 912 345 678`; Zalo `zzqa_zalo` | Dùng cho booking thật |
| TD-02 | Tour có session sắp tới | Product `1ba1e3aa-d552-4739-b103-ea0f44b2c26b` "Nhed hehee", VND; session `3e7e1267-81b0-41d8-bbe6-39ea93000388` ngày **16/11/2026**, `active`; Adult 600.000 ₫ / Child 400.000 ₫; giờ 08:00 "Morning Departure"; điểm đón "City Center Meeting Point"; gói "Standard Tour Option" | Đã kiểm tra DB trước khi chạy. Đây là session tương lai **duy nhất** của tour |
| TD-03 | Thẻ thanh toán | `CARD-VNPAY` (NCB sandbox) | Không dùng được — cổng báo lỗi 71 trước khi nhập thẻ |
| TD-04 | Tài khoản khách | `ACC-CLIENT` | Nhập email dạng chữ hoa/thường lẫn lộn để kiểm tra tự chuyển chữ thường |
| TD-05 | Tài khoản HDV | `ACC-GUIDE` (hồ sơ `c8645fc8-2e0b-48b4-a492-85329c4840bc`) | |
| TD-06 | Tài khoản admin | `ACC-ADMIN` | |
| TD-07 | Tài khoản super admin | `ACC-SUPER` | Không dùng |
| TD-08 | Chip / từ khoá tìm kiếm có kết quả | `Sapa` | |
| TD-09 | Từ khoá không có kết quả | `zzqxnomatch` | Dùng cho client và mọi màn admin |
| TD-10 | Email sai định dạng | `zzqa-not-an-email` (booking), `not-an-email` (quên mật khẩu) | |
| TD-11 | SĐT sai | `+84 12` (2 chữ số sau mã quốc gia) | |
| TD-12 | Ngày không có lịch | 17/11/2026 | |
| TD-13 | Tài khoản đăng ký mới | Email dạng `zz.qa+<timestamp>@example.com`; mật khẩu yếu `abc` (quá ngắn) và `abcdefgh` (thiếu chữ hoa/số); mật khẩu hợp lệ: không ghi | Email trùng: email của `ACC-CLIENT` |
| TD-14 | Mật khẩu tạm khi đổi mật khẩu | Không ghi (đã đổi lại về mật khẩu gốc của `ACC-CLIENT`) | Mật khẩu sai cố ý: chuỗi bất kỳ |
| TD-15 | Điểm đến tạo mới | Tên `ZZ QA Destination 20261116`; mô tả `ZZ QA mo ta ban dau` → sửa thành `ZZ QA mo ta da sua`; tên quá ngắn `Z` | |
| TD-16 | Hồ sơ HDV của người khác | `f568edef-4b3b-4c1d-b921-d8d00415db9f` "The Meow Tour Guide" | Chỉ xem, không gửi đánh giá |
| TD-17 | Link video chia sẻ | `/vi/video/du-lich-mien-bac-sapa-f955` | Mở trực tiếp để kiểm tra reload gate |
| TD-18 | Lý do huỷ booking | `ZZ QA test 2026-11-16 - huy booking test` | |
| TD-19 | User thường để kiểm tra phân quyền gán vai trò | `25ecb6bc-7fc4-4f20-bf8d-9a69de071f4b` (tài khoản test cũ `zz.test.usermgmt…`) | Chỉ mở form, không lưu |
| TD-21 | Tài khoản PayPal sandbox (người mua) | `ACC-PAYPAL` | Chỉ dùng trong popup PayPal sandbox, cho tour USD |
| TD-22 | Tour **USD** có session sắp tới | "Tour Hà Giang - Mã Pí Lèng" `b26cd710-2919-473e-866e-f12f0df2a1d7` (USD, có video `du-lich-mien-bac-ha-giang-d412`); đã thêm loại khách Adult / Children và 60 session 17/11/2026 → 15/01/2027, Adult $45 / Children $30 | Trước đó tour không có loại khách và mọi lịch đã qua. Thêm bằng `ACC-ADMIN` (API sửa tour + tạo lịch hàng loạt) |
| TD-23 | Tour **VND** có nhiều session sắp tới | "Tour du lịch miền bắc" `26880442-15a9-4725-82b2-fc530d3f0e62`; 60 session 17/11/2026 → 15/01/2027; Adult 600.000 ₫ / Children 400.000 ₫ | Thay TD-02 khi chạy lại S2/S3 (TD-02 chỉ có 1 session) |
| TD-20 | Tham số trang kết quả VNPay giả lập | `?status=failed&txnRef=D789XH6V3RK5&bookingId=<id booking TD>` và `?status=success&txnRef=FAKE123&…&amount=1000000` | Mở URL trực tiếp, không qua VNPay |
