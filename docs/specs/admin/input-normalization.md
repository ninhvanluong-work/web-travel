---
title: 'Admin — Chuẩn hoá input: trim form, search keyword, ký tự đặc biệt'
created: '2026-10-16'
status: 'draft'
domain: 'admin'
related: 'admin/destination-management.md'
---

# Spec: Chuẩn hoá input cho toàn bộ trang Admin

## 1. Vấn đề

### 1.1. Search (đã test API thật bằng curl, 2026-10-16)

| Input gửi lên `keyword`             | Kết quả BE                                       | Mức độ                                            |
| ----------------------------------- | ------------------------------------------------ | ------------------------------------------------- |
| `"   "` (chỉ khoảng trắng)          | 0 kết quả (BE không trim)                        | 🟠 Admin lỡ gõ dấu cách → bảng trống              |
| `" Mi"`, `"Mi "`, `"Miền  Bắc"`     | 0 kết quả                                        | 🟠 Copy/paste dính khoảng trắng → không ra        |
| `%` hoặc `_`                        | **Trả TOÀN BỘ record** (`ILIKE` không escape)    | 🔴 Wildcard injection, `Mi%Nam` khớp "Miền Nam"   |
| `\%`, `\_`                          | Hiểu đúng là ký tự thường                        | ✅ FE có thể escape tạm                           |
| `'`, `"`, `\`, `(`, `[`, `<script>` | 200, 0 kết quả                                   | ✅ Không SQL injection (query có tham số hoá)     |
| `%00` (null byte)                   | **500**, lộ lỗi Postgres `invalid byte sequence` | 🔴 Lộ thông tin DB                                |
| `"Miền"` dạng NFD (tách dấu)        | 0 kết quả                                        | 🟠 Gõ trên macOS/iOS, copy từ PDF/Word → không ra |
| 600 ký tự                           | 200, 0 kết quả                                   | 🟡 Không giới hạn độ dài                          |

Đã test trên `/destination`, `/product`, `/tag`, `/tour-guide`, `/supplier` (có token admin), tất cả đều cho cùng kết quả.

### 1.2. Hiện trạng code FE

**Search:** không ô search nào trim trước khi gửi API:

| #   | Ô search                                                 | Lọc ở đâu                 | Vấn đề                                                                                      |
| --- | -------------------------------------------------------- | ------------------------- | ------------------------------------------------------------------------------------------- |
| A1  | Product list (`use-product-filters.ts:30`)               | Server `GET /product`     | Gửi `"   "`. `hasActiveFilters` tính trên giá trị thô, nên `"   "` vẫn hiện nút "Clear all" |
| A2  | Tour guide list (`GuideListPage/index.tsx:24`)           | Server `GET /tour-guide`  | Gửi `"   "`                                                                                 |
| A3  | Supplier list (`SupplierListPage.tsx:32`)                | Client `.includes`        | Đã trim, nhưng chưa chuẩn hoá NFC                                                           |
| A4  | Video list (`use-video-list-paged.ts:33`)                | Server `GET /video/admin` | Gửi `"   "`                                                                                 |
| A5  | Booking list (`use-booking-list-state.ts:31`)            | Server `GET /booking`     | Gửi `"   "`. `hasActiveFilters` tính trên giá trị thô                                       |
| A6  | Tag search, form Product (`tag-search-dropdown.tsx:40`)  | Server `GET /tag`         | Gửi `"   "`                                                                                 |
| A7  | Video search, form Product (`video-search-field.tsx:49`) | Server `GET /video/admin` | Gửi `"   "`                                                                                 |
| A8  | Expert search, form Guide                                | Client                    | ✅ Đã trim                                                                                  |
| A9  | Element combobox                                         | Client                    | Filter dùng giá trị thô (create thì đã trim)                                                |
| A10 | `SelectWithSearch` (cmdk)                                | Client (cmdk tự lọc)      | Không ảnh hưởng BE, ngoài scope                                                             |

**Form:** các field bắt buộc dùng zod `.min(1)` mà không `.trim()`, nên `"   "` vẫn **pass validate và được lưu**:

| Form                 | Field                                                                                                                    | Schema                                         |
| -------------------- | ------------------------------------------------------------------------------------------------------------------------ | ---------------------------------------------- |
| Product              | `name`, `slug`, `experiences[].title`, `itineraries[].name`, `options[].title`, `pickupLocations[].name`, `units[].name` | `lib/validations/product.ts`                   |
| Tour guide           | `name`, `careerPath[].role`, `careerPath[].company`                                                                      | `lib/validations/tour-guide.ts`                |
| Video upload (2 nơi) | `name`: đã chặn rỗng nhưng gửi giá trị **chưa trim**                                                                     | `video-upload-card.tsx`, `use-video-upload.ts` |

Các field optional (mô tả, highlight, note...) cũng không được trim khi gửi.

✅ Đã đúng: Supplier form, Supplier payment, Tag create, Element create, Destination (module mới).

---

## 2. Giải pháp

### 2.1. Nguyên tắc

1. **Chuẩn hoá ở 1 nơi duy nhất.** Thêm helper dùng chung, không viết `.trim()` rải rác.
2. **Giá trị hiển thị ≠ giá trị gửi đi.** Ô input giữ nguyên những gì admin gõ, chỉ chuẩn hoá khi gửi API hoặc submit form.
3. **FE là lớp bảo vệ thứ nhất, BE bắt buộc vẫn phải sửa** (mục 2.5).

### 2.2. Helper mới: `src/lib/text-normalize.ts`

| Hàm                         | Làm gì                                                                                                                                           | Dùng cho                    |
| --------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------ | --------------------------- |
| `normalizeText(v)`          | `normalize('NFC')`, bỏ ký tự điều khiển (`\u0000-\u0008`, `\u000B`, `\u000C`, `\u000E-\u001F`, `\u007F`, giữ `\n` `\t`), `\r\n → \n`, trim 2 đầu | Textarea / mô tả nhiều dòng |
| `normalizeSingleLine(v)`    | `normalizeText` + gộp mọi khoảng trắng (kể cả `\n`, NBSP) thành 1 dấu cách                                                                       | Tên, tiêu đề, slug          |
| `normalizeSearchKeyword(v)` | `normalizeSingleLine` + cắt tối đa 100 ký tự. Rỗng → `undefined`                                                                                 | Mọi ô search                |

### 2.3. Zod helper mới: `src/lib/validations/text-fields.ts`

```ts
requiredText({ min = 1, max, message }); // z.string().transform(normalizeSingleLine).pipe(z.string().min(min, message).max(max))
optionalText({ max }); // transform(normalizeText), rỗng → ''
multilineText({ max }); // giữ \n bên trong
```

Thay `.min(1)` bằng `requiredText()` ở các field trong mục 1.2. Kết quả:

- `"   "` → lỗi "Bắt buộc".
- `"  Hạ Long  "` → submit `"Hạ Long"`.

### 2.4. Search hook mới: `src/hooks/use-search-keyword.ts`

```ts
const { keyword, setKeyword, debouncedKeyword, isActive } = useSearchKeyword({ delay: 300 });
// debouncedKeyword = normalizeSearchKeyword(debounced(raw)), undefined khi rỗng
// isActive = !!debouncedKeyword, dùng cho "Clear all" / empty state
```

- Thay `useDebounce(keyword, 300)` ở các ô A1, A2, A4, A5, A6, A7.
- Query key dùng giá trị đã chuẩn hoá, nên `"abc"` và `"abc "` dùng chung cache, không gọi API 2 lần.
- Input thêm `maxLength={100}`.
- **Wildcard `%` `_`: FE KHÔNG escape** (quyết định 2026-10-16). Chờ BE sửa B1 để tránh escape 2 lần.

### 2.5. Đề xuất cho BE (FE không tự sửa được)

| #   | Việc                                                                            | Lý do                                              |
| --- | ------------------------------------------------------------------------------- | -------------------------------------------------- |
| B1  | Escape `%`, `_`, `\` trước khi đưa vào `ILIKE` (hoặc dùng `ESCAPE` clause)      | Wildcard injection                                 |
| B2  | Trim keyword; `keyword` rỗng sau trim thì bỏ qua filter                         | Đồng bộ với FE                                     |
| B3  | Chặn null byte / ký tự điều khiển → trả 400, **không trả 500 kèm lỗi Postgres** | Lộ thông tin DB                                    |
| B4  | `@MaxLength(100)` cho `keyword`                                                 | Chống query nặng                                   |
| B5  | DTO tạo/sửa: `@Transform(trim)` + `@IsNotEmpty()` cho field bắt buộc            | FE bị bypass (gọi API trực tiếp) thì vẫn chặn được |
| B6  | (Tuỳ chọn) `unaccent()` để tìm không dấu: `mien` → "Miền"                       | UX                                                 |

---

## 3. Thay đổi kỹ thuật

### 3.1. File mới

- `src/lib/text-normalize.ts`
- `src/lib/validations/text-fields.ts`
- `src/hooks/use-search-keyword.ts`

### 3.2. File có sẵn cần sửa (⚠️ CHỜ DUYỆT)

| Nhóm           | File                                                                                                                                                                                                                                               | Thay đổi                                                                                            |
| -------------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | --------------------------------------------------------------------------------------------------- |
| Form schema    | `lib/validations/product.ts`, `lib/validations/tour-guide.ts`                                                                                                                                                                                      | Field bắt buộc → `requiredText()`, field optional → `optionalText()` / `multilineText()`            |
| Video upload   | `AdminVideo/.../video-upload-card.tsx`, `AdminProduct/.../use-video-upload.ts`                                                                                                                                                                     | Gửi `normalizeSingleLine(name)`, `normalizeText(description)`                                       |
| Option include | `AdminProduct/.../option-card.tsx:93`                                                                                                                                                                                                              | `trimStart()` → `normalizeSingleLine()`                                                             |
| Search hooks   | `hooks/use-product-filters.ts`, `AdminTourGuide/GuideListPage/index.tsx`, `AdminVideo/.../use-video-list-paged.ts`, `AdminBooking/hooks/use-booking-list-state.ts`, `AdminProduct/.../tags-section.tsx`, `AdminProduct/.../video-search-field.tsx` | Dùng `useSearchKeyword` hoặc `normalizeSearchKeyword`; `hasActiveFilters` dùng giá trị đã chuẩn hoá |
| Search input   | Các input của A1, A2, A4, A5, A6, A7                                                                                                                                                                                                               | `maxLength={100}`                                                                                   |
| Client filter  | `AdminSupplier/SupplierListPage.tsx:32`, `element-value-combobox.tsx:48`                                                                                                                                                                           | Chuẩn hoá NFC cả keyword và dữ liệu khi so sánh                                                     |

**Không động vào:**

- `src/api/axios.ts` (interceptor + refresh token)
- `src/lib/Provider.tsx`
- Logic draft / autosave của Product
- `SelectWithSearch` (cmdk)

### 3.3. Thứ tự làm (mỗi bước 1 commit, test xong mới sang bước sau)

1. ✅ Helper + zod helper + hook (file mới, không ảnh hưởng gì)
2. ✅ Form Product + Tour guide + Video upload (sửa lỗi lưu được `"   "`)
   - Chỉ chuẩn hoá field plain-text 1 dòng. Field rich-text / nhiều đoạn (`description` TinyMCE, `include`, `exclude`, `highlight`, `shortDescription`, `content`, `readBefores.description`, guide `quote` / `summary` / `description`) **giữ nguyên**, sẽ xử lý riêng nếu cần.
   - `tourGuideSchema` dùng chung với trang Guide tự sửa hồ sơ (`use-edit-profile-form.ts`), nên trang đó cũng được chặn `"   "`.
3. ✅ Search: component `AdminSearchInput` (debounce 400ms, Enter search ngay, Esc/✕ xoá, bỏ qua lúc IME đang ghép dấu, `maxLength` 100) cho Product, Tour guide, Video, Booking, Destination. Tag search + Video search trong form Product dùng `useDebouncedSearchKeyword`
4. ~~Escape wildcard~~: bỏ, chờ BE (B1)
5. Client filter Supplier / Element

---

## 4. Dependencies & Conflicts

- **Must NOT break:**
  - Draft autosave Product: `useProductDraft` lưu giá trị **thô** của form. Transform zod chỉ chạy lúc submit, nên không ảnh hưởng.
  - `generateSlug`
  - `form.reset` khi edit Product / Guide (dữ liệu từ BE đã trim, nên không làm form bị dirty).
- **Rủi ro:** `requiredText` dùng `.transform().pipe()`, nên kiểu input và output của zod có thể khác nhau. Cần chạy `tsc` sau khi đổi `ProductFormValues` / `TourGuideFormValues`.

## 5. Quyết định (2026-10-16)

1. ✅ Duyệt mục 3.2, làm lần lượt từng bước ở mục 3.3.
2. ✅ Wildcard: FE không escape, chờ BE (B1).
3. ✅ Tìm không dấu: phía server giao BE (B6). Phía client (Supplier) FE có thể tự làm, cần đề xuất ở bước 5.

---

## 6. Phần Client (✅ đã làm C1–C9, 2026-10-16)

| #   | Màn hình / field                                                                                        | Vấn đề                                                                                        | Đề xuất                                                                             |
| --- | ------------------------------------------------------------------------------------------------------- | --------------------------------------------------------------------------------------------- | ----------------------------------------------------------------------------------- | --- | ---------- |
| C1  | Search page: đọc `router.query.q` (`DetailSearchPage/index.tsx:20,31`)                                  | `/search?q=%20%20` gửi `"  "` lên `/video`; `?q=%20Sapa%20` không trim, tạo cache key riêng   | `normalizeSearchKeyword` khi đọc `q` từ URL                                         |
| C2  | Home SearchBox (`SearchBox.tsx:23`)                                                                     | Chỉ `.trim()`, chưa NFC, chưa gộp khoảng trắng                                                | `normalizeSearchKeyword`                                                            |
| C3  | Review comment (`review.ts:5`, `rating-sheet.tsx:46,59`)                                                | 🔴 Bắt buộc nhưng `"   "` vẫn pass; gửi giá trị thô thay vì output đã parse                   | `requiredText({ max: 500, multiline: true })` + gửi `parsed.data`                   |
| C4  | Booking contact (`use-booking-sheet-state.ts:89-90,105-107`)                                            | Validate có trim nhưng gửi giá trị thô; email không lowercase                                 | Gửi `normalizeSingleLine(name/handle)`, `email.trim().toLowerCase()`                |
| C5  | Guide sửa hồ sơ: `quote`, `summary`, `description`, `careerPath.description` (`tour-guide.ts:12,28-30`) | Lưu được `"   "`, không trim                                                                  | `optionalText()` (quote/summary), `optionalText({ multiline: true })` (description) |
| C6  | Moment caption (`manage-moments-add-sheet.tsx:100,131`)                                                 | Gửi `"   "`                                                                                   | `normalizeText(caption)                                                             |     | undefined` |
| C7  | Goong autocomplete + địa chỉ nhập tay (`goong-autocomplete.tsx:47,94`, `goong.ts:28`)                   | Gửi query/địa chỉ chưa trim                                                                   | `normalizeSingleLine` trước khi gửi / lưu                                           |
| C8  | Forgot-password email (`auth.ts:77`); login email (`auth.ts:71`)                                        | Forgot: không trim/lowercase. Login: trim **sau** `.email()` (NBSP làm fail), không lowercase | `z.string().trim().toLowerCase().email()` (trim trước validate)                     |
| C9  | Thêm expert bằng Enter (`mobile-experts-section.tsx:236`)                                               | Enter lúc IME đang ghép dấu (macOS/iOS) thêm chữ dở dang                                      | Bỏ qua khi `e.nativeEvent.isComposing`                                              |

**Tuyệt đối không trim:** password (login, sign-up, reset), reset `token` từ URL, phone (thư viện đã trả E.164).

**Lỗi khác phát hiện được (ngoài scope trim, chưa sửa):**

- ✅ `endYear` của careerPath: **không phải lỗi FE**. Đã kiểm tra DB (2026-10-17): `tour_guide.career_path[]` chỉ lưu `company, role, startYear, tourCount, description`, không có `endYear`. Nếu muốn lưu năm kết thúc thì BE phải thêm vào DTO/entity trước.
- ✅ `manage-moments-add-sheet.tsx`: khi sửa moment, giờ gửi `description: ""` để xoá được caption (cần test với BE).

**C8 cập nhật (2026-10-16):** BE so sánh email **phân biệt hoa/thường**, trong khi sign-up lowercase còn login thì không, nên user gõ `Lan@...` không đăng nhập được. Đã quét 69 user qua `GET /user`: chỉ 1 email chữ hoa (tài khoản test `Us…@example.com`, trùng với `us…@example.com`). Vì vậy đã **lowercase** ở login, login admin, quên mật khẩu (`.trim().toLowerCase()` trước `.email()`), thêm hàm `normalizeEmail()` dùng chung, và thêm `inputMode=email`, `autoCapitalize=none`, `autoCorrect=off`, `spellCheck=false`, `autoComplete` cho 7 ô email.

**BE cần:** (B7) so sánh email không phân biệt hoa/thường ở mọi endpoint auth; unique index trên `lower(email)`; dọn tài khoản trùng `Us…@example.com` / `us…@example.com`.
