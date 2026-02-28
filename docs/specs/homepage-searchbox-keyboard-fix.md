# Spec: SearchBox Keyboard Push Fix (HomePage)

**Ngày tạo:** 2026-02-28  
**Trạng thái:** Draft  
**Module:** `src/modules/HomePage`

---

## Vấn đề

Khi user tap vào `SearchBox` ở `HomePage` trên mobile, **keyboard native bật lên** khiến browser tự động scroll input vào view — override animation và làm SearchBox bị **đẩy ra ngoài màn hình**, không nhìn thấy được.

### Cơ chế gây ra

```
User tap SearchBox
  → onClick: setIsFocused(true) → SearchBox animate top-[80%] → top-28
  → Browser: auto scroll-to-focused-input (để input không bị keyboard che)
  → Hai tác động xung đột → layout nhảy / SearchBox mất
```

---

## Giải pháp: Scroll to Top khi Focus

> Giữ nguyên toàn bộ hệ thống hiện tại, chỉ thêm logic **cancel browser's auto-scroll** và **force scroll(0,0)** khi SearchBox được focus.

### Luồng xử lý mới

```
User tap SearchBox
  → onClick: setIsFocused(true) → SearchBox animate top-[80%] → top-28
  → onFocus: requestAnimationFrame → window.scrollTo(0, 0)   ← [MỚI]
  → Keyboard mở → visualViewport resize → window.scrollTo(0, 0) ← [MỚI]
  → SearchBox đã ở top-28, keyboard che phần dưới → SearchBox vẫn thấy ✅
```

---

## Thay đổi kỹ thuật

### File 1: `src/modules/HomePage/components/SearchBox.tsx`

Thêm `onFocus` vào `<Input>` để cancel browser's auto-scroll ngay khi input được focus:

```tsx
// Thêm vào <Input> component (sau onClick)
onFocus={() => {
  // Cancel browser's auto-scroll-to-input behavior
  requestAnimationFrame(() => {
    window.scrollTo(0, 0);
  });
}}
```

> **Lý do dùng `requestAnimationFrame`:** đảm bảo chạy sau khi browser xử lý focus event, nhưng trước khi browser thực hiện render scroll.

---

### File 2: `src/modules/HomePage/index.tsx`

Thêm `useEffect` lắng nghe `visualViewport resize` để xử lý Android Chrome (viewport thực sự co lại khi keyboard mở):

```tsx
// Thêm useEffect mới trong HomePage component
useEffect(() => {
  if (!isFocused) return;

  const vv = window.visualViewport;
  if (!vv) return;

  const handleResize = () => window.scrollTo(0, 0);

  vv.addEventListener('resize', handleResize);
  return () => vv.removeEventListener('resize', handleResize);
}, [isFocused]);
```

> **Lý do cần cả 2:** `onFocus` + `requestAnimationFrame` xử lý iOS Safari (visual viewport scroll); `visualViewport resize` xử lý Android Chrome (viewport thực sự thay đổi kích thước).

---

## Tóm tắt thay đổi

| File                 | Thay đổi                                       | Số dòng thêm |
| -------------------- | ---------------------------------------------- | ------------ |
| `SearchBox.tsx`      | Thêm `onFocus` vào `<Input>`                   | ~3 dòng      |
| `HomePage/index.tsx` | Thêm `useEffect` với `visualViewport` listener | ~10 dòng     |

**Không thay đổi:** animation, state `isFocused`, suggestion tags, layout, routing.

---

## Platform Coverage

| Platform       | Behavior khi keyboard mở                     | Xử lý bởi                           |
| -------------- | -------------------------------------------- | ----------------------------------- |
| iOS Safari     | Visual viewport scroll (layout không resize) | `onFocus` + `requestAnimationFrame` |
| Android Chrome | Viewport resize thật                         | `visualViewport resize` listener    |
| Desktop        | Không có keyboard native                     | Không ảnh hưởng                     |
