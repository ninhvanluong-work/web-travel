# Authentication Specification (SignIn & SignUp)

Tài liệu đặc tả này mô tả chi tiết yêu cầu, UI/UX flow và cấu trúc dữ liệu API cho 2 màn hình Đăng ký (`SignUpPage`) và Đăng nhập (`SignInPage`). Dữ liệu được xác nhận dựa trên Swagger và kết quả test API thực tế.

---

## 1. Màn hình Đăng ký (SignUpPage)

### 1.1. Mục tiêu

Cho phép người dùng chưa có tài khoản thực hiện đăng ký tài khoản mới trên hệ thống thông qua Email và Mật khẩu.

### 1.2. Phân tích API (`POST /auth/register`)

- **Base URL:** `https://web-travel-be.fly.dev`
- **Headers:**
  - `Content-Type: application/json`
  - `accept: application/json`
- **Request Payload:**
  ```json
  {
    "email": "user@example.com",
    "password": "string"
  }
  ```
- **Response Trả về (Thành công - 200 OK):**
  ```json
  {
    "data": null,
    "code": 200,
    "message": "register user successfully",
    "error": null
  }
  ```

### 1.3. Yêu cầu Giao diện (UI) & Trải nghiệm (UX)

- **Form Fields:**
  - `Email Input`: Trường bắt buộc. Cần validate đúng định dạng email chuẩn.
  - `Password Input`: Trường bắt buộc. Có biểu tượng mắt (toggle) để ẩn/hiện mật khẩu. Yêu cầu độ dài tối thiểu (ví dụ: 6 ký tự).
- **Hành động:**
  - Nút **Đăng ký (Submit)**: Khi nhấn, disable nút và hiển thị trạng thái loading (spinner) trong lúc chờ API phản hồi.
  - Text link: "Đã có tài khoản? Đăng nhập" -> Chuyển hướng về trang `/sign-in`.
- **Luồng xử lý:**
  1. Validate dữ liệu tại Client (Sử dụng React Hook Form + Zod).
  2. Gọi API `POST /auth/register`.
  3. **Thành công:**
     - Hiển thị Toast Message (Thông báo) "Đăng ký thành công".
     - Chuyển hướng người dùng về trang Đăng nhập (`SignInPage`). Có thể truyền kèm email vừa đăng ký qua state/query để fill sẵn vào ô đăng nhập.
  4. **Thất bại:**
     - Hiển thị Toast Error dựa trên lỗi trả về (ví dụ: "Email đã tồn tại").

---

## 2. Màn hình Đăng nhập (SignInPage)

### 2.1. Mục tiêu

Cho phép người dùng đã có tài khoản truy cập vào hệ thống và lấy chuỗi xác thực (Token) cho các thao tác tiếp theo.

### 2.2. Phân tích API (`POST /auth/login`)

- **Base URL:** `https://web-travel-be.fly.dev`
- **Headers:**
  - `Content-Type: application/json`
  - `accept: application/json`
- **Request Payload:**
  ```json
  {
    "email": "user@example.com",
    "password": "string"
  }
  ```
- **Response Trả về (Thành công - 200 OK):**
  _(Lưu ý: Thực tế API trả về key là `token` thay vì `accessToken` như trong Swagger)_
  ```json
  {
    "data": {
      "token": "eyJhbGciOi...",
      "refreshToken": "eyJhbGciOi...",
      "user": {
        "id": "uuid-string",
        "name": null,
        "email": "user@example.com"
      }
    },
    "code": 200,
    "message": "user login successfully",
    "error": null
  }
  ```

### 2.3. Yêu cầu Giao diện (UI) & Trải nghiệm (UX)

- **Form Fields:**
  - `Email Input`: Trường bắt buộc. Nhớ lại email nếu được chuyển hướng từ trang Đăng ký.
  - `Password Input`: Trường bắt buộc. Có biểu tượng mắt để ẩn/hiện.
- **Hành động phụ:**
  - Text link: "Quên mật khẩu?" -> Điều hướng sang luồng khôi phục mật khẩu.
- **Hành động chính:**
  - Nút **Đăng nhập (Submit)**: Disable và hiển thị loading khi submit.
  - Text link: "Chưa có tài khoản? Đăng ký ngay" -> Chuyển hướng về trang `/sign-up`.
- **Luồng xử lý:**
  1. Validate dữ liệu tại Client.
  2. Gọi API `POST /auth/login`.
  3. **Thành công:**
     - Trích xuất `response.data.token` và `response.data.refreshToken`.
     - Lưu Token vào bộ nhớ cục bộ (Cookies / Local Storage) tùy cơ chế bảo mật dự án.
     - Trích xuất `response.data.user` và lưu vào Global State (Zustand / Redux / Context) để dùng ở các màn hình khác (như Header Avatar).
     - Chuyển hướng (Redirect) vào Trang chủ (`/`) hoặc màn hình Dashboard.
     - Hiển thị Toast "Đăng nhập thành công".
  4. **Thất bại:**
     - Hiển thị Toast Error (Sai email hoặc mật khẩu).

