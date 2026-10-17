---
title: 'Admin — Quản lý Destination (CRUD)'
created: '2026-10-16'
status: 'draft'
domain: 'admin'
related: 'admin/product-list.md'
---

# Spec: Quản lý Destination (Admin)

## 1. Vấn đề / Mục tiêu

**Hiện trạng**

- Admin chưa có màn hình nào để tạo / sửa / xoá Destination. Muốn thêm điểm đến mới phải nhờ BE insert DB.

**Phạm vi**

- Spec này **chỉ xây mới** trang quản lý Destination: toàn bộ là file mới, **không sửa logic code có sẵn**.
- Những chỗ cần chạm vào file có sẵn để trang truy cập được đã được tách riêng ở mục 4.2 và **chờ duyệt**.

**Mục tiêu**

- Thêm module quản lý Destination theo **đúng cấu trúc của module Quản lý sản phẩm (`AdminProduct`)**:
  - Trang danh sách `/admin/destinations` ↔ `ProductListPage`
  - Trang tạo `/admin/destinations/create` và trang sửa `/admin/destinations/[id]/edit` ↔ `ProductFormPage` (dùng chung 1 component, phân biệt bằng `destinationId`)
  - Form state + mutation nằm trong hook `src/hooks/use-destination-form.ts` ↔ `use-product-form.ts`
  - Filter/keyword/page nằm trong hook `src/hooks/use-destination-filters.ts` ↔ `use-product-filters.ts`
- Tái sử dụng tối đa component sẵn có: `StatCard`, `SectionCard`, `Table*`, `DropdownMenu`, `AlertDialog`, `Button`, `useDebounce`, `useAlertStore`.

---

## 2. API Contract

Base: `NEXT_PUBLIC_API_URL` (vd `https://web-travel-be.fly.dev`). Các endpoint 🔒 cần Bearer token admin → gọi `ensureAdminAuth()` trước request (giống `tag`, `supplier`).

| Method | Path                | Auth | Body / Query                                           | Response `data`                 |
| ------ | ------------------- | ---- | ------------------------------------------------------ | ------------------------------- |
| GET    | `/destination`      | —    | `keyword?: string`, `page = 1`, `pageSize = 10`        | `{ items, pagination, stats? }` |
| GET    | `/destination/{id}` | —    | `id: uuid` (path)                                      | `Destination`                   |
| POST   | `/destination`      | 🔒   | `{ name: string, description: string }`                | `Destination` (200/201)         |
| PUT    | `/destination/{id}` | 🔒   | `{ name: string, description: string }` (full replace) | `Destination`                   |
| DELETE | `/destination/{id}` | 🔒   | —                                                      | `Destination` (soft delete)     |

**Envelope thành công**

```json
{ "data": { ... }, "code": 200, "error": null, "message": "ok" }
```

**Envelope lỗi** (NestJS, **không** có `data`), FE đọc `response.data.message`:

```json
{ "statusCode": 404, "message": "Destination not found", "timestamp": "...", "path": "/destination/..." }
```

**Destination**

```json
{
  "id": "431bc370-77c1-46a8-9f7c-16d624ae5bbc",
  "createdAt": "2026-03-01T03:21:24.236Z",
  "updatedAt": "2026-03-01T03:21:24.236Z",
  "deletedAt": null,
  "createdBy": null,
  "updatedBy": null,
  "deletedBy": null,
  "name": "Miền Bắc",
  "description": "Các tỉnh tiêu biểu: Hà Nội, Lào Cai, ...\n\nĐiểm du lịch nổi tiếng:\n\nSapa (Lào Cai): Đỉnh Fansipan, ...\n\nHà Giang: ..."
}
```

**Pagination**: `{ page, pageSize, total, totalPages }`. Response thực tế **không có** `stats` → type để optional, FE không dùng.

### 2.1. Hành vi API đã kiểm chứng (curl, 2026-10-16)

