# Đặc tả Kỹ thuật (BMAD Spec): Hệ thống Quản lý Session & Đơn giá (Session CRUD & Pricing)

Tài liệu này phân tích chiến lược, nghiệp vụ và thông số kỹ thuật (Spec) cho hệ thống **Quản lý Session & Đơn giá (Session CRUD & Range Pricing)** dựa trên khung làm việc **BMAD** (Business, Market, Architecture, Design).

---

## 1. Business Strategy & Business Rules (BMAD - B)

### 1.1. Mục tiêu Nghiệp vụ (Business Objectives)

- **Linh hoạt giá bán theo ngày (Dynamic Pricing)**: Cho phép thiết lập đơn giá tour khác nhau cho từng ngày trong năm (ngày lễ, cuối tuần, mùa cao điểm/thấp điểm).
- **Tối ưu hóa thao tác vận hành (Bulk Operation)**: Cung cấp tính năng tạo Session theo khoảng thời gian (`date range`), giảm 95% thời gian tạo thủ công 365 ngày cho người quản trị.
- **Bảo đảm toàn vẹn dữ liệu (Data Integrity)**: Mỗi sản phẩm/tour chỉ được phép tồn tại **tối đa 1 Session duy nhất cho 1 ngày (`travelDate`)**. Không cho phép trùng lặp Session trong cùng một ngày cho cùng một `productId`.
- **Cấu hình giá linh hoạt theo đối tượng (`SessionUnits`)**: Mỗi ngày có thể gắn danh sách đơn giá ứng với từng đơn vị khách (`Unit`: Người lớn, Trẻ em, Em bé, VIP...).

### 1.2. Quy tắc Nghiệp vụ Cốt lõi (Business Logic Rules)

1. **Quy tắc Độc nhất ngày (`1 Session = 1 Day per Product`)**:
   - Khóa chính logic: `(productId, travelDate)`.
   - Nếu đã có Session tồn tại vào ngày `travelDate` của `productId`, hệ thống từ chối tạo mới (Backend trả error / Frontend cảnh báo hoặc gợi ý chuyển sang Update).
2. **Quy tắc Tích hợp khi Chỉnh sửa Sản phẩm (`Edit Product Integration`)**:
   - Khi **tạo sản phẩm mới** (`isEdit = false`), mục Session ẩn hoặc hiển thị thông báo yêu cầu lưu sản phẩm trước (do chưa có `productId` chính thức).
   - Chỉ khi **chỉnh sửa sản phẩm đã tồn tại** (`isEdit = true` & có `productId`), phần Quản lý Session & Pricing mới xuất hiện trong trang Admin Product Form.
3. **Quy tắc Popup Thao tác Nhanh tại Màn Danh sách Sản phẩm (`Product List Quick Popup`)**:
   - Trên mỗi dòng sản phẩm tại trang Danh sách Sản phẩm (`/admin/products`), hiển thị nút/icon **"Quản lý Session" (`View / Edit Sessions`)**.
   - Bấm nút sẽ mở một **Popup Modal (`ProductSessionModal`)** ngay tại trang danh sách cho phép xem Lịch, sửa đơn giá, tạo dải ngày mà không phải chuyển sang trang Edit Product đầy đủ.
4. **Quy tắc Tạo hàng loạt (`POST /session/range`)**:
   - Khi chọn `fromDate` đến `toDate`, hệ thống sinh tự động Session cho từng ngày trong khoảng.
   - Đối với các ngày đã có Session: Backend/Frontend tự động bỏ qua các ngày bị trùng.
5. **Quy tắc Đơn giá theo Unit (`SessionUnit Pricing`)**:
   - Một Session lưu mảng `sessionUnits` chứa cặp `(unitId, price)`.
   - Nếu Session chưa được định nghĩa `price` cho `unitId`, mặc định rơi về giá cơ bản của Product hoặc từ chối đặt vé với Unit đó.
6. **Quy tắc Trạng thái (`status`)**:
   - Trạng thái `active`: Cho phép khách hàng tìm kiếm và đặt tour vào ngày đó.
   - Trạng thái `inactive`: Tạm ẩn/khóa đặt tour ngày đó (dù vẫn lưu Session trong DB).

---

## 2. Market & User Experience Requirements (BMAD - M)

### 2.1. Đối tượng Người dùng (Target Persona)

- **Admin / Travel Provider / Tour Manager**: Quản lý lịch khởi hành và bảng giá tour.

### 2.2. Điểm đau của Người dùng (User Pain Points)

- Nhập giá thủ công từng ngày rất tốn thời gian và dễ nhầm lẫn.
- Phải mở cả trang Edit sản phẩm cồng kềnh chỉ để sửa giá 1 ngày lẻ hoặc kiểm tra lịch tour.
- Không biết ngày nào đã tạo Session, ngày nào chưa, dẫn đến tạo trùng gây lỗi booking.

### 2.3. User Stories & Acceptance Criteria

#### User Story 1: Tạo Session đơn lẻ cho một ngày

