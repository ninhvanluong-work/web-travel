# Đặc tả Kỹ thuật: Redesign Giao diện Admin Product Form

## 1. Tổng quan

- **Mục tiêu:** Áp dụng phong cách UI hiện đại từ template `free-nextjs-admin-dashboard-main` (TailAdmin) cho trang `ProductFormPage` của `web-travel`.
- **Nguyên tắc cốt lõi:** **Tuyệt đối không sửa trường dữ liệu (fields)**. Tất cả các nội dung trường nhập (Tên, Thư mục, Option, Itinerary...) phải được duy trì hoàn toàn chức năng như cũ. Chỉ cập nhật class CSS bao ngoài (wrapper/container).

## 2. Cập nhật vào Cấu hình Toàn cục

Để đạt được độ chi tiết và đồng bộ như bản gốc của TailAdmin, project sẽ áp dụng các Config sau:

### 2.1. Cấu hình Tailwind (Tailwind Config)

Bổ sung các thiết lập giao diện gốc vào `tailwind.config.ts`:

- **Brand Colors:** Thêm mã màu `brand` (từ 25 đến 950) bao gồm màu xanh chủ đạo (`#465fff` ở shade 500).
- **Custom Shadows:** Nhập các thuộc tính shadow nhẹ nhưng mềm mại của TailAdmin: `theme-xs`, `theme-sm`, `theme-md`, `theme-lg`, `theme-xl`.

### 2.2. Hỗ trợ hệ thống Light/Dark Mode

- Tất cả các CSS components áp dụng sẽ được chèn kèm thuộc tính Dark mode (ví dụ: `bg-white dark:bg-gray-900`, `text-gray-800 dark:text-white/90`, `border-gray-200 dark:border-gray-800`).

### 2.3. Font chữ Toàn cục

- Thay thế font `Poppins` hiện tại bằng font **`Outfit`** (Cấu hình qua module `next/font/google` trong thư mục `src/assets/fonts.ts`).
- Font này được áp dụng cho toàn bộ dự án (`--font-sans`).

## 3. Cập nhật Layout & Component UI (Chỉ giao diện)

Trong khi danh sách các trường nhập được giữ nguyên, kết cấu lớp bao (wrapper) sẽ cần thay đổi theo screenshot được cung cấp:

### 3.1. Các phần tử Form Element cơ sở (Inputs, Textareas)

- Nâng cấp `input.tsx` và `textarea.tsx` trong `@/components/ui/` để đồng bộ form theo style mới:
  - Cập nhật border radius: `rounded-lg`.
  - Hiệu ứng Focus: Thay đổi outline khi focus sử dụng `focus-visible:ring-brand-500/10` và nét viền `focus-visible:border-brand-300`.
  - Mặc định field sẽ có style Dark/Light Mode như: `dark:bg-gray-900 dark:border-gray-700 dark:text-white/90`.

### 3.2. Container chính (`ProductFormPage/index.tsx`)

- **Background màu nền:** `bg-gray-50 dark:bg-gray-900`.
- **Top Header:** Cập nhật padding dày dặn hơn, sử dụng `shadow-theme-sm` và màu nền tĩnh `bg-white/90 dark:bg-gray-900/90`.
- **Menu điều hướng bám theo (Sticky ScrollSpy Sidebar):** Đổi màu active (trạng thái trỏ chuột/đang xem) về màu `brand-50` kết hợp text `brand-600` với nền bo góc mượt mà `rounded-lg`.

### 3.3. Section Containers (Form Panel)

Những vùng lớn bao quát form dữ liệu (`Tổng quan`, `Chi tiết`, `Hình ảnh` v.v...) bao gồm cả các Sidebar Cards (Ví dụ: `VideoCard`, `PricingCard`) sẽ đổi kiểu Container:

- Xóa class cũ: `bg-white rounded-2xl shadow-sm ring-1 ring-black/5 p-6`
- **Class mới áp dụng (TailAdmin Layout):**
  ```tsx
  <div className="overflow-hidden bg-white rounded-2xl border border-gray-200 shadow-theme-xs dark:border-gray-800 dark:bg-white/[0.03]">
    {/* Header bọc viền dưới riêng phần tiêu đề */}
    <div className="border-b border-gray-200 dark:border-gray-800 px-5 py-4">{/* Label Title */}</div>
    {/* Vùng body render Form Fields */}
    <div className="p-5">{children}</div>
  </div>
  ```

## 4. Checklist thực thi (Các bước tiếp theo bắt đầu code)

1. Thêm mảng biến `colors.brand` và `boxShadow` Tailadmin vào `tailwind.config.ts`.
2. Thay font trong file `src/assets/fonts.ts` từ `Poppins` thành `Outfit`.
3. Thay UI gốc trong `input.tsx` cùng với `textarea.tsx` (tại `@/components/ui/`).
4. Update class Tailwind đối với Layout của `src/modules/AdminProduct/ProductFormPage/index.tsx` và phần Sidebar/Section Cards.
5. Kiểm duyệt việc không làm phá vỡ logic field và không bị lỗi compile hệ thống form `react-hook-form`.
