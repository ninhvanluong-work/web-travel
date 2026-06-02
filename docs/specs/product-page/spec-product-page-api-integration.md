# Spec: ProductPage — Ghép API thực (Phase 2)

**Status:** 🔄 In Progress  
**Tạo:** 2026-05-12  
**Cập nhật:** 2026-05-12  
**Feature area:** `ProductPage → API Integration`  
**Phụ thuộc:** `spec-product-page-from-video.md` (Phase 1 — UI với mock data)

---

## 1. Bối cảnh & Mục tiêu

Phase 1 đã hoàn thành UI với `MOCK_PRODUCT` hardcode. Phase 2 này thay thế mock data bằng dữ liệu thực từ backend, **không thay đổi giao diện**.

**Endpoint:** `GET /product/:id`  
**Base URL:** `https://web-travel-be.fly.dev`  
**Product ID tạm (hardcode):** `3dde9474-2f66-45d2-9951-320a4ae5dc68`

> Trang trước (VideoDetailPage) chưa trả `productId` trong response → dùng constant `TEMP_PRODUCT_ID` tạm thời cho đến khi backend bổ sung.

---

## 2. API Response Shape (thực tế)

```jsonc
// GET /product/3dde9474-2f66-45d2-9951-320a4ae5dc68
{
  "data": {
    "id": "3dde9474-2f66-45d2-9951-320a4ae5dc68",
    "name": "Hạ Long Bay Tour",
    "description": "Detailed description of the tour...",
    "shortDescription": null, // có thể null
    "slug": "ha-long-bay-tour",
    "thumbnail": "https://example.com/thumb.jpg",
    "code": null,
    "images": ["img1.jpg", "img2.jpg"],
    "banner": [
      // dùng cho HeroCarousel
      { "url": "https://example.com/banner.jpg", "type": "image" },
      { "url": "https://example.com/banner.mp4", "type": "video" }
    ],
    "readBefore": [
      // dùng cho BeforeYouBook
      {
        "key": "passport",
        "title": "Passport Required",
        "description": "You need a valid passport to enter the country"
      }
    ],
    "duration": 3,
    "durationType": "day",
    "highlight": "Visit cave, swimming...",
    "include": "Lunch, Guide, Entrance fee",
    "exclude": "Personal expenses, VAT",
    "status": "published",
    "minPrice": "1500000.00", // VND, decimal string
    "reviewPoint": 0,
    "reviewCount": 0,
    "destinationId": "cedbb7f1-...",
    "supplierId": "dc6c8abe-...",
    "supplierName": null, // chưa có — dùng fallback hardcode
    "itineraries": [
      {
        "id": "3f096a4f-...",
        "name": "Điểm 1",
        "featuredName": "day 1", // → dùng làm "time" label
        "order": 1,
        "description": "Mô tả 1",
        "productId": "3dde9474-..."
      }
    ],
    "tags": [{ "id": "1cacb2f6-...", "name": "moutain" }],
    "tourGuides": [
      {
        "id": "ae0fc0ef-...",
        "name": "long",
        "avatar": null,
        "ratingCount": 0,
        "expYear": 0,
        "ratingStar": 0
      }
    ]
  },
  "code": 200,
  "message": "ok",
  "error": null
}
```

---

## 3. Field Mapping: API → UI

