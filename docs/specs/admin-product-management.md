# Spec: Admin – Quản lý Sản phẩm (Product Management)

**Phiên bản:** 1.1  
**Ngày:** 2026-03-30  
**Scope:** Màn hình danh sách sản phẩm + màn hình tạo/chỉnh sửa sản phẩm (Admin, không yêu cầu auth lúc này)

> **Cập nhật v1.1:** Bổ sung ERD đầy đủ — fix status enum (`hidden` thay `archived`), thêm các bảng con `Option`, `Itinerary`, các bảng liên quan `Review`, `Video`, `Booking`.

---

## 1. Mục tiêu

Xây dựng 2 màn hình quản lý sản phẩm trong khu vực Admin:

| Màn hình           | Route                       | Mô tả                                                              |
| ------------------ | --------------------------- | ------------------------------------------------------------------ |
| Danh sách sản phẩm | `/admin/products`           | Hiển thị bảng tất cả sản phẩm, có nút Thêm mới + hành động Sửa/Xóa |
| Tạo sản phẩm       | `/admin/products/create`    | Form nhập liệu tạo sản phẩm mới                                    |
| Sửa sản phẩm       | `/admin/products/[id]/edit` | Form điền sẵn dữ liệu, cho phép chỉnh sửa                          |

**Không yêu cầu Auth** ở giai đoạn này — quyền truy cập mở, sẽ bổ sung bảo vệ route sau.

---

## 2. Data Model (ERD Full)

### 2.1. Sơ đồ quan hệ (tóm tắt từ ERD)

```
Product (1) ──── (N) Option          [Các gói giá: adult/child/infant]
Product (1) ──── (N) Itinerary       [Lịch trình từng ngày]
Product (1) ──── (N) Video           [Video liên quan sản phẩm]
Product (1) ──── (N) Review          [Đánh giá của user]
Product (1) ──── (N) Booking         [Đặt tour]
Product (N) ──── (1) Destination     [Điểm đến]
Product (N) ──── (1) Supplier        [Nhà cung cấp]
Option  (1) ──── (N) Element         [Chi tiết tuỳ chọn trong option]
Booking (N) ──── (1) User
Review  (N) ──── (1) User
```

### 2.2. Bảng Product (entity chính)

| Field             | Type            | Ghi chú                              |
| ----------------- | --------------- | ------------------------------------ |
| `id`              | UUID PK         | Auto                                 |
| `name`            | varchar(500)    | Bắt buộc                             |
| `description`     | text            | nullable                             |
| `slug`            | varchar UNIQUE  | ⭐ Tự sinh từ name                   |
| `thumbnail`       | varchar         | ⭐ URL ảnh đại diện                  |
| `code`            | varchar(255)    | nullable                             |
| `images`          | json (string[]) | Mảng URL ảnh                         |
| `itinerary_image` | varchar         | nullable                             |
| `duration`        | integer         | default 1                            |
| `duration_type`   | varchar         | 'day' / 'night' / 'hour'             |
| `highlight`       | text            | nullable                             |
| `include`         | text            | nullable                             |
| `exclude`         | text            | nullable                             |
| `status`          | enum            | **`draft` / `published` / `hidden`** |
| `min_price`       | numeric(12,2)   | Giá thấp nhất tổng hợp               |
| `destination_id`  | UUID FK         | → Destination                        |
| `supplier_id`     | UUID FK         | → Supplier                           |
| `review_point`    | double          | Điểm TB tự tổng hợp                  |

> ⚠️ **Status enum là `draft | published | hidden`** — KHÔNG phải `archived`.

### 2.3. Bảng Option (gói giá)

| Field          | Type    | Ghi chú                        |
| -------------- | ------- | ------------------------------ |
| `id`           | UUID PK |                                |
| `title`        | varchar | Tên gói (VD: "Gói tiêu chuẩn") |
| `description`  | text    |                                |
| `adult_price`  | numeric | Giá người lớn                  |
| `child_price`  | numeric | Giá trẻ em                     |
| `infant_price` | numeric | Giá em bé                      |
| `currency`     | varchar | VD: "VND", "USD"               |
| `order`        | integer | Thứ tự hiển thị                |
| `product_id`   | UUID FK | → Product                      |

### 2.4. Bảng Itinerary (lịch trình)

| Field           | Type    | Ghi chú                             |
| --------------- | ------- | ----------------------------------- |
| `id`            | UUID PK |                                     |
| `name`          | varchar | Tiêu đề ngày (VD: "Ngày 1: Hà Nội") |
| `featured_name` | varchar | Tên rút gọn (VD: "day1")            |
| `order`         | integer | Thứ tự ngày                         |
| `description`   | text    | Nội dung hoạt động trong ngày       |
| `product_id`    | UUID FK | → Product                           |

### 2.5. Các bảng liên quan (tham khảo, không edit trong form này)

| Bảng          | Quan hệ              | Ghi chú                             |
| ------------- | -------------------- | ----------------------------------- |
| `Destination` | N→1 từ Product       | Chỉ cần Select dropdown             |
| `Supplier`    | N→1 từ Product       | Chỉ cần Select dropdown             |
| `Video`       | 1→N từ Product       | Quản lý ở module khác               |
| `Review`      | 1→N từ Product       | Readonly, không tạo từ admin form   |
| `Booking`     | 1→N từ Product       | Quản lý ở module Booking riêng      |
| `Element`     | N→1 từ Option        | Chi tiết option, quản lý kèm Option |
| `User`        | FK từ Booking/Review | Quản lý ở module User               |

### 2.6. Zod Schema

