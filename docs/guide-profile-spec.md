# Guide Profile Page - UX/UI Refinement Specification (BMad Method)

## 1. Mục tiêu (Objectives)

Tối ưu hóa trải nghiệm người dùng (UX) và giao diện (UI) cho trang `GuideProfilePage`, nhắm tới tiêu chuẩn ứng dụng (app-like experience) trên nền tảng web di động.
Dựa vào phương pháp luận BMad:

- **Sensory Exploration (Khám phá cảm quan):** Tạo các phản hồi xúc giác/thị giác (haptic/visual feedback).
- **Analogical Thinking (Tư duy tương đồng):** Vay mượn các micro-interaction từ hệ điều hành iOS/Android.

## 2. Các điểm cần cải thiện (Pain Points)

- Trang hiện tại khi cuộn dài dễ làm mất bối cảnh các nút Action chính (Book/Contact).
- Nút bấm khi chạm (touch/click) chưa mang lại cảm giác chân thực (tactile feedback).
- Hiệu ứng vuốt để quay lại (Swipe back) hiện đang xử lý tĩnh và hơi thô (`dx > 80 && dx > dy * 1.5`), thiếu hiệu ứng vật lý (spring physics).

## 3. Tính năng đề xuất (Proposed Refinements)

### 3.1. Glassmorphism Sticky CTA (Action Bar)

- **Hành vi:** Khi người dùng cuộn qua `HeroBanner`, một phiên bản rút gọn của `ActionBar` (với các nút chính như Book/Contact) sẽ trượt xuống (slide down) từ cạnh trên hoặc dính ở cạnh dưới.
- **UI:** Áp dụng vật liệu kính mờ: `bg-white/90 backdrop-blur-md` kết hợp đổ bóng nhẹ `shadow-sm`, giúp phân tách rõ ràng nhưng không che khuất hoàn toàn nội dung.

### 3.2. Tactile Buttons (Nút bấm vật lý)

- **Hành vi:** Khi ngón tay chạm giữ (active), nút bấm có độ lún xuống, khi nhả ra thì nảy lên.
- **Implementation:** Thêm utility class `active:scale-[0.97] transition-transform duration-100 ease-out`.

### 3.3. Haptic & Visual Feedback (Phản hồi tương tác)

- **Hành vi:** Tại các hành động quan trọng (nhấn Like Moment, Lưu Profile), xuất hiện micro-animation như biểu tượng nhịp đập tim (pulse/spring) kèm theo pop-up/toast siêu nhẹ.
- **Implementation:** Sử dụng `framer-motion` cho icon. Nếu trình duyệt hỗ trợ, có thể gọi `navigator.vibrate(50)` để tạo rung nhẹ.

### 3.4. Cải thiện Swipe-to-Go-Back

- **Hành vi:** Thay vì kiểm tra điều kiện cứng nhắc rồi gọi `router.back()` ngay lập tức, UI toàn trang sẽ bị kéo lùi mượt mà theo ngón tay người dùng từ trái sang phải, tạo độ phản hồi trực tiếp (direct manipulation).

## 4. Thứ tự ưu tiên triển khai

1. Cập nhật `active:scale` (Tactile Buttons) cho các file trong `src/modules/GuideProfilePage/components/`.
2. Tạo component Sticky Action Bar với hiệu ứng Glassmorphism.
3. Bổ sung các micro-animation cho các icon/nút tương tác nhỏ (Heart, Save, Share).
4. Nghiên cứu tích hợp `framer-motion` useDrag cho chức năng Swipe Back.
