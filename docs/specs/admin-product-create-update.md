---
title: 'Admin — Create / Update Product'
created: '2026-04-07'
status: 'draft'
domain: 'admin'
supersedes: 'product_form_spec.md'
---

# Spec: Admin — Create / Update Product

## 1. Vấn đề / Mục tiêu

Form tạo/sửa product hiện đang lưu dữ liệu vào **localStorage** thay vì gọi API thật.
Spec này định nghĩa contract hoàn chỉnh giữa form và API backend để connect thật.

---

## 2. API Contract

### 2.1 Create

```
POST /product
Authorization: Bearer <token>
Content-Type: application/json
```

**Request body:**

```jsonc
{
  "name": "Hạ Long Bay Tour", // required
  "description": "...", // optional
  "slug": "ha-long-bay-tour", // required — server tự append suffix để tránh trùng
  "thumbnail": "https://...", // optional
  "images": ["https://...", "..."], // optional — array of URL strings
  "itineraryImage": "https://...", // optional
  "duration": 3, // required, int ≥ 1
  "durationType": "day", // required — "day" | "night" | "hour"
  "highlight": "...", // optional
  "include": "...", // optional
  "exclude": "...", // optional
  "status": "draft", // required — "draft" | "published" | "hidden"
  "minPrice": 1500000, // required, number ≥ 0, admin nhập thủ công
  "destinationId": "<uuid>", // optional
  "supplierId": "<uuid>" // optional
}
```

**Không gửi:** `code` (server tự generate), `reviewPoint` (computed từ reviews)

**Response 200:**

```jsonc
{
  "data": {
    "id": "35320cb3-...",
    "createdAt": "2026-04-07T14:27:56.216Z",
    "updatedAt": "2026-04-07T14:27:56.216Z",
    "deletedAt": null,
    "name": "Hạ Long Bay Tour",
    "description": "...",
    "slug": "ha-long-bay-tour-0yi4", // server append suffix
    "thumbnail": "https://...",
    "code": "LGS4PPHU", // server tự generate, không do admin nhập
    "images": ["..."],
    "itineraryImage": "https://...",
    "duration": 3,
    "durationType": "day",
    "highlight": "...",
    "include": "...",
    "exclude": "...",
    "status": "draft",
    "minPrice": "1500000.00", // NOTE: server trả về string, cần Number() khi dùng
    "reviewPoint": 0,
    "destinationId": "<uuid>",
    "supplierId": "<uuid>"
  },
  "code": 200,
  "message": "created product successfully",
  "error": null
}
```

### 2.2 Update

```
PATCH /product/:id
Authorization: Bearer <token>
Content-Type: application/json
```

Body giống create, tất cả fields là optional (partial update).

---

## 3. Field Map — Form ↔ API

Form dùng **snake_case** (react-hook-form convention), API dùng **camelCase**.
Mapper phải chạy trước khi submit và sau khi load edit data.

| Form field (`ProductFormValues`) | API field                 | Type                    | Required | Ghi chú                                                             |
| -------------------------------- | ------------------------- | ----------------------- | -------- | ------------------------------------------------------------------- |
| `name`                           | `name`                    | `string`                | ✅       | min 1, max 500                                                      |
| `slug`                           | `slug`                    | `string`                | ✅       | auto-generate từ name khi create; user có thể override              |
| `description`                    | `description`             | `string \| null`        | —        |                                                                     |
| `thumbnail`                      | `thumbnail`               | `string \| null`        | —        | URL                                                                 |
| `images`                         | `images`                  | `string[]`              | —        | Form lưu `{url:string}[]` nội bộ, mapper serialize thành `string[]` |
| `itinerary_image`                | `itineraryImage`          | `string \| null`        | —        | URL                                                                 |
| `duration`                       | `duration`                | `number`                | ✅       | int ≥ 1                                                             |
| `duration_type`                  | `durationType`            | `string`                | ✅       | `"day" \| "night" \| "hour"`                                        |
| `highlight`                      | `highlight`               | `string \| null`        | —        |                                                                     |
| `include`                        | `include`                 | `string \| null`        | —        |                                                                     |
| `exclude`                        | `exclude`                 | `string \| null`        | —        |                                                                     |
| `min_price`                      | `minPrice`                | `number`                | ✅       | ≥ 0, admin nhập thủ công                                            |
| `status`                         | `status`                  | `string`                | ✅       | `"draft" \| "published" \| "hidden"`                                |
| `destination_id`                 | `destinationId`           | `string (uuid) \| null` | —        |                                                                     |
| `supplier_id`                    | `supplierId`              | `string (uuid) \| null` | —        |                                                                     |
| ~~`code`~~                       | `code` (read-only)        | `string`                | —        | **Không gửi lên API** — server tự generate; chỉ hiển thị khi edit   |
| ~~`review_point`~~               | `reviewPoint` (read-only) | `number`                | —        | **Không gửi lên API** — computed từ user reviews; chỉ hiển thị      |

