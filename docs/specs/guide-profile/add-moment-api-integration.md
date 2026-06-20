---
title: 'Add Moment — API Integration (GuideProfilePage)'
created: '2026-06-20'
status: 'draft'
domain: 'guide-profile'
related: 'moments-grid.md'
---

# Spec: Add Moment — API Integration (GuideProfilePage)

## 1. Vấn đề / Mục tiêu

Hiện tại `AddMomentSheet` (`manage-moments-add-sheet.tsx`) chỉ mô phỏng upload bằng `setInterval` fake — không có API nào được gọi. Khi người dùng nhấn **Lưu**, không có moment nào được tạo trên backend.

**Vấn đề cụ thể:**

1. `handleFileSelect` dùng `setInterval` giả lập progress 0→100% — không upload thật.
2. `handleSave` chỉ hiện toast success rồi đóng sheet — không gọi API create moment.
3. `ApiTourGuideMoment` (raw type) **thiếu 5 fields** so với response thực của `GET /tour-guide/{id}/moment`.
4. Chưa có request function nào cho `POST /tour-guide/{id}/moment`.
5. Chưa invalidate cache sau khi add moment thành công.

**Mục tiêu:**

- Cập nhật `ApiTourGuideMoment` đủ fields theo response thực.
- Reuse flow upload video TUS từ `AdminProduct` (pattern đã được test production).
- Implement create moment thật: `POST /tour-guide/{id}/moment`.
- Invalidate `useTourGuideMomentsInfinite` cache sau khi tạo thành công.

---

## 2. Upload Flow — Reuse Pattern từ AdminProduct

### Tổng quan kiến trúc upload (đã có sẵn trong codebase)

Upload video trong codebase dùng **Bunny TUS protocol** — **không** phải multipart form đơn giản. Flow gồm 2 bước:

```
Bước 1: POST /upload/video  →  lấy TUS credentials (videoId, libraryId, signature)
Bước 2: TUS upload trực tiếp lên Bunny CDN endpoint  →  progress tracking thật
Bước 3: POST /tour-guide/{id}/moment  →  lưu metadata vào DB với guid từ bước 1
```

