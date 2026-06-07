# Spec: GuideProfilePage — API Integration

> **Status**: Ready to implement  
> **Module**: `src/modules/GuideProfilePage`  
> **Last updated**: 2026-06-07

---

## 1. Overview

`GuideProfilePage` hiện dùng mock data tĩnh (`MOCK_GUIDE`). Spec này mô tả cách ghép API thật vào theo đúng convention của `src/api/` hiện có.

**Convention chuẩn trong codebase:**

- `types.ts` — Raw API interfaces (`Api*`) + Domain interfaces (`I*`) + Query params
- `requests.ts` — Async functions, có mapper private (`to*`), import từ `../axios`
- `queries.ts` — `createQuery` / `createInfiniteQuery` từ `react-query-kit`, import request functions
- `index.ts` — Re-export `queries` và `requests`

---

## 2. API Endpoint

### `GET /tour-guide/:id`

```
GET https://web-travel-be.fly.dev/tour-guide/{id}
Header: accept: application/json
Auth: Bearer token (via axios interceptor — tự động qua request instance)
```

### Response thực tế

```json
{
  "data": {
    "id": "6cc93f4c-2e9b-4bf9-96e5-5acc1369a09c",
    "createdAt": "2026-06-05T14:24:12.995Z",
    "updatedAt": "2026-06-05T14:24:12.995Z",
    "deletedAt": null,
    "name": "Nguyễn Văn A",
    "avatar": "https://example.com/avatar.jpg",
    "ratingCount": 123,
    "expYear": 5,
    "ratingValue": 4,
    "quote": "Mỗi ngọn núi ở Sapa có một câu chuyện. Tôi chỉ mượn lời để kể lại.",
    "coverImg": "https://www.example.img/cover_img.png",
    "summary": "Hướng dẫn viên · Hà Nội & vùng cao phía Bắc",
    "description": "Bố tôi là người Tày ở Lào Cai...",
    "languages": ["VI", "EN", "JP"],
    "experts": [
      "Trekking expert",
      "Food storyteller",
      "Family-friendly",
      "Photography support",
      "Premium private guide"
    ],
    "supplierReview": [
      {
        "id": "6cc93f4c-2e9b-4bf9-96e5-5acc1369a09c",
        "name": "Nguyễn Văn B",
        "point": 5,
        "content": "Hướng dẫn viên rất nhiệt tình",
        "tourName": "Tour Hà Nội - Sapa",
        "createdAt": "2024-01-01T00:00:00.000Z"
      }
    ],
    "userReview": {
      "ratings": [
        { "key": "storytelling", "name": "Storytelling", "value": 0 },
        { "key": "localKnowledge", "name": "Local knowledge", "value": 0 },
        { "key": "careAttention", "name": "Care & attention", "value": 0 },
        { "key": "safetyAwareness", "name": "Safety awareness", "value": 0 },
        { "key": "punctuality", "name": "Punctuality", "value": 0 },
        { "key": "english", "name": "English", "value": 0 },
        { "key": "funny", "name": "Hài hước & vui vẻ", "value": 4.71 }
      ],
      "reviewCount": 0,
      "reviewValue": 0
    },
    "careerPath": [
      {
        "role": "Lead guide",
        "company": "VVV — Vietnam Village Vibes",
        "startYear": 2023,
        "tourCount": 184,
        "description": "trekking and craft villages"
      }
    ]
  },
  "code": 200,
  "message": "get tour guide successfully",
  "error": null
}
```

---

## 3. Field Mapping: API → `GuideProfileData`

