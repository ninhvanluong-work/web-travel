# Spec: Admin Tour Guide — List & Form Pages

> **Status**: ✅ All endpoints confirmed — Ready to implement  
> **Module**: `src/modules/AdminTourGuide` _(NEW)_  
> **Tham khảo**: `src/modules/AdminProduct`  
> **Last updated**: 2026-06-07

---

## 1. Overview

Tạo module admin để quản lý hướng dẫn viên (tour guide), gồm 2 trang:

- **`GuideListPage`** — danh sách, tìm kiếm, filter, delete
- **`GuideFormPage`** — tạo mới / chỉnh sửa thông tin guide

Thiết kế bám theo pattern của `AdminProduct` (ProductListPage + ProductFormPage).

---

## 2. Cấu trúc thư mục

```
src/modules/AdminTourGuide/
├── index.ts                          ← re-export 2 pages
├── GuideListPage/
│   ├── index.tsx                     ← page chính
│   ├── hooks/
│   │   └── use-guide-list-actions.ts ← delete, status actions
│   └── components/
│       ├── GuideTable.tsx
│       ├── GuideTableRow.tsx
│       └── DeleteConfirmDialog.tsx
└── GuideFormPage/
    ├── index.tsx                     ← page chính (create/edit)
    ├── hooks/
    │   └── use-guide-form.ts         ← react-hook-form + mutations
    └── components/
        ├── guide-form-header.tsx     ← header với Save/Delete actions
        └── sections/
            ├── basic-info-section.tsx     ← Ảnh, tên, summary, quote
            ├── bio-section.tsx            ← description (textarea)
            ├── metrics-section.tsx        ← languages, expYear
            ├── experts-section.tsx        ← tags chuyên môn
            └── career-section.tsx         ← career path timeline editor
```

---

## 3. API Endpoints

### 3.1 List — `GET /tour-guide`

Đã có (dùng cho dropdown trong `AdminProduct`).

```
GET /tour-guide?page=1&pageSize=10&keyword=...
```

**Response**: `ApiTourGuideListResponse` (xem `tour-guide/types.ts`)

### 3.2 Detail — `GET /tour-guide/:id` ✅ Dùng lại có sẵn

> **Tái sử dụng hoàn toàn** `useTourGuideById` + `getTourGuideById` từ spec [guide-profile-api-integration.md](./guide-profile-api-integration.md).
>
> Hook trả về `ITourGuideProfile` (đã được transform từ raw API).
>
> `use-guide-form.ts` dùng `useTourGuideById` và map `ITourGuideProfile` → `TourGuideFormValues` khi edit.

### 3.3 Create — `POST /tour-guide` ✅ Confirmed

```
POST /tour-guide
Content-Type: application/json
Auth: Bearer token
```

**Request body** (confirmed từ Swagger):

```json
{
  "name": "Nguyễn Văn A",
  "avatar": "https://example.com/avatar.jpg",
  "expYear": 5,
  "quote": "My responsibility is serve everybody",
  "coverImg": "https://www.example.img/cover_img.png",
  "summary": "I have 5+ years experience of tour guide",
  "description": "tour guide description",
  "languages": ["VI", "EN", "JP"],
  "experts": ["Cultural tours", "Trekking", "Food tours"],
  "careerPath": [
    {
      "company": "VVV — Vietnam Village Vibes",
      "role": "Lead guide",
      "startYear": 2023,
      "tourCount": 184,
      "description": "trekking and craft villages"
    }
  ]
}
```

**Response** (real output — confirmed bằng curl thực tế):