---

## 4. Zod Schema (đã fix)

```ts
// src/lib/validations/product.ts

export const productSchema = z.object({
  name: z.string().min(1, 'Tên sản phẩm không được để trống').max(500),
  slug: z.string().min(1, 'Đường dẫn không được để trống'),
  description: z.string().optional().nullable(),
  destination_id: z.string().uuid('Điểm đến không hợp lệ').optional().nullable(),
  supplier_id: z.string().uuid('Nhà cung cấp không hợp lệ').optional().nullable(),
  duration: z.coerce.number().int().min(1, 'Thời lượng phải ≥ 1').default(1),
  duration_type: z.string().default('day'),
  highlight: z.string().optional().nullable(),
  include: z.string().optional().nullable(),
  exclude: z.string().optional().nullable(),
  min_price: z.coerce.number().min(0, 'Giá không được âm').default(0),
  status: z.enum(['draft', 'published', 'hidden']).default('draft'),
  thumbnail: z.string().optional().nullable(),
  itinerary_image: z.string().optional().nullable(),
  images: z
    .array(z.object({ url: z.string() }))
    .optional()
    .nullable(),
  // code và review_point không nằm trong form — chỉ hiển thị read-only khi edit
});
```

**Thay đổi so với schema hiện tại:**

- Bỏ `'hidden'` khỏi `status` enum (API không có)
- Bỏ `code` và `review_point` khỏi schema (không submit lên API)

---

## 5. Mapper Functions

Cần thêm vào `src/api/product/requests.ts`:

```ts
// Form values → API request body
function toApiPayload(data: ProductFormValues) {
  return {
    name: data.name,
    description: data.description ?? undefined,
    slug: data.slug,
    thumbnail: data.thumbnail ?? undefined,
    images: (data.images ?? []).map((img) => img.url).filter(Boolean),
    itineraryImage: data.itinerary_image ?? undefined,
    duration: data.duration,
    durationType: data.duration_type,
    highlight: data.highlight ?? undefined,
    include: data.include ?? undefined,
    exclude: data.exclude ?? undefined,
    status: data.status,
    minPrice: data.min_price,
    destinationId: data.destination_id ?? undefined,
    supplierId: data.supplier_id ?? undefined,
  };
}

// API response → form default values (dùng khi load edit)
function fromApiProduct(p: ApiProductDetail): Partial<ProductFormValues> {
  return {
    name: p.name,
    slug: p.slug ?? '',
    description: p.description,
    thumbnail: p.thumbnail,
    images: (p.images ?? []).map((url) => ({ url })),
    itinerary_image: p.itineraryImage,
    duration: p.duration,
    duration_type: p.durationType,
    highlight: p.highlight,
    include: p.include,
    exclude: p.exclude,
    min_price: Number(p.minPrice) || 0,
    status: p.status,
    destination_id: p.destinationId,
    supplier_id: p.supplierId,
  };
}

export async function createProduct(data: ProductFormValues): Promise<ApiProductDetail> {
  const res = await request.post<{ data: ApiProductDetail }>('/product', toApiPayload(data));
  return res.data.data;
}

export async function updateProduct(id: string, data: ProductFormValues): Promise<ApiProductDetail> {
  const res = await request.patch<{ data: ApiProductDetail }>(`/product/${id}`, toApiPayload(data));
  return res.data.data;
}

export async function getProductById(id: string): Promise<ApiProductDetail> {
  const res = await request.get<{ data: ApiProductDetail }>(`/product/${id}`);
  return res.data.data;
}
```

---

## 6. API Response Types (cần thêm vào `src/api/product/types.ts`)

```ts
// Full product detail (từ GET /product/:id và POST/PATCH response)
export interface ApiProductDetail {
  id: string;
  createdAt: string;
  updatedAt: string;
  deletedAt: string | null;
  name: string;
  description: string | null;
  slug: string;
  thumbnail: string | null;
  code: string; // read-only, server-generated
  images: string[];
  itineraryImage: string | null;
  duration: number;
  durationType: string;
  highlight: string | null;
  include: string | null;
  exclude: string | null;
  status: 'draft' | 'published';
  minPrice: string; // NOTE: server trả về string decimal "1500000.00"
  reviewPoint: number; // read-only, computed
  destinationId: string | null;
  supplierId: string | null;
}
```

---

## 7. Hành vi form

| Hành động                          | Kết quả                                                             |
| ---------------------------------- | ------------------------------------------------------------------- |
| Nhập `name` (create mode)          | `slug` auto-generate theo `generateSlug(name)`                      |
| User sửa `slug` thủ công           | Ngừng auto-generate (không override lại)                            |
| Nhấn "Lưu nháp" (create)           | Submit với `status: 'draft'` → `POST /product`                      |
| Nhấn "Công khai" (create / draft)  | Submit với `status: 'published'` → `POST` hoặc `PATCH /product/:id` |
| Nhấn "Ẩn" (đang published)         | Submit với `status: 'hidden'` → `PATCH /product/:id`                |
| Nhấn "Công khai lại" (đang hidden) | Submit với `status: 'published'` → `PATCH /product/:id`             |