> **Pattern tham khảo**: [`use-video-upload.ts`](file:///d:/Remote/web-travel/src/modules/AdminProduct/ProductFormPage/components/shared/use-video-upload.ts) và [`banner-video-upload.tsx`](file:///d:/Remote/web-travel/src/modules/AdminProduct/ProductFormPage/components/shared/banner-video-upload.tsx).

### Bước 1 — POST /upload/video (lấy TUS credentials)

```
POST https://web-travel-be.fly.dev/upload/video
Content-Type: application/json

Body: { "title": "tên video" }
```

**Response:**

```json
{
  "data": {
    "videoId": "282fcccd-d68f-4a9b-90fa-95df2cb6f440",
    "libraryId": "622547",
    "expirationTime": 1718900000,
    "signature": "abc123..."
  }
}
```

### Bước 2 — TUS Upload lên Bunny CDN

Dùng `tus-js-client` (đã có trong `package.json`):

```typescript
const tusInstance = new tus.Upload(file, {
  endpoint: process.env.NEXT_PUBLIC_BUNNY_TUS_ENDPOINT, // 'https://video.bunnycdn.com/tusupload'
  headers: {
    AuthorizationSignature: signature,
    AuthorizationExpire: String(expirationTime),
    VideoId: bunnyVideoId, // videoId từ bước 1
    LibraryId: libraryId,
  },
  metadata: { filetype: file.type, title: form.name },
  onProgress(bytesUploaded, bytesTotal) {
    const progress = Math.round((bytesUploaded / bytesTotal) * 100);
    setProgress(progress); // real progress tracking
  },
  onSuccess() {
    // → Bước 3: tạo moment trong DB
    createMoment(bunnyVideoId);
  },
});
tusInstance.start();
```

### Bước 3 — POST /tour-guide/{id}/moment (confirmed từ Swagger)

```
POST https://web-travel-be.fly.dev/tour-guide/{id}/moment
Authorization: Bearer {token}
Content-Type: application/json
```

**Request payload (confirmed):**

```json
{
  "name": "string",
  "guid": "3fa85f64-5717-4562-b3fc-2c963f66afa6",
  "url": "string",
  "thumbnail": "string",
  "description": "string",
  "type": "hero",
  "productId": "3fa85f64-5717-4562-b3fc-2c963f66afa6",
  "tourGuideId": "3fa85f64-5717-4562-b3fc-2c963f66afa6"
}
```

> **Lưu ý key fields:**
>
> - `guid` = `videoId` từ bước 1 (Bunny video GUID)
> - `url` = CDN URL sau khi upload (optional, có thể để `""`)
> - `thumbnail` = Bunny auto-generate: `https://vz-186cf1b9-231.b-cdn.net/{guid}/thumbnail.jpg`
> - `productId` = optional, có thể `null` (tour liên kết)
> - `tourGuideId` = `guideId` của tour guide hiện tại
> - `type` = `"normal"` (default cho moment upload từ guide profile)

**Response dự kiến:**

```json
{
  "data": { ...ApiTourGuideMoment },
  "code": 201,
  "message": "created",
  "error": null
}
```

---

## 3. Gap Analysis — `ApiTourGuideMoment` vs Response thực

So sánh type hiện tại (`src/api/tour-guide/types.ts`) với response thực từ `GET /tour-guide/{id}/moment`:

| Field API     | Hiện có | Cần thêm | Ghi chú                       |
| :------------ | :------ | :------- | :---------------------------- |
| `id`          | ✅      |          |                               |
| `name`        | ✅      |          |                               |
| `slug`        | ❌      | ✅       | BE tự generate                |
| `url`         | ❌      | ✅       | CDN direct URL, có thể `null` |
| `embedUrl`    | ✅      |          |                               |
| `shortUrl`    | ❌      | ✅       | Preview/HLS URL từ Bunny      |
| `thumbnail`   | ✅      |          |                               |
| `description` | ✅      |          |                               |
| `tag`         | ❌      | ✅       | Tag label, có thể `null`      |
| `like`        | ❌      | ✅       | Like count                    |
| `type`        | ❌      | ✅       | `"normal"` hoặc `"hero"`      |
| `duration`    | ✅      |          | Giây, BE hiện trả `0`         |

---

## 4. Hành vi mong muốn

### A. Luồng chính — Giống AdminProduct `VideoUploadDialog`

> **Nguyên tắc**: Form điền trước, upload sau, `createTourGuideMoment` gọi **tự động** trong TUS `onSuccess` — không có bước bấm "Save" riêng (giống `saveToDb` trong `use-video-upload.ts`).

```
AdminProduct flow:
  [Điền name/desc] → [Chọn file] → [Bấm Start Upload] → [TUS upload...] → onSuccess → saveToDb() → done

Moment flow (giống hệt):
  [Điền name/caption] → [Chọn file] → [Auto-start TUS] → [TUS upload...] → onSuccess → createTourGuideMoment() → done
```

| Bước | Hành động                                     | Kết quả                                                                   |
| :--- | :-------------------------------------------- | :------------------------------------------------------------------------ |
| 1    | Nhập **Name** (required) + Caption (optional) | Form state cập nhật                                                       |
| 2    | Chọn file video (mp4/webm)                    | Validate: size ≤ 50MB, format hợp lệ                                      |
| 3    | Validate file pass + `name` không rỗng        | Gọi `POST /upload/video` lấy TUS credentials                              |
| 4    | TUS upload bắt đầu                            | Progress circle hiển thị % thật từ TUS `onProgress`                       |
| 5    | Upload hoàn thành (TUS `onSuccess`)           | **Auto-gọi** `createTourGuideMoment` — không cần user bấm gì thêm         |
| 6    | Create success                                | Toast success → đóng sheet → invalidate moments cache                     |
| 7    | Lỗi upload                                    | Toast error + nút retry (giống AdminProduct)                              |
| 8    | Lỗi create (sau upload)                       | Toast error với nút "Retry Save" (giống `onRetrySave` trong AdminProduct) |

### B. Form Fields — Required & Validation

> **Pattern chuẩn dự án** (theo `video-upload-dialog.tsx`):
>
> - Label required: `{label} <span className="text-rose-500">*</span>`
> - Error text: `<p className="text-xs text-rose-500">{errorMessage}</p>` bên dưới input
> - Clear error khi user bắt đầu nhập lại
> - Validate trước khi bắt đầu upload (không validate on blur)

| Field UI                     | Map to API      | Required        | Validate rule                             | Ghi chú                                                   |
| :--------------------------- | :-------------- | :-------------- | :---------------------------------------- | :-------------------------------------------------------- |
| **Name** _(cần thêm vào UI)_ | `name`          | ✅ **Required** | Không được rỗng, điền trước khi chọn file | Thêm input với `<span className="text-rose-500">*</span>` |
| Video upload area            | `guid` (hidden) | ✅ **Required** | Validate `name` trước khi cho chọn file   | Upload area disabled nếu `name` rỗng                      |
| Caption                      | `description`   | ❌ Optional     | max 150 chars                             | Đã có                                                     |

### C. Validate trước khi start upload (giống AdminProduct `startUpload`)

```typescript
// AdminProduct startUpload — tham chiếu (use-video-upload.ts line 76-80):
async function startUpload() {
  if (!form.name.trim()) {
    setNameError(t('nameRequired'));
    return; // ← chặn upload nếu name rỗng
  }
  // ... bắt đầu TUS upload
}

// Moment — tương tự, validate trong handleFileSelect:
const handleFileSelect = async (file: File) => {
  // Validate name TRƯỚC khi upload
  if (!name.trim()) {
    setNameError(t('manageMomentsSheet.nameRequired'));
    return; // ← không cho upload nếu chưa có name
  }
  // ... validate file, start TUS
};
```

### D. Auto-save trong TUS `onSuccess` (giống AdminProduct)

```typescript
// AdminProduct (use-video-upload.ts line 121-123):
onSuccess() {
  saveToDb(bunnyVideoId).catch(() => null);  // auto, không cần user bấm
},

// Moment — tương tự:
onSuccess: async () => {
  await saveMomentToDb(bunnyVideoId);        // auto, không cần user bấm
},
```

### E. Trạng thái Upload States

| State       | Progress UI  | Button dưới sheet             | Ghi chú                           |
| :---------- | :----------- | :---------------------------- | :-------------------------------- |
| `idle`      | Ẩn           | ❌ Ẩn / disabled              | Điền name/caption trước           |
| `preparing` | Spinner      | "Đang chuẩn bị..." disabled   | Lấy TUS credentials               |
| `uploading` | N% (real)    | "Đang tải lên N%..." disabled | TUS `onProgress`                  |
| `saving`    | 100% spinner | "Đang lưu..." disabled        | `createTourGuideMoment` đang chạy |
| `done`      | —            | Sheet tự đóng                 | Toast success                     |
| `error`     | —            | "Thử lại" / "Thử lưu lại"     | Phân biệt lỗi upload vs lỗi save  |

> ⚠️ **Không có bước "Upload xong → bấm Save"** — sheet tự xử lý và đóng sau khi cả 2 bước hoàn thành.

---

## 5. Thay đổi kỹ thuật

### A. `src/api/tour-guide/types.ts` — MODIFY

**1. Cập nhật `ApiTourGuideMoment` — thêm 5 fields còn thiếu:**

```typescript
// TRƯỚC:
export interface ApiTourGuideMoment {
  id: string;
  name: string;
  description: string | null;
  thumbnail: string | null;
  duration: number;
  embedUrl: string;
}

// SAU:
export interface ApiTourGuideMoment {
  id: string;
  name: string;
  slug: string; // [NEW]
  url: string | null; // [NEW] CDN direct URL
  embedUrl: string;
  shortUrl: string | null; // [NEW] preview/HLS URL
  thumbnail: string | null;
  description: string | null;
  tag: string | null; // [NEW]
  like: number; // [NEW]
  type: 'normal' | 'hero'; // [NEW]
  duration: number;
}
```

**2. Thêm `ApiCreateMomentPayload` và `ApiCreateMomentResponse`:**

> **So sánh với `CreateVideoPayload` (AdminProduct)** — cùng pattern, chỉ khác endpoint và có thêm `tourGuideId`:

```typescript
// AdminProduct — tạm tham chiếu:
export interface CreateVideoPayload {
  name: string; // required
  guid: string; // required — Bunny videoId
  thumbnail?: string; // '' (empty)
  description?: string;
  type: 'hero' | 'normal';
  tag?: string;
}

// [NEW] Moment — giống hệt, thêm tourGuideId:
export interface ApiCreateMomentPayload {
  name: string; // required
  guid: string; // required — Bunny videoId từ POST /upload/video
  thumbnail: string; // '' (empty, giống AdminProduct)
  description?: string; // từ caption field
  type: 'normal' | 'hero'; // mặc định 'normal'
  tourGuideId: string; // guideId của guide hiện tại
}

// [NEW]
export interface ApiCreateMomentResponse {
  data: ApiTourGuideMoment;
  code: number;
  message: string;
  error: string | null;
}
```

---

### B. `src/api/tour-guide/requests.ts` — MODIFY

Thêm function `createTourGuideMoment`:

```typescript
// [NEW] Tạo moment sau khi upload Bunny TUS thành công
export async function createTourGuideMoment(
  guideId: string,
  payload: ApiCreateMomentPayload
): Promise<ApiTourGuideMoment> {
  const { data } = await request.post<ApiCreateMomentResponse>(`/tour-guide/${guideId}/moment`, payload);
  return data.data;
}
```

> **Không cần** thêm `uploadMomentVideo` — upload dùng raw `fetch` + `tus-js-client` trực tiếp trong component, giống pattern `use-video-upload.ts` và `banner-video-upload.tsx`.

---

### C. `src/api/tour-guide/queries.ts` — MODIFY

Thêm mutation hook:

```typescript
import { createTourGuideMoment } from './requests';
import type { ApiCreateMomentPayload, ApiTourGuideMoment } from './types';

// [NEW]
export interface ICreateMomentVariables {
  guideId: string;
  payload: ApiCreateMomentPayload;
}

export const useCreateTourGuideMoment = createMutation<ApiTourGuideMoment, ICreateMomentVariables>({
  mutationFn: ({ guideId, payload }) => createTourGuideMoment(guideId, payload),
});
```

---

### D. `src/modules/GuideProfilePage/components/manage-moments-add-sheet.tsx` — MODIFY (CHÍNH)

**Thay đổi props interface — thêm `guideId`:**

```typescript
interface AddMomentSheetProps {
  open: boolean;
  onClose: () => void;
  guideId: string; // [NEW] cần để gọi POST /tour-guide/{id}/moment
  destinations: string[]; // giữ nguyên, dùng cho productId lookup
}
```

**State mới — thêm `name` và `nameError`:**

```typescript
const [name, setName] = useState(''); // [NEW] required field
const [nameError, setNameError] = useState(''); // [NEW] validation error
// Xóa: const [uploadDone, setUploadDone] = useState(false);
// Thêm:
type UploadPhase = 'idle' | 'preparing' | 'uploading' | 'done' | 'error';
const [phase, setPhase] = useState<UploadPhase>('idle');
const [progress, setProgress] = useState(0);
const [bunnyVideoId, setBunnyVideoId] = useState<string | null>(null);
const [saving, setSaving] = useState(false);
const tusRef = useRef<tus.Upload | null>(null);
```

**Form UI — thêm Name field với dấu `*` đỏ:**

```tsx
{
  /* Name field — required, giống VideoUploadDialog */
}
<div className="space-y-1.5">
  <label className="admin-form-label">
    {t('manageMomentsSheet.nameLabel')}
    <span className="text-rose-500">*</span>
  </label>
  <input
    type="text"
    maxLength={100}
    value={name}
    onChange={(e) => {
      setName(e.target.value);
      if (nameError) setNameError(''); // clear on type
    }}
    placeholder={t('manageMomentsSheet.namePlaceholder')}
    className="w-full rounded-xl border border-slate-200 bg-slate-50/30 px-3.5 py-2.5 text-[13px] focus:outline-none focus:ring-2 focus:ring-brand-500/20 focus:border-brand-500 transition-all"
  />
  {nameError && <p className="text-xs text-rose-500">{nameError}</p>}
</div>;
```

**Thay `handleFileSelect` — real TUS upload:**

```typescript
const handleFileSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
  const selected = e.target.files?.[0];
  e.target.value = '';
  if (!selected) return;

  // Validate (giữ nguyên)
  if (selected.size > 50 * 1024 * 1024) {
    /* toast error */ return;
  }
  if (!['video/mp4', 'video/webm'].includes(selected.type)) {
    /* toast error */ return;
  }

  setFile(selected);
  setPhase('preparing');
  setProgress(0);

  try {
    // Bước 1: Lấy TUS credentials
    const credRes = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/upload/video`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ title: caption || selected.name }),
    });
    if (!credRes.ok) throw new Error('Upload init failed');
    const { data: cred } = (await credRes.json()) as {
      data: { videoId: string; libraryId: string; expirationTime: number; signature: string };
    };
    const { videoId, libraryId, expirationTime, signature } = cred;
    setBunnyVideoId(videoId);

    // Bước 2: TUS upload
    const tusInstance = new tus.Upload(selected, {
      endpoint: process.env.NEXT_PUBLIC_BUNNY_TUS_ENDPOINT ?? 'https://video.bunnycdn.com/tusupload',
      retryDelays: [0, 3000, 5000, 10000],
      headers: {
        AuthorizationSignature: signature,
        AuthorizationExpire: String(expirationTime),
        VideoId: videoId,
        LibraryId: libraryId,
      },
      metadata: { filetype: selected.type, title: selected.name },
      onProgress(uploaded, total) {
        const pct = Math.round((uploaded / total) * 100);
        setProgress(pct);
        setPhase('uploading');
      },
      onSuccess() {
        setProgress(100);
        setPhase('done'); // → enable nút Lưu
      },
      onError(err) {
        setPhase('error');
        useAlertStore.getState().addAlert({ type: 'error', title: err.message });
      },
    });

    tusRef.current = tusInstance;
    tusInstance.start();
    setPhase('uploading');
  } catch (err) {
    setPhase('error');
    useAlertStore.getState().addAlert({ type: 'error', title: t('manageMomentsSheet.uploadFailed') });
  }
};
```

**Thay `handleSave` — giống `saveToDb` trong AdminProduct:**

```typescript
// AdminProduct saveToDb — tham chiếu:
// await createVideo({
//   name: form.name,
//   guid: bunnyVideoId,
//   thumbnail: '',
//   description: form.description,
//   type: 'hero',
//   tag: form.tag,
// });

