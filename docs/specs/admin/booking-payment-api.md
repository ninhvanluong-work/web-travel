# Đặc Tả API & Nghiệp Vụ: Quản Lý Thanh Toán Booking (Booking Payment & Payment Logs)

**Tài liệu đặc tả kỹ thuật & giao diện (API Spec & Implementation Guide)**  
**Áp dụng phương pháp BMAD (Constraint Mapping, Failure Analysis & Auditability)**  
**Ngày cập nhật:** 17/08/2026  
**Phạm vi áp dụng:** Hệ thống Web Travel (Admin Portal & User Booking Status)

---

## 1. Bối Cảnh & Mục Tiêu Nghiệp Vụ (Context & Objectives)

Trong quy trình đặt Tour (Booking Workflow), thanh toán là khâu nhạy cảm nhất. Việc mất dấu vết giao dịch, sai lệch số tiền giữa Cổng thanh toán (VNPay, Stripe, MoMo) với Hệ thống, hoặc thiếu lịch sử audit log dẫn tới rủi ro tranh chấp tài chính và khó khăn khi xử lý sự cố.

### 1.1. Mục Tiêu Cốt Lõi

- **Minh bạch trạng thái:** Cung cấp thông tin tức thời về trạng thái thanh toán của đơn hàng mà User vừa tạo.
- **Truy vết lỗi (Audit Trail & Debugging):** Lưu giữ và truy xuất toàn bộ lịch sử thay đổi trạng thái (`pending` ➔ `succeeded` / `failed`) cùng câu phản hồi nguyên bản (`rawResponse`) từ cổng thanh toán bên thứ 3.
- **Hỗ trợ vận hành (Operator Support):** Cho phép Admin tra cứu nhanh nguyên nhân thất bại (`failureReason`), nguồn phát sinh sự thay đổi (`source`), và lý do đối soát (`reason`).

### 1.2. Ứng Dụng Nguyên Tắc BMAD

- **Constraint Mapping (Bản đồ ràng buộc):** Loại bỏ việc tự suy đoán dữ liệu; mọi sự thay đổi trạng thái phải có log ghi chép thời điểm (`createdAt`) và nguồn phát sinh (`source`).
- **Failure Analysis (Phân tích điểm lỗi):** Chuẩn hóa việc lưu và hiển thị `rawResponse` từ bên thứ 3 để xử lý các trường hợp sai lệch số tiền (`Amount mismatch`), timeout, hoặc callback giả mạo.

---

## 2. Chi Tiết API 1: `GET /booking/{id}/payment`

Lấy danh sách các bản ghi thanh toán (`BookingPayment`) thuộc về một đơn đặt tour cụ thể.

### 2.1. Thông Tin Endpoint

- **HTTP Method:** `GET`
- **Path:** `/booking/{id}/payment`
- **Authentication:** Required (User/Admin Bearer Token)

### 2.2. Tham Số Đầu Vào (Parameters)

| Tên tham số | Kiểu dữ liệu    | Vị trí | Bắt buộc | Mô tả                             |
| :---------- | :-------------- | :----- | :------- | :-------------------------------- |
| `id`        | `string` (UUID) | Path   | **Có**   | ID của đơn đặt tour (`bookingId`) |

### 2.3. Cấu Trúc Phản Hồi Thành Công (Response 200 OK - Example PayPal)

```json
{
  "data": [
    {
      "id": "cb6c575a-de91-4e2c-a710-c78504638d36",
      "createdAt": "2026-08-16T12:51:38.161Z",
      "updatedAt": "2026-08-16T12:51:38.161Z",
      "deletedAt": null,
      "provider": "paypal",
      "providerTxId": null,
      "providerIntentId": "2GS99843YE510554W",
      "price": "20000.00",
      "currency": "USD",
      "status": "pending",
      "failureReason": null,
      "rawResponse": {
        "id": "2GS99843YE510554W",
        "links": [
          {
            "rel": "self",
            "href": "https://api.sandbox.paypal.com/v2/checkout/orders/2GS99843YE510554W",
            "method": "GET"
          },
          {
            "rel": "approve",
            "href": "https://www.sandbox.paypal.com/checkoutnow?token=2GS99843YE510554W",
            "method": "GET"
          },
          {
            "rel": "update",
            "href": "https://api.sandbox.paypal.com/v2/checkout/orders/2GS99843YE510554W",
            "method": "PATCH"
          },
          {
            "rel": "capture",
            "href": "https://api.sandbox.paypal.com/v2/checkout/orders/2GS99843YE510554W/capture",
            "method": "POST"
          }
        ],
        "status": "CREATED"
      },
      "bookingId": "e2df36a4-8ac3-453f-b23e-e4647b333e66"
    }
  ],
  "code": 200,
  "message": "Get booking payments successfully",
  "error": null
}
```

