# Spec: Tính năng Edit Profile (Tab Career) - GuideProfilePage

Tài liệu này phân tích và lên thông số kỹ thuật (spec) cho tính năng **Edit Profile** (đặc biệt là màn hình Career) của Tour Guide dựa trên framework **BMAD** (Business, Market, Architecture, Design).

---

## 1. Business (Mục tiêu Kinh doanh & Giá trị)

- **Cá nhân hóa và tự chủ**: Trao quyền cho các Tour Guide tự quản lý, cập nhật lịch sử nghề nghiệp và portfolio của họ một cách chủ động.
- **Tăng độ tin cậy (Trust)**: Hồ sơ chi tiết với lịch sử công tác rõ ràng (số lượng tour, số năm kinh nghiệm) giúp tăng độ uy tín trong mắt khách du lịch, từ đó thúc đẩy tỷ lệ chuyển đổi (booking rate).
- **Dữ liệu phong phú (Data Richness)**: Khuyến khích Guide đóng góp nội dung chất lượng cao cho nền tảng (thông qua cập nhật Career và thêm Moments/Clips), giúp hệ sinh thái Web Travel luôn mới mẻ.

## 2. Market/User (Thị trường & Người dùng mục tiêu)

- **Đối tượng**: Tour Guides (Local Experts / Hướng dẫn viên bản địa).
- **Đặc điểm & Hành vi**: Thường xuyên di chuyển, thao tác chủ yếu trên thiết bị di động (Mobile). Thời gian rảnh rỗi ít và ngắt quãng.
- **Pain points (Vấn đề hiện tại)**: Khó khăn trong việc tạo CV chuyên nghiệp; sợ mất dữ liệu khi đang nhập do mạng chập chờn.
- **User Needs**:
  - Giao diện tối giản, dễ nhập liệu ngay trên điện thoại.
  - Có thể thêm nhiều vị trí công tác và thay đổi thứ tự dễ dàng.
  - Liên kết trực tiếp đến việc quản lý nội dung thực tế (Moments/Video clips).

## 3. Architecture (Kiến trúc & Kỹ thuật)

> [!NOTE]
> Phân tích này dựa trên cấu trúc component hiện có tại `src/modules/GuideProfilePage/components/edit-profile-sheet.tsx` và `edit-profile-career-section.tsx`.

- **Cấu trúc Component (Component Tree)**:
  - `EditProfileSheet`: Container chính dạng Bottom Sheet (Sheet UI pattern), quản lý state đóng/mở và Draft Recovery.
  - `Tabs` (Profile, Expertise, Career): Điều hướng giữa các section.
  - `MobileCareerSection`: Chứa danh sách các form đăng ký kinh nghiệm làm việc.
  - `CareerEntry`: Mỗi block kinh nghiệm làm việc (Accordion/Card).
- **State Management & Form**:
  - Sử dụng `react-hook-form` kết hợp `useFieldArray` để quản lý mảng dữ liệu `careerPath`.
  - Hỗ trợ tính năng **Reorder** (Di chuyển Up/Down) và **Remove** (Xóa kèm tính năng Undo trong 5 giây).
- **Data Model (Career Item)**:
  ```typescript
  {
    role: string; // Job Title (Vị trí)
    company: string; // Nơi làm việc / Tổ chức
    startYear: number; // Năm bắt đầu
    endYear: number | null; // Năm kết thúc (null nếu là current)
    isCurrent: boolean; // Công việc hiện tại
    tourCount: number; // Số lượng tour đã dẫn (Number of Tours)
    description: string; // Mô tả ngắn
  }
  ```
- **Draft & Recovery Mechanism**: Tích hợp local draft để không mất dữ liệu nếu guide lỡ tay đóng Sheet hoặc ứng dụng bị reload.

## 4. Design (UI/UX - Dựa theo Mockup)

> [!TIP]
> Giao diện cần tập trung mạnh vào trải nghiệm Mobile-first (overscroll-contain, cảm ứng vuốt mượt mà).

- **Layout Structure**:
  - Giao diện dạng **Bottom Sheet** với góc bo tròn lớn (rounded-t-3xl), cho cảm giác một ứng dụng Native, vuốt (swipe) để đóng.
  - **Header**: Tiêu đề "Edit Profile" cố định trên cùng, kèm ID và Tên Guide.
  - **Tab Navigation**: Các tab "Profile", "Expertise", "Career" dạng gạch chân khi active (màu xanh brand).
