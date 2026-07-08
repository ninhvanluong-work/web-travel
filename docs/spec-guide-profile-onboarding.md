# Guide Profile Onboarding Specification

## 1. Tổng quan (Overview)

Tính năng hướng dẫn tân thủ (Onboarding Tutorial) dành cho Tour Guide lần đầu tiên đăng nhập vào hệ thống và truy cập trang cá nhân (`GuideProfilePage`). Mục tiêu là giúp họ làm quen với giao diện, hiểu rõ tác dụng của từng thành phần trên trang và biết cách tối ưu hóa hồ sơ của mình để thu hút khách hàng. Giống như hướng dẫn tân thủ khi chơi game, hệ thống sẽ đưa ra các overlay làm tối màn hình và chỉ làm nổi bật khu vực cần chú ý.

## 2. Luồng người dùng (User Flow)

1. Tour Guide đăng nhập thành công.
2. Hệ thống kiểm tra trạng thái (từ API hoặc LocalStorage) xem Guide này đã hoàn thành hướng dẫn profile hay chưa (`hasSeenProfileTutorial`).
3. Nếu chưa hoàn thành, khi người dùng truy cập vào `GuideProfilePage`, hệ thống sẽ tự động kích hoạt chuỗi hướng dẫn.
4. Màn hình tối lại, nổi bật (highlight) từng thành phần theo thứ tự. Người dùng có thể nhấn "Tiếp tục" (Next), "Quay lại" (Back) hoặc "Bỏ qua" (Skip).
5. Khi hoàn thành bước cuối cùng hoặc ấn "Bỏ qua", hệ thống cập nhật trạng thái `hasSeenProfileTutorial = true` để không hiển thị lại ở những lần sau.

## 3. Các bước hướng dẫn chi tiết (Tutorial Steps)

| Bước | Thành phần (Target) | Tiêu đề Tooltip                     | Nội dung Tooltip                                                                                                                               |
| :--- | :------------------ | :---------------------------------- | :--------------------------------------------------------------------------------------------------------------------------------------------- |
| 1    | `Màn hình chính`    | Chào mừng đến với Hồ sơ của bạn! 🎉 | Đây là trang cá nhân của bạn, nơi du khách và các đơn vị lữ hành sẽ nhìn thấy. Hãy cùng khám phá cách làm cho hồ sơ của bạn thật ấn tượng nhé! |
| 2    | `HeroBanner`        | Ảnh đại diện & Ảnh bìa              | Một bức ảnh chuyên nghiệp và nụ cười rạng rỡ sẽ là điểm cộng lớn. Nhấn vào đây để cập nhật những hình ảnh đẹp nhất của bạn.                    |
| 3    | `ActionBar`         | Thanh công cụ                       | Nơi bạn có thể chỉnh sửa thông tin nhanh, chia sẻ hồ sơ (Share), hoặc xem các thống kê cá nhân (Insight).                                      |
| 4    | `StorytellingBlock` | Câu chuyện của bạn                  | Hãy kể cho du khách nghe về đam mê, kinh nghiệm và phong cách dẫn tour độc đáo của bạn. Một câu chuyện hay sẽ tạo nên sự kết nối tuyệt vời.    |
| 5    | `StatsBlock`        | Thành tích & Chỉ số                 | Các con số biết nói! Nơi này tổng hợp số tour bạn đã dẫn, số điểm đánh giá trung bình và các huy hiệu bạn đạt được.                            |
| 6    | `MomentsGrid`       | Khoảnh khắc đáng nhớ                | Đăng tải những bức ảnh tuyệt đẹp từ các chuyến đi của bạn. Đây là "portfolio" trực quan nhất để thuyết phục khách hàng.                        |
| 7    | `Nút hoàn thành`    | Bạn đã sẵn sàng! 🚀                 | Giờ thì hãy bắt đầu cập nhật thông tin và sẵn sàng cho những chuyến đi tuyệt vời sắp tới!                                                      |

## 4. Công nghệ đề xuất (Tech Stack)

- Sử dụng thư viện **React Joyride** (hoặc Wrapper của **Driver.js** cho React). Đây là các thư viện phổ biến để làm overlay tooltip hiệu quả.
- Quản lý state của tutorial bằng **Zustand** (để có thể trigger từ bất cứ đâu) hoặc lưu thẳng vào state của component `ProfileOnboarding`.

## 5. Tích hợp vào `src/modules/GuideProfilePage`

- **Thêm ID cho Component:** Bổ sung các `id` hoặc `className` cụ thể vào các component con (`HeroBanner`, `ActionBar`, `StorytellingBlock`, v.v.) để thư viện onboarding có thể target (ví dụ: `id="tour-onboarding-hero"`).
- **Tạo Component ProfileOnboarding:** Tạo file `ProfileOnboarding.tsx`. Component này sẽ nhận danh sách steps, quản lý việc start/stop tutorial và gọi API/cập nhật LocalStorage khi hoàn thành.
- **Render:** Import và gọi `<ProfileOnboarding />` trong file `index.tsx` của `GuideProfilePage`.

## 6. Các câu hỏi mở (Open Questions)

_Những điểm này cần thống nhất trước khi code:_

1. Chúng ta sẽ lưu trạng thái `hasSeenProfileTutorial` trên Database (gọi API) hay chỉ lưu ở `LocalStorage` (nhanh nhưng phụ thuộc thiết bị/trình duyệt)?
2. Bạn có muốn sử dụng hiệu ứng đặc biệt (ví dụ react-confetti) khi hoàn thành bước cuối cùng không?
