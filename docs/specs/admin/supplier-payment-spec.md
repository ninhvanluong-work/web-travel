---
title: 'Đặc tả Quản lý Thông tin Thanh toán & Ngân hàng Nhà cung cấp (Supplier Payment Spec)'
created: '2026-08-27'
status: 'draft'
domain: 'admin'
---

# Spec: Quản lý Thông tin Thanh toán & Ngân hàng Nhà cung cấp (Supplier Payment & Bank Management)

## 1. Tổng quan & Mục tiêu (Overview & Goals)

### 1.1. Bối cảnh & Hiện trạng

Hệ thống Web Travel cần quản lý thông tin thanh toán (Tài khoản ngân hàng / Thẻ / Paypal...) của từng Nhà cung cấp (Supplier) để phục vụ quá trình quyết toán, thanh toán đối soát tour du lịch tự động và thủ công.

Hiện tại, màn hình tạo/chỉnh sửa Supplier mới chỉ hỗ trợ lưu thông tin cơ bản (`name`, `phone`, `email`, `avatar`). Cần bổ sung phân hệ **Thông tin Thanh toán & Ngân hàng (Supplier Payment Method)** để lưu trữ và quản lý các phương thức thanh toán liên kết với từng Supplier.

### 1.2. Mục tiêu (Goals)

- Tích hợp khu vực quản lý tài khoản ngân hàng / phương thức thanh toán trực tiếp vào **Trang chi tiết & Chỉnh sửa Supplier** (`/admin/suppliers/[id]/edit`) và **Drawer Form**.
- Hỗ trợ lưu trữ nhiều tài khoản thanh toán cho 1 Supplier, có cơ chế đánh dấu **Tài khoản mặc định (`isDefault: true`)**.
- Cho phép Admin Thêm mới (`POST /supplier-payment`), Chỉnh sửa (`PUT /supplier-payment/{id}`), Xóa (`DELETE /supplier-payment/{id}`) và Lấy danh sách (`GET /supplier-payment?supplierId=...`).
- Tối ưu hóa UI/UX chuẩn thiết kế **BMAD WOW UX**: hiển thị dạng Thẻ tài khoản Ngân hàng (Bank Card Component), có Badge Mặc định (Default Badge), Copy nhanh số tài khoản 1-click.

---

## 2. Đặc tả Giao diện & Trải nghiệm Người dùng (UI/UX Specification)

### 2.1. Vị trí hiển thị (Integration Location)

1. **Trang Chỉnh sửa Supplier (`/admin/suppliers/[id]/edit`)**:
   - Thêm section mới **"Thông tin Thanh toán & Ngân hàng" (Supplier Payment & Bank Accounts)** nằm dưới phần Thông tin cơ bản.
   - Thêm đường dẫn scroll-spy ở thanh menu bên trái: icon `CreditCard` với nhãn `bankPaymentInfo`.
2. **Slide-over Drawer Form (Tạo / Sửa nhanh Supplier)**:
   - Thêm tab hoặc khu vực accordion cho phép thiết lập tài khoản ngân hàng khi khởi tạo / chỉnh sửa Supplier.

### 2.2. Danh sách Tài khoản Ngân hàng (Premium Visual Bank Card UI)

Thay vì giao diện ô văn bản đơn điệu, các tài khoản thanh toán sẽ được trình bày dưới dạng **Thẻ Ngân hàng Chuyên nghiệp (Visual Financial Card)**:

1. **Kiểu dáng Thẻ Ngân hàng (Debit/Credit Card Aesthetic)**:

   - Thẻ chuẩn tỉ lệ thẻ ngân hàng với nền Gradient sang trọng (`bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900` cho tài khoản mặc định, hoặc `from-slate-50 to-slate-100` cho tài khoản phụ).
   - **Huy hiệu Chip Ngân hàng (Metallic Chip Graphic)** giả lập mạ vàng ở góc trái.
   - **Số Tài khoản (`accountNumber`)**: Phông chữ Monospace lớn (`font-mono text-base font-semibold tracking-wider`), đi kèm nút **Copy 1-click** mượt mà (chuyển sang icon Check xanh lá 2s khi click).

