# [BE] Tour guide: admin không sửa được hồ sơ + 2 lỗ hổng bảo mật

- **Ngày:** 2026-11-02
- **Môi trường:** `https://web-travel-be.fly.dev`
- **Code đối chiếu:** `web-travel-be` `origin/main` @ `a397ff9`
- **Người báo:** FE (web-travel)

| #   | Vấn đề                                         | Loại    | Mức độ                |
| --- | ---------------------------------------------- | ------- | --------------------- |
| 1   | Admin / super_admin không sửa được tour guide  | Bug     | Cao: chặn trang admin |
| 2   | Không đăng nhập vẫn tạo và xoá được tour guide | Bảo mật | 🔴 Gấp                |
| 3   | Hướng dẫn viên sửa được hồ sơ của người khác   | Bảo mật | 🟠 Cao                |

---

## 1. Admin không sửa được tour guide

### Hiện tượng

Mọi API tour guide yêu cầu đăng nhập đều trả `401 "Token expired or invalid"` khi dùng token admin hoặc super_admin, kể cả token vừa đăng nhập xong:

- `PUT /tour-guide/{id}`
- `POST /tour-guide/onboarding`
- `POST`, `PUT`, `DELETE /tour-guide/{id}/moment...`

### Nguyên nhân

`src/common/guards/user.guard.ts` khoảng dòng 57, được thêm ở commit `4458c5d` (2026-06-29, "feat: guard, check user, tour-guide token"):

```ts
if (isTourGuide && !payload?.tourGuideId) {
  throw new UnauthorizedException('Invalid token');
}
```

Token admin luôn có `tourGuideId: null`, ví dụ payload:

```json
{ "userId": "052c4c6c-…", "tourGuideId": null, "role": "super_admin" }
```

nên mọi route gắn `@TourGuide()` đều chặn admin. `optional-user.guard.ts` (khoảng dòng 48) có cùng điều kiện.

Ngoài ra, khối `catch` trong guard bọc mọi lỗi thành `"Token expired or invalid"`, nên lỗi phân quyền trông giống lỗi hết hạn token và gây hiểu nhầm khi debug.

### Tái hiện

Body cố tình sai kiểu, nên request không ghi dữ liệu (NestJS chạy guard trước validation pipe):

```bash
curl -X PUT https://web-travel-be.fly.dev/tour-guide/5e4f095b-a10b-451b-94b8-1f95c01fb477 \
  -H "Authorization: Bearer <ADMIN_TOKEN>" \
  -H "Content-Type: application/json" \
  -d '{"expYear":"x"}'
```

- **Thực tế:** `401 {"message":"Token expired or invalid"}`
- **Mong đợi:** `400` (lỗi validate), tức đã qua guard

Đối chứng với cùng token:

| Request                        | Kết quả               |
| ------------------------------ | --------------------- |
| `GET /user/...`                | 400 (qua guard)       |
| `PUT /destination/{id}`        | 404 / 400 (qua guard) |
| `PUT /tour-guide/{id}`         | **401**               |
| `POST /tour-guide/{id}/moment` | **401**               |
| `POST /tour-guide/onboarding`  | **401**               |

### Đề xuất sửa

```ts
// user.guard.ts (and the same check in optional-user.guard.ts)
const isAdminRole = payload?.role === UserRole.ADMIN || payload?.role === UserRole.SUPER_ADMIN;

if (isTourGuide && !payload?.tourGuideId && !isAdminRole) {
  throw new UnauthorizedException('Invalid token');
}
```

Nên để lỗi phân quyền đi ra ngoài `catch` (hoặc ném lại nguyên `UnauthorizedException`) để client nhận đúng message.

---

## 2. 🔴 Không đăng nhập vẫn tạo và xoá được tour guide

### Nguyên nhân

`src/modules/tour-guide/tour-guide.controller.ts`:

| Route            | Dòng    | Decorator hiện tại |
| ---------------- | ------- | ------------------ |
| `@Post()`        | 62–63   | `@Public()`        |
| `@Delete(':id')` | 213–214 | `@Public()`        |

### Đã kiểm chứng trên production (không gửi token)