- **Career Card (Accordion) Interactions**:
  - Mỗi vị trí (POSITION #2) có thể mở rộng (expand) hoặc thu gọn (collapse).
  - Có các Action Buttons (Icon): Caret Up/Down (thay đổi thứ tự) và Trash (xoá).
- **Form Controls**:
  - Input field bo góc (rounded-md), label rõ ràng phía trên.
  - Tổ chức Grid: Các trường ngắn như `Start Year`, `End year`, `Number of Tours` xếp cạnh nhau (flex-row) giúp tối ưu diện tích màn hình.
  - Checkbox/Indicator: "Current position" dạng dấu chấm (bullet) hoặc toggle nhẹ nhàng.
  - **Nút "Add career experience"**: Dạng outline đứt khúc (dashed border) giúp định thị rõ đây là hành động tạo mới.
- **Moments Integration**:
  - Một Entry Card riêng rẽ phía dưới mục Career cho phép click để mở tính năng "Manage tour moments". Thiết kế dạng card có mũi tên điều hướng (›) để biểu thị luồng đi tiếp (Navigation).
- **Sticky Footer (Action Bar)**:
  - Cố định dưới đáy màn hình với 2 nút: "Cancel" (Outlined) và "Save changes" (Filled dark).
  - Trạng thái Saving (Loading spinner) khi submit form.

---

## 5. Sáng kiến & Ý tưởng Mở rộng (Ideation via BMAD)

Dựa trên framework BMAD, dưới đây là các sáng kiến đột phá giúp nâng tầm tính năng Edit Profile, biến nó từ một form nhập liệu khô khan thành một công cụ mạnh mẽ:

### 🔥 Business (Đột phá Doanh thu & Tương tác)

1. **Gamification (Game hoá) Hồ Sơ**:
   - _Sáng kiến_: Thêm thanh tiến trình "Profile Completion". Khi Guide điền đủ thông tin Career & upload ít nhất 3 Moments, họ nhận được huy chương "Top Local Expert".
   - _Giá trị_: Kích thích Guide cung cấp dữ liệu, thuật toán có thể ưu tiên hiển thị (boost ranking) cho các hồ sơ hoàn thiện, từ đó tăng tỷ lệ booking.
2. **Shoppable Moments (Video/Ảnh chốt sale)**:
   - _Sáng kiến_: Trong lúc chỉnh sửa Career và thêm Moments, cho phép Guide tag/gắn link các gói Tour liên quan trực tiếp vào hình ảnh/video.
   - _Giá trị_: Tăng tỷ lệ chuyển đổi chéo. Khách xem profile -> xem clip -> click đặt tour ngay trong clip.

### 💡 Market/User (Giải quyết Pain point tinh tế)

3. **AI Auto-Suggest cho Profile**:
   - _Sáng kiến_: Khi Guide gõ "Role" (VD: _Trekking Guide_), hệ thống AI tự động gợi ý đoạn "Short Description" chuyên nghiệp bằng nhiều ngôn ngữ.
   - _Giá trị_: Giúp các Guide (đặc biệt là người không giỏi viết lách) tạo ra CV thu hút khách quốc tế một cách dễ dàng và tốn ít thời gian nhất.
4. **Offline Draft & Auto-Sync**:
   - _Sáng kiến_: Guide thường xuyên ở những khu vực sóng yếu (rừng, núi, đảo). Form Edit Profile cần được thiết kế offline-first (lưu Local Storage) và sẽ hiện thông báo: "Đã lưu nháp offline. Sẽ đồng bộ khi có mạng".
   - _Giá trị_: Loại bỏ hoàn toàn sự ức chế vì mất dữ liệu do rớt mạng.

### ⚙️ Architecture (Tối ưu Hệ thống)

5. **Profile Versioning (Quản lý Phiên bản Hồ sơ)**:
   - _Sáng kiến_: Hỗ trợ Guide tạo nhiều "Profile Preset" (Ví dụ: CV chuyên Tour Mùa Đông, CV chuyên Tour Mạo Hiểm).
   - _Kiến trúc_: Lưu trữ dữ liệu dạng document snapshots. Khi cần, Guide có thể switch qua lại giữa các bản CV chỉ với 1 click thay vì nhập lại từ đầu.
6. **Lazy-loading Video Thumbnail**:
   - _Sáng kiến_: Vì phần Moments có thể chứa video nặng, kiến trúc cần tự động generate ảnh thumbnail siêu nhẹ (WebP) trên server, và chỉ load video khi khách hover/click.

### 🎨 Design (Trải nghiệm WOW)

7. **Instant Preview Mode (Xem trước tức thì)**:
   - _Sáng kiến_: Thay vì phải lưu rồi thoát ra xem, cung cấp nút **"Preview"** ngay góc trên màn hình Edit. Giao diện lật (flip animation) sang chế độ "Góc nhìn của Khách hàng".
   - _Giá trị UX_: Tạo cảm giác kiểm soát hoàn toàn và tức thời.
8. **Interactive Career Timeline**:
   - _Sáng kiến_: Biến danh sách công việc nhàm chán thành một "Trục thời gian" (Timeline) dọc sinh động. Khi Guide kéo thả (Haptic Drag & Drop) để đổi thứ tự, các đường kẻ nối timeline uốn lượn mượt mà nhờ Framer Motion.
   - _Giá trị UX_: Tăng sự thích thú khi thao tác. Cảm giác app cao cấp và khác biệt.

---

## 6. Tiêu chuẩn UI/UX Cao cấp (Premium UX Standards - Tab Profile)

Dựa trên nguyên lý thiết kế tối ưu hóa không gian và thao tác người dùng (giữ nguyên hoàn toàn cấu trúc nghiệp vụ/API hiện tại), dưới đây là các tiêu chuẩn bắt buộc cho màn hình **Profile**:

### 6.1. Tối ưu Không gian & Mật độ (Spatial Optimization)

- **Tái cấu trúc Layout**:
  - Gộp các trường thông tin ngắn (VD: `Years of experience`) lên cùng một hàng (`flex-row`) với trường khác hoặc chuyển đổi thành dạng Bộ đếm (Stepper: `[-] 5 [+]`) để tiết kiệm diện tích cuộn dọc.
  - Áp dụng Auto-resize cho `<textarea>` của mục "About me", giúp ô nhập liệu tự động dãn nở theo số lượng text được gõ, tránh thanh cuộn lồng nhau (nested scroll).

### 6.2. Cân bằng Thị giác (Visual Hierarchy & Color Balancing)

- **Language Selector (Pills)**:
  - Thêm Cờ quốc gia (Emoji/SVG) bên cạnh tên ngôn ngữ giúp tăng tốc độ nhận diện.
  - Giảm sắc độ chói của các nút đang Active (sử dụng nền màu xanh nhạt kết hợp viền xanh đậm) để mắt người dùng không bị "hút" hoàn toàn khỏi các trường nhập liệu chính. Khi có ngôn ngữ được chọn, chữ bên trong dùng màu tương phản cao (thường là trắng) để đảm bảo Accessibility.
- **Form Controls & Feedback**:
  - Viền (border) ô input cần sắc nét hơn so với nền.
  - Thêm Micro-interactions (vòng sáng Glow & Subtle shadow) khi input được Focus.
  - Real-time Positive Feedback: Hiển thị icon check xanh (✅) mờ ở góc input ngay khi người dùng nhập dữ liệu hợp lệ.

### 6.3. Hoạt ảnh Tương tác (Framer Motion Animations)

- **Staggered Entrance**: Khi mở form, các trường nhập liệu xuất hiện lần lượt từ trên xuống dưới (Slide-up & Fade-in) với độ trễ (delay) `0.05s`.
- **Magic Tab Indicator**: Đường gạch chân active ở menu (Profile | Expertise | Career) trượt ngang mượt mà (morphing) giữa các Tab bằng thuộc tính `layoutId`.
- **Bouncy Touch Targets**: Các nút bấm (như nút Ngôn ngữ, nút Save) co lại nhẹ (`scale: 0.95`) khi chạm/nhấn (whileTap) để mô phỏng tính vật lý.
- **Smooth Error Reveal**: Các cảnh báo lỗi (nếu có) được bọc trong `<AnimatePresence>`, trượt mở từ từ (`height: 0` -> `auto`) thay vì giật cục đẩy content bên dưới.
- **Interactive Sticky Footer**: Nút Save Changes hiển thị Spinner xoay mượt mà và làm mờ nút Cancel khi đang ở trạng thái Saving. Thêm bóng đổ (`shadow-top`) cho footer để tách biệt hẳn với vùng cuộn nội dung.

---

## 7. Giải pháp Xử lý "Lỗi Câm" (Hidden Validation Errors)

Dựa trên phản hồi thực tế (Bấm Save không được nhưng form im lặng), đây là lỗ hổng UX phổ biến khi dùng form nhiều Tab hoặc Accordion:

- **Nguyên nhân**: Khi thêm một mục Career mới (`POSITION #2`) nhưng chưa điền dữ liệu, form sẽ ở trạng thái `Invalid` (không hợp lệ). Tuy nhiên, vì mục đó đang bị thu gọn (Collapsed) hoặc người dùng đang ở Tab khác, các dòng cảnh báo chữ đỏ (như _Bắt buộc nhập_) bị giấu đi. Hệ thống chặn việc gửi dữ liệu (Submit) nhưng lại không có phương thức thông báo (Feedback) nào cho người dùng.
- **Giải pháp UX**:
  1. **Global Error Toast**: Thêm một thuộc tính `onError` vào `FormWrapper`. Mỗi khi người dùng bấm "Save changes" mà form không hợp lệ, hệ thống sẽ bật một thông báo Toast (Alert) nhỏ ở góc màn hình: _"Vui lòng kiểm tra lại các trường thông tin bắt buộc"_.
  2. **Auto-expand (Mở rộng tự động)**: Kịch bản hoàn hảo nhất là hệ thống tự động phát hiện lỗi đang nằm ở `POSITION` nào, và tự động mở bung (expand) thẻ Accordion đó ra để người dùng nhìn thấy ngay lập tức dòng chữ đỏ.

---

## 8. Tính Nhất quán & Luồng Dữ liệu (Consistency & Data Flow)

Dựa trên việc rà soát chi tiết UI hiện tại, chúng ta cần chuẩn hóa lại một số yếu tố thị giác và logic nhập liệu:

### 8.1. Dấu sao đỏ bắt buộc (Required Field Asterisks)

- **Vấn đề**: Ở tab Profile, dấu `*` ở ô "Full name" có màu đỏ rõ ràng. Nhưng sang tab Career, dấu `*` ở "Job Title" và "Company" lại có màu xám/xanh chìm vào nền chữ. Điều này vi phạm nguyên tắc **Nhất quán (Consistency)** trong thiết kế UI.
- **Quy chuẩn UX**: Tất cả các trường bắt buộc (Required) trên toàn bộ hệ thống phải sử dụng thống nhất một class màu cảnh báo (VD: `text-red-500`). Khách hàng không cần phải suy đoán xem trường nào là bắt buộc.

### 8.2. Ý nghĩa của "Current position" (Vị trí hiện tại)

- **Tại sao lại cần?**: Trong bất kỳ form CV hay Portfolio nào, hệ thống luôn cần biết công việc này đã kết thúc chưa hay bạn vẫn đang làm. Nếu bạn đánh dấu "Current position", hệ thống sẽ tự hiểu và hiển thị ra ngoài màn hình Profile là: `2023 - Present` (hoặc `2023 - Nay`). Nếu không có nó, hệ thống sẽ bị lỗi hiển thị hoặc buộc bạn phải nhập một năm kết thúc ảo ở tương lai.
- **Vấn đề UI hiện tại**: Giao diện đang dùng một dấu chấm nhỏ (`◦ Current position`) trông giống một dòng text chú thích hơn là một thành phần có thể tương tác (Checkbox/Toggle).
- **Quy chuẩn UX**:
  1. Biến nó thành một **Checkbox** hoặc **Toggle Switch** rõ ràng để người dùng biết có thể bấm vào.
  2. **Logic tương tác (Interactive Logic)**: Khi tick chọn "Current position", ô nhập liệu `End year` ngay lập tức bị vô hiệu hóa (Disabled/Grayed out) hoặc ẩn đi. Điều này giúp UX cực kỳ mượt mà vì người dùng hiểu ngay: _"À, đang làm ở đây thì không cần nhập năm kết thúc nữa"_.

---

## 9. Tối ưu UX Tab Expertise (Chuyên môn)

Mục Expertise cần được thiết kế lại để ngăn chặn dữ liệu rác (Dirty Data) và cải thiện thị giác:

### 9.1. Chuẩn hóa màu sắc Tag (Chips)

- **Vấn đề**: Các tag chuyên môn đang có màu nền ngẫu nhiên (đỏ nhạt, vàng nhạt) gây nhiễu loạn thị giác (Visual Noise) và không mang ý nghĩa phân loại.
- **Giải pháp**: Đồng bộ sử dụng một màu nền thanh lịch duy nhất (ví dụ: `bg-slate-100` hoặc màu Brand nhạt) cho tất cả các tag. Điều này giúp giao diện trở nên chuyên nghiệp và "sạch" hơn.

### 9.2. Loại bỏ nút "+ Add" (Tối ưu điểm nhìn)

- **Vấn đề**: Nút `+ Add` màu xanh đậm quá nổi bật, vô tình trở thành điểm nhấn chính của màn hình, cạnh tranh trực tiếp với nút `Save changes`.
- **Giải pháp UX**:
  - Gỡ bỏ hoàn toàn nút `+ Add` dạng khối.
  - Tích hợp một icon dấu `+` nhỏ mờ bên trong góc phải của ô Input (tương tự thanh Search).
  - Áp dụng chuẩn **Keyboard Accessibility**: Người dùng gõ xong chữ, chỉ cần bấm phím `Enter` hoặc dấu phẩy (`,`) là text tự động "bay" lên trên biến thành Tag.

### 9.3. Gợi ý tự động (Combobox / Auto-suggest)

- **Vấn đề**: Việc cho phép gõ tự do (Free-text) dẫn đến lỗi chính tả (VD: _Trenkking_ thay vì _Trekking_), hoặc không đồng nhất viết hoa/viết thường.
- **Giải pháp UX**: Biến ô Input thành một dạng **Combobox**. Khi người dùng gõ ký tự đầu tiên, hệ thống sẽ thả xuống (Dropdown) một danh sách các chuyên môn chuẩn đã có sẵn. Nếu người dùng cố tình nhập từ mới, hệ thống phải tự động **Capitalize** (Viết hoa chữ cái đầu) trước khi lưu để đảm bảo dữ liệu database luôn sạch đẹp.

---

## 10. Đánh giá & Tối ưu Luồng Validate (Validation Architecture)

Khi phân tích sâu vào Schema Validate (Zod) và cấu trúc nhiều Tab của hệ thống, tôi phát hiện ra những lỗ hổng tiềm ẩn (Edge Cases) có thể làm vỡ UX nếu không được xử lý triệt để:

### 10.1. Lỗ hổng Cross-Field Validation (Validate chéo)

- **Tình trạng hiện tại**: Trong schema của `careerPath`, biến `endYear` đang được set là `optional()` (không bắt buộc).
- **Lỗi Tiềm ẩn**: Nếu một Guide điền `startYear: 2023`, bỏ trống `endYear` và KHÔNG tick vào `Current position`, form **vẫn cho phép lưu**. Kết quả là CV của họ sẽ hiển thị lỗi thời gian (`2023 - undefined`). Hơn nữa, hiện chưa có logic chặn việc `startYear` lớn hơn `endYear` (VD: Bắt đầu 2025, kết thúc 2020).
- **Giải pháp Code**: Bổ sung `z.refine` vào Zod Schema để ràng buộc:
  1. Nếu `!isCurrent` thì `endYear` là bắt buộc.
  2. `endYear` phải >= `startYear`.

### 10.2. "Bẫy" Lỗi Đa Tab (Multi-Tab Validation Trap)

- **Tình trạng hiện tại**: Khi chia form thành 3 Tab (Profile, Expertise, Career). Nút "Save changes" nằm ở Footer dùng chung cho cả 3 tab.
- **Lỗi Tiềm ẩn**: Giả sử Guide đang đứng ở tab **Career** và bấm Save. Nhưng họ lỡ xóa trắng ô "Full name" bên tab **Profile** (trường bắt buộc). Lúc này, `react-hook-form` sẽ chặn việc Save lại. Giải pháp bật Toast thông báo (đã đề cập ở mục 7) là tốt, nhưng chưa đủ "thông minh" vì Guide không biết lỗi nằm ở Tab nào.
- **Giải pháp Tối thượng (Ultimate UX)**:
  - Trong hàm `onError` của form, ta bắt lấy Object `errors`.
  - Quét xem `errors` đang nằm ở trường nào. Nếu `errors` chứa `name` hoặc `languages`, hệ thống **tự động nhảy (auto-switch tab)** ngược về tab `Profile`. Nếu lỗi nằm ở `careerPath`, nhảy sang tab `Career` và tự động mở bung (auto-expand) thẻ vị trí đang bị lỗi.
  - Đây là tiêu chuẩn thiết kế "Defensive UX" (Phòng thủ) cao nhất để người dùng không bao giờ bị lạc lối.

---

## 11. Đánh giá UX Hộp thoại Cảnh báo (Alert Dialog)

Thông qua ảnh chụp màn hình hộp thoại **"Discard changes?"** (Hủy bỏ thay đổi?), có thể thấy component `AlertDialog` hiện tại đang bị lỗi cả về mặt thẩm mỹ (Visual) lẫn cấu trúc hành vi (Behavioral UX):

### 11.1. Lỗi Thẩm mỹ & Phân bổ (Visual & Layout Issues)

- **Thông báo không cân đối**: Tiêu đề "Discard changes?" và mô tả đang được căn trái (Left-aligned), nhưng khoảng trắng xung quanh (Padding) và khoảng cách tới các nút bên dưới bị ép lại khiến tổng thể hộp thoại trông lỏng lẻo. Đối với các hộp thoại ngắn (Alert), tiêu chuẩn UX hiện đại thường căn giữa (Center-aligned) để tập trung sự chú ý.
- **Nút bấm (Buttons) biến dạng**: Các nút "Cancel" và "Discard" đang có màu nền xanh lá mạ (green-yellow), padding siêu nhỏ, và bo góc lệch lạc. Chúng trông hoàn toàn lạc quẻ so với phong cách thiết kế Premium của các nút ở ngoài Form.

### 11.2. Lỗ hổng Trải nghiệm (Behavioral UX Flaws)

- **Sai màu sắc cảnh báo (Destructive Action)**: Hành động "Discard" (Vứt bỏ/Hủy) là một hành động nguy hiểm vì nó làm mất dữ liệu. Theo quy chuẩn UX, nút này **bắt buộc phải mang màu đỏ cảnh báo** (`variant="destructive"`).
- **Tranh chấp thị giác (Visual Conflict)**: Nút "Cancel" (giữ lại dữ liệu) và nút "Discard" (xóa dữ liệu) đang có cùng một kiểu dáng (cùng màu nền xanh). Người dùng bắt buộc phải dừng lại đọc chữ thay vì nhận diện bằng màu sắc, làm tăng Tải trọng nhận thức (Cognitive Load). Nút Cancel nên là nút viền trong suốt (`variant="outline"` hoặc `ghost`).

### 11.3. Tiêu chuẩn Sửa đổi (Resolution Specs)

Trong component `EditProfileSheet` (chứa AlertDialog):

1. **Button Variants**: Cập nhật lại `<AlertDialogCancel>` thành giao diện `outline` (trắng viền xám). Cập nhật `<AlertDialogAction>` (nút hủy bỏ/discard) thành màu đỏ (destructuve color) thay vì màu đen mặc định.
2. **Button Layout**: Chỉnh lại flex layout cho 2 nút này trải đều (1:1) thay vì ôm sát nhau ở góc phải, sử dụng `flex-1` cho cả hai.

## 12. Tối ưu UX/UI Header Accordion (Tab Career)

### 12.1. Nút Lên/Xuống (Up/Down Arrows)

- **Vấn đề UX**: Việc dùng hai mũi tên nhỏ xíu để di chuyển thứ tự công việc là một thiết kế UX quá cũ (từ những năm 2010). Trên điện thoại, hai nút này quá nhỏ, vi phạm nguyên tắc "Kích thước điểm chạm" (Touch Target Size), cực kỳ dễ bấm nhầm.
- **Quyết định UX (Có cần không?)**: **HOÀN TOÀN KHÔNG CẦN THIẾT**.
- **Giải pháp**: Như đã đề cập ở Mục 8 (Interactive Career Timeline), chúng ta sẽ áp dụng **Kéo thả (Drag & Drop)**. Người dùng chỉ cần chạm giữ và kéo thẻ lên xuống mượt mà. Việc loại bỏ 2 nút này giúp giải phóng không gian và làm UI "sạch" hơn gấp nhiều lần.

### 12.2. Nút Xóa (Delete/Trash Icon)

- **Vấn đề UX**: Nút xóa nằm ngay cạnh nút mở rộng (Expand) thẻ. Đây là "điểm chết" (Fat-finger Trap) - người dùng định bấm mở xem chi tiết công việc nhưng lại lỡ tay bấm nhầm nút Xóa, dẫn đến mất dữ liệu một cách tức tưởi.
- **Giải pháp UX**:
  - Ẩn nút thùng rác khỏi thanh tiêu đề (Header).
  - Di chuyển chức năng "Xóa" vào **bên trong** phần nội dung mở rộng (Content). Đặt nó ở dưới cùng của form dưới dạng một nút text màu đỏ: `"Xóa công việc này" (Remove this position)`.
  - Điều này ép người dùng phải Mở thẻ ra -> Cuộn xuống dưới -> Bấm nút đỏ. Logic này tuy mất thêm 1 click nhưng lại an toàn tuyệt đối, tránh hoàn toàn sự cố xóa nhầm.