> _Là Admin, tôi muốn tạo Session cho 1 ngày cụ thể kèm theo đơn giá chi tiết cho từng loại vé (Người lớn, Trẻ em) để mở bán tour cho ngày đó._

- **Acceptance Criteria**:
  - Chọn ngày `travelDate`, chọn trạng thái (`active`/`inactive`), nhập `capacity`.
  - Hiển thị danh sách các `Unit` sẵn có của Product để nhập `price` cho từng Unit.
  - Nếu ngày được chọn đã có Session -> Hiển thị thông báo lỗi "Ngày này đã tồn tại Session, vui lòng chỉnh sửa Session hiện có".

#### User Story 2: Tạo Session hàng loạt theo khoảng thời gian (Range)

> _Là Admin, tôi muốn tạo Session cho cả khoảng thời gian từ `fromDate` đến `toDate` và thiết lập đơn giá mặc định cho các Unit._

- **Acceptance Criteria**:
  - Đơn giản hóa việc chọn `fromDate` và `toDate`.
  - Nhập khung giá chung cho các `Unit` áp dụng cho toàn bộ các ngày trong khoảng.
  - Hệ thống tự động tạo danh sách Session tương ứng.
  - Hiển thị kết quả chi tiết: Số Session được tạo thành công, các ngày bị bỏ qua do đã tồn tại.

#### User Story 3: Xem & Quản lý danh sách Session (Calendar / Table)

> _Là Admin, tôi muốn xem tổng quan danh sách Session dưới dạng Lịch (Calendar) hoặc Bảng (Table) kèm bộ lọc theo thời gian và trạng thái._

- **Acceptance Criteria**:
  - Lọc theo `productId`, `fromDate`, `toDate`, `status`, `keyword`.
  - Phân trang chuẩn (`page`, `pageSize`, `total`, `totalPages`).
  - Giao diện trực quan thể hiện ngày nào active, ngày nào inactive, ngày nào chưa có session.

#### User Story 4: Chỉnh sửa / Xóa Session

> _Là Admin, tôi muốn sửa đơn giá/trạng thái hoặc xóa Session của 1 ngày._

- **Acceptance Criteria**:
  - Cho phép cập nhật `price` của từng `unitId`, thay đổi `capacity`, chuyển trạng thái `active` <-> `inactive`.
  - Cho phép xóa (Delete) Session khi chưa có booking phát sinh.

#### User Story 5: Chế độ Xem Danh sách Session Tổng quan Toàn Hệ thống (`/admin/sessions`)

> _Là Admin, khi tôi truy cập trang Quản lý Session & Pricing chính từ Sidebar Admin, tôi muốn xem ngay tổng quan tất cả các Session của toàn bộ sản phẩm mà không cần bắt buộc phải chọn 1 sản phẩm trước._

- **Acceptance Criteria**:
  - Dropdown `ProductSelector` có lựa chọn mặc định: **"Tất cả sản phẩm" (`All Products`)**.
  - Các thẻ StatCard (`Total`, `Active`, `Inactive`) tính toán tổng số Session toàn hệ thống theo khoảng thời gian chọn.
  - Chế độ Bảng (`Table View`) hiển thị danh sách Session của tất cả các Tour, có thêm cột **Tên Sản phẩm (Product)**.

#### User Story 6: Quick Session Popup trực tiếp tại Màn Danh sách Sản phẩm (`/admin/products`)

> _Là Admin, khi đang xem danh sách sản phẩm tại `/admin/products`, tôi muốn bấm nút "Manage Sessions" trên bất kỳ dòng sản phẩm nào để mở Popup quản lý giá/lịch khởi hành của tour đó ngay lập tức mà không phải tải lại toàn trang._

- **Acceptance Criteria**:
  - Mỗi dòng sản phẩm trên `ProductTable` có nút **"Quản lý Session" (`Manage Sessions`)** kèm icon Calendar và badge đếm số session khả dụng.
  - Click vào nút $\rightarrow$ Mở Popup Modal (`ProductSessionModal`).
  - Trong Popup Modal tích hợp đầy đủ giao diện xem Lịch/Bảng, các nút `+ Tạo 1 ngày`, `+ Tạo dải ngày` và cho phép điều chỉnh giá từng vé.
  - Khi đóng Popup Modal, vị trí cuộn và trạng thái của danh sách sản phẩm được giữ nguyên.

---

## 3. Architecture & Technical Specifications (BMAD - A)

### 3.1. API Contracts & Endpoint Definitions

Hệ thống kết nối với Backend Swagger Endpoint: `https://web-travel-be.fly.dev/docs#/Session`