---

## 3. Các tính năng tạm thời bỏ qua (Out of Scope)

- **Đăng nhập/Đăng ký bằng Google (Sign in with Google):** Chức năng đăng nhập qua nền tảng thứ 3 (OAuth) tạm thời không thực hiện trong giai đoạn này. Các form chỉ tập trung vào Email và Password cơ bản.

---

## 4. Các Yêu cầu & Cập nhật Mới (Đã xác nhận)

### 4.1. Màn hình Đăng ký (SignUpPage)

- **Bổ sung Checkbox "Tôi là Tour Guide"**:
  - Tại form đăng ký, thêm một Checkbox cho phép người dùng xác nhận vai trò của họ là Tour Guide.
  - **Luồng API**: Khi người dùng tích chọn checkbox này, hệ thống sẽ thêm tham số (ví dụ: `isTourGuide: true` hoặc `role: "guide"`) trực tiếp vào payload của API `POST /auth/register`. Backend sẽ chịu trách nhiệm xử lý logic và khởi tạo đồng thời cả tài khoản User và profile Tour Guide.
  - **Cập nhật Payload**:
    ```json
    {
      "email": "user@example.com",
      "password": "string",
      "isTourGuide": true
    }
    ```

### 4.2. Xử lý UI/UX Thông báo lỗi (Error Toast)

- **Thông điệp rõ ràng**: Ở màn hình Đăng nhập, thay vì hiển thị lỗi chung chung ("Something went wrong" / "Đã xảy ra lỗi"), hệ thống bắt buộc phải hiển thị thông báo cụ thể: **"Email hoặc mật khẩu không đúng."** khi đăng nhập thất bại do sai thông tin.
- **Tự động đóng (Auto-close)**: Các Toast thông báo lỗi (Error Alert) cần được cài đặt thời gian tự động đóng sau **1 đến 2 giây** (VD: `duration: 2000`) để không làm vướng màn hình của người dùng.
- **Sửa lỗi Layout Toast**: Căn chỉnh lại bố cục của Alert component khi không có mô tả (Description), đảm bảo Text và Icon được căn giữa theo chiều dọc (Fix lỗi `translate-y` và margin bottom gây lệch bố cục).

### 4.3. Ẩn nút đăng nhập bên thứ 3 (OAuth)

- **Comment code (Tạm ẩn)**: Tạm thời comment (ẩn) nút **"Sign in with Google"** (hoặc các nền tảng khác) cùng với dòng chữ ngăn cách **"Or"** trên UI của cả form Đăng nhập và Đăng ký, vì tính năng này hiện tại Out of Scope và chưa được implement.

---

## 5. Ý tưởng Animation Cao cấp (Premium Motion Design)

Để trải nghiệm Đăng nhập/Đăng ký toát lên vẻ "chuyên gia" (Expert Level) và khác biệt hoàn toàn với các form cơ bản, hệ thống sẽ ứng dụng **Framer Motion** cho các hiệu ứng sau:

### 5.1. Page Load: Staggered Entrance (Xuất hiện xếp tầng)

- Thay vì toàn bộ form hiện ra cùng một lúc một cách thô cứng, các thành phần sẽ xuất hiện lần lượt từ trên xuống dưới (Tiêu đề -> Subtitle -> Email -> Mật khẩu -> Nút Submit).
- **Physics**: Dùng hiệu ứng `spring` (lò xo) với độ trễ (delay) `0.05s` giữa các phần tử. Form sẽ mượt mà "trượt" nhẹ từ dưới lên kèm hiệu ứng rõ dần (fade-in).

### 5.2. Seamless Route Transition (Chuyển đổi mượt giữa SignIn <-> SignUp)

- Hiện tại khi người dùng bấm "Chưa có tài khoản? Đăng ký", trang web bị tải lại hoặc form chớp giật thay đổi.
- **Ý tưởng "Chuyên gia"**: Ứng dụng `AnimatePresence` và `layoutId`. Các trường dùng chung (Email, Password, Nút Submit) sẽ **đứng yên và tự động dãn cách ra (resize)**, trong khi các trường mới (Checkbox Tour Guide, Nhập lại mật khẩu) sẽ mượt mà trượt từ trên xuống và đẩy các phần tử khác ra. Không có bất kỳ khoảng chớp giật nào (Seamless morphing).

### 5.3. Micro-interactions (Tương tác siêu nhỏ)

- **Error Shake (Rung báo lỗi)**: Thay vì chỉ hiện dòng chữ đỏ tĩnh khi sai mật khẩu, ô input sẽ rung nhẹ sang hai bên (Horizontal Shake Animation) trong `0.3s`, bắt chước hành vi lắc đầu "Không đúng". Đây là tiêu chuẩn trên iOS.
- **Magnetic Button (Nút bấm từ tính)**: Nút Submit khi Hover sẽ có hiệu ứng `scale: 1.02` kèm vòng sáng nhẹ (glow). Khi bấm (Tap) sẽ lún nhẹ xuống `scale: 0.97` mô phỏng phản hồi vật lý.
- **Liquid Loading**: Khi nhấn Submit, thay vì vô hiệu hóa (disabled) nút một cách nhàm chán, chữ "Sign In" sẽ mờ đi (fade-out), nút sẽ co lại một chút và một vòng Loading spinner mượt mà sẽ xuất hiện ở giữa.

