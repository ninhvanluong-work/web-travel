---
title: 'Tour Guide Redirection & Profile Editing Sheet'
created: '2026-06-17'
status: 'draft'
domain: 'guide-profile'
related: 'view-more-tours-by-guide.md'
---

# Spec: Điều hướng Đăng nhập HDV & Bottom Sheet Chỉnh sửa Thông tin Cá nhân

## 1. Vấn đề / Mục tiêu

### Hiện trạng

- Hệ thống chưa có cơ chế điều hướng riêng dành cho Tour Guide sau khi đăng nhập thành công. Tất cả các tài khoản sau khi đăng nhập đều được điều hướng về trang chủ (`ROUTE.HOME`).
- Trên trang chi tiết của Tour Guide (`GuideProfilePage`), bất kể người dùng truy cập là ai, hệ thống luôn hiển thị nút **"Rate me"** (Đánh giá tôi) để mở popup đánh giá. Chưa có sự phân biệt giữa khách truy cập thông thường và bản thân Tour Guide đó (chủ sở hữu profile - Owner).
- Khi Tour Guide muốn cập nhật thông tin cá nhân (như ảnh đại diện, ảnh bìa, slogan, mô tả bản thân, số năm kinh nghiệm, ngôn ngữ, chuyên môn, lịch sử sự nghiệp), họ hiện phải sử dụng màn hình quản trị Admin (`src/modules/AdminTourGuide`). Chưa có giải pháp tiện lợi, trực quan ngay trên trang cá nhân của họ trên giao diện di động.

### Mục tiêu

1. **Điều hướng thông minh sau đăng nhập**: Khi tài khoản Tour Guide đăng nhập thành công, hệ thống tự động nhận diện và điều hướng họ về trang hồ sơ cá nhân của mình (`src/modules/GuideProfilePage` - `/guide/[id]`). Các tài khoản khác tiếp tục được đưa về trang chủ.
2. **Nhận diện quyền sở hữu (Owner Check)**: Tại trang profile HDV, kiểm tra nếu người dùng đang đăng nhập chính là chủ sở hữu của profile đó thì thay thế nút **"Rate me"** bằng nút **"Edit Profile"** (Chỉnh sửa hồ sơ).
3. **Bottom Sheet Chỉnh sửa Hồ sơ**: Khi bấm vào "Edit Profile", hệ thống mở một Bottom Sheet popup (tương tự như `RatingSheet`) hiển thị form cho phép chỉnh sửa thông tin cá nhân.
4. **Đồng bộ hóa & Giả lập dữ liệu (Fake Data)**:
   - Giả lập phản hồi của API Login để trả về thông tin tài khoản HDV khi email có chứa cụm từ `"guide"`.
   - Lưu trữ các thay đổi thông tin hồ sơ vào `localStorage` của trình duyệt.
   - Tích hợp việc đọc và trộn (merge) dữ liệu từ `localStorage` vào API lấy thông tin chi tiết HDV (`getTourGuideById`) để đảm bảo thay đổi hiển thị ngay lập tức và duy trì sau khi tải lại trang.

---

## 2. Brainstorming theo BMAD Framework

### Phase 1: Divergent Thinking — "Nếu như..."

**Câu hỏi 1: Nhận diện vai trò Tour Guide thế nào khi chưa có API thật?**

- **Nếu như** tạo một danh sách email cố định trong mã nguồn (ví dụ: `guide@example.com`)?
  - _Đánh giá_: Đơn giản nhưng cứng nhắc, khó cho việc test với nhiều email khác nhau.
- **Nếu như** kiểm tra nếu email đăng nhập có chứa chữ `"guide"` (ví dụ: `minh.guide@travel.com`, `guide@vvv.travel`)?
  - _Đánh giá_: **Tối ưu nhất** — linh hoạt, dễ dàng cho cả nhà phát triển và tester tạo bất kỳ tài khoản guide giả lập nào để kiểm tra flow.
- **Nếu như** thêm nút "Đăng nhập với vai trò HDV" riêng biệt trên UI?
  - _Đánh giá_: Làm thay đổi thiết kế UI của trang Đăng nhập vốn đã được chốt và tối ưu. Không nên làm.

**Câu hỏi 2: Giao diện Form chỉnh sửa trong Bottom Sheet nên bố trí ra sao để thân thiện với mobile?**

- **Nếu như** hiển thị toàn bộ form dài cùng một lúc với các trường xếp chồng phẳng liên tục?
  - _Đánh giá_: Mobile viewport rất ngắn. Việc xếp các trường bằng phẳng không ranh giới dễ gây ngợp (cognitive overload) và khó cho người dùng tìm kiếm phân vùng thông tin để chỉnh sửa.
- **Nếu như** thiết kế theo dạng **Wizard Multi-step Form (Phân chia bước)**?
  - _Đánh giá_: Giúp giao diện gọn nhưng lại che giấu thông tin của các bước khác. Người dùng không có cái nhìn tổng quan (general overview) về toàn bộ dữ liệu hồ sơ của mình cùng lúc, gây bất tiện khi muốn sửa nhanh nhiều phần khác nhau.
