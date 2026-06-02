# Admin Product Form Schema Research

## 1. Schema Definition (product.ts)

### productSchema (Zod)

| Field          | Type                   | Validation                       | Default  |
| -------------- | ---------------------- | -------------------------------- | -------- |
| name           | string                 | min(1), max(500)                 | required |
| slug           | string                 | min(1)                           | required |
| description    | string                 | optional, nullable               | null     |
| destinationId  | uuid                   | optional, nullable               | null     |
| supplierId     | uuid                   | optional, nullable               | null     |
| duration       | number (int)           | min(1)                           | 1        |
| durationType   | string                 | —                                | 'day'    |
| highlight      | string                 | optional, nullable               | null     |
| include        | string                 | optional, nullable               | null     |
| exclude        | string                 | optional, nullable               | null     |
| minPrice       | number                 | min(0)                           | 0        |
| status         | enum                   | ['draft', 'published', 'hidden'] | 'draft'  |
| thumbnail      | string                 | optional, nullable               | null     |
| itineraryImage | string                 | optional, nullable               | null     |
| images         | array of {url: string} | optional, nullable               | []       |
| videoId        | string                 | optional, nullable               | null     |

### optionSchema (Zod)

| Field       | Type         | Validation         | Default  |
| ----------- | ------------ | ------------------ | -------- |
| id          | uuid         | optional           | —        |
| title       | string       | min(1)             | required |
| description | string       | optional, nullable | null     |
| adultPrice  | number       | min(0)             | 0        |
| childPrice  | number       | min(0)             | 0        |
| infantPrice | number       | min(0)             | 0        |
| currency    | string       | —                  | 'VND'    |
| order       | number (int) | min(0)             | 0        |

### itinerarySchema (Zod)

| Field        | Type         | Validation         | Default  |
| ------------ | ------------ | ------------------ | -------- |
| id           | uuid         | optional           | —        |
| name         | string       | min(1)             | required |
| featuredName | string       | optional, nullable | null     |
| order        | number (int) | min(1)             | 1        |
| description  | string       | optional, nullable | null     |

---

## 2. Form Hook (use-product-form.ts)

**No useFieldArray** — arrays (itineraries, options) managed as simple state via useState.

### Default Values

```ts
const DEFAULT_VALUES: ProductFormValues = {
  name: '',
  slug: '',
  description: '',
  destinationId: null,
  supplierId: null,
  duration: 1,
  durationType: 'day',
  highlight: '',
  include: '',
  exclude: '',
  minPrice: 0,
  status: 'draft',
  thumbnail: '',
  itineraryImage: '',
  images: [],
  videoId: null,
};
```

### State Management

- `form` — react-hook-form with zodResolver
- `itineraries` — useState (not useFieldArray)
- `options` — useState (not useFieldArray)
- `draft` — useProductDraft() for autosave

---

## 3. ProductFormPage Layout & Scroll-Spy Nav

### Sections in NAV_SECTIONS (4 visible, 1 hidden)

```ts
[
  { id: 'section-overview', label: 'Tổng quan' }, // BasicInfoSection
  { id: 'section-images', label: 'Hình ảnh' }, // ImagesSection
  { id: 'section-itinerary', label: 'Lịch trình' }, // TimeItinerarySection
  // { id: 'section-pricing', label: 'Gói giá' },      // HIDDEN: Frontend chưa dùng
  { id: 'section-details', label: 'Chi tiết' }, // DetailsSection
];
```

**Scroll-spy nav:** Sticky sidebar (lg+ only), tracks activeSection via useScrollSpy hook.

---

## 4. BasicInfoSection Fields (Currently Rendered)

### Row 1

- `name` — text input, auto-generates slug (non-edit mode)
- destinationId — **HIDDEN** (TẠM ẨN do Frontend chưa dùng)

### Row 2

- `supplierId` — select dropdown (suppliers from API)
- `slug` — text input (read-only styled)

### Row 3

- `minPrice` — number input
- `videoId` — searchable video dropdown with badge display

### Row 4

- `duration` — number input
- `durationType` — select dropdown (day/night/hour)

### Row 5

- `description` — TinyMCE rich text editor (280px height)

---

## Key Findings

1. **No useFieldArray** — options & itineraries are lifted to parent as plain useState
2. **destinationId hidden** — commented out with "TẠM ẨN do Frontend chưa dùng"
3. **Pricing section hidden** — OptionsSection not rendered (commented in index.tsx)
4. **Auto-slug generation** — slug auto-generates from name on type (non-edit mode only)
5. **Video search** — custom debounce + API integration, not library-based
6. **richtext editor** — TinyMCE (not markdown)
7. **Draft system** — useProductDraft hook persists form state locally