| UI Component         | UI Prop                       | API Source                          | Transform / Fallback                                                       |
| -------------------- | ----------------------------- | ----------------------------------- | -------------------------------------------------------------------------- |
| `HeroCarousel`       | `media[]`                     | `banner[]`                          | Map trực tiếp `{url, type}`. Nếu rỗng → fallback `thumbnail` thành image   |
| `ProductHeader`      | `tags`                        | `tags[].name`                       | Extract string array                                                       |
| `ProductHeader`      | `name`                        | `name`                              | Direct                                                                     |
| `ProductHeader`      | `shortDescription`            | `shortDescription` ?? `description` | Fallback về `description` nếu null                                         |
| `ProductHeader`      | `rating`                      | `reviewPoint`                       | Direct                                                                     |
| `ProductHeader`      | `reviewCount`                 | `reviewCount`                       | Direct                                                                     |
| Free Cancel badge    | `freeCancellation`            | ❌                                  | Fallback `false` → **ẩn badge**                                            |
| `QuickFactsGrid`     | `duration`                    | `duration` + `durationType`         | `"3 day"`                                                                  |
| `QuickFactsGrid`     | `departurePoint`              | ❌                                  | Fallback `"—"`                                                             |
| `QuickFactsGrid`     | `pickupTime`                  | ❌                                  | Fallback `"—"`                                                             |
| `QuickFactsGrid`     | `groupSize`                   | ❌                                  | Fallback `"—"`                                                             |
| `QuickFactsGrid`     | `languages`                   | ❌                                  | Fallback `["VI"]`                                                          |
| `QuickFactsGrid`     | `difficulty`                  | ❌                                  | Fallback `"—"`                                                             |
| `ExperienceCards`    | `highlights[]`                | `highlight` (string)                | Split bởi `,` → mỗi item: `{icon: 'sunRise', title, subtitle: ''}`         |
| USP block            | `uniqueSellingPoint`          | `description`                       | Dùng tạm description                                                       |
| `OperatorBlock`      | `name`                        | `supplierName` ??                   | Fallback hardcode `"VietNam Village Vibes"`                                |
| `OperatorBlock`      | `initials`                    | Từ `supplierName`                   | Lấy 2 chữ cái đầu `"VV"`                                                   |
| `OperatorBlock`      | `rating`, `reviewCount`, etc. | ❌                                  | Fallback `0` / `—`                                                         |
| `GuideBlock`         | `name`                        | `tourGuides[0].name`                | Direct. Ẩn section nếu `tourGuides` rỗng                                   |
| `GuideBlock`         | `initials`                    | `tourGuides[0].name`                | Lấy chữ cái đầu                                                            |
| `GuideBlock`         | `rating`                      | `tourGuides[0].ratingStar`          | Direct                                                                     |
| `GuideBlock`         | `yearsExperience`             | `tourGuides[0].expYear`             | Direct                                                                     |
| `GuideBlock`         | `toursInArea`                 | `tourGuides[0].ratingCount`         | Dùng tạm                                                                   |
| `GuideBlock`         | `area`                        | ❌                                  | Fallback `"Vietnam"`                                                       |
| `ItineraryAccordion` | `steps[]`                     | `itineraries[]`                     | `order` → `step`, `featuredName` → `time`, `name` → `title`, `description` |
| `BeforeYouBook`      | `items[]`                     | `readBefore[]`                      | `key` → type lookup (xem bảng bên dưới), `title`, `description`            |
| `IncludedSection`    | `included[]`                  | `include` (string)                  | Split bởi `,` + trim                                                       |
| `IncludedSection`    | `notIncluded[]`               | `exclude` (string)                  | Split bởi `,` + trim                                                       |
| `ReviewsSection`     | `reviews[]`                   | Endpoint riêng (Phase 4)            | Empty array `[]` → hiển thị empty state cho đến khi implement              |
| `StickyCTABar`       | `salePrice`                   | `minPrice`                          | `parseFloat("1500000.00")` — hiển thị dưới dạng `$`                        |
| `StickyCTABar`       | `originalPrice`               | `minPrice`                          | Fake +15% để hiện badge discount                                           |
| `StickyCTABar`       | `discountPercent`             | ❌                                  | Hardcode `15` — fake discount cho UI                                       |
| `StickyCTABar`       | `currency`                    | ❌                                  | `"$"` — dùng USD symbol                                                    |
| `StickyCTABar`       | `priceUnit`                   | ❌                                  | `"person"`                                                                 |

### 3a. `readBefore.key` → `BookItemType` Lookup

| API `key`                                     | UI `type`        |
| --------------------------------------------- | ---------------- |
| `passport`, `id`, `health`, `bestFor`, `best` | `bestFor`        |
| `notRecommended`, `warning`, `avoid`          | `notRecommended` |
| `bring`, `pack`, `luggage`                    | `bring`          |
| `wear`, `clothing`, `dress`                   | `wear`           |
| `cultural`, `culture`, `etiquette`            | `cultural`       |
| _(mặc định)_                                  | `bestFor`        |

---

## 4. Các file thay đổi

### 4a. `src/api/product/types.ts` ✅ Done

Bổ sung vào `ApiProductDetail`:

- `banner: ApiBannerItem[]`
- `readBefore: ApiReadBeforeItem[]`
- `shortDescription: string | null`
- `reviewCount: number`
- `supplierName?: string | null`
- `itineraries: ApiItineraryItem[]`
- `tags: ApiTagItem[]`
- `tourGuides: ApiTourGuide[]`

Thêm sub-interfaces: `ApiBannerItem`, `ApiReadBeforeItem`, `ApiItineraryItem`, `ApiTagItem`, `ApiTourGuide`

### 4b. `src/modules/ProductPage/adapter.ts` 🆕 Cần tạo

Hàm thuần duy nhất `mapApiToProductPage(data: ApiProductDetail): MockProduct`.  
Không import react, không có side effects.

```typescript
// Skeleton
export const TEMP_PRODUCT_ID = '3dde9474-2f66-45d2-9951-320a4ae5dc68';
const TEMP_SUPPLIER_NAME = 'VietNam Village Vibes';

export function mapApiToProductPage(data: ApiProductDetail): MockProduct { ... }

// Helpers:
function parseListString(s: string | null): string[]  // split by ","
function getInitials(name: string, count = 2): string  // "VietNam Village Vibes" → "VV"
function parseHighlights(highlight: string | null): MockProduct['highlights']
function mapItinerary(items: ApiItineraryItem[]): MockProduct['itinerary']
function mapReadBefore(items: ApiReadBeforeItem[]): MockProduct['beforeYouBook']
function mapGuide(guide?: ApiTourGuide): MockProduct['guide']
function formatVnd(decimalStr: string): number  // parseFloat
function getBookItemType(key: string): BookItemType  // key → type lookup
```

