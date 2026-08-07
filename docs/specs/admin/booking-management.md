---
title: 'Quản lý Booking & Cấu hình Lịch/Giá tour (Admin Booking Management)'
created: '2026-08-05'
status: 'draft'
domain: 'admin'
---

# Spec: Quản lý Booking & Cấu hình Lịch/Giá tour (Admin Booking Management)

## 1. Vấn đề & Mục tiêu (Problem & Goal)

### 1.1. Hiện trạng & Vấn đề

Hiện tại, hệ thống Web Travel đã triển khai luồng đặt tour (Booking Sheet) phía khách hàng, hỗ trợ chọn ngày đi linh hoạt (Session), chọn gói tuỳ chọn (Options/Packages), giờ xuất phát, điểm đón và tính tổng tiền dựa theo giá trị động của Session đó từ API.
Tuy nhiên, phía quản trị (Admin/Operator) chưa có các tính năng tương ứng để:

1. **Thiết lập/Cập nhật cấu hình đặt tour:** Nhập, sửa, xem danh sách Gói dịch vụ (Options), Giờ xuất phát (Departure Times), và Điểm đón (Pickup Locations) gắn với từng sản phẩm.
2. **Quản lý lịch khởi hành (Session Calendar):** Thêm session mới, điều chỉnh giá của từng Unit (Adult, Children,...) theo từng ngày cụ thể, hoặc tạo hàng loạt (Bulk) session cho cả tháng/năm.
3. **Ẩn session/Chặn đặt tour:** Khoá đặt tour (block booking) ở một số ngày lễ, ngày bão hoặc ngày hết chỗ.
4. **Theo dõi đơn đặt tour (Booking List):** Tra cứu, tìm kiếm và lọc danh sách khách hàng đã đặt tour theo tên, sản phẩm (`productId`) và ngày khởi hành (`bookingDate`).

### 1.2. Mục tiêu (Goals)

- Xây dựng giao diện quản trị đẳng cấp (WOW UX), tinh gọn, mượt mà và trực quan hóa toàn bộ lịch trình giá cả (Calendar-based Pricing).
- Tuân thủ các nguyên tắc thiết kế **BMAD** (Business, Market, Architecture, Design) kết hợp với tư duy KISS (Kinh điển và Tối giản), YAGNI (Thực tế), và Sensory Exploration (Animation, màu sắc hài hoá, thao tác phím mượt).

---

## 2. Đặc tả Giao diện & Hành vi (UI/UX Specification)

### 2.1. Phân hệ 1: Thiết lập Thông tin Booking của Tour (Product Booking Config)

Được tích hợp thành các Section mới trong trang chi tiết sản phẩm của Admin (`ProductFormPage`) gồm Gói dịch vụ, Giờ khởi hành và Điểm đón:

#### A. Gói Dịch Vụ (Section: `section-options`)

- **Giao diện:** Thiết kế dạng danh sách Thẻ bài (Card List) thay vì dạng Bảng. Mỗi gói dịch vụ được hiển thị trong một khung thẻ (Card Box) riêng biệt và đẹp mắt.
- **Bố cục trong Thẻ (2 cột song song):**
  - _Cột bên trái:_ Ô nhập **Tên gói dịch vụ (Package name)** (nhãn: "Tên gói").
  - _Cột bên phải:_ Ô nhập lớn **Dịch vụ đi kèm (Include)** (nhãn: "Dịch vụ đi kèm (mỗi dòng một ý)"). Admin nhập các bullet points của gói dưới dạng mỗi dòng một dịch vụ.
  - _Góc trên bên phải:_ Nút công tắc bật tắt **Hoạt động (Active)**, nút **Nhân bản (Clone)** và nút **Xóa (Delete)**.
- **Tự động hóa & Lược bỏ:**
  - **Loại bỏ cột Mặc định (Default):** Không cần thiết lập gói mặc định từ admin, phía khách hàng sẽ tự động chọn gói đầu tiên/duy nhất, hoặc khách hàng chủ động click lựa chọn nếu có nhiều gói.
  - Các trường _Số ngày_ (Days), _Số đêm_ (Nights) và _Thứ tự_ (Order) không hiển thị trên giao diện (chỉ tự động gán ngầm theo index).
- **Hành động:** Nút **[+ Thêm gói dịch vụ]** nằm phía dưới danh sách thẻ.