```json
{
  "data": {
    "id": "1ee552a9-6d9f-463b-a641-de4aa78162de",
    "createdAt": "2026-06-07T02:59:06.630Z",
    "updatedAt": "2026-06-07T02:59:06.630Z",
    "deletedAt": null,
    "name": "Nguyễn Văn C",
    "avatar": "https://example.com/avatar.jpg",
    "ratingCount": 0,
    "expYear": 5,
    "ratingValue": 0,
    "quote": "My responsibility is serve everybody",
    "coverImg": "https://www.example.img/cover_img.png",
    "summary": "I have 5+ years experience of tour guide",
    "description": "tour guide description",
    "languages": ["VI", "EN", "JP"],
    "experts": ["Cultural tours", "Trekking", "Food tours"],
    "supplierReview": null,
    "userReview": {
      "ratings": [
        { "key": "storytelling", "name": "Storytelling", "value": 0 },
        { "key": "localKnowledge", "name": "Local knowledge", "value": 0 },
        { "key": "careAttention", "name": "Care & attention", "value": 0 },
        { "key": "safetyAwareness", "name": "Safety awareness", "value": 0 },
        { "key": "punctuality", "name": "Punctuality", "value": 0 },
        { "key": "english", "name": "English", "value": 0 },
        { "key": "funny", "name": "funny", "value": 0 }
      ],
      "reviewCount": 0,
      "reviewValue": 0
    },
    "careerPath": [
      {
        "company": "VVV — Vietnam Village Vibes",
        "role": "Lead guide",
        "startYear": 2023,
        "tourCount": 184,
        "description": "trekking and craft villages"
      }
    ]
  },
  "code": 200,
  "message": "created tour guide successfully",
  "error": null
}
```

> ✅ **`careerPath` là array** — Swagger example trước đó sai (placeholder).
>
> ⚠️ **`supplierReview`** có thể là `null` (guide mới chưa có review) — cần dùng `null` thay vì `[]`.
>
> ⚠️ **`userReview` field order**: `ratings` trước, rồi `reviewCount`, `reviewValue`.

### 3.4 Update — `PUT /tour-guide/:id` ✅ Confirmed (real curl)

Same request body as POST.

**Response** — identical structure với POST response:

```json
{
  "data": {
    "id": "1ee552a9-6d9f-463b-a641-de4aa78162de",
    "createdAt": "2026-06-07T02:59:06.630Z",
    "updatedAt": "2026-06-07T03:09:00.595Z",
    "deletedAt": null,
    "name": "Nguyễn Văn A",
    "ratingCount": 0,
    "expYear": 5,
    "ratingValue": 0,
    "supplierReview": null,
    "userReview": { "ratings": [...], "reviewCount": 0, "reviewValue": 0 },
    "careerPath": [{ "company": "...", "role": "...", "startYear": 2023, "tourCount": 184, "description": "..." }]
  },
  "code": 200,
  "message": "updated tour guide successfully",
  "error": null
}
```

> ✅ `careerPath` là **array** trong cả POST lẫn PUT response — 100% consistent.
> ✅ `supplierReview` là `null` khi chưa có review.
> ✅ `updatedAt` được cập nhật, `createdAt` giữ nguyên.

### 3.5 Delete — `DELETE /tour-guide/:id` ✅ Confirmed (real curl)

```
DELETE /tour-guide/:id
Header: accept: application/json
```

**Response** (confirmed bằng curl thực tế):

```json
{
  "data": null,
  "code": 200,
  "message": "deleted tour guide successfully",
  "error": null
}
```

> ✅ `data: null` — không trả về object.  
> ✅ HTTP 200 (không phải 204).

---

## 4. TypeScript Types

### Thêm vào `src/api/tour-guide/types.ts`

```typescript
// ── Admin list domain model ────────────────────────────────────────────────
// Confirmed từ real curl GET /tour-guide?page=1&pageSize=10

// Raw API list item
export interface ApiTourGuideListItem {
  id: string;
  createdAt: string;
  name: string;
  avatar: string | null; // có thể null
  ratingCount: number;
  expYear: number;
  ratingValue: number; // ⚠️ là ratingValue, KHÔNG phải ratingStar
}

// Domain model sau khi map
export interface ITourGuide {
  id: string;
  createdAt: string;
  name: string;
  avatar: string | null;
  ratingCount: number;
  expYear: number;
  ratingValue: number;
}

export interface ITourGuidePagination {
  page: number;
  pageSize: number;
  total: number;
  totalPages: number;
}

export interface ITourGuideListResult {
  items: ITourGuide[];
  pagination: ITourGuidePagination;
}

// ── List query params ────────────────────────────────────────────────
// Confirmed từ Swagger: có 3 params — keyword, page, pageSize

export interface ITourGuideListParams {
  keyword?: string; // ✅ supported (confirmed Swagger)
  page?: number;
  pageSize?: number;
}

// ── Form payload (POST / PUT) ─────────────────────────────────────────────
// Field order matches real curl output

export interface TourGuideFormPayload {
  name: string;
  avatar?: string; // URL sau khi upload
  expYear: number;
  quote?: string;
  coverImg?: string; // URL sau khi upload
  summary?: string;
  description?: string;
  languages: string[]; // e.g. ["VI", "EN", "JP"]
  experts: string[]; // e.g. ["Cultural tours", "Trekking"]
  careerPath: Array<{
    company: string; // company trước role (theo Swagger request body)
    role: string;
    startYear: number;
    tourCount: number;
    description: string;
  }>;
}

// ── API response (POST/GET đều dùng chung) ─────────────────────────────────
// careerPath là ARRAY trong cả request lẫn response (Swagger example trước đó sai)
// supplierReview có thể null (guide mới chưa có review)
// userReview.ratings đều trước reviewCount / reviewValue
```