### 2.4. Phân Tích Các Trường Dữ Liệu (Field Specifications)

- `provider`: Tên đơn vị cổng thanh toán (`vnpay`, `stripe`, `momo`, `bank_transfer`, `cash`).
- `providerTxId`: Mã giao dịch từ phía nhà cung cấp cổng thanh toán (`transactionId`).
- `providerIntentId`: Mã phiên/Intent khởi tạo thanh toán từ bên thứ 3 (ví dụ Stripe `payment_intent_id`).
- `price` & `currency`: Giá trị tiền tệ thanh toán và đơn vị (`VND`, `USD`).
- `status`: Trạng thái thanh toán hiện tại (`pending`, `succeeded`, `failed`, `cancelled`, `refunded`).
- `failureReason`: Lý do giao dịch thất bại (nếu có, ví dụ: "Thẻ hết hạn", "Số dư không đủ", "Giao dịch bị hủy bởi người dùng").
- `rawResponse`: Payload JSON nguyên bản nhận về từ Cổng thanh toán tại lượt xử lý gần nhất.

### 2.5. Các Mã Lỗi Thường Gặp (Error Responses)

- **400 Bad Request:** ID booking sai định dạng.
- **404 Not Found:** `Booking not found` (Không tìm thấy đơn đặt tour tương ứng).
- **401 Unauthorized / 403 Forbidden:** Không có quyền truy cập thông tin booking này.

---

## 3. Chi Tiết API 2: `GET /booking-payment/{id}/logs`

Lấy lịch sử thay đổi trạng thái (timeline audit logs) của một khoản thanh toán `bookingPayment`, sắp xếp theo thứ tự thời gian từ cũ đến mới.

### 3.1. Thông Tin Endpoint

- **HTTP Method:** `GET`
- **Path:** `/booking-payment/{id}/logs`
- **Authentication:** Required (Admin/Operator Bearer Token)

### 3.2. Tham Số Đầu Vào (Parameters)

| Tên tham số | Kiểu dữ liệu    | Vị trí | Bắt buộc | Mô tả                                          |
| :---------- | :-------------- | :----- | :------- | :--------------------------------------------- |
| `id`        | `string` (UUID) | Path   | **Có**   | ID của bản ghi thanh toán (`bookingPaymentId`) |

### 3.3. Cấu Trúc Phản Hồi Thành Công (Response 200 OK - Example PayPal Capture Log)

```json
{
  "data": [
    {
      "id": "7fd48844-ad4c-4723-aff0-5a360eb282e9",
      "createdAt": "2026-08-16T12:55:59.339Z",
      "updatedAt": "2026-08-16T12:55:59.339Z",
      "deletedAt": null,
      "bookingPaymentId": "442944ae-6665-48de-a372-d1a6360c192a",
      "bookingId": "a32b8562-59c0-4a93-9583-ea0c98941589",
      "fromStatus": "pending",
      "toStatus": "succeed",
      "provider": "paypal",
      "providerTxId": "8N101006UU313454L",
      "reason": null,
      "rawResponse": {
        "id": "6KA66338RE5420916",
        "links": [
          {
            "rel": "self",
            "href": "https://api.sandbox.paypal.com/v2/checkout/orders/6KA66338RE5420916",
            "method": "GET"
          }
        ],
        "payer": {
          "name": {
            "surname": "Doe",
            "given_name": "John"
          },
          "address": {
            "country_code": "VN"
          },
          "payer_id": "QWAW38YGSRDHW",
          "email_address": "sb-xb9fs52211088@personal.example.com"
        },
        "status": "COMPLETED",
        "payment_source": {
          "paypal": {
            "name": {
              "surname": "Doe",
              "given_name": "John"
            },
            "address": {
              "country_code": "VN"
            },
            "account_id": "QWAW38YGSRDHW",
            "email_address": "sb-xb9fs52211088@personal.example.com",
            "account_status": "VERIFIED"
          }
        },
        "purchase_units": [
          {
            "payments": {
              "captures": [
                {
                  "id": "8N101006UU313454L",
                  "links": [
                    {
                      "rel": "self",
                      "href": "https://api.sandbox.paypal.com/v2/payments/captures/8N101006UU313454L",
                      "method": "GET"
                    },
                    {
                      "rel": "refund",
                      "href": "https://api.sandbox.paypal.com/v2/payments/captures/8N101006UU313454L/refund",
                      "method": "POST"
                    },
                    {
                      "rel": "up",
                      "href": "https://api.sandbox.paypal.com/v2/checkout/orders/6KA66338RE5420916",
                      "method": "GET"
                    }
                  ],
                  "amount": {
                    "value": "20000.00",
                    "currency_code": "USD"
                  },
                  "status": "COMPLETED",
                  "create_time": "2026-08-16T12:55:58Z",
                  "update_time": "2026-08-16T12:55:58Z",
                  "final_capture": true,
                  "seller_protection": {
                    "status": "ELIGIBLE",
                    "dispute_categories": ["ITEM_NOT_RECEIVED", "UNAUTHORIZED_TRANSACTION"]
                  },
                  "seller_receivable_breakdown": {
                    "net_amount": {
                      "value": "19319.70",
                      "currency_code": "USD"
                    },
                    "paypal_fee": {
                      "value": "680.30",
                      "currency_code": "USD"
                    },
                    "gross_amount": {
                      "value": "20000.00",
                      "currency_code": "USD"
                    }
                  }
                }
              ]
            },
            "shipping": {
              "name": {
                "full_name": "John Doe"
              },
              "address": {
                "postal_code": "100000",
                "admin_area_1": "Vietnam",
                "admin_area_2": "Hanoi",
                "country_code": "VN",
                "address_line_1": "Vietnam Main Street"
              }
            },
            "reference_id": "BKMSVT57UUF2914C"
          }
        ]
      },
      "source": "paypal_capture"
    }
  ],
  "code": 200,
  "message": "Get booking payment logs successfully",
  "error": null
}
```