| `GuideProfileData` field        | API field                     | Ghi chú                                      |
| ------------------------------- | ----------------------------- | -------------------------------------------- |
| `id`                            | `data.id`                     | trực tiếp                                    |
| `cardId`                        | ❌ không có                   | fallback: `ID-${id.slice(-4).toUpperCase()}` |
| `name`                          | `data.name`                   | trực tiếp                                    |
| `title`                         | `data.summary`                | rename                                       |
| `slogan`                        | `data.quote`                  | rename, wrap trong `"..."`                   |
| `coverUrl`                      | `data.coverImg`               | rename                                       |
| `avatarUrl`                     | `data.avatar`                 | rename                                       |
| `bio`                           | `data.description`            | rename                                       |
| `metrics.toursLed`              | `data.ratingCount`            | ⚠️ tạm dùng, pending BE                      |
| `metrics.yearsOfExperience`     | `data.expYear`                | trực tiếp                                    |
| `metrics.languages`             | `data.languages`              | trực tiếp                                    |
| `specialties[].label`           | `data.experts[]` (string[])   | map màu client-side (§4.2)                   |
| `operatorReviews[]`             | `data.supplierReview[]`       | transform (§4.3)                             |
| `guestFeedback.totalReviews`    | `data.userReview.reviewCount` | rename                                       |
| `guestFeedback.averageRating`   | `data.userReview.reviewValue` | rename                                       |
| `guestFeedback.criteria[]`      | `data.userReview.ratings[]`   | `name→label`, `value→score`                  |
| `guestFeedback.featuredReviews` | ❌ không có                   | để `[]`                                      |
| `careerTimeline[]`              | `data.careerPath[]`           | transform (§4.4)                             |
| `dispatches`                    | ❌ không có                   | để `[]`                                      |
| `moments`                       | ❌ không có                   | để `[]`                                      |
| `destinations`                  | ❌ không có                   | để `[]`                                      |

---

## 4. Transform Logic

### 4.1 Specialty color mapping

API trả `experts: string[]`, frontend map màu theo index qua preset cố định.  
Dùng `style` prop (hex) thay vì dynamic Tailwind class để tránh bị purge.

```typescript
// constant — đặt trong requests.ts (private, không export)
const SPECIALTY_PALETTE = [
  { bg: '#EEEDFE', text: '#3C3489' },
  { bg: '#FAECE7', text: '#712B13' },
  { bg: '#E1F5EE', text: '#085041' },
  { bg: '#FAEEDA', text: '#633806' },
  { bg: '#FBEAF0', text: '#72243E' },
] as const;
```

> `GuideProfileData.specialties[].bg` và `.text` sẽ lưu **hex color string**  
> Component `specialty-tags.tsx` cần dùng `style={{ backgroundColor: s.bg, color: s.text }}`

### 4.2 supplierReview → operatorReviews

```
name        →  companyName
point       →  rating
content     →  comment
createdAt   →  date  (format: "Tháng M/YYYY")
```

### 4.3 careerPath → careerTimeline

```
company     →  companyName
startYear   →  period  ("startYear – nay" nếu index=0, "startYear" nếu không)
tourCount + description  →  description  ("184 tours · trekking and craft villages")
(index)     →  id       ("career-0", "career-1", ...)
(index===0) →  isCurrent (boolean)
```

> ⚠️ `careerPath` thiếu `endYear` — period của item không phải current sẽ chỉ có năm bắt đầu

---

## 5. Types — `src/api/tour-guide/types.ts` _(NEW)_

> **Convention**: File hiện tại của `tour-guide` đang import `ApiTourGuide` và `ApiTourGuideListResponse` từ `../product/types`. Sau khi tạo file `types.ts` riêng, sẽ move 2 type đó sang đây và cập nhật import.

