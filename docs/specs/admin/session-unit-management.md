---
title: 'Quản lý Đơn vị vé (Units) linh hoạt theo từng Session'
created: '2026-08-13'
status: 'draft'
domain: 'admin'
related: 'docs/specs/admin/product-form.md'
---

# Spec: Quản lý Đơn vị vé (Units) linh hoạt theo từng Session

## 1. Vấn đề / Mục tiêu

### Hiện trạng

- Mỗi Sản phẩm (Product) có thể cấu hình các Đơn vị vé (Units) mặc định ở cấp Sản phẩm (ví dụ: `Người lớn`, `Trẻ em`, `Em bé`, `Đội ngũ/Hướng dẫn`).
- Khi khởi tạo hoặc chỉnh sửa Session ngày khởi hành, hệ thống mặc định gán và áp dụng **tất cả** các Units này cho mọi Session.
- Trong thực tế kinh doanh tour/dịch vụ:
  - Có những ngày khởi hành cụ thể nhà tổ chức **chỉ mở bán một số loại vé nhất định** (ví dụ: ngày 15/08 chỉ bán vé `Trẻ em`, ngưng bán vé `Người lớn` hoặc ngược lại).
  - Cần khả năng loại bỏ (xóa/tắt áp dụng) một hoặc nhiều Unit khỏi một Session ngày cụ thể mà không làm ảnh hưởng đến cấu hình Unit chung của Sản phẩm hay các Session ngày khác.

### Mục tiêu

- Cho phép Admin **chủ động chọn bật/tắt (Enable/Disable/Remove)** từng loại Unit cho từng Session cụ thể khi:
  1. Tạo Session mới theo ngày đơn lẻ (Create Session Modal).
  2. Tạo hàng loạt Session theo dải ngày (Create Session Range Modal).
  3. Chỉnh sửa Session hiện có (Edit Session Modal).
- Cập nhật hiển thị ở Bảng quản lý Lịch & Giá (**Schedule & Pricing - Session Table**): Phân biệt rõ giữa Unit **"Đã cài giá"**, **"Chưa cài giá (Cảnh báo)"**, và **"Không áp dụng (N/A / Đã xóa khỏi Session)"**.
- Đảm bảo phía Khách hàng (Customer Booking Sheet): Ngày nào tắt Unit nào thì giao diện đặt chỗ ngày đó sẽ không hiển thị/không cho phép khách chọn mua Unit đó.

---

## 2. Hành vi mong muốn (User Stories & Matrix)

### Giao diện Admin (Management Modals & Table)

| Vị trí / Thao tác                                         | Hành vi & Giao diện mong đợi                                                                                                                                                                                                                                                                                                               |
| --------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| **Modal Tạo Session (Đơn lẻ & Dải ngày)**                 | - Mỗi Unit hiển thị kèm **Checkbox / Switch toggle** trạng thái (Mặc định: Checked/Active).<br>- Nếu Admin bỏ check Unit A (ví dụ: `Người lớn`): Ô nhập giá của Unit A bị mờ/khóa.<br>- Khi Submit: Chỉ những Unit được check mới đưa vào payload `sessionUnits`.                                                                          |
| **Modal Sửa Session**                                     | - Đọc danh sách `sessionUnits` của Session.<br>- Unit nào có trong `sessionUnits` -> Checkbox = `Checked`, hiển thị giá.<br>- Unit nào không có -> Checkbox = `Unchecked`. Admin có thể tích chọn lại để bật bán Unit đó cho Session này.                                                                                                  |
| **Bảng Schedule & Pricing (Session Table)**               | **Hiển thị tại từng ô (cell) của cột Unit:**<br>1. _Unit có trong Session & có giá > 0:_ Hiển thị Badge giá (VD: `200.000đ`).<br>2. _Unit có trong Session nhưng giá = 0/thiếu:_ Hiển thị `⚠️ Chưa cài giá`.<br>3. _Unit KHÔNG áp dụng cho Session này:_ Hiển thị Badge mờ `N/A` hoặc `—` (Kèm tooltip "Unit không áp dụng cho ngày này"). |
| **Xóa nhanh Unit trực tiếp từ Bảng (Optional / Phase 2)** | Tại mỗi ô giá trên Bảng Session, khi hover hiển thị nút icon `Trash / Eye-Off` nhỏ để xóa nhanh Unit khỏi Session đó mà không cần mở Modal Edit.                                                                                                                                                                                           |

### Giao diện Khách hàng (Booking Sheet)

| Kịch bản                                                                       | Trạng thái hiển thị cho Khách                                                                                                                                                                          |
| ------------------------------------------------------------------------------ | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| Session ngày X có Unit `Children` (Active) và Unit `Adult` (Disabled/Excluded) | Khi khách chọn xem/đặt tour ngày X:<br>- Danh sách chọn số lượng vé **chỉ hiển thị `Trẻ em`**.<br>- Unit `Người lớn` hoàn toàn không xuất hiện (hoặc hiển thị Disabled kèm nhãn "Không bán ngày này"). |

