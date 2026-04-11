---
title: 'Admin – Form Action Buttons'
created: '2026-04-08'
status: 'draft'
domain: 'admin'
related: 'image-upload.md'
---

# Spec: Admin – Điều chỉnh nút hành động form sản phẩm

## 1. Vấn đề / Mục tiêu

Màn hình **tạo mới** tour đang có 2 nút: "Lưu nháp" + "Đăng tour". Yêu cầu bỏ nút "Đăng tour" ở chế độ tạo mới — tour mới chỉ được lưu nháp, việc đăng công khai thực hiện sau khi đã có đủ thông tin trong màn hình edit.

---

## 2. Hành vi mong muốn

### Chế độ tạo mới (`!isEdit`)

| Nút       | Trước | Sau    |
| --------- | ----- | ------ |
| Lưu nháp  | Có    | Có     |
| Đăng tour | Có    | **Bỏ** |

### Chế độ chỉnh sửa (`isEdit`) — Giữ nguyên

| Trạng thái tour | Nút hiển thị                  |
| --------------- | ----------------------------- |
| `draft`         | Lưu thay đổi + Đăng công khai |
| `published`     | Lưu thay đổi + Ẩn sản phẩm    |
| `hidden`        | Lưu thay đổi + Công khai lại  |

---

## 3. Thay đổi kỹ thuật

| File                                                                          | Thay đổi                                                        |
| ----------------------------------------------------------------------------- | --------------------------------------------------------------- |
| `src/modules/AdminProduct/ProductFormPage/components/form-action-buttons.tsx` | Block `!isEdit`: xóa nút "Đăng tour", chỉ render nút "Lưu nháp" |

### Diff logic

```tsx
// Trước
if (!isEdit) {
  return (
    <>
      <Button onClick={onSaveDraft}>Lưu nháp</Button>
      <Button onClick={onPublish}>Đăng tour</Button> // ← xóa dòng này
    </>
  );
}

// Sau
if (!isEdit) {
  return <Button onClick={onSaveDraft}>Lưu nháp</Button>;
}
```

---

## 4. Dependencies & Conflicts

- **Depends on:** None
- **Modifies:** `form-action-buttons.tsx` — chỉ phần render `!isEdit`
- **Must NOT break:** Logic edit mode (`isEdit = true`) không thay đổi gì
- **Conflicts with:** None

---

## 5. Out of scope

- Thay đổi flow submit / `useProductForm`
- Thêm nút mới (preview, duplicate, v.v.)
- Thay đổi style / icon các nút hiện có