- **Nếu như** thiết kế theo **Bố cục phân khu dạng Thẻ (Card-based Sectioned Layout)** tương ứng mockup thiết kế?
  - _Đánh giá_: **Giải pháp tối ưu & Premium (ĐƯỢC CHỌN)** — Phân chia các trường thông tin thành 3 khối thẻ độc lập viền xám nhạt (`My Profile`, `Expertise`, `Career Timeline`). Người dùng vừa dễ dàng cuộn lướt để kiểm tra toàn bộ thông tin của mình cùng một lúc, vừa dễ định vị từng phân khu nhờ các đường viền bao ngoài và tiêu đề thẻ rõ ràng. Bố cục này cực kỳ ngăn nắp, tạo cảm giác chuyên nghiệp giống như một trang quản trị cài đặt cao cấp được thu nhỏ gọn trên mobile.

**Câu hỏi 3: Cách lưu và đồng bộ dữ liệu sửa đổi khi chưa có API cập nhật?**

- **Nếu như** chỉ lưu thông tin sửa đổi trong state của React (Memory)?
  - _Đánh giá_: Dữ liệu sẽ mất ngay khi người dùng reload trang hoặc chuyển hướng. Trải nghiệm test rất tệ.
- **Nếu như** lưu thông tin sửa đổi vào `localStorage` và ghi đè dữ liệu gốc khi load?
  - _Đánh giá_: **Hợp lý** — Bằng cách intercept hàm lấy dữ liệu chi tiết HDV (`getTourGuideById`), ta kiểm tra nếu có bản lưu trong `localStorage` thì lấy bản lưu đó đè lên dữ liệu gốc. Dữ liệu sửa đổi sẽ được giữ lại lâu dài, giúp flow test mượt mà như có API thật.

**Câu hỏi 4: Kiến trúc hệ thống Mock API thế nào để không làm bẩn production code?**

- **Nếu như** viết code mock `if (isDevelopment)` lồng trực tiếp bên trong các file request API chính như `src/api/auth/requests.ts` và `src/api/tour-guide/requests.ts`?
  - _Đánh giá_: Gây ô nhiễm mã nguồn chính. Khi lên môi trường thật (production) sẽ phải mất công dọn dẹp và dễ gây lỗi xung đột code.
- **Nếu như** thiết kế một **Mock Interceptor Layer (Lớp chặn Mock)** riêng biệt hoặc dùng cơ chế Client-side Database Mocking?
  - _Đánh giá_: **Giải pháp Tech hay** — Tạo một file trung gian mock adapter (ví dụ: `src/api/tour-guide/mock-adapter.ts`). File này chịu trách nhiệm kiểm tra môi trường hoặc check key `localStorage`, nếu thỏa mãn điều kiện thì trả về dữ liệu mock trực tiếp mà không cần đi qua lớp gọi API thực tế. Các hàm request chính chỉ việc import và gọi helper này. Khi có API thật, chỉ cần ngắt kết nối mock adapter ở duy nhất một chỗ mà không cần sửa cấu trúc hàm.

**Câu hỏi 5: Làm sao để UX lưu hồ sơ có cảm giác tức thế (0ms latency) và không bị mất dữ liệu khi vô tình đóng sheet?**

- **Nếu như** chỉ lưu khi người dùng bấm nút "Lưu thay đổi"?
  - _Đánh giá_: Đầy đủ nhưng chưa tối ưu. Nếu người dùng đang điền dở timeline sự nghiệp mà vô tình vuốt Bottom Sheet xuống để đóng (dismiss), toàn bộ công sức nhập liệu sẽ mất hết.
- **Nếu như** áp dụng song song **Draft Auto-save (Tự động lưu nháp)** và **Optimistic Cache Updates (Cập nhật giao diện lập tức)**?
  - _Đánh giá_: **Trải nghiệm đẳng cấp cao (State-of-the-art)** —
    - _Auto-save Draft_: Lưu trạng thái form xuống `sessionStorage` sau mỗi 3 giây thay đổi. Nếu sheet bị đóng ngoài ý muốn, lần mở sau sẽ hiện thông báo khôi phục bản nháp.
    - _Optimistic Updates_: Khi bấm lưu, thay vì chờ API phản hồi chậm chạp, ta trực tiếp mutate cache của React Query (`queryClient.setQueryData`) ngay lập tức để cập nhật UI hiển thị bên ngoài trong nháy mắt.

---

### Phase 2: SCAMPER — Tinh chỉnh ý tưởng

- **S (Substitute)**: Thay thế giao diện form phẳng truyền thống hoặc Wizard giấu màn hình bằng giao diện các **khối Thẻ (Card blocks) trực quan** để tổ chức dữ liệu gọn gàng.
- **C (Combine)**: Kết hợp các widget chuyên dụng (`LanguageSelector`, `ExpertSearchDropdown`, `ExperienceImageUpload`) thành các thành phần trường độc lập, bọc gọn gàng trong các layout thẻ di động.
- **A (Adapt)**: Thích ứng cơ chế kéo thả Reorder trong `CareerSection` (dùng `framer-motion`) vào không gian hẹp của Bottom Sheet bằng cách thêm icon/nút lên/xuống (Up/Down buttons) hỗ trợ cho việc kéo thả trên màn hình cảm ứng di động.
- **M (Modify)**: Tách lớp lưu trữ tạm thời (`mock-adapter.ts`) ra khỏi logic của UI Component để giữ cho code component thuần khiết và dễ dàng thay thế bằng API thật sau này.
- **E (Eliminate)**: Loại bỏ các layout chia cột ngang phức tạp của phiên bản desktop, chuyển thành 100% cột dọc đơn bên trong từng khối thẻ của Bottom Sheet.
- **R (Reverse)**: Thay vì lưu dữ liệu rồi mới cập nhật giao diện, ta thực hiện **Optimistic Update** (cập nhật UI trước) rồi mới chạy tác vụ ghi đè dữ liệu chạy ngầm (`localStorage`/API mock).