---

## 5. Requests — thêm vào `src/api/tour-guide/requests.ts`

> Theo convention: mapper private (`toTourGuide`), async function export

```typescript
// ---------- Mapper (list item) ----------

const toTourGuide = (item: ApiTourGuideListItem): ITourGuide => ({
  id: item.id,
  name: item.name,
  avatar: item.avatar,
  ratingCount: item.ratingCount,
  expYear: item.expYear,
  ratingValue: item.ratingValue, // ⚠️ ratingValue, KHÔNG ratingStar
  createdAt: item.createdAt,
});

// ---------- Requests ----------

export async function getTourGuideList(params: ITourGuideListParams): Promise<ITourGuideListResult> {
  const cleanParams = Object.fromEntries(
    Object.entries(params).filter(([, v]) => v !== '' && v !== undefined && v !== null)
  );
  const { data } = await request.get<ApiTourGuideListResponse>('/tour-guide', { params: cleanParams });
  return {
    items: data.data.items.map(toTourGuide),
    pagination: data.data.pagination,
  };
}

export async function createTourGuide(payload: TourGuideFormPayload): Promise<ApiTourGuideDetail> {
  const { data } = await request.post<ApiTourGuideDetailResponse>('/tour-guide', payload);
  return data.data;
}

export async function updateTourGuide(id: string, payload: TourGuideFormPayload): Promise<ApiTourGuideDetail> {
  const { data } = await request.put<ApiTourGuideDetailResponse>(`/tour-guide/${id}`, payload);
  return data.data;
}

export async function deleteTourGuide(id: string): Promise<void> {
  await request.delete(`/tour-guide/${id}`);
}
```

---

## 6. Queries — thêm vào `src/api/tour-guide/queries.ts`

> Theo convention: `createQuery` / `createMutation` từ `react-query-kit`

```typescript
import { createMutation, createQuery } from 'react-query-kit';

export const useTourGuideList = createQuery<ITourGuideListResult, ITourGuideListParams>({
  primaryKey: '/tour-guide/list',
  queryFn: ({ queryKey: [, variables] }) => getTourGuideList(variables ?? {}),
  staleTime: 2 * 60 * 1000,
});

export const useCreateTourGuide = createMutation<ApiTourGuideDetail, TourGuideFormPayload>({
  mutationFn: (payload) => createTourGuide(payload),
});

export const useUpdateTourGuide = createMutation<ApiTourGuideDetail, { id: string; payload: TourGuideFormPayload }>({
  mutationFn: ({ id, payload }) => updateTourGuide(id, payload),
});

export const useDeleteTourGuide = createMutation<void, { id: string }>({
  mutationFn: ({ id }) => deleteTourGuide(id),
});
```

---

## 7. Form Validation Schema

### File: `src/lib/validations/tour-guide.ts` _(NEW)_

> Pattern theo `src/lib/validations/product.ts` (dùng zod)

```typescript
import { z } from 'zod';

export const careerPathSchema = z.object({
  role: z.string().min(1, 'Nhập chức danh'),
  company: z.string().min(1, 'Nhập tên công ty'),
  startYear: z.coerce.number().min(1990).max(new Date().getFullYear()),
  tourCount: z.coerce.number().min(0),
  description: z.string().optional().default(''),
});

export const tourGuideSchema = z.object({
  name: z.string().min(1, 'Tên không được để trống'),
  avatar: z.string().optional().nullable(),
  coverImg: z.string().optional().nullable(),
  quote: z.string().optional().nullable(),
  summary: z.string().optional().nullable(),
  description: z.string().optional().nullable(),
  expYear: z.coerce.number().min(0).max(50),
  languages: z.array(z.string()).min(1, 'Chọn ít nhất 1 ngôn ngữ'),
  experts: z.array(z.string()),
  careerPath: z.array(careerPathSchema),
});

export type TourGuideFormValues = z.infer<typeof tourGuideSchema>;
```