| HTTP Method | Endpoint         | Mô tả                                             | Key Parameters / Body                                                             |
| ----------- | ---------------- | ------------------------------------------------- | --------------------------------------------------------------------------------- |
| `POST`      | `/session`       | Tạo 1 Session mới cho 1 ngày kèm giá Unit         | Body: `productId`, `travelDate`, `status`, `sessionUnits`                         |
| `POST`      | `/session/range` | Tạo hàng loạt Session trong khoảng thời gian      | Body: `productId`, `fromDate`, `toDate`                                           |
| `GET`       | `/session`       | Lấy danh sách Session (có phân trang & lọc)       | Query: `productId`, `fromDate`, `toDate`, `status`, `keyword`, `page`, `pageSize` |
| `GET`       | `/session/{id}`  | Chi tiết 1 Session theo ID                        | Path: `id`                                                                        |
| `PUT`       | `/session/{id}`  | Cập nhật Session (trạng thái, capacity, giá Unit) | Path: `id`, Body: `status`, `capacity`, `sessionUnits`                            |
| `DELETE`    | `/session/{id}`  | Xóa Session                                       | Path: `id`                                                                        |

---

### 3.2. Detailed Payloads & Response Interfaces

#### A. POST `/session` (Tạo đơn lẻ)

**Request Body**:

```json
{
  "productId": "79e3f3a8-2981-4762-81a6-7d497cf5abf2",
  "travelDate": "2026-08-01",
  "status": "active",
  "capacity": 20,
  "sessionUnits": [
    {
      "unitId": "ad69116d-dfa0-4cdf-b448-ab25f8523405",
      "price": 1500000
    }
  ]
}
```

**Response Success (200/201)**:

```json
{
  "data": {
    "id": "982ad98c-52b4-4acb-9510-db37cf3e8cfa",
    "createdAt": "2026-08-10T13:11:15.694Z",
    "updatedAt": "2026-08-10T13:11:15.694Z",
    "deletedAt": null,
    "productId": "79e3f3a8-2981-4762-81a6-7d497cf5abf2",
    "travelDate": "2026-08-01T00:00:00.000Z",
    "capacity": 20,
    "status": "active",
    "sessionUnits": [
      {
        "id": "ad42d837-6e60-45d6-a62b-11865ab04cfa",
        "createdAt": "2026-08-10T13:11:15.704Z",
        "updatedAt": "2026-08-10T13:11:15.704Z",
        "deletedAt": null,
        "sessionId": "982ad98c-52b4-4acb-9510-db37cf3e8cfa",
        "unitId": "ad69116d-dfa0-4cdf-b448-ab25f8523405",
        "price": "1500000.00",
        "unit": {
          "id": "ad69116d-dfa0-4cdf-b448-ab25f8523405",
          "name": "Long Children",
          "note": null,
          "productId": "79e3f3a8-2981-4762-81a6-7d497cf5abf2"
        }
      }
    ]
  },
  "code": 200,
  "message": "created session successfully",
  "error": null
}
```

#### B. POST `/session/range` (Tạo theo dải ngày)

**Request Body**:

```json
{
  "productId": "79e3f3a8-2981-4762-81a6-7d497cf5abf2",
  "fromDate": "2026-08-01",
  "toDate": "2026-08-05"
}
```

**Response Success (200)**:

```json
{
  "data": [
    {
      "id": "eb78ef4d-da67-4c6f-92b3-56646d90214c",
      "createdAt": "2026-08-10T13:12:50.454Z",
      "updatedAt": "2026-08-10T13:12:50.454Z",
      "deletedAt": null,
      "productId": "79e3f3a8-2981-4762-81a6-7d497cf5abf2",
      "travelDate": "2026-08-02T00:00:00.000Z",
      "capacity": 0,
      "status": "active"
    },
    {
      "id": "40832915-0d13-49c5-877c-9afa7c6fef74",
      "createdAt": "2026-08-10T13:12:50.454Z",
      "updatedAt": "2026-08-10T13:12:50.454Z",
      "deletedAt": null,
      "productId": "79e3f3a8-2981-4762-81a6-7d497cf5abf2",
      "travelDate": "2026-08-03T00:00:00.000Z",
      "capacity": 0,
      "status": "active"
    },
    {
      "id": "5f0c4ca2-4891-469e-b107-d11fbf26f2ad",
      "createdAt": "2026-08-10T13:12:50.454Z",
      "updatedAt": "2026-08-10T13:12:50.454Z",
      "deletedAt": null,
      "productId": "79e3f3a8-2981-4762-81a6-7d497cf5abf2",
      "travelDate": "2026-08-04T00:00:00.000Z",
      "capacity": 0,
      "status": "active"
    },
    {
      "id": "1c3de461-a48d-48d4-9d79-f23cf5cef03a",
      "createdAt": "2026-08-10T13:12:50.454Z",
      "updatedAt": "2026-08-10T13:12:50.454Z",
      "deletedAt": null,
      "productId": "79e3f3a8-2981-4762-81a6-7d497cf5abf2",
      "travelDate": "2026-08-05T00:00:00.000Z",
      "capacity": 0,
      "status": "active"
    }
  ],
  "code": 200,
  "message": "created sessions successfully",
  "error": null
}
```