---

### Phase 3: Solution Matrix — So sánh kiến trúc form chỉnh sửa trên mobile

| Tiêu chí                                   | Phương án A: Form cuộn phẳng truyền thống | Phương án B: Form dạng Wizard nhiều bước | Phương án C: Bố cục phân khu dạng Thẻ (ĐƯỢC CHỌN)          |
| :----------------------------------------- | :---------------------------------------- | :--------------------------------------- | :--------------------------------------------------------- |
| **Tính dễ theo dõi toàn cục**              | Cao (Tất cả hiển thị ra)                  | Kém (Bị ẩn sau các bước)                 | **Rất cao** (Cuộn lướt dễ dàng, được đóng khung rõ rệt)    |
| **Ngăn chặn quá tải thông tin (Clutter)**  | Thấp (Mọi thứ xếp chồng lộn xộn)          | **Rất tốt** (Hiển thị chia nhỏ)          | **Tốt** (Phân ranh giới các block bằng viền thẻ gọn gàng)  |
| **Độ thân thiện khi chỉnh sửa nhiều phần** | Trung bình (Khó định vị)                  | Kém (Phải back/next liên tục)            | **Xuất sắc** (Xem tổng quan và chỉnh sửa nhanh tại chỗ)    |
| **Độ thẩm mỹ & Chuyên nghiệp**             | Trung bình                                | Khá tốt                                  | **Xuất sắc** (Sạch sẽ, mô phỏng trang thiết lập dạng card) |

---

### Phase 4: Brainstorming đợt 2 — Tối ưu hóa UI/UX & Trải nghiệm Đa ngôn ngữ (BMAD Khảo sát Thực tế)

**Câu hỏi 1: Giải quyết vấn đề trộn lẫn ngôn ngữ (English / Vietnamese) trên form khi người dùng đổi ngôn ngữ chính?**

- **Nếu như** dịch cứng các nhãn trực tiếp bằng mã React thông qua toán tử điều kiện `lang === 'vi'`?
  - _Đánh giá_: Code bẩn, khó mở rộng khi hỗ trợ thêm ngôn ngữ thứ 3 và đi ngược lại triết lý `next-i18next` của dự án.
- **Nếu như** cập nhật code sử dụng thống nhất bộ khóa dịch `editProfileSheet` trong `guidePage.json` thay vì tham chiếu từ `adminPage.json`?
  - _Đánh giá_: **Giải pháp tối ưu** — Giữ cho logic tách biệt rõ ràng, sửa các nhãn cứng `"Title"`, `"Slogan"` thành các trường động qua hook `t`.

**Câu hỏi 2: Cách xử lý chữ cứng Tiếng Việt trong component upload dùng chung (`ExperienceImageUpload`)?**

- **Nếu như** viết một component upload riêng biệt cho profile HDV?
  - _Đánh giá_: Gây trùng lặp code không đáng có.
- **Nếu như** tham số hóa (parameterize) các text hiển thị ("Thay đổi ảnh", "Tải ảnh lên", "Đang tải lên...") thành các props tùy chọn (`changeLabel`, `uploadLabel`, `uploadingLabel`)?
  - _Đánh giá_: **Rất tốt** — Vừa giúp tái sử dụng component cũ trong Admin (không gây lỗi biên dịch do có default props), vừa cho phép truyền nhãn đa ngôn ngữ động từ bên ngoài `edit-profile-sheet.tsx`.

**Câu hỏi 3: Tối ưu hóa độ bền vững của dữ liệu bản nháp (Draft)?**

- **Nếu như** giữ nguyên `sessionStorage`?
  - _Đánh giá_: Người dùng di động rất dễ mất dữ liệu nháp khi vô tình vuốt tắt tab hoặc hệ điều hành giải phóng bộ nhớ.
- **Nếu như** chuyển đổi sang dùng `localStorage` làm phân vùng lưu trữ nháp chính?
  - _Đánh giá_: **Cực kỳ an toàn** — Dữ liệu nháp được giữ lại lâu dài cho đến khi người dùng chủ động nhấn lưu (Save) hoặc nhấn xóa (Discard) trong banner phục hồi.

**Câu hỏi 4: Cung cấp trải nghiệm dòng thời gian sự nghiệp (Career Timeline) thực tế hơn?**

- **Nếu như** chỉ để năm bắt đầu như cấu hình tối giản cũ?
  - _Đánh giá_: HDV không thể phản ánh chính xác khoảng thời gian làm việc cũ của họ (ví dụ: làm 3 năm tại công ty cũ).