---

## 8. Hook: `use-guide-form.ts`

### File: `src/modules/AdminTourGuide/GuideFormPage/hooks/use-guide-form.ts`

> Pattern theo `src/hooks/use-product-form.ts`

```typescript
import { zodResolver } from '@hookform/resolvers/zod';
import { useQueryClient } from '@tanstack/react-query';
import { useRouter } from 'next/router';
import { useEffect } from 'react';
import { useForm } from 'react-hook-form';

import { useCreateTourGuide, useTourGuideById, useUpdateTourGuide } from '@/api/tour-guide/queries';
import { tourGuideSchema, type TourGuideFormValues } from '@/lib/validations/tour-guide';
import { useAlertStore } from '@/stores/use-alert-store';
import { ROUTE } from '@/types/routes';

const DEFAULT_VALUES: TourGuideFormValues = {
  name: '',
  avatar: null,
  coverImg: null,
  quote: null,
  summary: null,
  description: null,
  expYear: 0,
  languages: [],
  experts: [],
  careerPath: [],
};

export function useGuideForm(guideId?: string) {
  const router = useRouter();
  const queryClient = useQueryClient();
  const isEdit = !!guideId;
  const { addAlert } = useAlertStore.getState();

  const invalidate = () => {
    queryClient.removeQueries({ queryKey: ['/tour-guide/list'] });
    queryClient.removeQueries({ queryKey: ['/tour-guide/detail'] });
  };

  const { data: guideData } = useTourGuideById({
    variables: { id: guideId! },
    enabled: isEdit,
  });

  const form = useForm<TourGuideFormValues>({
    resolver: zodResolver(tourGuideSchema),
    defaultValues: DEFAULT_VALUES,
  });

  // Populate form khi edit
  // guideData là ITourGuideProfile (transform từ API bửi useTourGuideById)
  useEffect(() => {
    if (!guideData) return;
    form.reset({
      name: guideData.name,
      avatar: guideData.avatarUrl ?? null,
      coverImg: guideData.coverUrl ?? null,
      // slogan đã được wrap "..." trong mapper, cần unwrap lại
      quote: guideData.slogan?.replace(/^“|”$/g, '').replace(/^"|"$/g, '') ?? null,
      summary: guideData.title ?? null,
      description: guideData.bio ?? null,
      expYear: guideData.metrics.yearsOfExperience,
      languages: guideData.metrics.languages,
      experts: guideData.specialties.map((s) => s.label),
      // careerPath: ITourGuideProfile.careerTimeline đã transform:
      //   - companyName = company
      //   - period = "2023 – nay" hoặc "2023" → cần parse lại startYear
      //   - description = "184 tours · trekking..." → cần parse lại tourCount + mô tả
      careerPath: guideData.careerTimeline.map((c) => {
        // Parse tourCount từ description: "184 tours · trekking and craft villages"
        const tourCountMatch = c.description.match(/^(\d+)\s*tours?\s*·\s*(.+)/);
        const tourCount = tourCountMatch ? parseInt(tourCountMatch[1]) : 0;
        const desc = tourCountMatch ? tourCountMatch[2].trim() : c.description;

        // Parse startYear từ period: "2023 – nay" hoặc "2023"
        const startYear = parseInt(c.period.split(/[–-]/)[0].trim()) || new Date().getFullYear();

        return {
          company: c.companyName,
          role: c.role,
          startYear,
          tourCount,
          description: desc,
        };
      }),
    });
  }, [guideData, form]);

  const createMutation = useCreateTourGuide({
    onSuccess: () => {
      invalidate();
      addAlert({ type: 'success', title: 'Tạo hướng dẫn viên thành công' });
      router.push(ROUTE.ADMIN_GUIDES);
    },
    onError: (err: any) => {
      addAlert({ type: 'error', title: err?.message ?? 'Có lỗi xảy ra' });
    },
  });

  const updateMutation = useUpdateTourGuide({
    onError: (err: any) => {
      addAlert({ type: 'error', title: err?.message ?? 'Có lỗi xảy ra' });
    },
  });

  const toPayload = (data: TourGuideFormValues): TourGuideFormPayload => ({
    name: data.name,
    avatar: data.avatar ?? undefined,
    coverImg: data.coverImg ?? undefined,
    quote: data.quote ?? undefined,
    summary: data.summary ?? undefined,
    description: data.description ?? undefined,
    expYear: data.expYear,
    languages: data.languages,
    experts: data.experts,
    careerPath: data.careerPath,
  });

  const onSubmit = (data: TourGuideFormValues) => {
    if (isEdit) {
      updateMutation.mutate(
        { id: guideId!, payload: toPayload(data) },
        {
          onSuccess: () => {
            invalidate();
            addAlert({ type: 'success', title: 'Cập nhật thành công' });
            router.push(ROUTE.ADMIN_GUIDES);
          },
        }
      );
    } else {
      createMutation.mutate(toPayload(data));
    }
  };

  const isPending = createMutation.isPending || updateMutation.isPending;

  return { form, isEdit, guideData, onSubmit, isPending };
}
```