> [!IMPORTANT] > **Hành vi đặc thù của `POST /session/range`**:
> Khi yêu cầu dải ngày `2026-08-01` -> `2026-08-05`, nếu ngày `2026-08-01` đã có Session từ trước, API Backend sẽ tự động **bỏ qua ngày đã tồn tại** và chỉ khởi tạo các ngày còn trống (`2026-08-02` đến `2026-08-05`). Điều này đảm bảo tuyệt đối không sinh ra Session bị trùng lặp trong cùng 1 sản phẩm.

#### C. GET `/session` (Danh sách)

**Query Parameters**:

- `productId` (string, uuid, optional): ID sản phẩm.
- `fromDate` (string YYYY-MM-DD, optional): Từ ngày.
- `toDate` (string YYYY-MM-DD, optional): Đến ngày.
- `status` (string 'active' | 'inactive', optional): Trạng thái.
- `keyword` (string, optional): Từ khóa tìm kiếm.
- `page` (number, default 1): Trang hiện tại.
- `pageSize` (number, default 10): Số phần tử trên trang.

#### D. GET `/session/{id}` (Chi tiết Session)

**Path Parameter**: `id` (UUID, required).

**Response Success (200)**:

```json
{
  "data": {
    "id": "63d4a623-2571-4183-9210-ae87232a0def",
    "createdAt": "2026-08-08T14:48:05.525Z",
    "updatedAt": "2026-08-08T14:48:05.525Z",
    "deletedAt": null,
    "productId": "0475868b-b412-4c3f-a1fa-a50e9170ba03",
    "travelDate": "2026-08-08T00:00:00.000Z",
    "capacity": 1,
    "status": "active",
    "sessionUnits": [
      {
        "id": "0df1ec7e-166e-4209-810a-23156b3b0489",
        "sessionId": "63d4a623-2571-4183-9210-ae87232a0def",
        "unitId": "3fa85f64-5717-4562-b3fc-2c963f66afa6",
        "price": 1500000,
        "createdAt": "2026-08-10T13:13:23.224Z",
        "updatedAt": "2026-08-10T13:13:23.224Z"
      }
    ]
  },
  "code": 200,
  "message": "ok",
  "error": null
}
```

#### E. PUT `/session/{id}` (Cập nhật Session & Đơn giá)

**Path Parameter**: `id` (UUID, required).

**Request Body**:

```json
{
  "status": "active",
  "capacity": 20,
  "sessionUnits": [
    {
      "unitId": "42b1a09c-6fcb-4826-ba50-dfa24330c4f0",
      "price": 1500000
    }
  ]
}
```

#### F. DELETE `/session/{id}` (Xóa Soft Delete Session)

**Path Parameter**: `id` (UUID, required).

**Response Success (200)**:

```json
{
  "data": {
    "id": "63d4a623-2571-4183-9210-ae87232a0def",
    "createdAt": "2026-08-08T14:48:05.525Z",
    "updatedAt": "2026-08-10T13:16:50.645Z",
    "deletedAt": "2026-08-10T13:16:50.645Z",
    "productId": "0475868b-b412-4c3f-a1fa-a50e9170ba03",
    "travelDate": "2026-08-08T00:00:00.000Z",
    "capacity": 1,
    "status": "active",
    "sessionUnits": []
  },
  "code": 200,
  "message": "deleted session successfully",
  "error": null
}
```

> [!NOTE]
> Backend thực hiện cơ chế **Soft Delete** (cập nhật thuộc tính `deletedAt` chứa ISO timestamp). Quá trình này giữ lại lịch sử giao dịch nhưng ẩn Session khỏi danh sách đặt tour khả dụng.

---

### 3.3. TypeScript Data Layer Specs (`src/api/session/`)

#### 1. File `src/api/session/types.ts`

```typescript
export interface ApiErrorResponse {
  statusCode: number;
  message: string | string[];
  timestamp: string;
  path: string;
}

export function getErrorMessage(error: any): string {
  if (!error) return 'Đã có lỗi xảy ra';
  if (typeof error === 'string') return error;
  if (error.message) {
    if (Array.isArray(error.message)) {
      return error.message.join(', ');
    }
    return String(error.message);
  }
  return String(error) || 'Đã có lỗi xảy ra';
}

export interface ApiUnit {
  id: string;
  createdAt: string;
  updatedAt: string;
  deletedAt: string | null;
  productId: string;
  name: string;
  note: string | null;
}

export interface ApiSessionUnit {
  id: string;
  createdAt: string;
  updatedAt: string;
  deletedAt: string | null;
  sessionId: string;
  unitId: string;
  price: string;
  unit?: ApiUnit;
}

export interface ApiSessionItem {
  id: string;
  createdAt: string;
  updatedAt: string;
  deletedAt: string | null;
  productId: string;
  travelDate: string;
  capacity: number;
  status: 'active' | 'inactive';
  sessionUnits: ApiSessionUnit[];
}

export interface ISessionParams {
  productId?: string;
  fromDate?: string;
  toDate?: string;
  status?: 'active' | 'inactive';
  keyword?: string;
  page?: number;
  pageSize?: number;
}

export interface CreateSessionUnitDto {
  unitId: string;
  price: number;
}

export interface CreateSessionDto {
  productId: string;
  travelDate: string; // YYYY-MM-DD
  status: 'active' | 'inactive';
  capacity?: number;
  sessionUnits?: CreateSessionUnitDto[];
}

export interface CreateSessionRangeDto {
  productId: string;
  fromDate: string; // YYYY-MM-DD
  toDate: string; // YYYY-MM-DD
  status?: 'active' | 'inactive';
  capacity?: number;
  sessionUnits?: CreateSessionUnitDto[];
}

export interface UpdateSessionDto {
  status?: 'active' | 'inactive';
  capacity?: number;
  sessionUnits?: CreateSessionUnitDto[];
}

export interface ApiSessionData {
  items: ApiSessionItem[];
  pagination: {
    page: number;
    pageSize: number;
    total: number;
    totalPages: number;
  };
}

export interface ApiSingleSessionResponse {
  data: ApiSessionItem;
  code: number;
  message: string;
  error: string | null;
}

export interface ApiSessionListResponse {
  data: ApiSessionData;
  code: number;
  message: string;
  error: string | null;
}

export interface ApiSessionRangeResponse {
  data: ApiSessionItem[];
  code: number;
  message: string;
  error: string | null;
}
```

