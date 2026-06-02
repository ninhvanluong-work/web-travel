---
title: 'Admin – Tải video trực tiếp trong Form Sản phẩm'
created: '2026-06-02'
status: 'draft'
domain: 'admin'
related: 'video-upload.md'
---

# Spec: Admin – Tải video trực tiếp trong Form Sản phẩm

## 1. Vấn đề / Mục tiêu

Hiện tại, trang thêm/sửa sản phẩm (`src/modules/AdminProduct/ProductFormPage`) cho phép liên kết video với sản phẩm qua trường **Tour Video** (component `VideoSearchField`). Tuy nhiên, người dùng chỉ có thể tìm kiếm và chọn các video đã được tải lên từ trước ở trang **Quản lý Video** (`src/modules/AdminVideo`).

Nếu chưa có video trên hệ thống, người dùng bắt buộc phải:

1. Rời khỏi trang sản phẩm hiện tại (làm mất các dữ liệu đang nhập nếu chưa lưu nháp).
2. Di chuyển sang trang **Quản lý Video**.
3. Thực hiện tải lên video mới và chờ lưu thành công.
4. Quay lại trang sản phẩm và thực hiện tìm kiếm lại video vừa tải lên để liên kết.

**Mục tiêu:**
Tích hợp trực tiếp chức năng tải lên video mới (với đầy đủ các bước khai báo tên, mô tả, tag và quá trình upload TUS) dưới dạng một Modal Dialog ngay tại trường **Tour Video** của form sản phẩm. Khi tải lên thành công, hệ thống tự động liên kết video mới này với sản phẩm mà không cần người dùng phải chuyển trang hay tìm kiếm lại.

---

## 2. Hành vi mong muốn

Trong cả chế độ **Thêm mới (Add)** và **Cập nhật (Edit)** sản phẩm, hệ thống luôn song song hỗ trợ cả 2 luồng: **chọn video có sẵn từ danh sách** hoặc **tải lên video mới**.

Khi người dùng thao tác ở phần **Tour Video** trong form sản phẩm:

| Hành động                                                         | Kết quả mong đợi                                                                                                                                                                                                                                                                                                                                                                          |
| ----------------------------------------------------------------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Chưa chọn video (Trạng thái trống)                                | Giao diện hiển thị song song:<br>1. Ô tìm kiếm và dropdown danh sách các video đã có trên hệ thống để chọn nhanh.<br>2. Nút **"Upload"** bên cạnh ô tìm kiếm để người dùng chủ động tải lên video mới nếu chưa có sẵn.                                                                                                                                                                    |
| Bấm nút **"Upload"**                                              | Mở Modal Dialog "Upload New Video" với các trường: Tên video (bắt buộc), Mô tả (tùy chọn), Tag (tùy chọn) và Vùng kéo thả file `.mp4`.                                                                                                                                                                                                                                                    |
| Đang upload video, người dùng click ra ngoài hoặc nhấn phím `ESC` | Ngăn chặn đóng modal để bảo vệ tiến trình upload đang diễn ra.                                                                                                                                                                                                                                                                                                                            |
| Người dùng bấm **Tạm dừng (Pause)** / **Tiếp tục (Resume)**       | Tiến trình tải lên thông qua TUS client tạm dừng hoặc tiếp tục chạy từ vị trí cũ.                                                                                                                                                                                                                                                                                                         |
| Người dùng bấm **Hủy (Cancel)** trong lúc upload hoặc tạm dừng    | Hủy tiến trình TUS (`tusInstance.abort()`), sau đó **đóng modal luôn** (`onOpenChange(false)`). Không giữ modal mở với form trống.                                                                                                                                                                                                                                                        |
| TUS upload thành công nhưng `createVideo` API thất bại            | Modal **không đóng**. Hiển thị banner lỗi `"Lưu thông tin thất bại, vui lòng thử lại."` bên trong modal. Hiện nút **"Thử lại lưu"** — gọi lại `saveToDb(bunnyVideoId)` mà không upload lại file (giữ `bunnyVideoId` trong state).                                                                                                                                                         |
| Quá trình upload thành công và lưu DB thành công                  | `VideoUploadDialog` gọi `onUploadSuccess(dbVideo)` để parent cập nhật form, sau đó tự gọi `onOpenChange(false)` để đóng modal. Parent **không** gọi `setIsUploadOpen(false)` trong callback.<br>- Trường `videoId` của form sản phẩm tự động cập nhật với ID video mới.<br>- Giao diện thay đổi sang trạng thái **Linked** hiển thị thumbnail và tiêu đề video mới, kèm nút xóa liên kết. |
| Đang có video được liên kết (Linked), bấm nút `X` (Xóa liên kết)  | - Hủy liên kết video hiện tại (set `videoId` về `null`).<br>- Giao diện quay trở về trạng thái trống (hiển thị lại ô tìm kiếm và nút **"Upload"** để người dùng có thể chọn video khác từ danh sách hoặc tải lên video mới).                                                                                                                                                              |

