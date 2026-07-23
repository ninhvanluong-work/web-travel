---
title: 'ProductPage — Booking Sheet API Integration'
created: '2026-07-23'
status: 'draft'
domain: 'product-page'
# related: 'spec-product-page-api-integration.md'
---

# Spec: ProductPage — Booking Sheet API Integration

## 1. Vấn đề / Mục tiêu

Hiện tại, trang Đặt Tour (`BookingSheet` tại `src/modules/ProductPage/components/booking-sheet`) đang sử dụng các thông tin cứng (hardcoded) về giá người lớn, giá trẻ em và giả định rằng cả hai đối tượng này luôn khả dụng.
Để đưa luồng đặt tour vào thực tế, chúng ta cần:

1. **Tự động tạo Option mặc định**: Khi admin tạo mới 1 tour (sản phẩm), hệ thống phải tự động tạo 1 option mặc định (default pricing option) liên kết với sản phẩm đó.
2. **Tải thông tin Session động**: Khi khách hàng truy cập trang đặt tour và chọn ngày đi (travel date), hệ thống sẽ gọi API `/tour-session` để kiểm tra xem ngày đó có lượt khởi hành hay không, có hỗ trợ Adult/Children không, giá thực tế của từng loại là bao nhiêu và số chỗ còn lại (remainingSlot) là bao nhiêu nhằm cập nhật giới hạn số lượng khách.

---

## 2. Hành vi mong muốn

### 2.1 Tự động tạo Option mặc định khi thêm mới Tour

- Khi admin nhấn "Lưu bản nháp" hoặc "Đăng tour" ở trang tạo mới sản phẩm (`src/hooks/use-product-form.ts`):
  1. Gửi request tạo sản phẩm: `POST /product`
  2. Khi thành công và nhận được `productId`, tự động gọi tiếp API tạo option: `POST /option` với các thông tin mặc định:
     - `title`: Trùng với tên sản phẩm vừa tạo (`name`).
     - `productId`: ID của sản phẩm vừa tạo.
     - `isDefault`: `true`
     - `status`: `"active"`
     - `order`: `1`
     - `currency`: `"USD"` (hoặc theo cấu hình mặc định)
     - `day`: Số ngày của tour (trích xuất từ cấu hình Elements hoặc mặc định là `1`).
     - `night`: Số đêm của tour (trích xuất từ cấu hình Elements hoặc mặc định là `0`).
  3. Sau khi tạo option thành công, mới thông báo và điều hướng về trang quản lý tour (`ROUTE.ADMIN_PRODUCTS`).

### 2.2 Tải thông tin Session động trên trang Booking Sheet

- Khi mở trang đặt tour, hệ thống lấy `options` từ thông tin sản phẩm (`useProductById`). Chọn option có `isDefault === true` làm option chính (nếu không có, lấy option đầu tiên).
- Khi chưa chọn ngày đi: Giao diện chọn số lượng khách **Adults và Children sẽ chưa hiển thị** (không render).
- Khi người dùng chọn Ngày đi (**Travel Date**):

  - Kích hoạt trạng thái loading (hiển thị shimmer skeleton) tại vị trí hiển thị số khách.
  - Gọi API `/tour-session` để lấy danh sách các session trong ngày:
    ```
    GET /tour-session?optionId={optionId}&fromDate={selectedDate}&toDate={selectedDate}&page=1&pageSize=10
    ```
    _(Trong đó `fromDate` và `toDate` được format dưới dạng `YYYY-MM-DD` đại diện cho cùng ngày đã chọn)._
  - **Xử lý kết quả trả về từ API (Response Handling):**

    - **Trường hợp 1: Không có session nào khả dụng (API trả về mảng rỗng `items: []`)**
      - Hiển thị thông báo lỗi màu đỏ/vàng dưới DatePicker: _"Không có lượt khởi hành nào cho ngày này. Vui lòng chọn ngày khác."_
      - Tiếp tục ẩn (không hiển thị) cả hai ô chọn Adults và Children (reset giá trị về `0`).
      - Disable nút **"Continue ->"** ở bottom bar.
    - **Trường hợp 2: Có session khả dụng**

      - Duyệt qua các session item trong `items` để quyết định hiển thị động:

        - **Adults Card**: Chỉ hiển thị khi có item với `unitRef.key === "adult"`.
          - Cập nhật giá người lớn dựa trên `price` của session đó (convert sang `number`).
          - Cập nhật thông tin mô tả phụ (subtext) từ `unitRef.note` (nếu `unitRef.note` rỗng/null, dùng fallback mặc định là `"Age 12+"`).
          - Giới hạn số lượng tối đa của counter dựa trên `remainingSlot`.
          - Nếu không tìm thấy hoặc `remainingSlot <= 0`, ẩn card Adults (hoặc hiển thị thông báo hết chỗ tùy yêu cầu UX).
        - **Children Card**: Chỉ hiển thị khi có item với `unitRef.key === "children"`.
          - Cập nhật giá trẻ em dựa trên `price` của session (hoặc tính 50% discount của Adult nếu price của children bằng 0).
          - Cập nhật thông tin mô tả phụ (subtext) từ `unitRef.note` (nếu `unitRef.note` rỗng/null, dùng fallback mặc định là `"Age 2–11 · 50% discount"`).
          - Giới hạn số lượng tối đa của counter dựa trên `remainingSlot`.
          - Nếu không tìm thấy hoặc `remainingSlot <= 0`, ẩn card Children.

      - **Điều kiện đi tiếp (canContinue):** Nút **"Continue"** chỉ sáng khi `guests.adults >= 1` (phải có ít nhất 1 người lớn tham gia) và tổng số khách của mỗi loại không vượt quá `remainingSlot` tương ứng.