| Kiểm tra                                  | Kết quả                                           | Ảnh hưởng FE                                           |
| ----------------------------------------- | ------------------------------------------------- | ------------------------------------------------------ |
| `keyword=Mi`                              | 3 kết quả (Miền Bắc / Trung / Nam)                | Tìm **substring** trong `name`                         |
| `keyword=miền`                            | 3 kết quả                                         | **Không phân biệt hoa/thường**                         |
| `keyword=mien`                            | 0                                                 | **Phân biệt dấu**, placeholder nên gợi ý gõ có dấu     |
| `keyword=Sapa` (chỉ có trong description) | 0                                                 | **Chỉ tìm theo `name`**, không tìm trong `description` |
| `pageSize=100`                            | 400 `pageSize must not be greater than 50`        | Không bao giờ gửi `pageSize > 50`                      |
| `GET /destination/{uuid không tồn tại}`   | 404 `Destination not found`                       | Trang Edit hiện state "not found" (mục 3.4)            |
| `POST` không có token                     | 401 `Token is missing`                            | Đã được chặn sớm bằng `ensureAdminAuth()`              |
| Thứ tự mặc định                           | Bắc → Trung → Tây Nguyên → Nam (cùng `createdAt`) | FE không tự sort, hiển thị theo thứ tự BE trả          |

### 2.2. Đánh giá field

Dữ liệu hiện có 4 bản ghi là **4 vùng du lịch**. `description` dài ~450–550 ký tự, nhiều đoạn, ngăn cách bằng `\n\n`.

| Field                                   | Map vào domain? | Hiển thị                                                     | Lý do                                                          |
| --------------------------------------- | --------------- | ------------------------------------------------------------ | -------------------------------------------------------------- |
| `id`                                    | ✅              | Không hiển thị                                               | Key + route edit + PUT/DELETE                                  |
| `name`                                  | ✅              | Cột **Name** (link sang trang Edit), input trên form         | Định danh chính                                                |
| `description`                           | ✅              | Cột **Description** (preview 2 dòng), textarea lớn trên form | Nội dung chính, dài nên bảng chỉ preview                       |
| `updatedAt`                             | ✅              | Cột **Updated**, card thông tin trên trang Edit              | Biết bản ghi nào vừa được sửa                                  |
| `createdAt`                             | ✅              | Chỉ ở card thông tin trên trang Edit                         | Ít giá trị ở danh sách, dữ liệu seed `createdAt === updatedAt` |
| `deletedAt`                             | ❌              | —                                                            | List chỉ trả bản ghi chưa xoá, FE không có luồng restore       |
| `createdBy` / `updatedBy` / `deletedBy` | ❌              | —                                                            | Luôn `null`, chưa rõ format                                    |

Raw type `ApiDestinationItem` vẫn khai báo đủ field audit (`string | null`) để khớp response, mapper `toDestination()` chỉ lấy 5 field ✅.

---

## 3. Hành vi mong muốn

### 3.1. Trang danh sách `/admin/destinations`

Bố cục, class, spacing **copy từ `ProductListPage`**: `min-h-full bg-gray-50 p-6 space-y-5` → page header → stat cards → card bảng (toolbar + table + pagination).

```
┌──────────────────────────────────────────────────────────────────┐
│ Destinations                                  [⊕ Add destination] │  ← page header
├──────────────────────────────────────────────────────────────────┤
│ [📍 Total destinations  4]                                        │  ← StatCard
├──────────────────────────────────────────────────────────────────┤
│ 🔍 Search by destination name...                                  │  ← toolbar
│──────────────────────────────────────────────────────────────────│
│ DESTINATION        │ DESCRIPTION                   │ UPDATED    │ ⋯ │
│ [M] Miền Bắc       │ Các tỉnh tiêu biểu: Hà Nội,   │ 01/03/2026 │ ⋯ │
│                    │ Lào Cai, Hà Giang, Sơn La…    │            │   │
│ [M] Miền Trung     │ Các tỉnh tiêu biểu: Thừa Thiên│ 01/03/2026 │ ⋯ │
│                    │ Huế, Đà Nẵng, Quảng Nam…      │            │   │
│──────────────────────────────────────────────────────────────────│
│ Showing 1–4 / 4 destinations              [< Prev] [1] [Next >]   │  ← pagination
└──────────────────────────────────────────────────────────────────┘
```

