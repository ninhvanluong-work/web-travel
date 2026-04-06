---
title: 'VideoDetailPage — Full-screen Popup từ DetailSearchPage'
created: '2026-03-15'
status: 'draft'
domain: 'nav'
conflicts_with: 'from-search.md'
---

# Spec: VideoDetailPage — Full-screen Popup từ DetailSearchPage

## Bối cảnh & Vấn đề

Hiện tại khi user click vào video trong **DetailSearchPage** (trang `/search`), app thực hiện `router.push('/video/${id}?ids=...')` — tức là **navigate sang trang mới** `/video/[id]`.

User đề xuất: chuyển sang hiển thị **VideoDetailPage** dưới dạng **full-screen popup/overlay** ngay trên nền DetailSearchPage, không navigate trang mới.

---

## Phân tích kiến trúc hiện tại

```
MainLayout
└── fixed container: max-w-[430px] h-[100dvh]   ← mobile-first viewport
     └── <main>
           ├── /search  → DetailSearchPage        ← VideoGrid + VideoCard
           └── /video/[id] → VideoDetailPage      ← VideoSlide (snap scroll)
```

App chạy theo mô hình **mobile app** (màn hình cố định `430px`, full-height `dvh`), rất gần với UX của TikTok / Instagram Reels.

---

## Đánh giá: Popup có hợp lý không?

### ✅ Lý do nên dùng Popup

| Điểm mạnh                  | Giải thích                                                                                                        |
| -------------------------- | ----------------------------------------------------------------------------------------------------------------- |
| **UX mượt mà**             | Không bị flash chuyển trang, chuyển tiếp bằng animation slide-up / fade-in                                        |
| **Giữ lại context**        | Khi đóng popup, user quay về đúng vị trí scroll trên grid tìm kiếm                                                |
| **Không reload data**      | Video list đã có sẵn trong memory (React Query cache), không cần fetch lại                                        |
| **Phù hợp mobile pattern** | Instagram, TikTok, YouTube Shorts đều dùng overlay thay vì navigate                                               |
| **URL vẫn cập nhật**       | Có thể dùng `router.push` shallow hoặc `history.pushState` để cập nhật URL khi popup mở, giúp deep-link hoạt động |

### ⚠️ Điểm cần lưu ý

| Rủi ro                          | Giải pháp                                                                                                                             |
| ------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------- |
| **Back button**                 | Khi nhấn back vật lý trên mobile, popup phải đóng (không navigate ra ngoài) → cần handle `popstate` hoặc dùng Next.js shallow routing |
| **Deep link vào `/video/[id]`** | Vẫn cần giữ page `/video/[id]` hoạt động độc lập (khi user truy cập URL trực tiếp) → VideoDetailPage làm cả 2 vai trò                 |
| **Z-index stacking**            | Popup phải nằm trên SearchInput sticky và tất cả UI khác                                                                              |
| **Video autoplay**              | Video trong grid đang play → cần pause khi popup mở                                                                                   |

---

## Phương án đề xuất

### Cách 1 — Overlay trong DetailSearchPage _(Khuyến nghị)_

Thêm state `activeVideoId` vào `DetailSearchPage`. Khi click vào card, render `VideoDetailPage` như một `<div>` phủ toàn màn hình bên trong container hiện tại.

```
DetailSearchPage
  ├── SearchInput (sticky)
  ├── VideoGrid
  │     └── VideoCard → onClick → set activeVideoId
  └── {activeVideoId && (
        <div className="absolute inset-0 z-50 animate-slide-up">
          <VideoDetailPage (embedded) />
        </div>
      )}
```

**Ưu điểm:** Đơn giản, không cần thay đổi routing, video list đã có sẵn.

---

### Cách 2 — Next.js Parallel Routes / Intercepting Routes _(Phức tạp hơn)_

Dùng tính năng Intercepting Routes của Next.js App Router (chỉ áp dụng nếu migrate sang App Router).

> [!WARNING]
> Project hiện dùng **Pages Router** (`src/pages/`). Cách này yêu cầu migrate sang App Router — không khuyến nghị ở giai đoạn hiện tại.

---

## Hướng implementation chi tiết (Cách 1)

### State management

```ts
// DetailSearchPage/index.tsx
const [activeVideoId, setActiveVideoId] = useState<string | null>(null);
```

### VideoGrid nhận thêm callback

```tsx
<VideoGrid videos={videos} onVideoClick={(id) => setActiveVideoId(id)} />
```

### Popup overlay

```tsx
{
  activeVideoId && (
    <div className="absolute inset-0 z-50 bg-black animate-slide-up">
      <VideoDetailPage
        videoId={activeVideoId}
        videoIds={videos.map((v) => v.id)}
        onClose={() => setActiveVideoId(null)}
      />
    </div>
  );
}
```

### VideoDetailPage nhận props (embedded mode)

```ts
interface Props {
  videoId?: string; // dùng khi embedded
  videoIds?: string[]; // danh sách ids để scroll
  onClose?: () => void; // callback đóng popup
}
```

Khi `onClose` được truyền vào → nút back gọi `onClose()` thay vì `router.back()`.

### URL update (optional, để deep-link vẫn hoạt động)

```ts
// Khi popup mở
router.push(`/video/${id}?ids=${idsParam}`, undefined, { shallow: true });

// Khi popup đóng
router.push('/search', undefined, { shallow: true });
```

---

## Files sẽ ảnh hưởng

| File                                        | Thay đổi                                                           |
| ------------------------------------------- | ------------------------------------------------------------------ |
| `DetailSearchPage/index.tsx`                | Thêm state `activeVideoId`, render popup overlay                   |
| `DetailSearchPage/components/VideoGrid.tsx` | Đổi `handleVideoClick` thành callback prop                         |
| `VideoDetailPage/index.tsx`                 | Hỗ trợ thêm props `videoId`, `videoIds`, `onClose` (embedded mode) |

> [!NOTE]
> Page `/video/[id]` vẫn giữ nguyên — VideoDetailPage vẫn hoạt động độc lập khi truy cập URL trực tiếp.

---

## Câu hỏi thảo luận

1. **Animation**: Popup nên slide-up từ dưới lên (như iOS share sheet) hay fade-in?
2. **Back button mobile**: Có cần handle nút back vật lý để đóng popup không?
3. **URL**: Có cần update URL khi popup mở không (để share link vẫn dùng được)?
4. **Video trong grid**: Khi popup mở, VideoCard đang play có nên pause không?
