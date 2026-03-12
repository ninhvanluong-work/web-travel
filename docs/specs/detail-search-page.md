# Specification: DetailSearchPage Improvements

Document này mô tả giải pháp kỹ thuật đã được xác nhận cho 3 vấn đề liên quan đến `DetailSearchPage`.

---

## 1. Vấn đề "Trắng Mờ" (White Blur)

**Trạng thái: ĐÃ IMPLEMENT** — `VideoCard.tsx` đã có black overlay `bg-black/60` controlled bởi `isDimmed`. Không cần thay đổi.

---

## 2. Thay đổi hành vi Submit của SearchInput

**Mô tả:** Bỏ debounce tự động. Chỉ gọi API khi user ấn nút kính lúp hoặc GO/Enter trên bàn phím.

**Quyết định đã xác nhận:**

- `SearchInput` là **controlled component**: nhận `value` + `onChange` từ parent.
- `onChange` chỉ cập nhật giá trị hiển thị (`inputValue`), không trigger API.
- Chỉ `onSubmit` mới gọi `setQuery` và trigger API search.
- Sau khi submit: gọi `router.replace('/search?q=...')` (shallow) để cập nhật URL.

**Thay đổi trong `SearchInput.tsx`:**

- Props: `{ value, onChange, onSubmit, onFocus }` (đã đúng, giữ nguyên).
- Icon kính lúp ở bên phải, type `submit`.
- `onChange` trên Input → gọi prop `onChange(e.target.value)`.
- `onSubmit` trên form → gọi prop `onSubmit()`.

**Thay đổi trong `DetailSearchPage/index.tsx`:**

- **Xóa** debounce useEffect (lines 31-34).
- **Giữ** useEffect sync URL → state khi `router.isReady` (lines 23-28).
- `SearchInput` nhận đúng props: `value`, `onChange={setInputValue}`, `onSubmit={handleSubmit}`.
- `handleSubmit`: `setQuery(inputValue)` + `router.replace('/search?q=...')`.

---

## 3. Search Suggestions (Gợi ý)

**Mô tả:** Hiển thị danh sách gợi ý khi input được focus, nổi lên trên VideoGrid.

**Quyết định đã xác nhận:**

### State

- Thêm `isFocused: boolean` vào `DetailSearchPage/index.tsx`.
- `SearchInput` nhận thêm prop `onFocus` → set `isFocused = true`.

### Vị trí render

- Suggestion list render **ngay bên dưới sticky bar**, `position: absolute`, đè lên VideoGrid.
- Render trực tiếp trong `DetailSearchPage/index.tsx` (không trong `SearchInput`) vì cần access `setInputValue` và `setIsFocused`.

### Z-index layering

| Layer                    | z-index |
| ------------------------ | ------- |
| Sticky search bar        | `z-50`  |
| Suggestion list          | `z-45`  |
| Backdrop (`bg-black/60`) | `z-40`  |
| VideoGrid                | `z-0`   |

### Behavior khi click suggestion

- Dùng `onMouseDown` + `e.preventDefault()` (thay vì `onClick`) để tránh race condition với `onBlur`.
- Click suggestion → `setInputValue(suggestion)` + `setIsFocused(false)`.
- **Chưa gọi API** — user phải ấn GO hoặc kính lúp để search.

### Đóng suggestion list

- Click bất kỳ chỗ nào ngoài search bar hoặc suggestion list → `setIsFocused(false)`.
- Dùng backdrop `onClick={() => setIsFocused(false)}` với `pointer-events-auto`.
- Suggestion list và search bar dùng `e.stopPropagation()` hoặc z-index cao hơn backdrop để không bị backdrop bắt click.

### Nút back (chevron trái)

- Navigate back ngay như bình thường, không xử lý `isFocused`.
