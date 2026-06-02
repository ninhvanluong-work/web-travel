---
title: 'Admin – Thay thế API lấy danh sách video'
created: '2026-06-02'
status: 'draft'
domain: 'admin'
---

# Spec: Admin – Thay thế API lấy danh sách video

## 1. Vấn đề / Mục tiêu

Hiện tại, chức năng liên kết video trong trang quản lý sản phẩm (`src/modules/AdminProduct`) đang sử dụng API lấy danh sách video cũ (`GET /video` thông qua hàm `getListVideo` với các tham số `query`, `distanceScore`).

Để chuẩn hóa luồng quản trị và tối ưu hiệu năng tìm kiếm/phân trang video của Admin, chúng ta cần thay thế bằng API chuyên dụng mới:

- **API Endpoint**: `/video/admin`
- **Method**: `GET`
- **Query parameters**:
  - `keyword` (string, optional): Từ khóa tìm kiếm theo tên/mô tả video.
  - `page` (number, default: 1): Số trang hiện tại.
  - `pageSize` (number, default: 50): Số lượng video trên một trang.

---

## 2. Hành vi mong muốn

Khi Admin tìm kiếm video trong trang thêm/sửa sản phẩm (`ProductFormPage`), cả hai vị trí tìm kiếm video sẽ đổi sang API mới:

1. **Sidebar Video Card** (`VideoCard.tsx`): Tìm kiếm khi admin nhập vào ô tìm kiếm ở sidebar.
2. **Main Form Video Search Field** (`video-search-field.tsx`): Tìm kiếm trong form chính khi liên kết video.

| Thao tác trên UI                   | Hành vi gọi API                                                | Ánh xạ dữ liệu hiển thị                    |
| :--------------------------------- | :------------------------------------------------------------- | :----------------------------------------- |
| Nhập từ khóa tìm kiếm (vd: "Long") | Gửi request `GET /video/admin?keyword=Long&page=1&pageSize=50` | Hiển thị danh sách kết quả từ `data.items` |
| Xóa từ khóa tìm kiếm / Dropdown mở | Gửi request `GET /video/admin?page=1&pageSize=50`              | Hiển thị toàn bộ video của trang đầu tiên  |

### Ánh xạ dữ liệu (Response Mapping):

Response trả về từ `/video/admin` có dạng:

```json
{
  "data": {
    "items": [
      {
        "id": "8eb2e790-620f-4816-8dd7-37e3e30989a6",
        "name": "LongVideo",
        "slug": "longvideo-jt2k",
        "url": null,
        "embedUrl": "https://player.mediadelivery.net/embed/622547/4b99925c-3057-422b-a106-82b4ac8702cb",
        "shortUrl": "https://web-travel.b-cdn.net/file/preview/2026/06/wt_1780407903871.mp4",
        "thumbnail": "https://vz-186cf1b9-231.b-cdn.net/4b99925c-3057-422b-a106-82b4ac8702cb/thumbnail.jpg",
        "description": "LongVideo",
        "tag": "LongVideo",
        "like": 0,
        "type": "normal"
      }
    ],
    "pagination": {
      "page": 1,
      "pageSize": 50,
      "total": 1,
      "totalPages": 1
    }
  },
  "code": 200,
  "message": "ok",
  "error": null
}
```

Dữ liệu của từng item từ API `/video/admin` trùng khớp với interface `ApiVideoItem`, do đó hàm mapper `toVideo` sẵn có vẫn hoạt động chính xác:

- `id` -> `id`
- `name` -> `title`
- `slug` -> `slug`
- `url` -> `link`
- `shortUrl` -> `shortUrl`
- `embedUrl` -> `embedUrl`
- `thumbnail` -> `thumbnail`
- `description` -> `description`
- `like` -> `likeCount`
- `tag` -> `tag`
- `type` -> `type`

---

## 3. Thay đổi kỹ thuật

### 3.1. Danh sách file thay đổi

| File                                                                                | Hành động  | Mô tả thay đổi                                                                                                    |
| :---------------------------------------------------------------------------------- | :--------- | :---------------------------------------------------------------------------------------------------------------- |
| `src/api/video/requests.ts`                                                         | **MODIFY** | Khai báo và xuất hàm `getListVideoAdmin` để gọi API `/video/admin` với các tham số `keyword`, `page`, `pageSize`. |
| `src/modules/AdminProduct/ProductFormPage/components/sidebar/VideoCard.tsx`         | **MODIFY** | Thay thế import `getListVideo` bằng `getListVideoAdmin` và cập nhật logic gọi hàm tìm kiếm.                       |
| `src/modules/AdminProduct/ProductFormPage/components/shared/video-search-field.tsx` | **MODIFY** | Thay thế import `getListVideo` bằng `getListVideoAdmin` và cập nhật logic gọi hàm tìm kiếm.                       |

### 3.2. Thiết kế logic chi tiết

#### Hàm gọi API mới trong `requests.ts`:

```typescript
export const getListVideoAdmin = async (variables?: {
  keyword?: string;
  page?: number;
  pageSize?: number;
}): Promise<IVideo[]> => {
  const { data } = await request<ApiListResponse<ApiVideoItem>>({
    url: '/video/admin',
    method: 'GET',
    params: {
      page: variables?.page ?? 1,
      pageSize: variables?.pageSize ?? 50,
      ...(variables?.keyword && { keyword: variables.keyword }),
    },
  });
  return data.data.items.map(toVideo);
};
```

---

## 4. Dependencies & Conflicts

- **Depends on:** None
- **Modifies:** Component hiển thị danh sách video và tìm kiếm trong Admin Product Form
- **Must NOT break:** Chức năng xem/tìm kiếm video tại `AdminVideo` (quản lý video lớn) đang dùng `/video` cũ và các trang client bên ngoài.
- **Conflicts with:** None

---

## 5. Out of scope

- Thay đổi API xóa, sửa, hoặc tạo mới video.
- Thay đổi API `getVideoById` (`/video/id/${id}`).