#### 2. File `src/api/session/requests.ts`

```typescript
import { request } from '../axios';
import type {
  ApiSessionData,
  ApiSessionItem,
  ApiSessionListResponse,
  ApiSessionRangeResponse,
  ApiSingleSessionResponse,
  CreateSessionDto,
  CreateSessionRangeDto,
  ISessionParams,
  UpdateSessionDto,
} from './types';

export async function getSessions(params: ISessionParams): Promise<ApiSessionData> {
  const { data } = await request.get<ApiSessionListResponse>('/session', { params });
  return data.data;
}

export async function getSessionById(id: string): Promise<ApiSessionItem> {
  const { data } = await request.get<ApiSingleSessionResponse>(`/session/${id}`);
  return data.data;
}

export async function createSession(dto: CreateSessionDto): Promise<ApiSessionItem> {
  const { data } = await request.post<ApiSingleSessionResponse>('/session', dto);
  return data.data;
}

export async function createSessionRange(dto: CreateSessionRangeDto): Promise<ApiSessionItem[]> {
  const { data } = await request.post<ApiSessionRangeResponse>('/session/range', dto);
  return data.data;
}

export async function updateSession(id: string, dto: UpdateSessionDto): Promise<ApiSessionItem> {
  const { data } = await request.put<ApiSingleSessionResponse>(`/session/${id}`, dto);
  return data.data;
}

export async function deleteSession(id: string): Promise<ApiSessionItem> {
  const { data } = await request.delete<ApiSingleSessionResponse>(`/session/${id}`);
  return data.data;
}
```

#### 3. File `src/api/session/queries.ts` (TanStack React Query Hooks)

```typescript
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import {
  createSession,
  createSessionRange,
  deleteSession,
  getSessionById,
  getSessions,
  updateSession,
} from './requests';
import type { CreateSessionDto, CreateSessionRangeDto, ISessionParams, UpdateSessionDto } from './types';

export const SESSION_QUERY_KEYS = {
  all: ['sessions'] as const,
  list: (params: ISessionParams) => ['sessions', 'list', params] as const,
  detail: (id: string) => ['sessions', 'detail', id] as const,
};

export function useGetSessions(params: ISessionParams, enabled = true) {
  return useQuery({
    queryKey: SESSION_QUERY_KEYS.list(params),
    queryFn: () => getSessions(params),
    enabled,
  });
}

export function useGetSession(id: string, enabled = true) {
  return useQuery({
    queryKey: SESSION_QUERY_KEYS.detail(id),
    queryFn: () => getSessionById(id),
    enabled: enabled && !!id,
  });
}

export function useCreateSession() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (dto: CreateSessionDto) => createSession(dto),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: SESSION_QUERY_KEYS.all });
    },
  });
}

export function useCreateSessionRange() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (dto: CreateSessionRangeDto) => createSessionRange(dto),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: SESSION_QUERY_KEYS.all });
    },
  });
}

export function useUpdateSession() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, dto }: { id: string; dto: UpdateSessionDto }) => updateSession(id, dto),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: SESSION_QUERY_KEYS.all });
      queryClient.invalidateQueries({ queryKey: SESSION_QUERY_KEYS.detail(variables.id) });
    },
  });
}

export function useDeleteSession() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => deleteSession(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: SESSION_QUERY_KEYS.all });
    },
  });
}
```

---

## 4. Design & UI/UX Specs (BMAD - D)

### 4.1. Cấu trúc Component UI (Component Hierarchy)