### 5.4. Floating & Focus States

- Khi nhấn Focus vào ô Input, viền ô sẽ chuyển sang màu xanh Brand kèm một bóng đổ (Subtle Shadow) lan tỏa mượt mà.
- (Tùy chọn) Biến Label "Email", "Mật khẩu" thành dạng **Floating Label**: Nằm bên trong ô input, khi gõ chữ thì nhãn tự động thu nhỏ và bay lên mép trên cùng của viền input.

---

## 6. Kiến trúc Single Page Auth (Khuyến nghị Chuyên gia)

Dựa trên phân tích hành vi người dùng, hệ thống sẽ gộp luồng Đăng nhập và Đăng ký thành một kiến trúc **Single Page Auth** thay vì 2 trang vật lý rời rạc.

### 6.1. Cấu trúc Component chung

- Tạo một component bao bọc (Ví dụ: `AuthLayout` hoặc `AuthContainer`).
- Sử dụng State nội bộ (Ví dụ: `const [view, setView] = useState<'signIn' | 'signUp'>('signIn')`) để quyết định hiển thị form nào.
- Vẫn hỗ trợ 2 URL (`/sign-in` và `/sign-up`) thông qua Shallow Routing của Next.js để phục vụ SEO và Deep Linking, nhưng thực chất cả 2 URL đều render chung một gốc Component.

### 6.2. Lợi ích UX (Tránh Account Amnesia)

- Khách hàng không bị ngắt quãng trải nghiệm (không load lại trang) khi phải chuyển đổi qua lại giữa Đăng nhập và Đăng ký nếu họ quên mất việc mình đã có tài khoản hay chưa.
- **Duy trì Context**: Nếu khách hàng gõ `email` ở màn hình Đăng nhập nhưng nhận ra mình chưa có tài khoản, khi chuyển sang Đăng ký, trường `email` đó sẽ được giữ nguyên (Retain state), giảm thiểu tối đa thao tác nhập liệu lại (Frictionless).

---

## 7. Trải nghiệm sau Đăng nhập (Post-Login UX cho Tour Guide)

Để tối ưu hóa luồng làm việc của những người dùng có vai trò là **Tour Guide**, hệ thống bổ sung một cơ chế điều hướng toàn cục (Global Navigation):

### 7.1. Global "Back to Profile" Button (Expanding FAB)

- **Vấn đề**: Khi Tour Guide truy cập vào các trang khác (Ví dụ: Trang chủ, Tìm kiếm tour, hoặc xem profile của guide khác), họ rất dễ bị "lạc" và mất nhiều thao tác để tìm đường quay lại trang Quản lý Profile của chính mình.
- **Giải pháp UX**: Bất cứ khi nào User đang đăng nhập có `role === 'guide'`, hệ thống sẽ render một nút **Floating Action Button (FAB)** trôi nổi ở góc dưới màn hình (Bottom Right) trên mọi trang (trừ trang Profile của họ).
- **Thiết kế UI & Tương tác (Expanding FAB)**:
  - **Trạng thái tĩnh**: Một nút tròn chứa Avatar thu nhỏ của Guide (hoặc Icon Tour Guide).
  - **Khi Hover**: Nút tròn mượt mà kéo dài sang ngang thành hình hạt đậu (Pill), để lộ dòng chữ: _"Quản lý Tour Guide Profile"_.
- **Hiệu ứng thu hút sự chú ý (Attention-grabbing Animations)**:
  1. **Auto-expand Hint (Bật mở gợi ý ban đầu)**: Lần đầu tiên trang load, nút sẽ xuất hiện ở trạng thái ĐÃ MỞ RỘNG (hiện rõ chữ) trong vòng 3 giây để khách hàng đọc được. Sau đó nó mới tự động thu gọn lại thành hình tròn. Điều này cam kết 100% User hiểu nút tròn đó có ý nghĩa gì.
  2. **Radar Pulse (Nhịp đập Radar)**: Khi ở trạng thái tròn thu gọn, thỉnh thoảng (mỗi 10s) sẽ có một vòng sáng (ripple shadow) lan tỏa nhẹ từ nút ra xung quanh giống như nhịp tim, nhắc nhở khéo léo về sự tồn tại của nó.
  3. **Scroll Reactivity**: Khi User cuộn trang xuống sâu (để đọc content), nút mờ đi một chút (opacity: 0.5) để tránh che chữ. Khi cuộn ngược lên (hành vi muốn rời đi), nút lập tức sáng rực rỡ 100% trở lại.
- **Hành vi**: Click vào nút này sẽ ngay lập tức điều hướng (`router.push`) về `/guide/{tourGuideId}`.
