---
title: 'Cơ chế Refresh Token'
created: '2026-07-01'
status: 'draft'
domain: 'infra'
---

# Spec: Cơ chế Refresh Token

## 1. Vấn đề / Mục tiêu

> Access Token có thời gian sống ngắn để đảm bảo bảo mật. Khi token hết hạn, các API gọi bằng token cũ sẽ bị lỗi 401. Cần một cơ chế tự động gia hạn (refresh) token ẩn dưới nền và chạy lại các request bị lỗi, mang lại trải nghiệm mượt mà, không gián đoạn (seamless) cho người dùng mà không bắt họ phải đăng nhập lại liên tục.

---

## 2. Hành vi mong muốn

| Hành động                                                           | Kết quả mong đợi                                                                                                                                      |
| ------------------------------------------------------------------- | ----------------------------------------------------------------------------------------------------------------------------------------------------- |
| Gửi request tới API yêu cầu xác thực nhưng Access Token đã hết hạn  | Hệ thống chặn request lại, không hiển thị lỗi ngay. Gọi API `/renew` với Refresh Token.                                                               |
| Gọi API `/renew` thành công                                         | Token mới được lưu, request bị lỗi 401 ban đầu được gọi lại với token mới và trả kết quả như bình thường.                                             |
| Gọi API `/renew` thất bại (Refresh Token cũng hết hạn/không hợp lệ) | Xóa toàn bộ token (đăng xuất local) và đẩy người dùng về trang đăng nhập với thông báo lỗi.                                                           |
| Nhiều request bị lỗi 401 cùng lúc do token hết hạn                  | Chỉ gọi API `/renew` đúng **1 lần**. Các request khác đưa vào hàng đợi (queue) và sẽ tự động chạy lại sau khi quá trình `/renew` đầu tiên thành công. |

---

## 3. Thay đổi kỹ thuật

> Triển khai axios interceptor để tự động hóa quá trình refresh token.

| File                                                            | Thay đổi                                                                                                                                                                                                                                                                                                                                                                                                                |
| --------------------------------------------------------------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `src/lib/axios.ts` (hoặc nơi cấu hình axios config/interceptor) | 1. Thêm biến cờ `isRefreshing` (boolean).<br>2. Thêm mảng `refreshSubscribers` chứa các request chờ xử lý.<br>3. Trong **Response Interceptor**, bắt lỗi 401.<br>4. Nếu 401 và chưa `isRefreshing`: Gọi API `/auth/access-token/renew`, sau khi thành công lặp qua mảng `refreshSubscribers` để resolve, reset cờ.<br>5. Nếu 401 và đang `isRefreshing`: Return một `new Promise` để đẩy vào mảng `refreshSubscribers`. |
| `src/types/auth.ts` (hoặc file định nghĩa type)                 | Thêm/Cập nhật interface response của API `/auth/access-token/renew` (data gồm `accessToken`, `refreshToken`, `user`).                                                                                                                                                                                                                                                                                                   |
| `src/lib/auth.ts` (hoặc tiện ích xử lý token)                   | Thêm các hàm `setToken`, `clearToken` thao tác lên Cookies/LocalStorage để axios interceptor gọi khi update hoặc clear session.                                                                                                                                                                                                                                                                                         |

---

## 4. Dependencies & Conflicts

- **Depends on:** Hệ thống Backend đã support end-point `POST /auth/access-token/renew` trả về HTTP 401 khi Refresh Token không hợp lệ.
- **Modifies:** Cấu hình khởi tạo Axios (hoặc fetch custom hook), các hàm tiện ích lưu trữ cookie/token.
- **Must NOT break:** Luồng login hiện tại, các request API public (không cần token).
- **Conflicts with:** None.

---

## 5. Out of scope

- Refresh Token ở tầng Server Component (SSR). Spec này tạm giới hạn ở việc xử lý tự động refresh token bằng Axios interceptor tại Client-side.
- Cơ chế refresh trước khi token hết hạn (Silent Refresh bằng timer). Spec này tập trung vào xử lý khi token _đã thực sự_ hết hạn (gặp 401).

---

## 6. Open questions

- Lưu token mới sử dụng `js-cookie` ở Client hay giao tiếp qua Next.js API Routes (Server HTTP-Only cookie) để an toàn hơn?
- Nếu Client gọi `/renew` nhưng mất mạng thì sẽ handle retry hay abort hẳn quá trình refresh?
