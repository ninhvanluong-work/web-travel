---
title: 'Admin huỷ booking (POST /booking/{id}/cancel)'
created: '2026-10-26'
status: 'draft'
domain: 'admin'
related: 'booking-list.md, booking-management.md'
conflicts_with: 'booking-list.md'
---

# Spec: Admin huỷ booking

## 1. Vấn đề / Mục tiêu

BE đã có endpoint huỷ booking nhưng trang **Admin → Bookings** chưa có cách nào để dùng:

- Admin không huỷ được đơn trên giao diện, phải gọi Swagger. Booking `BKMSJ0SS8JA6D831` đã bị huỷ theo cách này ngày 25/10.
- API danh sách đã trả `cancelReason`, `cancelledAt`, `cancelledBy`, nhưng FE chưa khai báo type và chưa hiển thị, nên admin không biết đơn bị huỷ vì sao, lúc nào, bởi ai.

**Mục tiêu:** admin huỷ được booking đang `pending` ngay trong drawer chi tiết, có xác nhận và lý do. Đơn đã huỷ hiển thị đầy đủ thông tin huỷ.

### API

`POST /booking/{id}/cancel`: "cancel a pending booking (admin only)". Nguồn: [Swagger Booking/cancel](https://web-travel-be.fly.dev/docs#/Booking/cancel).

|      | Chi tiết                                                                                                           |
| ---- | ------------------------------------------------------------------------------------------------------------------ |
| Auth | `security: USER_TOKEN`: header `Authorization: Bearer <adminAccessToken>` (**bắt buộc**, xem §3.1)                 |
| Path | `id`: UUID booking                                                                                                 |
| Body | `CancelBookingDto { reason?: string }`, `maxLength: 500`, BE **không bắt buộc**                                    |
| 200  | `data` = `Booking` đầy đủ: `status: 'cancel'`, `cancelReason`, `cancelledAt` (ISO), `cancelledBy` (UUID người huỷ) |
| 400  | `Booking is not pending` (đơn đã `paid` hoặc đã `cancel`)                                                          |
| 404  | `Booking not found`                                                                                                |
| 401  | Thiếu token hoặc token hết hạn → axios tự refresh rồi gọi lại (xem §3.1)                                           |

Response thành công thực tế (huỷ booking `975c748a-…` ngày 26/10):

```json
{
  "data": {
    "id": "975c748a-2172-4ab1-9aeb-e7c9dfd2d514",
    "bookingCode": null,
    "travelDate": null,
    "productName": null,
    "passengers": [],
    "totalPrice": "12.00",
    "currency": "VND",
    "status": "cancel",
    "cancelReason": "Khách yêu cầu hủy 1",
    "cancelledAt": "2026-10-26T13:54:20.474Z",
    "cancelledBy": "052c4c6c-e66a-47cb-b811-64cd49d00420",
    "...": "các field còn lại giống item của GET /booking"
  },
  "code": 200,
  "message": "cancelled booking successfully",
  "error": null
}
```

- `data` có **cùng shape với item của `GET /booking`**, nên map thẳng vào `IBookingListItem`.
- `totalPrice` là **chuỗi** (`"12.00"`), không phải number như Swagger ghi.
- Các field `null` ở trên là do **dữ liệu gốc trong DB vốn null** (booking test cũ, tạo 01/08), không phải BE trả thiếu. FE phải chịu được `null` ở `bookingCode`, `travelDate`, `productName`, `username`… (xem §2.4).

Dữ liệu thực tế (DB, 26/10): `pending` 26 đơn (cả 26 đã qua ngày đi, 8 đang có payment `pending`), `paid` 13, `cancel` 2 (1 đơn còn payment `pending`, 1 đơn thiếu dữ liệu như trên).

---

## 2. Hành vi mong muốn

### 2.1 Huỷ booking

| Hành động                                                                                     | Kết quả mong đợi                                                                                                                                                                 |
| --------------------------------------------------------------------------------------------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Mở drawer chi tiết của booking `pending`                                                      | Cuối tab **Thông tin**, tách riêng bằng đường kẻ phân cách: nút **Huỷ booking** (đỏ, viền), không đặt cạnh nút nào khác                                                          |
| Booking `paid` hoặc `cancel`                                                                  | Không có nút huỷ                                                                                                                                                                 |
| Bấm **Huỷ booking**                                                                           | Mở dialog xác nhận đỏ: tiêu đề "Huỷ booking {bookingCode}?", tóm tắt tour, ngày đi, khách, tổng tiền; ô **Lý do huỷ** (textarea, đếm `x/500`), **con trỏ đặt sẵn trong ô lý do** |
| Lý do                                                                                         | **Bắt buộc ở FE** (đã chốt), dù BE không bắt buộc. Chuẩn hoá bằng `normalizeText`, 1–500 ký tự                                                                                   |
| Booking còn payment `pending`                                                                 | Dialog hiện cảnh báo vàng (`AlertBanner`): "Đơn này đang có giao dịch thanh toán chờ xử lý…" (xem §7)                                                                            |
| Nút xác nhận                                                                                  | Ghi **"Huỷ booking"** (đỏ). **Bị mờ khi lý do còn trống**, kèm gợi ý "Nhập lý do để huỷ". Bấm thì hiện spinner, khoá dialog (không đóng bằng Esc hay click ngoài)                |
| Thành công                                                                                    | Toast "Đã huỷ booking {code}"; dialog đóng; drawer **giữ mở** và cập nhật ngay sang trạng thái huỷ; danh sách và thẻ thống kê refetch                                            |
| Lỗi `Booking is not pending` (400) hoặc 404                                                   | Toast hiện **nguyên văn `message` của BE**; đóng dialog và drawer; refetch danh sách (đơn đã đổi trạng thái hoặc không còn)                                                      |
| Lỗi khác (400 validate, 5xx, mạng)                                                            | Toast hiện **nguyên văn `message` của BE**; nếu không có `message` (lỗi mạng) thì dùng câu chung i18n `admin.booking.cancel.failed`. Dialog vẫn mở, giữ nguyên lý do để thử lại  |
| Hết phiên đăng nhập (refresh token cũng hết hạn)                                              | Axios tự logout admin và chuyển về trang đăng nhập admin (hành vi sẵn có)                                                                                                        |
| Nút đóng ghi **"Giữ lại booking"** (không dùng chữ "Huỷ" để khỏi nhầm), hoặc Esc khi chưa gửi | Đóng dialog, xoá lý do đã nhập                                                                                                                                                   |

### 2.1.1 Hiển thị lỗi

**Mọi lỗi từ API đều hiện đúng `message` BE trả về**, không thay bằng câu dịch sẵn. Câu i18n chỉ dùng khi body lỗi không có `message` (mất mạng, timeout).

Body lỗi của BE (ví dụ id sai định dạng):

```json
{
  "statusCode": 400,
  "message": "Validation failed (uuid is expected)",
  "timestamp": "2026-10-26T13:56:39.535Z",
  "path": "/booking/975c748a-2172-4ab1-9aeb-e7c9dfd2d5141/cancel"
}
```

| `statusCode` | `message` (BE)                                                 | Toast                              | Sau đó                         |
| ------------ | -------------------------------------------------------------- | ---------------------------------- | ------------------------------ |
| 400          | `Booking is not pending`                                       | `Booking is not pending`           | Đóng dialog và drawer, refetch |
| 400          | `Validation failed (uuid is expected)` / lỗi validate `reason` | Nguyên văn message                 | Giữ dialog                     |
| 404          | `Booking not found`                                            | `Booking not found`                | Đóng dialog và drawer, refetch |
| 5xx          | message của BE                                                 | Nguyên văn message                 | Giữ dialog                     |
| —            | (không có body: mất mạng)                                      | i18n `admin.booking.cancel.failed` | Giữ dialog                     |

`message` có thể là mảng (lỗi validate DTO) thì nối bằng `, `; `getApiErrorMessage` trong `src/lib/utils.ts` đã xử lý.

### 2.2 Hiển thị booking đã huỷ

| Vị trí                                           | Hiển thị                                                                                                                                                                                                    |
| ------------------------------------------------ | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Drawer, tab **Thông tin**                        | Section đầu tiên **Thông tin huỷ** (nền đỏ nhạt): lý do, thời điểm (`DD/MM/YYYY HH:mm`), người huỷ                                                                                                          |
| Người huỷ                                        | `cancelledBy` là UUID, nên gọi `GET /user/{id}` (`useAdminUserById`, đã có) và hiện `name`, nếu không có thì `email`. Không lấy được thì hiện "—". Chỉ gọi khi drawer mở, không gọi theo từng dòng của bảng |
| Đơn huỷ không có lý do (huỷ từ Swagger hoặc API) | Lý do hiện "—"                                                                                                                                                                                              |
| Bảng danh sách                                   | Giữ badge "Đã huỷ" như hiện tại, không thêm cột                                                                                                                                                             |

### 2.3 Phân quyền

Cả `admin` và `super_admin` đều được huỷ, theo BE ("admin only"). FE không phân quyền thêm.

### 2.4 Dữ liệu thiếu (null)

| Field null                              | Chỗ dùng mới trong spec này      | Hiển thị                                      |
| --------------------------------------- | -------------------------------- | --------------------------------------------- |
| `bookingCode`                           | Tiêu đề dialog, toast thành công | "Huỷ booking này?" / "Đã huỷ booking" (bỏ mã) |
| `productName`, `travelDate`, `username` | Tóm tắt trong dialog             | "—"                                           |
| `cancelReason`                          | Section Thông tin huỷ            | "—"                                           |

Code drawer hiện có đang gọi `dayjs(booking.travelDate)`, nên với `travelDate = null` sẽ hiện "Invalid Date". Đây là lỗi có sẵn, **không sửa trong spec này**; ghi lại để xử lý riêng nếu cần.

---

## 3. Thay đổi kỹ thuật

| File                                                                  | Thay đổi                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                               |
| --------------------------------------------------------------------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `src/api/booking/types.ts`                                            | `IBookingListItem` thêm `cancelReason: string \| null`, `cancelledAt: string \| null`, `cancelledBy: string \| null`. Thêm `ICancelBookingPayload { id: string; reason: string }` và `ApiCancelBookingResponse { data: IBookingListItem; ... }` (không dùng `ApiBookingResponse` vì kiểu đó là của API tạo booking)                                                                                                                                                                                                                    |
| `src/api/booking/requests.ts`                                         | `cancelBooking({ id, reason })`: gọi `ensureAdminAuth()` trước, rồi `request.post('/booking/${id}/cancel', { reason })`, trả `data.data`                                                                                                                                                                                                                                                                                                                                                                                               |
| `src/api/booking/queries.ts`                                          | `useCancelBooking = createMutation<IBookingListItem, ICancelBookingPayload>`                                                                                                                                                                                                                                                                                                                                                                                                                                                           |
| `src/hooks/use-cancel-booking.ts` (mới)                               | Gọi mutation. Khi thành công: `invalidateQueries(['/booking/list'], { refetchType: 'all' })`, gọi `onCancelled(updated)` để drawer cập nhật, toast. Khi lỗi: toast `getApiErrorMessage(err, t('admin.booking.cancel.failed'))`, tức `message` của BE (mảng thì nối bằng dấu phẩy). Interceptor reject bằng **body lỗi** `{ statusCode, message, timestamp, path }`, không phải AxiosError, nên **không** đọc `err.response.data`. `statusCode === 404` hoặc message `Booking is not pending` thì invalidate list và báo để đóng drawer |
| `src/modules/AdminBooking/components/booking-cancel-dialog.tsx` (mới) | **Dùng lại `AdminConfirmDialog`** (`tone="danger"`, `isPending`, slot `children`, thêm prop tuỳ chọn `confirmDisabled` để làm mờ nút khi lý do trống): truyền vào textarea lý do, counter, cảnh báo payment pending. Lý do giữ bằng `useState` và kiểm tra trong `onConfirm` bằng `normalizeText`, không dùng react-hook-form hay schema riêng (form chỉ có 1 ô)                                                                                                                                                                       |
| `src/modules/AdminBooking/components/booking-cancel-info.tsx` (mới)   | Section "Thông tin huỷ" (lý do, thời điểm, người huỷ qua `useAdminUserById`)                                                                                                                                                                                                                                                                                                                                                                                                                                                           |
| `src/modules/AdminBooking/components/BookingDetailDrawer.tsx`         | Thêm nút **Huỷ booking** (chỉ khi `pending`), render `BookingCancelInfo` khi `cancel`, nhận thêm prop `onBookingChange`                                                                                                                                                                                                                                                                                                                                                                                                                |
| `src/modules/AdminBooking/BookingListPage.tsx`                        | Truyền `onBookingChange={setDetailTarget}` để drawer hiện dữ liệu mới sau khi huỷ                                                                                                                                                                                                                                                                                                                                                                                                                                                      |
| `public/locales/{en,vi}/adminPage.json`                               | Key `admin.booking.cancel.*`: nút, tiêu đề, mô tả, nhãn lý do, placeholder, lỗi validate, cảnh báo payment, toast, thông tin huỷ                                                                                                                                                                                                                                                                                                                                                                                                       |

Có payment `pending` hay không thì lấy từ `useBookingPayments` (tab Thanh toán đã dùng); query chỉ chạy khi dialog mở.

### 3.1 Token (bắt buộc)

Endpoint yêu cầu `Authorization: Bearer <adminAccessToken>`. Không tự gắn header trong `cancelBooking`; dùng đúng cơ chế đang áp dụng cho mọi API ghi của admin:

1. **Kiểm tra trước khi gọi:** `ensureAdminAuth()` (`src/api/admin-auth-guard.ts`). Nếu store admin không có token thì logout, chuyển về `/admin/login` và không gọi mạng. Các request ghi của user, destination, supplier, product… đều đã làm vậy.
2. **Gắn header:** interceptor request trong `src/api/axios.ts` tự gắn `adminAccessToken` vì request phát ra từ route `/admin/*` (đường dẫn không bắt đầu bằng `/auth/` nên không bị bỏ qua).
3. **Token hết hạn:** khi gặp 401, interceptor response tự refresh bằng `adminRefreshToken` rồi gọi lại một lần; refresh thất bại thì logout admin.

Lưu ý khi test: đăng nhập admin ở nơi khác (curl, Swagger, MCP) sẽ thu hồi phiên admin đang mở trên trình duyệt. MCP `_web-travel-api` chỉ cho gọi GET nên không gọi thử được endpoint này; spec đọc từ `/docs-json`.

---

## 4. Dependencies & Conflicts

- **Depends on:** None. Endpoint đã có trên BE. `ensureAdminAuth`, `useAdminUserById`, `AdminConfirmDialog`, `getApiErrorMessage` và `normalizeText` đều đã có trên `dev`.
- **Modifies:** `BookingDetailDrawer` (thêm nút và section, không đổi các section hiện có); `BookingListPage` (thêm 1 prop); type `IBookingListItem` (chỉ thêm field).
- **Must NOT break:**
  - Bộ lọc, phân trang, empty state của danh sách booking.
  - Tab Thanh toán và timeline log.
  - Global `refetchOnMount: false`: phải invalidate với `refetchType: 'all'`, nếu không danh sách và stats không đổi.
- **Conflicts with:** `booking-list.md` §"Badge Dropdown cho Trạng Thái Booking" đề xuất đổi trạng thái bằng dropdown ngay trên bảng. Spec này **chỉ huỷ từ drawer** để tránh bấm nhầm, và BE chỉ hỗ trợ `pending → cancel`, không có API đổi sang `paid`. Cần đánh dấu phần đó trong `booking-list.md` là superseded cho thao tác huỷ.

---

## 5. Out of scope

- Hoàn tiền, huỷ giao dịch ở cổng thanh toán (xử lý thủ công, đúng như `booking-management.md`).
- Huỷ booking đã `paid`; khôi phục (un-cancel) booking.
- Huỷ hàng loạt; huỷ từ phía khách hàng.
- Gửi email hoặc thông báo cho khách. Nếu cần thì BE làm khi huỷ.
- Lọc hoặc tìm kiếm theo lý do huỷ, người huỷ.

---

## 6. Quyết định đã chốt

| Vấn đề                              | Quyết định                                                                                |
| ----------------------------------- | ----------------------------------------------------------------------------------------- |
| Lỗi khi huỷ đơn không còn `pending` | Swagger đã ghi: 400 `Booking is not pending`, 404 `Booking not found`. FE xử lý theo §2.1 |
| Lý do huỷ bắt buộc ở FE             | **Có**, để lưu vết thao tác không hoàn tác được                                           |
| Huỷ đơn `pending` đã quá ngày đi    | **Cho phép** (dọn đơn treo)                                                               |
| Lý do chọn nhanh                    | **Chưa làm**; bản đầu chỉ có textarea                                                     |

## 7. Việc cần BE (không chặn FE)

| #   | Việc                                                                                                                                                                | Mức độ                                   |
| --- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ---------------------------------------- |
| 1   | Đơn đã huỷ mà webhook sau đó báo thanh toán thành công: đề xuất giữ `cancel` và đánh dấu cần hoàn tiền, không tự chuyển `paid`. Có huỷ payment intent ở cổng không? | **Cần trả lời trước khi lên production** |
| 2   | Đổi `CancelBookingDto.reason` thành required cho đồng bộ với FE                                                                                                     | Thấp                                     |
| 3   | Trả kèm `cancelledByName` trong `Booking`, để FE không phải gọi thêm `GET /user/{id}` (lỗi thì FE hiện "—")                                                         | Thấp                                     |
