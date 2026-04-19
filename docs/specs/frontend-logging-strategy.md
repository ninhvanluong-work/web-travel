# Tài liệu Kỹ thuật: Chiến lược Logging & Error Tracking (Frontend)

Tài liệu này quy chuẩn hóa cách quản lý Log, xử lý lỗi và quy trình báo cáo lỗi (Reporting) cho dự án `web-travel`.

## 1. Phân tầng mức độ Log (Log Levels)

Hệ thống sử dụng 5 tầng phân cấp để tối ưu hiệu năng và khả năng phản ứng của Developer:

| Level     | Định nghĩa                                                                    | Hành động (Action)                                          |
| :-------- | :---------------------------------------------------------------------------- | :---------------------------------------------------------- |
| **FATAL** | Lỗi nghiêm trọng làm app dừng hoạt động (Crash UI).                           | Báo về **Sentry** + Gửi tin nhắn **Telegram** ngay lập tức. |
| **ERROR** | Lỗi logic/API làm tính năng không hoạt động (vd: không đặt được tour).        | Báo về **Sentry** để theo dõi trên Dashboard.               |
| **WARN**  | Các cảnh báo tiềm ẩn, lỗi không ảnh hưởng trực tiếp (vd: thiếu ảnh optional). | Ghi log vào **Sentry** (độ ưu tiên thấp).                   |
| **INFO**  | Các cột mốc quan trọng (User Login, Checkout Finish).                         | Sử dụng làm **Breadcrumbs** trên Sentry để điều tra lỗi.    |
| **DEBUG** | Log chi tiết kỹ thuật cho Developer (API Payload, State).                     | Chỉ hiển thị trên **vConsole** tại thiết bị mobile.         |

---

## 2. Giải pháp Kỹ thuật (Implementation)

### 2.1. Logger Utility

Xây dựng một lớp `Logger` tập trung tại `src/utils/logger.ts`. Dev sẽ sử dụng lớp này thay vì `console.log` truyền thống.

```typescript
// Ví dụ cách dùng
logger.fatal('Hợp đồng thanh toán bị lỗi render', error);
logger.debug('Giá trị tham số API:', payload);
```

### 2.2. Debugging trên Mobile (vConsole)

- **Cơ chế:** Thư viện `vConsole` chỉ được load khi cần thiết (Lazy load).
- **Trigger:** Nhấn ट्रिपल-tap (3 lần) vào Logo công ty hoặc thêm param `?debug=true` để mở console.

### 2.3. Sentry Integration

- Tự động bắt mọi lỗi Unhandled Promise Rejection và Runtime Error.
- Cấu hình Source Map để Dev thấy được chính xác dòng code lỗi thay vì code đã nén (minified).

---

## 3. Quy trình báo lỗi cho Developer (Reporting)

Hệ thống báo lỗi sẽ được thiết lập tự động:

1.  **Telegram Bot:**
    - **Đối tượng:** Chỉ các lỗi cấp độ **FATAL**.
    - **Nội dung:** Tên lỗi, User đang gặp, Link trực tiếp đến Sentry để xem Stack trace.
2.  **Sentry Dashboard:**
    - Nơi chính để Dev vào "khám bệnh" hàng ngày.
    - Thống kê tần suất lỗi theo version (Release) để biết bug mới xuất hiện từ khi nào.
3.  **Slack/Discord (Tùy chọn):**
    - Có thể cấu hình song song nếu team sử dụng nhiều nền tảng.

---

## 4. Bảo mật & Hiệu năng (Privacy & Performance)

- **Masking:** Tự động ẩn các trường nhạy cảm như `password`, `token`, `cardNumber` trước khi gửi lên Sentry.
- **Batching:** Log được gửi theo lô (Batch) để không làm "nghẽn" đường truyền mạng của user.
- **Environment:** Ở môi trường Local, log bình thường. Ở môi trường Production, tự động chuyển sang cơ chế giám sát từ xa.

---

_Tài liệu này được soạn thảo bới Antigravity (Powered by BMAD) - 2026-04-18_
