# Đặc tả: Màn Hình Danh Sách Booking (Admin Booking List)

**Khách hàng mục tiêu:** Nhân viên vận hành (Operator/Admin) cần giám sát, tra cứu, xử lý đơn đặt tour và điều hành đoàn khách hằng ngày.
**Mục tiêu thiết kế:** Giảm thiểu số vòng click chuột (click fatigue), cung cấp dữ liệu tức thời (live filtering), xử lý tác vụ nhanh (Quick Contact Zalo/WhatsApp, Đổi trạng thái trực tiếp), và tránh sai sót khi điều hành tour.

---

## 1. Trải Nghiệm Bộ Lọc Trực Tiếp (Live Filtering)

### 1.1. Giải pháp UX

Xóa bỏ nút bấm thủ công **[Tìm Kiếm]**. Form bộ lọc sẽ kết dính chặt chẽ với Bảng dữ liệu phía dưới:

- **Text Search (Từ khóa `keyword`):** Tìm kiếm theo Mã booking (`bookingCode`), Tên khách (`username`), Email (`email`), Số điện thoại (`phone`). Áp dụng kỹ thuật `Debounce` 300ms. Gõ xong ngừng tay là danh sách dưới bảng tự tải theo chữ vừa gõ.
- **Dropdown Lọc Trạng Thái (`status`):** Chọn item nào (`paid`, `pending`, `cancel`), bảng tự lẩy (fetch) mục đó tức thì.
- **Combobox Lookup (Nhà CC `supplierId`, Sản phẩm `productId`):** Tích hợp ô gõ lọc động theo tên Nhà cung cấp (`GET /supplier`) và Tên Tour (`GET /product`).
- **Tối giản:** Chỉ giữ lại dòng chữ nhỏ (Link button) `[Xóa bộ lọc]` khi đang áp dụng một trong các trường, để clear nhanh về mặc định.

### 1.2. Đánh giá Rủi ro (Failure Analysis)

- 🔴 **Rủi ro Dội bom API (DDoS/Spam):** Nếu không cấu hình Debounce hoặc bắt phím `onChange` quá nhạy trong ô từ khóa, mỗi nhịp phím gõ xuống sẽ quất 1 lệnh lên Server.
- 🔴 **Rủi ro Mù chữ (Flash & Blank State):** Khi data mới đang tải về, nếu Bảng bị reset trống trơn rồi mới ùa data ra sẽ gây chớp giật cực lóa mắt.
- ✅ **Chốt bọc lót:** Dùng React Query với cờ `keepPreviousData: true`. Khi đang loading, Bảng chỉ Mờ xuống nửa (opacity: 0.6) và xoay icon Spinner nhẹ ở header bảng, dữ liệu cũ vẫn hiện, đến khi data mới về thì thay thế nhẹ nhàng.

---

## 2. Cấu Trúc Khối Thời Gian Khởi Hành (Departure Date Range Filter)

### 2.1. Giải pháp UX

Dỡ bỏ 2 ô input cục mịch `[Từ ngày] - [Đến ngày]`.

- Gộp lại làm một nút bấm Dropdown tên là 🗓️ **[Ngày khởi hành ▼]**.
- Pop-up mở ra một bộ Bảng Lịch Đôi chuẩn mực (như AirBnb), bên trái đính kèm các tuỳ chọn tiện lợi: _Hôm nay, 7 ngày tới, Tháng này, Tất cả_. Không bắt Admin gõ/nhặt từng ngày nếu họ chỉ có nhu cầu "Xem các đoàn khởi hành tuần này".

### 2.2. Đánh giá Rủi ro (Failure Analysis)

- 🔴 **Rủi ro Vỡ Layout (Z-Index):** Popover Lịch bị rớt style hiển thị hoặc bị component Bảng (Table) phía dưới nuốt mất hình (z-index clipping).
- 🔴 **Rủi ro Lệch múi giờ (Timezone Bug):** Khách chọn 07/08/2026, nhưng backend hiểu là UTC dẫn đến lệch thành 06/08/2026. Lọc không bao giờ ra data booking ngày hôm đó.
- ✅ **Chốt bọc lót:** Sử dụng tính năng `Portal` ép cục HTML Lịch nổi thẳng ra tầng body của trình duyệt để thoát khỏi bẫy CSS z-index. Trước khi gởi Request lọc đi, chốt cứng chuẩn format `fromDate` bắt đầu từ `00:00:00.000Z` và `toDate` kết thúc ở `23:59:59.999Z` ISOString theo múi giờ cục bộ.

---

## 3. Quản Trị Cột "Hành Động" & Trạng Thái (Actionable Booking Table)

### 3.1. Vấn đề của Bảng Booking Truyền Thống