```
src/modules/AdminProduct/ProductFormPage/components/sections/
├── session-section.tsx             # Container chính quản lý KPI Header, Bộ lọc, View Switcher & Bảng Ma trận
├── session-table.tsx               # Bảng Ma Trận Đơn Giá (Pricing Matrix Table) linh hoạt theo Unit, phân trang & inline edit
├── create-session-modal.tsx        # Modal Tạo 1 Session (chọn ngày + nhập đơn giá các Unit)
├── create-session-range-modal.tsx  # Modal Tạo dải Session theo khoảng ngày (Range Picker + Bulk Price)
└── edit-session-modal.tsx          # Modal Sửa giá/capacity/status của Session
```

### 4.2. Giao diện & Luồng Tương tác Chuyên nghiệp (Advanced UX Workflows)

> [!IMPORTANT] > **Tải Trang Siêu Nhanh — Mô hình Compact Summary Widget & Slide-over Drawer 800px**:
> Để tránh làm trang Edit Tour (`ProductFormPage`) bị cồng kềnh, phân hệ `Schedule & Pricing` trên trang Edit Tour được rút gọn thành một **Compact Summary Widget**. Khi Admin cần chỉnh sửa giá chi tiết, bấm nút sẽ mở **Slide-over Drawer (800px)** trượt từ lề phải với đầy đủ **Bảng Ma Trận Đơn Giá (Pricing Matrix)**.

#### Flow 1: Compact Summary Widget (Trang Edit Tour - `ProductFormPage`)

- **Vị trí**: Nằm tại Section `Schedule & Pricing` của trang Edit Tour.
- **Thành phần Giao diện**:

  - **Header Bar**: Tiêu đề "Schedule & Pricing" + Nút bấm chính **`[ 🗓️ Quản Lý Lịch & Bảng Giá Chi Tiết ↗️ ]`** (Primary Accent Button).
  - **4 Thẻ KPI Mini**:
    - 📅 `Tổng số ngày`: Total Sessions (e.g. 30 ngày).
    - 🟢 `Đang mở bán`: Active Sessions (e.g. 26 ngày).
    - ⚪ `Tạm ngưng`: Inactive Sessions (e.g. 4 ngày).
    - ⚠️ `Chưa niêm yết giá`: Unpriced Sessions counter _(Badge vàng cảnh báo nếu có ngày quên chưa gán giá)_.
  - **Xem nhanh 3 Ngày Khởi hành Gần nhất (Upcoming Preview)**:
    - `• 01/08/2026`: 🟢 Active — Người lớn: `2.000.000đ` | Trẻ em: `1.500.000đ`
    - `• 02/08/2026`: 🟢 Active — ⚠️ _Chưa có giá_
    - `• 03/08/2026`: 🟢 Active — Người lớn: `2.000.000đ` | Trẻ em: `1.500.000đ`

- **Sơ đồ Compact Summary Widget**:

```
┌────────────────────────────────────────────────────────────────────────────────────────────────────────┐
│ Schedule & Pricing                                                    [🗓️ Quản lý Lịch & Bảng giá ↗️] │
├──────────────────────────┬──────────────────────────┬──────────────────────────┬───────────────────────┤
│  📅 30 Ngày khởi hành    │  🟢 26 Ngày mở bán       │  ⚪ 4 Ngày tạm ngưng     │ ⚠️ 2 Ngày chưa có giá │
├──────────────────────────┴──────────────────────────┴──────────────────────────┴───────────────────────┤
│ 📋 Lịch khởi hành sắp tới:                                                                             │
│ • 01/08/2026: 🟢 Active  —  Người lớn: 2.000.000đ | Trẻ em: 1.500.000đ                                │
│ • 02/08/2026: 🟢 Active  —  ⚠️ Chưa niêm yết giá vé                                                     │
│ • 03/08/2026: 🟢 Active  —  Người lớn: 2.000.000đ | Trẻ em: 1.500.000đ                                │
└────────────────────────────────────────────────────────────────────────────────────────────────────────┘
```

#### Flow 2: Full Pricing Matrix Inside Slide-over Drawer (`ProductSessionSheet 800px`)

- Khi Admin click nút **`[ 🗓️ Quản lý Lịch & Bảng giá ↗️ ]`** từ Summary Widget hoặc từ Màn Danh sách Sản phẩm (`/admin/products`):
- Một **Slide-over Drawer (Rộng 800px)** trượt mượt từ lề phải sang.
- Bên trong Drawer tích hợp trọn vẹn:

  1. **Bảng Ma Trận Đơn Giá (Pricing Matrix Table)**: Mỗi `Unit` là 1 cột dọc riêng biệt.
  2. **Thanh Bộ lọc**: Lọc dải ngày (`fromDate` -> `toDate`), Trạng thái (`active`/`inactive`).
  3. **Nút Thao tác**: `+ Tạo 1 ngày` và `+ Tạo dải ngày (Range)`.
  4. **Smart Badges**: Ô thiếu giá hiển thị **`⚠️ Chưa có giá`** + Clickable Quick Toggle Badge.

- **Sơ đồ Wireframe Slide-over Drawer (Pricing Matrix inside Drawer 800px)**:

