# Đặc tả: Màn hình Form Sản Phẩm (Admin Product Form)

**Đối tượng:** Nhân viên điều hành (Admin) quản lý dữ liệu Tour/Sản phẩm.
**Mục tiêu thiết kế:** Đảm bảo tải lượng dữ liệu khổng lồ (thông tin cơ bản, lịch trình nhiều ngày, cấu hình giá, media) một cách xuyên suốt, chống mỏi mệt tâm lý và bảo vệ dữ liệu tối đa khỏi các rủi ro hệ thống hoặc thao tác sai.

---

## 1. Cấu trúc Điều hướng: Menu Neo Dính (Scroll-Spy Navigation)

### 1.1. Vấn đề

Form Tour có chiều dài quá tải. Nếu sử dụng chia trang (Wizard), admin mất tự do khi chỉ muốn sửa một trường dữ liệu (ví dụ giá phòng) một cách chớp nhoáng. Nếu sử dụng Tab thuần túy, rất khó quản lý Submit Validation (vì lỗi có thể tiềm ẩn ở Tab đang bị ẩn đi).

### 1.2. Giải pháp

- **Cấu trúc Backend/Form:** Vẫn là một trang dài (Single-page Form), một nút Submit dùng chung.
- **Trải nghiệm Frontend:** Bên trái màn hình là một Menu điều hướng (Sticky Sidebar).
  - Khi người dùng cuộn lăn chuột tới phần nào (VD: `Lịch Trình`), nút `Lịch Trình` trên menu sẽ Highlight (Sáng lên).
  - Khi kéo một đoạn dài, nếu bấm vào `Giá Cả`, màn hình sẽ cuộn mượt (Smooth Scroll) thẳng tới Block `Giá Cả`.
- **Lợi ích:** Trực quan mọi lỗi Validation màu đỏ sờ sờ trên một trục dọc, không giấu giếm. Thao tác siêu tốc.

---

## 2. Toàn vẹn Dữ liệu: Auto-Draft Cục bộ & Nút Lưu Nguyên Thủy

### 2.1. Vấn đề (Save Paranoia)