### Status State Machine

```
[create]
    │
    ▼
 draft  ──── Publish ────▶  published
                               │    ▲
                             Hide   │
                               │  Publish lại
                               ▼    │
                            hidden ─┘

Ghi chú:
- draft   → published ✅
- draft   → hidden    ❌ (không cho phép)
- published → hidden  ✅
- published → draft   ❌ (không cho phép sau khi đã publish)
- hidden  → published ✅
- hidden  → draft     ❌ (không cho phép)
```

### Buttons hiển thị theo trạng thái

| Trạng thái hiện tại              | Buttons hiển thị                                         |
| -------------------------------- | -------------------------------------------------------- |
| Create (mới)                     | "Lưu nháp" + "Công khai"                                 |
| Edit — `draft`                   | "Lưu nháp" + "Công khai"                                 |
| Edit — `published`               | "Lưu thay đổi" + "Ẩn sản phẩm"                           |
| Edit — `hidden`                  | "Lưu thay đổi" + "Công khai lại"                         |
| Load edit page                   | `GET /product/:id` → `fromApiProduct()` → `form.reset()` |
| Submit thành công                | Redirect về `/admin/products`                            |
| Submit lỗi                       | Hiển thị toast error, giữ nguyên form                    |
| Field `code` (edit mode)         | Hiển thị read-only, không trong form schema              |
| Field `review_point` (edit mode) | Hiển thị read-only, không trong form schema              |

---

## 8. UI — Read-only fields khi Edit

Khi `isEdit === true`, hiển thị thêm 2 field **ngoài form** (không có `FormField`):

```tsx
{
  isEdit && (
    <div className="grid grid-cols-2 gap-4">
      <div>
        <label className="text-xs text-gray-500">Mã sản phẩm</label>
        <p className="text-sm font-mono">{productData?.code}</p>
      </div>
      <div>
        <label className="text-xs text-gray-500">Điểm đánh giá</label>
        <p className="text-sm">{productData?.reviewPoint ?? 0} / 5</p>
      </div>
    </div>
  );
}
```

---

## 9. Thay đổi kỹ thuật cần làm

| File                                                                          | Thay đổi                                                                                  |
| ----------------------------------------------------------------------------- | ----------------------------------------------------------------------------------------- |
| `src/api/product/types.ts`                                                    | Thêm `ApiProductDetail` interface                                                         |
| `src/api/product/requests.ts`                                                 | Thêm `createProduct`, `updateProduct`, `getProductById`, `toApiPayload`, `fromApiProduct` |
| `src/api/product/queries.ts`                                                  | Thêm `useCreateProduct`, `useUpdateProduct`, `useProductById` mutations/queries           |
| `src/lib/validations/product.ts`                                              | Sửa `status` enum (bỏ `'hidden'`), bỏ `code` và `review_point` khỏi schema                |
| `src/hooks/use-product-form.ts`                                               | Thay localStorage bằng API calls; load edit data từ `GET /product/:id`                    |
| `src/modules/AdminProduct/ProductFormPage/components/sidebar/PricingCard.tsx` | Bỏ `review_point` input, thay bằng read-only display khi edit                             |
| `src/modules/AdminProduct/ProductFormPage/components/tabs/GeneralTab.tsx`     | Bỏ `code` input, thêm read-only display khi edit                                          |

---

## 10. Dependencies & Conflicts

- **Depends on:** Backend API `/product` đã hoạt động (đã xác nhận qua curl test)
- **Modifies:** `use-product-form.ts`, `requests.ts`, `validations/product.ts`
- **Must NOT break:** ProductListPage, ProductTable, ProductFilterBar (dùng `IProduct` list type riêng)
- **Conflicts with:** Không

---

## 11. Out of scope

- **Options (gói giá):** Chưa phát triển — `adult_price`, `child_price`, `infant_price` sẽ là separate spec/endpoint
- **Itinerary (lịch trình):** Chưa kết nối API — separate endpoint `POST /product/:id/itinerary`
- **Image upload:** Spec này chỉ xử lý URL string; upload file lên S3/CDN là separate spec
- **Rich text editor (TinyMCE):** Đã có setup nhưng không thuộc scope connect API này

---

## 12. Open questions

- `GET /product/:id` — endpoint này có trả về đầy đủ fields như response của POST không? Cần test.
- `PATCH /product/:id` — partial hay full update? Nếu partial thì mapper không cần gửi undefined fields.
- Supplier và Destination hiện được lookup từ product list (hack). Backend có `/supplier` và `/destination` endpoint riêng không?
