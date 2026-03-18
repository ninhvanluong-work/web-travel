# Spec: Video Detail - Info Overlay Update (Title & Description Box)

## 1. Overview

Update `VideoSlide` component (`src/modules/VideoDetailPage/components/video-slide.tsx`): bọc title + description trong glassmorphism box, và thêm truncate "xem thêm" cho description dài.

## 2. Requirements

- **Info Box:** Bọc `title` và `description` trong box glassmorphism.
- **Description Truncation:** Giới hạn description ở 30 ký tự khi hiển thị lần đầu.
- **"xem thêm":** Nếu description > 30 ký tự, append `... xem thêm` — chỉ hiển thị text, **chưa có action** (navigation sẽ được thêm sau khi Product page hoàn thiện).

## 3. Implementation Details

Target: `src/modules/VideoDetailPage/components/video-slide.tsx`

### Bước 1 — Bọc info overlay trong glassmorphism box

Tìm container hiện tại (dòng 97–104):

```tsx
<div
  className="absolute bottom-0 left-0 right-[72px] px-[18px] animate-fade-up"
  style={{ paddingBottom: 'calc(28px + env(safe-area-inset-bottom, 0px))' }}
>
```

Thêm wrapper bên trong:

```tsx
<div
  className="absolute bottom-0 left-0 right-[72px] px-[18px] animate-fade-up"
  style={{ paddingBottom: 'calc(28px + env(safe-area-inset-bottom, 0px))' }}
>
  <div className="bg-black/30 border border-white/[0.15] backdrop-blur-md rounded-xl p-3">
    <h2 className="text-white font-dinpro font-bold text-[18px] leading-[1.3] drop-shadow-md">{video.title}</h2>
    <p className="text-white/70 font-dinpro font-normal text-[13px] mt-[6px] leading-[1.5] drop-shadow-sm">
      {displayDesc}
      {isLongDesc && <span className="font-bold text-white ml-1 text-[13px] font-dinpro">... xem thêm</span>}
    </p>
  </div>
</div>
```

### Bước 2 — Logic truncate description

Thêm 2 biến trước `return`:

```tsx
const maxLength = 30;
const isLongDesc = video.description && video.description.length > maxLength;
const displayDesc = isLongDesc ? video.description.slice(0, maxLength) : video.description;
```

## 4. Styling Specification

```
bg-black/30              — nền bán trong suốt 30%
border border-white/[0.15] — viền mờ nhẹ (khớp glass variant trong button.tsx)
backdrop-blur-md         — blur vừa
rounded-xl               — bo góc 12px
p-3                      — padding 12px
```

## 5. Notes

- **"xem thêm" chưa có onClick** — sẽ được nối vào `/product?videoSlug={video.slug}` sau khi Product page hoàn thiện.
- Không dùng i18n — hardcode `"xem thêm"` (toàn app không có `useTranslation`).
- Bỏ `line-clamp-3` ở `<p>` vì đã tự xử lý truncate bằng logic JS.

## 6. Future: Navigation (chưa implement)

Khi Product page sẵn sàng, thêm vào `span`:

```tsx
onClick={() => router.push({ pathname: ROUTE.PRODUCT, query: { videoSlug: video.slug } })}
```

Domain model phía sau: `Video → Tour[] → Option[]` (1 video nhiều tour, 1 tour nhiều option).
