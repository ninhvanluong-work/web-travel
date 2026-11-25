# Test cases — 2026-11-16 (Vercel `/vi`)

Ký hiệu trạng thái: ✅ Pass · ❌ Fail · ⛔ Blocked · ⏭ Not run. Bằng chứng nằm trong `evidence/`. Mã lỗi `D-xx` xem [report.md](./report.md#4-danh-sách-lỗi). Lỗi đã biết từ trước: `docs/review-codebase-2026-11-11.md` (mã `Mxx`, `Hxx`).

Cột: ID | Suite | Tiêu đề | Ưu tiên | Điều kiện trước | Dữ liệu | Các bước | Kết quả mong đợi | Kết quả thực tế | Trạng thái | Bằng chứng | Ghi chú

## S1 · Khám phá (client, 430×932, chưa đăng nhập)

| ID | Suite | Tiêu đề | Ưu tiên | Điều kiện trước | Dữ liệu | Các bước | Mong đợi | Thực tế | Trạng thái | Bằng chứng | Ghi chú |
| --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- |
| S1-01 | S1 | Tìm bằng chip gợi ý | P1 | Ở trang chủ `/vi` | TD-08 | 1. Chạm ô **Tìm kiếm...** 2. Bấm chip **Sapa** | Sang `/search?q=Sapa`, lưới 2 cột video | Đúng, 6 video đầu, không tràn khung | ✅ | S1-01-1/2/3.jpg | |
| S1-02 | S1 | Tìm từ khoá không có kết quả | P2 | Ở `/search` | TD-09 | 1. Gõ TD-09 vào ô **Tìm kiếm video...** 2. Enter | Hiện trạng thái "không tìm thấy" | Vẫn hiện 6 video không liên quan (tìm kiếm ngữ nghĩa luôn trả kết quả gần nhất) | ❌ | S1-02-1/2.jpg | D-09 |
| S1-03 | S1 | Chỉ 1 video có tiếng | P2 | Có kết quả S1-01 | TD-08 | 1. Bấm loa video 1 2. Bấm loa video 2 | Video 2 có tiếng, video 1 tắt tiếng | Đúng (chỉ video 2 `muted=false`) | ✅ | S1-03-1.jpg | |
| S1-04 | S1 | Cuộn tải thêm | P2 | Có kết quả S1-01 | TD-08 | 1. Cuộn xuống cuối lưới 4 lần | Tải thêm trang (cursor `distanceScore`) | 6 → 18 video, 3 request trang tiếp | ✅ | S1-04-1.jpg | |
| S1-05 | S1 | Mở video từ lưới | P1 | Ở `/search?q=Sapa` | TD-08 | 1. Bấm video **Du lịch Miền Bắc - Sapa** | Sang `/video/<slug>?autoplay=true`, video tự phát có tiếng | Đúng, đang phát, có tiếng | ✅ | S1-05-1/2.jpg | |
| S1-06 | S1 | Vuốt sang video kế | P1 | Đang ở feed (S1-05) | — | 1. Vuốt/cuộn lên 1 màn | Video kế phát, video cũ dừng, URL đổi | Đúng (`/video/du-lich-tay-bac-lzls`) | ✅ | S1-06-1.jpg | Console có 2 lỗi 404 tải trước `.ts` (D-10) |
| S1-07 | S1 | Mở tour từ card video | P1 | Đang ở feed | — | 1. Bấm card thông tin tour ở đáy video | Sang `/product/<id>` | Đúng (`/product/0475868b…`) | ✅ | S1-07-1/2.jpg | Trang tour không có ảnh hiện "1 / 0"; giá "USD350,000" (D-11) |
| S1-08 | S1 | Reload gate khi mở link chia sẻ | P1 | Tab mới, không qua lưới | TD-17 | 1. Mở trực tiếp TD-17 2. Thử cuộn 3. Bấm nút **Play** lớn 4. Cuộn | Bước 2 không cuộn được, video dừng; sau Play: có tiếng, cuộn được | Đúng: khoá cuộn (`overflow:hidden`), sau Play có tiếng và sang video kế | ✅ | S1-08-1/2.jpg | |

## S2 · Đặt tour (đăng nhập `ACC-CLIENT`)

| ID | Suite | Tiêu đề | Ưu tiên | Điều kiện trước | Dữ liệu | Các bước | Mong đợi | Thực tế | Trạng thái | Bằng chứng | Ghi chú |
| --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- |
| S2-01 | S2 | Đặt tour đầy đủ (tạo booking thật) | P1 | Đăng nhập TD-04; tour TD-02 | TD-01, TD-02 | 1. Mở tour TD-02, bấm **Đặt ngay** 2. Giữ ngày 16/11/2026, thêm 1 Adult + 1 Child 3. Nhập TD-01, chọn **Zalo** và nhập tài khoản 4. **Tiếp tục →** 5. Chọn 08:00, City Center Meeting Point, Standard Tour Option 6. **Tiếp tục →** 7. Tick đồng ý điều khoản 8. **Xác nhận đặt tour →** | Tạo booking `pending`, tổng 1.000.000 ₫, sang bước 4 Thanh toán | `POST /booking` 201, mã **BKMWJC44UC17ABC2**, DB: pending, 1.000.000 VND, đúng session/giờ/điểm đón/gói/khách/Zalo | ✅ | S2-01-1…10.jpg | Nhãn stepper và ngày tiếng Anh (D-08) |
| S2-02 | S2 | Thiếu thông tin liên hệ | P1 | Bước 1 | — | 1. Thêm 1 Adult, để trống họ tên/SĐT/email | Không cho sang bước 2 | Nút **Tiếp tục →** bị khoá | ✅ | S2-02-1.jpg | Không có thông báo nói thiếu trường nào (chỉ khoá nút) |
| S2-03 | S2 | Email / SĐT sai định dạng | P1 | Bước 1, đã có khách | TD-10, TD-11 | 1. Nhập email TD-10 2. Sửa email đúng, nhập SĐT TD-11 | Báo lỗi và khoá nút với cả email sai và SĐT sai | Email sai: "Địa chỉ email không hợp lệ" + khoá nút ✅. SĐT `+84 12`: **không báo lỗi, nút Tiếp tục mở** | ❌ | S2-03-1/2.jpg | D-04 |
| S2-04 | S2 | Ngày không có lịch | P1 | Bước 1 | TD-12 | 1. Bấm ô ngày, chọn 17 | Báo không có lịch, không cho tiếp | "Không có lượt khởi hành cho ngày này. Vui lòng chọn ngày khác.", nút khoá | ✅ | S2-04-0/1/2.jpg | Đổi ngày → số khách về 0 |
| S2-05 | S2 | Quay lại / tiếp tục giữ dữ liệu | P1 | Đang ở bước 2 | TD-01 | 1. Bấm **←** về bước 1 | Giữ ngày, khách, liên hệ | Liên hệ + Zalo giữ nguyên; **số khách về 0, tổng ₫0**, phải chọn lại | ❌ | S2-05-1/2.jpg | D-05 (đã biết M23) |
| S2-06 | S2 | Bắt buộc đồng ý điều khoản | P1 | Bước 3 | — | 1. Không tick điều khoản 2. Tick điều khoản | Nút **Xác nhận đặt tour** khoá khi chưa tick | Đúng | ✅ | S2-06-1/2.jpg | |

## S3 · Thanh toán VNPay

| ID | Suite | Tiêu đề | Ưu tiên | Điều kiện trước | Dữ liệu | Các bước | Mong đợi | Thực tế | Trạng thái | Bằng chứng | Ghi chú |
| --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- |
| S3-01 | S3 | Mở cổng VNPay sandbox | P1 | Booking S2-01 ở bước 4 | TD-03 | 1. Bấm **Thanh toán qua VNPAY** | Mở trang chọn ngân hàng/nhập thẻ VNPay sandbox | BE tạo URL (201) nhưng VNPay chuyển ngay tới `Error.html?code=71` **"Website này chưa được phê duyệt"**. Thử lại 1 lần không gửi Referer: cùng lỗi | ❌ | S3-01-1/2.jpg | D-01 |
| S3-02 | S3 | Thanh toán thành công → booking `paid` | P1 | S3-01 qua được | TD-03 | 1. Chọn NCB, nhập `CARD-VNPAY`, OTP 2. Về trang kết quả 3. Kiểm DB | Trang thành công; DB `paid`, payment `succeed` | Không chạy được | ⛔ | — | Bị chặn bởi D-01 |
| S3-03 | S3 | Huỷ trên trang VNPay | P1 | S3-01 qua được | — | 1. Bấm Huỷ trên VNPay | Trang thất bại + **Thử lại** | Không chạy được | ⛔ | — | Bị chặn bởi D-01 |
| S3-04 | S3 | Trang kết quả thất bại + Thử lại | P2 | Có booking S2-01 | TD-20 | 1. Mở `/vi/payment/vnpay/return?status=failed…` 2. Bấm **Thử lại** | Hiện "Thanh toán không thành công", Thử lại về trang đặt tour | Đúng | ✅ | S3-03-1.jpg | Hiện "Mã đặt chỗ" là UUID, không phải mã booking |
| S3-05 | S3 | Trang kết quả không tin tham số URL | P1 | Booking vẫn `pending` | TD-20 | 1. Mở URL `status=success&txnRef=FAKE123…` | Không hiện thành công khi BE chưa xác nhận | Hiện "Thanh Toán Thành Công!" + "Email xác nhận đã được gửi" dù DB vẫn `pending` | ❌ | S3-04-1.jpg | D-02 (đã biết M7) |
| S3-06 | S3 | Nút "Thanh toán bằng thẻ" | P3 | Bước 4 | — | 1. Bấm **Thanh toán bằng thẻ** | Mở thanh toán thẻ hoặc không hiển thị nút | Không có phản hồi gì | ❌ | S2-01-10.jpg | D-12 (đã biết M25) |

## S3b · Thanh toán PayPal (tour USD) — chạy bổ sung 16/11 ~21:40, `http://localhost:3000/vi` (nhánh `dev`)

Điều kiện chung: tour TD-22 (đã thêm loại khách + 60 lịch); đăng nhập TD-04; booking đi tới bước 4 (1. Chọn ngày 2. **+** Adult 3. Nhập liên hệ `ZZ QA PayPal…` 4. **Tiếp tục →** 5. 08:00, City Center Meeting Point, Standard Tour Option 6. **Tiếp tục →** 7. Tick đồng ý 8. **Xác nhận đặt tour →**). Popup PayPal chạy được cả localhost lẫn Vercel.

| ID | Suite | Tiêu đề | Ưu tiên | Điều kiện trước | Dữ liệu | Các bước | Mong đợi | Thực tế | Trạng thái | Bằng chứng | Ghi chú |
| --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- |
| S3-07 | S3 | Đúng cổng theo loại tiền | P1 | Bước 4 của 1 booking VND và 1 booking USD | TD-22, TD-23 | 1. Xem bước 4 tour VND 2. Xem bước 4 tour USD | VND: chỉ có **Thanh toán qua VNPAY**, tổng hiện ₫. USD: chỉ có nút **PayPal**, tổng hiện $ | VND: "Thanh toán qua VNPAY", ₫1.200.000. USD: nút vàng "PayPal", $90. Không bên nào có cổng của bên kia | ✅ | S3-07-1/2.jpg | |
| S3-08 | S3 | Thanh toán PayPal thành công (đăng nhập tài khoản PayPal) | P1 | Bước 4 tour USD, 2 Adult | TD-21 | 1. Bấm nút **PayPal** 2. Popup: nhập email `ACC-PAYPAL` → **Next** → mật khẩu → **Log In** 3. Kiểm số tiền, chọn phương thức ở **Pay with** 4. Bấm **Pay** 5. Kiểm DB | Popup đóng, bước 4 hiện màn **Thành công**; DB: booking `paid`, payment PayPal `succeed`, số tiền khớp tổng | Popup hiện $90.00 = tổng bước 4; sau **Pay** popup đóng, hiện "Thanh Toán Thành Công!". DB: `BKMWJDGLLBB7DD70` `paid`, payment paypal `succeed` 90 USD | ✅ | S3-08-1/2/3.jpg | Lúc bấm **Pay**, phương thức đang chọn là **Visa ••5240** (ảnh 2) — bấm "PayPal balance" không đổi được lựa chọn, nên **trả bằng số dư PayPal chưa được kiểm**. Nút trên popup tên **Pay** (bản cũ: **Complete Purchase**) |
| S3-09 | S3 | Thanh toán PayPal bằng thẻ đã lưu | P2 | Bước 4 tour USD, 1 Adult | TD-21 | 1. Như S3-08 bước 1–2 2. Bấm **Pay with** → chọn **Visa Debit ••5240** 3. **Pay** 4. Kiểm DB | Như S3-08 | Popup $45.00 trả bằng Visa; màn thành công; DB: `BKMWJDLI29B239BC` `paid`, payment `succeed` 45 USD | ✅ | S3-09-1/2.jpg | Thẻ sandbox gắn sẵn trong `ACC-PAYPAL` |
| S3-10 | S3 | Trả bằng thẻ không cần tài khoản PayPal | P3 | Bước 4 tour USD | — | 1. Bấm nút **PayPal** 2. Ở màn đầu bấm **Pay with Debit or Credit Card** | Có đường trả bằng thẻ không cần tài khoản | Mở "Check out as a guest": nhập email → **Continue to Payment** → form thẻ | ✅ | S3-10-1.jpg | Chỉ kiểm tới đây, không nhập thẻ |
| S3-11 | S3 | Huỷ trong popup PayPal | P1 | Bước 4 tour USD | TD-21 | 1. Bấm nút **PayPal** 2. Bấm **Cancel and return to Web Travel** | Popup đóng, ở lại bước 4, báo đã huỷ; booking vẫn `pending`; bấm PayPal lại được | Đúng: popup đóng, hiện thông báo, thanh toán lại được (S3-08). Thông báo lặp chữ "Giao dịch đã bị hủy." 2 lần | ✅ | S3-11-1/2.jpg | D-13 (thấp). Lần huỷ để lại 1 payment `pending` trong DB |
| S3-12 | S3 | Nút "Thanh toán bằng thẻ" ở tour USD | P3 | Bước 4 tour USD | — | 1. Bấm **Thanh toán bằng thẻ** | Mở thanh toán thẻ hoặc không hiển thị nút | Không có phản hồi (không đổi trang, không popup) | ❌ | S3-12-1.jpg | D-12. Khách USD trả thẻ được qua PayPal (S3-09/S3-10) |

## S4 · Tài khoản

| ID | Suite | Tiêu đề | Ưu tiên | Điều kiện trước | Dữ liệu | Các bước | Mong đợi | Thực tế | Trạng thái | Bằng chứng | Ghi chú |
| --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- |
| S4-01 | S4 | Đăng nhập để trống | P2 | `/vi/sign-in` | — | 1. Bấm **Đăng nhập** khi trống | Báo bắt buộc bằng tiếng Việt | Báo lỗi đúng chỗ nhưng tiếng Anh: "Email is required", "Password is required" | ❌ | S4-01-1.jpg | D-07 (M45) |
| S4-02 | S4 | Sai mật khẩu | P1 | `/vi/sign-in` | TD-04 + mật khẩu sai | 1. Nhập email, mật khẩu sai 2. **Đăng nhập** | Thông báo sai thông tin, ở lại trang | "Email hoặc mật khẩu không đúng." | ✅ | S4-02-1/2.jpg | |
| S4-03 | S4 | Đăng nhập đúng, email chữ hoa | P1 | `/vi/sign-in` | TD-04 (gõ `ZZ.Client@Example.com`) | 1. Nhập đúng mật khẩu 2. **Đăng nhập** | Đăng nhập được, về `/vi` | Đúng; email lưu dạng chữ thường | ✅ | S4-03-1.jpg | |
| S4-04 | S4 | Menu tài khoản | P2 | Đã đăng nhập | TD-04 | 1. Bấm avatar (User menu) | Sheet có email, **Đổi mật khẩu**, **Đăng xuất** | Đúng | ✅ | S4-04-1/2.jpg | Avatar hiện "?" |
| S4-05 | S4 | Đổi mật khẩu rồi đổi lại | P1 | Đã đăng nhập | TD-04, TD-14 | 1. **Đổi mật khẩu** 2. Xác nhận không khớp 3. Mật khẩu hiện tại sai 4. Nhập đúng → **Cập nhật mật khẩu** 5. (sau S4-06) đăng nhập bằng mật khẩu mới, đổi lại mật khẩu gốc | Lỗi rõ ở bước 2–3; bước 4 thành công, vẫn đăng nhập | "Mật khẩu xác nhận không khớp", "Mật khẩu hiện tại không đúng", "Đã đổi mật khẩu"; đã đổi lại mật khẩu gốc | ✅ | S4-05-1/2/3.jpg | |
| S4-06 | S4 | Đăng xuất | P1 | Đã đăng nhập | TD-04 | 1. Menu → **Đăng xuất** 2. Xác nhận **Đăng xuất** 3. Đăng nhập bằng mật khẩu cũ | Hỏi xác nhận, xoá token, về `/sign-in`; mật khẩu cũ bị từ chối | Đúng | ✅ | S4-06-1/2.jpg | |
| S4-07 | S4 | Đăng ký: mật khẩu yếu, email trùng | P2 | `/vi/sign-up` | TD-13 | 1. Mật khẩu `abc` 2. Mật khẩu `abcdefgh` 3. Email trùng | Thông báo tiếng Việt | Bắt lỗi đúng nhưng tiếng Anh: "Password must be at least 6 characters", "Password must contain…", BE: "email already register, please try to login!" | ❌ | S4-07-1/2.jpg | D-07 |
| S4-08 | S4 | Đăng ký tài khoản mới | P1 | `/vi/sign-up` | TD-13 | 1. Nhập email mới + mật khẩu hợp lệ 2. **Đăng ký** | Sang `/sign-in` + thông báo thành công; DB có user `normal` | "Đăng ký thành công"; DB: `zz.qa+1794838113156@example.com`, role normal | ✅ | S4-08-1/2.jpg | |
| S4-09 | S4 | Quên mật khẩu: email sai | P3 | `/vi/forgot-password` | TD-10 | 1. Nhập email sai 2. **Gửi link đặt lại** | Báo lỗi tiếng Việt | "This is not a valid Email" (tiếng Anh) | ❌ | S4-09-1.jpg | D-07. Không gửi email thật |

## S5 · Hướng dẫn viên

| ID | Suite | Tiêu đề | Ưu tiên | Điều kiện trước | Dữ liệu | Các bước | Mong đợi | Thực tế | Trạng thái | Bằng chứng | Ghi chú |
| --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- |
| S5-01 | S5 | HDV đăng nhập → hồ sơ của mình | P1 | Chưa đăng nhập | TD-05 | 1. Đăng nhập TD-05 | Về `/guide/<id của mình>`, thấy **Chỉnh sửa hồ sơ**, **Quản lý**, Đăng xuất | Đúng | ✅ | S5-01-1.jpg | |
| S5-02 | S5 | Mở Chỉnh sửa hồ sơ | P2 | S5-01 | — | 1. **Chỉnh sửa hồ sơ** | Sheet có các tab Lý lịch/Kỹ năng/Sự nghiệp | Đúng (đóng, không lưu) | ✅ | S5-02-1/2.jpg | |
| S5-03 | S5 | Mở Quản lý moments | P2 | S5-01 | — | 1. **Quản lý** ở mục Khoảnh khắc | Sheet + **Thêm khoảnh khắc** | Đúng, trạng thái trống có hướng dẫn | ✅ | S5-03-1/2.jpg | Không upload |
| S5-04 | S5 | Xem hồ sơ HDV khác | P1 | Đăng nhập TD-05 | TD-16 | 1. Mở hồ sơ TD-16 2. **Đánh giá tôi** | Không có nút sửa/quản lý; có **Đánh giá tôi**, nút nổi về hồ sơ mình | Đúng; sheet đánh giá mở (không gửi) | ✅ | S5-04-1/2.jpg | |
| S5-05 | S5 | Tutorial lần đầu | P3 | HDV chưa xem tutorial | TD-05 | 1. Đăng nhập lần đầu | driver.js hướng dẫn hiện | Không chạy: `tour_guide.onboarding = true` từ 13:41 (đã xem trước lần chạy) | ⏭ | — | Cần tài khoản HDV mới |

## S6 · Admin CRUD (`ACC-ADMIN`, 1440×810)

| ID | Suite | Tiêu đề | Ưu tiên | Điều kiện trước | Dữ liệu | Các bước | Mong đợi | Thực tế | Trạng thái | Bằng chứng | Ghi chú |
| --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- |
| S6-01 | S6 | Điểm đến: tìm có / không kết quả + xoá tìm | P2 | Đăng nhập admin | TD-09 | 1. Gõ TD-09 2. **Xoá tìm kiếm** 3. Gõ "Hà Nội" | "Không tìm thấy điểm đến"; xoá → đủ danh sách; "Hà Nội" ra 1 dòng | Đúng | ✅ | S6-01-1.jpg | |
| S6-02 | S6 | Tạo điểm đến (validate + lưu, ở lại form) | P2 | Destinations | TD-15 | 1. **Thêm điểm đến** 2. **Tạo điểm đến** khi trống 3. Tên `Z` 4. Tên + mô tả hợp lệ → **Tạo điểm đến** | Lỗi "2–100 ký tự"; tạo xong chuyển sang trang sửa | Đúng; `POST` 201, sang `/destinations/f7f604c1…/edit` | ✅ | S6-02-1/2.jpg | |
| S6-03 | S6 | Sửa điểm đến, ở lại form | P2 | S6-02 | TD-15 | 1. Sửa mô tả 2. **Lưu thay đổi** | Ở lại form, DB cập nhật | Đúng; DB mô tả = `ZZ QA mo ta da sua` | ✅ | S6-03-1.jpg | |
| S6-04 | S6 | Rời form khi chưa lưu | P2 | S6-03 | — | 1. Sửa mô tả 2. **Danh sách** 3. **Bỏ thay đổi** | Hỏi "Bỏ các thay đổi chưa lưu?"; về danh sách có bản ghi mới | Đúng | ✅ | S6-04-1/2.jpg | |
| S6-05 | S6 | Tìm không có kết quả + xoá tìm (5 màn) | P2 | Đăng nhập admin | TD-09 | Products, Tour Guides, Suppliers, Users, Videos: 1. Gõ TD-09 2. Bấm nút xoá tìm | Trạng thái trống tiếng Việt; xoá → đủ danh sách | Đúng cả 5 màn | ✅ | S6-05-*.jpg | |
| S6-06 | S6 | Products: menu dòng, Lịch & Giá | P2 | Đăng nhập admin | TD-02 | 1. Tìm "Nhed" 2. Mở menu ⋯ 3. Mở form sửa → **Quản lý Lịch & Giá** | Không có Xoá; mở được sheet Lịch & Giá | Menu: Chỉnh sửa, Ẩn (không Xoá ✅). Sheet mở từ form ✅ | ✅ | S6-06-1…4.jpg | Menu dòng không có "Quản lý Lịch & Giá" như tài liệu 12 mô tả; nút header tiếng Anh (D-08) |

## S7 · Admin booking

| ID | Suite | Tiêu đề | Ưu tiên | Điều kiện trước | Dữ liệu | Các bước | Mong đợi | Thực tế | Trạng thái | Bằng chứng | Ghi chú |
| --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- |
| S7-01 | S7 | Tìm booking ZZ QA, xem 2 tab | P1 | Booking S2-01 | TD-01 | 1. Bookings → gõ "ZZ QA" 2. Bấm 👁 **Chi tiết Booking** 3. Tab **Thanh toán & Lịch sử** | Đúng dữ liệu, nhãn đúng | Dữ liệu đúng; tab thanh toán có VNPAY "Đang chờ". **Nhãn tên khách ghi "Tên hướng dẫn viên"** | ❌ | S7-01-1…4.jpg | D-06 |
| S7-02 | S7 | Bookings: không có kết quả | P2 | Bookings | TD-09 | 1. Gõ TD-09 2. **Xoá bộ lọc** | Trạng thái trống, xoá về danh sách | Đúng | ✅ | S7-02-1.jpg | |
| S7-03 | S7 | Huỷ booking pending có lý do | P1 | Drawer booking S2-01 | TD-18 | 1. **Huỷ booking** 2. Để trống lý do 3. Nhập TD-18 → **Huỷ booking** | Nút khoá khi trống lý do; cảnh báo payment pending; huỷ xong drawer hiện thông tin huỷ; DB `cancel` | Đúng; DB `status=cancel` | ✅ | S7-03-1/2/3.jpg | Payment VNPay của booking vẫn `pending` (đã có cảnh báo trong dialog; xem I2 trong review) |
| S7-04 | S7 | Thẻ thống kê booking | P2 | Bookings | — | 1. Xem 4 thẻ KPI, đối chiếu DB | Tổng tiền đúng theo tiền tệ | Cộng lẫn VND và USD, hiển thị ký hiệu "$" (vd "Tổng tiền: $8,641,244") | ❌ | S8-01-2.jpg | D-03 |

## S8 · Phân quyền

| ID | Suite | Tiêu đề | Ưu tiên | Điều kiện trước | Dữ liệu | Các bước | Mong đợi | Thực tế | Trạng thái | Bằng chứng | Ghi chú |
| --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- |
| S8-01 | S8 | Chưa đăng nhập mở trang admin | P1 | Xoá phiên | TD-06 | 1. Mở `/vi/admin/bookings` 2. Đăng nhập TD-06 | Chuyển `/admin/login?callbackUrl=…`, đăng nhập xong quay về Bookings | Đúng | ✅ | S8-01-1/2.jpg | |
| S8-02 | S8 | Khách đã đăng nhập mở admin | P1 | Đăng nhập TD-04 | — | 1. Mở `/vi/admin/products` | Bị chuyển tới đăng nhập admin | Đúng | ✅ | S8-02-1.jpg | |
| S8-03 | S8 | Tài khoản khách đăng nhập admin | P1 | `/admin/login` | TD-04 | 1. Nhập tài khoản khách 2. **Đăng nhập** | Từ chối | "Email hoặc mật khẩu không chính xác" | ✅ | S8-03-1.jpg | |
| S8-04 | S8 | Admin xem super admin | P1 | Đăng nhập TD-06 | `ACC-SUPER` (chỉ xem) | 1. Users → tìm super admin 2. Mở form | Chỉ xem, không lưu/không đổi vai trò | Banner "Bạn chỉ xem được tài khoản này…", form `fieldset disabled`, không có nút Lưu | ✅ | S8-04-1/2.jpg | |
| S8-05 | S8 | Admin gán vai trò | P1 | Đăng nhập TD-06 | TD-19 | 1. Mở form user thường 2. Mở ô **Vai trò** | Không chọn được Quản trị viên / Quản trị cấp cao | 2 lựa chọn này bị disabled | ✅ | S8-05-1.jpg | Không lưu |
| S8-06 | S8 | Nút sửa chỉ ở hồ sơ của mình | P1 | Đăng nhập TD-05 | TD-16 | Như S5-01 và S5-04 | Chỉ hồ sơ mình có Chỉnh sửa/Quản lý | Đúng | ✅ | S5-01-1.jpg, S5-04-1.jpg | |

## S9 · Chất lượng giao diện

| ID | Suite | Tiêu đề | Ưu tiên | Điều kiện trước | Dữ liệu | Các bước | Mong đợi | Thực tế | Trạng thái | Bằng chứng | Ghi chú |
| --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- |
| S9-01 | S9 | Không tràn khung 430px | P2 | 430×932 | — | Mở 9 trang: `/`, search, product, booking, guide, sign-in, sign-up, forgot, 404 | `scrollWidth = 430` | Đúng cả 9 trang | ✅ | S9-03-1.jpg | |
| S9-02 | S9 | Toàn bộ chữ tiếng Việt, không key thô | P3 | `/vi` | — | Đọc chữ hiển thị trên các trang đã test | Không có key i18n thô, không chữ tiếng Anh cứng | Không có key thô ✅. Còn chữ tiếng Anh: stepper "Info/Options/Review/Payment", ngày "Mon, Nov 16, 2026", "Chat App", "… More" ở feed, trang 404, nút admin "Save Changes / Hide Product" | ❌ | S2-01-2.jpg, S1-08-1.jpg, S9-03-1.jpg, S6-06-3.jpg | D-08 |
| S9-03 | S9 | Lỗi console | P3 | — | — | Theo dõi console mọi bước | Không có lỗi mới | 404 tải trước `video1.ts`/`video2.ts` (Bunny) ở feed; admin: "`DialogContent` requires a `DialogTitle`" khi mở drawer booking | ❌ | S1-06-1.jpg, S7-01-3.jpg | D-10 |