2. **Cấu trúc Thẻ**:

   - **Header**: Tên ngân hàng (`bankName` - in đậm), Loại tiền tệ (`currency` - Badge màu xám mờ) và Badge **Mặc định (`isDefault = true`)** gắn ngôi sao mạ vàng nổi bật.
   - **Body**: Số tài khoản + Nút Copy nhanh + Tên chủ tài khoản in hoa (`accountHolder` - `font-medium uppercase tracking-wider`).
   - **Footer**: Mã `Swift Code` và Email liên hệ nhận thông báo đối soát.

3. **Nút Thao tác Tinh tế (Action Bar Overlay)**:

   - Các nút **Sửa (Pencil)**, **Xóa (Trash)** và **Đặt làm mặc định (Star)** hiển thị gọn gàng, tự động làm rõ nét khi Hover vào thẻ để giữ thẻ ngân hàng tối giản và đẹp mắt.

4. **Nút "+ Thêm tài khoản thanh toán"**:
   - Thiết kế dạng **Thẻ nét đứt bán mờ (Dashed Border Card)** có chiều cao và bo góc đồng bộ với thẻ ngân hàng, hover vào tỏa sáng màu thương hiệu (`hover:border-brand-400 hover:bg-brand-50/30`).

### 2.3. Form Thêm / Cập nhật Tài khoản Ngân hàng (Modal / Sheet Form)

Cấu trúc Form chia làm các nhóm trường thông tin:

1. **Thông tin Chung**:

   - **Phương thức (`method`)**: Select input (Mặc định: `bank`, hỗ trợ `card`, `paypal`).
   - **Loại tiền tệ (`currency`)**: Select input (Mặc định: `VND`, hỗ trợ `USD`, `EUR`...).
   - **Đặt làm tài khoản mặc định (`isDefault`)**: Toggle switch / Checkbox.

2. **Chi tiết Ngân hàng (`details`)**:
   - **Tên Ngân hàng (`bankName`)**: Input text (VD: Vietcombank, Techcombank, MB Bank, ...). _(Bắt buộc)_
   - **Tên Chủ tài khoản (`accountHolder`)**: Input text (VD: NGUYEN VAN A). _(Bắt buộc)_
   - **Số Tài khoản (`accountNumber`)**: Input text (VD: 190012345678). _(Bắt buộc)_
   - **Mã Swift Code (`swiftCode`)**: Input text (VD: BFTVNVVX - Tùy chọn cho chuyển khoản quốc tế).
   - **Thông tin Thẻ (`cardHolder`, `cardNumber`, `expiryMonth`, `expiryYear`)**: Nhóm ô nhập hiển thị khi chọn phương thức `card`.
   - **Email nhận thông báo thanh toán (`email`)**: Input email.

---

## 3. Cấu trúc Dữ liệu & TypeScript Types

```typescript
// ── Supplier Payment Details Structure ────────────────────────────────────────

export interface ISupplierPaymentDetails {
  bankName?: string;
  accountHolder?: string;
  accountNumber?: string;
  swiftCode?: string;
  cardHolder?: string;
  cardNumber?: string;
  expiryMonth?: string;
  expiryYear?: string;
  email?: string;
}

export interface ISupplierPayment {
  id: string;
  createdAt: string;
  updatedAt: string;
  deletedAt: string | null;
  supplierId: string;
  method: 'bank' | 'card' | 'paypal' | string;
  currency: string;
  details: ISupplierPaymentDetails;
  isDefault: boolean;
}

// ── Payload Create / Update ───────────────────────────────────────────────────

export interface SupplierPaymentPayload {
  supplierId: string;
  method: string;
  currency: string;
  details: ISupplierPaymentDetails;
  isDefault?: boolean;
}

// ── List Query Params ─────────────────────────────────────────────────────────

export interface ISupplierPaymentListParams {
  keyword?: string;
  page?: number;
  pageSize?: number;
  supplierId?: string;
  method?: string;
}
```

---

## 4. Đặc tả API Integration Mapping

### 4.1. Endpoint List