| Khối        | Theo Product                                                                       | Khác biệt                                                                                                                                             |
| ----------- | ---------------------------------------------------------------------------------- | ----------------------------------------------------------------------------------------------------------------------------------------------------- |
| Page header | `h1` + nút `Button variant="primary"` + `Icons.plusCircle` → `router.push(CREATE)` | —                                                                                                                                                     |
| Stat cards  | `grid grid-cols-3 gap-4` + `StatCard`                                              | Chỉ 1 card **Total destinations** = `pagination.total` (icon `MapPin`, accent blue). Grid giữ `grid-cols-3` để card cùng kích thước với trang Product |
| Toolbar     | Input search có icon, `max-w-sm`                                                   | **Không có** nút Filter / Popover (Destination không có field lọc)                                                                                    |
| Table       | `ProductTable` + `ProductTableRow`                                                 | Cột theo mục 3.2                                                                                                                                      |
| Pagination  | Markup phân trang TailAdmin trong `ProductListPage` (max 5 nút số)                 | —                                                                                                                                                     |
| Delete      | `DeleteConfirmDialog` (AlertDialog)                                                | Text riêng cho destination                                                                                                                            |

**Hành vi danh sách**

| Hành động                    | Kết quả mong đợi                                                                                                  |
| ---------------------------- | ----------------------------------------------------------------------------------------------------------------- |
| Vào trang                    | `GET /destination?page=1&pageSize=10`. Lần đầu hiện skeleton rows như `ProductTable`.                             |
| Gõ search                    | `useDebounce(keyword, 300)` → gọi lại với `keyword`, reset `page = 1`. Search chạy phía server, chỉ theo `name`.  |
| Đang fetch trang/keyword mới | `keepPreviousData: true`, bảng giữ data cũ + trạng thái loading như `ProductTable` (`isLoading \|\| isFetching`). |
| Không có kết quả             | Empty state: "No destinations found". Nếu đang search thì có thêm link **Clear search**.                          |
| Bấm tên destination          | Đi tới `/admin/destinations/{id}/edit` (giống tên tour trong `ProductTableRow`).                                  |
| `⋯` → Edit                   | Như trên.                                                                                                         |
| `⋯` → Delete                 | Mở dialog xoá (mục 3.5).                                                                                          |
| Xoá item cuối của trang > 1  | Sau refetch, nếu `items.length === 0 && page > 1` → `setPage(page - 1)`.                                          |

### 3.2. Cột bảng (`DestinationTable` / `DestinationTableRow`)

Header `TableHead` dùng chung `thClass` như `ProductTable`. Mỗi `TableCell` có `py-6`, row hover `hover:bg-gray-50`.

| Cột         | Độ rộng                  | Nội dung                                                                                                                                                                                                                                                   |
| ----------- | ------------------------ | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Destination | `min-w-[200px]`          | Avatar chữ cái đầu (`w-8 h-8 rounded-lg`, màu theo `getAvatarColor(name)` giống Product) + `Link` tên `font-semibold text-sm hover:text-brand-600 line-clamp-1` → trang Edit.                                                                              |
| Description | co giãn, `max-w-[520px]` | Preview: `description.replace(/\s+/g, ' ').trim()` rồi `line-clamp-2 text-sm text-gray-500`. **Không** dùng `whitespace-pre-line` ở bảng (vì `\n\n` tạo dòng trống, cắt mất preview). Render text thường, không `dangerouslySetInnerHTML`. Rỗng → `—` xám. |
| Updated     | `w-[130px]`              | `dayjs(updatedAt).format('DD/MM/YYYY')`, `text-xs text-gray-500 whitespace-nowrap` (giống cột Created at của Product).                                                                                                                                     |
| Actions     | `w-14`                   | `DropdownMenu` trigger `MoreHorizontal` (giống Product): **Edit** (`Pencil`, `Link`) → separator → **Delete** (`Trash2`, đỏ).                                                                                                                              |

### 3.3. Trang tạo / sửa `/admin/destinations/create`, `/admin/destinations/[id]/edit`

Một component `DestinationFormPage({ destinationId? })` dùng cho cả 2 route (giống `ProductFormPage`). Không có scroll-spy nav bên trái vì form chỉ có 1 section.