```ts
// src/lib/validations/product.ts

import { z } from 'zod';

// ⚠️ Enum đúng theo DB: draft | published | hidden
export const PRODUCT_STATUS = {
  draft: 'draft',
  published: 'published',
  hidden: 'hidden',
} as const;

export const DURATION_TYPES = [
  { label: 'Ngày', value: 'day' },
  { label: 'Đêm', value: 'night' },
  { label: 'Giờ', value: 'hour' },
];

export const STATUS_OPTIONS = [
  { label: 'Bản nháp', value: 'draft' },
  { label: 'Công khai', value: 'published' },
  { label: 'Ẩn', value: 'hidden' },
];

// ── Product ──────────────────────────────────────────────
export const productSchema = z.object({
  name: z.string().min(1, 'Tên sản phẩm không được để trống').max(500),
  slug: z.string().min(1, 'Đường dẫn không được để trống'),
  code: z.string().max(255).optional().nullable(),
  description: z.string().optional().nullable(),
  destination_id: z.string().uuid('Điểm đến không hợp lệ').optional().nullable(),
  supplier_id: z.string().uuid('Nhà cung cấp không hợp lệ').optional().nullable(),
  duration: z.coerce.number().int().min(1, 'Thời lượng phải ≥ 1').default(1),
  duration_type: z.string().default('day'),
  highlight: z.string().optional().nullable(),
  include: z.string().optional().nullable(),
  exclude: z.string().optional().nullable(),
  min_price: z.coerce.number().min(0, 'Giá không được âm').default(0),
  review_point: z.coerce.number().min(0).max(5).default(0),
  status: z.enum(['draft', 'published', 'hidden']).default('draft'),
  thumbnail: z.string().optional().nullable(),
  itinerary_image: z.string().optional().nullable(),
  images: z.array(z.string()).optional().nullable(),
});

// ── Option (gói giá – child entity) ─────────────────────
export const optionSchema = z.object({
  id: z.string().uuid().optional(), // optional khi tạo mới
  title: z.string().min(1, 'Tên gói không được để trống'),
  description: z.string().optional().nullable(),
  adult_price: z.coerce.number().min(0).default(0),
  child_price: z.coerce.number().min(0).default(0),
  infant_price: z.coerce.number().min(0).default(0),
  currency: z.string().default('VND'),
  order: z.coerce.number().int().min(0).default(0),
});

// ── Itinerary (lịch trình – child entity) ───────────────
export const itinerarySchema = z.object({
  id: z.string().uuid().optional(),
  name: z.string().min(1, 'Tiêu đề ngày không được để trống'),
  featured_name: z.string().optional().nullable(),
  order: z.coerce.number().int().min(1).default(1),
  description: z.string().optional().nullable(),
});

export type ProductFormValues = z.infer<typeof productSchema>;
export type OptionFormValues = z.infer<typeof optionSchema>;
export type ItineraryFormValues = z.infer<typeof itinerarySchema>;
```

---

## 3. Admin Sidebar Navigation

Dựa vào mockup, admin có sidebar dọc bên trái với các mục:

```
┌─────────────────┐
│ 🔷 Travel Logo  │  ← Logo của dự án (không dùng Ant Design logo)
├─────────────────┤
│  Product        │  ← Active (màn hình hiện tại)
│  Supplier       │
│  Destination    │
│  Booking        │
│  ...            │
└─────────────────┘
```

### 3.1. Logo Sidebar

**Dùng logo có sẵn của dự án** — component `Logo` từ `@/components/ui/logo-dashboard`:

```tsx
import Logo from '@/components/ui/logo-dashboard';

// Trong sidebar header:
<div className="flex items-center gap-2 px-4 py-5 border-b">
  <Logo width={36} height={36} />
  <span className="font-bold text-lg">Travel Admin</span>
</div>;
```

> ⚠️ **KHÔNG dùng logo Ant Design** (thấy trong mockup thiết kế). Thay bằng `Logo` component dùng `/android-chrome-192x192.png` của dự án.

### 3.2. Menu Items

| Menu item   | Route                 | Ghi chú               |
| ----------- | --------------------- | --------------------- |
| Product     | `/admin/products`     | Quản lý tour/sản phẩm |
| Supplier    | `/admin/suppliers`    | Quản lý nhà cung cấp  |
| Destination | `/admin/destinations` | Quản lý điểm đến      |
| Booking     | `/admin/bookings`     | Quản lý đơn đặt tour  |

> Sidebar collapse được trên mobile. Active item highlight bằng màu nền đậm.

---

## 4. Màn hình 1 — Danh sách Sản phẩm (`/admin/products`)

### 4.1. Layout tổng thể (theo mockup)

```
┌─────────┬────────────────────────────────────────────────────────────────┐
│ Sidebar │  Danh sách Tour              [4 đang hoạt động] Badge          │
│         │  Quản lý tất cả các sản phẩm tour du lịch                      │
│ Product │ ┌──────────────────────────────────────────────────────────┐   │
│ Supplier│ │ FILTER BAR                                               │   │
│ Dest.   │ │ [Từ khóa tìm kiếm...] [Nhà CC ▼] [Điểm đến ▼] [Status▼] │   │
│ Booking │ │ [Từ ngày] [Đến ngày]   [Đặt lại] [🔍 Tìm kiếm]  [+Thêm]│   │
│         │ └──────────────────────────────────────────────────────────┘   │
│         │  Tổng N tour                                                    │
│         │ ┌───┬────────────┬──────────┬───────┬───────┬────────┬───────┐ │
│         │ │STT│ Tên tour   │ Nhà CC   │ Đ.đến │ T.gian│ Status │ Giá  │ │
│         │ ├───┼────────────┼──────────┼───────┼───────┼────────┼───────┤ │
│         │ │ 1 │ Tour HN    │ [V] Viet │ Hà Nội│ 3N2Đ  │Published│2.5M │ │
│         │ │ 2 │ Tour ĐN    │ [H] Hano │ Đ.Nẵng│ 3N2Đ  │ Draft  │3.2M  │ │
│         │ └───┴────────────┴──────────┴───────┴───────┴────────┴───────┘ │
│         │ ┌────────┬─────────┬──────────┬─────────────────────────┐      │
│         │ │ Đ.giá  │ N.tạo   │ Thao tác │ ← thêm vào cuối bảng   │      │
│         │ │ ★★★★(4)│2025-01-1│ ✏️ ☑️ 🗑️│                        │      │
│         │ └────────┴─────────┴──────────┴─────────────────────────┘      │
│         │  [← Trước]  [1] [2]  [Sau →]                                   │
└─────────┴────────────────────────────────────────────────────────────────┘
```

### 4.2. Header khu vực danh sách

| Element    | Nội dung                                     | Ghi chú                                       |
| ---------- | -------------------------------------------- | --------------------------------------------- |
| Tiêu đề H1 | `"Danh sách Tour"`                           | font-bold text-2xl                            |
| Mô tả phụ  | `"Quản lý tất cả các sản phẩm tour du lịch"` | text-muted-foreground                         |
| Badge đếm  | `"N đang hoạt động"`                         | `Badge` variant=`success`, đếm số `published` |