- **Nếu như** bổ sung trường `Năm kết thúc` (End Year) dạng tùy chọn và checkbox `Công việc hiện tại` (Is Current)?
  - _Đánh giá_: **Giải pháp tối ưu** — Giúp hiển thị chính xác khoảng thời gian `2018 – 2021` hoặc `2023 – nay` trên dòng thời gian cá nhân của HDV.

**Câu hỏi 5: Đồng bộ màu sắc chuyên môn (Specialty Colors)?**

- **Nếu như** tiếp tục dùng bảng màu tĩnh theo thứ tự mảng `i % SPECIALTY_PALETTE.length` lúc lưu?
  - _Đánh giá_: Màu sắc chuyên môn sẽ bị thay đổi ngẫu nhiên khi người dùng thêm/xóa tag và bị lệch màu so với trang hiển thị chính vốn dùng hàm băm màu theo chữ.
- **Nếu như** đồng bộ hóa bằng cách sử dụng hàm `getSpecialtyColor(label)` khi hiển thị và gán màu?
  - _Đánh giá_: **Giải pháp chuẩn xác** — Đảm bảo màu sắc của một kỹ năng (ví dụ: "Trekking") luôn đồng nhất ở mọi vị trí trên giao diện.

**Câu hỏi 6: Sử dụng chuyển động (Animation) thế nào để tạo cảm giác sang trọng (Premium Feel)?**

- **Nếu như** sử dụng các hiệu ứng chuyển động mặc định của CSS?
  - _Đánh giá_: Thô và giật cục, không mang lại cảm giác cao cấp.
- **Nếu như** tận dụng thư viện **Framer Motion** đã cài sẵn trong dự án:
  - Sử dụng `<AnimatePresence>` cho việc xuất hiện/biến mất của các chip tag kỹ năng.
  - Sử dụng cơ chế `layout` của Framer Motion để tự động tạo chuyển động mượt mà (smooth repositioning) khi người dùng sắp xếp vị trí sự nghiệp (Up/Down).
  - _Đánh giá_: **Hoàn hảo** — Tạo hiệu ứng thị giác đẳng cấp và hiện đại mà không làm tăng dung lượng code.

---

## 3. Hành vi mong muốn

### A. Luồng Đăng nhập & Điều hướng (Login & Redirect)

| Kịch bản                               | Hành động                                                                                    | Kết quả mong đợi                                                                            |
| :------------------------------------- | :------------------------------------------------------------------------------------------- | :------------------------------------------------------------------------------------------ |
| Đăng nhập tài khoản Tour Guide         | Nhập email có chữ `"guide"` (vd: `guide.minh@vvv.travel`) và mật khẩu bất kỳ. Bấm Đăng nhập. | Điều hướng trực tiếp đến trang cá nhân `/guide/1`. Hiển thị thông báo đăng nhập thành công. |
| Đăng nhập tài khoản khách thông thường | Nhập email không chứa chữ `"guide"` (vd: `customer@gmail.com`). Bấm Đăng nhập.               | Điều hướng về trang chủ `/`. Hiển thị thông báo thành công.                                 |

### B. Kiểm tra Quyền & Hiển thị Button trên Profile

| Người dùng đang đăng nhập             | Trạng thái Profile truy cập     | Nút hiển thị     | Hành vi khi click           |
| :------------------------------------ | :------------------------------ | :--------------- | :-------------------------- |
| Chưa đăng nhập (Guest)                | Bất kỳ HDV nào                  | **Rate me**      | Mở popup `RatingSheet`      |
| Khách hàng (role = 'user')            | Bất kỳ HDV nào                  | **Rate me**      | Mở popup `RatingSheet`      |
| Tour Guide (role = 'guide', id = '1') | Hồ sơ của HDV khác (id = '2')   | **Rate me**      | Mở popup `RatingSheet`      |
| Tour Guide (role = 'guide', id = '1') | Hồ sơ của chính mình (id = '1') | **Edit Profile** | Mở popup `EditProfileSheet` |

### C. Giao diện & Hành động trên EditProfileSheet