```
┌──────────────────────────────────────────────────────────────────┐
│ ←  Edit destination                         ⟳  [💾 Save changes] │  ← sticky header
├──────────────────────────────────────────────────────────────────┤
│ ┌ Destination info ───────────────────────┐ ┌ Information ──────┐ │
│ │ Destination name *                      │ │ Created           │ │
│ │ [Miền Bắc                             ] │ │ 01/03/2026 10:21  │ │
│ │                                         │ │ Last updated      │ │
│ │ Description                             │ │ 01/03/2026 10:21  │ │
│ │ ┌─────────────────────────────────────┐ │ │                   │ │
│ │ │Các tỉnh tiêu biểu: Hà Nội, ...      │ │ │ [🗑 Delete]       │ │
│ │ │                                     │ │ └───────────────────┘ │
│ │ │Điểm du lịch nổi tiếng:              │ │                       │
│ │ │...                                  │ │                       │
│ │ └─────────────────────────────────────┘ │                       │
│ │ Use a blank line to separate…  552/3000 │                       │
│ └─────────────────────────────────────────┘                       │
└──────────────────────────────────────────────────────────────────┘
```

**Header (`destination-form-header.tsx`)**: copy cấu trúc `ProductFormHeader`:

- `sticky top-[72px] z-30 bg-white/90 backdrop-blur-md border-b px-6 py-3`
- Nút `ArrowLeft` → về `ROUTE.ADMIN_DESTINATIONS`. Nếu form đang dirty thì hỏi "Discard changes?" trước.
- Title: `Add destination` / `Edit destination` (không có status badge, không có link "View page").
- Bên phải: spinner `Loader2` khi `isPending`. Nút chính:
  - Create: `[💾 Create destination]`
  - Edit: `[💾 Save changes]`, disabled khi form chưa dirty.

**Body**: `flex gap-6 items-start px-6 py-4`.

- **Cột chính** (`flex-1 min-w-0`): `SectionCard id="section-info" label="Destination info"` (import từ `AdminProduct/ProductFormPage/components/section-card`).
- **Cột phụ** (`w-80 shrink-0 hidden lg:block sticky top-[140px]`, **chỉ ở Edit**): card "Information" style giống `SectionCard`, gồm:
  - `createdAt` / `updatedAt` dạng `DD/MM/YYYY HH:mm`
  - Nút **Delete destination** (outline đỏ), mở cùng dialog xoá như trang list

**Field & validation** (zod `destinationFormSchema` ở `src/lib/validations/destination.ts`, dùng `FormWrapper` + `FormField` / `FormLabel` / `FormMessage` như form Product)

| Field         | Control               | Rule                                                                                                                   |
| ------------- | --------------------- | ---------------------------------------------------------------------------------------------------------------------- |
| `name`        | `Input`, bắt buộc `*` | `trim()`, 2–100 ký tự                                                                                                  |
| `description` | `Textarea`, tuỳ chọn  | `trim()` 2 đầu, **giữ nguyên `\n` bên trong**, tối đa 3000 ký tự. Bộ đếm `x/3000` góc phải dưới. Gửi `""` nếu bỏ trống |

- Textarea: `min-h-[320px] resize-y`. Hint dưới: "Use a blank line to separate paragraphs."
- Submit lỗi validation → toast error + scroll tới field lỗi đầu tiên (giống `onValidationError` / `scrollToFirstError` của `ProductFormPage`).

**Hành vi form (`use-destination-form.ts`)**

| Hành động                       | Kết quả mong đợi                                                                                                                          |
| ------------------------------- | ----------------------------------------------------------------------------------------------------------------------------------------- |
| Vào trang Create                | Form rỗng, autofocus `name`.                                                                                                              |
| Vào trang Edit                  | `useDestinationById({ id })` → `form.reset(data)`. Trong lúc tải hiện skeleton trong `SectionCard` (giống skeleton của `DetailsSection`). |
| Edit với id không tồn tại (404) | Không render form. Hiện khối empty state "Destination not found" + nút **Back to list**.                                                  |
| Create thành công               | `POST` → invalidate (mục 3.6) → toast "Destination created" → `router.push(ROUTE.ADMIN_DESTINATIONS)` (giống Product).                    |
| Update thành công               | `PUT` gửi **đủ 2 field** → invalidate → toast "Destination updated" → `router.push(ROUTE.ADMIN_DESTINATIONS)`.                            |
| API lỗi                         | Toast `err.response.data.message ?? t('genericError')`. Ở lại trang, giữ dữ liệu đã nhập.                                                 |
| Đang submit                     | `isPending` → nút header disabled + spinner.                                                                                              |
| Ctrl/Cmd + Enter                | Submit (tiện khi đang gõ trong textarea dài).                                                                                             |