| Request                                                | Kết quả                                 | Ý nghĩa                                                                                            |
| ------------------------------------------------------ | --------------------------------------- | -------------------------------------------------------------------------------------------------- |
| `DELETE /tour-guide/<uuid không tồn tại>`              | `404 "Tour guide not found"`            | Không đòi đăng nhập: với id có thật thì **xoá được**, có thể xoá lần lượt toàn bộ danh sách        |
| `DELETE /destination/<uuid không tồn tại>` (đối chứng) | `401 "Token is missing"`                | Route admin bình thường thì có chặn                                                                |
| `POST /tour-guide` body `{"name":123}`                 | **Tạo thành công**, `created_by = null` | Ai cũng tạo được hướng dẫn viên; endpoint cũng **không validate kiểu** (`name` là number vẫn nhận) |

### Đề xuất sửa

- Đổi `@Post()` và `@Delete(':id')` sang `@Admin()`.
- Kiểm tra lại `CreateTourGuideDto`: `name` phải là string (`@IsString()`), xem lại `ValidationPipe` có bật `whitelist` / `forbidNonWhitelisted` không.

---

## 3. 🟠 Hướng dẫn viên sửa được hồ sơ của người khác

### Nguyên nhân

`src/modules/tour-guide/tour-guide.service.ts` › `update()` (dòng 150) chỉ kiểm tra hồ sơ có tồn tại. Hàm không so `id` cần sửa với `tourGuideId` trong token. Guard chỉ kiểm tra token "có `tourGuideId`", nên **bất kỳ hướng dẫn viên nào** cũng `PUT /tour-guide/<id của người khác>` được.

Các route moment (`POST`, `PUT`, `DELETE /tour-guide/:id/moment...`) cũng cần rà lại cùng điểm này.

> Mục này xác nhận bằng đọc code, chưa test trên production để tránh sửa hồ sơ thật.

### Đề xuất sửa

```ts
// tour-guide.service.ts › update(): non-admin users may only edit their own profile
if (!isAdminRole && tourGuide.id !== tourGuideIdFromToken) {
  throw new ForbiddenException('You can only edit your own profile');
}
```

Controller cần truyền thêm `tourGuideId` và `role` từ request (guard đã gán sẵn `request.tourGuideId`, `request.role`).

---

## Tiêu chí hoàn thành

| Request                                                                                 | Mong đợi                              |
| --------------------------------------------------------------------------------------- | ------------------------------------- |
| `PUT /tour-guide/{id}` với token admin / super_admin                                    | 200 (body hợp lệ) hoặc 400 (body sai) |
| `PUT /tour-guide/{id của chính mình}` với token hướng dẫn viên                          | 200                                   |
| `PUT /tour-guide/{id người khác}` với token hướng dẫn viên                              | 403                                   |
| `POST /tour-guide`, `DELETE /tour-guide/{id}` không token                               | 401                                   |
| `POST /tour-guide`, `DELETE /tour-guide/{id}` với token user thường hoặc hướng dẫn viên | 401 / 403                             |
| `POST /tour-guide`, `DELETE /tour-guide/{id}` với token admin                           | 200                                   |
| Route moment với token hướng dẫn viên khác                                              | 403                                   |

Sau khi sửa cần **deploy lại** `web-travel-be.fly.dev`.

**FE:** đã sẵn sàng, không cần chỉnh thêm. FE gửi token admin, gọi `ensureAdminAuth()` trước các thao tác tạo/sửa/xoá, và hiện nguyên văn `message` lỗi của BE.

---

## Dữ liệu rác cần dọn

Trong lúc kiểm chứng mục 2 đã vô tình tạo 1 bản ghi:

| Field           | Giá trị                                |
| --------------- | -------------------------------------- |
| `tour_guide.id` | `f3155537-d453-4a32-ae5d-cb97a9229554` |
| `name`          | `"123"`                                |
| `created_by`    | `null`                                 |
| User liên kết   | Không có                               |

Nhờ BE xoá giúp (soft delete), hoặc FE sẽ xoá qua trang admin.

> Cập nhật 2026-11-03: bản ghi này đã được FE đổi tên thành `ZZ junk test guide (to delete)` khi test luồng sửa của admin. Vẫn cần xoá.

---

# Cập nhật 2026-11-03: kiểm tra lại sau commit BE `448385a`

BE đã deploy commit `448385a` ("feat: update tour-guide security"). Kiểm chứng trên production (body sai hoặc id không tồn tại, không ghi dữ liệu):

