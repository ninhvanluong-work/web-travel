---
title: 'Form Đánh giá Hướng dẫn viên (Guide Rating Form)'
created: '2026-06-10'
status: 'draft'
domain: 'product-page'
---

# Spec: Form Đánh giá Hướng dẫn viên (Guide Rating & Review Form)

## 1. Vấn đề / Mục tiêu

Hiện tại, trang Profile Hướng dẫn viên (Inspirational Guide Profile) đã hiển thị điểm số và ý kiến đánh giá của khách hàng, nhưng chưa có tính năng cho phép khách hàng trực tiếp đánh giá và phản hồi về chuyến đi (tour) với hướng dẫn viên đó.

Mục tiêu của spec này là:

- Thêm nút "Rate me" (Đánh giá) cạnh nút đặt tour hiện tại trên thanh thao tác nhanh (`ActionBar`).
- Khi click vào nút "Rate me", mở một Form/Modal/Bottom Sheet được thiết kế cao cấp (theo phong cách Form Layout hiện tại của hệ thống) để khách hàng gửi phản hồi chi tiết về tour và hướng dẫn viên.
- Cho phép tải lên hình ảnh và video minh họa kèm theo các tiêu chí đánh giá chi tiết cố định.

---

## 2. Hành vi mong muốn (User Flow & UI/UX Behavior)

### 2.1. Nút bấm kích hoạt (Trigger Button)