### 3.4. Xoá

Logic trong `use-destination-list-actions.ts` (giống `use-product-list-actions.ts`). Trang Edit dùng lại cùng dialog.

| Hành động                   | Kết quả mong đợi                                                                                                       |
| --------------------------- | ---------------------------------------------------------------------------------------------------------------------- |
| Chọn Delete                 | `AlertDialog`: "Delete destination?" / "“{name}” will be removed and can no longer be assigned to tours." Nút đỏ.      |
| Xác nhận                    | `DELETE /destination/{id}` → invalidate → toast "Destination deleted". Ở list: đóng dialog + refetch. Ở Edit: về list. |
| Đang xoá                    | Nút xác nhận disabled + spinner.                                                                                       |
| Lỗi (VD: đang gắn với tour) | Toast error theo message BE, đóng dialog.                                                                              |

### 3.5. Đồng bộ cache

Sau **mọi** mutation thành công: `removeQueries(['/destination/list'])` và `removeQueries(['/destination/detail'])` (giống `invalidateList` của Product). Chỉ động tới query key của module Destination.

---

## 4. Thay đổi kỹ thuật

### 4.1. Cấu trúc file (đối chiếu với `AdminProduct`)

```
src/
  api/destination/
    types.ts            ← api/product/types.ts
    requests.ts         ← api/product/requests.ts
    queries.ts          ← api/product/queries.ts
    index.ts
  lib/validations/destination.ts            ← lib/validations/product.ts
  hooks/
    use-destination-filters.ts              ← hooks/use-product-filters.ts
    use-destination-form.ts                 ← hooks/use-product-form.ts
  modules/AdminDestination/
    index.ts                                ← modules/AdminProduct/index.ts
    DestinationListPage/
      index.tsx                             ← ProductListPage/index.tsx
      components/
        DestinationTable.tsx                ← ProductTable.tsx
        DestinationTableRow.tsx             ← ProductTableRow.tsx
        DeleteConfirmDialog.tsx             ← DeleteConfirmDialog.tsx
      hooks/
        use-destination-list-actions.ts     ← use-product-list-actions.ts
    DestinationFormPage/
      index.tsx                             ← ProductFormPage/index.tsx
      components/
        destination-form-header.tsx         ← product-form-header.tsx
        destination-info-card.tsx           ← sidebar/ConfigCard.tsx
        sections/basic-info-section.tsx     ← sections/basic-info-section.tsx
  pages/admin/destinations/
    index.tsx                               ← pages/admin/products/index.tsx
    create.tsx                              ← pages/admin/products/create.tsx
    [id]/edit.tsx                           ← pages/admin/products/[id]/edit.tsx
```

| File                          | Ghi chú                                                                                                                                                                                                                                                                                                                                                                     |
| ----------------------------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `api/destination/types.ts`    | Domain `IDestination { id, name, description, createdAt, updatedAt }` (`description` chuẩn hoá `null → ''`), `IDestinationListParams { keyword?, page?, pageSize? }`, `IDestinationListResult`, `IDestinationPagination`, `DestinationFormPayload { name, description }`. Raw `ApiDestinationItem`, `ApiDestinationListResponse` (`stats?`), `ApiDestinationDetailResponse` |
| `api/destination/requests.ts` | `toDestination()`; `getDestinationList` (bỏ param rỗng như `getSupplierList`), `getDestinationById`, `createDestination`, `updateDestination`, `deleteDestination`. 3 hàm mutate gọi `ensureAdminAuth()`                                                                                                                                                                    |
| `api/destination/queries.ts`  | `useDestinationPagedList` (`/destination/list`), `useDestinationById` (`/destination/detail`), `useCreateDestination`, `useUpdateDestination`, `useDeleteDestination`                                                                                                                                                                                                       |
| `pages/admin/destinations/*`  | Thin page: `getLayout` → `AdminLayout`, `getServerSideProps` + `serverSideTranslations(['common', 'adminPage'])`. `[id]/edit.tsx` lấy `query.id` như trang edit Product                                                                                                                                                                                                     |