Nhân viên nhập một đoạn mô tả cực chi tiết dài 500 chữ cho "Lịch trình Ngày 1". Đột nhiên lỡ tay ấn \`F5\` hoặc mạng rớt, công sức đổ sông đổ biển. Phản xạ là bấm nút "Lưu" liên tục, nhưng nếu bấm Lưu vào DB quá sớm sẽ sinh ra dữ liệu rác không đầy đủ trên màn hình user.

### 2.2. Giải pháp

- **Lưu nháp ngầm (Auto-Save to LocalStorage/IndexedDB):**
  - Hệ thống cứ mỗi 5-10 giây sẽ tự động lưu lại các trường văn bản dài (Rich Text, Lịch trình, Giá) vào bộ nhớ riêng của trình duyệt.
  - Khung giao diện góc phải hiển thị chữ mờ: _"Đã lưu nháp lúc 10:45 AM"_.
- **Hệ thống phục hồi:**
  - Nếu load lại trang đột ngột, hệ thống check LocalStorage và hiện Popup thông báo: _"Bạn có một bản nháp chưa thao tác xong. Bạn có muốn phục hồi không?"_.
- **Submit Nguyên thủy (Single Source of Truth):**
  - Nút **[Lưu & Xuất bản]** màu xanh lá vẫn duy trì chức năng bắn API duy nhất để lưu vào Database. Hành vi truyền thống nhưng an toàn tuyệt đối cho kiến trúc Server.

---

## 3. Hệ thống Cập Nhật Media (Kéo-Thả Chống Lỗi)

### 3.1. Vấn đề

Mỗi Tour cần lên tới 20 hình. Giao diện upload hay bị cấn, chọn nhầm hình chính (Thumbnail), hoặc tải lỗi ngầm không biết hình nào lỗi. Thay đổi vị trí xuất hiện của hình rất khó khăn.

### 3.2. Giải pháp: Kéo Thả Trực Quan + Bọc lót rủi ro

- **Dropzone (Vùng kéo thả lớn):** Kéo thả cùng lúc nhiều ảnh. Upload sẽ chạy bất đồng bộ ngầm dưới nền.
- **Thẻ ảnh (Image Cards) & Sắp xếp:**
  - Hình tải xong (hoặc đang tải) hiện dưới dạng lưới danh sách Thẻ bài.
  - Admin **bấm giữ và kéo thả** (Drag-and-Drop) linh hoạt để sửa lại vị trí xuất hiện của ảnh. Hình nào kéo lên Cột số 1 sẽ được bọc viền vàng và có nhãn **[Ảnh Đại Diện]**.
- **Chống lỗi thao tác (Fallback):**
  - Vì kéo thả kém thân thiện cho thiết bị cảm ứng hoặc người không dùng chuột, mỗi thẻ bài có Nút Menu dọc (3 chấm `⋮`) chứa lệnh: _Chuyển lên đầu, Chuyển qua trái, Chuyển qua phải, Xóa, Bật/tắt trạng thái_.
- **Xử lý đứt gãy mạng (Error Handling):**
  - Thay vì báo lỗi chung chung (Mất 1 tấm không rõ tấm nào), phần tử thẻ ảnh bị lỗi sẽ nháy viền Đỏ tươi + nút \`[Tải Lại Tấm Này]\` riêng biệt. Không ảnh hưởng tiến trình tải các thẻ khác.

---

## 4. Trình Dựng Lịch Trình (Itinerary Builder)

### 4.1. Vấn đề

Dữ liệu schema của Lịch trình bao gồm nhiều ngày, mỗi ngày có `name`, `featuredName`, `order`, và một đoạn `description` (thường rất dài). Nếu dàn trải tất cả các ngày ra màn hình, form sẽ trở nên vô vàn cuộn dọc, gây rối loạn thị giác và khó kiểm soát. Việc đổi chỗ Ngày 2 cho Ngày 3 thông thường bắt buộc copy & paste từng ô cực kỳ thủ công.

### 4.2. Giải pháp: Khối Accordion xếp chồng & Drag-to-Reorder

- **Giao diện Accordion (Gấp gọn):**
  - Danh sách các ngày hiển thị theo dạng các dải thẻ (như các thanh ngang).
  - Mặc định chỉ mở rộng màn hình soạn thảo của **Ngày đầu tiên** (hoặc ngày vừa bấm thêm mới), tất cả các ngày khác ở trạng thái thu gọn chỉ hiện Tiêu đề (`name`) và Nút chỉnh sửa.
- **Tương tác Kéo-Thả (Reorder):**
  - Có thanh nắm (Drag handle) ở sát lề mỗi khối Ngày. Khi kéo thả thay đổi vị trí, trường dữ liệu tuần tự `order` sẽ tự động nhảy số theo vị trí mới mà không cần gõ tay.
- **Tiện ích Nhân bản nội dung:**
  - Nút **[Nhân bản]** kế bên mỗi Ngày để sao chép nguyên trạng ngày đó xuống dưới (rất hữu dụng cho lịch trình lặp lại như nghỉ dưỡng tự do tại Resort).

---

## 5. Ma Trận Giá & Gói Bán (Pricing Options/Matrix)

### 5.1. Vấn đề

Mỗi Sản phẩm có thể có nhiều lựa chọn (Gói Options), mỗi lựa chọn cần khai báo: `title` (Tên gói), `adultPrice` (Giá người lớn), `childPrice` (Trẻ em), `infantPrice` (Em bé). Nhập 20 con số vào các Form Field truyền thống là một cực hình đối với dòng thao tác (flow) của tay và mắt, dễ gây lệch dòng, rớt số `0`.

### 5.2. Giải pháp: Grid Spreadsheets (Giả lập Bảng tính Excel)

Tận dụng thói quen của dân điều hành tour, biến danh sách nhập giá thành một bảng Grid.

- **Thao tác Bàn phím nhanh (Keyboard Navigation):**
  - Giao diện thiết kế theo dạng Table. Gõ giá ở ô `Người Lớn`, bấm `Tab` hoặc `Arrow Right` (Phím mũi tên) để nhảy ngay sang ô `Trẻ Em` bên cạnh mà không cần click chuột.
- **Công cụ Hàng loạt (Bulk Actions):**
  - **Duplicate Row:** Cho phép nhân bản nhanh một gói giá đã có (VD: nhân bản gói "3 Sao" thành "4 Sao" rồi chỉ cần sửa lại số giá, giữ nguyên tên).
  - **Currency Lock:** Trường `currency` (tiền tệ) thường đồng nhất cho cả tour. Sẽ thiết kế 1 nút Toggle "Áp dụng tiền tệ này cho tất cả các gói" để admin không phải lặp lại thao tác chọn VND/USD ở mỗi dòng.
- **Hiển thị số liệu (Num formatting):** Input tự động format dấu phẩy ngay khi gõ `10,000,000` để chống lỗi nhập dư/thiếu số 0.