| Phần tử                              | Mô tả hành vi                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                 |
| :----------------------------------- | :------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| **Đầu trang (Header)**               | Tiêu đề "Edit Personal Information", phụ đề "Update your details to keep your profile up-to-date."                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                            |
| **Bố cục giao diện (Simple Layout)** | **Giao diện tối giản dạng Hộp thoại tối (Dark-themed Dialog Layout):**<br>Toàn bộ popup được thiết kế trên nền tối (`bg-neutral-black` / `#0F1D33` hoặc tương đương) với phong cách gọn gàng, chia thành các phần:<br><br>1. **Change Profile Picture:**<br>- Hiển thị Avatar tròn hiện tại kèm icon camera đè lên.<br>- Text mô tả bên cạnh: "Upload a square image (200x200 px) in JPEG or PNG format."<br><br>2. **Personal Information:**<br>- **First Name & Last Name:** Hai trường nhập liệu nằm cạnh nhau (chia cột `grid-cols-2` trên màn hình thích hợp).<br>- **Email Address & Phone:** Hai trường nhập liệu nằm cạnh nhau.<br>- **Bio:** Khung nhập văn bản giới thiệu bản thân dạng TextArea bên dưới.<br><br>_Cách phân tách họ và tên:_ Khi load form, tách trường `name` của HDV thành First Name và Last Name (ngắt ở khoảng trắng cuối cùng). Khi submit, nối lại thành `firstName + " " + lastName` để đồng bộ dữ liệu gốc.<br><br>- **Cấu trúc Giao diện Cao cấp & Quy chuẩn Khoảng cách (Premium Layout & Spacing Rules)**:<br> - **Sticky Glassmorphism Header & Footer**: Đầu trang (tiêu đề và thông tin định danh) và chân trang (nút Hủy/Lưu) được ghim cố định với màu nền mờ `bg-white/85 backdrop-blur-md` cùng viền phân cách siêu mảnh, tạo hiệu ứng chiều sâu không gian khi cuộn dữ liệu ở giữa.<br> - **Đồng bộ Padding của Khối Thẻ (Uniform Card Padding)**: Tất cả các thẻ thông tin (`rounded-3xl`) phải áp dụng padding đồng nhất `p-5` hoặc `p-6`. Khoảng cách từ phần tử cuối cùng đến viền đáy của thẻ phải bằng đúng khoảng cách từ phần tử đầu tiên đến viền đỉnh của thẻ để tạo tính đối xứng thị giác hoàn hảo.<br> - **Khoảng cách dọc đồng nhất (Consistent Vertical Spacing)**: Sử dụng các lớp khoảng cách dọc đồng đều (ví dụ: `space-y-4` hoặc `space-y-5`) trong phần thân thẻ thay vì khai báo margin riêng lẻ tùy tiện, tránh hiện tượng trường cao trường thấp, khoảng cách xa gần không đều.<br> - **Cải tiến hàng Avatar & Cover Image**: <br> - _Giải pháp tốt nhất_: Gộp Avatar và Cover Image thành một khối trực quan dạng Hero Header (Avatar đè lên góc dưới Cover Image với margin âm).<br> - _Giải pháp cột đôi (nếu giữ nguyên)_: Phải căn lề dọc trục giữa (`items-center` hoặc `items-end`) để Avatar hình tròn không tạo ra khoảng trống lớn bị lệch so với Cover Image hình chữ nhật. |
| **Hỗ trợ nháp (Draft Recovery)**     | Lưu trạng thái form vào `sessionStorage` sau mỗi 3 giây để phục hồi dữ liệu nếu vô tình đóng popup.                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                           |
| **Chân trang (Footer)**              | Ở góc dưới bên phải, hiển thị 2 nút bấm:<br>- Nút **"Close"**: Viền xám nhạt, màu tối, đóng popup.<br>- Nút **"Save Changes"**: Màu xanh dương nổi bật, thực hiện lưu thay đổi.<br><br>- **Quản lý Dòng thời gian Sự nghiệp Linh hoạt (Gestural Accordion & Mobile Timeline)**:<br> - Mỗi vị trí sự nghiệp hỗ trợ cả `Năm bắt đầu` (startYear) lẫn `Năm kết thúc` (endYear - tùy chọn) và checkbox `Công việc hiện tại` (isCurrent).<br> - **Bố cục Accordion co giãn**: Các thẻ sự nghiệp không kích hoạt sẽ tự động co lại thành một dòng text tóm tắt ngắn (ví dụ: `2018 – 2021: HDV tại Vietravel`). Chỉ thẻ đang chỉnh sửa mới nở rộng (slide down) để lộ đầy đủ các trường nhập liệu, giúp tiết kiệm không gian di động tối đa.<br> - **Căn chỉnh Trực quan cho Checkbox và Số Tour**:<br> - Tránh đặt Checkbox `Current position` (chiều cao thấp) nằm song song hàng ngang với ô nhập `Number of Tours` (chiều cao lớn) vì gây lệch trục mắt.<br> - Checkbox `Current position` phải được đặt riêng một hàng bên dưới các ô nhập năm, hoặc căn chỉnh trục giữa (`items-center`) rõ ràng.<br> - Các ô nhập Start Year, End Year, và Number of Tours nên được tổ chức thành một lưới 3 cột cân xứng (`grid-cols-3`).<br> - Khi chọn "Công việc hiện tại", ô nhập Năm kết thúc tự động khóa (disabled) / ẩn đi và hiển thị placeholder `"nay"` hoặc `"present"` tùy theo ngôn ngữ.<br> - **Nút di chuyển Up/Down & Hoàn tác nhanh (Undo-Toast)**: Hỗ trợ nút mũi tên lên/xuống để hoán đổi vị trí thẻ sự nghiệp mượt mọc. Khi người dùng bấm Xóa, thẻ sự nghiệp trượt ra ngoài và biến mất ngay lập tức, đồng thời một thanh Toast xuất hiện bên dưới: _"Đã xóa vị trí. [Hoàn tác]"_ để khôi phục dữ liệu tức thì mà không cần hiển thị hộp thoại xác nhận ngắt quãng luồng thao tác.<br> - **Đồng bộ Bảng màu chuyên môn (Specialty Tag Colors)**:                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                      |

---

## 4. Thay đổi kỹ thuật

### A. Danh sách các file thay đổi