#### B. Điểm Đón (Pickup Locations) (Section: `section-pickups`)

- **Giao diện:** Thẻ bài (Cards Layout) kèm theo bản đồ preview thu nhỏ (nếu có Goong/Google Map URL).
- **Trường dữ liệu:** _Tên điểm đón_ (Name), _Địa chỉ_ (Address), _Điểm đón phổ biến_ (isPopular - Badge sao vàng toggle), _Bản đồ URL_ (Map URL), _Thứ tự hiển thị_ (Order).
- **Tương tác:** Cho phép kéo thả (Drag-to-reorder) để sắp xếp thứ tự ưu tiên hiển thị tại Booking Sheet của khách hàng.

#### C. Giờ Khởi Hành (Departure Times) (Section: `section-departures`)

- **Giao diện:** Dạng danh sách các Dòng nhập liệu (Row-based list) trực quan, thay vì dạng Tag/Chip bị giới hạn không gian nhập liệu.
- **Trường dữ liệu & Ô nhập trên mỗi dòng:**
  - **Giờ khởi hành (Time):** Ô nhập thời gian có định dạng chuẩn `HH:MM` (hoặc sử dụng input type `time` của trình duyệt) để ngăn chặn việc nhập các giờ không hợp lệ như `44:33`, `33:33`.
  - **Nhãn (Label):** Ô nhập văn bản ngắn (ví dụ: "Khởi hành sáng", "Khởi hành chiều") để phân loại rõ ràng.
  - **Ghi chú (Note):** Ô nhập văn bản (ví dụ: "Hãy đến trước 15 phút") để hiển thị thông tin nhắc nhở cho khách.
  - **Trạng thái hoạt động (Active):** Toggle bật/tắt (hoạt động/không hoạt động).
  - **Hành động:** Nút bấm **Xóa (Delete)** ở cuối dòng để loại bỏ khung giờ đi.
- **Thao tác:** Nút **[+ Thêm giờ khởi hành]** nằm phía dưới danh sách dòng để thêm một dòng trống mới.

---

### 2.2. Phân hệ 2: Quản lý Lịch & Giá cụ thể (Pricing Session Calendar) (Section: `section-calendar`)

Được tích hợp thành Section dưới cùng mang tên **"Lịch khởi hành & Giá bán"**. Giao diện trung tâm là một Bộ lịch tháng (Interactive Month Calendar).

```
   < [Tháng 08, 2026] >               [+ Tạo lịch hàng loạt (Bulk)]
   Mo   Tu   We   Th   Fr   Sa   Su
        1    2    3    4    5    6       <- Ngày 4-6: No Session (Nét đứt, không giá)
   7    8    9   10   11   12   13       <- Ngày 8: Active (Dot Xanh, $150)
  14   15   16   17   18   19   20       <- Ngày 15: Inactive/Blocked (Dot Đỏ, Gạch ngang giá)
  21   22   23   24   25   26   27
  28   29   30   31
```

#### A. Trực quan hóa Bộ lịch (Sensory Calendar)

Mỗi ô ngày trên lịch sẽ hiển thị 3 trạng thái thị giác rõ rệt:

1. **Active (Đang bán - Hoạt động):**
   - Viền trắng mờ hoặc xanh lục nhẹ. Có chấm tròn màu xanh lá (Emerald Green).
   - Hiển thị giá Người lớn mặc định ngay dưới số ngày (VD: `$100`).
2. **Inactive / Blocked (Khoá/Ẩn session):**
   - Nền màu xám nhạt (`bg-slate-50`), giá tiền bị gạch ngang.
   - Có dấu chấm tròn màu đỏ và badge nhỏ `[Khoá]`. Khách hàng không thể chọn ngày này ở màn hình ngoài.
3. **No Session (Chưa tạo lịch):**
   - Ô ngày có đường viền nét đứt màu xám (dashed border). Không có thông tin giá. Không thể đặt.

#### B. Thao tác Ngày đơn lẻ (Single Date Detail Drawer)

Khi click vào một ngày trên Calendar:

- Một Slide-over Panel (Drawer) trượt ra từ bên phải kèm hiệu ứng backdrop blur mờ ảo.
- **Trạng thái Session:**
  - Nếu ngày này chưa có Session: Hiện nút **[+ Khởi tạo lịch cho ngày này]**.
    - Toggle **[Trạng thái nhận khách]**: Bật (Active) / Tắt (Inactive/Blocked).
    - **Cấu hình số chỗ (Capacity):** Mặc định bỏ qua hoặc hiển thị chế độ "Không giới hạn" (unlimited). Việc giới hạn chỗ và khóa tour tự động khi hết chỗ sẽ được tính toán ở giai đoạn sau.
    - Bảng nhập **Giá theo đối tượng (Units Price):**
      - Người lớn (Adult): Ô nhập giá (USD/VND) dựa trên loại tiền tệ của tour.
      - Trẻ em (Children): Ô nhập giá.
      - (Tự động tính gợi ý: Trẻ em = 50% người lớn để Admin tham khảo khi nhập nhanh).
    - Nút **[Lưu cập nhật]** hiển thị spinner mượt mà khi đang gọi API.

#### C. Thao tác Hàng loạt (Bulk Session Creator)

Khi click vào nút **[+ Tạo lịch hàng loạt]** ở góc trên bộ lịch:

- Mở một hộp thoại (Modal) thiết kế dạng popup mờ.
- **Form cấu hình:**
  1. _Khoảng ngày áp dụng:_ Ngày bắt đầu -> Ngày kết thúc (Date range picker).
  2. _Thứ tự các ngày trong tuần:_ Các nút bấm chọn (Mon, Tue, Wed, Thu, Fri, Sat, Sun) hỗ trợ chọn nhanh "Tất cả" hoặc "Chỉ ngày cuối tuần".
  3. _Mẫu giá áp dụng:_ Cho phép chọn nhanh từ danh sách Bảng giá theo mùa (Season Pricing Templates) hoặc nhập tay giá Adult/Child.
  4. _Trạng thái mặc định:_ Mở bán ngay (Active) hoặc Ẩn tạm thời (Inactive).
- **Hành vi API:** Khi bấm **[Xác nhận]**, client sẽ gửi payload lên API Bulk Create. Sau khi tạo xong, tự động làm mới Calendar để hiển thị dữ liệu mới nhất.

#### D. Tính năng nâng cao và Trực quan hóa (Advanced UI Behaviors)

1. **Bảng mẫu giá theo mùa (Pricing Season Templates):** Cho phép Admin định nghĩa trước các mẫu giá (Ví dụ: "Cao điểm hè" - Adult $150, Child $100) để áp dụng nhanh khi tạo session, giảm lỗi gõ nhầm giá.
2. **Xem nhanh Hover Tooltip:** Khi di chuột (hover) vào ngày có Session trên lịch, hiển thị một popup kính mờ (glassmorphism) xem nhanh: tổng số khách đã đặt, tên các đoàn khách sơ lược và Tour Guide phụ trách ngày hôm đó.
3. **Phân bổ Hướng dẫn viên (Guide Allocation):** Tại Drawer chi tiết Session của một ngày, cho phép chọn nhanh Tour Guide phụ trách từ danh sách hướng dẫn viên liên kết với sản phẩm này.
4. **Tự động đóng cổng đặt tour (Auto-Close Gate):** Cơ chế tự động chặn nhận đặt tour của ngày đi khi cách giờ khởi hành một khoảng thời gian cấu hình trước (ví dụ: tự động đóng/khoá đặt trước 12 tiếng).

---

### 2.3. Phân hệ 3: Dashboard Danh sách Đơn đặt tour (Booking List)

Một trang quản trị độc lập tại đường dẫn `/admin/bookings`.

#### A. Bộ lọc & Tìm kiếm tối ưu (Smart Filters)

1. **Tìm kiếm từ khóa (Search):** Nhập tên khách hàng, email hoặc số điện thoại. Tự động tìm kiếm (debounce 400ms).
2. **Lọc theo Sản phẩm (Product Filter):** Ô Combobox hỗ trợ tìm kiếm sản phẩm theo tên. Có nút "Xóa lọc" nhanh.
3. **Lọc theo Ngày khởi hành (Booking Date Filter):** Chọn một ngày cụ thể hoặc khoảng ngày đi (`fromDate` & `toDate`).
4. **Lọc theo Trạng thái (Status Filter):** Lọc theo Đã thanh toán, Chờ xử lý, Đã hủy.

#### B. Bảng hiển thị Đơn hàng (Premium Bookings Table)

Hiển thị danh sách bookings với cấu trúc cột:

