---
title: 'Admin – Cập nhật trạng thái sản phẩm qua API mới'
created: '2026-06-02'
status: 'draft'
domain: 'admin'
related: 'form-actions.md'
---

# Spec: Admin – Cập nhật trạng thái sản phẩm qua API mới

## 1. Vấn đề / Mục tiêu

Hiện tại, khi admin thực hiện xuất bản sản phẩm (Publish/Publish Again) hoặc ẩn sản phẩm (Hide Product), hệ thống đang sử dụng các API cũ hoặc luồng cập nhật chưa tối ưu:

- **Publish / Publish Again**: Gọi API cũ `POST /product/{id}/publish`.
- **Hide Product**: Gọi API cập nhật thông tin chung `PUT /product/{id}` với trường `status` đổi thành `'hidden'`.

Để chuẩn hóa và đồng bộ với thiết kế API mới từ Backend, luồng thay đổi trạng thái sản phẩm (sang `published` hoặc `hidden`) cần được chuyển sang gọi API hợp nhất mới:

- **API Endpoint**: `POST /product/{id}/status/{status}`
- **Method**: `POST`
- **Path parameters**:
  - `id`: ID của sản phẩm (UUID).
  - `status`: Trạng thái mới, nhận một trong hai giá trị: `published` hoặc `hidden`.

---

## 2. Hành vi mong muốn

Khi người dùng thao tác trên màn hình Edit Tour (`isEdit = true`) và click vào các nút hành động tương ứng:

| Button            | Trạng thái hiện tại | API đích cần gọi                      | Trạng thái kết quả |
| :---------------- | :------------------ | :------------------------------------ | :----------------- |
| **Publish**       | `draft`             | `POST /product/{id}/status/published` | `published`        |
| **Publish Again** | `hidden`            | `POST /product/{id}/status/published` | `published`        |
| **Hide Product**  | `published`         | `POST /product/{id}/status/hidden`    | `hidden`           |

### Quy trình xử lý (Flow):

1. **Lưu dữ liệu Form**: Để đảm bảo các thay đổi mới nhất trên form được ghi nhận trước khi đổi trạng thái, hệ thống sẽ thực hiện gọi API cập nhật sản phẩm (`updateMutation`) trước.
2. **Cập nhật trạng thái**: Khi API cập nhật thông tin sản phẩm thành công, hệ thống tiếp tục gọi API đổi trạng thái (`POST /product/{id}/status/{status}`).
3. **Hoàn tất & Điều hướng**:
   - Xóa bản nháp cục bộ (`draft.clearDraftOnSuccess()`).
   - Invalidate cache các query danh sách và chi tiết sản phẩm (`invalidateList()`).
   - Hiển thị Alert thông báo thành công:
     - Khi xuất bản thành công: `"Tour published successfully"` (hoặc `"updated product status successfully!"`).
     - Khi ẩn thành công: `"Tour hidden successfully"` (hoặc `"updated product status successfully!"`).
   - Điều hướng người dùng quay trở về trang danh sách sản phẩm (`/admin/products`).

---

## 3. Thiết kế API & Dữ liệu trả về

### Request chi tiết

- **URL**: `https://web-travel-be.fly.dev/product/{id}/status/{status}`
- **Method**: `POST`
- **Headers**:
  - `Authorization: Bearer <access_token>`
  - `Content-Type: application/json`

### Response mẫu (200 OK / 201 Created)

