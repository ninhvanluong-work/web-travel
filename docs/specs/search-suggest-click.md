# Spec: Bấm Suggest → Search Ngay

## 1. Mục tiêu

Khi user bấm vào một chip suggest ở màn hình search, hệ thống search ngay lập tức thay vì chỉ điền vào input.

## 2. Hành vi hiện tại (Bug)

```
User bấm chip suggest
    ↓
setInputValue(suggestion)   ← chỉ điền vào input
setIsFocused(false)         ← đóng dropdown
    ↓
Grid KHÔNG cập nhật — query vẫn cũ
```

## 3. Hành vi mong muốn

```
User bấm chip suggest
    ↓
setInputValue(suggestion)
setQuery(suggestion)        ← trigger search ngay
setIsFocused(false)
blur keyboard
router.replace với ?q=...   ← cập nhật URL
    ↓
Grid cập nhật kết quả mới
```

## 4. Thiết kế kỹ thuật

### Vấn đề với `handleSubmit` hiện tại

`handleSubmit` đọc từ `inputValue` state — nhưng `setInputValue(suggestion)` là async (React batching), nên nếu gọi `handleSubmit()` ngay sau `setInputValue()` thì `inputValue` vẫn còn giá trị cũ.

### Giải pháp: Refactor `handleSubmit` nhận tham số `value?`

```tsx
const handleSubmit = (value?: string) => {
  const trimmed = (value ?? inputValue).trim();
  setQuery(trimmed);
  setIsFocused(false);
  if (document.activeElement instanceof HTMLElement) {
    document.activeElement.blur();
  }
  router.replace(`/search${trimmed ? `?q=${encodeURIComponent(trimmed)}` : ''}`, undefined, { shallow: true });
};
```

### Cập nhật onMouseDown của chip suggest

```tsx
onMouseDown={(e) => {
  e.preventDefault();
  setInputValue(suggestion);  // sync input UI
  handleSubmit(suggestion);   // search ngay với value trực tiếp
}}
```

> `e.preventDefault()` đã có sẵn — giữ nguyên để tránh input mất focus trước khi handler chạy.

## 5. Files thay đổi

- `src/modules/DetailSearchPage/index.tsx` — chỉ 1 file, 2 chỗ thay đổi nhỏ:
  1. Refactor `handleSubmit` nhận optional `value` param
  2. Thêm `handleSubmit(suggestion)` vào `onMouseDown` của chip