```typescript
import type { IProductPagination } from '../product/types';

// ── Raw API sub-types ─────────────────────────────────────────────────────

export interface ApiTourGuideSupplierReview {
  id: string;
  name: string;
  createdAt: string;
  content: string;
  point: number;
  tourName: string;
}

export interface ApiTourGuideUserRating {
  key: string;
  name: string;
  value: number;
}

export interface ApiTourGuideUserReview {
  ratings: ApiTourGuideUserRating[];
  reviewCount: number;
  reviewValue: number;
}

export interface ApiTourGuideCareerPath {
  company: string;
  role: string;
  startYear: number;
  tourCount: number;
  description: string;
}

// ── Raw API response — GET /tour-guide/:id ────────────────────────────────

export interface ApiTourGuideDetail {
  id: string;
  createdAt: string;
  updatedAt: string;
  deletedAt: string | null;
  name: string;
  avatar: string | null;
  ratingCount: number;
  expYear: number;
  ratingValue: number;
  quote: string | null;
  coverImg: string | null;
  summary: string | null;
  description: string | null;
  languages: string[];
  experts: string[];
  supplierReview: ApiTourGuideSupplierReview[] | null;
  userReview: ApiTourGuideUserReview;
  careerPath: ApiTourGuideCareerPath[];
}

export interface ApiTourGuideDetailResponse {
  data: ApiTourGuideDetail;
  code: number;
  message: string;
  error: string | null;
}

// ── Raw API response — GET /tour-guide (list) ─────────────────────────────
// (move từ ../product/types)

// ⚠️ Confirmed từ real curl GET /tour-guide:
// - List chỉ trả 7 fields (id, createdAt, name, avatar, ratingCount, expYear, ratingValue)
// - KHÔNG có updatedAt, deletedAt trong list response
// - Field là ratingValue KHÔNG phải ratingStar
export interface ApiTourGuide {
  id: string;
  createdAt: string;
  name: string;
  avatar: string | null; // có thể null
  ratingCount: number;
  expYear: number;
  ratingValue: number; // ⚠️ ratingValue, không phải ratingStar
}

export interface ApiTourGuideListResponse {
  data: {
    items: ApiTourGuide[];
    pagination: IProductPagination;
  };
  code: number;
  error: string | null;
  message: string;
}

// ── Domain model — sau khi map (dùng trong hook) ──────────────────────────

export interface ITourGuideProfile {
  id: string;
  cardId: string;
  name: string;
  title: string;
  slogan: string;
  coverUrl: string | undefined;
  avatarUrl: string | undefined;
  bio: string;
  metrics: {
    toursLed: number;
    yearsOfExperience: number;
    languages: string[];
  };
  specialties: Array<{ label: string; bg: string; text: string }>;
  operatorReviews: Array<{
    id: string;
    companyName: string;
    tourName: string;
    date: string;
    rating: number;
    comment: string;
  }>;
  guestFeedback: {
    totalReviews: number;
    averageRating: number;
    criteria: Array<{ label: string; score: number }>;
    featuredReviews: Array<{
      id: string;
      author: string;
      country: string;
      tourName: string;
      date: string;
      content: string;
    }>;
  };
  careerTimeline: Array<{
    id: string;
    companyName: string;
    role: string;
    period: string;
    description: string;
    isCurrent: boolean;
  }>;
  dispatches: unknown[];
  moments: unknown[];
  destinations: unknown[];
}
```

---

## 6. Requests — `src/api/tour-guide/requests.ts` _(MODIFY)_

> **Convention** (theo `video/requests.ts`):
>
> - Mapper function đặt ở đầu file, comment `// ---------- Mapper ----------`
> - Hàm request là `async function` hoặc `const fn = async () =>`
> - Import từ `'../axios'`
> - Không export mapper

