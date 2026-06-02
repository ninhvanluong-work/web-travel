# Đặc tả: Bổ sung trường dữ liệu còn thiếu cho Admin Product

## 1. Tổng quan

Dựa trên việc đối chiếu giữa giao diện hiển thị chi tiết sản phẩm (`ProductPage/index.tsx`) và giao diện nhập liệu admin (`AdminProduct/ProductFormPage/index.tsx`), đã phát hiện một số trường dữ liệu (fields) quan trọng đang được hiển thị ở Frontend nhưng chưa có chỗ nhập liệu tương ứng ở trang Admin.

Tài liệu này là đặc tả (spec) liệt kê các trường còn thiếu và đề xuất cách bổ sung chúng vào form admin.

## 2. Chi tiết các trường còn thiếu và Đề xuất bổ sung

### 2.1. Thông tin cơ bản (Basic Info)

- **Mô tả ngắn (Short Description):**

  - **Hiện trạng (Frontend):** Hiển thị ngay dưới tiêu đề sản phẩm (`p.shortDescription`).
  - **Hiện trạng (Admin):** Chỉ có trường `description` (Rich Text) dùng cho nội dung chi tiết.
  - **Đề xuất:** Bổ sung trường `shortDescription` (Textarea, max 500 ký tự) vào tab `Tổng quan` (BasicInfoSection).

- **Thẻ nổi bật (Tags):**
  - **Hiện trạng (Frontend):** Hiển thị các nhãn nổi bật như "Best Seller", "Free Cancellation" (`p.tags`).
  - **Hiện trạng (Admin):** Hoàn toàn chưa có.
  - **Đề xuất:** Bổ sung trường `tags` (Input dạng Select Multiple hoặc Input nhập tag cách nhau bằng dấu phẩy) vào `BasicInfoSection`.

### 2.2. Thông tin nhanh (Quick Facts / Elements)

- **Các thông số hành trình:**
  - **Hiện trạng (Frontend):** Bảng QuickFactsGrid hiển thị các thông tin: Điểm khởi hành (Departure point), Giờ đón (Pickup time / Drop-off), Số lượng khách (Group size), Ngôn ngữ hướng dẫn (Languages), Độ khó (Difficulty).
  - **Hiện trạng (Admin):** Chỉ có trường `duration` và `durationType` (Thời lượng).
  - **Đề xuất:** Tạo một phần mới hoặc bổ sung vào `BasicInfoSection` các trường (có thể ánh xạ vào object `elements` của API):
    - `departurePoint` (Input text)
    - `pickup` và `dropOff` (Input text / Time)
    - `groupSize` (Input text, vd: "Tối đa 10 người")
    - `language` (Select multiple: VI, EN, v.v.)
    - `difficulty` (Select: Dễ, Trung bình, Khó)

### 2.3. Trải nghiệm nổi bật (Experience Highlights)

- **Danh sách trải nghiệm (Experience Cards):**
  - **Hiện trạng (Frontend):** Component `ExperienceCards` hiển thị một danh sách các thẻ trải nghiệm, mỗi thẻ gồm: Hình ảnh (Image), Tiêu đề (Title), Nội dung (Subtitle) lấy từ `p.highlights` (mảng API `experience`).
  - **Hiện trạng (Admin):** Tab `Chi tiết` (DetailsSection) hiện tại chỉ có 1 trường Rich Text tên là `highlight` (thực chất đang map vào `uniqueSellingPoint` ở Frontend). Chưa có nơi nhập danh sách Experience.
  - **Đề xuất:** Tạo một Section mới `Trải nghiệm nổi bật` (hoặc bổ sung vào DetailsSection) sử dụng Field Array. Mỗi item cho phép nhập:
    - `imageUrl` (Upload / Chọn ảnh)
    - `title` (Input text)
    - `content` (Textarea)

### 2.4. Lưu ý trước khi đặt (Before You Book / Read Before)

- **Danh sách chính sách & chuẩn bị:**
  - **Hiện trạng (Frontend):** Component `BeforeYouBook` phân loại các mục như: Giấy tờ (Passport), Cần mang theo (Bring), Không khuyến khích cho (Not recommended), v.v. từ API `readBefore`.
  - **Hiện trạng (Admin):** Hoàn toàn chưa có phần nhập liệu.
  - **Đề xuất:** Bổ sung một Section `Lưu ý & Chính sách`. Dùng Field Array cho phép thêm các mục với:
    - `key` (Select loại: passport, bring, not_recommended, wear, cultural...)
    - `title` (Input text)
    - `description` (Textarea)

### 2.5. Hướng dẫn viên (Tour Guide)

- **Thông tin Guide:**
  - **Hiện trạng (Frontend):** Component `GuideBlock` hiển thị thông tin Hướng dẫn viên (Tên, Avatar, Số năm kinh nghiệm, Đánh giá...).
  - **Hiện trạng (Admin):** Chưa có trường chọn Hướng dẫn viên (Tour guide mapping).
  - **Đề xuất:** Thêm trường `tourGuideIds` (Select multiple, tương tự như chọn Supplier) để gán Hướng dẫn viên cho tour.

