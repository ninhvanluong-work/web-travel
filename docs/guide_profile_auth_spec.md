# Specification: Guide Profile Page Authentication

## Mục tiêu

Tích hợp yêu cầu đăng nhập trên trang `GuideProfilePage` (đường dẫn `src/modules/GuideProfilePage`) với các tính năng sau:

1. **Review Tour Guide (Nút Rate me):** Yêu cầu người dùng phải đăng nhập trước khi đánh giá.
2. **Quản lý Moments (Thêm/Sửa/Xóa):** Yêu cầu người dùng phải đăng nhập và sở hữu tài khoản có role `tour-guide` (hoặc `tour_guide`).

## 1. Yêu cầu đăng nhập khi Review (Rate me)

**Component:** `src/modules/GuideProfilePage/components/action-bar.tsx`

### Logic đề xuất:

- Import `useUserStore` từ `@/stores/UserStore` và `useRouter` từ `next/router`.
- Import hằng số `ROUTES` từ `@/types/routes` (nếu có) hoặc dùng trực tiếp url `/sign-in`.
- Thay đổi sự kiện `onClick` của nút "Rate me":
  - Nếu `user` không tồn tại (chưa đăng nhập):
    - Dùng `router.push('/sign-in')` (kèm theo query `callbackUrl` là trang hiện tại để quay lại sau khi đăng nhập thành công).
  - Nếu `user` tồn tại (đã đăng nhập): Gọi `setRatingOpen(true)` để mở Rating Sheet.

## 2. Yêu cầu Role `tour_guide` khi Quản lý Moments

**Component chính:**

- `src/modules/GuideProfilePage/index.tsx`
- `src/modules/GuideProfilePage/components/moments-grid.tsx`

### Logic đề xuất:

- **Cập nhật điều kiện quyền hạn trong `index.tsx`:**
  - Đảm bảo tài khoản thực hiện thao tác quản lý phải chuẩn xác là role `tour_guide` (như trong CSDL hiện tại).
  - Code cập nhật: `const isOwner = user?.role === 'tour_guide' && !!id && user?.tourGuideId === id;`
- **Validation khi mở Modal (tùy chọn):**
  - Trước khi gọi `setManageMomentsOpen(true)`, hiển thị thông báo (`useAlertStore`) nếu user không có quyền.
- **Validation API và Xử lý Lỗi 401 (Token hết hạn/sai):**
  - **Truyền Token khi gọi API:** Đối với các API yêu cầu đăng nhập (ví dụ: `POST /review/tour-guide/{tourGuideId}`, các API liên quan đến Moment), **bắt buộc** phải truyền token vào header (vd: `Authorization: Bearer <token>`). Nếu sử dụng instance `axios` của hệ thống (`src/api/axios.ts`), header này có thể đã được tự động gắn (cần kiểm tra để đảm bảo).
  - Khi gọi các API này, nếu token sai, thiếu hoặc hết hạn, API sẽ trả về cấu trúc lỗi:
    ```json
    {
      "statusCode": 401,
      "message": "Token is missing", // Hoặc thông báo lỗi token khác
      "timestamp": "...",
      "path": "..."
    }
    ```
  - Cần sử dụng interceptor của thư viện gọi API (như Axios) hoặc bắt lỗi trực tiếp tại hàm mutate (`onError` trong react-query).
  - Kiểm tra điều kiện: `if (error.response?.data?.statusCode === 401) { ... }`.
  - Nếu gặp lỗi này:
    - Hiển thị thông báo (toast/alert) yêu cầu người dùng đăng nhập lại do phiên đăng nhập hết hạn.
    - Điều hướng người dùng về trang `/sign-in` (có thể clear user store).

## Câu hỏi mở

_(Đã được giải quyết: Sử dụng redirect `/sign-in` và role `tour_guide` theo như code hiện tại)_

## Các bước kiểm thử (Verification)

1. **Khách (Chưa đăng nhập):**
   - Không thấy nút "Edit Profile" hay biểu tượng cái bút (Manage moments).
   - Nhấn vào "Rate me" -> Sẽ bị chặn lại và điều hướng tới trang `/sign-in`.
2. **User (Đã đăng nhập - Role thông thường):**
   - Không thấy nút quản lý, nhấn "Rate me" thành công.
3. **Tour Guide (Sở hữu profile):**
   - Thấy và ấn được vào các nút Quản lý.
   - Thao tác thêm, sửa, xóa moment thành công.