> **Đặt tên hook:** `@/api/product/lookup` đã có `useDestinationList` (trả `LookupItem[]`). Hook phân trang mới đặt tên **`useDestinationPagedList`** để tránh trùng tên.

> **Pagination:** copy markup phân trang từ `ProductListPage`, không tách component chung trong scope này.

### 4.2. File có sẵn cần thêm vào (⚠️ CHỜ DUYỆT, chưa làm)

Toàn bộ thay đổi chỉ **thêm dòng mới**, không sửa/xoá dòng nào có sẵn. Chưa được duyệt thì không động vào. Khi chưa có các dòng này, trang vẫn build được nhưng:

- Phải gõ URL trực tiếp mới vào được (sidebar chưa có link).
- Route tạm hard-code trong module.
- Text hiển thị là i18n key thô.

| File                                                                   | Thay đổi đề xuất                                                                                                              |
| ---------------------------------------------------------------------- | ----------------------------------------------------------------------------------------------------------------------------- |
| [routes.ts](../../../src/types/routes.ts)                              | Thêm `ADMIN_DESTINATIONS`, `ADMIN_DESTINATIONS_CREATE`, `ADMIN_DESTINATIONS_EDIT: (id) => \`/admin/destinations/${id}/edit\`` |
| [Sidebar.tsx](../../../src/components/layouts/AdminLayout/Sidebar.tsx) | Thêm `{ labelKey: 'destinations', href: ROUTE.ADMIN_DESTINATIONS, icon: MapPin }` ngay sau `products`                         |
| `public/locales/{en,vi}/adminPage.json`                                | Thêm key i18n (mục 4.3)                                                                                                       |

### 4.3. i18n keys (`adminPage`)

| Key                                 | en                                                                 | vi                                                  |
| ----------------------------------- | ------------------------------------------------------------------ | --------------------------------------------------- |
| `destinations`                      | Destinations                                                       | Điểm đến                                            |
| `destinationListTitle`              | Destinations                                                       | Quản lý điểm đến                                    |
| `addDestination`                    | Add destination                                                    | Thêm điểm đến                                       |
| `editDestination`                   | Edit destination                                                   | Sửa điểm đến                                        |
| `createDestination`                 | Create destination                                                 | Tạo điểm đến                                        |
| `deleteDestination`                 | Delete destination                                                 | Xoá điểm đến                                        |
| `totalDestinations`                 | Total destinations                                                 | Tổng điểm đến                                       |
| `searchDestinationsPlaceholder`     | Search by destination name...                                      | Tìm theo tên điểm đến (có dấu)...                   |
| `destinationsUnit`                  | destinations                                                       | điểm đến                                            |
| `colDestination`                    | Destination                                                        | Điểm đến                                            |
| `colDescription`                    | Description                                                        | Mô tả                                               |
| `colUpdatedAt`                      | Updated                                                            | Cập nhật                                            |
| `secDestinationInfo`                | Destination info                                                   | Thông tin điểm đến                                  |
| `secInformation`                    | Information                                                        | Thông tin                                           |
| `destinationName`                   | Destination name                                                   | Tên điểm đến                                        |
| `destinationNamePlaceholder`        | e.g. Northern Vietnam                                              | VD: Miền Bắc                                        |
| `destinationDescription`            | Description                                                        | Mô tả                                               |
| `destinationDescriptionPlaceholder` | Highlighted provinces, famous attractions...                       | Các tỉnh tiêu biểu, điểm du lịch nổi tiếng...       |
| `destinationDescriptionHint`        | Use a blank line to separate paragraphs.                           | Để trống 1 dòng để tách đoạn.                       |
| `destinationNameRequired`           | Name must be 2–100 characters                                      | Tên phải từ 2–100 ký tự                             |
| `destinationDescriptionTooLong`     | Description must be at most 3000 characters                        | Mô tả tối đa 3000 ký tự                             |
| `destinationValidationError`        | Please check the highlighted fields                                | Vui lòng kiểm tra các trường bị lỗi                 |
| `createdAtLabel` / `updatedAtLabel` | Created / Last updated                                             | Tạo lúc / Cập nhật lúc                              |
| `destinationCreated`                | Destination created                                                | Đã tạo điểm đến                                     |
| `destinationUpdated`                | Destination updated                                                | Đã cập nhật điểm đến                                |
| `destinationDeleted`                | Destination deleted                                                | Đã xoá điểm đến                                     |
| `deleteDestinationFailed`           | Could not delete destination                                       | Không xoá được điểm đến                             |
| `confirmDeleteDestinationTitle`     | Delete destination?                                                | Xoá điểm đến?                                       |
| `confirmDeleteDestinationMessage`   | "{{name}}" will be removed and can no longer be assigned to tours. | "{{name}}" sẽ bị xoá và không thể gán cho tour nữa. |
| `noDestinationsFound`               | No destinations found                                              | Không tìm thấy điểm đến                             |
| `destinationNotFound`               | Destination not found                                              | Không tìm thấy điểm đến này                         |
| `backToList`                        | Back to list                                                       | Quay lại danh sách                                  |
| `clearSearch`                       | Clear search                                                       | Xoá tìm kiếm                                        |
| `discardChangesTitle`               | Discard unsaved changes?                                           | Bỏ các thay đổi chưa lưu?                           |

