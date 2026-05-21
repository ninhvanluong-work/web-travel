# Spec: Product Tags Multi-Select

## 1. Vấn đề hiện tại (Context)

- **UI hiện tại (`TagsInputField`)**: Cho phép người dùng nhập tự do các tag dưới dạng chuỗi văn bản (ví dụ: gõ "Best Seller" và nhấn Enter).
- **Yêu cầu API**: API tạo/cập nhật Sản phẩm không nhận mảng chuỗi văn bản (text), mà yêu cầu một mảng **`tagIds`** (các UUID của tag đã được định nghĩa sẵn trong hệ thống).
  ```json
  "tagIds": [
    "3fa85f64-5717-4562-b3fc-2c963f66afa6"
  ]
  ```
- **Vấn đề**: Việc nhập liệu tự do trên UI đang bị sai lệch (mismatch) hoàn toàn so với thiết kế của API.

## 2. Giải pháp đề xuất (Proposed Solution)

Thay thế cơ chế gõ văn bản tự do bằng một **Multi-Select Combobox** (Menu thả xuống cho phép tìm kiếm và chọn nhiều lựa chọn có sẵn).

May mắn là trong thư mục `src/components/ui/` đã có sẵn component **`MultipleAutoComplete`** (`multiple-autocomplete.tsx`), được build dựa trên `Command` (cmdk) và `Popover`. Component này hoàn toàn phù hợp để giải quyết bài toán này.

## 3. Các thay đổi kỹ thuật chi tiết (Implementation Details)

### 3.1 Cập nhật Validation Schema

File: `src/lib/validations/product.ts`

- Đổi tên biến `tags` thành `tagIds`.
- Cập nhật kiểu dữ liệu thành mảng chứa UUID.

```diff
- tags: z.array(z.string()).optional().nullable(),
+ tagIds: z.array(z.string().uuid()).optional().nullable(),
```

### 3.2 Luồng người dùng (User Flow)

- **Hiển thị (View)**: Khi vào trang Edit Product, form sẽ tự động hiển thị các tags hiện đang gắn với sản phẩm đó (ví dụ: `Hehe`, `mountain`) dưới dạng các Badges/Chips.
- **Thêm vào sản phẩm (Add/Select)**: Người dùng bấm vào ô nhập, một menu xổ xuống chứa danh sách các tag khả dụng. Người dùng có thể tìm kiếm và click chọn. Tag được chọn sẽ được gán vào sản phẩm.
- **Xóa khỏi sản phẩm (Remove)**: Trên mỗi Badge/Chip của tag đang được gán, sẽ có nút `x`. Người dùng bấm vào để gỡ tag đó ra khỏi sản phẩm.

### 3.3 Tái cấu trúc (Refactor) Component `TagsInputField`

File: `src/modules/AdminProduct/ProductFormPage/components/shared/tags-input-field.tsx`

**Trước khi sửa:**

- Lưu trữ mảng chuỗi: `['Tag 1', 'Tag 2']`
- Lắng nghe phím Enter/Phẩy để push text vào mảng.

**Sau khi sửa:**

- Import component `<MultipleAutoComplete />`.
- Kết nối `options` của `<MultipleAutoComplete />` với danh sách Tags lấy từ API (hoặc Mock Data nếu chưa có API).
  Format của option: `{ value: tag.id, label: tag.name }`
- Khi người dùng click chọn trên menu, component sẽ tự động lưu mảng `tag.id` vào React Hook Form.

### 3.3 Tích hợp vào API và Form

- Đảm bảo khi gửi data qua `adapter.ts` (nếu có) hoặc khi gọi hàm POST/PUT, trường `tagIds` được gửi đi thay vì `tags`.

## 4. Quyết định kỹ thuật (Technical Decisions)

Do hiện tại hệ thống chưa có API `GET /tags` trả về danh sách Master Tags, mà chỉ có dữ liệu tags trả về kèm theo chi tiết từng Product. Do đó, chúng ta quyết định:

- **Sử dụng Dữ liệu giả (Mock Data)**: Tạm thời hard-code một mảng `MOCK_TAGS` trực tiếp trong component `TagsInputField` bằng cách lấy các ID và Name từ payload JSON mẫu mà team đã cung cấp (ví dụ: `Hehe`, `mountain`).
- **Tương lai**: Khi backend phát triển xong API Master Tags, chỉ cần đổi mảng `MOCK_TAGS` này thành giá trị trả về từ `useQuery`.
