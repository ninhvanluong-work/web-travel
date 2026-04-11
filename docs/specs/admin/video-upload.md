---
title: 'Admin – Video Management & Product-Video Linking'
created: '2026-04-08'
status: 'draft'
domain: 'admin'
related: 'image-upload.md'
---

# Spec: Admin – Quản lý Video & Gắn Video vào Sản phẩm

## 1. Vấn đề / Mục tiêu

Thay vì nhúng upload video vào form sản phẩm, hệ thống cần:

1. **Menu "Video" riêng** trong sidebar admin — upload và quản lý video độc lập.
2. **Màn hình upload** — form điền thông tin + TUS upload lên Bunny Stream.
3. **Selectbox trong form sản phẩm** — admin chọn video từ danh sách đã upload.
4. **Khi lưu sản phẩm** — gọi **1 API duy nhất**:
   - `POST /product` (tạo mới) hoặc `PUT /product/{id}` (cập nhật) — kèm `videoId` trong payload
   - BE tự xử lý logic gắn video + cập nhật type `hero`/`normal`

---

## 2. Cấu trúc File — Theo pattern Pages Router

Dự án dùng pattern: `src/pages/admin/...` chỉ là thin wrapper, logic thật nằm trong `src/modules/`.

```
src/
├── pages/
│   ├── api/
│   │   └── upload/
│   │       └── video.ts          # [MỚI] Next.js API Route — Bunny TUS credentials
│   └── admin/
│       └── videos/
│           └── index.tsx         # [MỚI] thin wrapper → AdminVideoPage
│
├── modules/
│   └── AdminVideo/               # [MỚI] toàn bộ video admin module
│       ├── index.ts              # barrel export
│       └── VideoPage/
│           ├── index.tsx         # VideoPage — upload form + list (1 trang duy nhất)
│           └── components/
│               ├── video-upload-card.tsx    # Upload form + TUS logic
│               ├── video-list-table.tsx     # Bảng danh sách video
│               └── video-table-row.tsx      # 1 dòng trong bảng
│
├── api/
│   └── video/
│       ├── types.ts              # [SỬA] thêm ApiAdminVideoItem, CreateVideoPayload, UpdateVideoPayload
│       └── requests.ts           # [SỬA] thêm createVideo(), updateVideo()
│
└── types/
    └── routes.ts                 # [SỬA] thêm ADMIN_VIDEOS
```

---

## 3. Sidebar & Routes

### 3.1. `src/types/routes.ts`

```ts
export const ROUTE = {
  // ... existing ...
  ADMIN_VIDEOS: '/admin/videos', // ← thêm
} as const;
```

### 3.2. `src/components/layouts/AdminLayout/Sidebar.tsx`

```ts
import { BookOpen, Film, LayoutDashboard, MapPin, Package, Users } from 'lucide-react';

const NAV_ITEMS = [
  { label: 'Dashboard', href: '/admin', icon: LayoutDashboard, exact: true },
  { label: 'Sản phẩm', href: ROUTE.ADMIN_PRODUCTS, icon: Package },
  { label: 'Video', href: ROUTE.ADMIN_VIDEOS, icon: Film }, // ← thêm
  { label: 'Nhà cung cấp', href: '/admin/suppliers', icon: Users },
  { label: 'Điểm đến', href: '/admin/destinations', icon: MapPin },
  { label: 'Đặt tour', href: '/admin/bookings', icon: BookOpen },
];
```

### 3.3. `src/pages/admin/videos/index.tsx` (thin wrapper)

```tsx
import type { ReactNode } from 'react';
import { AdminLayout } from '@/components/layouts/AdminLayout';
import AdminVideoPage from '@/modules/AdminVideo/VideoPage';
import type { NextPageWithLayout } from '@/types';

const AdminVideosPage: NextPageWithLayout = () => <AdminVideoPage />;
AdminVideosPage.getLayout = (page: ReactNode) => <AdminLayout>{page}</AdminLayout>;
export default AdminVideosPage;
```

---

## 4. API Route (Pages Router): Bunny TUS Credentials

**File:** `src/pages/api/upload/video.ts`