---

## 9. Routes — `src/types/routes.ts` _(MODIFY)_

```typescript
// Thêm vào object ROUTE:
ADMIN_GUIDES: '/admin/guides',
ADMIN_GUIDES_CREATE: '/admin/guides/create',
ADMIN_GUIDES_EDIT: (id: string) => `/admin/guides/${id}/edit`,
```

---

## 10. GuideListPage — Layout & Components

### 10.1 `GuideListPage/index.tsx` (pattern từ ProductListPage)

| Element           | Mô tả                                                              |
| ----------------- | ------------------------------------------------------------------ |
| **Header**        | "Tour Guides" title + nút "Add New Guide" → `/admin/guides/create` |
| **Stat cards**    | Total Guides, Rating ≥ 4★ count, Exp ≥ 5 năm count                 |
| **Toolbar**       | Search input (keyword)                                             |
| **Table**         | `GuideTable` component                                             |
| **Pagination**    | Giống ProductListPage                                              |
| **Delete dialog** | `DeleteConfirmDialog`                                              |

### 10.2 `GuideTable.tsx` — columns

| Cột           | Data                        | Notes                |
| ------------- | --------------------------- | -------------------- |
| **Guide**     | avatar + name + id fallback | Link → edit page     |
| **Exp (năm)** | `expYear`                   | badge                |
| **Rating**    | `ratingStar` + stars        | StarRating component |
| **Tours led** | `ratingCount`               | ⚠️ field tạm         |
| **Ngày tạo**  | `createdAt`                 | format `DD/MM/YYYY`  |
| **Actions**   | `...` menu                  | Edit, Delete         |

### 10.3 `use-guide-list-actions.ts`

```typescript
export function useGuideListActions(refetch: () => void) {
  const [deleteTarget, setDeleteTarget] = useState<ITourGuide | null>(null);
  const { addAlert } = useAlertStore.getState();

  const deleteMutation = useDeleteTourGuide({
    onSuccess: () => {
      addAlert({ type: 'success', title: 'Đã xóa hướng dẫn viên' });
      setDeleteTarget(null);
      refetch();
    },
    onError: () => addAlert({ type: 'error', title: 'Xóa thất bại' }),
  });

  const handleDeleteConfirm = () => {
    if (!deleteTarget) return;
    deleteMutation.mutate({ id: deleteTarget.id });
  };

  return { deleteTarget, setDeleteTarget, handleDeleteConfirm };
}
```

---

## 11. GuideFormPage — Layout & Sections

### 11.1 `GuideFormPage/index.tsx` (pattern từ ProductFormPage)

- **Scroll-spy nav** bên trái (sticky)
- **`guide-form-header.tsx`** — sticky header, Save button, breadcrumb
- **`FormWrapper`** wrap toàn bộ

### 11.2 `NAV_SECTIONS` (scroll-spy items)

```typescript
const NAV_SECTIONS = [
  { id: 'section-basic', label: 'Basic Info', icon: User },
  { id: 'section-bio', label: 'Bio', icon: AlignLeft },
  { id: 'section-metrics', label: 'Metrics', icon: BarChart2 },
  { id: 'section-experts', label: 'Specialties', icon: Sparkles },
  { id: 'section-career', label: 'Career', icon: Briefcase },
];
```

