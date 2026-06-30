---
title: 'Tích hợp tính năng Quên và Đặt lại mật khẩu'
created: '2026-06-30'
status: 'draft'
domain: 'auth'
---

# Spec: Tích hợp API Quên mật khẩu và Đặt lại mật khẩu

## 1. Vấn đề / Mục tiêu

> Hiện tại, hệ thống cần tích hợp hoàn chỉnh luồng quên mật khẩu và đặt lại mật khẩu dựa trên API mới từ Backend. Cụ thể cần 2 chức năng chính: gửi email chứa link đổi mật khẩu (kèm token) và sử dụng token đó để cập nhật mật khẩu mới.

---

## 2. Hành vi mong muốn

| Hành động                                                          | Kết quả mong đợi                                                                                                                             |
| ------------------------------------------------------------------ | -------------------------------------------------------------------------------------------------------------------------------------------- |
| Nhập email tại trang **Quên Mật Khẩu** (`/forgot-password`) và gửi | Gọi API `POST /auth/forgot-password` với payload: `{"email": "user@example.com"}`. Hiển thị thông báo thành công (Giao diện hiện tại đã có). |
| Nhận email và click link                                           | User được điều hướng về `https://[domain]/reset-password?token=xxxx`.                                                                        |
| Truy cập trang **Đặt lại Mật Khẩu** (`/reset-password`)            | Giao diện hiện ra form nhập **Mật khẩu mới** và **Xác nhận mật khẩu mới**.                                                                   |
| Nhập mật khẩu mới, xác nhận hợp lệ và gửi                          | Gọi API `POST /auth/reset-password` với payload `{"token": "xxxx", "newPassword": "mật khẩu mới"}`.                                          |
| Submit API Đặt lại Mật Khẩu thành công                             | Hiển thị thông báo thành công, và chuyển hướng người dùng trở về trang Login (`/sign-in`).                                                   |

---

## 3. Thay đổi kỹ thuật

| File                                       | Thay đổi                                                                                                                                                                         |
| ------------------------------------------ | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `src/api/auth/requests.ts`                 | Sửa URL API từ `/authentication/...` sang `/auth/forgot-password` và `/auth/reset-password`.                                                                                     |
| `src/api/auth/types.ts`                    | Sửa kiểu dữ liệu `IResetPassword` thành `{ token: string; newPassword: string }` để map với body của API mới.                                                                    |
| `src/api/auth/queries.ts`                  | Bổ sung `useResetPasswordMutation` thông qua `createMutation`.                                                                                                                   |
| `src/lib/validations/auth.ts`              | Cập nhật `resetPassSchema` chỉ bao gồm `password` và `confirmPassword` (loại bỏ `email` do token đảm nhận việc định danh).                                                       |
| `src/types/routes.ts`                      | Bổ sung route `RESET_PASSWORD: '/reset-password'` vào `ROUTE`.                                                                                                                   |
| `src/modules/ForgotPasswordPage/index.tsx` | Kiểm tra lại logic hiển thị lỗi cho khớp với mã lỗi backend (nếu cần thiết).                                                                                                     |
| `src/pages/reset-password.tsx`             | (Tạo mới) Thêm Next.js page cấu hình Layout và i18n.                                                                                                                             |
| `src/modules/ResetPasswordPage/index.tsx`  | (Tạo mới) Dựng UI với form đặt lại mật khẩu (theo phong cách tương tự `ForgotPasswordPage`). Lấy token từ URL (`router.query.token`), submit gọi API và redirect khi thành công. |

---

## 4. Dependencies & Conflicts

- **Depends on:** Backend API `/auth/forgot-password` & `/auth/reset-password` đã sẵn sàng và hoạt động đúng chuẩn Swagger. Email config bên Backend (`smtp google`) đã cấu hình xong để gửi mail.
- **Modifies:** `useForgotPasswordMutation`
- **Must NOT break:** Luồng Sign in / Sign up hiện tại.
- **Conflicts with:** None

---

## 5. Out of scope

- Flow thay đổi mật khẩu trực tiếp trong Dashboard/Settings khi đã đăng nhập (Change Password) sẽ không nằm trong phạm vi spec này.

---

## 6. Open questions

- Mặc định UI sẽ hiển thị một dòng thông báo lỗi chung nếu API reset báo lỗi (VD: token hết hạn sau 5 phút), hay có cần bắt đúng mã lỗi cụ thể để hiện popup/text "Link hết hạn, vui lòng yêu cầu lại" không?
