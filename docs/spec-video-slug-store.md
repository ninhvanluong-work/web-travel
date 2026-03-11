# Spec: Video Slug URL + Search List Cache

## Mục tiêu

- URL video detail dùng `slug` thay vì `id` → dễ đọc
- Khi vào từ search → lướt theo đúng thứ tự danh sách grid đã tìm kiếm
- Khi refresh / direct link → chỉ gọi API `GET /video/{slug}` lấy thông tin video hiện tại, không lướt tiếp được (hoặc fallback fetch all)
- Mỗi lần lướt → URL cập nhật theo slug của video đang xem

---

## API

### GET /video (list) — dùng cho grid + infinite scroll

```json
{
  "data": {
    "items": [{ "id": "...", "slug": "du-lich-mien-bac-...", "name": "...", ... }],
    "stats": { "distanceScore": 0.5 }
  }
}
```

> ⚠️ Cần xác nhận: list API có trả về field `slug` không?

### GET /video/{slug} — chỉ gọi khi refresh / direct link

```json
{
  "data": {
    "id": "9b080bff-de62-4055-b67b-09844c6f5a8e",
    "slug": "du-lich-mien-nam-can-tho-9b08",
    "name": "Du lịch Miền Nam - Cần Thơ",
    "shortUrl": "https://...cdn.../short video/video9.mp4",
    "thumbnail": "https://...cdn.../Img/anh10.jpg",
    "description": "Chợ nổi Cái Răng...",
    "like": 2891
  }
}
```

---

## Flow

### Case 1: Vào từ Search (main flow)

```
[DetailSearchPage — grid]
  videos[] đang có trong state (từ react-query)
  User click video tại index N
    → useVideoListStore.setList(videos[])   ← lưu toàn bộ list + thứ tự
    → router.push(`/video/${video.slug}`)

[VideoDetailPage /video/du-lich-mien-bac]
  store.videos.length > 0
    → dùng list từ store (giữ đúng thứ tự grid)
    → initialIndex = store.videos.findIndex(v => v.slug === slug)
    → scroll đến đúng vị trí
    → lướt lên/xuống → router.replace(`/video/${v.slug}`, undefined, { shallow: true })
```

### Case 2: Refresh / Direct link

```
[VideoDetailPage /video/du-lich-mien-nam-can-tho-9b08]
  store.videos rỗng (refresh → store reset)
    → gọi GET /video/{slug} → render video hiện tại
    → hiển thị loading spinner cho đến khi có data
    → (optional) fetch all videos để user có thể lướt tiếp
```

---

## Zustand Store

```ts
// src/stores/VideoListStore.ts
interface IVideoListStore {
  videos: IVideo[];
  setList: (videos: IVideo[]) => void;
  clear: () => void;
}
```

- **Không** `persist` → reset khi refresh (đúng yêu cầu)
- Khi user search lại → `setList` ghi đè list mới
- Khi user back về search → store vẫn còn (trong session), không cần fetch lại

---

## IVideo type — cần thêm `slug`

```ts
export interface IVideo {
  id: string;
  slug: string; // ← thêm mới
  title: string;
  link: string;
  shortUrl: string;
  thumbnail: string;
  description: string;
  likeCount: number;
}
```

---

## Các files cần thay đổi

| File                                                    | Thay đổi                                                                 |
| ------------------------------------------------------- | ------------------------------------------------------------------------ |
| `src/api/video/types.ts`                                | Thêm `slug` vào `IVideo` + `ApiVideoItem`, thêm `ApiVideoDetailResponse` |
| `src/api/video/requests.ts`                             | Map `slug` trong `toVideo()`, thêm `getVideoBySlug(slug)`                |
| `src/api/video/queries.ts`                              | Thêm `useVideoBySlug` query                                              |
| `src/stores/VideoListStore.ts`                          | Tạo mới                                                                  |
| `src/stores/index.ts`                                   | Export `useVideoListStore`                                               |
| `src/pages/video/[id].tsx`                              | Đổi tên → `[slug].tsx`                                                   |
| `src/modules/DetailSearchPage/components/VideoGrid.tsx` | Lưu list vào store, navigate bằng slug                                   |
| `src/modules/VideoDetailPage/index.tsx`                 | Đọc từ store, fallback gọi API slug                                      |

---

## VideoDetailPage logic (chi tiết)

```ts
const { slug } = router.query;
const storeVideos = useVideoListStore.use.videos();

// Case 1: có list từ search
if (storeVideos.length > 0) {
  const videos = storeVideos;
  const initialIndex = videos.findIndex((v) => v.slug === slug);
  // render snap-scroll feed với list này
}

// Case 2: refresh / direct link
else {
  const { data: currentVideo } = useVideoBySlug(slug);
  // render chỉ video này
  // sau đó (optional) load all để lướt tiếp
}
```

---

## URL behavior

| Hành động         | URL                               | Store               |
| ----------------- | --------------------------------- | ------------------- |
| Click từ search   | `/video/du-lich-mien-bac`         | có list             |
| Lướt xuống        | `/video/du-lich-mien-nam-can-tho` | có list             |
| Refresh           | `/video/du-lich-mien-nam-can-tho` | rỗng → gọi API slug |
| Back → search lại | store ghi đè list mới             |                     |

---

## Confirmed

- [x] API list `GET /video` trả về field `slug` trong mỗi item ✅
- [x] Khi refresh: gọi GET /video/{slug} lấy video hiện tại → render 1 video, đồng thời load infinite list để lướt tiếp ✅