Dùng `NextApiRequest / NextApiResponse` (Pages Router pattern, giống `src/pages/api/hello.ts`).

```ts
import type { NextApiRequest, NextApiResponse } from 'next';
import { createHash } from 'crypto';

interface UploadCredentials {
  videoId: string; // Bunny GUID — dùng cho TUS upload header & POST /video
  libraryId: string;
  expirationTime: number;
  signature: string;
  // embedUrl KHÔNG trả về — BE tự ghép từ videoId (guid)
}

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse<UploadCredentials | { error: string }>
) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const BUNNY_API_KEY = process.env.BUNNY_STREAM_API_KEY;
  const BUNNY_LIBRARY_ID = process.env.BUNNY_STREAM_LIBRARY_ID;

  if (!BUNNY_API_KEY || !BUNNY_LIBRARY_ID) {
    return res.status(500).json({ error: 'Bunny Stream not configured' });
  }

  const { title } = req.body as { title?: string };

  // Step 1: Tạo video object trên Bunny Stream
  const createRes = await fetch(`https://video.bunnycdn.com/library/${BUNNY_LIBRARY_ID}/videos`, {
    method: 'POST',
    headers: {
      Accept: 'application/json',
      'Content-Type': 'application/json',
      AccessKey: BUNNY_API_KEY,
    },
    body: JSON.stringify({ title: title ?? 'Untitled Video' }),
  });

  if (!createRes.ok) {
    return res.status(500).json({ error: 'Failed to create Bunny video' });
  }

  const video = (await createRes.json()) as { guid: string };

  // Step 2: Sinh TUS signature (SHA256)
  const expirationTime = Math.floor(Date.now() / 1000) + 86400; // 24h
  const signature = createHash('sha256')
    .update(`${BUNNY_LIBRARY_ID}${BUNNY_API_KEY}${expirationTime}${video.guid}`)
    .digest('hex');

  return res.status(200).json({
    videoId: video.guid,
    libraryId: BUNNY_LIBRARY_ID,
    expirationTime,
    signature,
    // embedUrl không trả về — BE tự ghép khi nhận videoId (guid) qua POST /video
  });
}
```

> **Env vars cần thêm vào `.env.local`:**
>
> ```
> BUNNY_STREAM_API_KEY=...
> BUNNY_STREAM_LIBRARY_ID=...
> NEXT_PUBLIC_BUNNY_LIBRARY_ID=...   # dùng cho iframe embed phía client
> ```

---

## 5. VideoPage Module — Màn hình chính (1 trang duy nhất)

**File:** `src/modules/AdminVideo/VideoPage/index.tsx`

Layout: 2 cột — trái là form upload, phải là danh sách video đã upload.
Trên mobile (nếu cần): stacked.

```
┌──────────────────────────────────────────────────────┐
│  🎬 Quản lý Video                        [Thống kê] │
├──────────────────────────────────────────────────────┤
│  ┌────────────────┐  ┌───────────────────────────┐  │
│  │  Upload Video  │  │  Danh sách Video          │  │
│  │                │  │  [Tìm kiếm................] │ │
│  │  [Drop Zone]   │  │  ┌────────────────────┐   │  │
│  │  Tên video *   │  │  │ 🖼 Tên video        │   │  │
│  │  Loại *        │  │  │    hero · tour ABC  │   │  │
│  │  Mô tả         │  │  │    [Sửa] [Xóa]     │   │  │
│  │  Tag           │  │  └────────────────────┘   │  │
│  │  Thumbnail     │  │  ...                       │  │
│  │                │  └───────────────────────────┘  │
│  │  [-- Upload --]│                                  │
│  └────────────────┘                                  │
└──────────────────────────────────────────────────────┘
```

---

## 5.5. VideoListTable — Bảng danh sách video có phân trang

**File:** `src/modules/AdminVideo/VideoPage/components/video-list-table.tsx`

### Layout tổng thể

```
┌─────┬──────────────────┬──────┬────────┬────────┬────────┬──────────┬──────────┐
│  #  │  Video           │ Type │  Tag   │ Upload │ Sản ph │ ♥ Thích  │ Hành động│
│     │ thumbnail+name   │      │        │ status │ ẩm     │          │          │
├─────┼──────────────────┼──────┼────────┼────────┼────────┼──────────┼──────────┤
│  1  │ 🖼 Tên video     │ hero │ mienbac│  ✅    │ 🔗 Có  │  9,877   │ [Embed]  │
│     │    Mô tả ngắn... │      │        │        │        │          │          │
├─────┼──────────────────┼──────┼────────┼────────┼────────┼──────────┼──────────┤
│ ... │  ...             │ ...  │  ...   │  ...   │  ...   │  ...     │  ...     │
├─────┴──────────────────┴──────┴────────┴────────┴────────┴──────────┴──────────┤
│  [← Trang trước]                          Trang 1         [Trang tiếp →]       │
└─────────────────────────────────────────────────────────────────────────────────┘
```

### Các cột trong bảng

Dựa trực tiếp theo schema DB table `video`:

| Cột               | DB column                            | Kiểu                            | Hiển thị                                                          |
| ----------------- | ------------------------------------ | ------------------------------- | ----------------------------------------------------------------- |
| **#**             | — (FE tính)                          | —                               | STT trong trang: `(page - 1) * pageSize + 1`                      |
| **Video**         | `thumbnail` + `name` + `description` | varchar / text                  | Thumbnail (40×28px) + tên (bold) + mô tả (truncate 1 dòng, muted) |
| **Type**          | `type`                               | varchar(50), default `'normal'` | Badge: `hero` (xanh) / `normal` (xám)                             |
| **Tag**           | `tag`                                | varchar(255)                    | Badge nếu có, `—` nếu null                                        |
| **Upload status** | `uploading_status`                   | integer                         | `✅` nếu `= 4` (Bunny done), spinner nếu đang xử lý, `❌` nếu lỗi |
| **Sản phẩm**      | `product_id`                         | uuid FK                         | `🔗 Có` nếu đã gắn product, `—` nếu chưa                          |
| **♥ Thích**       | `like`                               | integer                         | Format số: `9,877`                                                |
| **Hành động**     | —                                    | —                               | Nút **[Embed]** — copy `embed_url` vào clipboard                  |

### API & Phân trang

Dùng lại `getListVideo()` hiện có — **cursor-based** qua `distanceScore`:

```
GET /video?query={query}&distanceScore={cursor}&pageSize={pageSize}
```

| Param           | Giá trị mặc định | Ghi chú                             |
| --------------- | ---------------- | ----------------------------------- |
| `query`         | `""`             | Từ khóa tìm kiếm (debounce 300ms)   |
| `distanceScore` | `0`              | Cursor của trang — `0` là trang đầu |
| `pageSize`      | `10`             | Select box: `10 / 20 / 50`          |

**Logic cursor:**

```ts
const [page, setPage] = useState(1);
const [cursors, setCursors] = useState<number[]>([0]); // cursors[i] = cursor trang i+1
const currentCursor = cursors[page - 1] ?? 0;

