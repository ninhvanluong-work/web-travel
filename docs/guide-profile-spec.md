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

### 3.5. Animated Data Counters (Stats Block)

- **Hành vi:** Các con số thống kê (số chuyến đi, số lượt review) sẽ chạy hiệu ứng đếm (count up) từ 0 đến giá trị thực tế khi khối thông tin này lọt vào khung hình (viewport).
- **Implementation:** Kết hợp `framer-motion` (`useInView` & `animate`) để tạo cảm giác data đang "sống".

### 3.6. Staggered Fade-In (Moments Grid & Timeline)

- **Hành vi:** Thay vì hiển thị đồng loạt, các item trong lưới Moments hoặc các mốc thời gian sẽ lần lượt hiện ra (staggered fade-up) khi cuộn tới.
- **Implementation:** Áp dụng variant với `staggerChildren` để các phần tử con trượt lên theo thứ tự (delay = index \* 0.05s).

### 3.7. Smooth Expand (Storytelling & Guest Reviews Block)

- **Hành vi:** Khi mở rộng nội dung (VD: bấm "...Read more" ở phần Bio, hoặc "See all guest reviews" ở phần Đánh giá), khung chứa nội dung mới sẽ trượt mở ra một cách mượt mà (animate height) thay vì nhảy cóc (jump layout/giật cục) ngay lập tức.
- **Implementation:** Sử dụng thành phần `AnimatePresence` và `motion.div` của `framer-motion` với thuộc tính `animate={{ height: "auto" }}` và `initial={{ height: 0, opacity: 0 }}`. Khi nội dung đã mở, có thể hiện nút "Show less" (Thu gọn) để cuộn ngược lại.

### 3.8. Tối ưu Action Bar cho màn hình cực nhỏ (Responsive & Micro-layout)

**Vấn đề hiện tại:** Như trong ảnh chụp màn hình, khi bề ngang hẹp (mobile nhỏ), nút "Book a tour with CườngNGuyen" bị bẻ thành 2 dòng làm nút bị phình to ra, trong khi các nút bên cạnh (Edit Profile, QR, Share) đang chiếm nhiều diện tích ngang.

**Giải pháp 1: Thu nhỏ chữ & Truncate thông minh (Giữ nguyên layout)**

- **Adaptive Text Size:** Giảm `font-size` của nút Book xuống `text-[11px]` hoặc `text-[12px]` trên các màn hẹp (`max-sm`).
- **Partial Truncate:** Thay vì cắt toàn bộ chữ, ta bọc tên vào một thẻ span riêng biệt có giới hạn chiều rộng: `<span>Book a tour with</span> <span class="truncate max-w-[60px] inline-block align-bottom">CườngNGuyen</span>`. Nhờ đó chữ không bị xuống dòng.
- **Icon-only cho nút phụ:** Nút "Edit Profile" có thể chỉ hiển thị icon ✏️ (Pencil) thay vì hiện cả cụm chữ trên màn hình nhỏ.

**Giải pháp 2: Tái cấu trúc lại luồng UX (Cách tiếp cận BMad - Analogical từ Airbnb/Tinder)**
Đây là giải pháp đột phá hơn:

- **Di dời nút phụ (Share, QR):** Đưa 2 nút này lên góc trên cùng bên phải của `HeroBanner` (nằm đè lên ảnh bìa, màu trắng trong suốt `bg-white/20 backdrop-blur`). Đây là vị trí chuẩn mực của các app hiện tại.
- **Sticky Bottom CTA (Thanh hành động dưới đáy):** Gỡ hoàn toàn Action Bar ở dưới HeroBanner. Thay vào đó, tạo một thanh cố định dưới cùng màn hình (fixed bottom).
  - _Bên trái:_ Avatar thu nhỏ của Guide kèm Rating hoặc Giá (nếu có).
  - _Bên phải:_ Nút "Book" bự chảng. Điều này giúp thao tác "chốt đơn" luôn nằm gọn trong ngón cái của User bất kể họ cuộn tới đâu.

### 3.9. Cân bằng Layout cho Stats Block (Nhiều ngôn ngữ)

**Vấn đề hiện tại:** Khối thống kê (Stats Block) chia làm 3 cột. Khi số lượng ngôn ngữ (languages) được chọn quá nhiều (VD: 9 ngôn ngữ: VI - EN - KO - FR - JP...), phần text này bị rớt xuống nhiều dòng, làm cột thứ 3 dài thòng xuống và phá vỡ sự cân đối (balance) của toàn bộ khối.

**Giải pháp đề xuất:**

- **Giải pháp 1 (Rút gọn & Hiển thị thêm):** Chỉ hiển thị tối đa 2-3 ngôn ngữ đầu tiên và cộng thêm số lượng còn lại. Ví dụ: `VI - EN - KO (+6)`. Khi user bấm vào cột này, một popup/toast nhỏ sẽ hiện lên danh sách đầy đủ.
- **Giải pháp 2 (CSS Line Clamp):** Bắt buộc cắt chữ ở dòng thứ 2 (dùng `line-clamp-2`) hoặc dòng thứ 1 (`truncate`) để chiều cao cột ngôn ngữ luôn tương đương với 2 cột còn lại.
- **Giải pháp 3 (Đưa ra khỏi Stats Block):** Nếu ngôn ngữ là thông tin quan trọng và có thể rất dài, không nên ép nó vào khối 3 cột này. Có thể biến nó thành một phần "Tags" riêng biệt nằm bên dưới (giống như Specialty Tags).

### 3.10. Scroll-spy Career Timeline (Trục thời gian tương tác)

- **Hành vi:** Dọc theo khối Timeline (quá trình làm việc) sẽ có một trục thời gian mờ. Khi người dùng cuộn chuột xuống đến đâu, một thanh màu (highlight) sẽ trượt theo tỷ lệ tương ứng, làm sáng bừng các điểm mốc (milestone) khi đi qua chúng.
- **Implementation:** Sử dụng hook `useScroll` của `framer-motion` kết hợp với `useTransform` để nội suy (interpolate) chiều cao của thanh line sáng dựa trên vị trí cuộn của người dùng.

## 4. Thứ tự ưu tiên triển khai

1. Cập nhật `active:scale` (Tactile Buttons) cho các file trong `src/modules/GuideProfilePage/components/`.
2. Tạo component Sticky Action Bar với hiệu ứng Glassmorphism.
3. Bổ sung các micro-animation cho các icon/nút tương tác nhỏ (Heart, Save, Share).
4. Nghiên cứu tích hợp `framer-motion` useDrag cho chức năng Swipe Back.