```typescript
import { request } from '../axios';
import type { ApiTourGuide, ApiTourGuideDetailResponse, ApiTourGuideListResponse } from './types';
import type { ITourGuideProfile } from './types';

// ---------- Constants ----------

const SPECIALTY_PALETTE = [
  { bg: '#EEEDFE', text: '#3C3489' },
  { bg: '#FAECE7', text: '#712B13' },
  { bg: '#E1F5EE', text: '#085041' },
  { bg: '#FAEEDA', text: '#633806' },
  { bg: '#FBEAF0', text: '#72243E' },
] as const;

// ---------- Helpers ----------

function formatViDate(iso: string): string {
  const d = new Date(iso);
  return `Tháng ${d.getMonth() + 1}/${d.getFullYear()}`;
}

// ---------- Mapper ----------

const toTourGuideProfile = (api: ApiTourGuideDetail): ITourGuideProfile => ({
  id: api.id,
  cardId: `ID-${api.id.slice(-4).toUpperCase()}`,
  name: api.name,
  title: api.summary ?? '',
  slogan: api.quote ? `"${api.quote}"` : '',
  coverUrl: api.coverImg ?? undefined,
  avatarUrl: api.avatar ?? undefined,
  bio: api.description ?? '',
  metrics: {
    toursLed: api.ratingCount,
    yearsOfExperience: api.expYear,
    languages: api.languages ?? [],
  },
  specialties: (api.experts ?? []).map((label, i) => ({
    label,
    bg: SPECIALTY_PALETTE[i % SPECIALTY_PALETTE.length].bg,
    text: SPECIALTY_PALETTE[i % SPECIALTY_PALETTE.length].text,
  })),
  operatorReviews: (api.supplierReview ?? []).map((r) => ({
    id: r.id,
    companyName: r.name,
    tourName: r.tourName,
    date: formatViDate(r.createdAt),
    rating: r.point,
    comment: r.content,
  })),
  guestFeedback: {
    totalReviews: api.userReview.reviewCount,
    averageRating: api.userReview.reviewValue,
    criteria: api.userReview.ratings.map((r) => ({
      label: r.name,
      score: r.value,
    })),
    featuredReviews: [],
  },
  careerTimeline: (api.careerPath ?? []).map((item, index) => ({
    id: `career-${index}`,
    companyName: item.company,
    role: item.role,
    period: index === 0 ? `${item.startYear} – nay` : `${item.startYear}`,
    description: `${item.tourCount} tours · ${item.description}`,
    isCurrent: index === 0,
  })),
  dispatches: [],
  moments: [],
  destinations: [],
});

// ---------- Requests ----------

// Giữ nguyên hàm list đã có:
export interface TourGuidePage {
  items: { id: string; name: string }[];
  nextPage: number | undefined;
}

export async function getTourGuidePage(page: number): Promise<TourGuidePage> {
  const { data } = await request.get<ApiTourGuideListResponse>('/tour-guide', {
    params: { page, pageSize: 49 },
  });
  const { items, pagination } = data.data;
  return {
    items: items.map((x: ApiTourGuide) => ({ id: x.id, name: x.name })),
    nextPage: pagination.page < pagination.totalPages ? pagination.page + 1 : undefined,
  };
}

// Mới: detail by id
export async function getTourGuideById(id: string): Promise<ITourGuideProfile> {
  const { data } = await request.get<ApiTourGuideDetailResponse>(`/tour-guide/${id}`);
  return toTourGuideProfile(data.data);
}
```

---

## 7. Queries — `src/api/tour-guide/queries.ts` _(MODIFY)_

> **Convention** (theo `product/queries.ts` và `video/queries.ts`):
>
> - Import `createQuery` / `createInfiniteQuery` từ `'react-query-kit'`
> - `primaryKey` theo pattern `'/tour-guide'`, `'/tour-guide/detail'`
> - `queryFn` destructure `queryKey` để lấy variables

```typescript
import { createInfiniteQuery, createQuery } from 'react-query-kit';

import { getTourGuideById, getTourGuidePage } from './requests';
import type { ITourGuideProfile, TourGuidePage } from './types';

// Giữ nguyên query list đã có:
export const useTourGuideListInfinite = createInfiniteQuery<TourGuidePage, void, Error, number>({
  primaryKey: '/tour-guide',
  queryFn: ({ pageParam = 1 }) => getTourGuidePage(pageParam as number),
  getNextPageParam: (lastPage) => lastPage.nextPage,
  staleTime: 5 * 60 * 1000,
});

// Mới: detail query
export const useTourGuideById = createQuery<ITourGuideProfile, { id: string }>({
  primaryKey: '/tour-guide/detail',
  queryFn: ({ queryKey: [, { id }] }) => getTourGuideById(id),
  staleTime: 5 * 60 * 1000,
});
```