const handleSave = async () => {
  // 1. Validate video đã upload xong
  if (phase !== 'done' || !bunnyVideoId) return;

  // 2. Validate name (required)
  if (!name.trim()) {
    setNameError(t('manageMomentsSheet.nameRequired'));
    return;
  }
  setNameError('');

  setSaving(true);
  try {
    // Bước 3: Tạo moment trong DB — tương tự saveToDb của AdminProduct
    await createTourGuideMoment(guideId, {
      name: name.trim(),
      guid: bunnyVideoId,
      thumbnail: '', // empty string, giống AdminProduct
      description: caption, // từ caption textarea
      type: 'normal',
      tourGuideId: guideId,
    });

    // Invalidate moments cache
    queryClient.invalidateQueries({ queryKey: ['/tour-guide/moments-infinite'] });
    queryClient.invalidateQueries({ queryKey: ['/tour-guide/moments'] });

    useAlertStore.getState().addAlert({ type: 'success', title: t('manageMomentsSheet.addMoment') });
    handleClose();
  } catch {
    useAlertStore.getState().addAlert({ type: 'error', title: t('manageMomentsSheet.saveFailed') });
  } finally {
    setSaving(false);
  }
};
```

**Cleanup TUS khi đóng sheet:**

```typescript
const handleClose = () => {
  tusRef.current?.abort(); // [NEW] abort TUS nếu đang upload
  reset();
  onClose();
};
```

**Cập nhật Progress Circle — dùng `phase` thay `uploading`:**

```typescript
// TRƯỚC:
{uploading ? t('manageMomentsSheet.uploading', { progress }) : `${progress}%`}