---

## 3. Thay đổi kỹ thuật

### 3.1. Các thành phần tái sử dụng từ `AdminVideo`

Để tránh trùng lặp code, ta nhập (import) các thành phần giao diện và logic upload từ module `AdminVideo`:

- `UploadDropzone` từ `@/modules/AdminVideo/VideoPage/components/upload-dropzone`
- `UploadProgress` từ `@/modules/AdminVideo/VideoPage/components/upload-progress`
- Các kiểu dữ liệu và hàm validate từ `@/modules/AdminVideo/VideoPage/components/upload-types`

### 3.2. Cấu trúc files thay đổi/thêm mới

| File                                                                                 | Thay đổi                                                                                                                                                                                                   |
| ------------------------------------------------------------------------------------ | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `src/modules/AdminProduct/ProductFormPage/components/shared/video-upload-dialog.tsx` | **[NEW]** Component Modal Dialog bọc toàn bộ form upload và tiến trình tải lên video (tương tự như `VideoUploadCard` nhưng tích hợp trong Radix Dialog).                                                   |
| `src/modules/AdminProduct/ProductFormPage/components/shared/video-search-field.tsx`  | **[MODIFY]** Bổ sung nút **Upload** bên cạnh ô tìm kiếm. Mount component `VideoUploadDialog` và nhận callback `onUploadSuccess` để tự động cập nhật form field `videoId` và state preview `selectedVideo`. |

### 3.3. Chi tiết xử lý trong `VideoUploadDialog`

```tsx
interface VideoUploadDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onUploadSuccess: (video: ApiAdminVideoItem) => void;
}
```

- Sử dụng `Dialog` từ `@/components/ui/dialog` làm wrapper.
- Quản lý trạng thái upload (`UploadState`) và thông tin form nhập liệu (`UploadFormState`) giống hệt `VideoUploadCard`.
- Khi đóng Modal (`onOpenChange` gọi với `false`):
  - Kiểm tra `BUSY_STATUSES` (import từ `upload-types`): `{ 'preparing', 'uploading', 'paused', 'processing' }`. Nếu `uploadState.status` thuộc tập này → ngăn chặn đóng (bỏ qua event, không gọi `onOpenChange(false)`). Trạng thái `error` và `success` **không** chặn.
  - Người dùng phải bấm **Hủy (Cancel)** để dừng TUS trước — khi đó dialog tự gọi `onOpenChange(false)`.
- Sau khi `saveToDb` thành công: gọi `onUploadSuccess(dbVideo)` rồi `onOpenChange(false)`. Parent không cần đóng modal từ callback.
- Khi `saveToDb` thất bại: set `status: 'error'`, `phase: 'saving'`, giữ `bunnyVideoId` trong state, hiện nút **"Thử lại lưu"**. Modal không đóng.

