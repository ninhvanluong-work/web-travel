# Authentication Validation Specification

Tài liệu này mô tả chi tiết các quy tắc kiểm tra (validation rules) cho dữ liệu đầu vào tại các biểu mẫu xác thực (Authentication Forms), bao gồm Đăng nhập (SignIn) và Đăng ký (SignUp). Mục tiêu là đảm bảo tính an toàn, nhất quán và trải nghiệm tốt nhất cho người dùng.

---

## 1. Màn hình Đăng nhập (SignInPage)

Form đăng nhập tập trung vào việc kiểm tra tính hợp lệ cơ bản nhằm ngăn chặn việc gửi request sai định dạng lên server, nhưng không kiểm tra quá khắt khe các rule bảo mật (như độ dài, ký tự đặc biệt) để duy trì khả năng tương thích với các tài khoản cũ.

### 1.1. Trường `Email`

- **Required**: Bắt buộc nhập.
  - _Error Message_: `Email is required`
- **Format**: Phải đúng định dạng chuẩn của email (ví dụ: `name@domain.com`).
  - _Error Message_: `Please enter a valid email address`
- **Max length**: Giới hạn tối đa 255 ký tự (ngăn chặn payload quá lớn).
- **Data Transform**:
  - Hệ thống tự động `trim()` (xóa khoảng trắng thừa ở đầu/cuối) trước khi đẩy dữ liệu.

### 1.2. Trường `Password`

- **Required**: Bắt buộc nhập.
  - _Error Message_: `Password is required`
- _Lưu ý_: Không áp dụng kiểm tra độ dài tối thiểu (min length) hoặc ký tự đặc biệt (regex) tại bước này.

### 1.3. Trường `Remember Me` (Nếu có)

- **Type**: `Boolean`
- **Default**: `false`
- **Optional**: Không bắt buộc.

---

## 2. Màn hình Đăng ký mới (SignUpPage)

Form đăng ký yêu cầu kiểm tra dữ liệu đầu vào khắt khe hơn để đảm bảo các tài khoản mới tạo trên hệ thống đạt tiêu chuẩn bảo mật.

### 2.1. Trường `Email`

- **Required**: Bắt buộc nhập.
  - _Error Message_: `Email is required`
- **Format**: Đúng định dạng chuẩn email.
  - _Error Message_: `Please enter a valid email address`
- **Max length**: Tối đa 255 ký tự.
- **Data Transform**:
  - `trim()` (xóa khoảng trắng thừa)
  - `toLowerCase()` (chuyển toàn bộ về chữ thường để tránh lỗi trùng lặp phân biệt hoa/thường).

### 2.2. Trường `Password`

- **Required**: Bắt buộc nhập.
  - _Error Message_: `Password is required`
- **Min Length**: Tối thiểu 6 ký tự (Tạm thời đồng bộ với Backend hiện tại, sẽ nâng cấp lên 8 ký tự sau).
  - _Error Message_: `Password must be at least 6 characters`
- **Max Length**: Tối đa 100 ký tự.
- **Complexity**: Phải chứa đồng thời:
  - Ít nhất 1 chữ hoa (A–Z)
  - Ít nhất 1 chữ thường (a–z)
  - Ít nhất 1 chữ số (0–9) hoặc 1 ký tự đặc biệt (!@#$%...)
  - _Error Message_: `Password must contain at least 1 uppercase, 1 lowercase, and 1 number or special character`

### 2.3. Trường `isTourGuide`

- **Type**: `Boolean`
- **Default**: `false`
- **Optional**: Cho phép người dùng đánh dấu vai trò Tour Guide ngay từ lúc tạo tài khoản. Không bắt buộc.