---

## 3. Thay đổi kỹ thuật (Technical Specification)

### 3.1 Data Flow & API Payloads

#### Payload gửi lên Backend (`CreateSessionPayload`, `UpdateSessionPayload`):

Chỉ gửi các Unit mà Admin chọn kích hoạt cho Session đó.

```typescript
// Ví dụ: Sản phẩm có 2 unit (adult-id, child-id), nhưng ngày này chỉ bán child-id
{
  productId: "prod-123",
  travelDate: "2026-08-15",
  status: "active",
  capacity: 0,
  sessionUnits: [
    { unitId: "child-id", price: 150000 }
    // adult-id bị bỏ qua (không đưa vào array)
  ]
}
```

_Lưu ý backend:_ Khi `PUT /session/{id}` nhận danh sách `sessionUnits` mới, Backend sẽ đồng bộ (nếu Unit không có trong payload thì xóa/soft-delete `SessionUnit` tương ứng của Session đó).

### 3.2 File Changes & Component Updates

| File Path                                                                                                                                                  | Nội dung thay đổi                                                                                                                                                                                                      |
| ---------------------------------------------------------------------------------------------------------------------------------------------------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| [create-session-modal.tsx](file:///d:/Remote/web-travel/src/modules/AdminProduct/ProductFormPage/components/sections/create-session-modal.tsx)             | - Thêm state `enabledUnits: Record<string, boolean>`.<br>- Hiển thị Checkbox/Switch cạnh từng Unit.<br>- Lọc `sessionUnits` khi mutate chỉ lấy unit được check.                                                        |
| [create-session-range-modal.tsx](file:///d:/Remote/web-travel/src/modules/AdminProduct/ProductFormPage/components/sections/create-session-range-modal.tsx) | - Tương tự Modal tạo đơn lẻ, cho phép chọn danh sách Unit áp dụng cho cả dải ngày.                                                                                                                                     |
| [edit-session-modal.tsx](file:///d:/Remote/web-travel/src/modules/AdminProduct/ProductFormPage/components/sections/edit-session-modal.tsx)                 | - Khởi tạo `enabledUnits` dựa trên `session.sessionUnits`.<br>- Cho phép Admin bật lại Unit đã xóa hoặc tắt bớt Unit đang có.                                                                                          |
| [session-table.tsx](file:///d:/Remote/web-travel/src/modules/AdminProduct/ProductFormPage/components/sections/session-table.tsx)                           | - Cập nhật logic render cell:<br> - Nếu `!matchedSu`: Render Badge `N/A` (text-slate-400 bg-slate-100) thay vì nút warning `⚠️ Chưa cài giá`.<br> - Thêm visual distinction rõ ràng giữa "Tắt bán" và "Quên nhập giá". |
| `use-session-pricing.ts`                                                                                                                                   | - Cập nhật logic filter phía Client Booking Form để loại bỏ các Unit không thuộc `session.sessionUnits`.                                                                                                               |

---

## 4. Dependencies & Conflicts

- **Modifies:**
  - `AdminProduct/ProductFormPage/components/sections/session-table.tsx`
  - `AdminProduct/ProductFormPage/components/sections/create-session-modal.tsx`
  - `AdminProduct/ProductFormPage/components/sections/create-session-range-modal.tsx`
  - `AdminProduct/ProductFormPage/components/sections/edit-session-modal.tsx`
- **Must NOT break:**
  - Các Session đã tạo từ trước (vẫn hiển thị bình thường nếu đã có đủ units).
  - Tổng số slot / Capacity của Session.
  - Luồng checkout & tính tổng tiền booking.

---

## 5. Out of Scope

- Sửa đổi cấu hình Unit Template ở cấp Sản phẩm (Product-level Units).
- Cấu hình điều kiện vé phức tạp (ví dụ: "Chỉ bán vé Trẻ em nếu đi kèm Người lớn").

---

## 6. Open Questions / Clarifications

1. **Khi Backend thực hiện Update Session:** API Backend `PUT /session/{id}` đã hỗ trợ ghi đè/xóa các `sessionUnits` không truyền lên chưa, hay Backend yêu cầu truyền flag `isActive: false`?
2. **Hiển thị trên màn hình khách đặt (Customer Booking Sheet):** Ẩn hoàn toàn loại vé bị tắt cho ngày đó hay hiển thị xám dạng "Hết vé / Không áp dụng cho ngày này"? _(Dự kiến đề xuất: Ẩn hoàn toàn để tránh rối giao diện)._