// Sau khi fetch thành công:
// → Lưu cursors[page] = stats.distanceScore  (cursor cho trang kế)
// → "Trang tiếp" disabled nếu items.length < pageSize  (hết data)
// → "Trang trước" disabled nếu page === 1
// → Khi query hoặc pageSize thay đổi: reset page = 1, cursors = [0]
```

> API không trả về tổng trang — chỉ hiển thị `Trang {n}`, không có `/ {total}`.

### Tìm kiếm

- Debounce **300ms**
- Khi query thay đổi → reset về trang 1
- Placeholder: `Tìm kiếm theo tên...`

### Nút Embed

```ts
async function copyEmbed(embedUrl: string) {
  await navigator.clipboard.writeText(embedUrl);
  toast.success('Đã copy embed URL');
}
```

### Empty & Loading states

| State               | UI                                                |
| ------------------- | ------------------------------------------------- |
| Loading             | Skeleton 5 rows (animate-pulse)                   |
| Empty (không query) | `"Chưa có video nào. Hãy upload video đầu tiên."` |
| Empty (có query)    | `"Không tìm thấy video nào với từ khóa \"...\"."` |

---

## 6. VideoUploadCard Component — Chi tiết kỹ thuật

**File:** `src/modules/AdminVideo/VideoPage/components/video-upload-card.tsx`

### 6.1. Form fields

| Field         | Component      | Required | Ghi chú             |
| ------------- | -------------- | -------- | ------------------- |
| `name`        | `<input>` text | ✅       | Tên video/tour      |
| `description` | `<textarea>`   | ❌       | Mô tả ngắn          |
| `tag`         | `<input>` text | ❌       | Tag phân loại       |
| File video    | File picker    | ✅       | Accept: `.mp4` only |

> **`type`** không có trên UI — hardcode `"hero"` khi gửi lên BE. Không có trong form state.

> **`thumbnail`** không có trên UI — truyền `""`, Bunny Stream tự generate, BE tự lấy sau khi upload xong.

### 6.2. Upload state machine

```ts
type UploadState =
  | { status: 'idle' }
  | { status: 'selected'; file: File; error?: string }
  | { status: 'preparing' } // đang gọi /api/upload/video
  | {
      status: 'uploading'; // đang TUS upload
      progress: number; // 0-100
      bytesUploaded: number;
      bytesTotal: number;
      tusInstance: tus.Upload;
    }
  | { status: 'paused'; progress: number; tusInstance: tus.Upload }
  | { status: 'processing' } // upload xong, đang gọi POST /video
  | { status: 'success'; videoId: string; videoName: string }
  | { status: 'error'; phase: 'upload'; message: string; canRetry: true }
  | { status: 'error'; phase: 'saving'; message: string; canRetry: true; bunnyVideoId: string };