| Hành động          | Method   | Endpoint                 | Request Payload / Params                                           | Response Data                         |
| ------------------ | -------- | ------------------------ | ------------------------------------------------------------------ | ------------------------------------- |
| **Tạo PTTT**       | `POST`   | `/supplier-payment`      | `SupplierPaymentPayload`                                           | `ApiSingleResponse<ISupplierPayment>` |
| **Danh sách PTTT** | `GET`    | `/supplier-payment`      | `?supplierId={id}&method={method}&keyword={kw}&page=1&pageSize=10` | `ApiListResponse<ISupplierPayment>`   |
| **Chi tiết PTTT**  | `GET`    | `/supplier-payment/{id}` | -                                                                  | `ApiSingleResponse<ISupplierPayment>` |
| **Cập nhật PTTT**  | `PUT`    | `/supplier-payment/{id}` | `SupplierPaymentPayload`                                           | `ApiSingleResponse<ISupplierPayment>` |
| **Xóa PTTT**       | `DELETE` | `/supplier-payment/{id}` | -                                                                  | `ApiDeleteResponse`                   |

### 4.2. Request / Response Example (`GET /supplier-payment`)

**Request Query**: `GET /supplier-payment?supplierId=64fe3b50-6261-44a7-834a-517dff2d20ea&page=1&pageSize=10`

**Response (Code 200)**:

```json
{
  "data": {
    "items": [
      {
        "id": "d85d2022-dcd4-4fd7-9c51-5d399502dd76",
        "createdAt": "2026-08-27T14:24:54.715Z",
        "updatedAt": "2026-08-27T14:24:54.715Z",
        "deletedAt": null,
        "supplierId": "64fe3b50-6261-44a7-834a-517dff2d20ea",
        "method": "bank",
        "currency": "VND",
        "details": {
          "email": "user@example.com",
          "bankName": "Vietcombank",
          "swiftCode": "BFTVNVVX",
          "cardHolder": "",
          "cardNumber": "",
          "expiryYear": "",
          "expiryMonth": "",
          "accountHolder": "CONG TY TNHH WEB TRAVEL",
          "accountNumber": "0071001234567"
        },
        "isDefault": false
      }
    ],
    "pagination": {
      "page": 1,
      "pageSize": 10,
      "total": 1,
      "totalPages": 1
    }
  },
  "code": 200,
  "message": "get supplier payments successfully",
  "error": null
}
```

### 4.3. Request / Response Example (`POST /supplier-payment`)

**Request Body**:

```json
{
  "supplierId": "64fe3b50-6261-44a7-834a-517dff2d20ea",
  "method": "bank",
  "currency": "VND",
  "details": {
    "bankName": "Vietcombank",
    "accountHolder": "CONG TY TNHH WEB TRAVEL",
    "accountNumber": "0071001234567",
    "swiftCode": "BFTVNVVX",
    "email": "user@example.com"
  },
  "isDefault": false
}
```

**Response (Code 200)**:

```json
{
  "data": {
    "id": "d85d2022-dcd4-4fd7-9c51-5d399502dd76",
    "createdAt": "2026-08-27T14:24:54.715Z",
    "updatedAt": "2026-08-27T14:24:54.715Z",
    "deletedAt": null,
    "supplierId": "64fe3b50-6261-44a7-834a-517dff2d20ea",
    "method": "bank",
    "currency": "VND",
    "details": {
      "bankName": "Vietcombank",
      "accountHolder": "CONG TY TNHH WEB TRAVEL",
      "accountNumber": "0071001234567",
      "swiftCode": "BFTVNVVX",
      "email": "user@example.com"
    },
    "isDefault": false
  },
  "code": 200,
  "message": "created supplier payment successfully",
  "error": null
}
```

### 4.4. Request / Response Example (`GET /supplier-payment/{id}`)

**Request Path**: `GET /supplier-payment/d85d2022-dcd4-4fd7-9c51-5d399502dd76`

**Response (Code 200)**:

```json
{
  "data": {
    "id": "d85d2022-dcd4-4fd7-9c51-5d399502dd76",
    "createdAt": "2026-08-27T14:24:54.715Z",
    "updatedAt": "2026-08-27T14:24:54.715Z",
    "deletedAt": null,
    "supplierId": "64fe3b50-6261-44a7-834a-517dff2d20ea",
    "method": "bank",
    "currency": "VND",
    "details": {
      "email": "user@example.com",
      "bankName": "string",
      "swiftCode": "string",
      "cardHolder": "string",
      "cardNumber": "string",
      "expiryYear": "string",
      "expiryMonth": "string",
      "accountHolder": "string",
      "accountNumber": "string"
    },
    "isDefault": false
  },
  "code": 200,
  "message": "get supplier payment successfully",
  "error": null
}
```