### 3.4. Phân Tích Các Trường Dữ Liệu (Field Specifications)

- `fromStatus` ➔ `toStatus`: Ma trận chuyển đổi trạng thái (ví dụ: `pending` ➔ `succeeded`, `pending` ➔ `failed`).
- `source`: Nguồn kích hoạt sự thay đổi trạng thái (`vnpay_callback`, `stripe_webhook`, `momo_ipn`, `admin_manual_override`, `user_checkout`).
- `reason`: Diễn giải chi tiết lý do chuyển trạng thái hoặc ghi chú đối soát (ví dụ: _"Amount mismatch"_, _"Payment completed via IPN"_, _"Manual approval by Admin Operator"_).
- `rawResponse`: JSON chi tiết gói tin Webhook / Callback nhận từ bên thứ 3 tại thời điểm ghi log.
- `createdAt`: Nhãn thời gian thực hiện chuyển trạng thái (ISO String UTC).

### 3.5. Các Mã Lỗi Thường Gặp (Error Responses)

- **404 Not Found:** `Booking payment not found` (Không tìm thấy thông tin bản ghi thanh toán).

---

## 4. Đặc Tả Thiết Kế Giao Diện & Tích Hợp Frontend (UX/UI Spec for BookingDetailDrawer)

### 4.1. Cấu Trúc Điều Hướng Tab (Header Tab Navigation)

Trong `BookingDetailDrawer.tsx`, chuyển đổi giao diện đơn cột hiện tại thành hệ thống **2 Tabs chuyển đổi linh hoạt**:

- **Tab 1: 📋 Thông tin Booking (Booking Info)**  
  Chứa 3 Section thông tin hiện tại: _Chi tiết Khách hàng_, _Chi tiết Tour_, và _Chi tiết Lịch trình/Vé_.
- **Tab 2: 💳 Thanh toán & Audit Log (Payment & Timeline)**  
  Tải dữ liệu tự động qua API `GET /booking/{id}/payment` và `GET /booking-payment/{paymentId}/logs`. Hiển thị nhãn đếm số bản ghi thanh toán.

---

### 4.2. Chi Tiết Giao Diện Tab 2: Thanh Toán & Audit Log

#### A. Khối Thẻ Tổng Quan Thanh Toán (Active Payment Summary Card)

- **Cổng thanh toán & Provider Badge:** Hiển thị thẻ nhận diện cổng thanh toán (`paypal` - Thẻ Xanh Dương, `vnpay` - Thẻ Xanh Đỏ, `stripe` - Thẻ Tím, `cash` - Thẻ Xám).
- **Badge Trạng Thái Thanh Toán:**
  - `succeed` / `succeeded`: Thẻ Xanh Emerald (`Đã thanh toán thành công`).
  - `pending`: Thẻ Vàng Hổ Phách (`Đang chờ thanh toán / Đang khởi tạo`).
  - `failed`: Thẻ Đỏ Báo Động (`Thanh toán thất bại`).
- **Thông Tin Giao Dịch Chốt:**
  - `Mã giao dịch (TxID)` & `Intent ID`: Hiển thị phông chữ định dạng Code/Mono (`8N101006UU313454L`) đi kèm nút **Copy 1-Touch**.
  - `Số tiền thanh toán`: Định dạng con số lớn, in đậm nổi bật (ví dụ: `$20,000.00 USD` hoặc `20,000,000 VND`).
  - `Lý do thất bại (nếu có)`: Hộp cảnh báo màu đỏ báo lý do `failureReason`.