// phase 'saving': Bunny upload đã xong, chỉ POST /video (DB) thất bại
// → retry chỉ gọi lại createVideo() với bunnyVideoId đã có, không upload lại
```

### 6.3. UX states

| State        | UI                                                                             |
| ------------ | ------------------------------------------------------------------------------ |
| `idle`       | Drop zone gợi ý kéo thả + nút "Chọn file"                                      |
| `selected`   | Hiện tên file + dung lượng, nút "Bắt đầu upload"                               |
| `preparing`  | Spinner nhỏ "Đang khởi tạo..."                                                 |
| `uploading`  | Progress bar % + `XX MB / YY MB`, nút "Tạm dừng"                               |
| `paused`     | Progress bar đứng, nút "Tiếp tục" + "Hủy"                                      |
| `processing` | Spinner "Đang lưu thông tin..."                                                |
| `success`    | Checkmark xanh + tên video + nút **"Upload video khác"** — nhấn mới reset form |
| `error`      | Alert đỏ + message, nút "Thử lại"                                              |

### 6.4. Luồng upload chi tiết (startUpload function)

```ts
async function startUpload() {
  // 0. Validate
  const err = validateForm();
  if (err) return;
  setState({ status: 'preparing' });

  try {
    // 1. Lấy Bunny TUS credentials từ Next.js API Route
    const credRes = await fetch('/api/upload/video', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ title: form.name }),
    });
    if (!credRes.ok) throw new Error('Failed to get upload credentials');
    const { videoId: bunnyVideoId, libraryId, expirationTime, signature } = await credRes.json();
    // embedUrl không có trong response — BE tự ghép từ videoId (guid)

    // 2. TUS upload lên Bunny CDN
    const tusInstance = new tus.Upload(selectedFile, {
      endpoint: 'https://video.bunnycdn.com/tusupload',
      retryDelays: [0, 3000, 5000, 10000, 20000, 60000, 60000],
      headers: {
        AuthorizationSignature: signature,
        AuthorizationExpire: String(expirationTime),
        VideoId: bunnyVideoId,
        LibraryId: libraryId,
      },
      metadata: {
        filetype: selectedFile.type,
        title: form.name,
      },
      onProgress(bytesUploaded, bytesTotal) {
        const progress = Math.round((bytesUploaded / bytesTotal) * 100);
        setState({ status: 'uploading', progress, bytesUploaded, bytesTotal, tusInstance });
      },
      async onSuccess() {
        setState({ status: 'processing' });
        // 3. Tạo record video trong DB backend
        try {
          const dbVideo = await createVideo({
            name: form.name,
            url: bunnyVideoId, // Bunny GUID — field name là "url" theo BE contract
            thumbnail: '', // Bunny auto-generate, BE tự lấy sau
            description: form.description ?? '',
            type: 'hero', // hardcoded — BE tự đổi sang "normal" khi cần
            tag: form.tag ?? '',
            // embedding không gửi — BE tự ghép embedUrl từ url (guid)
          });
          setState({ status: 'success', videoId: dbVideo.id, videoName: form.name });
          refetchVideoList(); // refresh bảng danh sách
          // Form KHÔNG tự reset — user nhấn "Upload video khác" để reset
        } catch (err) {
          // Bunny upload thành công nhưng DB thất bại — giữ bunnyVideoId để retry
          setState({
            status: 'error',
            phase: 'saving',
            message: 'Lưu thông tin thất bại, vui lòng thử lại.',
            canRetry: true,
            bunnyVideoId,
          });
        }
      },
      onError(error) {
        setState({ status: 'error', message: error.message, canRetry: true });
      },
    });

    // Resume nếu có upload dang dở cùng file
    const previousUploads = await tusInstance.findPreviousUploads();
    if (previousUploads.length) {
      tusInstance.resumeFromPreviousUpload(previousUploads[0]);
    }
    tusInstance.start();
    setState({ status: 'uploading', progress: 0, bytesUploaded: 0, bytesTotal: selectedFile.size, tusInstance });
  } catch (err) {
    setState({ status: 'error', message: 'Có lỗi xảy ra, vui lòng thử lại.', canRetry: true });
  }
}
```

### 6.5. Validate file (client-side)

```ts
const ALLOWED_TYPES = ['video/mp4']; // chỉ .mp4
const MAX_SIZE_BYTES = 500 * 1024 * 1024; // 500 MB