### 11.3 Các section components

#### `basic-info-section.tsx`

```
Fields:
  - name          → TextInput (required)
  - summary       → TextInput (subtitle/title)
  - quote         → TextInput (slogan)
  - avatar        → ImageUpload (single)
  - coverImg      → ImageUpload (single, landscape)
```

#### `bio-section.tsx`

```
Fields:
  - description   → Textarea / RichText
```

#### `metrics-section.tsx`

```
Fields:
  - expYear       → NumberInput (min 0, max 50)
  - languages     → MultiSelect / Tag input (VI, EN, FR, JP, ...)
```

#### `experts-section.tsx`

```
Fields:
  - experts       → Tag input (free text, thêm/xóa)
                    Gợi ý: "Trekking expert", "Food storyteller", ...
```

#### `career-section.tsx`

```
Fields: (array, dynamic rows)
  - careerPath[].role        → TextInput
  - careerPath[].company     → TextInput
  - careerPath[].startYear   → NumberInput
  - careerPath[].tourCount   → NumberInput
  - careerPath[].description → TextInput
  + Add row button
  + Remove row button
```

---

## 12. Files cần tạo / thay đổi

```
src/modules/AdminTourGuide/                         [NEW MODULE]
├── index.ts
├── GuideListPage/
│   ├── index.tsx
│   ├── hooks/use-guide-list-actions.ts
│   └── components/
│       ├── GuideTable.tsx
│       ├── GuideTableRow.tsx
│       └── DeleteConfirmDialog.tsx
└── GuideFormPage/
    ├── index.tsx
    ├── hooks/use-guide-form.ts
    └── components/
        ├── guide-form-header.tsx
        └── sections/
            ├── basic-info-section.tsx
            ├── bio-section.tsx
            ├── metrics-section.tsx
            ├── experts-section.tsx
            └── career-section.tsx

src/api/tour-guide/
├── types.ts     [MODIFY] — thêm ITourGuide, ITourGuideListResult, TourGuideFormPayload
├── requests.ts  [MODIFY] — thêm getTourGuideList, createTourGuide, updateTourGuide, deleteTourGuide
└── queries.ts   [MODIFY] — thêm useTourGuideList, useCreateTourGuide, useUpdateTourGuide, useDeleteTourGuide

src/lib/validations/
└── tour-guide.ts          [NEW] — zod schema, TourGuideFormValues

src/types/routes.ts        [MODIFY] — thêm ADMIN_GUIDES, ADMIN_GUIDES_CREATE, ADMIN_GUIDES_EDIT

src/pages/admin/guides/
├── index.tsx              [NEW] — GuideListPage
├── create.tsx             [NEW] — GuideFormPage (no id)
└── [id]/edit.tsx          [NEW] — GuideFormPage (with id)
```

---

## 13. Open Questions / Status

| #   | Vấn đề                                                                          | Status        |
| --- | ------------------------------------------------------------------------------- | ------------- |
| 1   | `POST /tour-guide` tồn tại và body đã confirmed                                 | ✅ Done       |
| 2   | `PUT /tour-guide/:id` tồn tại                                                   | ✅ Done       |
| 3   | `DELETE /tour-guide/:id` tồn tại                                                | ✅ Done       |
| 4   | `GET /tour-guide/:id` confirmed                                                 | ✅ Done       |
| 5   | Field order `careerPath` request: `company` trước `role`                        | ✅ Confirmed  |
| 6   | **`careerPath` POST response là array** (Swagger example sai — đã test thực tế) | ✅ Resolved   |
| 7   | **`supplierReview`** có thể là `null` (guide mới) — cần nullable type           | ✅ Confirmed  |
| 8   | **`keyword`** param trong `GET /tour-guide` có tồn tại — confirmed từ Swagger   | ✅ Confirmed  |
| 9   | **List item dùng `ratingValue`** không phải `ratingStar`                        | ✅ **Fixed**  |
| 10  | **Server-side pagination** — total 10,007 records, cần pagination thực sự       | ✅ Confirmed  |
| 11  | Upload ảnh `avatar` / `coverImg` dùng `/upload` endpoint có sẵn?                | ✅ Likely yes |