### 3.4. Chi tiết xử lý trong `VideoSearchField`

```tsx
// Thêm state kiểm soát mở modal upload
const [isUploadOpen, setIsUploadOpen] = useState(false);

// Thay đổi giao diện phần input tìm kiếm:
<div className="flex gap-2">
  <div className="relative flex-1">
    <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none z-10" />
    <Input
      size="sm"
      fullWidth
      placeholder="Search videos..."
      className="pl-9"
      value={query}
      onChange={(e) => { ... }}
      ...
    />
    {showDropdown && ( ... )}
  </div>

  <VideoUploadDialog
    open={isUploadOpen}
    onOpenChange={setIsUploadOpen}
    onUploadSuccess={(dbVideo) => {
      setValue('videoId', dbVideo.id);
      setSelectedVideo({
        id: dbVideo.id,
        slug: dbVideo.slug,
        title: dbVideo.name,
        link: dbVideo.url,
        shortUrl: dbVideo.shortUrl,
        embedUrl: dbVideo.embedUrl,
        thumbnail: dbVideo.thumbnail,
        description: dbVideo.description,
        likeCount: dbVideo.like,
        tag: dbVideo.tag,
        type: dbVideo.type,
        uploadingStatus: dbVideo.uploadingStatus,
        product: null, // ApiAdminVideoItem không trả về product — default null
      });
      // Không gọi setIsUploadOpen(false) ở đây — VideoUploadDialog tự đóng
    }}
  />
</div>
```

---

## 4. Dependencies & Conflicts

- **Depends on:**
  - Cấu hình API endpoint `/upload/video` và các biến môi trường Bunny Stream trong `.env.local`.
  - API function `createVideo` trong `src/api/video/requests.ts`.
  - Thư viện `tus-js-client`.
- **Modifies:**
  - `src/modules/AdminProduct/ProductFormPage/components/shared/video-search-field.tsx`
- **Must NOT break:**
  - Tiến trình upload video độc lập ở trang quản lý video `/admin/videos` (phải hoạt động song song bình thường).
  - Không phá vỡ layout CSS của trường `Tour Video` và phần nhập giá bên cạnh trong `BasicInfoSection`.

---

## 5. Out of scope

- Cho phép chỉnh sửa thông tin (tên, mô tả, tag) của video đã chọn ngay tại form sản phẩm (muốn sửa phải qua trang quản lý video).
- Tải lên nhiều video cùng lúc tại form sản phẩm (mỗi sản phẩm hiện tại chỉ liên kết với tối đa 1 video chính `heroVideo`).

---

## 6. Decisions (đã xác nhận)

| #   | Điểm                      | Quyết định                                                                                         |
| --- | ------------------------- | -------------------------------------------------------------------------------------------------- |
| 1   | TUS ok, DB fail           | Hiển thị lỗi trong modal + nút "Thử lại lưu", modal không đóng — giống hệt `VideoUploadCard`.      |
| 2   | `isBusy` definition       | `BUSY_STATUSES` từ `upload-types.ts`: `{ 'preparing', 'uploading', 'paused', 'processing' }`.      |
| 3   | Reuse components          | `UploadDropzone`, `UploadProgress`, `upload-types` là named export độc lập, import trực tiếp được. |
| 4   | `createVideo` return type | Trả về `ApiAdminVideoItem` — đủ tất cả fields cần mapping. `product: null` là default hợp lệ.      |
| 5   | Ai đóng modal             | `VideoUploadDialog` tự đóng sau success. Parent không gọi `setIsUploadOpen(false)` trong callback. |
| 6   | Cancel behavior           | Hủy TUS → đóng modal luôn (`onOpenChange(false)`). Không giữ form trống.                           |
| 7   | Video type mặc định       | Hardcode `'hero'` — đồng bộ với `VideoUploadCard`.                                                 |