function validateVideoFile(file: File): string | null {
  if (!ALLOWED_TYPES.includes(file.type)) return 'Chỉ chấp nhận file .mp4';
  if (file.size > MAX_SIZE_BYTES) return 'File quá lớn (tối đa 500 MB). Xem video-format-strategy.md để compress.';
  return null;
}
```

### 6.6. Pause / Resume / Cancel

```ts
// Pause
(uploadState as UploadingState).tusInstance.abort();
setState({ status: 'paused', ... });

// Resume
(uploadState as PausedState).tusInstance.start();
setState({ status: 'uploading', ... });

// Cancel
(uploadState as UploadingState | PausedState).tusInstance.abort();
setState({ status: 'idle' });
```

### 6.7. beforeunload warning

Khi `uploadState.status` là `'uploading'` hoặc `'paused'`, đăng ký `beforeunload` để cảnh báo user trước khi đóng tab / rời trang:

```ts
useEffect(() => {
  const isActive = uploadState.status === 'uploading' || uploadState.status === 'paused';
  if (!isActive) return;

  const handler = (e: BeforeUnloadEvent) => {
    e.preventDefault();
    e.returnValue = '';
  };
  window.addEventListener('beforeunload', handler);
  return () => window.removeEventListener('beforeunload', handler);
}, [uploadState.status]);
```

---

## 7. API Functions mới trong `src/api/video/`

### 7.0. `src/api/video/requests.ts` — thêm `getVideoById`

```ts
export const getVideoById = async (id: string): Promise<IVideo> => {
  const { data } = await request<{ data: ApiVideoItem }>({
    url: `/video/id/${id}`,
    method: 'GET',
  });
  return toVideo(data.data);
};
```

> Dùng trong VideoCard (product form) khi load edit mode với `videoId` có sẵn — fetch đúng 1 video để hiển thị tên + thumbnail.

### 7.1. `src/api/video/types.ts` — thêm types

```ts
// Thêm vào cuối file

// Admin-specific video shape (đầy đủ fields, khác ApiVideoItem dùng cho client)
export interface ApiAdminVideoItem {
  id: string;
  name: string;
  slug: string;
  url: string;
  embedUrl: string;
  shortUrl: string;
  thumbnail: string;
  description: string;
  tag: string | null;
  embedding: string;
  type: 'hero' | 'normal';
  guid: string;
  uploadingStatus: number;
  like: number;
  createdAt: string;
  updatedAt: string;
}

