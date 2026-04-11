# Đặc tả: Màn Hình Danh Sách Sản Phẩm (Admin Product List)

**Khách hàng mục tiêu:** Nhân viên admin quản lý hàng trăm/ngàn Tour cần tìm kiếm và thao tác nhanh chóng hằng ngày.
**Mục tiêu thiết kế:** Giảm thiểu số vòng click chuột (click fatigue), cung cấp dữ liệu tức thời và cho phép xử lý lô (batch/quick action) ngay trên bảng mà không cần chui sâu vào form.

---

## 1. Trải Nghiệm Bộ Lọc Trực Tiếp (Live Filtering)

### 1.1. Giải pháp UX

Xóa bỏ nút bấm thủ công **[Tìm Kiếm]**. Form bộ lọc sẽ kết dính chặt chẽ với Bảng dữ liệu phía dưới:

- **Text Search (Từ khóa):** Áp dụng kỹ thuật `Debounce` 300ms. Gõ xong ngừng tay là danh sách dưới bảng tự tải theo chữ vừa gõ.
- **Select box (Nhà CC, Trạng thái):** Chọn mục nào, bảng tự lẩy (fetch) mục đó tức thì.
- **Tối giản:** Chỉ giữ lại dòng chữ nhỏ (Link button) `[Xóa bộ lọc]` khi đang áp dụng một trong các trường, để clear nhanh.

### 1.2. Đánh giá Rủi ro (Failure Analysis)

- 🔴 **Rủi ro Dội bom API (DDoS/Spam):** Nếu không cấu hình Debounce hoặc bắt phím `onChange` quá nhạy, mỗi nhịp phím gõ xuống sẽ quất 1 lệnh lên Server.
- 🔴 **Rủi ro Mù chữ (Flash & Blank State):** Khi data mới đang tải về, nếu Bảng bị reset trống trơn rồi mới ùa data ra sẽ gây chớp giật cực lóa mắt.
- ✅ **Chốt bọc lót:** Dùng thư viện cache (như React Query), bật cờ `keepPreviousData: true`. Khi đang loading, Bảng chỉ Mờ xuống nửa (opacity: 0.6) và xoay icon Spinner nhẹ, dữ liệu cũ vẫn hiện, đến khi data mới về thì thay thế nhẹ nhàng.

---

## 2. Cấu Trúc Khối Thời Gian (Date Picker Overhaul)

### 2.1. Giải pháp UX

Dỡ bỏ 2 ô input cục mịch `[Từ ngày] - [Đến ngày]`.

- Gộp lại làm một nút bấm Dropdown tên là 🗓️ **[Thời gian tạo ▼]**.
- Pop-up mở ra một bộ Bảng Lịch Đôi chuẩn mực (như AirBnb), bên trái đính kèm các tuỳ chọn tiện lợi: _Hôm nay, Kể từ 7 ngày trước, 30 ngày qua_. Không bắt Admin gõ/nhặt từng ngày nếu họ chỉ có nhu cầu "Tìm các tour mới nhất tháng này".

### 2.2. Đánh giá Rủi ro (Failure Analysis)

- 🔴 **Rủi ro Vỡ Layout (Z-Index):** (Thực tế đã xảy ra trên system) Lịch Popover bị rớt style hiển thị thứ S M T W T F S đè chồng lên nhau, hoặc bị component Bảng (Table) phía dưới nuốt mất hình (z-index clipping).
- 🔴 **Rủi ro Lệch múi giờ (Timezone Bug):** Khách chọn 01/01/2026, nhưng backend hiểu là UTC dẫn đến lệch thành 31/12/2025. Lọc không bao giờ ra data.
- ✅ **Chốt bọc lót:** Sử dụng tính năng `Portal` ép cục HTML Lịch nổi thẳng ra tầng body của trình duyệt để thoát khỏi bẫy CSS z-index. Trước khi gởi Request lọc đi, chốt cứng chuẩn format `StartOfDay` (00:00:00) và `EndOfDay` (23:59:59) ISOString theo chuẩn cục bộ.

---

## 3. Quản Trị Cột "Hành Động" & Trạng Thái (Actionable Table)

### 3.1. Vấn đề của Nút Toggle hiện tại

Thiết kế gốc nhồi nhét một nút Công Tắc (Toggle Switch) ở giữa nút Sửa và nút Xóa ở cột cuối cùng mang lại những rủi ro chí mạng:

- **Rủi ro Không gian (Fitts's Law):** Đặt nút chuyển trạng thái sát rạt nút Xóa (thùng rác). Khi thao tác vội, user cực kỳ dễ bấm nhầm Xóa.
- **Rủi ro Dữ liệu (3-states vs 2-states):** Tour có 3 trạng thái (`draft`, `published`, `hidden`), nhưng công tắc (Toggle) vật lý chỉ có 2 trạng thái (On/Off). User không thể biết "Tắt" nghĩa là về Bản nháp hay Ẩn.
- **Thiếu Tương Phản:** Màu sắc nút mờ nhạt (low affordance) khiến nó trông như bị khóa (Disabled).

### 3.2. Giải pháp UX Chuẩn Mực

Tuyệt đối không dùng Toggle cho cột Hành Động. Thay vào đó, "thổi hồn" cho Bảng bằng cách:

- **Badge Dropdown cho Trạng Thái:** Di dời hoàn toàn thao tác đổi trạng thái về thẳng cột **TRẠNG THÁI** ở giữa bảng. Biến dòng chữ tĩnh "Bản nháp" thành một cái thẻ (Badge). Khi bấm vào Badge, nó xổ xuống menu cho phép chọn cụ thể 1 trong 3 trạng thái: `Công khai` (Xanh lá), `Ẩn` (Xám), `Bản nháp` (Vàng).
- **Tối giản Cột Hành Động:** Cột cuối cùng chỉ hiện thị icon ✏️ (Sửa). Nút Xóa mang tính hủy diệt cao nên được giấu vào Menu 3 chấm `⋮` để buộc user phải thực hiện một bước suy nghĩ thao tác.
- **Clickable Text:** Biến Tên Tour thành đường link có thể nhấp thẳng vào Form Chi Tiết. Đừng bắt admin phải rê mắt tìm cái nút cây bút chì nhỏ xíu rụt rè ở tận lề phải.

### 3.3. Đánh giá Rủi ro Nâng cao

- 🔴 **Rủi ro "Sảy tay" ấn nhầm Public:** Đã dỡ bỏ Nút Toggle nhưng nếu thả chuột từ Dropdown nhầm vào "Công khai" khi tour đó vừa được tạo khung (CHƯA CÓ GIÁ, CHƯA CÓ LỊCH TRÌNH), tour vẫn lọt ra Web cho khách thấy.
- ✅ **Chốt bọc lót Tầng 2:**
  - Khi thao tác chuyển `Published` từ Dropdown ngoài Bảng, Server sẽ kiểm tra chéo (Cross-check). Nếu validate rỗng, frontend văng cảnh báo đỏ: _"Tour chưa cấu hình Bảng giá/Lịch trình, không đủ điều kiện Công khai!"_, bắt buộc hoàn thiện form mới cho mở bán.