### 2.6. Giá cả và Khuyến mãi (Pricing)

- **Giá gốc và Giảm giá:**
  - **Hiện trạng (Frontend):** Thanh `StickyCTABar` hiển thị `originalPrice` (Giá gốc bị gạch ngang), `salePrice` (Giá bán), và `discountPercent` (Phần trăm giảm). Hiện tại Adapter đang hardcode công thức tự tính.
  - **Hiện trạng (Admin):** Trong `OptionsSection` chỉ nhập các giá cố định (`adultPrice`, `childPrice`, `infantPrice`).
  - **Đề xuất:** Bổ sung trường `originalPrice` (Giá gốc/giá niêm yết) vào từng Gói giá (Option) hoặc bổ sung trường `discountPercent` (Áp dụng chung) để Frontend không cần phải hardcode công thức giảm 15%.

### 2.7. Chính sách hoàn hủy (Cancellation Policy)

- **Quy định hủy tour:**
  - **Hiện trạng (Frontend):** Đang hardcode dòng text "Free cancellation up to 24h before" và "Full refund if your plans change".
  - **Hiện trạng (Admin):** Không có cấu hình hoàn hủy.
  - **Đề xuất:** Nếu cần cấu hình linh hoạt cho từng sản phẩm, thêm 2 trường:
    - `isFreeCancellation` (Boolean toggle)
    - `cancellationDeadlineHours` (Number, mặc định 24)

## 3. Tổng kết Checklist các trường cần thêm vào Validation Schema (`product.ts`):

1. `shortDescription`: `z.string().optional()`
2. `tags`: `z.array(z.string()).optional()`
3. `elements`: `z.object({...}).optional()` (departure, pickup, groupSize, language, difficulty)
4. `experiences`: `z.array(z.object({ title, content, imageUrl })).optional()`
5. `readBefores`: `z.array(z.object({ key, title, description })).optional()`
6. `tourGuideIds`: `z.array(z.string()).optional()`
7. (Trong `optionSchema`) `originalPrice`: `z.number().optional()`
8. `isFreeCancellation`: `z.boolean().default(true)`
9. `cancellationDeadlineHours`: `z.number().default(24)`

## 4. Các trường có ở Admin nhưng chưa hiển thị ở Frontend

Ngoài các trường thiếu ở Admin, chiều ngược lại cũng có một số trường dữ liệu Admin cho phép nhập nhưng chưa có UI hiển thị ở trang Chi tiết sản phẩm (`ProductPage`):

### 4.1. Chọn gói giá và đối tượng (Options)

- **Hiện trạng (Admin):** Hỗ trợ tạo nhiều gói giá (`OptionsSection`), mỗi gói có Tiêu đề, Mô tả và giá riêng cho `adultPrice`, `childPrice`, `infantPrice`.
- **Hiện trạng (Frontend):** Thanh `StickyCTABar` chỉ hiện 1 mức giá duy nhất (lấy từ `minPrice`). Chưa có giao diện để người dùng chọn "Gói giá" (Packages) hay nhập số lượng khách theo độ tuổi (Người lớn/Trẻ em).
- **Hướng xử lý (Frontend):** Cần thiết kế thêm modal hoặc bottom sheet chọn Gói giá / Số lượng khách khi người dùng bấm nút "Book now".
- **Hành động tạm thời:** Đã comment out `OptionsSection` trong Admin Form để ẩn đi cho đến khi Frontend làm xong tính năng Packages.

### 4.2. Điểm đến (destinationId)

- **Hiện trạng (Admin):** Có thể chọn Danh mục / Điểm đến (VD: Hà Nội, Đà Nẵng).
- **Hiện trạng (Frontend):** Không hiển thị thông tin này. Thiếu các UI như Breadcrumb (`Trang chủ > Việt Nam > Hà Nội`) hoặc text thẻ địa điểm.
- **Hành động tạm thời:** Đã comment out trường `destinationId` trong `BasicInfoSection` của Admin.

### 4.3. Hình ảnh lộ trình (itineraryImage)

- **Hiện trạng (Admin):** Schema có dự trù trường `itineraryImage` để lưu ảnh bản đồ tuyến đường.
- **Hiện trạng (Frontend):** Component `ItineraryAccordion` chỉ hiển thị text theo từng bước, chưa hiển thị được ảnh bản đồ lộ trình tổng quan.
- **Hành động tạm thời:** Đã comment out phần upload `itineraryImage` trong `ImagesSection` của Admin.

### 4.4. Trạng thái hiển thị (status)

- **Hiện trạng (Admin):** Có trạng thái (Draft, Published, Hidden).
- **Hiện trạng (Frontend):** Ứng dụng client mặc định chỉ load sản phẩm Published, tuy nhiên có thể thiết kế thêm các thẻ Badge nội bộ (Preview) dành cho nhân viên xem trước các tour nháp.