### 4.3. Filter Bar (theo mockup)

```
Hàng 1:
[ Từ khóa tìm kiếm... (flex-1) ] [ Nhà cung cấp ▼ ] [ Điểm đến ▼ ] [ Trạng thái ▼ ]

Hàng 2:
[ Từ ngày (date) ] [ Đến ngày (date) ]   [ Đặt lại ]  [ 🔍 Tìm kiếm ]   ... [ + Thêm mới ]
```

| Filter       | Component                                                   | Data source                                     |
| ------------ | ----------------------------------------------------------- | ----------------------------------------------- |
| Từ khóa      | `Input` placeholder=`"Tìm theo tên tour..."`                | `useState<string>` filter local                 |
| Nhà cung cấp | `Select` option=`["Tất cả", ...suppliers]`                  | Load từ `localStorage` key `admin_suppliers`    |
| Điểm đến     | `Select` option=`["Tất cả", ...destinations]`               | Load từ `localStorage` key `admin_destinations` |
| Trạng thái   | `Select` option=`["Tất cả", "Bản nháp", "Công khai", "Ẩn"]` | Static                                          |
| Từ ngày      | `<input type="date">` hoặc `DatePickerField`                | Filter `created_at >=`                          |
| Đến ngày     | `<input type="date">` hoặc `DatePickerField`                | Filter `created_at <=`                          |
| Đặt lại      | `Button` variant=`secondary`                                | Reset tất cả filter về mặc định                 |
| Tìm kiếm     | `Button` variant=`primary` icon=`Search`                    | Apply filter, re-render list                    |
| + Thêm mới   | `Button` variant=`primary` bg-green icon=`Plus`             | `router.push('/admin/products/create')`         |

**Filter logic (client-side vì dùng localStorage):**

```ts
const filtered = products
  .filter((p) => !keyword || p.name.toLowerCase().includes(keyword.toLowerCase()))
  .filter((p) => !supplierId || p.supplier_id === supplierId)
  .filter((p) => !destinationId || p.destination_id === destinationId)
  .filter((p) => !status || p.status === status)
  .filter((p) => !fromDate || p.created_at >= fromDate)
  .filter((p) => !toDate || p.created_at <= toDate);
```

### 4.4. Cột bảng chi tiết (theo mockup)

| Cột              | Source                       | Render chi tiết                                           |
| ---------------- | ---------------------------- | --------------------------------------------------------- |
| **STT**          | index + 1                    | Số nguyên, căn giữa                                       |
| **Tên tour**     | `name`, `destination.name`   | Tên in đậm + `Chip` tag điểm đến bên dưới (màu xanh nhạt) |
| **Nhà cung cấp** | `supplier.name`              | Avatar hình tròn + chữ cái đầu (có màu) + tên             |
| **Điểm đến**     | `destination.name`           | Text thuần                                                |
| **Thời gian**    | `duration` + `duration_type` | Ví dụ: `"3 ngày 2 đêm"` (tính: day=ngày, night=đêm)       |
| **Trạng thái**   | `status`                     | `Badge`: Published=green / Draft=yellow / Hidden=gray     |
| **Giá từ**       | `min_price`                  | `numeral().format('0,0') + 'đ'`, màu cam/đỏ               |
| **Đánh giá**     | `review_point`               | Sao ★ + số điểm `(4.5)`, dùng render sao thủ công         |
| **Ngày tạo**     | `created_at`                 | Format `dayjs(x).format('YYYY-MM-DD')`                    |
| **Thao tác**     | —                            | 3 icon button: ✏️ Sửa, ☑️ Toggle publish, 🗑️ Xóa          |

**Render Avatar Supplier:**

```tsx
// Lấy chữ cái đầu + màu ngẫu nhiên nhưng consistent theo tên
const avatarColors = ['bg-blue-500', 'bg-green-500', 'bg-orange-500', 'bg-purple-500', ...];
const colorIndex = supplier.name.charCodeAt(0) % avatarColors.length;

<div className={cn('rounded-full w-8 h-8 flex items-center justify-center text-white text-sm font-bold', avatarColors[colorIndex])}>
  {supplier.name[0].toUpperCase()}
</div>
```

**Render sao đánh giá:**

```tsx
const StarRating = ({ point }: { point: number }) => (
  <div className="flex items-center gap-1">
    {[1, 2, 3, 4, 5].map((i) => (
      <Star
        key={i}
        size={14}
        className={i <= Math.round(point) ? 'fill-yellow-400 text-yellow-400' : 'text-gray-300'}
      />
    ))}
    <span className="text-xs text-muted-foreground">({point})</span>
  </div>
);
```

**Render tag điểm đến dưới tên:**

```tsx
<div>
  <p className="font-semibold">{product.name}</p>
  {destination && (
    <span className="text-xs bg-blue-100 text-blue-700 rounded-full px-2 py-0.5">📍 {destination.name}</span>
  )}
</div>
```

### 4.5. Nút Toggle Publish nhanh (☑️)

Đây là nút mới phát hiện từ mockup — cho phép **bật/tắt Published** ngay trên list mà không cần vào trang edit.

| Trạng thái         | Hiển thị                   | Hành động khi click     |
| ------------------ | -------------------------- | ----------------------- |
| `published`        | ☑️ icon xanh (CheckSquare) | Chuyển sang `draft`     |
| `draft` / `hidden` | ☐ icon xám (Square)        | Chuyển sang `published` |

```ts
const handleTogglePublish = (product: ProductRow) => {
  const updated = products.map((p) =>
    p.id === product.id ? { ...p, status: p.status === 'published' ? 'draft' : 'published' } : p
  );
  saveProducts(updated);
  setProducts(updated);
};
```

Component:

```tsx
<Button
  variant="ghost"
  size="icon"
  onClick={() => handleTogglePublish(product)}
  title={product.status === 'published' ? 'Ẩn sản phẩm' : 'Công khai sản phẩm'}
>
  {product.status === 'published' ? (
    <CheckSquare size={16} className="text-green-600" />
  ) : (
    <Square size={16} className="text-gray-400" />
  )}
</Button>
```

### 4.6. State Management (localStorage)