| Đường dẫn file                                                     | Loại       | Mô tả                                                                                                          |
| :----------------------------------------------------------------- | :--------- | :------------------------------------------------------------------------------------------------------------- | ----------------------------------------------- |
| `src/api/auth/types.ts`                                            | **MODIFY** | Thêm trường `role?: 'guide'                                                                                    | 'user'`và`tourGuideId?: string`vào type`IUser`. |
| `src/api/auth/requests.ts`                                         | **MODIFY** | Mock logic `loginRequest` dựa theo tài khoản từ `docs/fake-accounts.txt` để redirect về đúng ID HDV tương ứng. |
| `src/modules/SignInPage/index.tsx`                                 | **MODIFY** | Thay đổi callback `onSuccess` của mutation login để chuyển hướng thông minh dựa vào vai trò người dùng.        |
| `src/pages/guide/[id].tsx`                                         | **MODIFY** | Bổ sung namespace `'adminPage'` vào `serverSideTranslations` để có đủ từ khóa dịch thuật cho form sửa đổi.     |
| `src/modules/GuideProfilePage/index.tsx`                           | **MODIFY** | Lấy user từ `UserStore`, tính toán `isOwner` và truyền vào `ActionBar`.                                        |
| `src/modules/GuideProfilePage/components/action-bar.tsx`           | **MODIFY** | Thêm prop `isOwner`, thực hiện thay thế button "Rate me" bằng "Edit Profile" và gọi mở `EditProfileSheet`.     |
| `src/api/tour-guide/requests.ts`                                   | **MODIFY** | Sửa hàm `getTourGuideById` để đọc và đè dữ liệu từ `localStorage` thông qua helper `mock-adapter.ts`.          |
| `src/api/tour-guide/mock-adapter.ts`                               | **NEW**    | Helper chặn và hợp nhất dữ liệu từ `localStorage` để không làm bẩn logic request API gốc.                      |
| `src/modules/GuideProfilePage/components/edit-profile-sheet.tsx`   | **NEW**    | Component popup Bottom Sheet/Dialog chứa form tối giản chỉnh sửa thông tin cá nhân của HDV.                    |
| `src/modules/GuideProfilePage/components/moments-grid.tsx`         | **MODIFY** | Bổ sung nút "Manage / Quản lý" (chỉ hiển thị khi `isOwner = true`) để kích hoạt mở `ManageMomentsSheet`.       |
| `src/modules/GuideProfilePage/components/manage-moments-sheet.tsx` | **NEW**    | Component Bottom Sheet quản lý độc lập (video grid, caption editor, upload progress, delete với undo-toast).   |

### B. Chi tiết thiết kế Component mới: `edit-profile-sheet.tsx`

- **Thư viện sử dụng**: `react-hook-form`, `@hookform/resolvers/zod`, `zod`, `framer-motion`.
- **Cấu trúc Giao diện Cao cấp (Premium Card-based Layout)**:
  - **Sticky Glassmorphism Header & Footer**: Đầu trang (tiêu đề và thông tin định danh) và chân trang (nút Hủy/Lưu) được ghim cố định với màu nền mờ `bg-white/85 backdrop-blur-md` cùng viền phân cách siêu mảnh, tạo hiệu ứng chiều sâu không gian khi cuộn dữ liệu ở giữa.
  - **Khối Thẻ thông tin (Cards with Depth)**: Phần nhập liệu phân chia thành các thẻ bo góc lớn `rounded-3xl` và đổ bóng mịn `shadow-[0_8px_30px_rgb(0,0,0,0.02)]` tạo cấu trúc gọn gàng, tăng tính thẩm mỹ di động.
  - **Uploader Hình ảnh Tối giản**: Tích hợp uploader ảnh bìa và avatar trực quan, hỗ trợ tham số hóa đa ngôn ngữ cho các overlays ("Thay đổi ảnh", "Tải ảnh lên", "Đang tải lên...") dựa trên locale hiện tại.
- **Quản lý Dòng thời gian Sự nghiệp Linh hoạt (Gestural Accordion & Mobile Timeline)**:
  - Mỗi vị trí sự nghiệp hỗ trợ cả `Năm bắt đầu` (startYear) lẫn `Năm kết thúc` (endYear - tùy chọn) và checkbox `Công việc hiện tại` (isCurrent).
  - **Bố cục Accordion co giãn**: Các thẻ sự nghiệp không kích hoạt sẽ tự động co lại thành một dòng text tóm tắt ngắn (ví dụ: `2018 – 2021: HDV tại Vietravel`). Chỉ thẻ đang chỉnh sửa mới nở rộng (slide down) để lộ đầy đủ các trường nhập liệu, giúp tiết kiệm không gian di động tối đa.
  - Khi chọn "Công việc hiện tại", ô nhập Năm kết thúc tự động khóa (disabled) / ẩn đi và hiển thị placeholder `"nay"` hoặc `"present"` tùy theo ngôn ngữ.
  - **Nút di chuyển Up/Down & Hoàn tác nhanh (Undo-Toast)**: Hỗ trợ nút mũi tên lên/xuống để hoán đổi vị trí thẻ sự nghiệp mượt mà. Khi người dùng bấm Xóa, thẻ sự nghiệp trượt ra ngoài và biến mất ngay lập tức, đồng thời một thanh Toast xuất hiện bên dưới: _"Đã xóa vị trí. [Hoàn tác]"_ để khôi phục dữ liệu tức thì mà không cần hiển thị hộp thoại xác nhận ngắt quãng luồng thao tác.
