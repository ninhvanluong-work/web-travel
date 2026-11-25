# Quyết định xử lý lỗi — đợt test 16/11 (duyệt ngày 25/11/2026)

| Mã | Lỗi | Test case | Quyết định | Trạng thái |
| --- | --- | --- | --- | --- |
| D-01 | VNPay báo "chưa được phê duyệt" | S3-01 (S3-02, S3-03 bị chặn) | Báo BE | [BE report](../../../docs/be-reports/qa-findings-2026-11-25.md) mục 1 |
| D-02 | Trang kết quả VNPay tin vào đường link | S3-05 | **Note, xem sau** | Xem mục N1 |
| D-03 | Thống kê booking cộng lẫn VND + USD | S7-04 | Báo BE | BE report mục 2 |
| D-04 | SĐT sai vẫn đặt được | S2-03 | **Fix** | Đã sửa |
| D-05 | Quay lại bước 1 mất số khách | S2-05 | **Fix** | Đã sửa |
| D-06 | Nhãn sai trong chi tiết booking (admin) | S7-01 | **Fix** | Đã sửa |
| D-07 | Lỗi đăng nhập / đăng ký / quên mật khẩu bằng tiếng Anh | S4-01, S4-07, S4-09 | **Fix** (câu của BE: báo BE) | Đã sửa; BE report mục 4 |
| D-08 | Chữ tiếng Anh trên giao diện Việt | S9-02 | **Fix** cả 4 chỗ | Đã sửa |
| D-09 | Tìm kiếm không bao giờ "không thấy" | S1-02 | Báo BE / PO | BE report mục 3 |
| D-10 | Lỗi console | S9-03 | **Note, xem sau** | Xem mục N2 |
| D-11 | Tour không ảnh "1 / 0", giá "USD350,000" | S1-07 (ghi chú) | **Note, xem sau** | Xem mục N3 |
| D-12 | Nút "Thanh toán bằng thẻ" không làm gì | S3-06, S3-12 | **Note, xem sau** | Xem mục N4 |
| D-13 | Huỷ PayPal: thông báo lặp chữ | S3-11 (ghi chú) | **Note, xem sau** | Xem mục N5 |

## Đã sửa (chưa commit) — kiểm tra trên localhost ngày 25/11, ảnh `evidence/*-fix*.jpg`

| Mã | File | Thay đổi |
| --- | --- | --- |
| D-04 | `booking-sheet/contact-info-card.tsx`, `use-booking-sheet-state.ts` | Kiểm tra SĐT bằng `isPossiblePhoneNumber` (đúng độ dài theo quốc gia): báo "Số điện thoại không hợp lệ" và khoá **Tiếp tục**. Thêm key `booking.errorPhoneInvalid` |
| D-05 | `booking-sheet/use-session-pricing.ts` | Chỉ reset số khách khi lịch (sessionId) đổi; quay lại cùng ngày giữ nguyên số khách |
| D-06 | `AdminBooking/components/BookingDetailDrawer.tsx` | Nhãn "Tên khách hàng", "Tên tour" (key mới `bookingCustomerName`, `bookingTourName`) |
| D-07 | `lib/validations/auth.ts` + 4 trang SignIn / SignUp / ForgotPassword / ResetPassword | Câu lỗi là key `authPage` `validation.*`, trang dịch bằng `t()`; logic kiểm tra giữ nguyên |
| D-08 | `booking-stepper.tsx`, `step-review.tsx`, `step-payment-order-summary.tsx`, `format-booking-date.ts` (mới), `video-slide.tsx`, `pages/404.tsx`, `form-action-buttons.tsx` | Thanh bước, ngày ("Th 3, 17/11/2026"), "Ứng dụng nhắn tin", "… Xem thêm", trang 404, 5 nút form tour admin (Lưu nháp / Lưu thay đổi / Ẩn tour / Hiển thị lại / Đăng tour) |

## Note — xem xét sau

### N1 · D-02 Trang kết quả VNPay tin vào đường link (cao)
- **Hiện tại:** `src/pages/payment/vnpay/return.tsx` hiện "Thành công" chỉ vì có `?status=success` trên đường link.
- **Đề xuất:** gọi hook có sẵn `useBookingPayments({ bookingId })` (`GET /booking/{id}/payment`), tìm giao dịch VNPay theo `txnRef`. Nếu `succeed` → hiện Thành công. Nếu `pending` → hiện "Đang xác nhận…" và hỏi lại vài lần. Nếu `failed` hoặc không thấy giao dịch → hiện Thất bại kèm nút **Thử lại**. Có thể hiện thêm mã booking `BK…` thay UUID.
- **Lưu ý BE:** `GET /booking/{id}/payment` hiện trả dữ liệu thanh toán **không cần đăng nhập**.

### N2 · D-10 Lỗi console (thấp)
- (a) Drawer chi tiết booking (admin) thiếu `SheetTitle` → cảnh báo trợ năng. Đề xuất: thêm `SheetTitle` ẩn (`sr-only`, nội dung là mã booking).
- (b) Feed video: lỗi 404 `video1.ts` / `video2.ts` vì `use-video-preloader.ts` tải trước cố định 3 đoạn (chỉ trên iOS). Lỗi vô hại. Muốn sửa thì phải đọc `video.m3u8` trước, tức thêm 1 request; đây là vùng logic video, cần test lại trên iPhone.

### N3 · D-11 Trang tour (thấp)
- (a) `hero-carousel.tsx` dòng 169: ẩn bộ đếm "1 / 0" khi tour không có ảnh/video.
- (b) `ProductPage/adapter.ts` dòng 222: map `USD` → `$` (hiện ra "USD350,000"). Giá 350.000 USD có vẻ do nhập sai dữ liệu → admin sửa.
- Thêm: tour "Tour Hà Giang - Mã Pí Lèng" có `min_price` = 0 nên "từ …" trước khi chọn ngày không khớp giá thật.

### N4 · D-12 Nút "Thanh toán bằng thẻ" (thấp)
- `step-payment.tsx` dòng 152: nút không có `onClick`, BE chưa có cổng thẻ riêng. Khách vẫn trả thẻ được qua PayPal (USD) hoặc VNPAY (VND).
- Phương án: (1) ẩn nút cho tới khi có cổng thẻ; (2) bấm thì mở PayPal/VNPAY tương ứng; (3) làm mờ + nhãn "Sắp có".

### N5 · D-13 Huỷ PayPal lặp chữ (thấp)
- `step-payment.tsx`: tiêu đề và nội dung `AlertBanner` cùng dùng key `booking.paymentCancelled`. Đề xuất: thêm key `booking.paymentCancelledMessage` ("Bạn chưa bị trừ tiền. Bấm PayPal để thanh toán lại khi sẵn sàng.") cho nội dung.