### 4c. `src/modules/ProductPage/index.tsx` 🔄 Cần sửa

- Xóa `import { MOCK_PRODUCT }` và `const p = MOCK_PRODUCT`
- Thêm `useRouter()` → `const productId = (router.query.productId as string) ?? TEMP_PRODUCT_ID`
- Dùng `useProductById({ id: productId })`
- Transform: `const p = mapApiToProductPage(data)`
- Loading state: shimmer skeleton toàn trang
- Error state: message lỗi đơn giản + nút retry
- Ẩn `<OperatorBlock>` nếu không có data (hoặc render với fallback)
- Ẩn Free Cancellation badge (field không có trong API)

---

## 5. Loading & Error States

### Loading (skeleton)

```
┌─────────────────────────────┐
│  ░░░░░░░░░░░░░░░░░░░░░  ← Hero carousel shimmer (aspect 16/10)
├─────────────────────────────┤
│ ░░░░ ░░░░░░               │ ← tag pills
│ ░░░░░░░░░░░░░░░░░░         │ ← title
│ ░░░░░░░░░░░░░░░░░░░░░░░░░ │ ← description
└─────────────────────────────┘
```

- Dùng `animate-pulse` + `bg-gray-200` rounded blocks
- Hiển thị 3-4 skeleton blocks phía trên fold

### Error

```
┌─────────────────────────────┐
│  ⚠️  Không tải được tour   │
│  Vui lòng thử lại           │
│  [  Thử lại  ]              │
└─────────────────────────────┘
```

- Centered, full height, nút retry gọi `refetch()`

---

## 6. Giá — Format VND

`StickyCTABar` cần hỗ trợ format VND:

| Trước  | Sau                                  |
| ------ | ------------------------------------ |
| `$117` | `1.500.000 ₫`                        |
| `-15%` | Badge ẩn nếu `discountPercent === 0` |

Logic format trong adapter:

```typescript
// "1500000.00" → 1500000
const price = parseFloat(data.minPrice);
```

Hiển thị trong `StickyCTABar`:

```typescript
const symbol = currency === 'VND' ? '₫' : currency;
// render: "1.500.000 ₫ / người"
// Format: price.toLocaleString('vi-VN')
```

---

## 7. Navigation (Hardcode tạm)

**Hiện tại:** ProductPage tự lấy `TEMP_PRODUCT_ID` khi không có query.

**Tương lai (khi VideoDetailPage bổ sung productId):**

```typescript
// VideoDetailPage — khi click "More"
router.push({
  pathname: ROUTE.PRODUCT,
  query: { productId: video.productId },
});
```

Cần VideoDetailPage:

1. Nhận `productId` từ API video detail
2. Truyền vào query khi navigate

---

## 8. Phases

| Phase        | Nội dung                                          | Status         |
| ------------ | ------------------------------------------------- | -------------- |
| **Phase 1**  | UI với mock data — 13 sections hoàn chỉnh         | ✅ Done        |
| **Phase 2a** | Update types, tạo adapter                         | 🔄 In Progress |
| **Phase 2b** | ProductPage dùng real API, loading/error states   | ⏳ Pending     |
| **Phase 3**  | Video API trả `productId`, bỏ TEMP_PRODUCT_ID     | ⏳ Pending     |
| **Phase 4**  | Save/Share logic, booking flow, review pagination | ⏳ Pending     |

---

## 9. Open Items (chưa có trong API)

| Field                   | Workaround hiện tại              | Cần backend bổ sung                                                    |
| ----------------------- | -------------------------------- | ---------------------------------------------------------------------- |
| `freeCancellation`      | Ẩn badge                         | `freeCancellation: boolean`                                            |
| `quickFacts` chi tiết   | Fallback `"—"`                   | `departurePoint`, `pickupTime`, `groupSize`, `languages`, `difficulty` |
| `operator` object       | Fallback `supplierName` hardcode | Full operator object từ `/supplier/:id`                                |
| `highlights[]` đầy đủ   | Parse từ `highlight` string      | Array objects: `{icon, title, subtitle}`                               |
| `reviews[]`             | Empty state                      | Endpoint riêng `/product/:id/reviews`                                  |
| `discountPercent`       | `0` → ẩn badge                   | `originalPrice`, `salePrice`, `discountPercent`                        |
| `productId` trên IVideo | `TEMP_PRODUCT_ID` constant       | `productId` trong Video API response                                   |
