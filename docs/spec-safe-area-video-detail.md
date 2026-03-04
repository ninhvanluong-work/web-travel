# Spec: Video Detail — UI Elements Bị Che Trên Điện Thoại Màn Hình Lớn

## Vấn đề

Trên màn hình lớn (iPhone Pro Max, Samsung S24 Ultra...), các phần tử **like, mute, title, description** bị che bởi navigation bar hệ thống (Android) hoặc home indicator (iOS).

## Root Cause (đã xác nhận)

`_document.tsx` **không có** `<meta name="viewport">` và **không có** `viewport-fit=cover`.

Khi thiếu `viewport-fit=cover`, trình duyệt **luôn trả về `env(safe-area-inset-bottom) = 0`**, khiến toàn bộ các `calc(Xpx + env(safe-area-inset-bottom, 0px))` trong `video-slide.tsx` không có tác dụng.

## Fix

### Fix 1 — Thêm meta viewport vào `_document.tsx` ⭐ (bắt buộc)

**File:** `src/pages/_document.tsx`

Thêm vào trong `<Head>`:

```html
<meta name="viewport" content="width=device-width, initial-scale=1, viewport-fit=cover" />
```

> Sau khi có `viewport-fit=cover`, `env(safe-area-inset-bottom)` sẽ trả về giá trị chính xác của thiết bị (~34px trên iPhone 14 Pro, ~24px trên Pixel 8).

### Fix 2 — Tăng nhẹ base-offset cho action bar (optional)

Sau Fix 1, nếu vẫn còn sát edge, điều chỉnh base constant trong `video-slide.tsx`:

| Phần tử                  | Hiện tại          | Đề xuất           |
| ------------------------ | ----------------- | ----------------- |
| Action bar (like + mute) | `24px + env(...)` | `16px + env(...)` |
| Info overlay             | `28px + env(...)` | `20px + env(...)` |

> Sau Fix 1, `env(safe-area-inset-bottom)` đã đủ — không cần cộng thêm base offset lớn thủ công.

---

## Không nên làm

- ❌ Hardcode `bottom: 100px` — sai trên iPhone SE / thiết bị không có gesture bar
- ❌ `padding-bottom` trên scroll container — phá snap scroll
- ❌ Dùng `h-dvh` để giải quyết — không liên quan đến safe-area insets

---

## Checklist

- [ ] Thêm `<meta name="viewport" content="..., viewport-fit=cover">` vào `_document.tsx`
- [ ] Test Chrome DevTools: chọn iPhone 14 Pro Max → "Show device frame" → xác nhận không bị che
- [ ] Test thiết bị thật Android (nếu có) để đảm bảo gesture bar không che nút