Dùng lại key có sẵn: `cancel`, `edit`, `saveChanges`, `showing`, `prev`, `next`, `genericError`. Dev kiểm tra JSON trước khi thêm để không tạo key trùng.

---

## 5. Dependencies & Conflicts

- **Depends on:** 5 endpoint `/destination` đã có trên BE (đã kiểm tra GET bằng curl 2026-10-16).
- **Modifies:** Không sửa logic code có sẵn. Chỉ có các dòng thêm vào ở mục 4.2, và chúng đang chờ duyệt.
- **Must NOT break:**
  - Module `AdminProduct` (chỉ import `SectionCard`, không sửa).
  - `ensureAdminAuth` và luồng refresh token 401 trong `src/api/axios.ts` (chỉ gọi, không sửa).
- **Conflicts with:** None.

---

## 6. Out of scope

- Mọi thay đổi ở module khác: form Tour, bộ lọc Product, `src/api/product/lookup.ts`.
- Draft autosave / draft recovery banner như Product (form chỉ 2 field).
- Filter nâng cao, date range, bulk delete, import/export.
- Restore destination đã soft-delete.
- Upload ảnh cover cho Destination (API chưa có field).
- Sort theo cột; hiển thị số tour đang dùng destination.
- Cột `createdBy` / `updatedBy` (BE trả `null`).
- Rich-text editor: description là plain text, xuống dòng bằng `\n`.

---

## 7. Open questions

1. **Duyệt mục 4.2:** có cho phép thêm route vào `routes.ts`, nav item vào `Sidebar.tsx` và key vào locale JSON không?
2. **Xoá khi đang gắn với tour:** BE (a) chặn và trả lỗi, (b) soft delete và tour vẫn giữ `destinationId`, hay (c) set null? Cần biết để viết đúng text cảnh báo.
3. **Trùng tên:** `name` có unique không? Nếu có thì BE trả code gì (409?) để FE gắn lỗi vào field Name.
4. **Giới hạn độ dài:** 100 (`name`) / 3000 (`description`) là giả định, cần BE xác nhận kiểu cột.
5. **`description` bắt buộc?** Nếu BE bắt buộc thì đổi rule thành required.
6. **Search không dấu:** hiện `mien` không ra `Miền`. Có cần BE hỗ trợ unaccent không? Nếu không thì giữ placeholder "(có dấu)".

---

## 8. Ghi chú implement (2026-10-16)

Để **không sửa file có sẵn**, code đã làm khác spec ở 2 điểm:

- **i18n:** dùng namespace mới `adminDestination` (`public/locales/{en,vi}/adminDestination.json`), thay cho việc thêm key vào `adminPage.json`. Các page load `['common', 'adminPage', 'adminDestination']`. Zod message dùng dạng `adminDestination:<key>`.
- **Route + Sidebar:** mục 4.2 đã được duyệt và đã làm: thêm `ROUTE.ADMIN_DESTINATIONS*`, nav item `destinations` (sau Products) và key `destinations` trong `adminPage.json`. `DESTINATION_ROUTES` trong `constants.ts` giờ trỏ về `ROUTE`.

Cache: list dùng `invalidateQueries` (refetch ngay query đang hiển thị), detail dùng `removeQueries`.