- **Đồng bộ Bảng màu chuyên môn (Specialty Tag Colors)**:
  - Màu sắc của các tag chuyên môn được tính toán động dựa trên hàm băm màu theo chữ `getSpecialtyColor(label)`, giúp đảm bảo tính đồng nhất màu sắc ở mọi vị trí hiển thị trên toàn dự án.
- **Trải nghiệm Chuyển động Mượt mà (Framer Motion Integration)**:
  - Các chip kỹ năng và ngôn ngữ hỗ trợ micro-interaction: thu phóng nhẹ khi nhấn (`whileTap={{ scale: 0.95 }}`).
  - Các khối thẻ lịch sử sự nghiệp hỗ trợ hiệu ứng trượt hoán đổi vị trí (Up/Down) không độ trễ bằng thuộc tính `layout` và fade in/out khi thêm mới/xóa bằng `<AnimatePresence>`.
- **Cơ chế Lưu nháp Bền vững (localStorage Draft & Dismiss Confirmation)**:
  - Tự động lưu trạng thái form vào `localStorage` định kỳ mỗi 3 giây.
  - Nếu người dùng vuốt xuống để đóng Bottom Sheet khi đã thay đổi dữ liệu, một Dialog xác nhận phụ sẽ hiện lên hỏi: _"Bạn có muốn lưu bản nháp không?"_ để tránh mất mát dữ liệu do lỡ tay.
  - Chỉ dọn dẹp (removeItem) bản nháp khi người dùng nhấn "Lưu thay đổi" (Save) hoặc nhấn "Bỏ qua" (Discard) trong banner phục hồi.

### C. Quản lý Khoảnh khắc (Moments Management) cho Tour Guide - Đã Chọn Phương án 1 (Chuyên biệt)

Hệ thống chốt chọn **Phương án 1 (Tách biệt thành Drawer Quản lý chuyên biệt `ManageMomentsSheet`)** để đảm bảo hiệu suất render và trải nghiệm UX mobile-first mượt mà nhất. Để xóa bỏ cảm giác đứt gãy luồng công việc của người dùng, hệ thống xây dựng **2 lối vào (Entry Points)** cực kỳ tiện lợi:

#### 1. Các điểm chạm kích hoạt (Entry Points)

- **Entry Point A (Lối tắt trực tiếp từ Profile chính)**:
  - Tại phần hiển thị "Khoảnh khắc từ tour (Moments from tour)" trên profile, khi `isOwner = true`, nút **"Manage / Quản lý"** (kèm icon bút chì nhỏ) sẽ hiển thị ngay bên cạnh tiêu đề.
  - Click vào đây sẽ trực tiếp mở sheet `ManageMomentsSheet`. Đây là lối tắt nhanh nhất cho tác vụ đăng video thường xuyên sau mỗi tour dẫn khách.
- **Entry Point B (Liên kết chéo trong Edit Profile Sheet)**:
  - Trong form chỉnh sửa chính (`edit-profile-sheet.tsx`), phần dưới cùng sẽ có một thẻ card nhỏ mang tên **Moments**. Thẻ này hiển thị dòng liên kết: `Quản lý video khoảnh khắc (Đang có 8 clips) ➔`.
  - Khi HDV click vào liên kết này, hệ thống sẽ thực hiện đóng `EditProfileSheet` và mở tiếp `ManageMomentsSheet` một cách đồng bộ mà không cần tải lại trang.

#### 2. Chi tiết luồng hoạt động trong `ManageMomentsSheet`

- **Giao diện danh sách (Video Grid)**: Hiển thị lưới 2 cột toàn bộ video clips hiện tại của HDV với thumbnail thực tế. Mỗi clip có nút Xóa dạng icon thùng rác nhỏ đè lên góc phải.
- **Thêm mới (Add Moment Sub-sheet)**:
  - Một nút **"Thêm khoảnh khắc" (Add Moment)** cố định ở footer hoặc đầu trang.
  - Khi bấm, một sheet con (Sub-sheet trượt từ cạnh phải hoặc dưới lên) sẽ xuất hiện chứa form:
    - Khung upload file (hỗ trợ kéo thả video định dạng mp4/webm, dung lượng tối đa 50MB).
    - Ô nhập caption mô tả ngắn (tối đa 150 ký tự).
    - Dropdown liên kết clip này với một Tour cụ thể trong danh sách tour đã dẫn của HDV đó.
- **Hành động Xóa & Hoàn tác nhanh (Undo Delete)**:
  - Khi bấm nút Xóa một video, video đó biến mất lập tức khỏi danh sách.
  - Một thanh **Toast** sẽ hiện lên ở đáy màn hình: _"Đã xóa khoảnh khắc. [Hoàn tác]"_. Nếu bấm Hoàn tác, video sẽ được phục hồi lập tức cùng caption nguyên vẹn.