### 4.5. Request / Response Example (`DELETE /supplier-payment/{id}`)

**Request Path**: `DELETE /supplier-payment/0df1ec7e-166e-4209-810a-23156b3b0489`

**Response (Code 200)**:

```json
{
  "data": null,
  "code": 200,
  "error": null,
  "message": "deleted supplier payment successfully"
}
```

### 4.6. Request / Response Example (`PUT /supplier-payment/{id}`)

**Request Path**: `PUT /supplier-payment/d85d2022-dcd4-4fd7-9c51-5d399502dd76`

**Request Body**:

```json
{
  "supplierId": "64fe3b50-6261-44a7-834a-517dff2d20ea",
  "method": "bank",
  "currency": "VND",
  "details": {
    "bankName": "Vietcombank",
    "accountHolder": "CONG TY TNHH WEB TRAVEL",
    "accountNumber": "0071001234567",
    "swiftCode": "BFTVNVVX",
    "cardHolder": "",
    "cardNumber": "",
    "expiryMonth": "",
    "expiryYear": "",
    "email": "user@example.com"
  },
  "isDefault": false
}
```

**Response (Code 200)**:

```json
{
  "data": {
    "id": "d85d2022-dcd4-4fd7-9c51-5d399502dd76",
    "createdAt": "2026-08-27T14:24:54.715Z",
    "updatedAt": "2026-08-27T14:31:53.949Z",
    "deletedAt": null,
    "supplierId": "64fe3b50-6261-44a7-834a-517dff2d20ea",
    "method": "bank",
    "currency": "VND",
    "details": {
      "bankName": "Vietcombank",
      "accountHolder": "CONG TY TNHH WEB TRAVEL",
      "accountNumber": "0071001234567",
      "swiftCode": "BFTVNVVX",
      "cardHolder": "",
      "cardNumber": "",
      "expiryMonth": "",
      "expiryYear": "",
      "email": "user@example.com"
    },
    "isDefault": false
  },
  "code": 200,
  "message": "updated supplier payment successfully",
  "error": null
}
```

---

## 5. Tổ chức Codebase & Component Tree

```
src/
├── api/supplier-payment/
│   ├── types.ts                     # Definitive TypeScript Interfaces
│   ├── requests.ts                  # Axios HTTP Requests (get, create, update, delete)
│   └── queries.ts                   # React Query Kit hooks (useSupplierPaymentList, useCreateSupplierPayment, ...)
├── modules/AdminSupplier/
│   ├── SupplierFormPage/
│   │   └── components/sections/
│   │       ├── payment-info-section.tsx       # Container quản lý danh sách thanh toán ngân hàng
│   │       ├── bank-card-item.tsx             # Card UI hiển thị thông tin ngân hàng
│   │       └── supplier-payment-modal.tsx     # Modal Thêm/Sửa thông tin tài khoản ngân hàng
```

---

## 6. Validation & Xử lý Lỗi (Validation & Error Handling)

1. **Client Validation**:

   - `bankName`: Bắt buộc nhập khi `method = 'bank'`.
   - `accountHolder`: Bắt buộc nhập khi `method = 'bank'`.
   - `accountNumber`: Bắt buộc nhập, chỉ cho phép chữ số và ký tự khoảng trắng/gạch nối.
   - `email`: Nếu điền phải đúng định dạng Email.

2. **Backend Error Handling Integration**:
   - Bóc tách thông báo lỗi từ API backend qua `getApiErrorMessage(err)` để hiển thị Toast alert và báo lỗi theo ô nhập.

---

## 7. Kế hoạch Kiểm thử & Xác minh (Verification Plan)

1. **Tạo tài khoản Ngân hàng mới**: Điền thông tin ngân hàng và gọi `POST /supplier-payment`, kiểm tra thẻ ngân hàng mới xuất hiện trong danh sách.
2. **Thiết lập Mặc định (`isDefault`)**: Đánh dấu tài khoản mặc định và đảm bảo Badge `Mặc định` hiển thị chính xác.
3. **Chỉnh sửa & Xóa**: Kiểm tra cập nhật thông tin thành công và xóa tài khoản ngân hàng với confirm modal.
4. **Copy số tài khoản**: Nút 1-click copy số tài khoản ngân hàng hoạt động mượt mà kèm Toast thông báo.