---

## 3. Thay đổi kỹ thuật

### 3.1 Khai báo API Contracts mới

#### A. Thêm API Option (`src/api/option/`)

Tạo các file quản lý request cho option:

- **`src/api/option/types.ts`**:

  ```typescript
  export interface ApiOptionDetail {
    id: string;
    createdAt: string;
    updatedAt: string;
    deletedAt: string | null;
    title: string;
    description: string | null;
    day: number;
    night: number;
    isDefault: boolean;
    status: 'active' | 'inactive';
    order: number;
    currency: string;
    productId: string;
  }

  export interface CreateOptionPayload {
    title: string;
    productId: string;
    isDefault?: boolean;
    status?: 'active' | 'inactive';
    order?: number;
    currency?: string;
    day?: number;
    night?: number;
  }
  ```

- **`src/api/option/requests.ts`**:

  ```typescript
  import { request } from '../axios';
  import type { ApiOptionDetail, CreateOptionPayload } from './types';

  export async function createOption(payload: CreateOptionPayload): Promise<ApiOptionDetail> {
    const { data } = await request.post<{ data: ApiOptionDetail }>('/option', payload);
    return data.data;
  }
  ```

- **`src/api/option/queries.ts`**:

  ```typescript
  import { createMutation } from 'react-query-kit';
  import { createOption } from './requests';
  import type { ApiOptionDetail, CreateOptionPayload } from './types';

  export const useCreateOption = createMutation<ApiOptionDetail, CreateOptionPayload>({
    mutationFn: (payload) => createOption(payload),
  });
  ```

#### B. Thêm API Tour Session (`src/api/tour-session/`)

Tạo các file quản lý request cho tour-session:

- **`src/api/tour-session/types.ts`**:

  ```typescript
  export interface ApiUnitRef {
    id: string;
    createdAt: string;
    updatedAt: string;
    deletedAt: string | null;
    key: 'adult' | 'children';
    name: string;
    note: string | null;
  }

  export interface ApiTourSessionItem {
    id: string;
    createdAt: string;
    updatedAt: string;
    deletedAt: string | null;
    optionId: string;
    travelDate: string;
    departureTime: string;
    capacity: number;
    remainingSlot: number;
    unitRefId: string;
    price: string; // decimal string e.g. "12000.00"
    status: 'active' | 'inactive';
    unitRef: ApiUnitRef;
  }

  export interface ITourSessionParams {
    optionId: string;
    fromDate: string; // YYYY-MM-DD
    toDate: string; // YYYY-MM-DD
    page?: number;
    pageSize?: number;
  }

  export interface ApiTourSessionResponse {
    data: {
      items: ApiTourSessionItem[];
      pagination: {
        page: number;
        pageSize: number;
        total: number;
        totalPages: number;
      };
    };
    code: number;
    message: string;
    error: string | null;
  }
  ```