```ts
export type ProductRow = ProductFormValues & {
  id: string;
  created_at: string;
  updated_at: string;
  // Denormalized cho hiển thị (join từ localStorage)
  supplier?: { id: string; name: string };
  destination?: { id: string; name: string };
};

const STORAGE_KEY = 'admin_products';
const getProducts = (): ProductRow[] => JSON.parse(localStorage.getItem(STORAGE_KEY) || '[]');
const saveProducts = (data: ProductRow[]) => localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
```

### 4.7. Phân trang

Client-side pagination đơn giản:

```ts
const PAGE_SIZE = 6; // 6 items/trang (theo mockup "1-6 / 8 tour")
const totalPages = Math.ceil(filtered.length / PAGE_SIZE);
const paged = filtered.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE);
```

UI: `[← Trước] [1] [2] [Sau →]` – render số trang động.

### 4.8. Luồng hành động

- **Thêm mới:** Click `[+ Thêm mới]` → `router.push('/admin/products/create')`.
- **Sửa:** Click ✏️ → `router.push('/admin/products/${id}/edit')`.
- **Toggle publish:** Click ☑️/☐ → đổi status tại chỗ, lưu localStorage.
- **Xóa:** Click 🗑️ → `AlertDialog` xác nhận → xóa, refresh list.

---

## 5. Màn hình 2 — Form Tạo/Sửa Sản phẩm (`/admin/products/create` | `/admin/products/[id]/edit`)

> **Cập nhật theo mockup thực tế v2:** Layout **1 cột scroll dọc** (không phải 2 cột), ảnh dùng **file upload dropzone**, highlight/include/exclude dùng **tag-chip input**, 2 nút submit chính **Lưu nháp + Đăng tour**.

### 5.1. Layout tổng thể (1 cột, theo mockup)

```
┌─────────┬────────────────────────────────────────────────────────┐
│ Sidebar │  + Tạo tour mới            [💾 Lưu nháp] [🚀 Đăng tour]│
│         │  Điền đầy đủ thông tin bên dưới                        │
│         │                                                         │
│         │  ┌─────────────────────────────────────────────────┐   │
│         │  │ 📋 Thông tin cơ bản                             │   │
│         │  │  Tên tour *  [VD: Tour Hà Nội - Hạ Long 3N2Đ]  │   │
│         │  │  Slug (URL)  [tự động tạo - readonly]           │   │
│         │  │  Mã tour *   [VD: HAN-HLG-3N2D]                 │   │
│         │  │  Mô tả tour  [textarea...]                       │   │
│         │  └─────────────────────────────────────────────────┘   │
│         │                                                         │
│         │  ┌─────────────────────────────────────────────────┐   │
│         │  │ 💰 Giá & Phân phối                              │   │
│         │  │  Nhà cung cấp * [-- Chọn supplier --  ▼]        │   │
│         │  │  Điểm đến *     [-- Chọn điểm đến -- ▼]         │   │
│         │  │  Giá từ (VNĐ) * [VD: 2500000]                   │   │
│         │  │  Trạng thái     [Draft ▼]                        │   │
│         │  └─────────────────────────────────────────────────┘   │
│         │                                                         │
│         │  ┌─────────────────────────────────────────────────┐   │
│         │  │ 📅 Thời gian & Lịch trình                       │   │
│         │  │  Số ngày [VD: 3]  Đơn vị [Ngày ▼]               │   │
│         │  │  Chi tiết lịch trình theo ngày [+ Thêm ngày]    │   │
│         │  │  ┌─────────────────────────────────────────┐    │   │
│         │  │  │ Ngày 1                                  │    │   │
│         │  │  │ Tiêu đề [...]      Hoạt động [...]       │    │   │
│         │  │  └─────────────────────────────────────────┘    │   │
│         │  └─────────────────────────────────────────────────┘   │
│         │                                                         │
│         │  ┌─────────────────────────────────────────────────┐   │
│         │  │ 🖼️ Hình ảnh                                     │   │
│         │  │  [Ảnh đại diện - dropzone PNG/JPG/WEBP]         │   │
│         │  │  [Ảnh lịch trình - dropzone]                    │   │
│         │  │  [Bộ ảnh tour (nhiều ảnh) - dropzone]           │   │
│         │  └─────────────────────────────────────────────────┘   │
│         │                                                         │
│         │  ┌─────────────────────────────────────────────────┐   │
│         │  │ 📝 Chi tiết tour                                │   │
│         │  │  ✨ Điểm nổi bật  [input...] [+ Thêm]          │   │
│         │  │     [tag] [tag] [tag]                           │   │
│         │  │  ✅ Bao gồm       [input...] [+ Thêm]          │   │
│         │  │  ❌ Không bao gồm [input...] [+ Thêm]          │   │
│         │  └─────────────────────────────────────────────────┘   │
│         │                                                         │
│         │  [Hủy]          [💾 Lưu nháp]        [🚀 Đăng tour]   │
└─────────┴────────────────────────────────────────────────────────┘
```

### 5.2. Header Form

| Element       | Nội dung                                                | Ghi chú                         |
| ------------- | ------------------------------------------------------- | ------------------------------- |
| Tiêu đề H1    | `"+ Tạo tour mới"` (create) hoặc `"Sửa: {name}"` (edit) |                                 |
| Mô tả phụ     | `"Điền đầy đủ thông tin bên dưới"`                      | text-muted-foreground           |
| Nút Lưu nháp  | `Button` variant=`secondary` icon=💾                    | Submit với `status='draft'`     |
| Nút Đăng tour | `Button` variant=`primary` (xanh đậm) icon=🚀           | Submit với `status='published'` |

**Xử lý 2 nút submit:**

```ts
// Dùng form.setValue trước khi submit để set status theo từng nút
const handleSaveDraft = () => {
  form.setValue('status', 'draft');
  form.handleSubmit(onSubmit)();
};

const handlePublish = () => {
  form.setValue('status', 'published');
  form.handleSubmit(onSubmit)();
};
```

### 5.3. Section: Thông tin cơ bản (📋)

| Field         | Label        | Component            | Validation                      | Ghi chú                                                                                  |
| ------------- | ------------ | -------------------- | ------------------------------- | ---------------------------------------------------------------------------------------- |
| `name`        | `Tên tour *` | `TextField`          | `asStringRequired()` — required | Placeholder: `"VD: Tour Hà Nội - Hạ Long 3N2Đ"`                                          |
| `slug`        | `Slug (URL)` | `TextField` disabled | auto-gen                        | **Readonly** — bg-gray-100, tự sinh từ `name`, dùng `REGEX_UNSIGNED_LETTERS` để validate |
| `code`        | `Mã tour *`  | `TextField`          | `z.string().min(1)`             | Placeholder: `"VD: HAN-HLG-3N2D"`, apply `REGEX_NO_SPECIAL_CHARACTERS`                   |
| `description` | `Mô tả tour` | `TextAreaField`      | optional                        | Placeholder: `"Mô tả tổng quan về tour..."`, rows=5                                      |

