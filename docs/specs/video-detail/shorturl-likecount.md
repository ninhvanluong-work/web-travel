---
title: 'Video Grid — shortUrl & Video Detail — Like Count'
created: '2026-03-10'
status: 'implemented'
domain: 'video-core'
---

# Spec: Video Grid — shortUrl & Video Detail — Like Count

## Bối cảnh

Người dùng muốn:

1. **VideoGrid** (trang search) dùng `shortUrl` để preview video thay vì `url` đầy đủ
2. **VideoDetailPage** khi click vào card, phát full `url` và hiển thị số lượt **like**

---

## API Response thực tế

`GET /video` → `data.data.items[]`

```json
{
  "id": "94a74157-...",
  "url": "https://.../OUR WORLD.mp4",
  "shortUrl": "https://.../short video/video2.mp4",
  "thumbnail": "https://.../Img/anh10.jpg",
  "name": "Du lịch Miền Bắc - Hạ Long",
  "description": "Chiêm ngưỡng vẻ đẹp...",
  "tag": null,
  "like": 5231,
  "score": 0.19
}
```

| Field      | Type      | Ghi chú                                             |
| ---------- | --------- | --------------------------------------------------- |
| `url`      | `string`  | Full video URL — dùng cho VideoDetailPage           |
| `shortUrl` | `string`  | Short/compressed video — dùng cho VideoGrid preview |
| `like`     | `number`  | Số lượt thích                                       |
| `score`    | `number?` | Relevance score từ search                           |

---

## Luồng hoạt động

```
DetailSearchPage (VideoGrid)
  └── VideoCard
        ├── <video src={shortUrl}>   ← preview nhẹ, load nhanh
        └── onClick → /video/{id}?ids={all_ids}
              └── VideoDetailPage
                    └── VideoSlide
                          ├── <video src={link}>  ← full URL, chất lượng cao
                          └── likeCount hiển thị (formatCount)
```

---

## Các thay đổi đã thực hiện

### [`types.ts`](file:///d:/Remote/web-travel/src/api/video/types.ts)

```diff
 export interface IVideo {
   link: string;
+  shortUrl: string;
 }

 export interface ApiVideoItem {
   url: string;
+  shortUrl: string;
   like: number;
+  score?: number;
 }
```

### [`requests.ts`](file:///d:/Remote/web-travel/src/api/video/requests.ts)

```diff
 const toVideo = (item: ApiVideoItem): IVideo => ({
   link: item.url,
+  shortUrl: item.shortUrl,
 });
```

### [`VideoCard.tsx`](file:///d:/Remote/web-travel/src/modules/DetailSearchPage/components/VideoCard.tsx)

```diff
-<video src={video.link} .../>
+<video src={video.shortUrl} .../>
```

### [`video-slide.tsx`](file:///d:/Remote/web-travel/src/modules/VideoDetailPage/components/video-slide.tsx)

Không thay đổi — đã dùng `video.link` và hiển thị `likeCount` đúng:

```tsx
<video src={video.link} />
<span>{formatCount(likeCount)}</span>
```

---

## Kết quả

| Trang                   | Video source         | Like count  |
| ----------------------- | -------------------- | ----------- |
| DetailSearchPage (grid) | `shortUrl` ✅        | —           |
| VideoDetailPage         | `link` (full URL) ✅ | Hiển thị ✅ |
