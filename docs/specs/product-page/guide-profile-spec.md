# Đặc tả thiết kế: Trang Profile Hướng dẫn viên truyền cảm hứng (Inspirational Guide Profile)

Bản đặc tả này mô tả chi tiết thiết kế giao diện, cấu trúc thành phần (UI Components), mô hình Mock Data, các tương tác người dùng và hiệu ứng chuyển động của trang **Profile Hướng dẫn viên** trên phiên bản di động.

Thiết kế này được xây dựng dựa trên nguyên mẫu HTML tĩnh [vvv_guide_profile_inspirational_v2.html](file:///d:/Remote/web-travel/public/vvv_guide_profile_inspirational_v2.html).

---

## 1. Kiến trúc Bố cục (Layout Architecture)

Trang Profile được thiết kế tối ưu hóa cho màn hình di động, kế thừa cấu trúc khung bao từ `MainLayout` của dự án để đảm bảo tính nhất quán trên thiết bị di động.

- **Khung bao Viewport (Viewport Container):**
  - Chiều rộng: Cố định tối đa `w-full max-w-[430px]` (chạy ở giữa màn hình trên Desktop).
  - Chiều cao: Toàn màn hình thiết bị di động `h-[100dvh]` hoặc `min-h-screen`.
  - Màu nền: Màu nền phụ của hệ thống `#F3F3F7` (`bg-neutral-100`).
- **Quy chuẩn khoảng đệm (Padding & Margin Standards):**
  - Khoảng đệm ngang mặc định cho các section: `px-[18px]` (khoảng `18px`).
  - Khoảng đệm dọc mặc định cho các section: `py-[22px]` (khoảng `22px`).
  - Đường phân chia giữa các section: Viền mỏng `border-b border-black/[0.08]` (hoặc `border-neutral-200`).

---

## 2. Kiểu chữ & Ánh xạ Hệ thống Font (Typography Mapping)

Trang sử dụng 2 bộ font chữ chính đã được định cấu hình trong dự án:

1. **font-dinpro:** Font không chân (`sans-serif`) dành cho các nhãn, số liệu, tiêu đề và nút bấm.
2. **font-serif:** Font có chân (`serif`) chuyên dùng cho các câu trích dẫn tự sự và nhận xét cảm xúc.

### Bảng ánh xạ cỡ chữ từ HTML tĩnh sang Tailwind CSS của hệ thống:

| Cỡ chữ gốc (HTML) | Class Tailwind của hệ thống                | Ứng dụng thực tế                                              |
| :---------------- | :----------------------------------------- | :------------------------------------------------------------ |
| `10px` / `11px`   | `text-button3` hoặc `text-[11px]`          | Thẻ tag nhỏ, mã số ID, nhãn nhỏ dưới chỉ số                   |
| `12px`            | `text-caption2` hoặc `text-body4`          | Các dòng chữ phụ, phụ đề clip, đánh giá chi tiết              |
| `13px` / `14px`   | `text-body3` hoặc `text-caption1`          | Tên tour, đánh giá công ty, nút bấm chính, văn bản hành trình |
| `16px`            | `text-body2` (font-serif hoặc font-sans)   | Dòng giới thiệu bản thân "Vì sao tôi làm nghề này"            |
| `22px`            | `text-h6` (hoặc `text-[22px] font-medium`) | Tên Hướng dẫn viên chính trên banner                          |
| `26px`            | `text-[26px] font-medium`                  | Các con số thống kê lớn (số tour, số năm)                     |

---

## 3. Cấu trúc Mô hình Dữ liệu (Mock Data Schema)

Dưới đây là cấu trúc dữ liệu JSON dùng để render giao diện mẫu khi chưa có API kết nối.

```typescript
export interface GuideProfileData {
  id: string;
  cardId: string; // ví dụ: "HN-2847"
  name: string;
  title: string; // ví dụ: "Hướng dẫn viên · Hà Nội & vùng cao phía Bắc"
  slogan: string; // câu trích dẫn ngắn ở banner
  bio: string; // câu chuyện dài "Vì sao tôi làm nghề này"

  // Chỉ số công việc
  metrics: {
    toursLed: number;
    yearsOfExperience: number;
    languages: string[]; // ví dụ: ["VI", "EN", "FR"]
  };

  // Đánh giá từ công ty lữ hành
  operatorReviews: Array<{
    id: string;
    companyName: string;
    tourName: string;
    date: string; // ví dụ: "Tháng 4/2026"
    rating: number; // ví dụ: 5.0
    comment: string;
  }>;

  // Đánh giá tổng hợp từ khách hàng
  guestFeedback: {
    totalReviews: number;
    averageRating: number;
    criteria: Array<{
      label: string; // ví dụ: "Storytelling", "Local knowledge"
      score: number; // ví dụ: 4.92, 4.95
    }>;
    featuredReviews: Array<{
      id: string;
      author: string;
      country: string;
      tourName: string;
      date: string;
      content: string;
    }>;
  };

  // Danh mục chuyên môn
  specialties: string[]; // ví dụ: ["Trekking expert", "Food storyteller"]

  // Khoảnh khắc từ tour (Video ngắn)
  moments: Array<{
    id: string;
    title: string;
    location: string;
    duration: string; // ví dụ: "0:42"
    videoUrl: string;
    thumbnailUrl: string;
    placeholderColor: string; // Màu gradient hex đại diện khi chưa load xong
  }>;

  // Những nơi đã dẫn tour
  destinations: Array<{
    name: string;
    toursCount: number;
    percentage: number; // dùng để vẽ thanh tiến trình biểu đồ cột ngang
  }>;

  // Hành trình sự nghiệp
  careerTimeline: Array<{
    id: string;
    companyName: string;
    role: string;
    period: string; // ví dụ: "2023 – nay"
    description: string;
  }>;
}
```

---

## 4. Đặc tả các Thành phần UI & Tương tác (UI Components & Interactions)

### 4.1. Khối Hero Banner

- **Giao diện:**
  - Chiều cao cố định `280px` sử dụng `relative` layout.
  - Nền gradient góc chéo `bg-gradient-to-br from-[#1D9E75] via-[#0F6E56] to-[#04342C]`.
  - Lớp phủ radial gradient `bg-[radial-gradient(ellipse_at_70%_30%,rgba(255,255,255,0.15),transparent_50%)]` và lớp phủ bóng tối ở đáy `bg-gradient-to-t from-black/55 to-transparent h-[60%]`.
- **Thành phần tương tác:**
  - **Badge Mã số thẻ:** Thẻ `#HN-2847` nằm ở góc phải trên. Nền mờ kính `bg-white/18 border border-white/25 backdrop-blur-[8px] text-[10px] text-white px-2 py-1 rounded-full`.
  - **Hành vi tương tác:** Bấm vào badge mã thẻ sẽ lật hiển thị thông tin thẻ hướng dẫn viên dạng số hóa đã được cấp phép.
  - **Dòng trích dẫn (Slogan):** Hiển thị bằng font `font-serif text-[13px] italic text-white/85 mb-1.5`.
  - **Tên & Danh hiệu:** Tên `text-[22px] font-medium text-white` và Danh hiệu `text-[13px] text-white/75`.

### 4.2. Khối Thao tác Nhanh (Action Bar)

- **Giao diện:** Đặt trong container đệm `p-[18px] flex gap-[10px] border-b border-neutral-200 bg-white`.
- **Nút bấm:**
  - **Nút "Đặt tour với Minh":** Chiếm trọn chiều ngang còn lại (`flex-1`). Màu nền `bg-neutral-black text-white py-3 rounded-md text-[13px] font-medium`.
  - **Nút QR Code:** Icon QR SVG màu đen trong khung viền xám nhạt, kích thước `p-3 rounded-md border border-neutral-200`. Bấm nút sẽ mở Bottom Sheet hiển thị QR Code động để lưu danh thiếp.
  - **Nút Share:** Icon Share SVG màu đen. Bấm vào nút sẽ gọi Web Share API trên điện thoại hoặc Copy Link kèm hiển thị Toast thông báo.

### 4.3. Khối Câu chuyện Cá nhân (Storytelling)

- **Giao diện:** `py-[22px] px-[18px] bg-white border-b border-neutral-200`.
- **Nhãn tiêu đề:** `text-[11px] text-neutral-500 uppercase tracking-widest font-medium mb-2.5` ("VÌ SAO TÔI LÀM NGHỀ NÀY").
- **Nội dung kể chuyện:** Sử dụng font `font-serif text-[16px] text-neutral-900 leading-[1.65] font-normal`.

### 4.4. Khối Số liệu Thống kê (Quick Stats Grid)

- **Giao diện:** Lưới 3 cột ngang phân chia bằng đường viền mỏng dọc (`border-r border-neutral-200`).
- **Các chỉ số:**
  - Con số: `text-[26px] font-medium text-neutral-black leading-none`.
  - Nhãn phụ: `text-caption2 text-neutral-500 mt-1.5`.
- **Nút Xác minh Lệnh điều tour:** Đặt nút text `text-[11px] text-neutral-500 py-2 w-full flex items-center justify-center gap-1`. Bấm vào sẽ trượt hiển thị bảng danh sách mã điều tour đã được VVV xác thực.

### 4.5. Khối Đánh giá từ Công ty Tour (Operator Reviews)

- **Giao diện:** Sử dụng màu nền xám nhẹ `bg-neutral-100` (`bg-neutral-50`) làm nổi bật các thẻ đánh giá.
- **Review Cards:** Các thẻ đánh giá màu trắng nền `bg-white border border-neutral-200 rounded-[8px] p-3.5 mb-2`.
- **Hành vi tương tác:** Hỗ trợ vuốt ngang (carousel layout) trên mobile thay vì xếp chồng dọc để giảm độ dài cuộn trang. Dưới chân khối có chú thích in nghiêng `text-[11px] text-neutral-500 italic` ("Đánh giá từ công ty được xác minh và không thể chỉnh sửa").

### 4.6. Khối Đánh giá từ Khách & Thanh đo Tiêu chí

- **Giao diện:** Liệt kê các tiêu chí (Storytelling, Local knowledge...) dưới dạng danh sách dọc.
- **Thanh đo (Progress Bar):**
  - Chiều cao thanh: `h-[4px]` bo tròn `rounded-full`.
  - Nền: Xám nhạt `bg-neutral-200`.
  - Thanh hiển thị: Đen `bg-neutral-black`. Chiều rộng tính bằng tỷ lệ điểm số (ví dụ: `4.92 / 5.0` tương ứng `98%`).
- **Lời bình tiêu biểu:** Các nhận xét từ khách nước ngoài hiển thị dưới dạng trích dẫn có đường kẻ đứng dày `border-l-2 border-neutral-black pl-3.5 mb-4.5`.

### 4.7. Khối Video Khoảnh khắc (Tour Moments)

- **Giao diện:** Lưới 2 cột (`grid grid-cols-2 gap-2`).
- **Thẻ video:**
  - Tỷ lệ khung hình đứng: `aspect-[9/14]`.
  - Nền: Gradient chuyển động màu đặc trưng của địa điểm hoặc ảnh thumbnail mờ.
  - Biểu tượng Play: Hình tròn trắng đục ở giữa có icon tam giác đen nhỏ.
  - Phụ đề chân clip: Tên clip (`font-serif italic text-white text-[12px]`) và địa điểm (`text-[10px] text-white/80`).
- **Hành vi tương tác:** Bấm vào một khoảnh khắc sẽ mở ra một lớp phủ phát video dọc (Shorts/Reels style overlay player) cho phép vuốt lên để xem clip tiếp theo.

### 4.8. Khối Điểm đến & Hành trình sự nghiệp

- **Biểu đồ Cột ngang điểm đến:** Vẽ danh sách nơi đã dẫn tour. Thanh tiến trình dài ngắn thể hiện tỉ lệ số tour đã dẫn.
- **Timeline Sự nghiệp:**
  - Trục timeline dạng đường kẻ mảnh dọc màu xám nhạt `border-l border-neutral-200`.
  - Chấm tròn tại các mốc thời gian: màu đen `bg-neutral-black` cho mốc hiện tại ("VVV - Vietnam Village Vibes") và màu xám `bg-neutral-300` cho các mốc cũ hơn.
  - Tiêu đề nơi làm việc sử dụng `text-[13px] font-medium`, thời gian làm việc sử dụng `text-caption2 text-neutral-500`.

---

## 5. Đặc tả Chuyển động & Hiệu ứng (Animations & Transitions)

Các hiệu ứng chuyển động được áp dụng để tăng tính trải nghiệm cao cấp (Premium UX) cho trang Profile:

1. **Hiệu ứng Load trang (Page Entrance):**
   - Các khối thông tin quan trọng (Banner, Action Bar, Storytelling, Stats) sẽ trượt nhẹ từ dưới lên kèm mờ dần (`fadeInUp`) lần lượt với khoảng delay `0.08s` giữa mỗi phần.
2. **Hiệu ứng Thanh tiến trình (Criteria Progress):**
   - Thanh đo điểm số của khách và biểu đồ cột ngang điểm đến sẽ chạy rộng dần từ `width: 0%` đến độ dài thực tế khi người dùng cuộn màn hình đến khu vực này (`framer-motion: whileInView`).
3. **Hiệu ứng Tap/Hover Nút bấm:**
   - Nút CTA "Đặt tour với Minh" co nhẹ khi người dùng bấm xuống (`scale: 0.96`, transition `duration: 0.1s`).
   - Các icon vuông phụ (QR, Share) xoay nhẹ góc 5 độ khi di chuột qua.
4. **Hiệu ứng Bottom Sheet / Modal (Mã QR & Lệnh điều tour):**
   - Trượt mượt mà từ dưới lên (`translate-y` từ 100% về 0%) kết hợp làm mờ và làm tối nhẹ phần nền phía sau (`backdrop-blur-[2px] bg-black/40`).
5. **Hiệu ứng Shorts Video Player:**
   - Khi click vào Clip Moments, cửa sổ phát video dọc sẽ zoom nhẹ từ điểm click ra toàn màn hình (`scale` từ 0.3 lên 1.0 kèm `fade-in`).

---

## 6. Chiến lược Tải trang & Trạng thái UI (Performance & UI States)

- **Trạng thái Skeleton Loading:**
  - Hiển thị các khối hộp màu xám nhạt có hiệu ứng xung nhịp (shimmer effect) để giả lập hình ảnh cấu trúc trang trước khi Mock dữ liệu được nạp xong.
- **iOS Safari Video Autoplay Fallback:**
  - Trình phát video bắt buộc cấu hình `muted={true}` để trình duyệt cho phép tự động chạy (loop).
  - Hiển thị một nút "Chạm để bật âm thanh" (Mute/Unmute toggle indicator) nhỏ ở góc video để người dùng tương tác chủ động.
- **Trạng thái Dữ liệu Trống (Empty State):**
  - Trong trường hợp hướng dẫn viên chưa đăng tải clip Moments hay chưa được xác nhận điều động tour nào, khối nội dung tương ứng sẽ hiển thị một minh họa tối giản kèm dòng chữ mờ nhạt báo hiệu trạng thái chuẩn bị cập nhật, tránh làm đứt gãy bố cục của trang.
