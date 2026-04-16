# Đặc tả Giao diện: Admin Add Product (Premium UI)

Tài liệu này mô tả chi tiết các yêu cầu về giao diện và trải nghiệm người dùng (UI/UX) cho trang **Thêm Sản phẩm** (Add Product), dựa trên phong cách thiết kế cao cấp, hiện đại và sạch sẽ.

## 1. Tổng quan thiết kế

Phong cách thiết kế hướng tới sự chuyên nghiệp với khoảng cách (spacing) rộng rãi, font chữ hiện đại (**Outfit**), và các hiệu ứng hình ảnh tinh tế (shadow nhẹ, border mềm).

- **Font chữ:** Outfit (Sử dụng cho toàn bộ nội dung).
- **Hệ màu chủ đạo:**
  - Nền trang (Background): `#F8FAFC` (Slate 50) hoặc tương đương trong hệ Dark Mode.
  - Card & Container: `#FFFFFF` (White).
  - Màu thương hiệu (Brand): `#465FFF` (Blue) cho các trạng thái Focus/Active.
- **Shadow:** Sử dụng `shadow-theme-xs` (rất nhẹ) để tạo chiều sâu nhưng không gây rối mắt.

---

## 2. Header & Breadcrumbs

Phần đầu trang được thiết kế gọn gàng, tách biệt rõ ràng với nội dung form.

- **Tiêu đề trang (Page Title):** Nằm bên trái, cỡ chữ `1.25rem` (text-xl), font-bold, màu `#1E293B` (Slate 800).
- **Breadcrumbs:** Nằm bên phải (đối xứng với tiêu đề), cấu trúc `Home > Add Product`.
  - Màu chữ: `#64748B` (Slate 500).
  - Mục cuối cùng: `#1E293B` (Slate 800) hoặc màu Brand.

---

## 3. Cấu trúc Section Card (Khối nội dung)

Mỗi nhóm dữ liệu sẽ được bao bọc trong một Card riêng biệt.

- **Viền Bo góc (Border Radius):** `1rem` (rounded-2xl).
- **Đường viền (Border):** `1px solid #E2E8F0` (Slate 200).
- **Header của Card:**
  - Chứa tiêu đề nhóm (ví dụ: _Products Description_).
  - Font-bold, text-base, màu `#1E293B`.
  - Có đường kẻ ngang (`border-b`) phân cách với phần thân card.
- **Nội dung bên trong (Body):** Padding tối thiểu `1.5rem` (p-6) để đảm bảo không khí cho các trường nhập liệu.

---

## 4. Bố cục Form (Grid Layout)

Áp dụng hệ thống lưới linh hoạt để tối ưu không gian hiển thị.

### Section: Products Description

| Row   | Field 1 (Width)    | Field 2 (Width)   | Field 3 (Width)  |
| :---- | :----------------- | :---------------- | :--------------- |
| **1** | Product Name (1/2) | Category (1/2)    | -                |
| **2** | Brand (1/2)        | Color (1/2)       | -                |
| **3** | Weight (kg) (1/3)  | Length (cm) (1/3) | Width (cm) (1/3) |
| **4** | Description (1/1)  | -                 | -                |

### Section: Pricing & Availability

Tương tự cấu trúc trên, chia các trường giá và số lượng theo tỉ lệ cân đối.

---

## 5. Các thành phần Input & Controls

Nâng cấp trải nghiệm nhập liệu:

- **Input/Select Box:**
  - Nền: White.
  - Border: `#E2E8F0` (Slate 200).
  - Khi Focus: Border đổi sang màu Brand (`#465FFF`) và có hiệu ứng ring nhẹ.
  - Placeholder: Màu xám nhạt (`#94A3B8`), font-light.
  - Chiều cao: Tối thiểu `2.75rem` (h-11).
- **Label:**
  - Font-medium, text-sm, màu `#475569` (Slate 600).
  - Nằm ngay phía trên Input.

---

## 6. Chế độ Dark Mode

Đảm bảo tính thẩm mỹ khi chuyển sang giao diện tối:

- **Nền trang:** Deep Slate (`#0F172A`).
- **Nền Card:** Dark Blue-Grey (`#1E293B`) kết hợp viền mờ (`border-slate-800`).
- **Màu chữ:** White (`#FFFFFF`) cho tiêu đề và Light Gray (`#94A3B8`) cho nội dung phụ.

---

## 7. Ghi chú triển khai

- Sử dụng các class tiện ích của Tailwind CSS để đảm bảo tốc độ tải trang.
- Đảm bảo tính responsive: Trên Mobile, tất cả Grid sẽ chuyển về 1 cột (stack).
- Giữ nguyên toàn bộ logic validation và data handling từ hệ thống cũ.
