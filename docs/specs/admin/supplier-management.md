---
title: 'Quản lý Nhà cung cấp (Admin Supplier Management Spec)'
created: '2026-08-09'
status: 'draft'
domain: 'admin'
---

# Spec: Quản lý Nhà cung cấp (Admin Supplier Management)

## 1. Vấn đề & Mục tiêu (Problem & Goal)

### 1.1. Hiện trạng & Vấn đề

Hệ thống Web Travel cần một phân hệ quản lý thông tin các Nhà cung cấp (Supplier) - những đối tác chiến lược cung cấp các Tour du lịch và dịch vụ lữ hành (như VietTravel, Saigontourist, ...).
Hiện tại, phía Admin chưa có giao diện trực quan để:

1. Xem danh sách nhà cung cấp, tìm kiếm theo từ khóa và phân trang.
2. Thêm mới nhà cung cấp dịch vụ kèm theo logo/avatar, tên thương hiệu, thông tin liên hệ.
3. Chỉnh sửa thông tin nhà cung cấp hiện có.
4. Xóa nhà cung cấp không còn hợp tác.
5. Theo dõi các chỉ số uy tín (Điểm đánh giá `ratingRate`, số lượt đánh giá `ratingCount`, số năm kinh nghiệm `expYears`, số tour đang cung cấp `tourOffered`, và trạng thái xác thực `isVerified`).

### 1.2. Mục tiêu (Goals)

- Xây dựng giao diện Quản lý Supplier chuyên nghiệp, hiện đại, chuẩn thiết kế **BMAD WOW UX** trong hệ thống Admin.
- Tối ưu hóa trải nghiệm thao tác của Admin thông qua **Slide-over Drawer Form** (không cần load lại trang), **Dual View Mode** (Bảng / Thẻ), và **Image Drag & Drop Upload** lên CDN.
- Chuẩn hóa tầng kết nối API Backend (`/supplier`) với đầy đủ các phương thức `GET`, `POST`, `PUT`, `DELETE`.

---

## 2. Đặc tả Giao diện & Trải nghiệm Người dùng (UI/UX Specification)

### 2.1. Thanh Thống kê KPI (Header KPI Metric Cards)

Hiển thị 4 thẻ thông số ở đầu trang:

1. **Tổng nhà cung cấp (Total Suppliers):** Tổng số đối tác trong hệ thống.
2. **Đối tác đã xác thực (Verified Suppliers):** Số đối tác có huy hiệu `isVerified = true`.
3. **Đánh giá trung bình (Avg Rating Rate):** Điểm đánh giá trung bình toàn hệ thống đối tác.
4. **Tổng Tour cung cấp (Total Tours Offered):** Số lượng tour đang được cung cấp bởi các đối tác.

### 2.2. Thanh Công cụ Tìm kiếm & Bộ lọc (Search & Action Toolbar)

- **Ô tìm kiếm (Search Input):** Nhập từ khóa (`keyword`) tìm theo tên nhà cung cấp hoặc thông tin liên hệ. Sử dụng **Debounce (300ms)** và tự động đồng bộ tham số lên URL (`?keyword=...`).
- **Nút chuyển đổi chế độ xem (View Toggle):** Chuyển đổi giữa chế độ **Bảng (Table View)** và **Thẻ (Grid Card View)**.
- **Nút Thêm nhà cung cấp ([+ Thêm Supplier]):** Nút màu chủ đạo (Primary Button) mở Slide-over Drawer tạo mới.

### 2.3. Chế độ Xem Bảng (Table View) & Thẻ (Grid View)

- **Bảng Dữ liệu (Table View):**
  - Cột Avatar + Tên Supplier (kèm badge tích xanh `isVerified` nếu `true`).
  - Cột Liên hệ (Email / Hotline).
  - Cột Đánh giá (`ratingRate` ⭐ kèm số lượt `ratingCount`).
  - Cột Kinh nghiệm (`expYears` năm).
  - Cột Số Tour (`tourOffered` tour).
  - Cột Thao tác: Nút **Sửa** (Pencil icon) và **Xóa** (Trash icon).