**Slug field readonly style:**

```tsx
<TextField
  control={form.control}
  name="slug"
  label="Slug (URL)"
  disabled // ← readonly, auto-gen
  className="bg-gray-100 cursor-not-allowed"
  placeholder="tu-dong-tao-tu-ten"
/>
```

**Watch name để auto-gen slug (chỉ create mode):**

```ts
const nameValue = form.watch('name');
useEffect(() => {
  if (!isEdit && nameValue) {
    form.setValue('slug', generateSlug(nameValue), { shouldValidate: true });
  }
}, [nameValue, isEdit]);
```

### 5.4. Section: Giá & Phân phối (💰)

| Field            | Label            | Component               | Validation                 | Ghi chú                              |
| ---------------- | ---------------- | ----------------------- | -------------------------- | ------------------------------------ |
| `supplier_id`    | `Nhà cung cấp *` | `SelectField`           | `z.string().uuid()`        | Placeholder: `"-- Chọn supplier --"` |
| `destination_id` | `Điểm đến *`     | `SelectField`           | `z.string().uuid()`        | Placeholder: `"-- Chọn điểm đến --"` |
| `min_price`      | `Giá từ (VNĐ) *` | `TextField` type=number | `z.coerce.number().min(0)` | Placeholder: `"VD: 2500000"`         |
| `status`         | `Trạng thái`     | `SelectField`           | `z.enum([...])`            | Default: `"Draft"`                   |

### 5.5. Section: Thời gian & Lịch trình (📅)

**Trường thời gian:**

| Field           | Label     | Component               | Ghi chú                   |
| --------------- | --------- | ----------------------- | ------------------------- |
| `duration`      | `Số ngày` | `TextField` type=number | Placeholder: `"VD: 3"`    |
| `duration_type` | `Đơn vị`  | `SelectField`           | Options: Ngày / Đêm / Giờ |

**Lịch trình inline (Itinerary[]):**

Mỗi ngày có label **"Ngày N"** và 2 field:

| Field                      | Label       | Component                        | Ghi chú                                        |
| -------------------------- | ----------- | -------------------------------- | ---------------------------------------------- |
| `itinerary[i].name`        | `Tiêu đề`   | `TextField`                      | Placeholder: `"VD: Hà Nội - Hạ Long"`          |
| `itinerary[i].description` | `Hoạt động` | `TextField` hoặc `TextAreaField` | Placeholder: `"Mô tả hoạt động trong ngày..."` |

```tsx
// useFieldArray cho itinerary
const {
  fields: itineraryFields,
  append: appendItinerary,
  remove: removeItinerary,
} = useFieldArray({
  control,
  name: 'itinerary',
});

// Nút "+ Thêm ngày"
<Button
  type="button"
  variant="secondary"
  onClick={() => appendItinerary({ name: '', description: '', order: itineraryFields.length + 1 })}
>
  + Thêm ngày
</Button>;

// Render mỗi ngày
{
  itineraryFields.map((field, i) => (
    <div key={field.id} className="border rounded-lg p-4">
      <div className="flex justify-between items-center mb-3">
        <span className="font-semibold text-blue-600">Ngày {i + 1}</span>
        <Button type="button" variant="ghost" size="icon" onClick={() => removeItinerary(i)}>
          <Trash2 size={16} />
        </Button>
      </div>
      <div className="grid grid-cols-2 gap-4">
        <TextField control={control} name={`itinerary.${i}.name`} label="Tiêu đề" />
        <TextField control={control} name={`itinerary.${i}.description`} label="Hoạt động" />
      </div>
    </div>
  ));
}
```

### 5.6. Section: Hình ảnh (🖼️) — File Upload Dropzone

> **THAY ĐỔI LỚN vs spec cũ:** Không dùng URL input. Dùng **file upload dropzone** (click để chọn hoặc kéo thả). Format chấp nhận: `PNG, JPG, WEBP`.

| Field             | Label                      | Upload Type    | Validation                                                     |
| ----------------- | -------------------------- | -------------- | -------------------------------------------------------------- |
| `thumbnail`       | `Ảnh đại diện (Thumbnail)` | Single file    | `zFileValidator(5MB, ['image/png','image/jpeg','image/webp'])` |
| `itinerary_image` | `Ảnh lịch trình`           | Single file    | `zFileValidator(5MB, ['image/png','image/jpeg','image/webp'])` |
| `images`          | `Bộ ảnh tour (nhiều ảnh)`  | Multiple files | Multiple `zFileValidator(...)`, dùng `useFieldArray`           |

**Dropzone UI pattern:**

```tsx
// Mỗi dropzone là 1 dashed-border box, click hoặc drag-drop file
<div
  className="border-2 border-dashed border-gray-300 rounded-lg p-8 flex flex-col items-center justify-center cursor-pointer hover:border-blue-400 transition-colors"
  onClick={() => fileInputRef.current?.click()}
>
  <Folder size={36} className="text-gray-400 mb-2" />
  <p className="text-sm text-gray-500">Tải ảnh thumbnail</p>
  <p className="text-xs text-gray-400">PNG, JPG, WEBP</p>
  <input
    ref={fileInputRef}
    type="file"
    accept="image/png,image/jpeg,image/webp"
    className="hidden"
    onChange={(e) => form.setValue('thumbnail', e.target.files?.[0])}
  />
</div>
```

**Validation dùng `zFileValidator` từ `@/lib/validations/validation.utility`:**

```ts
import { zFileValidator } from '@/lib/validations/validation.utility';
import { MIME_TYPE } from '@/lib/mime';

const IMAGE_SIZE = 5 * 1024 * 1024; // 5MB
const IMAGE_TYPES: MIME_TYPE[] = ['image/png', 'image/jpeg', 'image/webp'];

// Trong productSchema
thumbnail: zFileValidator(IMAGE_SIZE, IMAGE_TYPES, false), // optional
itinerary_image: zFileValidator(IMAGE_SIZE, IMAGE_TYPES, false),
```