// SAU:
{phase === 'preparing' ? t('manageMomentsSheet.preparing') :
 phase === 'uploading' ? t('manageMomentsSheet.uploading', { progress }) :
 phase === 'done' ? t('manageMomentsSheet.uploadComplete') : `${progress}%`}

// Nút Lưu:
disabled={phase !== 'done' || saving}
```

---

### E. `src/modules/GuideProfilePage/components/manage-moments-sheet.tsx` — MODIFY

Truyền `guideId` xuống `AddMomentSheet`:

```tsx
// TRƯỚC:
<AddMomentSheet open={addOpen} onClose={() => setAddOpen(false)} destinations={destinations} />

// SAU:
<AddMomentSheet
  open={addOpen}
  onClose={() => setAddOpen(false)}
  guideId={guideId}          // [NEW]
  destinations={destinations}
/>
```

---

## 6. Files cần thay đổi

| File                                                                   | Thay đổi                                                                                                | Loại   |
| :--------------------------------------------------------------------- | :------------------------------------------------------------------------------------------------------ | :----- |
| `src/api/tour-guide/types.ts`                                          | Cập nhật `ApiTourGuideMoment` (thêm 5 fields); thêm `ApiCreateMomentPayload`, `ApiCreateMomentResponse` | MODIFY |
| `src/api/tour-guide/requests.ts`                                       | Thêm `createTourGuideMoment`                                                                            | MODIFY |
| `src/api/tour-guide/queries.ts`                                        | Thêm `useCreateTourGuideMoment` mutation                                                                | MODIFY |
| `src/modules/GuideProfilePage/components/manage-moments-add-sheet.tsx` | Thay fake upload → TUS real upload; thay fake save → real create moment API                             | MODIFY |
| `src/modules/GuideProfilePage/components/manage-moments-sheet.tsx`     | Thêm prop `guideId` khi render `AddMomentSheet`                                                         | MODIFY |

---

## 7. Dependencies & Conflicts

- **Depends on**: `moments-grid.md` — kiến trúc query đã được implement.
- **Reuses pattern**: `use-video-upload.ts`, `banner-video-upload.tsx` — TUS upload flow.
- **Modifies**:
  - `ApiTourGuideMoment` trong `types.ts` — check toàn bộ usage của type này để không break mapper `toTourGuideMoment`.
  - `AddMomentSheet` — thay đổi props interface (thêm `guideId`).
- **Must NOT break**:
  - `toTourGuideMoment` mapper trong `requests.ts` — các fields mới trong `ApiTourGuideMoment` không được required nếu mapper cũ chưa dùng đến chúng.
  - `useTourGuideMomentsInfinite` — infinite scroll không đổi.
  - Progress circle UI (`moments-upload-progress-circle.tsx`) — giữ nguyên component, chỉ thay data source.
- **Conflicts with**: Không có.

---

## 8. Out of scope

- Xóa moment trên backend (`DELETE /tour-guide/{id}/moment/{momentId}`) — `handleDelete` hiện chỉ local.
- Edit moment đã tạo.
- Map `linkedTour` (destination name) → `productId` — cần thêm lookup endpoint; hiện để `productId = null`.
- `type = "hero"` selection từ UI — mặc định `"normal"`.
- Hiển thị `like` count trên grid card (field mới trong `ApiTourGuideMoment`).

---

## 9. Open questions

| #   | Câu hỏi                                                                                                                                          | Trạng thái                        |
| :-- | :----------------------------------------------------------------------------------------------------------------------------------------------- | :-------------------------------- |
| 1   | `productId` trong payload là UUID của `product` hay `video`? Tour Guide hiện có `destinations` (địa điểm) không phải `products`.                 | ⏳ Cần confirm BE                 |
| 2   | `tourGuideId` trong payload có bắt buộc không khi endpoint đã có `{id}` trong path?                                                              | ⏳ Cần confirm BE                 |
| 3   | Bunny TUS endpoint có cần thêm auth header `Authorization: Bearer {token}` không? (AdminProduct không dùng, nhưng moment upload có thể cần auth) | ⏳ Test                           |
| 4   | `thumbnail` URL pattern — `vz-186cf1b9-231.b-cdn.net` là fixed prefix hay dynamic theo library?                                                  | ✅ Confirmed từ real API response |