#### B. Khối Dòng Thời Gian Lịch Sử Audit Log (Timeline Audit Log Component)

Mỗi bản ghi log từ `GET /booking-payment/{id}/logs` được biểu diễn dạng mốc thời gian dọc (Vertical Timeline):

1. **Mốc thời gian (Timestamp):** Định dạng chuẩn `DD/MM/YYYY HH:mm:ss` (`16/08/2026 12:55:59`).
2. **Sự biến động trạng thái (Status Transition):** Hiển thị rõ bước chuyển `pending` ➔ `succeed`.
3. **Nguồn sự kiện (Source Badge):** Thẻ nhỏ phân loại nguồn (`paypal_capture`, `vnpay_callback`, `user_checkout`).
4. **Nút tương tác Payload Raw (`[Raw Response ⚡]`):**
   - Click vào sẽ mở rộng/thu gọn khung **Dark Code Viewer (`bg-slate-950`)**.
   - Hiển thị đẹp mắt gói JSON nguyên bản từ PayPal / VNPay (`payer`, `seller_receivable_breakdown`, `paypal_fee`, `gross_amount`, `shipping`).
   - Tích hợp nút **Copy JSON Raw Payload**.

---

### 4.3. Xử Lý Các Trạng Thái Đặc Biệt (Edge Cases & Fallbacks)

- **Empty State (Chưa có giao dịch):** Nếu API trả về mảng rỗng `[]`, hiển thị giao diện rỗng nhẹ nhàng: _"Chưa có dữ liệu thanh toán khởi tạo cho đơn hàng này"_.
- **Skeleton Loading:** Khi mở Tab 2, hiển thị Skeleton mờ dạng đường dóng dứt khoát tránh chớp giật giao diện.

---

## 5. TypeScript Interfaces & Data Models (`src/api/booking/types.ts`)

```typescript
// ── Domain Types cho Booking Payment ────────────────────────────────────────

export type PaymentProvider = 'paypal' | 'vnpay' | 'stripe' | 'momo' | 'bank_transfer' | 'cash' | string;
export type PaymentStatus = 'pending' | 'succeed' | 'succeeded' | 'failed' | 'cancelled' | 'refunded';

export interface IBookingPayment {
  id: string;
  createdAt: string;
  updatedAt: string;
  deletedAt?: string | null;
  provider: PaymentProvider;
  providerTxId?: string | null;
  providerIntentId?: string | null;
  price: string | number;
  currency: string;
  status: PaymentStatus;
  failureReason?: string | null;
  rawResponse?: Record<string, any> | null;
  bookingId: string;
}

export interface IBookingPaymentLog {
  id: string;
  bookingPaymentId: string;
  bookingId: string;
  fromStatus: PaymentStatus;
  toStatus: PaymentStatus;
  provider: PaymentProvider;
  providerTxId?: string | null;
  reason?: string | null;
  rawResponse?: Record<string, any> | null;
  source: string;
  createdAt: string;
}

// ── API Responses ────────────────────────────────────────────────────────────

export interface ApiBookingPaymentListResponse {
  data: IBookingPayment[];
  code: number;
  error: string | null;
  message: string;
}

export interface ApiBookingPaymentLogsResponse {
  data: IBookingPaymentLog[];
  code: number;
  error: string | null;
  message: string;
}
```

---

## 6. Đánh Giá Rủi Ro & Phương Án Bọc Lót (Failure Analysis & Safety)

| Rủi ro kỹ thuật / nghiệp vụ                | Mức độ        | Phương án bọc lót (Mitigation Strategy)                                                                                                                                 |
| :----------------------------------------- | :------------ | :---------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| **Lộ dữ liệu nhạy cảm (PII / Card Token)** | 🔴 Cao        | Backend phải loại bỏ các trường nhạy cảm (như CVV, full card number) trước khi lưu vào `rawResponse`. Frontend không bao giờ log `rawResponse` ra console ở production. |
| **Lệch múi giờ trong Timeline**            | 🟡 Trung bình | Chuẩn hóa `createdAt` theo định dạng UTC ISO 8601 (`YYYY-MM-DDTHH:mm:ss.sssZ`). Frontend dùng `dayjs` hoặc `date-fns` để format ra giờ địa phương của Admin.            |
| **Raw JSON quá lớn gây vỡ layout UI**      | 🟡 Trung bình | Bọc JSON Viewer trong container có `max-height: 300px` và `overflow-y: auto`, mặc định đóng (collapsed).                                                                |
| **Webhook gửi trùng lặp (Idempotency)**    | 🔴 Cao        | Log ghi nhận `source` và `providerTxId` để tránh ghi đè hoặc trùng lặp log lịch sử.                                                                                     |