### 5.7. Section: Chi tiết tour (📝) — Tag-Chip Input

> **THAY ĐỔI LỚN vs spec cũ:** `highlight`, `include`, `exclude` **không phải Textarea** mà là **tag-chip input** — người dùng nhập từng điểm rồi nhấn Enter hoặc click `[+ Thêm]`.

**Mỗi section (Highlight / Include / Exclude) có cùng pattern:**

```
✨ Điểm nổi bật (Highlight)
[ Nhập điểm nổi bật rồi nhấn Enter hoặc + Thêm... ]  [+ Thêm]
[tag 1 ×]  [tag 2 ×]  [tag 3 ×]

✅ Bao gồm (Include)
[ VD: Vé máy bay, Khách sạn 4 sao... ]               [+ Thêm]
[tag 1 ×]  [tag 2 ×]

❌ Không bao gồm (Exclude)
[ VD: Chi phí cá nhân, Tiền tip... ]                  [+ Thêm]
[tag 1 ×]
```

**Data model thay đổi:**

Do tag-chip, `highlight`, `include`, `exclude` lưu dưới dạng **mảng string** thay vì text thuần:

```ts
// Cập nhật productSchema
highlight: z.array(z.string()).optional().nullable(), // Mảng các điểm nổi bật
include:   z.array(z.string()).optional().nullable(), // Mảng dịch vụ bao gồm
exclude:   z.array(z.string()).optional().nullable(), // Mảng dịch vụ không bao gồm
```

**Tag input component pattern (dùng `useFieldArray`):**

```tsx
const { fields: highlights, append: addHighlight, remove: removeHighlight } = useFieldArray({
  control, name: 'highlight',
});
const [inputVal, setInputVal] = useState('');

const handleAdd = () => {
  if (inputVal.trim()) {
    addHighlight({ value: inputVal.trim() });
    setInputVal('');
  }
};

// UI
<div className="flex gap-2">
  <Input
    value={inputVal}
    onChange={(e) => setInputVal(e.target.value)}
    onKeyDown={(e) => e.key === 'Enter' && (e.preventDefault(), handleAdd())}
    placeholder="Nhập điểm nổi bật rồi nhấn Enter hoặc + Thêm..."
  />
  <Button type="button" variant="primary" onClick={handleAdd}>+ Thêm</Button>
</div>
<div className="flex flex-wrap gap-2 mt-2">
  {highlights.map((field, i) => (
    <span key={field.id} className="flex items-center gap-1 bg-blue-50 text-blue-700 rounded-full px-3 py-1 text-sm">
      {field.value}
      <button type="button" onClick={() => removeHighlight(i)} className="ml-1 text-blue-400 hover:text-blue-600">×</button>
    </span>
  ))}
</div>
```

### 5.8. Footer Form (2 nút + Hủy)

```
[Hủy]    [💾 Lưu nháp]    [🚀 Đăng tour]
```

| Nút       | Variant                         | Hành động                         |
| --------- | ------------------------------- | --------------------------------- |
| Hủy       | `secondary`                     | `router.push('/admin/products')`  |
| Lưu nháp  | `secondary` outline với icon 💾 | set `status='draft'` → submit     |
| Đăng tour | `primary` xanh đậm với icon 🚀  | set `status='published'` → submit |

### 5.9. Validation Schema cập nhật (dùng project utilities)

```ts
// src/lib/validations/product.ts
import { z } from 'zod';
import { asStringRequired, zFileValidator } from '@/lib/validations/validation.utility';
import { REGEX_NO_SPECIAL_CHARACTERS, REGEX_UNSIGNED_LETTERS } from '@/lib/regex';
import type { MIME_TYPE } from '@/lib/mime';

const IMAGE_SIZE = 5 * 1024 * 1024;
const IMAGE_TYPES: MIME_TYPE[] = ['image/png', 'image/jpeg', 'image/webp'];

export const productSchema = z.object({
  // Thông tin cơ bản
  name: asStringRequired(), // required, không được rỗng
  slug: z.string().optional(), // auto-gen readonly, không validate manual
  code: z.string().regex(REGEX_NO_SPECIAL_CHARACTERS, 'Mã tour không được chứa ký tự đặc biệt').optional().nullable(),
  description: z.string().optional().nullable(),

  // Giá & Phân phối
  supplier_id: z.string().uuid('Vui lòng chọn Nhà cung cấp').min(1, 'Bắt buộc'),
  destination_id: z.string().uuid('Vui lòng chọn Điểm đến').min(1, 'Bắt buộc'),
  min_price: z.coerce.number().min(0, 'Giá không được âm').default(0),
  status: z.enum(['draft', 'published', 'hidden']).default('draft'),

  // Thời gian
  duration: z.coerce.number().int().min(1).default(1),
  duration_type: z.string().default('day'),

  // Lịch trình (array)
  itinerary: z
    .array(
      z.object({
        name: asStringRequired(),
        description: z.string().optional().nullable(),
        order: z.coerce.number().int().min(1).default(1),
        featured_name: z.string().optional().nullable(),
      })
    )
    .optional()
    .default([]),

  // Hình ảnh (file upload)
  thumbnail: zFileValidator(IMAGE_SIZE, IMAGE_TYPES, false),
  itinerary_image: zFileValidator(IMAGE_SIZE, IMAGE_TYPES, false),
  images: z.array(zFileValidator(IMAGE_SIZE, IMAGE_TYPES, false)).optional().default([]),

  // Chi tiết (tag-chips = string arrays)
  highlight: z.array(z.string()).optional().default([]),
  include: z.array(z.string()).optional().default([]),
  exclude: z.array(z.string()).optional().default([]),

  // Readonly fields
  review_point: z.coerce.number().min(0).max(5).default(0),
});

export type ProductFormValues = z.infer<typeof productSchema>;
```

### 5.10. Submit Handler (2 modes)

```ts
const onSubmit = (data: ProductFormValues) => {
  const products = getProducts();

  if (isEdit) {
    const idx = products.findIndex((p) => p.id === productId);
    products[idx] = { ...products[idx], ...data, updated_at: new Date().toISOString() };
  } else {
    products.unshift({
      // unshift để mới nhất hiện đầu list
      ...data,
      id: crypto.randomUUID(),
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    });
  }

  saveProducts(products);
  router.push('/admin/products');
};
```