```json
{
  "data": {
    "id": "0475868b-b412-4c3f-a1fa-a50e9170ba03",
    "createdAt": "2026-06-02T04:24:02.800Z",
    "updatedAt": "2026-06-02T14:47:31.560Z",
    "deletedAt": null,
    "name": "Phu Quoc Food Tour The Art",
    "description": null,
    "shortDescription": "I will take you to explore all signature local food, it's not just a dish, you will explore all stories behind the cuisine, also relaxing at some hidden gem. Just join the journey with us!",
    "slug": "phu-quoc-food-tour-the-art-1t7m",
    "thumbnail": null,
    "code": "IFELYFQO",
    "images": [],
    "banner": [],
    "readBefore": [
      {
        "key": "bring",
        "title": "What to bring",
        "description": "a hungry stomach"
      }
    ],
    "experience": [],
    "itineraryImage": null,
    "highlight": "abc\nxyz\ndi an di uong\nhaha",
    "include": null,
    "exclude": null,
    "status": "published",
    "minPrice": "350000.00",
    "reviewPoint": 0,
    "reviewCount": 0,
    "destinationId": "2ded0138-bcc5-43d2-9bcd-2411275ce0fe",
    "supplierId": "dc6c8abe-6972-44c9-8328-8a6a9ac74c71",
    "supplier": {
      "id": "dc6c8abe-6972-44c9-8328-8a6a9ac74c71",
      "createdAt": "2026-03-01T03:21:24.236Z",
      "updatedAt": "2026-03-01T03:21:24.236Z",
      "deletedAt": null,
      "name": "Saigontourist",
      "contact": "contact@saigontourist.net",
      "avatar": "https://web-travel.b-cdn.net/img/2026/05/wt_1778677202399.jpg",
      "ratingCount": 0,
      "ratingRate": 0,
      "isVerified": false,
      "tourOffered": 0,
      "responseRate": 0,
      "expYears": 1
    },
    "itineraries": [],
    "heroVideo": {
      "id": "18e3ce91-7ff5-49e6-984f-1f768e319722",
      "createdAt": "2026-06-02T14:15:49.696Z",
      "name": "Du lịch tây bắc",
      "embedUrl": "https://player.mediadelivery.net/embed/622547/4bb2f872-7f0d-492a-ac5a-930c40500399",
      "thumbnail": "https://vz-186cf1b9-231.b-cdn.net/4bb2f872-7f0d-492a-ac5a-930c40500399/thumbnail.jpg"
    },
    "tags": [
      {
        "id": "4549503a-968a-43f5-b28d-1c69894387e6",
        "createdAt": "2026-06-02T04:19:12.914Z",
        "updatedAt": "2026-06-02T04:19:12.914Z",
        "deletedAt": null,
        "name": "Phu Quoc"
      },
      {
        "id": "ab7cc64c-e67d-4262-8c09-f88c58b70b5f",
        "createdAt": "2026-06-02T04:19:27.093Z",
        "updatedAt": "2026-06-02T04:19:27.093Z",
        "deletedAt": null,
        "name": "Food Tour"
      }
    ],
    "elements": [
      {
        "id": "c528fd3c-227e-4e88-9f95-656bd929ee8e",
        "createdAt": "2026-05-17T14:19:47.674Z",
        "updatedAt": "2026-05-17T14:19:47.674Z",
        "deletedAt": null,
        "key": "language",
        "name": "EN, FR, VI",
        "description": "Optional description",
        "isActive": true
      }
    ],
    "tourGuides": [
      {
        "id": "2f9f58a3-dd30-4b7e-9d30-90ac643528ce",
        "createdAt": "2026-05-21T23:04:32.411Z",
        "updatedAt": "2026-05-21T23:04:25.482Z",
        "deletedAt": null,
        "name": "Thuận",
        "avatar": null,
        "ratingCount": 1,
        "expYear": 1,
        "ratingValue": 0,
        "quote": null,
        "coverImg": null,
        "summary": null,
        "languages": null,
        "supplierReview": null,
        "userReview": null,
        "careerPath": null
      }
    ]
  },
  "code": 200,
  "message": "updated product status successfully!",
  "error": null
}
```

---

## 4. Thay đổi kỹ thuật dự kiến

### 4.1. Danh sách file thay đổi

| File                            | Hành động  | Mô tả thay đổi                                                                                                       |
| :------------------------------ | :--------- | :------------------------------------------------------------------------------------------------------------------- |
| `src/api/product/requests.ts`   | **MODIFY** | Định nghĩa hàm `postProductStatus` gọi tới API mới `/product/{id}/status/{status}`.                                  |
| `src/api/product/queries.ts`    | **MODIFY** | Đăng ký mutation `useUpdateProductStatus` sử dụng react-query-kit.                                                   |
| `src/hooks/use-product-form.ts` | **MODIFY** | Thay thế `usePublishProduct` cũ bằng `useUpdateProductStatus`. Cập nhật logic `onPublish` và `handleHide` tương ứng. |

