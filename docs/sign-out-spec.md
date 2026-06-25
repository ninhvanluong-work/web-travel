# Đặc tả tính năng Đăng xuất (Sign Out) & Đổi tài khoản

Tài liệu này mô tả chi tiết chiến lược, UI/UX và luồng xử lý kỹ thuật cho tính năng Đăng xuất. Việc lập kế hoạch này tuân theo phương pháp **\_bmad** (đề cao các nguyên lý YAGNI, KISS, DRY và tư duy ngược - Inversion Thinking).

---

## 1. Mục tiêu (Goal)

- Cho phép người dùng (User / Tour Guide) đăng xuất khỏi phiên làm việc hiện tại một cách an toàn.
- Đưa ứng dụng về trạng thái nguyên thủy (không chứa dữ liệu nhạy cảm ở local).
- Hỗ trợ việc đổi tài khoản nhanh chóng, tạo trải nghiệm mượt mà không cần refresh lại trang.

---

## 2. Phân tích Kỹ thuật & Luồng xử lý (Technical Strategy)

Theo nguyên lý Inversion (Nghĩ ngược lại từ kết quả), để đăng xuất thành công và đổi tài khoản, chúng ta cần loại bỏ toàn bộ định danh của người dùng khỏi trình duyệt và thông báo cho Backend.

### 2.1. Tương tác với Backend

- **API Endpoint:** `POST /authentication/log-out`
- **Hành động:**
  1. Gửi request đăng xuất lên server (sử dụng hàm `logoutRequest` trong `src/api/auth/requests.ts`).
  2. Việc gọi API này có thể nhằm mục đích vô hiệu hóa (revoke) `refreshToken` hoặc ghi nhận hành vi đăng xuất trên hệ thống.
     _(Lưu ý: Kể cả khi API lỗi, quá trình đăng xuất ở client vẫn phải được tiếp tục để tránh kẹt trạng thái)._

### 2.2. Xử lý Client State (Zustand & Cache)

- **Zustand Store (`useUserStore`):**
  - Gọi hàm `useUserStore.getState().logout()` để xóa `accessToken`, `refreshToken` và `user` profile khỏi bộ nhớ và `localStorage`.
- **Query Cache (React Query/SWR):**
  - Thực hiện clear toàn bộ cache liên quan đến user (ví dụ: giỏ hàng, thông tin cá nhân, danh sách tour) để tránh việc rò rỉ dữ liệu khi người dùng khác đăng nhập vào cùng một máy (Account Switching).

### 2.3. Điều hướng (Routing)

- Sau khi xóa sạch state, ứng dụng sẽ tự động điều hướng (Redirect) người dùng về trang Đăng nhập (`ROUTE.SIGN_IN`).

---

## 3. Yêu cầu Giao diện (UI) & Trải nghiệm (UX)

Để đảm bảo tính nguyên tắc DRY (Don't Repeat Yourself), UI đăng xuất sẽ được tích hợp vào một Dropdown dùng chung cho Header.

### 3.1. User Menu Component

- Xây dựng component `<UserMenu />` (tại `src/components/layouts/MainLayout/UserMenu.tsx`).
- Sử dụng component `DropdownMenu` và `Avatar` từ thư viện UI hiện tại (`src/components/ui/dropdown-menu.tsx`, `src/components/ui/avatar.tsx`).
- **Trạng thái hiển thị:**
  - **Chưa đăng nhập:** Hiển thị 2 nút `Đăng nhập` và `Đăng ký`.
  - **Đã đăng nhập:** Hiển thị `Avatar` của người dùng.
- **Tương tác (Micro-interactions):**
  - Click vào Avatar -> Mở Dropdown Menu.
  - Dropdown Menu bao gồm:
    - Phần Header nhỏ hiển thị Email/Tên (Xác nhận tài khoản đang dùng).
    - Các mục điều hướng cá nhân (Profile, Settings...).
    - Dấu gạch ngang phân cách (`Separator`).
    - Nút **"Đăng xuất"** (Có thể dùng màu đỏ/destructive để báo hiệu hành động kết thúc phiên).

### 3.2. Cập nhật Layout Chính (Navbar & Sidebar)

- **Desktop (`Navbar.tsx`):** Render `<UserMenu />` ở góc phải.
- **Mobile (`Sidebar.tsx`):** Thêm nút "Đăng xuất" ở cuối danh sách menu trên giao diện Drawer/Sheet.

---

## 4. Các câu hỏi mở (Open Questions)

_Cần làm rõ trước khi implement để tránh code thừa (YAGNI):_

1. Backend có thực sự yêu cầu gửi request `POST /authentication/log-out` hay không? Hay chỉ cần xóa token ở Client là đủ?
2. Có cần hiển thị Modal (Alert Dialog) xác nhận "Bạn có chắc chắn muốn đăng xuất?" hay sẽ cho đăng xuất ngay khi bấm nút?
3. Trong Dropdown Menu, chúng ta cần hiển thị những link nào khác ngoài nút "Đăng xuất" (VD: "Quản lý Profile")?

---

## 5. Các bước triển khai (Implementation Steps)

1. **Bước 1:** Cập nhật hook `useAuth` để lấy đúng trạng thái `isLoggedIn` từ `useUserStore`.
2. **Bước 2:** Xây dựng component `<UserMenu />` kết hợp logic Logout.
3. **Bước 3:** Tích hợp `<UserMenu />` vào `Navbar.tsx` và `Sidebar.tsx`.
4. **Bước 4:** Bổ sung việc dọn dẹp (clear cache) query nếu có sử dụng React Query.