- **Rủi ro Trầm Mặc (Low Affordance):** Trạng thái đơn hàng chỉ là dòng chữ tĩnh (Static Text), muốn đổi từ `pending` sang `paid` hay `cancel` phải bấm chui sâu vào màn hình xem chi tiết.
- **Không Nhận Diện Đơn Vị Tiền Tệ (Currency Mixed):** Bảng hiển thị lẫn lộn VND và USD làm Admin dễ nhìn nhầm con số `$100` thành `100 VND`.
- **Rủi ro Bấm Nhầm Xóa/Hủy:** Đặt nút Hủy đơn sát rạt nút Xem chi tiết mà không có bước xác nhận bảo vệ.

### 3.2. Giải pháp UX Chuẩn Mực

- **Badge Dropdown cho Trạng Thái Booking:** Biến dòng chữ trạng thái thành một cái thẻ (Badge) bấm được. Khi bấm vào Badge, nó xổ xuống menu cho phép đổi trực tiếp: `Đã thanh toán` (Badge Xanh Emerald), `Chờ xử lý` (Badge Vàng Hổ Phách), `Đã hủy` (Badge Đỏ Báo Động).
- **Trực Quan Hóa Chi Tiết Vé (Passengers Breakdown):** Cột Chi tiết vé hiển thị tóm tắt gọn (`2 Người lớn`, `1 Trẻ em`). Di chuột (hover) vào sẽ mở Tooltip kính mờ hiện chi tiết giá từng loại vé (`Adult: 2 x 10,000 VND`, `Children: 1 x 5,000 VND`).
- **Phân Loại Tiền Tệ Rõ Ràng:** Tổng tiền in đậm kèm đơn vị tiền tệ chuẩn (`20,000,000 VND` hoặc `$150.00 USD`).
- **Clickable Code & Customer:** Biến Mã Booking (`BKMSJ3QYCA3F0F1C`) và Tên Tour thành đường link nhấp thẳng vào Slide-over Drawer xem Hóa đơn / Trang Form Tour.

### 3.3. Đánh giá Rủi ro Nâng cao

- 🔴 **Rủi ro "Sảy tay" ấn nhầm Hủy đơn:** Đổi trạng thái sang `cancel` nhầm có thể ảnh hưởng đến lịch giữ chỗ của khách.
- ✅ **Chốt bọc lót Tầng 2:** Khi bấm chọn `cancel` từ Dropdown trạng thái ngoài Bảng, văng Modal xác nhận màu đỏ: _"Bạn có chắc chắn muốn hủy đơn booking này không? Hành động này sẽ cập nhật lại trạng thái giữ chỗ."_ cùng ô nhập lý do hủy (nếu cần).

---

## 4. Tương Tác Trực Tiếp Khách Hàng (Quick Contact Zalo / WhatsApp)

### 4.1. Giải pháp UX

Thay vì Admin phải copy số điện thoại khách hàng, mở app Zalo/WhatsApp rồi paste tìm kiếm thủ công:

- **1-Click Direct Chat Icon:** Cạnh Số điện thoại & Tên khách hàng ở cột **Khách Hàng**, hiển thị icon badge của các app liên lạc (`messengerApp` từ API trả về như WhatsApp, Zalo).
- **Auto-Fill Message Link:** Click vào icon Zalo sẽ tự động mở link `https://zalo.me/<phone>`. Click vào WhatsApp sẽ tự động mở `https://wa.me/<phone>?text=Xin%20chao...` kèm câu chào mẫu xác nhận booking.

### 4.2. Đánh giá Rủi ro (Failure Analysis)

- 🔴 **Rủi ro Dữ liệu Rỗng (Null / Empty Array Bug):** Dữ liệu `messengerApp` trả về mảng rỗng `[]` hoặc `userId` là `null` (khách vãng lai) gây crash giao diện khi render `.map()`.
- ✅ **Chốt bọc lót:** Kiểm tra safe-navigation `messengerApp?.length > 0` trước khi map icon. Nếu không có app tin nhắn, hiển thị badge `Khách vãng lai` (Guest) và icon copy số điện thoại nhanh.

---

## 5. Xuất Tờ Khai Điều Hành (Departure Manifest Export)

### 5.1. Giải pháp UX

Cung cấp nút **[Xuất Manifest 📄]** ở góc phải trên thanh bộ lọc:

- Cho phép xuất danh sách hành khách đi tour theo ngày lọc hoặc theo từng Tour cụ thể ra định dạng **PDF / Excel** tiêu chuẩn để giao cho Tour Guide đi thực địa.
- File xuất bao gồm: Tên đoàn, Danh sách từng hành khách, Số điện thoại, Điểm đón chính xác (`pickupLocationName`), Giờ xuất phát (`departureTime`), Gói tour (`optionName`), và Ghi chú liên lạc.

### 5.2. Đánh giá Rủi ro (Failure Analysis)