// Response wrapper từ BE: { data: {...}, code: 200, error: null, message: "..." }
export interface ApiAdminVideoResponse {
  data: ApiAdminVideoItem;
  code: number;
  error: string | null;
  message: string;
}

export interface CreateVideoPayload {
  name: string;
  url: string; // Bunny videoId (GUID) — field "url" theo BE contract
  thumbnail?: string; // CDN URL ảnh thumbnail
  description?: string;
  type: 'hero' | 'normal';
  tag?: string;
  // embedding KHÔNG gửi — BE tự ghép embedUrl từ url (guid)
  // productId KHÔNG có ở đây — gắn sau qua PUT /video/{id}
}

export interface UpdateVideoPayload {
  name?: string;
  url?: string;
  thumbnail?: string;
  description?: string;
  type?: 'hero' | 'normal';
  tag?: string;
  productId?: string | null; // key để gắn product — BE hỗ trợ partial update
  embedding?: string;
}
```

### 7.2. `src/api/video/requests.ts` — thêm functions

```ts
// Thêm vào cuối file

export const createVideo = async (payload: CreateVideoPayload): Promise<ApiAdminVideoItem> => {
  const { data } = await request<ApiAdminVideoResponse>({
    url: '/video',
    method: 'POST',
    data: payload,
  });
  return data.data;
};