- **Thẻ Bài (Grid Card View):**
  - Card layout với thiết kế Glassmorphism, hiển thị logo lớn, tên thương hiệu, thông tin liên hệ, rating star, và nút hành động nhanh.

### 2.4. Slide-over Form Drawer (Thêm / Chỉnh sửa Supplier)

- Mở từ bên phải màn hình khi Admin click nút "+ Thêm Supplier" hoặc click nút "Sửa" trên 1 dòng dữ liệu.
- **Các trường dữ liệu trong Form:**
  1. **Logo / Avatar:** Bộ Upload ảnh kéo thả (Dropzone) tích hợp API `/upload/img`. Hiển thị preview ảnh vuông tròn mượt mà.
  2. **Tên Nhà cung cấp (Name):** Ô nhập bắt buộc (Required, min 2 ký tự).
  3. **Thông tin Liên hệ (Contact):** Ô nhập Email hoặc Số điện thoại hotline liên hệ.
  4. **Kinh nghiệm (Exp Years):** Ô nhập số năm kinh nghiệm.
  5. **Trạng thái Xác thực (Is Verified):** Công tắc Toggle bật/tắt huy hiệu xác thực.
- **Nút Hành động:** "Hủy" (Đóng Drawer) và "Lưu thay đổi" / "Tạo nhà cung cấp" (Loading Spinner khi gửi API).

### 2.5. Dialog Xác nhận Xóa (Delete Guard Modal)

- Khi click biểu tượng Trash, hiển thị Modal xác nhận xóa màu đỏ.
- Yêu cầu Admin xác nhận hành động xóa nhằm tránh thao tác nhầm lẫn.

---

## 3. Kiến trúc Kỹ thuật & API Integration

### 3.1. API Endpoints Mapping

- **`GET /supplier`**: `useSupplierList({ page, pageSize, keyword })`
- **`GET /supplier/{id}`**: `useSupplierById({ id })`
- **`POST /supplier`**: `useCreateSupplier()` -> Payload `{ name, contact, avatar }`
- **`PUT /supplier/{id}`**: `useUpdateSupplier()` -> Payload `{ name, contact, avatar }`
- **`DELETE /supplier/{id}`**: `useDeleteSupplier()` -> Response `{ data: null, code: 200, message: "deleted supplier successfully", error: null }`

### 3.2. Cấu trúc File triển khai trong Codebase

```
src/
├── api/supplier/
│   ├── index.ts
│   ├── types.ts          # Type definition cho Supplier API
│   ├── requests.ts       # Axios requests
│   └── queries.ts        # React Query hooks (react-query-kit)
├── pages/admin/suppliers/
│   └── index.tsx         # Next.js Page Route /admin/suppliers
├── modules/AdminSupplier/
│   ├── SupplierListPage.tsx
│   ├── components/
│   │   ├── SupplierKpiCards.tsx
│   │   ├── SupplierToolbar.tsx
│   │   ├── SupplierTable.tsx
│   │   ├── SupplierGrid.tsx
│   │   ├── SupplierDrawerForm.tsx
│   │   └── SupplierDeleteModal.tsx
│   └── hooks/
│       └── use-supplier-list-state.ts
└── types/routes.ts       # Bổ sung ROUTE.ADMIN_SUPPLIERS = '/admin/suppliers'
```

---

## 4. Kế hoạch Kiểm thử & Xác minh (Verification Plan)

1. **Kiểm thử Luồng dữ liệu (Data Flow):**
   - Tải danh sách Supplier thành công với phân trang chuẩn.
   - Tìm kiếm từ khóa trả về kết quả khớp và cập nhật URL query.
2. **Kiểm thử Thao tác CRUD (Create - Read - Update - Delete):**
   - Upload ảnh thành công lên CDN và điền URL vào form.
   - Tạo mới Supplier thành công, Toast thông báo và tự động refetch danh sách.
   - Cập nhật thông tin Supplier thành công.
   - Xóa Supplier thành công và cập nhật UI.
3. **Kiểm thử Giao diện & Fallback (UI Polish):**
   - Kiểm tra hiển thị Avatar Fallback khi không có URL ảnh.
   - Test phím tắt Esc / backdrop click để đóng Form Drawer.