---

## 5. Cấu trúc File

```
src/
├── lib/
│   └── validations/
│       └── product.ts                    ← Zod schemas: product + option + itinerary
├── modules/
│   └── AdminProduct/
│       ├── index.ts                      ← re-export
│       ├── ProductListPage/
│       │   ├── index.tsx                 ← Màn hình danh sách
│       │   └── components/
│       │       ├── ProductTable.tsx      ← Bảng sản phẩm
│       │       ├── ProductTableRow.tsx   ← 1 row
│       │       └── DeleteConfirmDialog.tsx
│       └── ProductFormPage/
│           ├── index.tsx                 ← Màn hình tạo/sửa (tabs)
│           └── components/
│               ├── tabs/
│               │   ├── GeneralTab.tsx    ← Tab: Thông tin cơ bản + Media
│               │   ├── ContentTab.tsx    ← Tab: Nội dung (highlight, include, exclude)
│               │   ├── OptionsTab.tsx    ← Tab: Gói giá (Option[]) — CRUD inline
│               │   └── ItineraryTab.tsx  ← Tab: Lịch trình (Itinerary[]) — CRUD inline
│               ├── sidebar/
│               │   ├── ConfigCard.tsx    ← Status + Duration
│               │   ├── RelationCard.tsx  ← Destination + Supplier
│               │   └── PricingCard.tsx   ← min_price + review_point
│               └── shared/
│                   ├── OptionFormRow.tsx ← 1 row inline form cho Option
│                   └── ItineraryFormRow.tsx ← 1 row/card inline cho Itinerary
└── pages/
    └── admin/
        └── products/
            ├── index.tsx                 ← /admin/products
            ├── create.tsx                ← /admin/products/create
            └── [id]/
                └── edit.tsx              ← /admin/products/[id]/edit
```

### Lý do dùng Tabs thay vì Scroll dài

Form Product có nhiều nhóm dữ liệu phức tạp (thông tin cơ bản + gói giá nhiều dòng + lịch trình nhiều ngày). Dùng **Tabs** (`@radix-ui/react-tabs`) để tách:

| Tab                   | Nội dung                                                          |
| --------------------- | ----------------------------------------------------------------- |
| **Thông tin chung**   | name, slug, code, description, thumbnail, images, itinerary_image |
| **Nội dung chi tiết** | highlight, include, exclude                                       |
| **Gói giá (Options)** | Danh sách Option: thêm/sửa/xóa inline                             |
| **Lịch trình**        | Danh sách Itinerary: thêm/sửa/xóa inline, sort theo order         |

---

## 6. Routes cần thêm vào `src/types/routes.ts`

```ts
ADMIN_PRODUCTS:      '/admin/products',
ADMIN_PRODUCTS_CREATE: '/admin/products/create',
// ADMIN_PRODUCTS_EDIT được xây dựng động: `/admin/products/${id}/edit`
```

---

## 7. Giao diện & Thiết kế

### Màu sắc Admin

Dùng background trung tính để phân biệt với phần trang chủ người dùng:

| Token           | Value                    | Dùng cho                |
| --------------- | ------------------------ | ----------------------- |
| Page background | `bg-gray-50`             | Nền tổng màn hình admin |
| Card background | `bg-white`               | Các card section        |
| Card border     | `border border-gray-200` | Viền card               |
| Header bar      | `bg-white border-b`      | Thanh tiêu đề trang     |

### Status Badge Mapping

| Status      | Badge variant | Label         |
| ----------- | ------------- | ------------- |
| `draft`     | `warning`     | Bản nháp      |
| `published` | `success`     | Đang hiển thị |
| `hidden`    | `secondary`   | Đã ẩn         |

### Button Actions

| Hành động        | Variant                | Icon         |
| ---------------- | ---------------------- | ------------ |
| Tạo sản phẩm mới | `primary`              | `PlusCircle` |
| Sửa              | `ghost`                | `Pencil`     |
| Xóa              | `ghost` (text-red-500) | `Trash2`     |
| Lưu form         | `primary`              | —            |
| Hủy/Quay lại     | `secondary`            | `ArrowLeft`  |

---

## 8. Chi tiết hành vi các nút CRUD

### 8.1. Nút "Thêm sản phẩm" (Create)

**Vị trí:** Góc trên-phải của màn hình danh sách, cạnh tiêu đề "Danh sách Sản phẩm".

```
[+ Thêm sản phẩm]   ← Button variant="primary", icon PlusCircle (lucide-react)
```

| Thuộc tính          | Giá trị                                                  |
| ------------------- | -------------------------------------------------------- |
| Component           | `Button` variant=`primary` rounded=`md` size=`lg`        |
| Icon                | `PlusCircle` (size 16) từ `lucide-react`, bên trái label |
| Label               | `+ Thêm sản phẩm`                                        |
| Hành động           | `router.push('/admin/products/create')`                  |
| Trạng thái disabled | Không (luôn bật)                                         |

**Luồng:**

```
Click [+ Thêm sản phẩm]
  → Chuyển trang /admin/products/create
  → Hiện Form rỗng với defaultValues
  → Người dùng nhập và submit
  → onSubmit: lưu vào localStorage + router.push('/admin/products')
  → Quay về list, row mới xuất hiện đầu danh sách
```

---

### 8.2. Nút "Sửa" (Edit)

**Vị trí:** Cột cuối (Hành động) của mỗi row trong bảng.

```
[✏️]   ← Icon Button (Pencil), ghost variant
```

| Thuộc tính | Giá trị                                             |
| ---------- | --------------------------------------------------- |
| Component  | `Button` variant=`ghost` size=`icon` rounded=`md`   |
| Icon       | `Pencil` (size 16) từ `lucide-react`                |
| Tooltip    | `"Chỉnh sửa sản phẩm"` (qua `Tooltip` component)    |
| Hành động  | `router.push('/admin/products/${product.id}/edit')` |

**Luồng:**

```
Click [✏️] ở row sản phẩm X
  → Chuyển trang /admin/products/[id]/edit
  → Page đọc `id` từ router.query
  → Load dữ liệu từ localStorage theo id
  → form.reset(loadedData) để điền sẵn giá trị
  → Người dùng chỉnh sửa và submit
  → onSubmit: tìm đúng record theo id, ghi đè, lưu lại
  → router.push('/admin/products')
```

**Lưu ý:**