```
┌────────────────────────────────────────────────────────────────────────────────────────────────────────┐
│ 🗓️ QUẢN LÝ LỊCH & BẢNG GIÁ — Tour Hạ Long Bay 5 Sao                                                [✕] │
├────────────────────────────────────────────────────────────────────────────────────────────────────────┤
│ 🔍 Lọc ngày: [DD/MM/YYYY] -> [DD/MM/YYYY]   Status: [Tất cả ▾]             [+ Tạo dải ngày]  [+ Tạo 1 ngày] │
├────┬────────────┬───────────┬──────────────┬──────────────────┬──────────────────┬──────────────────┬───────┤
│[ ] │ TRAVEL DATE│ CAPACITY  │ STATUS       │ LONG CHILDREN    │ ADULT (Người lớn)│ VIP TICKET       │ACTIONS│
├────┼────────────┼───────────┼──────────────┼──────────────────┼──────────────────┼──────────────────┼───────┤
│[ ] │ 01/08/2026 │ 20 chỗ    │ 🟢 Active    │ 1.500.000đ       │ 2.000.000đ       │ 3.500.000đ       │ ✏️ 🗑️ │
│[ ] │ 02/08/2026 │ 20 chỗ    │ 🟢 Active    │ ⚠️ Chưa có giá   │ 2.000.000đ       │ 3.500.000đ       │ ✏️ 🗑️ │
│[ ] │ 03/08/2026 │ Tự do     │ ⚪ Inactive  │ 1.500.000đ       │ 2.000.000đ       │ 3.500.000đ       │ ✏️ 🗑️ │
└────┴────────────┴───────────┴──────────────┴──────────────────┴──────────────────┴──────────────────┴───────┤
```

#### Flow 3: Floating Multi-Select Bulk Actions Bar (Thanh Thao tác Hàng loạt)

- Khi Admin tick chọn 1 hoặc nhiều Checkbox trên dòng Table trong Drawer:
- Một **Floating Action Bar** nổi ở lề dưới Drawer trượt lên:
  > `☑️ Đã chọn X ngày` | `[ 🟢 Bật Active ]` `[ ⚪ Tắt Inactive ]` `[ 💰 Gán giá hàng loạt ]` `[ 🗑️ Xóa ]`

#### Flow 4: Bulk Range Creation & Conflict Preview (Tạo dải ngày kèm xem trước)

1. Bấm nút **"Tạo dải ngày (Range)"** (`+ Create Range`).
2. Mở `CreateSessionRangeModal`:
   - Chọn `fromDate` & `toDate`.
   - Chọn Trạng thái mặc định và Sức chứa.
   - Nhập đơn giá áp dụng chung cho từng loại vé (`Units`).
3. **Conflict Preview Dialog**: Hiển thị xem trước các ngày đã có Session để Admin xác nhận việc bỏ qua trước khi gửi API `POST /session/range`.

---

### 4.3. Đặc tả Giao diện Trang Quản lý Session chính (`src/modules/AdminSession/SessionListPage`)

#### A. Lý do Cải tiến UX (Rationale)

- **Vấn đề hiện tại**: Khi truy cập đường dẫn `/admin/sessions` (Menu "Sessions & Pricing"), giao diện bắt buộc chọn một sản phẩm mới hiển thị dữ liệu. Các thẻ StatCard (`Total`, `Active`, `Inactive`) bằng `0` và hiển thị màn hình trống ("Select a product to start..."), gây bất tiện cho Admin khi muốn xem tổng quan toàn bộ lịch khởi hành của công ty.
- **Giải pháp Cải tiến**:
  - Tận dụng khả năng hỗ trợ `productId` tùy chọn của API `GET /session`.
  - Khi `selectedProductId` là `null` hoặc chọn **"Tất cả sản phẩm"**:
    - Gọi API `useSessions` mà không truyền `productId`.
    - Các StatCard hiển thị tổng số Session khởi hành của **toàn bộ sản phẩm**.
    - Hiển thị Bảng danh sách tất cả Session kèm cột **"Sản phẩm" (Product Name)**.
  - Khi chọn 1 sản phẩm cụ thể:
    - Lọc dữ liệu Session theo sản phẩm đó.
    - Kích hoạt chế độ **Calendar View** và các tính năng tạo nhanh Session cho sản phẩm.

#### B. Sơ đồ Thành phần (Component Diagram for SessionListPage)

```
src/modules/AdminSession/SessionListPage/
├── index.tsx                         # Main Page Container (`/admin/sessions`)
├── product-selector.tsx              # Select dropdown có option "Tất cả sản phẩm" (All Products)
└── components/
    ├── global-session-table.tsx       # Bảng danh sách tổng quan tất cả sản phẩm (có cột Product)
    └── session-stat-cards.tsx         # Thẻ chỉ số tổng quan (Total / Active / Inactive)
```

---

## 5. Advanced Frontend Architecture & UX Enhancements (Góc nhìn Chuyên gia FE)

### 5.1. Excel-Like Inline Cell Editing (Spreadsheet Input)