- **Mã đơn:** ID rút gọn (ví dụ: `#BK-9A2C`) kèm theo thời gian đặt đơn (createdAt).
- **Khách hàng:** Tên chính, số điện thoại, và icon mạng xã hội liên lạc ưa thích (WhatsApp, Zalo,...).
- **Sản phẩm:** Tên tour/sản phẩm (click vào link sẽ chuyển sang trang chỉnh sửa tour đó).
- **Ngày đi & Khung giờ:** Định dạng ngày rõ ràng (`DD/MM/YYYY`) kèm nhãn giờ khởi hành (ví dụ: `08:00 - Sáng`).
- **Chi tiết vé:** Số lượng khách (ví dụ: `2 Người lớn, 1 Trẻ em`).
- **Tổng tiền:** Định dạng số rõ ràng kèm đơn vị tiền tệ (`$250.00`).
- **Trạng thái:** Badge màu sắc hiện đại (`success` cho Đã thanh toán, `warning` cho Chờ xác nhận, `danger` cho Đã hủy).

#### C. Khung Xem Chi Tiết (Booking Detail Modal)

Khi click vào một dòng trong bảng:

- Hiện popover chi tiết của Booking dưới dạng hoá đơn (Invoice style).
- Cung cấp nút **[Hủy Đơn]** hoặc **[Xác Nhận Thanh Toán]** trực tiếp nếu đơn chưa hoàn tất.
- Hiển thị chi tiết địa chỉ đón khách (kèm nút click mở liên kết bản đồ chỉ đường Goong/Google Map).

#### D. Xuất tờ khai điều hành cho Hướng dẫn viên (Departure Manifest Export)

- Cung cấp nút **[Xuất Manifest]** cho phép xuất danh sách hành khách đi tour trong ngày ra file PDF/Excel với bố cục tối giản, chuyên nghiệp để chuyển giao cho Tour Guide đi thực địa.
- File xuất chứa: Danh sách tên khách, số điện thoại, chi tiết vé (Adult/Child), điểm đón chính xác (địa chỉ, bản đồ), hình thức chat app ưa thích, và các ghi chú đặc biệt từ khách hàng (ăn chay, sức khỏe,...).

#### E. Các tính năng Vận hành Hỗ trợ (Operational Support)

1. **Nút chat nhanh Zalo & WhatsApp:** Kế bên số điện thoại khách hàng trong bảng hoặc Drawer chi tiết, hiển thị các icon chat. Admin chỉ cần click là tự động mở tab nhắn tin trực tiếp (với tin nhắn xác nhận soạn sẵn đối với WhatsApp, hoặc mở chat trực tiếp đối với Zalo qua link `zalo.me`).
2. **Tạo đơn đặt tour thủ công (Manual Booking):** Nút **[+ Tạo đơn thủ công]** tại trang danh sách đơn hàng cho phép Admin tự tay nhập vé cho các khách hàng đặt qua kênh offline (điện thoại, Fanpage, Zalo).

---

## 3. Thay đổi Kỹ thuật (Technical Changes)

### 3.1. Phía API & Service Layer

#### A. Quản lý Lịch Khởi Hành (Session API)

Bổ sung các requests/queries mới cho admin tại `src/api/session`:

- `POST /session`: Khởi tạo single session cho 1 ngày.
- `POST /session/bulk`: Khởi tạo lịch hàng loạt cho dải ngày.
- `PUT /session/:id`: Cập nhật giá các unit, capacity và status.
- `DELETE /session/:id`: Xóa session.

#### B. Quản lý Booking (Booking API)

Bổ sung các requests/queries cho admin tại `src/api/booking`:

- `GET /booking`: Lấy danh sách booking của hệ thống (phân trang, filter theo `productId`, `bookingDate`, `keyword`).
- `PUT /booking/:id/status`: Cập nhật trạng thái booking (Đã xác nhận, Huỷ,...).

#### C. Quản lý Cấu hình Tour (Booking Config API)

Bổ sung các phương thức sửa đổi dữ liệu trực tiếp:

- `POST /option`, `PUT /option/:id`, `DELETE /option/:id` (Quản lý các Gói dịch vụ).
- `POST/PUT/DELETE /pickup-location` (Quản lý điểm đón).
- `POST/PUT/DELETE /departure-time` (Quản lý giờ khởi hành).

---

### 3.2. Cấu trúc Thư mục Files dự kiến thay đổi

