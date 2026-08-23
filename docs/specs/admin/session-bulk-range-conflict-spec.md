# Đặc tả Kỹ thuật (BMAD Spec): Tạo Session Hàng Loạt (Bulk Range Session) với Bộ Lọc Thứ & Chiến Lược Xử Lý Ngày Trùng (`duplicateStrategy` & `daysOfWeek`)

**Màn hình áp dụng:** Admin Product Session Sheet / Modal (`CreateSessionRangeModal`, `ProductSessionSheet`)  
**Đối tượng:** Admin / Tour Operator quản lý Lịch & Đơn giá Tour  
**Trạng thái:** Published Standard Spec  
**Tài liệu liên quan:** [spec-admin-session-crud-bmad.md](file:///d:/Remote/web-travel/docs/spec-admin-session-crud-bmad.md)

---

## 1. Business Strategy & Business Rules (BMAD - B)

### 1.1. Bối Cảnh & Mục Tiêu Nghiệp Vụ

- **Tối ưu thao tác quản lý lịch tour (Bulk Schedule Operations):** Khi thiết lập lịch khởi hành cho cả tháng (VD: `01/08/2026` đến `31/08/2026`), tour có thể chỉ chạy vào một số thứ nhất định (VD: Thứ 2, Thứ 4, Thứ 6).
- **Kiểm soát trùng lặp dữ liệu đơn giản & chuẩn hóa 1-to-1 với Backend API:** Trong dải ngày được chọn, nếu có ngày đã tồn tại Session trong DB, Admin chủ động chọn 1 trong 2 chiến lược xử lý cho toàn dải: **`skip` (Bỏ qua ngày trùng)** hoặc **`overwrite` (Ghi đè ngày trùng)**.
- **Mặc định Sức Chứa (Capacity):** Sức chứa mặc định là không giới hạn (`Unlimited`), do đó giao diện **loại bỏ ô nhập Capacity** để tối giản thao tác.

### 1.2. Quy Tắc Nghiệp Vụ Cốt Lõi (Core Business Logic Rules)

1. **Quy tắc Bộ Lọc Thứ Trong Tuần (`daysOfWeek`):**

   - Giá trị số: **`1` đến `7`** tương ứng với **Thứ 2 (1) $\rightarrow$ Chủ Nhật (7)**.
   - **Quy tắc Mặc định & Omit Parameter:**
     - Khi Admin chọn **`All Week`** (hoặc tích đủ 7 ngày từ 1 đến 7), **TUYỆT ĐỐI KHÔNG GỬI** thuộc tính `daysOfWeek` lên Payload API (loại bỏ key `daysOfWeek` khỏi request body).
     - Khi Admin chọn một số thứ cụ thể (VD: Thứ 2, Thứ 4, Thứ 6), gửi mảng: `daysOfWeek: [1, 3, 5]`.

2. **Quy tắc Chiến Lược Xử Lý Trùng Dữ Liệu (`duplicateStrategy`):**
   - Tương thích 1-to-1 với Backend API `POST /session/range`.
   - **`skip` (Bỏ qua ngày trùng - Mặc định an toàn):** Giữ nguyên dữ liệu & đơn giá cũ của các ngày đã có trong DB, chỉ khởi tạo Session mới cho các ngày chưa từng có.
   - **`overwrite` (Ghi đè ngày trùng):** Cập nhật trạng thái và đơn giá mới cho tất cả các ngày trùng trong dải.

---

## 2. Market & User Experience Requirements (BMAD - M)

### 2.1. Tiêu Chí Nghiệm Thu (Acceptance Criteria)

- [x] **Giao diện Modal chuẩn hóa 5 khối chính (Khớp 100% với API Swagger):**
  1. `1. FROM DATE → TO DATE`: Ô chọn ngày bắt đầu & kết thúc.
  2. `2. WEEKDAY FILTER`: Checkbox `All Week` + 7 nút chọn thứ `Mon (1)` đến `Sun (7)`.
  3. `3. DUPLICATE STRATEGY`: 2 Card lựa chọn trực quan `Skip` (Bỏ qua ngày trùng) và `Overwrite` (Ghi đè ngày trùng).
  4. `4. SESSION STATUS`: Trạng thái tour (`Active`/`Inactive`).
  5. `5. UNIT PRICES`: Nhập giá theo từng loại vé (`sessionUnits`).
- [x] **Single API Call Execution:** Nhấp `Apply Range` $\rightarrow$ Đúng 1 request `POST /session/range` duy nhất được gửi đi.

---

## 3. Architecture & Technical Specifications (BMAD - A)

### 3.1. Endpoint Definition

- **HTTP Method:** `POST`
- **Endpoint Path:** `/session/range`
- **Content-Type:** `application/json`

### 3.2. TypeScript Data Model Specs (`src/api/session/types.ts`)

```typescript
export type DuplicateStrategyType = 'skip' | 'overwrite';

export interface SessionUnitPayload {
  unitId: string;
  price: number;
}

export interface CreateSessionRangePayload {
  productId: string;
  fromDate: string; // Định dạng YYYY-MM-DD
  toDate: string; // Định dạng YYYY-MM-DD
  status?: 'active' | 'inactive';
  sessionUnits?: SessionUnitPayload[];
  duplicateStrategy: DuplicateStrategyType; // "skip" | "overwrite"
  daysOfWeek?: number[]; // Mảng các số [1..7]. Omit key này nếu All Week
}
```

### 3.3. Ví Dụ Request Payload Khớp 100% Swagger

#### Trường hợp 1: All Week (Mặc định không gửi `daysOfWeek`) & Strategy = `skip`

```json
{
  "productId": "42b1a09c-6fcb-4826-ba50-dfa24330c4f0",
  "fromDate": "2026-08-01",
  "toDate": "2026-08-05",
  "status": "active",
  "sessionUnits": [
    {
      "unitId": "42b1a09c-6fcb-4826-ba50-dfa24330c4f0",
      "price": 1500000
    }
  ],
  "duplicateStrategy": "skip"
}
```

#### Trường hợp 2: Lọc Thứ 2 (1), Thứ 4 (3), Thứ 6 (5) & Strategy = `overwrite`

```json
{
  "productId": "42b1a09c-6fcb-4826-ba50-dfa24330c4f0",
  "fromDate": "2026-08-01",
  "toDate": "2026-08-05",
  "status": "active",
  "sessionUnits": [
    {
      "unitId": "42b1a09c-6fcb-4826-ba50-dfa24330c4f0",
      "price": 1500000
    }
  ],
  "duplicateStrategy": "overwrite",
  "daysOfWeek": [1, 3, 5]
}
```

---

## 4. Design & UI/UX Specifications (BMAD - D)

### 4.1. Thiết Kế Giao Diện Modal Chuẩn (`CreateDateRangeModal`)

Giao diện trực quan 5 phần, gửi 1 API Call duy nhất:

```
┌────────────────────────────────────────────────────────────────────────────────────────┐
│ 📅 Create Date Range                                                               [✕] │
├────────────────────────────────────────────────────────────────────────────────────────┤
│                                                                                        │
│  1. FROM DATE → TO DATE                                                                │
│     From Date *                               To Date *                                │
│     ┌──────────────────────────────┐          ┌──────────────────────────────┐         │
│     │ 01/08/2026                 📅│          │ 31/08/2026                 📅│         │
│     └──────────────────────────────┘          └──────────────────────────────┘         │
│                                                                                        │
│  2. WEEKDAY FILTER                                                                     │
│     ┌───────────────────────────────────────────────────────────────────────────────┐  │
│     │ [✓] All Week                                                                  │  │
│     │ ┌───────┐ ┌───────┐ ┌───────┐ ┌───────┐ ┌───────┐ ┌───────┐ ┌───────┐         │  │
│     │ │ [✓]Mon│ │ [✓]Tue│ │ [✓]Wed│ │ [✓]Thu│ │ [✓]Fri│ │ [✓]Sat│ │ [✓]Sun│         │  │
│     │ └───────┘ └───────┘ └───────┘ └───────┘ └───────┘ └───────┘ └───────┘         │  │
│     │ 💡 Only dates falling on selected weekdays will be created.                   │  │
│     └───────────────────────────────────────────────────────────────────────────────┘  │
│                                                                                        │
│  3. DUPLICATE STRATEGY (XỬ LÝ NGÀY TRÙNG DỮ LIỆU)                                       │
│     ┌───────────────────────────────────┐ ┌───────────────────────────────────┐  │
│     │ (•) 🛡️ Skip Existing Sessions     │ │ ( ) 🔄 Overwrite Existing Sessions│  │
│     │     Bỏ qua các ngày đã có Session │ │     Cập nhật lại giá & thông tin │  │
│     │     giữ nguyên dữ liệu cũ.        │ │     cho các ngày trùng.           │  │
│     └───────────────────────────────────┘ └───────────────────────────────────┘  │
│                                                                                        │
│  4. SESSION STATUS                                                                     │
│     Status                                                                             │
│     ┌───────────────────────────────────────────────────────────────────────────────┐  │
│     │ Active                                                                      ▼ │  │
│     └───────────────────────────────────────────────────────────────────────────────┘  │
│                                                                                        │
│  5. UNIT PRICES                                                                        │
│     ┌───────────────────────────────────────────────────────────────────────────────┐  │
│     │ Adult Ticket (Người lớn)                [ 1,500,000  đ ]                      │  │
│     │ Child Ticket (Trẻ em)                   [ 1,000,000  đ ]                      │  │
│     └───────────────────────────────────────────────────────────────────────────────┘  │
│     💡 This price applies to all dates in the selected range.                          │
│                                                                                        │
├────────────────────────────────────────────────────────────────────────────────────────┤
│                                                            [ Cancel ]  [ Apply Range ] │
└────────────────────────────────────────────────────────────────────────────────────────┘
```

### 4.2. Mã Thực Thi Chuyển Đổi Payload Đơn Giản & Chính Xác

```typescript
function handleSubmit() {
  if (!isValidRange || targetDates.length === 0) return;

  const isAllWeek = selectedWeekdays.length === 7;
  const sessionUnits = units.map((u) => ({ unitId: u.id, price: prices[u.id] ?? 0 }));

  const payload: CreateSessionRangePayload = {
    productId,
    fromDate: format(fromDate, 'yyyy-MM-dd'),
    toDate: format(toDate, 'yyyy-MM-dd'),
    status,
    duplicateStrategy, // 'skip' | 'overwrite'
    // Chỉ truyền daysOfWeek khi KHÔNG PHẢI All Week
    ...(isAllWeek ? {} : { daysOfWeek: selectedWeekdays.sort((a, b) => a - b) }),
    sessionUnits: sessionUnits.length > 0 ? sessionUnits : undefined,
  };

  // 1 Single API Call
  mutateRange(payload, {
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/session'] });
      onClose();
    },
  });
}
```

---

## 5. Danh Sách Các File Ảnh Hưởng Trong Codebase

| File Path                                                                                                                                                  | Vai Trò & Thay Đổi Cần Thực Hiện                                                                            |
| :--------------------------------------------------------------------------------------------------------------------------------------------------------- | :---------------------------------------------------------------------------------------------------------- |
| [session-bulk-range-conflict-spec.md](file:///d:/Remote/web-travel/docs/specs/admin/session-bulk-range-conflict-spec.md)                                   | Document đặc tả kỹ thuật BMAD chuẩn (File này).                                                             |
| [types.ts](file:///d:/Remote/web-travel/src/api/session/types.ts)                                                                                          | Cập nhật `CreateSessionRangePayload` khớp 100% với Swagger (`duplicateStrategy` & `daysOfWeek?: number[]`). |
| [create-session-range-modal.tsx](file:///d:/Remote/web-travel/src/modules/AdminProduct/ProductFormPage/components/sections/create-session-range-modal.tsx) | Cập nhật UI Modal 5 phần với Duplicate Strategy cards, gọi 1 API `POST /session/range` duy nhất.            |