export const updateVideo = async (id: string, payload: UpdateVideoPayload): Promise<ApiAdminVideoItem> => {
  const { data } = await request<ApiAdminVideoResponse>({
    url: `/video/${id}`,
    method: 'PUT',
    data: payload,
  });
  return data.data;
};
```

> **Note:** `useAdminVideos` React Query hook (cho danh sách video admin có phân trang) sẽ được thêm vào `queries.ts` sau khi BE sẵn sàng endpoint tương ứng.

---

## 8. Phần 2: Selectbox Video trong Form Sản phẩm

### 8.1. Schema thay đổi: `src/lib/validations/product.ts`

```ts
videoId: z.string().optional().nullable(),  // DB id của video gắn với sản phẩm
```

### 8.2. VideoCard trong Sidebar sản phẩm

**File:** `src/modules/AdminProduct/ProductFormPage/components/sidebar/video-card.tsx`

```
┌──────────────────────────────────────────┐
│ 🎬 Video                                 │
├──────────────────────────────────────────┤
│ Tìm video theo tên...                    │
│ ─────────────────────────────────────    │
│ ▼ [Dropdown kết quả]                     │
│   🖼 Du lịch Miền Bắc - Hà Giang        │
│   🖼 Du lịch Miền Nam - Sài Gòn         │
│                                          │
│ ┌── Đang chọn ──────────────────────┐   │
│ │  🖼 Tên video đã chọn             │   │
│ │                              [×]  │   │
│ └──────────────────────────────────┘   │
└──────────────────────────────────────────┘
```

#### API Endpoint

```
GET /video?query={query}&distanceScore=0&pageSize=10
```

| Param           | Kiểu   | Ghi chú                                                                |
| --------------- | ------ | ---------------------------------------------------------------------- |
| `query`         | string | Từ khóa tìm kiếm (debounce 300ms) — để trống để lấy danh sách mặc định |
| `distanceScore` | number | Luôn truyền `0` cho selectbox                                          |
| `pageSize`      | number | `10` là đủ cho dropdown                                                |

> **Lưu ý:** Đây là endpoint **dùng chung với frontend** (`getListVideo` trong `src/api/video/requests.ts`).
> VideoCard **gọi trực tiếp** `getListVideo()` — **không** dùng `useListVideo` React Query hook vì không cần cache.

#### Response shape dùng trong dropdown

```ts
// items[] từ response — đã được map qua toVideo() thành IVideo
interface IVideo {
  id: string; // DB id → gán vào videoId khi chọn
  title: string; // Tên video (IVideo.title = ApiVideoItem.name)
  thumbnail: string; // Ảnh thumbnail
}
```

**Hành vi:**

- Debounce 300ms → gọi `getListVideo({ query, pageSize: 10 })`
- Hiện thumbnail + tên trong dropdown
- Chọn → `field.onChange(video.id)` (DB id)
- Bỏ chọn → `field.onChange(null)`
- **Edit mode:** Khi form load với `videoId` có sẵn, gọi `getVideoById(videoId)` → hiển thị tên + thumbnail của video đang chọn. User vẫn có thể search để chọn video khác.

### 8.3. Vị trí VideoCard trong sidebar

`VideoCard` đặt **cuối sidebar**, sau `RelationCard`.

### 8.4. Luồng lưu sản phẩm — `src/hooks/use-product-form.ts`

Chỉ gọi **1 API duy nhất** — `videoId` truyền thẳng vào product payload, BE tự xử lý logic gắn video và cập nhật type.

> ⚠️ **TODO:** Hiện tại `videoId` **chưa được truyền** vào payload khi create/update product (BE chưa hỗ trợ).
> Khi BE sẵn sàng, bỏ comment dòng `videoId` trong payload bên dưới.

```ts
// Khi submit form:
async function onSubmit(data: ProductFormValues) {
  const payload = {
    ...data,
    // TODO: uncomment khi BE hỗ trợ nhận videoId trong create/update product
    // videoId: data.videoId ?? null,
  };

  if (isEdit) {
    await updateProduct(existingProductId, payload);
  } else {
    await createProduct(payload);
  }

  toast.success('Đã lưu thành công!');
  router.push(ROUTE.ADMIN_PRODUCTS);
}
```

**Edge cases:**

| Tình huống            | Xử lý                                                                    |
| --------------------- | ------------------------------------------------------------------------ |
| Không chọn video      | Gửi `videoId: null`, BE bỏ qua logic video                               |
| Admin đổi video A → B | Gửi `videoId: B.id`, BE tự set video B là `hero`, video A thành `normal` |
| Admin bỏ chọn video   | Gửi `videoId: null`, BE tự unlink video cũ                               |

---

## 9. Danh sách đầy đủ file thay đổi

| File                                                                         | Loại        | Thay đổi                                                                                      |
| ---------------------------------------------------------------------------- | ----------- | --------------------------------------------------------------------------------------------- |
| `src/types/routes.ts`                                                        | Sửa         | Thêm `ADMIN_VIDEOS`                                                                           |
| `src/components/layouts/AdminLayout/Sidebar.tsx`                             | Sửa         | Thêm nav item Video + import Film                                                             |
| `src/pages/admin/videos/index.tsx`                                           | **Tạo mới** | Thin wrapper → `AdminVideoPage`                                                               |
| `src/pages/api/upload/video.ts`                                              | **Tạo mới** | Pages Router API route — Bunny credentials                                                    |
| `src/modules/AdminVideo/VideoPage/index.tsx`                                 | **Tạo mới** | Trang chính: layout 2 cột                                                                     |
| `src/modules/AdminVideo/VideoPage/components/video-upload-card.tsx`          | **Tạo mới** | Form upload + TUS                                                                             |
| `src/modules/AdminVideo/VideoPage/components/video-list-table.tsx`           | **Tạo mới** | Bảng video đã upload                                                                          |
| `src/modules/AdminVideo/VideoPage/components/video-table-row.tsx`            | **Tạo mới** | 1 row trong bảng                                                                              |
| `src/modules/AdminVideo/index.ts`                                            | **Tạo mới** | Barrel export                                                                                 |
| `src/api/video/types.ts`                                                     | Sửa         | Thêm `ApiAdminVideoItem`, `ApiAdminVideoResponse`, `CreateVideoPayload`, `UpdateVideoPayload` |
| `src/api/video/requests.ts`                                                  | Sửa         | Thêm `getVideoById()`, `createVideo()`, `updateVideo()`                                       |
| `src/lib/validations/product.ts`                                             | Sửa         | Thêm `videoId` field                                                                          |
| `src/modules/AdminProduct/ProductFormPage/components/sidebar/video-card.tsx` | **Tạo mới** | Selectbox chọn video                                                                          |
| `src/modules/AdminProduct/ProductFormPage/index.tsx`                         | Sửa         | Mount `<VideoCard />` trong sidebar                                                           |
| `src/hooks/use-product-form.ts`                                              | Sửa         | Truyền `videoId` vào product payload — không gọi `updateVideo`                                |
| `.env.local`                                                                 | Sửa         | Thêm 3 env vars Bunny                                                                         |

### Dependency mới

```bash
pnpm add tus-js-client
```

---

## 10. Dependencies & Conflicts

- **Depends on:** Bunny Stream account, các env vars Bunny trong `.env.local`
- **Modifies:** `productSchema`, `Sidebar.tsx`, `video/requests.ts`, `use-product-form.ts`
- **Must NOT break:** `getListVideo`, `getVideoBySlug`, `getVideoPage` (dùng bởi frontend app)
- **Conflicts with:** Spec cũ — file này thay thế hoàn toàn phiên bản trước

---

## 11. Out of scope

- Xóa video khỏi Bunny Stream khi cancel upload (dọn bằng cron job định kỳ)
- Xóa video khỏi Bunny Stream khi xóa record DB (chỉ xóa/ẩn record DB)
- Phân trang infinite scroll trong selectbox (dùng top 20 là đủ)
- Video preview `<iframe>` trong selectbox dropdown
- Báo cáo / thống kê lượt xem video
- Auth/authorization cho `/api/upload/video` — thêm sau (⚠️ risk: bất kỳ ai biết URL đều gọi được, tốn Bunny quota)
- `useAdminVideos` React Query hook — chờ BE sẵn sàng endpoint phân trang
- Edit video record trong trang admin Video (chỉ upload + xem danh sách)

---

## 12. Các điểm đã xác nhận

- [x] **`PUT /video/{id}`** — hỗ trợ partial update, chỉ cần gửi `{ productId }` là đủ
- [x] **`POST /video`** — đã tồn tại, field tên là `url` (không phải `uri`)
- [x] **Video `type`** — chỉ có `'hero'` và `'normal'`
- [x] **File upload** — chỉ accept `.mp4`
- [x] **Success UX** — hiện nút "Upload video khác", không tự reset sau 2s
- [x] **Orphan Bunny objects** — chấp nhận, dọn bằng cron job định kỳ

---

## 13. Đã chốt

- **Pattern:** Pages Router — `pages/admin/videos/index.tsx` → `modules/AdminVideo/VideoPage`
- **API Route:** `pages/api/upload/video.ts` dùng `NextApiRequest/NextApiResponse`
- **Upload flow:** `/api/upload/video` (credentials) → check `credRes.ok` → `tus-js-client` → `POST /video` (DB)
- **Error handling:** tách `phase: 'upload'` vs `phase: 'saving'` — retry `saving` chỉ gọi lại `createVideo()` với `bunnyVideoId` đã có
- **`thumbnail`:** truyền `""` — Bunny auto-generate, BE tự lấy sau
- **`type`:** hardcode `"hero"` — không có trong form state
- **`beforeunload`:** warning khi `status: uploading | paused`
- **Product linking:** `videoId` truyền thẳng vào product payload — BE tự xử lý gắn video + cập nhật type `hero`/`normal`
- **1 API duy nhất khi save product:** không gọi `updateVideo` từ product form
- **`updateVideo`** vẫn giữ trong `requests.ts` — dùng cho trang quản lý video (sửa tên, tag, thumbnail...)
- **`getVideoById`:** thêm vào `requests.ts`, gọi `GET /video/id/{id}` — dùng cho VideoCard edit mode
- **VideoCard edit mode:** gọi `getVideoById(videoId)` để hiển thị tên + thumbnail video đang chọn
- **VideoCard vị trí:** cuối sidebar sản phẩm, sau `RelationCard`
- **Trang admin Video — danh sách:** dùng `getListVideo()` hiện có
- **Types:** `ApiAdminVideoItem` + `ApiAdminVideoResponse` riêng cho admin, không dùng chung `ApiVideoItem` của client
- **Field name:** `url` (không phải `uri`) theo BE contract