- **Vị trí:** Đặt trên thanh [action-bar.tsx](file:///d:/Remote/web-travel/src/modules/GuideProfilePage/components/action-bar.tsx), nằm ngay bên cạnh nút "Đặt tour với [Tên]" và trước các nút QR/Share.
- **Thiết kế:**
  - Nút dạng icon (hình Ngôi sao - Star icon) hoặc nút chữ nhỏ có icon đi kèm tùy thuộc kích thước màn hình thiết bị di động.
  - Sử dụng hiệu ứng hover và co giãn khi bấm (`whileTap={{ scale: 0.96 }}`) tương tự các nút khác trong `ActionBar`.
  - Khi click vào nút này, mở lớp phủ Bottom Sheet (trên mobile) hoặc Modal/Dialog (trên desktop/tablet) chứa Form đánh giá.

### 2.2. Giao diện & Cấu trúc Form Đánh Giá (Layout Styling)

Form được xây dựng theo phong cách giao diện tối giản, bo tròn góc, có độ tương phản và phân tách rõ ràng tương tự hình ảnh tham chiếu (Image 2 - Form Layout). Form bao gồm các trường sau:

1. **Tiêu đề Form (Form Header):**

   - Tiêu đề chính: "Đánh giá Hướng dẫn viên"
   - Tiêu đề phụ: "Chia sẻ trải nghiệm của bạn về tour cùng [Tên Hướng Dẫn Viên]"
   - Nút đóng (X) ở góc trên bên phải để tắt form.

2. **Đánh giá tổng quan (Overall Point / Stars):**

   - Đánh giá bằng số sao từ 1 đến 5 (mặc định chưa chọn hoặc chọn 5 sao).
   - Biểu tượng ngôi sao lớn (kích thước khoảng `28px`), đổi màu khi được chọn (màu vàng ấm `#FBBF24` / `text-amber-400`).
   - **Hiệu ứng Vi mô (Micro-animations):** Khi người dùng click chọn số sao, các ngôi sao sẽ có hiệu ứng nảy (elastic scale: `scale: [1, 1.25, 0.95, 1]`) chạy lần lượt từ trái sang phải bằng Framer Motion.
   - **Nhãn cảm xúc động (Dynamic Rating Labels):** Hiển thị nhãn mô tả cảm xúc tương ứng ngay bên dưới ngôi sao dựa trên điểm đã chọn để tăng tính cá nhân hóa:
     - 1 sao: _"Rất không hài lòng"_
     - 2 sao: _"Không hài lòng"_
     - 3 sao: _"Bình thường"_
     - 4 sao: _"Hài lòng"_
     - 5 sao: _"Rất tuyệt vời!"_

3. **Bình luận / Ý kiến khách hàng (Comment):**

   - Một trường nhập văn bản đa dòng (Textarea) có tiêu đề: _"Bạn nghĩ gì về chuyến đi và hướng dẫn viên này?"_
   - Placeholder: _"Chia sẻ trải nghiệm chi tiết của bạn về hành trình..."_
   - Khung viền màu xám nhạt (`border-slate-200`), khi focus sẽ đổi màu xanh thương hiệu (`focus:border-brand-500 focus:ring-1 focus:ring-brand-500`).
   - Bo tròn góc `rounded-lg` hoặc `rounded-[10px]` tương tự form layout.
   - Hiển thị bộ đếm ký tự (ví dụ: `0 / 500` ký tự).

4. **Tiêu chí chi tiết (Ratings Criteria - Collapsible Grid):**

   - Để giữ Form ban đầu ngắn gọn, 7 tiêu chí đánh giá chi tiết sẽ được đặt trong một nhóm thu gọn (Collapsible).
   - Mặc định chỉ hiển thị tiêu đề và nút _"Đánh giá chi tiết (Không bắt buộc) ▾"_. Khi bấm nút, danh sách 7 tiêu chí sẽ trượt xuống mượt mà.
   - Hiển thị danh sách 7 tiêu chí đánh giá cố định dưới dạng lưới 2 cột hoặc danh sách dọc. Mỗi hàng gồm tên tiêu chí bên trái và thanh chấm điểm (5 sao nhỏ hoặc nút chọn thang điểm từ 1-5) bên phải.
   - Các tiêu chí bao gồm:
     - **Storytelling** (Khả năng kể chuyện)
     - **Local knowledge** (Hiểu biết địa phương)
     - **Care & attention** (Sự chu đáo & quan tâm)
     - **Safety awareness** (Ý thức an toàn)
     - **Punctuality** (Sự đúng giờ)
     - **English** (Khả năng tiếng Anh)
     - **funny** (Sự hài hước)
   - Trạng thái mặc định khởi tạo là `0` điểm cho tất cả các tiêu chí. Khi người dùng click chọn điểm từ 1-5, giá trị sẽ được cập nhật.
   - Lưu trữ dữ liệu dạng mảng cố định (fixed array) trong state:
     ```json
     "ratings": [
       { "key": "storytelling", "name": "Storytelling", "value": 0 },
       { "key": "localKnowledge", "name": "Local knowledge", "value": 0 },
       { "key": "careAttention", "name": "Care & attention", "value": 0 },
       { "key": "safetyAwareness", "name": "Safety awareness", "value": 0 },
       { "key": "punctuality", "name": "Punctuality", "value": 0 },
       { "key": "english", "name": "English", "value": 0 },
       { "key": "funny", "name": "funny", "value": 0 }
     ]
     ```

5. **Tải lên Hình ảnh & Video (Unified Media Upload Queue):**

   - Khách hàng có thể tải lên hình ảnh hoặc video minh họa cho bài đánh giá của mình.
   - **Tính bắt buộc:** Việc tải lên là **tùy chọn (Optional)**, khách hàng có thể gửi đánh giá mà không cần đính kèm file.
   - **Giới hạn dung lượng:** Tối đa `10MB` cho mỗi file hình ảnh hoặc video. Nếu vượt quá, hiển thị Toast cảnh báo: _"Dung lượng tệp vượt quá 10MB"_ và hủy tệp đó.
   - **Giới hạn số lượng:** Tổng số lượng tệp tải lên (Hình ảnh + Video) không được vượt quá **5 tệp**. Nếu đã đủ 5 tệp, nút chọn tệp sẽ bị ẩn hoặc vô hiệu hóa.
   - **Giao diện upload:**
     - Thiết kế một **Hộp tải phương tiện hợp nhất (Unified Media Dropzone)** có dạng nét đứt, cho phép click để chọn file hoặc kéo thả tệp ảnh/video trực tiếp.
     - Hiển thị danh sách preview (thumbnail) của các tệp đã chọn dưới dạng lưới nhỏ.
     - Mỗi thumbnail hiển thị overlay trạng thái tải lên:
       - **Đang tải lên (Uploading):** Hiện Spinner hoặc Progress Bar (ví dụ: `25%`, `50%`, `100%`) cùng hiệu ứng mờ.
       - **Thất bại (Error):** Hiển thị viền đỏ và icon chấm than, cho phép nhấn _"Thử lại (Retry)"_.
       - **Thành công (Success):** Hiển thị thumbnail rõ ràng và nút `X` ở góc trên để xóa tệp khỏi hàng đợi.

6. **Nút bấm gửi Đánh giá (Submit Button):**
   - Nút lớn nằm ở cuối form với nhãn: _"Gửi đánh giá"_ (Màu nền xanh đậm / đen theo màu chủ đạo của hệ thống).
   - Vô hiệu hóa (disabled) nút bấm khi:
     - Có tệp đang trong quá trình upload chưa hoàn thành (đảm bảo tính toàn vẹn dữ liệu).
     - Số lượng hình ảnh/video vượt quá 5.
     - Chưa chọn điểm số sao tổng quan.

### 2.3. Trạng thái phản hồi (Responsive Container)

- **Màn hình di động (Mobile Breakpoint):** Hiển thị dưới dạng **Bottom Sheet** (Bottom drawer) trượt nhẹ từ dưới lên chiếm khoảng 85% - 90% chiều cao màn hình. Hỗ trợ thao tác vuốt xuôi để đóng.
- **Màn hình máy tính/máy tính bảng (Tablet & Desktop):** Hiển thị dưới dạng **Center Modal/Dialog** có backdrop mờ và tối nhẹ (`backdrop-blur-sm bg-black/40`).

---

## 3. Thay đổi kỹ thuật (Technical Changes)

### 3.1. Các API tích hợp

- **Tải lên hình ảnh:** Gửi POST `FormData` tới `/upload/img` (sử dụng hàm [uploadImage](file:///d:/Remote/web-travel/src/api/upload/index.ts)).
- **Tải lên video:** Gửi POST tới `${process.env.NEXT_PUBLIC_API_URL}/upload/video` và sử dụng `tus-js-client` để upload chunk mượt mà như luồng upload trong [use-video-upload.ts](file:///d:/Remote/web-travel/src/modules/AdminProduct/ProductFormPage/components/shared/use-video-upload.ts).
- **Gửi dữ liệu đánh giá:** Endpoint đề xuất: `POST /guides/:id/reviews` (hoặc API mock nếu chưa có API thật) gửi payload có cấu trúc:
  ```typescript
  interface GuideReviewPayload {
    comment: string;
    rating: number; // Điểm tổng quát (sao)
    images: string[]; // Danh sách URL ảnh đã upload
    videos: string[]; // Danh sách URL video đã upload
    ratings: Array<{
      key: string;
      name: string;
      value: number;
    }>;
  }
  ```

### 3.2. Cấu trúc File đề xuất thay đổi

| File                                                                                                                          | Thay đổi                                                                                                                                                                                                                |
| ----------------------------------------------------------------------------------------------------------------------------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| [action-bar.tsx](file:///d:/Remote/web-travel/src/modules/GuideProfilePage/components/action-bar.tsx)                         | - Thêm button "Rate me" (đánh giá) bên cạnh nút "Đặt tour".<br>- Quản lý state đóng/mở của Bottom Sheet/Dialog Đánh giá.                                                                                                |
| [NEW] [rating-sheet.tsx](file:///d:/Remote/web-travel/src/modules/GuideProfilePage/components/rating-sheet.tsx)               | - Component chứa Form Đánh giá Hướng dẫn viên.<br>- Hỗ trợ Bottom Sheet (trên mobile) và Dialog mượt mà.<br>- Chứa UI chọn sao tổng quan, các tiêu chí đánh giá chi tiết, textarea bình luận, và các trình upload file. |
| [NEW] [rating-media-upload.tsx](file:///d:/Remote/web-travel/src/modules/GuideProfilePage/components/rating-media-upload.tsx) | - Component quản lý upload ảnh và video cho form đánh giá.<br>- Kiểm tra dung lượng file (< 10MB) và giới hạn số lượng (tổng <= 5).                                                                                     |

---

## 4. Dependencies & Conflicts

- **Depends on:** Thiết lập API upload và lưu trữ đánh giá từ Backend (nếu cần gửi dữ liệu thực tế). Nếu không có, lưu trạng thái tạm thời (Mock/Alert thành công).
- **Modifies:** [action-bar.tsx](file:///d:/Remote/web-travel/src/modules/GuideProfilePage/components/action-bar.tsx)
- **Must NOT break:** Chức năng Đặt tour hiện tại, chức năng quét mã QR và Chia sẻ danh thiếp hướng dẫn viên.
- **Conflicts with:** Không có conflict nào được phát hiện với các spec hiện tại.

---

## 5. Out of scope

- Chức năng sửa/xóa đánh giá sau khi đã gửi (sẽ được xử lý ở trang quản lý lịch sử cá nhân hoặc Admin).
- Chức năng bình luận phản hồi (reply) đánh giá từ phía hướng dẫn viên.

---

## 6. Câu hỏi mở (Open questions)

- Backend có hỗ trợ lưu trữ video đánh giá của khách trên cùng thư viện video của Admin không, hay sử dụng một API lưu trữ khác?