- 🔴 **Rủi ro Xuất Trắng (Empty Export):** Admin bấm Xuất Manifest khi bộ lọc đang trả về 0 kết quả dẫn đến tạo file rỗng.
- ✅ **Chốt bọc lót:** Disable nút `[Xuất Manifest]` khi danh sách booking rỗng (`items.length === 0`) kèm Tooltip: _"Không có dữ liệu booking để xuất tờ khai"_.

---

## 6. Kiến Trúc Kỹ Thuật & Integration Specs

### 6.1. Interface Data Types (`src/api/booking/types.ts`)

```ts
export interface IBookingPassengerItem {
  count: number;
  price: number;
  unitId: string;
  unitName: string;
}

export interface IBookingMessengerApp {
  name: string; // e.g. "WhatsApp", "Zalo"
  username: string;
}

export interface IBookingListItem {
  id: string;
  createdAt: string;
  updatedAt: string;
  deletedAt: string | null;
  travelDate: string;
  bookingCode: string;
  optionId: string;
  optionName: string;
  tourSessionId: string;
  pickupLocationId: string | null;
  pickupLocationName: string;
  departureId: string;
  departureTime: string;
  departureLabel: string;
  passengers: IBookingPassengerItem[];
  totalPrice: string;
  currency: string; // "VND" | "USD"
  productName: string;
  status: 'paid' | 'pending' | 'cancel' | string;
  email: string;
  phone: string;
  username: string;
  messengerApp: IBookingMessengerApp[];
  userId: string | null;
  productId: string;
  supplierId: string;
  supplierName: string;
}

export interface IBookingPagination {
  page: number;
  pageSize: number;
  total: number;
  totalPages: number;
}

export interface IBookingStatItem {
  count: number;
  totalPrice: number;
}

export interface IBookingStats {
  pending: IBookingStatItem;
  paid: IBookingStatItem;
  cancel: IBookingStatItem;
  total: IBookingStatItem;
}

export interface IBookingQueryParams {
  page?: number; // Default: 1
  pageSize?: number; // Default: 10
  keyword?: string; // Tìm theo bookingCode, username, email, phone
  status?: 'paid' | 'pending' | 'cancel' | string;
  supplierId?: string; // UUID nhà cung cấp
  productId?: string; // UUID sản phẩm tour
  fromDate?: string; // ISO 8601 (YYYY-MM-DD)
  toDate?: string; // ISO 8601 (YYYY-MM-DD)
}

export interface IBookingListResponse {
  data: {
    items: IBookingListItem[];
    pagination: IBookingPagination;
    stats?: IBookingStats;
  };
  code: number;
  message: string;
  error: string | null;
}
```

### 6.2. Mapping Cấu Trúc File Triển Khai Codebase

| Loại Thay Đổi | Đường Dẫn File                                                          | Vai Trò & Trách Nhiệm                                                                |
| ------------- | ----------------------------------------------------------------------- | ------------------------------------------------------------------------------------ |
| **[MODIFY]**  | [types.ts](file:///d:/Remote/web-travel/src/api/booking/types.ts)       | Định nghĩa đầy đủ `IBookingListItem`, `IBookingQueryParams`, `IBookingListResponse`. |
| **[MODIFY]**  | [requests.ts](file:///d:/Remote/web-travel/src/api/booking/requests.ts) | Thêm API calls `getBookingList(params)` & `updateBookingStatus(id, status)`.         |
| **[MODIFY]**  | [queries.ts](file:///d:/Remote/web-travel/src/api/booking/queries.ts)   | Khai báo React Query hooks `useBookingList` và `useUpdateBookingStatus`.             |
| **[NEW]**     | `src/pages/admin/bookings/index.tsx`                                    | Route Next.js `/admin/bookings`.                                                     |
| **[NEW]**     | `src/modules/AdminBooking/BookingListPage.tsx`                          | Master view kết nối Layout, Header KPI, Toolbar và Table.                            |
| **[NEW]**     | `src/modules/AdminBooking/components/BookingKpiCards.tsx`               | 4 Thẻ KPI thống kê.                                                                  |
| **[NEW]**     | `src/modules/AdminBooking/components/BookingFilterToolbar.tsx`          | Thanh công cụ bộ lọc.                                                                |
| **[NEW]**     | `src/modules/AdminBooking/components/BookingDataTable.tsx`              | Bảng dữ liệu tương tác.                                                              |
| **[NEW]**     | `src/modules/AdminBooking/components/BookingDetailDrawer.tsx`           | Drawer xem chi tiết kiểu Invoice.                                                    |
| **[NEW]**     | `src/modules/AdminBooking/components/ExportManifestModal.tsx`           | Modal xuất tờ khai điều hành tour cho Tour Guide.                                    |
| **[MODIFY]**  | `src/components/layouts/AdminLayout/Sidebar.tsx`                        | Bổ sung menu item **"Quản lý Booking"**.                                             |