| Hạng mục                                      | Kết quả                                                   | Trạng thái |
| --------------------------------------------- | --------------------------------------------------------- | ---------- |
| Admin sửa tour guide (`PUT /tour-guide/{id}`) | Qua guard (400 khi body sai); FE admin lưu thành công 200 | ✅ Đã sửa  |
| Hướng dẫn viên sửa hồ sơ người khác           | `assertCanManage` trả 403 (đọc code)                      | ✅ Đã sửa  |
| Xoá tour guide không token                    | 401 `Token is missing`                                    | ✅ Đã sửa  |
| Admin xoá tour guide                          | Qua guard (404 với id giả)                                | ✅ Đã sửa  |
| Admin xoá moment                              | Qua guard (404 `Moment not found` với id giả)             | ✅ Đã sửa  |

## Còn tồn đọng

### R1. 🔴 `POST /tour-guide` vẫn `@Public()`

Không gửi token, body `{}` → `400 "name must be a string"`, tức đã qua guard. Người lạ vẫn tạo được hướng dẫn viên.

- **File:** `tour-guide.controller.ts`, `@Post()` (dòng 69–70)
- **Đề xuất:** đổi `@Public()` thành `@ApiBearerAuth(USER_TOKEN)` + `@Admin()`

### R2. 🟠 Sửa / tạo moment chưa kiểm tra người gọi

- `PUT /tour-guide/:id/moment/:momentId` (`updateTourGuideMoment`): chỉ gọi `findMomentOfTourGuide(momentId, id)`, tức kiểm tra moment thuộc hướng dẫn viên **trên URL**, không kiểm tra URL đó có phải của **người gọi**. Hướng dẫn viên A gọi `PUT /tour-guide/<id của B>/moment/<moment của B>` vẫn sửa được.
- `POST /tour-guide/:id/moment` (`createTourGuideMoment`): gán `dto.tourGuideId = param.id` mà không kiểm tra, nên A tạo được moment trên hồ sơ của B.
- **Đề xuất:** gọi `this.tourGuideService.assertCanManage(param.id, tourGuideId, role)` ở cả hai handler, giống `update` và `deleteTourGuideMoment`.

> Xác nhận bằng đọc code (`origin/main` @ `448385a`); không test trên production để tránh sửa moment thật.

### R3. 🟡 Xoá tour guide đang gắn tài khoản user

`remove()` chỉ soft-delete `tour_guide`; user vẫn giữ `tour_guide_id` trỏ tới hồ sơ đã xoá. Token của user đó vẫn chứa `tourGuideId` cũ, nên (dự kiến, chưa test) các route `@TourGuide()` vẫn cho qua guard nhưng service sẽ báo `Tour guide not found`. Hiện có **19** tour guide đang gắn user.

- **Cần quyết định:** chặn xoá khi còn gắn user (409), hay xoá kèm gỡ liên kết (`user.tour_guide_id = null`, đổi role về `normal`, thu hồi token)?
- **FE hiện tại:** dialog xoá đã cảnh báo admin khi tour guide gắn tài khoản hoặc có moment, nhưng vẫn cho xoá.

### R4. 🟡 API tour guide không trả thông tin tài khoản liên kết

FE phải tra danh sách `GET /user?role=tour_guide&pageSize=50` để biết tour guide có gắn user không. Cách này sẽ sai khi có hơn 50 tài khoản hướng dẫn viên.

- **Đề xuất:** `GET /tour-guide/{id}` trả thêm `user: { id, email, name } | null` (hoặc `userId`).

### R5. 🟢 Thông báo lỗi phân quyền gây hiểu nhầm

Sai quyền (ví dụ admin gọi `POST /tour-guide/{id}/moment`) vẫn trả `401 "Token expired or invalid"`, vì `UnauthorizedException('Invalid token')` bị khối `catch` trong `user.guard.ts` bọc lại.

- **Đề xuất:** ném lại nguyên lỗi (`if (error instanceof UnauthorizedException) throw error;`), và trả 403 cho trường hợp đúng token nhưng sai quyền.

### Câu hỏi sản phẩm

- Admin có cần **tạo / sửa** moment không? Hiện BE chỉ cho admin **xoá** (`POST` và `PUT` moment trả 401 với token admin). FE đang làm theo hướng chỉ xoá.

## Tiêu chí hoàn thành (bổ sung)

| Request                                                               | Mong đợi                |
| --------------------------------------------------------------------- | ----------------------- |
| `POST /tour-guide` không token                                        | 401                     |
| `POST /tour-guide` với token admin                                    | 200                     |
| `PUT /tour-guide/{id B}/moment/{moment B}` với token hướng dẫn viên A | 403                     |
| `POST /tour-guide/{id B}/moment` với token hướng dẫn viên A           | 403                     |
| Sai quyền nhưng token hợp lệ                                          | 403 với message rõ ràng |
