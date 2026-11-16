# Kế hoạch kiểm thử — web-travel · 2026-11-16

## 1. Mục tiêu
Kiểm thử đầu-cuối (end-to-end) trang khách (client), hướng dẫn viên và trang quản trị (admin) trên bản đã deploy, gồm luồng đặt tour và thanh toán VNPay sandbox, phân quyền và chất lượng giao diện.

## 2. Phạm vi
| Trong phạm vi | Ngoài phạm vi |
| --- | --- |
| S1 Khám phá (tìm kiếm, lưới video, feed video, reload gate, mở tour) | Kiểm thử tải / hiệu năng |
| S2 Đặt tour 4 bước (validate, không có lịch, quay lại/tiếp tục, điều khoản) | Thanh toán PayPal (tour VND không dùng PayPal) |
| S3 Thanh toán VNPay sandbox + trang kết quả | Gửi email thật (quên mật khẩu chỉ test validate) |
| S4 Tài khoản (đăng ký, đăng nhập, đổi mật khẩu, đăng xuất, quên mật khẩu) | Upload video/moment (tạo dữ liệu Bunny thật) |
| S5 Hồ sơ hướng dẫn viên (chủ hồ sơ / người xem) | Gửi đánh giá HDV (tạo review thật trên hồ sơ người khác) |
| S6 Admin CRUD (Điểm đến đầy đủ; tìm kiếm trên Products, Guides, Suppliers, Users, Videos) | Tạo/sửa Product, Supplier, Guide, User (dữ liệu dùng chung) |
| S7 Admin booking (tìm, xem drawer, huỷ) | |
| S8 Phân quyền | Các thao tác cần ACC-SUPER (không dùng trong lần chạy này) |
| S9 Chất lượng giao diện (khung 430×932, tiếng Việt, console) | |

## 3. Môi trường
| Mục | Giá trị |
| --- | --- |
| FE | `https://web-travel-theta.vercel.app` (ngôn ngữ `/vi`) — có thể chậm hơn nhánh `dev`; báo cáo ghi theo hành vi quan sát được |
| BE | `https://web-travel-be.fly.dev` (DB production dùng chung) |
| DB | PostgreSQL, chỉ đọc qua MCP `_postgres` (chỉ `SELECT`) |
| Trình duyệt | Playwright MCP (Chromium). Client 430×932, admin 1440×810 |
| Ngày chạy | 2026-11-16, ~20:56–21:20 giờ Việt Nam |

## 4. Tài khoản (chỉ ghi khoá, mật khẩu ở `documents/test-accounts.local.md`)
| Khoá | Vai trò | Dùng cho |
| --- | --- | --- |
| `ACC-CLIENT` | khách | S2, S3, S4, S8-02/03 |
| `ACC-GUIDE` | hướng dẫn viên | S5, S8-06 |
| `ACC-ADMIN` | admin | S6, S7, S8 |
| `ACC-SUPER` | super admin | **Không dùng** (không case nào cần quyền super admin) |
| `CARD-VNPAY` | thẻ NCB sandbox | S3 (không dùng được — cổng VNPay báo lỗi trước bước nhập thẻ) |

## 5. Bộ test (test set)
53 case, 9 suite — chi tiết trong [test-cases.md](./test-cases.md); dữ liệu trong [test-data.md](./test-data.md).

| Suite | Số case | Ưu tiên chính |
| --- | --- | --- |
| S1 Khám phá | 8 | P1–P2 |
| S2 Đặt tour | 6 | P1 |
| S3 Thanh toán | 6 | P1 |
| S4 Tài khoản | 9 | P1–P2 |
| S5 Hướng dẫn viên | 5 | P2 |
| S6 Admin CRUD | 6 | P2 |
| S7 Admin booking | 4 | P1–P2 |
| S8 Phân quyền | 6 | P1 |
| S9 Giao diện | 3 | P3 |

## 6. Tiêu chí bắt đầu / kết thúc
- **Bắt đầu:** site Vercel truy cập được; tài khoản `zz.*` đăng nhập được; tour TD-02 còn session đang mở cho ngày test (đã kiểm tra DB: session `3e7e1267…` ngày 16/11/2026, `active`, có giá Adult/Child).
- **Kết thúc:** mọi case P1 đã chạy hoặc ghi rõ lý do Blocked; mọi lỗi có bằng chứng; dữ liệu tạo ra được liệt kê; thư mục `.playwright-mcp/` đã xoá.
- **Go/No-go:** No-go nếu còn lỗi Critical/High ở luồng đặt tour – thanh toán.

## 7. Quy tắc an toàn đã áp dụng
- Chỉ dùng tài khoản `zz.*`; dữ liệu tạo mới bắt đầu bằng `ZZ QA`.
- Chỉ sửa / huỷ bản ghi do lần chạy này tạo ra. Không xoá gì.
- Tối đa 2 thanh toán thành công (thực tế: 0 vì cổng bị chặn).
- Ảnh chụp trang admin: làm mờ các dòng không phải dữ liệu `ZZ`.

## 8. Rủi ro
| Rủi ro | Ảnh hưởng | Giảm thiểu |
| --- | --- | --- |
| Chỉ có **1** session tương lai (hôm nay) cho tour TD-02 | Sau 16/11/2026 không còn ngày nào đặt được | Admin cần tạo thêm session có giá trước lần test sau |
| Cấu hình VNPay sandbox (TMN code) | Không test được thanh toán | Báo BE kiểm tra merchant sandbox (xem D-01) |
| DB dùng chung | Dữ liệu test lẫn dữ liệu thật | Tiền tố `ZZ QA`, liệt kê dữ liệu tạo |
| Đăng nhập admin ở trình duyệt test đá phiên admin `zz.admin` ở nơi khác | Người khác đang dùng `zz.admin` bị đăng xuất | Đã ghi chú |
| Vercel chậm hơn `dev` | Hành vi khác code | Ghi theo quan sát |