- **Tiến trình tải lên (Upload Progress Circle)**:
  - Khi file video đang được upload lên mock-server, hiển thị một lớp phủ mờ đè lên thumbnail video cùng biểu tượng tiến trình dạng vòng tròn % chạy từ 0 đến 100%. Nút Lưu chỉ active sau khi tiến trình hoàn tất 100%.

---

### D. Xử lý tài khoản Đăng nhập giả lập (từ docs/fake-accounts.txt)

- `guide.testing@vvv.travel` $\rightarrow$ ID: `991ad4ab-f45d-48ee-9d97-2020256d24b3`
- `guide.song@vvv.travel` $\rightarrow$ ID: `6a3a3faa-d650-42cd-beaf-1c81da4c4469`
- `guide.thuan@vvv.travel` $\rightarrow$ ID: `2f9f58a3-dd30-4b7e-9d30-90ac643528ce`
- `guide.luong@vvv.travel` $\rightarrow$ ID: `ef2e8931-8f55-4b3c-9497-1ef385979fa0`
- Bất kỳ email chứa `"guide"` nào khác $\rightarrow$ Redirect về ID `991ad4ab-f45d-48ee-9d97-2020256d24b3` làm mặc định.
- **Tối ưu hóa phản hồi (Optimistic Updates)**:
  - Khi bấm submit, thực hiện ghi đè cache của React Query ngay lập tức để UI cập nhật không độ trễ. Dữ liệu bao gồm ảnh đại diện, tên đầy đủ và mô tả giới thiệu (Bio).
  - Sau đó lưu dữ liệu vào `localStorage` chạy ngầm. Giao diện bên ngoài sẽ thay đổi tức thì, đem lại trải nghiệm mượt mà hoàn hảo.

---

## 5. Dependencies & Conflicts

- **Depends on:**
  - Form validation: `src/lib/validations/tour-guide.ts` (đã có sẵn).
  - UI components: `@/components/ui/sheet`, `@/components/ui/scrollArea`, `@/components/ui/form` (đều đã có sẵn).
- **Quy chuẩn tái sử dụng (Shared Coding Standard):**
  - **Component chung:** Sử dụng các thành phần UI chung tại `src/components` (như `@/components/ui/button`, `@/components/ui/input`, `@/components/ui/textarea`).
  - **CSS chung:** Tận dụng tối đa các biến CSS, theme màu và shadow có sẵn ở `tailwind.config.ts` (như `brand.500`, `neutral.black`, `theme-xs`) cùng các lớp CSS tiện ích định nghĩa ở `src/styles/globals.css` (như `.admin-form-label`, `.zone-divider`, `.section-label-caps`). Không định nghĩa lại CSS cục bộ trùng lặp.
  - **Assets & Icons:** Sử dụng các icon từ thư viện dùng chung `lucide-react` hoặc các file tài nguyên tĩnh SVG tại `src/assets`.
  - **Đa ngôn ngữ (i18n):** Tuân thủ cơ chế đa ngôn ngữ bằng cách định nghĩa các key dịch thuật tương ứng trong các file JSON locales (`public/locales/vi/guidePage.json` và `public/locales/en/guidePage.json`). Tuyệt đối không hardcode text tiếng Việt hay tiếng Anh trực tiếp trong code components.
  - **Gọi API đồng nhất & Quản lý Token:** Gọi API thông qua các hooks tạo bởi `react-query-kit` định nghĩa tại `src/api/tour-guide/queries.ts` (ví dụ: `useTourGuideById`, `useUpdateTourGuide`). Các yêu cầu AJAX/HTTP thực tế được gọi qua instance axios `request` tại `src/api/axios.ts` bên trong `requests.ts`.
    - Hệ thống có cấu hình request interceptor tại `src/api/axios.ts` tự động đính kèm token (`headers.Authorization = 'Bearer ' + token`) từ `useUserStore`.
    - Do đó, khi đăng nhập tài khoản Tour Guide giả lập thành công, token giả lập (`mock-guide-access-token`) sẽ được lưu vào `UserStore` và tự động đính kèm vào mọi request sau đó.
    - Logic giả lập/mock dữ liệu được cô lập bên trong adapter `mock-adapter.ts` và được gọi từ file request, giữ cho interface của API và React Query hoàn toàn đồng nhất với các API thực tế khác trong dự án.
- **Modifies:**
  - Giao diện đăng nhập (`SignInPage`) và trang chi tiết HDV (`GuideProfilePage`).
- **Must NOT break:**
  - Giao diện và logic của màn hình Admin gốc (`src/modules/AdminTourGuide/GuideFormPage`). Các component của admin được import vào Bottom Sheet cần giữ nguyên tính độc lập để không phá vỡ trang quản trị desktop.
  - Chức năng đánh giá HDV (`RatingSheet`) dành cho khách truy cập thông thường.
- **Conflicts with:** Không có.

---

## 6. Out of scope

- Xây dựng API thật cho chức năng đăng nhập và chỉnh sửa hồ sơ.
- Quản lý và tải lên file ảnh thật lên server (ảnh đại diện/ảnh bìa). Vẫn sử dụng cơ chế upload giả lập có sẵn của hệ thống (lưu URL base64 hoặc chuỗi ảnh).
- Tạo trang quản trị hồ sơ riêng cho HDV nằm ngoài giao diện Bottom Sheet di động.
