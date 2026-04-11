---
title: 'Admin – Image Upload via API'
created: '2026-04-08'
status: 'draft'
domain: 'admin'
related: 'form-actions.md'
---

# Spec: Admin – Upload ảnh qua API

## 1. Vấn đề / Mục tiêu

Code hiện tại dùng `FileReader.readAsDataURL()` → lưu **base64** vào form field rồi submit cùng payload sản phẩm. Cần chuyển sang gọi API upload riêng → lưu **CDN URL** vào form field, submit URL khi lưu sản phẩm.

---

## 2. API Upload

```
POST {NEXT_PUBLIC_API_URL}/upload/img
Content-Type: multipart/form-data
Body: file = <binary>
```

- Dùng axios instance tại `src/api/axios.ts` — base URL đã là `NEXT_PUBLIC_API_URL`, path chỉ cần `/upload/img`
- `fileType` = `img` cho tất cả ảnh sản phẩm (hardcode trong path, không phải param)
- Response thành công:

```json
{
  "data": { "fileType": "img", "url": "https://web-travel.b-cdn.net/img/..." },
  "code": 200,
  "message": "upload successfully",
  "error": null
}
```

---

## 3. Hành vi mong muốn

### 3.1. ImageUploadCard (thumbnail, itineraryImage)

| Bước | Hành động người dùng      | Kết quả                                                                                                            |
| ---- | ------------------------- | ------------------------------------------------------------------------------------------------------------------ |
| 1    | Nhấn "Tải lên" / vùng ảnh | Mở file picker                                                                                                     |
| 2    | Chọn file                 | Preview local ngay (`URL.createObjectURL`), show loading spinner trên preview                                      |
| 3    | Đang upload               | Nút bị disable, spinner hiển thị                                                                                   |
| 4    | Upload thành công         | Preview replace bằng CDN URL, `field.onChange(cdnUrl)`, **hiển thị URL bên dưới preview** (truncated, có thể copy) |
| 5    | Upload thất bại           | Show thông báo lỗi nhỏ bên dưới, preview giữ nguyên để thử lại                                                     |

### 3.2. GalleryItem (từng ảnh trong bộ ảnh tour)

| Bước | Hành động người dùng            | Kết quả                                                                                                                        |
| ---- | ------------------------------- | ------------------------------------------------------------------------------------------------------------------------------ |
| 1    | Nhấn "Tải lên" / nhấn slot rỗng | Mở file picker                                                                                                                 |
| 2    | Chọn file                       | Preview local, spinner overlay                                                                                                 |
| 3    | Upload xong                     | `onChange(cdnUrl)` — **CDN URL hiển thị trong input text bên dưới** (read-only sau khi upload, vẫn giữ input để user thấy URL) |
| 4    | Thất bại                        | Inline error bên dưới, giữ state cũ                                                                                            |

### 3.3. Gallery bulk upload (nút "Tải nhiều ảnh")

| Bước | Hành động người dùng                   | Kết quả                                           |
| ---- | -------------------------------------- | ------------------------------------------------- |
| 1    | Nhấn "Tải nhiều ảnh"                   | File picker multi-select                          |
| 2    | Chọn N file                            | Thêm N placeholder loading vào cuối gallery       |
| 3    | Upload song song (tối đa 3 concurrent) | Từng placeholder replace bằng URL khi xong        |
| 4    | Nút "Tải nhiều ảnh"                    | Show progress: `Đang tải 2/5...` trong lúc upload |
| 5    | Tất cả xong                            | Nút trở lại bình thường                           |

---

## 4. Thay đổi kỹ thuật

| File                                                                               | Thay đổi                                                                                               |
| ---------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------ |
| `src/api/upload/index.ts`                                                          | **Tạo mới** — hàm `uploadImage(file: File): Promise<string>` gọi POST `/upload/img`, trả về `data.url` |
| `src/api/upload/types.ts`                                                          | **Tạo mới** — type `UploadResponse`                                                                    |
| `src/modules/AdminProduct/ProductFormPage/components/shared/image-upload-card.tsx` | Thay `FileReader` bằng `uploadImage()`, thêm state `uploading` / `error`                               |
| `src/modules/AdminProduct/ProductFormPage/components/shared/gallery-item.tsx`      | Thay `FileReader` bằng `uploadImage()`, thêm state `uploading`                                         |
| `src/modules/AdminProduct/ProductFormPage/components/sections/images-section.tsx`  | Bulk upload: parallel với tối đa 3 concurrent, progress counter                                        |

### State per upload component

```ts
uploading: boolean; // disable input, show spinner
error: string | null; // inline error message
localPreview: string | null; // URL.createObjectURL — xóa sau khi upload xong
```

### Hàm uploadImage

```ts
// src/api/upload/index.ts
async function uploadImage(file: File): Promise<string> {
  const form = new FormData();
  form.append('file', file);
  // axios instance base URL = NEXT_PUBLIC_API_URL
  const res = await axios.post<UploadResponse>('/upload/img', form, {
    headers: { 'Content-Type': 'multipart/form-data' },
  });
  return res.data.data.url;
}
```

> Dùng axios instance có sẵn tại `src/api/axios.ts` (base = `NEXT_PUBLIC_API_URL`, tự gắn Bearer token).

---

## 5. Dependencies & Conflicts

- **Depends on:** Không có spec nào phải implement trước
- **Modifies:** `image-upload-card.tsx`, `gallery-item.tsx`, `images-section.tsx`
- **Must NOT break:** Form field schema — `thumbnail`, `itineraryImage` vẫn là `string`, `images` vẫn là `{ url: string }[]`
- **Conflicts with:** None

---

## 6. Out of scope

- Upload video / file không phải ảnh
- Xem trước nhiều file trước khi upload (batch preview)
- Crop / resize ảnh trước khi upload
- Reorder gallery bằng drag & drop

---

## 7. Đã chốt

- **Base URL:** `NEXT_PUBLIC_API_URL` + `/upload/img` (hardcode `img`, không dynamic)
- **Hiển thị URL:** Sau upload thành công, CDN URL hiện ra trong UI để user thấy — `ImageUploadCard` hiển thị dưới preview, `GalleryItem` hiển thị trong input text bên dưới ảnh
- **Input text GalleryItem:** Giữ lại sau upload để user thấy URL (không xóa input)
- **Block submit:** Khi còn ảnh đang upload → disable nút Lưu nháp, show tooltip "Vui lòng chờ ảnh tải xong"