### 4.2. Chi tiết Diff logic dự kiến

#### [requests.ts](file:///d:/Remote/web-travel/src/api/product/requests.ts)

Thêm hàm API mới thay thế cho hàm `publishProduct`:

```typescript
// Thêm mới hàm gọi API đổi status
export async function updateProductStatus(id: string, status: 'published' | 'hidden'): Promise<ApiProductDetail> {
  const { data } = await request.post<{ data: ApiProductDetail }>(`/product/${id}/status/${status}`);
  return data.data;
}
```

#### [queries.ts](file:///d:/Remote/web-travel/src/api/product/queries.ts)

Khai báo mutation sử dụng `updateProductStatus`:

```typescript
// Đăng ký hook mutation mới
export const useUpdateProductStatus = createMutation<ApiProductDetail, { id: string; status: 'published' | 'hidden' }>({
  mutationFn: ({ id, status }) => updateProductStatus(id, status),
});
```

#### [use-product-form.ts](file:///d:/Remote/web-travel/src/hooks/use-product-form.ts)

Thay thế hook `usePublishProduct` và cập nhật logic của `onPublish` cũng như xử lý `handleHide`:

```typescript
// Import hook mutation mới
import { useUpdateProductStatus } from '@/api/product';

// ... bên trong hook useProductForm:

// Đổi publishMutation cũ thành updateStatusMutation
const updateStatusMutation = useUpdateProductStatus({
  onSuccess: () => {
    draft.clearDraftOnSuccess();
    invalidateList();
    addAlert({ type: 'success', title: 'Tour status updated successfully' });
    router.push(ROUTE.ADMIN_PRODUCTS);
  },
  onError: (err: any) => {
    addAlert({ type: 'error', title: err?.response?.data?.message ?? 'Failed to update tour status' });
  },
});

// Cập nhật hàm onPublish
const onPublish = (data: ProductFormValues) => {
  if (!isEdit) {
    createMutation.mutate(data);
    return;
  }
  updateMutation.mutate(
    { id: productId!, values: data },
    { onSuccess: () => updateStatusMutation.mutate({ id: productId!, status: 'published' }) }
  );
};

// Cập nhật handleHide để sử dụng API status mới thay vì gửi toàn bộ form với status ẩn
const handleHide = form.handleSubmit((data) => {
  updateMutation.mutate(
    { id: productId!, values: data },
    { onSuccess: () => updateStatusMutation.mutate({ id: productId!, status: 'hidden' }) }
  );
});

// Cập nhật loading state (isPending)
const isPending = createMutation.isPending || updateMutation.isPending || updateStatusMutation.isPending;
```

---

## 5. Kế hoạch xác minh (Verification Plan)

### Kiểm thử thủ công:

1. Truy cập trang quản lý tour và nhấn Edit một tour bất kỳ ở trạng thái `Draft` hoặc `Hidden`.
2. Thay đổi một số thông tin trên form (ví dụ: mô tả ngắn, giá cả) nhưng chưa lưu.
3. Nhấn nút **Publish** (hoặc **Publish Again**).
4. Quan sát Network tab trong Chrome DevTools:
   - Request đầu tiên phải là `PUT /product/{id}` để lưu thông tin cập nhật (HTTP 200/201).
   - Request thứ hai phải là `POST /product/{id}/status/published` (HTTP 200/201).
5. Xác minh có thông báo alert thành công, người dùng được quay về trang danh sách và trạng thái tour đổi thành `Published`.
6. Thực hiện tương tự khi nhấn nút **Hide Product** đối với một tour đang ở trạng thái `Published`. Quan sát cuộc gọi API chuyển sang `POST /product/{id}/status/hidden`.