- **Chỉnh sửa Đơn giá & Capacity trực tiếp trên Bảng**:
  - Click đúp vào ô giá vé của bất kỳ Unit nào hoặc ô Capacity $\rightarrow$ Ô chuyển thành `<input type="number" />` có nút `✓` (Save) và `✕` (Cancel).
  - Nhấn `Enter` để gửi lệnh `PUT /session/{id}` cập nhật giá mới ngay lập tức.
  - Nhấn `Tab` hoặc `Down Arrow` để chuyển con trỏ sang ngày tiếp theo (giúp nhập liệu 30 ngày trong 15 giây mà không mở Popup).

### 5.2. Sanity Guard & Outlier Price Warning (Bảo vệ Nhập sai giá)

- **Cảnh báo Thông minh khi Nhập Giá Bất thường**:
  - So sánh đơn giá mới nhập với đơn giá gốc cơ sở của Product (`basePrice`).
  - Nếu đơn giá thấp hơn hoặc cao hơn 50% so với `basePrice` $\rightarrow$ UI hiển thị Badge cảnh báo màu vàng: _"Lưu ý: Đơn giá (150,000đ) lệch lớn so với giá gốc sản phẩm (1,500,000đ)."_

### 5.3. Rule-Based Dynamic Pricing & Multipliers (Quy tắc Tăng giá Tự động)

- **Công cụ Tăng/Giảm % Giá Hàng loạt**:
  - Tích hợp công cụ `Quick Multiplier`: Tự động `+15%` cho các ngày Thứ 7 & Chủ Nhật, `+25%` cho các ngày Lễ/Tết hoặc `-10%` cho mùa thấp điểm.

### 5.4. Visual Calendar-First Split View

- **Giao diện Song song Lịch & Ma trận (Split View)**:
  - **Lề trái (35%)**: Ô Lịch tháng trực quan. Giữ chuột quét chọn dải ngày trên Lịch (Drag-to-select).
  - **Lề phải (65%)**: Bảng Ma trận đơn giá cập nhật theo dải ngày vừa quét chọn.

---

## 7. Kế hoạch Phân kỳ Triển khai (Implementation Phasing Plan)

### 🟢 Phase 1: Phạm vi Triển khai Ngay (MUST-HAVE MVP & MATRIX UX)

1. **API Client Layer (`src/api/session/`)**:
   - Hoàn thiện `types.ts`, `requests.ts`, `queries.ts` kết nối 6 API Swagger (`POST /session`, `POST /session/range`, `GET /session`, `GET /session/{id}`, `PUT /session/{id}`, `DELETE /session/{id}`).
2. **Pricing Matrix Table Component (`src/modules/AdminProduct/`)**:
   - Xây dựng lại `SessionTable` theo mô hình **Ma Trận Đơn Giá (Pricing Matrix)**: Mỗi `Unit` là 1 cột dọc.
   - Thêm **KPI Summary Header Bar** (`Total`, `Active`, `Inactive`, `Unpriced Warning`).
   - Thêm **Clickable Quick Status Toggle** (Click badge đổi trạng thái 0ms).
   - Thêm **Smart Unpriced Warning Badge** (`⚠️ Chưa có giá` thay cho dấu `-`).
3. **Quick Session Popup Sheet (`ProductListPage`)**:
   - Tích hợp **Side Sheet Drawer 680px (`ProductSessionSheet`)** xem/sửa Session trực tiếp từ trang danh sách sản phẩm.

---

### 🟡 Phase 2: Phạm vi Nâng cấp Sau (ADVANCED ROADMAP)

1. **Excel-Like Inline Cell Editing**: Sửa giá/capacity trực tiếp trên từng ô bảng không qua Modal.
2. **Floating Multi-Select Bulk Actions Bar**: Thanh thao tác chọn nhiều ngày đổi trạng thái / gán giá.
3. **Rule-Based Dynamic Pricing Multipliers**: Công cụ tự động tăng giá % Cuối tuần & Ngày lễ.
4. **Drag-to-Select Visual Calendar View**: Lịch tháng quét chọn dải ngày trực quan.

---

## 8. Verification & Testing Strategy

1. **Unit Testing / API Mock Tests**:
   - Kiểm tra format ISO UTC dates giữa Frontend datepicker (`YYYY-MM-DD`) và API payload.
   - Test validation form: `price` >= 0, `fromDate` <= `toDate`.
2. **Integration Verification**:
   - Test luồng tạo đơn lẻ `POST /session` -> Verify kết quả trên `GET /session`.
   - Test luồng tạo dải ngày `POST /session/range` -> Verify số lượng items được tạo.
   - Test luồng sửa `PUT /session/{id}` -> Verify giá unit được cập nhật chính xác.
   - Test luồng xóa `DELETE /session/{id}` -> Verify item biến mất khỏi list.
3. **Boundary Verification**:
   - Thử tạo 2 session cho cùng 1 `travelDate` -> Verify UI bắt lỗi trùng lặp thân thiện.
