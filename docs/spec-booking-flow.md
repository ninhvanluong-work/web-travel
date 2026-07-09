# Đặc tả chức năng: Luồng Đặt Tour (Tour Booking Flow)

Tài liệu này mô tả chi tiết yêu cầu và luồng người dùng (User Flow) cho chức năng đặt tour trên thiết bị di động (Mobile-first). Luồng này được kích hoạt khi người dùng nhấn nút **"Book now"** ở trang chi tiết sản phẩm.

**Tài liệu tham khảo (Design Link):**
[Claude Design - Tour Booking Flow](https://claude.ai/design/p/cc8f6b04-79fe-40b0-9308-60b72319b312?via=share&file=Tour+Booking+Flow.dc.html)

## 1. Tổng quan

- **Mục tiêu**: Cung cấp trải nghiệm đặt tour mượt mà, bao gồm 4 bước rõ ràng: `Info` (Thông tin cơ bản) -> `Options` (Tùy chọn) -> `Review` (Kiểm tra lại) -> `Payment` (Thanh toán).
- **Giao diện**: Dạng Bottom Sheet hoặc Full-screen Overlay trên Mobile.
- **Header chung**: Hiển thị tên tour (VD: Tour Hà Giang - Mã Pí Lèng), thời lượng (2 days, 1 night), và giá từ (from $117/person).
- **Stepper**: Thanh tiến trình hiển thị 4 bước.

## 2. Chi tiết các bước (Steps)

### Bước 1: Info (Who's joining?)

Mục đích: Xác định ngày khởi hành và số lượng người tham gia.

- **Travel Date (Ngày khởi hành)**:
  - Giao diện chọn ngày (Date Picker).
  - Định dạng: `dd/mm/yyyy`.
- **Số lượng người**:
  - **Adults (Người lớn)**: Tuổi 12+. Có nút tăng/giảm (`-`, `+`). Hiển thị giá mỗi người (VD: $117/person).
  - **Children (Trẻ em)**: Tuổi 2-11. Có nút tăng/giảm. Hiển thị thông tin giảm giá (VD: 50% discount).
  - **Lưu ý**: Có một banner thông báo nhỏ "Children under 2 travel free — no reservation needed" (Trẻ em dưới 2 tuổi miễn phí, không cần đặt chỗ).
- **Bottom Bar**:
  - Hiển thị "Estimated total" (Tổng dự kiến) tự động cập nhật theo số lượng người.
  - Nút **"Continue ->"** (Trạng thái disable nếu chưa chọn ngày hoặc số lượng người = 0).

### Bước 2: Options (Customize your trip)

Mục đích: Chọn giờ khởi hành, điểm đón và gói tour.

- **Departure Time (Giờ khởi hành)**:
  - Chọn 1 trong các lựa chọn dạng Card.
  - VD: `07:30 Morning departure (4 spots left)`, `13:00 Afternoon departure (2 spots left)`.
  - Hiển thị số chỗ còn lại (Inventory tracking).
- **Pickup Location (Điểm đón)**:
  - Chọn 1 điểm dạng Radio button list.
  - VD: Hanoi Old Quarter (Most popular), Hoan Kiem Lake, Ba Dinh Square.
- **Tour Package (Gói Tour)**:
  - Chọn 1 trong các gói dạng Card.
  - **Basic**: Included (Shared guide, Lunch included, Transport).
  - **Premium**: +$40/pp (Private guide, All meals, Transport, Hotel pickup).
- **Bottom Bar**:
  - Nút Back (`<-`) để quay lại Bước 1.
  - Hiển thị "Running total" (Tổng tiền hiện tại, tự động cộng thêm phí nếu chọn Premium).
  - Nút **"Continue ->"**.

### Bước 3: Review (Review Booking)

Mục đích: Xác nhận lại toàn bộ thông tin trước khi tiến hành thanh toán.

- **Booking Details (Chi tiết đặt chỗ)**:
  - Tour: Tên tour (VD: Hà Giang – Mã Pí Lèng)
  - Date: Ngày đã chọn (VD: Thu, Nov 11, 1999)
  - Guests: Số lượng khách (VD: 2 adults)
  - Departure: Giờ khởi hành đã chọn
  - Pickup: Điểm đón đã chọn
  - Package: Gói tour đã chọn
- **Price Summary (Tóm tắt giá)**:
  - Phân tích giá (VD: 2 adults × $117 = $234)
  - **Total**: Tổng cộng tiền.
- **Policies & Agreements**:
  - Card màu xanh: "Free cancellation up to 24h before departure. Full refund guaranteed." (Miễn phí hủy trước 24h).
  - Checkbox bắt buộc: "I agree to the Terms and Conditions and Cancellation Policy".
- **Bottom Bar**:
  - Nút Back (`<-`).
  - Total to pay: (Tổng tiền thanh toán).
  - Nút **"Confirm Booking ->"** (Sẽ bị disable nếu chưa tick chọn đồng ý điều khoản).

### Bước 4: Payment (Almost there!)

Mục đích: Chọn phương thức và tiến hành thanh toán.

- **Giao diện**:
  - Icon "Party popper" 🎉 chúc mừng.
  - "Your booking is ready — choose how to pay".
- **Order Summary**:
  - Thông tin rút gọn: Tour (Hà Giang 2D1N), Date, Guests, **Total due**.
- **Payment Methods (Phương thức thanh toán)**:
  - Nút **Pay with Card** (Màu xanh dương) - Hỗ trợ Visa, Mastercard, Amex.
  - Nút **PayPal** (Màu vàng) - Fast & secure checkout.
- **Footer**:
  - Dòng text bảo mật: "🔒 256-bit SSL encryption · Instant confirmation".
  - Nút Link: `<- Edit booking details` (Quay lại các bước trước).

## 3. Kiến trúc State (Dự kiến)

Cần có một Global State (VD: Zustand store `useBookingStore`) để lưu trữ dữ liệu xuyên suốt 4 bước:

```typescript
interface BookingState {
  step: 1 | 2 | 3 | 4;
  date: string | null;
  guests: { adults: number; children: number };
  options: {
    departureTime: string | null;
    pickupLocation: string | null;
    packageType: 'basic' | 'premium' | null;
  };
  totalPrice: number;
}
```

## 4. Hành động tiếp theo (Next Steps)

- Xây dựng UI Component cho Stepper và Layout chung của Booking.
- Triển khai Step 1 (Date, Guest Counters).
- Triển khai Step 2 (Cards cho Departure/Packages, Radios cho Pickup).
- Triển khai Step 3 (Summary Review, Checkbox Điều khoản).
- Triển khai Step 4 (Màn hình chọn Phương thức thanh toán).
- Cài đặt Zustand store để kết nối dữ liệu giữa các bước.