- Trường `slug` ở chế độ Edit **không tự động thay đổi** khi sửa `name` (chỉ auto-gen khi Create).
- Nút submit trong Edit mode hiển thị label: `"Lưu thay đổi"` (thay vì `"Lưu & Tạo sản phẩm"`).

---

### 8.3. Nút "Xóa" (Delete)

**Vị trí:** Cột cuối (Hành động) của mỗi row, ngay bên phải nút Sửa.

```
[🗑️]   ← Icon Button (Trash2), ghost variant, text màu đỏ khi hover
```

| Thuộc tính | Giá trị                                                                                          |
| ---------- | ------------------------------------------------------------------------------------------------ |
| Component  | `Button` variant=`ghost` size=`icon` rounded=`md` className=`hover:text-red-600 hover:bg-red-50` |
| Icon       | `Trash2` (size 16) từ `lucide-react`                                                             |
| Tooltip    | `"Xóa sản phẩm"`                                                                                 |
| Hành động  | Mở `AlertDialog` xác nhận **trước khi** xóa                                                      |

**Luồng xác nhận xóa (`AlertDialog`):**

```
Click [🗑️]
  → Mở AlertDialog với nội dung:
      Title:   "Xác nhận xóa sản phẩm"
      Content: "Bạn có chắc muốn xóa sản phẩm "{name}" không?
                Hành động này không thể hoàn tác."
      Footer:
        [Hủy]            ← AlertDialogCancel, variant="secondary"
        [Xóa sản phẩm]  ← AlertDialogAction, className="bg-red-600 text-white hover:bg-red-700"

  ── Chọn [Hủy] → Đóng dialog, không có gì thay đổi.
  ── Chọn [Xóa sản phẩm]:
       → Lọc bỏ record theo id
       → saveProducts(filtered)
       → setProducts(filtered) cập nhật state local
       → Đóng dialog
       → (Tùy chọn) Hiển thị toast: "Đã xóa sản phẩm thành công"
```

**State của AlertDialog:**

```ts
const [deleteTarget, setDeleteTarget] = useState<ProductRow | null>(null);

// Mở dialog
const handleDeleteClick = (product: ProductRow) => setDeleteTarget(product);

// Xác nhận xóa
const handleDeleteConfirm = () => {
  if (!deleteTarget) return;
  const updated = products.filter((p) => p.id !== deleteTarget.id);
  saveProducts(updated);
  setProducts(updated);
  setDeleteTarget(null);
};

// Hủy
const handleDeleteCancel = () => setDeleteTarget(null);
```

---

### 8.4. Nút trong Form — "Lưu" và "Hủy"

**Vị trí:** Footer cố định cuối trang form (sticky bottom hoặc cuối scroll).

```
┌─────────────────────────────────────────────────────┐
│  [← Hủy bỏ]                [Lưu & Tạo sản phẩm →] │
└─────────────────────────────────────────────────────┘
```

#### Nút Hủy bỏ

| Thuộc tính | Giá trị                                                                      |
| ---------- | ---------------------------------------------------------------------------- |
| Component  | `Button` variant=`secondary` rounded=`md` size=`lg`                          |
| Icon       | `ArrowLeft` (size 16) bên trái                                               |
| Label      | `Hủy bỏ`                                                                     |
| Hành động  | `router.push('/admin/products')` (không lưu)                                 |
| Lưu ý      | Nếu người dùng đã nhập dữ liệu, **không cần** xác nhận thoát ở giai đoạn này |

#### Nút Lưu (Submit)

| Thuộc tính       | Giá trị                                                         |
| ---------------- | --------------------------------------------------------------- |
| Component        | `Button` variant=`primary` rounded=`md` size=`lg` type=`submit` |
| Label khi Create | `Lưu & Tạo sản phẩm`                                            |
| Label khi Edit   | `Lưu thay đổi`                                                  |
| Loading state    | prop `loading={form.formState.isSubmitting}` → hiện `Spinner`   |
| Disabled khi     | `form.formState.isSubmitting === true`                          |
| Hành động        | Trigger `form.handleSubmit(onSubmit)`                           |

**Trạng thái loading:**

```ts
// Button tự handle loading qua prop của component Button hiện có
<Button
  type="submit"
  variant="primary"
  size="lg"
  loading={form.formState.isSubmitting}
  disabled={form.formState.isSubmitting}
>
  {isEdit ? 'Lưu thay đổi' : 'Lưu & Tạo sản phẩm'}
</Button>
```

---

### 8.5. Nút "+ Thêm ảnh" trong dynamic `images` field

**Vị trí:** Bên trong Card "Hình ảnh & Media" của form.

```
[URL ảnh 1        ] [🗑️]
[URL ảnh 2        ] [🗑️]
[+ Thêm ảnh]
```

| Nút              | Component                                          | Hành động                       |
| ---------------- | -------------------------------------------------- | ------------------------------- |
| `+ Thêm ảnh`     | `Button` variant=`ghost` rounded=`md` icon=`Plus`  | `append('')` (useFieldArray)    |
| `🗑️` (xóa 1 ảnh) | `Button` variant=`ghost` size=`icon` icon=`Trash2` | `remove(index)` (useFieldArray) |

---

## 9. Điều kiện hoàn thành (Definition of Done)

- [ ] Tạo được sản phẩm mới qua form, dữ liệu lưu xuống `localStorage`.
- [ ] Danh sách hiển thị đúng tất cả sản phẩm đã tạo.
- [ ] Nút **Thêm**: chuyển trang, form rỗng, submit → quay về list với record mới.
- [ ] Nút **Sửa**: chuyển trang edit, form điền sẵn dữ liệu, submit → ghi đè đúng record.
- [ ] Nút **Xóa**: mở `AlertDialog` xác nhận, xóa xong cập nhật list ngay lập tức.
- [ ] Nút Lưu form có trạng thái loading khi đang submit.
- [ ] Validation: submit khi `name` hoặc `slug` trống → hiển thị lỗi inline, **không** submit.
- [ ] Slug tự sinh khi gõ tên (chỉ create mode, edit mode giữ nguyên).
- [ ] Field `images` thêm/xóa URL động bằng `useFieldArray`.
- [ ] Preview `thumbnail` khi nhập URL hợp lệ.
- [ ] Responsive trên mobile: 2 cột collapses xuống 1 cột.
- [ ] Không yêu cầu đăng nhập.