- **`src/api/tour-session/requests.ts`**:

  ```typescript
  import { request } from '../axios';
  import type { ApiTourSessionResponse, ITourSessionParams } from './types';

  export async function getTourSessions(params: ITourSessionParams): Promise<ApiTourSessionResponse['data']> {
    const { data } = await request.get<ApiTourSessionResponse>('/tour-session', { params });
    return data.data;
  }
  ```

- **`src/api/tour-session/queries.ts`**:

  ```typescript
  import { createQuery } from 'react-query-kit';
  import { getTourSessions } from './requests';
  import type { ApiTourSessionResponse, ITourSessionParams } from './types';

  export const useTourSessions = createQuery<ApiTourSessionResponse['data'], ITourSessionParams>({
    primaryKey: '/tour-session',
    queryFn: ({ queryKey: [, variables] }) => getTourSessions(variables),
  });
  ```

---

### 3.2 Sửa đổi logic Admin Product Flow

- File thay đổi: [use-product-form.ts](file:///d:/Remote/web-travel/src/hooks/use-product-form.ts)
- Thay đổi:
  - Import mutation `useCreateOption`.
  - Trong `onSubmit` / `onPublish` handler của `useProductForm`:
    - Với chế độ tạo mới, khi `createMutation.mutate` gọi thành công, thay vì lập tức redirect và báo thành công, ta bắt ID sản phẩm mới được sinh ra (`productId`).
    - Gọi tiếp `createOptionMutation.mutateAsync` để tạo option mặc định với:
      - `productId`: ID mới tạo.
      - `title`: Tên tour (`data.name`).
      - `day`: Trích xuất số ngày từ element `day` của tour (nếu có) hoặc mặc định `2`.
      - `night`: Trích xuất số đêm từ element `night` của tour (nếu có) hoặc mặc định `1`.
    - Sau khi hoàn tất chuỗi API thành công mới thực hiện `router.push(ROUTE.ADMIN_PRODUCTS)` và `addAlert`.

---

### 3.3 Sửa đổi Booking Store & State

- File thay đổi: [BookingStore.ts](file:///d:/Remote/web-travel/src/stores/BookingStore.ts)
- Thay đổi: Thêm các trường hỗ trợ lưu cấu hình session động nhận được từ API:

  ```typescript
  interface BookingState {
    step: 1 | 2 | 3 | 4;
    date: Date | null;
    guests: { adults: number; children: number };
    departureTime: string | null;
    pickupLocation: string | null;
    packageType: 'basic' | 'premium' | null;
    agreedToTerms: boolean;

    // Thêm các trường giá và cấu hình động cho Session
    sessionPricing: {
      adultPrice: number;
      childPrice: number;
      adultNote: string | null;
      childNote: string | null;
      adultMaxSlots: number;
      childMaxSlots: number;
      isAdultAvailable: boolean;
      isChildAvailable: boolean;
      isLoadingSession: boolean;
      sessionError: string | null;
    };
  }

  interface BookingActions {
    // ... các action cũ
    setSessionPricing: (pricing: Partial<BookingState['sessionPricing']>) => void;
  }
  ```

---

### 3.4 Sửa đổi Component Booking Sheet & Step Info

- File thay đổi: [index.tsx](file:///d:/Remote/web-travel/src/modules/ProductPage/components/booking-sheet/index.tsx)

  - Nhận thêm `options` từ product details (`options` array).
  - Xác định option mặc định: `const defaultOption = options?.find(o => o.isDefault) || options?.[0];`
  - Truyền `optionId={defaultOption?.id}` vào `StepInfo` component.
  - Thay đổi cách tính tổng tiền (`displayTotal` & `estimatedTotal`) để lấy từ `sessionPricing.adultPrice` và `sessionPricing.childPrice` từ store thay vì `adultPrice` hardcoded từ component props.
  - Công thức tính toán chi tiết:
    - `estimatedTotal = (guests.adults * sessionPricing.adultPrice) + (guests.children * sessionPricing.childPrice)`
    - `runningTotal = guests.adults * (sessionPricing.adultPrice + premiumSurcharge) + guests.children * (sessionPricing.childPrice + premiumSurcharge * 0.5)`
    - Giá trị `price` từ response API (ví dụ: `"12000.00"`) được convert sang kiểu số (`Number` hoặc `parseFloat`) để đảm bảo phép nhân và cộng chính xác khi người dùng tăng/giảm số lượng khách.
  - Cập nhật hàm format tiền để dùng `currency` từ `defaultOption?.currency` (mặc định là `"USD"`).

- File thay đổi: [step-info.tsx](file:///d:/Remote/web-travel/src/modules/ProductPage/components/booking-sheet/step-info.tsx)

  - Khai báo nhận `optionId` prop.
  - Lắng nghe sự thay đổi của `date`. Khi `date !== null`, kích hoạt hook React Query `useTourSessions` với `optionId` và `date` format `YYYY-MM-DD`.
  - Trong quá trình fetch:
    - Hiển thị spinner loading đè lên khu vực chọn số lượng Adults / Children.
  - Khi có kết quả:

    - Parse dữ liệu session: tìm session của người lớn (key `"adult"`) và trẻ em (key `"children"`).
    - Cập nhật `sessionPricing` trong `BookingStore`:
      - `adultPrice`: lấy từ session `price` (hoặc fallback về `adultPrice` prop nếu không có).
      - `childPrice`: lấy từ session `price` (hoặc fallback về `50%` giá người lớn).
      - `adultNote`: lấy từ `unitRef.note` của session adult (nếu null, fallback về `"Age 12+"`).
      - `childNote`: lấy từ `unitRef.note` của session children (nếu null, fallback về `"Age 2–11 · 50% discount"`).
      - `adultMaxSlots`: `remainingSlot` từ session người lớn.
      - `childMaxSlots`: `remainingSlot` từ session trẻ em.
      - `isAdultAvailable`: true nếu tìm thấy session adult với `remainingSlot > 0`.
      - `isChildAvailable`: true nếu tìm thấy session children với `remainingSlot > 0`.
    - Cập nhật số lượng `guests` trong store: nếu `guests.adults > adultMaxSlots`, tự động giảm về `adultMaxSlots`. Tương tự với trẻ em.

  - Nếu kết quả trả về không có session nào cho ngày được chọn:
    - Hiển thị thông báo cảnh báo: _"Không có lượt khởi hành cho ngày này. Vui lòng chọn ngày khác."_

---

## 4. Dependencies & Conflicts

- **Depends on:** `spec-product-page-api-integration.md` (Đã được triển khai trước đó để map dữ liệu product).
- **Modifies:**
  - `src/hooks/use-product-form.ts` (Thêm API gọi tạo default option sau khi POST product thành công).
  - `src/stores/BookingStore.ts` (Lưu thông tin giá và giới hạn slot động).
  - `src/modules/ProductPage/components/booking-sheet/index.tsx` (Tính toán tổng tiền dựa trên giá của session).
  - `src/modules/ProductPage/components/booking-sheet/step-info.tsx` (Gọi API `/tour-session` và render dynamic input).
- **Must NOT break:**
  - Logic các bước 2 (Options), 3 (Review), 4 (Payment) trong luồng đặt tour.
  - Các thông tin cơ bản khác của sản phẩm khi tạo mới từ admin.
- **Conflicts with:** None.

---

## 5. Out of scope

- Giao diện Admin quản lý / thêm bớt nhiều Option và Tour Session nâng cao (sẽ thuộc spec về "Pricing & Session Management" riêng).
- Tích hợp thanh toán thật qua các cổng thanh toán (chỉ dừng ở bước chọn phương thức thanh toán và lưu database).

---

## 6. Open questions

1. **Mặc định khi tạo option mới, giá trị `day` và `night` nên trích xuất thế nào?**
   - Đề xuất: Tìm trong elementIds của sản phẩm các element có key `"day"` và `"night"`. Vì thông tin Element chứa key và name (VD: key: `"day"`, name: `"2"`), ta có thể parse giá trị name thành số để truyền vào API tạo option.
2. **Nếu khách hàng chưa chọn ngày khởi hành, giao diện Adults / Children sẽ hiển thị thế nào?**
   - Giải pháp: Ẩn hoàn toàn (không render) hai ô chọn này cho đến khi có phản hồi hợp lệ từ API `/tour-session` sau khi chọn ngày.