| Loại thay đổi | File Path                                                                           | Vai trò                                           |
| ------------- | ----------------------------------------------------------------------------------- | ------------------------------------------------- |
| **[NEW]**     | `src/pages/admin/bookings/index.tsx`                                                | Route trang quản trị danh sách đơn đặt tour       |
| **[NEW]**     | `src/modules/AdminBooking/index.tsx`                                                | Entrypoint module quản lý booking                 |
| **[NEW]**     | `src/modules/AdminBooking/components/booking-filter.tsx`                            | Bộ lọc danh sách booking                          |
| **[NEW]**     | `src/modules/AdminBooking/components/booking-table.tsx`                             | Bảng danh sách booking                            |
| **[NEW]**     | `src/modules/AdminBooking/components/booking-detail-drawer.tsx`                     | Slide-over xem chi tiết đơn đặt tour              |
| **[NEW]**     | `src/modules/AdminProduct/ProductFormPage/components/tabs/BookingConfigTab.tsx`     | Tab quản lý Option, Pickup, Departure             |
| **[NEW]**     | `src/modules/AdminProduct/ProductFormPage/components/tabs/SessionCalendarTab.tsx`   | Tab quản lý lịch khởi hành & giá theo ngày        |
| **[NEW]**     | `src/modules/AdminProduct/ProductFormPage/components/shared/calendar-view.tsx`      | Component bộ lịch tháng tương tác                 |
| **[NEW]**     | `src/modules/AdminProduct/ProductFormPage/components/shared/bulk-session-modal.tsx` | Modal tạo lịch khởi hành hàng loạt                |
| **[MODIFY]**  | `src/components/layouts/AdminLayout/Sidebar.tsx`                                    | Bổ sung mục điều hướng "Đơn đặt tour" (Bookings)  |
| **[MODIFY]**  | `src/modules/AdminProduct/ProductFormPage/index.tsx`                                | Tích hợp hai Tabs mới cho cấu hình Booking & Lịch |
| **[MODIFY]**  | `src/api/session/requests.ts` & `queries.ts`                                        | Bổ sung API Mutations: Create/Update/Delete/Bulk  |
| **[MODIFY]**  | `src/api/booking/requests.ts` & `queries.ts`                                        | Bổ sung API queries lấy danh sách đơn đặt tour    |

---

## 4. Dependencies & Conflicts

- **Depends on:** API Backend phải hoàn tất deploy các endpoints quản trị (`GET /booking`, `POST /session/bulk`, `PUT/DELETE` cho Option/Pickup/Departure).
- **Modifies:** Form state của `ProductFormPage` và luồng lưu nháp (Auto-Save).
- **Must NOT break:** Luồng đặt tour hiện tại của khách hàng ở trang `ProductPage` (Booking Sheet).
- **Conflicts with:** Chưa phát hiện xung đột.

---

## 5. Out of Scope (Không thực hiện trong giai đoạn này)

- Hệ thống hoàn tiền tự động qua cổng thanh toán PayPal khi Admin huỷ đơn. (Hoàn tiền sẽ được xử lý thủ công qua trang quản trị PayPal và cập nhật trạng thái đơn).
- Gửi email tự động cho khách hàng khi thay đổi lịch khởi hành hoặc cập nhật giá.
- Cơ chế tự động tăng giá vào ngày cuối tuần hoặc ngày lễ (Weekend/Holiday Dynamic Markup) – Giá bán sẽ luôn được đặt cố định hoặc điều chỉnh thủ công/bulk bởi Admin mà không có luật tự động phụ thu.
- Kiểm soát giới hạn chỗ và tính toán số chỗ còn lại (Capacity / Slots left calculation) – Giao diện mặc định là đặt chỗ không giới hạn (unlimited bookings). Các chức năng thông tin tỷ lệ lấp đầy (heatmap), cảnh báo sắp đầy (Low Availability Warning), hay điểm danh thực tế của HDV cũng tạm thời nằm ngoài phạm vi này.

---

## 6. Các Câu Hỏi Mở (Open Questions)

> [!IMPORTANT]
>
> 1. Backend hiện tại đã hỗ trợ API `/session/bulk` tạo lịch hàng loạt chưa, hay Frontend phải thực hiện gọi tuần hoàn nhiều API `/session` đơn lẻ?
> 2. Có cần phân quyền (RBAC) để chỉ cho phép tài khoản Admin sửa Lịch/Giá, còn tài khoản Moderator chỉ được xem danh sách Booking không?