---

## 8. Hook Migration — `src/hooks/use-guide-profile.ts` _(MODIFY)_

```typescript
// TRƯỚC (mock):
import { useEffect, useState } from 'react';
import type { GuideProfileData } from '@/modules/GuideProfilePage/data/mock-guide';
import { MOCK_GUIDE } from '@/modules/GuideProfilePage/data/mock-guide';

export function useGuideProfile(_id: string | undefined) {
  const [isLoading, setIsLoading] = useState(true);
  const [data, setData] = useState<GuideProfileData | null>(null);
  useEffect(() => {
    const timer = setTimeout(() => {
      setData(MOCK_GUIDE);
      setIsLoading(false);
    }, 800);
    return () => clearTimeout(timer);
  }, []);
  return { data, isLoading };
}

// SAU (real API):
import { useTourGuideById } from '@/api/tour-guide/queries';
import type { ITourGuideProfile } from '@/api/tour-guide/types';

export function useGuideProfile(id: string | undefined) {
  const { data, isLoading, error } = useTourGuideById({
    variables: { id: id! },
    enabled: !!id,
  });

  return {
    data: data ?? null,
    isLoading,
    error,
  };
}
```

> **Lưu ý**: `GuideProfileData` trong `mock-guide.ts` và `ITourGuideProfile` có cùng shape.  
> Cần check và align 2 type này để components không cần đổi.

---

## 9. Component Change — `specialty-tags.tsx` _(MODIFY)_

```tsx
// TRƯỚC: dùng dynamic Tailwind class (bị purge trong prod build)
<span className={`text-[12px] px-[11px] py-1.5 rounded-full ${s.bg} ${s.text}`}>
  {s.label}
</span>

// SAU: dùng style prop với hex color
<span
  className="text-[12px] px-[11px] py-1.5 rounded-full"
  style={{ backgroundColor: s.bg, color: s.text }}
>
  {s.label}
</span>
```

---

## 10. Files cần thay đổi

```
src/api/tour-guide/
├── types.ts          [NEW]      — ApiTourGuideDetail, ITourGuideProfile + sub-types
│                                  (move ApiTourGuide, ApiTourGuideListResponse từ ../product/types)
├── requests.ts       [MODIFY]   — thêm getTourGuideById, toTourGuideProfile mapper
├── queries.ts        [MODIFY]   — thêm useTourGuideById
└── index.ts          [NO CHANGE] — đã re-export * từ queries và requests

src/hooks/
└── use-guide-profile.ts          [MODIFY] — dùng useTourGuideById thay mock

src/modules/GuideProfilePage/
└── components/
    └── specialty-tags.tsx        [MODIFY] — style prop thay dynamic Tailwind class

src/api/product/types.ts          [MODIFY] — xóa ApiTourGuide, ApiTourGuideListResponse
                                             (sau khi move sang tour-guide/types.ts)
```

---

## 11. Open Questions / Pending BE

| #   | Vấn đề                                                              | Status           |
| --- | ------------------------------------------------------------------- | ---------------- |
| 1   | `ratingCount` có phải số tour đã dẫn (`toursLed`)? Cần field riêng? | ⏳ Pending BE    |
| 2   | `careerPath` thiếu `endYear` — period hiện chỉ có năm bắt đầu       | ⏳ Pending BE    |
| 3   | `cardId` không có — dùng fallback `ID-{id.slice(-4)}`               | ✅ Tạm chấp nhận |
| 4   | `featuredReviews` (guest) chưa có endpoint                          | ⏳ Pending BE    |
| 5   | `moments` (video clips) chưa có endpoint                            | ⏳ Pending BE    |
| 6   | `destinations` chart chưa có endpoint                               | ⏳ Pending BE    |
| 7   | `dispatches` (lệnh điều tour) chưa có endpoint                      | ⏳ Pending BE    |
