# Spec: Fix Homepage Mobile Issues

**Date:** 2026-02-26  
**Status:** Ready for implementation

---

## Problem Statement

Hai lỗi trên màn hình Homepage (mobile-only app):

1. **Video không full viền** — Xuất hiện viền đen 2 bên / video không edge-to-edge trên các màn hình điện thoại.
2. **Bàn phím iPhone đẩy content lên** — Khi tap vào SearchBox, bàn phím iOS xuất hiện và đẩy toàn bộ layout (kể cả video background) lên trên một cách bất thường.

---

## Bug 1: Video không full viền (Viền đen)

### Root Cause

`MainLayout.tsx` hiện dùng:

```tsx
<div className="bg-slate-900 flex justify-center items-center min-h-screen">
  <div className="container relative h-[100vh] ... overflow-hidden">
```

- `container` → Tailwind giới hạn `max-width` + padding ngang → video không edge-to-edge
- `bg-slate-900` → nền đen lộ ra hai bên khi container nhỏ hơn viewport

### Fix

**File:** `src/components/layouts/MainLayout/MainLayout.tsx`

```diff
- <div className="bg-slate-900 flex justify-center items-center min-h-screen">
-   <div className="container relative h-[100vh] supports-[height:100dvh]:h-[100dvh] min-[768px]:h-[850px] bg-white shadow-2xl overflow-hidden pointer-events-auto">
-     <main className="h-full overflow-hidden scrollbar-hide">{children}</main>

+ <div className="w-full">
+   <div className="relative w-full h-[100dvh] overflow-hidden">
+     <main className="h-full overflow-hidden scrollbar-hide">{children}</main>
```

**Thay đổi:**

- Xoá `container` → `w-full` (full width, không giới hạn)
- Xoá `bg-slate-900` → không còn viền đen
- Xoá `min-[768px]:h-[850px]` → không cần desktop breakpoint (app mobile-only)
- Thay `h-[100vh]` → `h-[100dvh]` (xem Bug 2)

---

## Bug 2: Bàn phím iPhone đẩy content lên

### Root Cause

Đây là lỗi cổ điển trên **iOS Safari**. Khi bàn phím ảo xuất hiện:

1. `100vh` **không thay đổi** trên iOS — viewport height cũ vẫn giữ nguyên
2. Safari tự **scroll trang lên** để giữ phần tử `input` được focus luôn nhìn thấy
3. Vì container dùng `overflow-hidden`, toàn bộ layout bị cuộn theo → **video + mọi thứ bị đẩy lên**

### Fix — 2 bước kết hợp

#### Bước 1: Dùng `100dvh` trong `MainLayout.tsx`

_(Đã gộp chung với Bug 1 ở trên)_

`dvh` = **Dynamic Viewport Height** — tự co lại khi bàn phím xuất hiện, thay vì bị scroll.  
Support: iOS Safari 15.4+, Android Chrome 108+.

#### Bước 2: Thêm `interactive-widget` vào meta viewport

**File:** `src/pages/_document.tsx` (hoặc `_app.tsx`)

```diff
- <meta name="viewport" content="width=device-width, initial-scale=1" />
+ <meta
+   name="viewport"
+   content="width=device-width, initial-scale=1, viewport-fit=cover, interactive-widget=resizes-content"
+ />
```

`interactive-widget=resizes-content` → báo browser **resize layout** khi keyboard mở, thay vì scroll page.

---

## Files Affected

| File                                               | Thay đổi                                   |
| -------------------------------------------------- | ------------------------------------------ |
| `src/components/layouts/MainLayout/MainLayout.tsx` | Xoá `container`, `bg-slate-900`, fix `dvh` |
| `src/pages/_document.tsx` hoặc `_app.tsx`          | Thêm `interactive-widget` meta tag         |

---

## Verification

| Test                                               | Kỳ vọng                                          |
| -------------------------------------------------- | ------------------------------------------------ |
| Mở app trên Chrome DevTools → iPhone 14 Pro        | Video full-edge, không còn viền đen              |
| Thử các device preset khác (iPhone SE, Galaxy S20) | Video full-edge ở mọi size                       |
| Tap SearchBox trên iPhone thật (iOS Safari)        | Bàn phím mở, video đứng yên, layout không bị đẩy |
| Tap ra ngoài SearchBox                             | Bàn phím đóng, layout trở về bình thường         |

> **Lưu ý:** Bug 2 cần test trên iPhone thật hoặc Xcode Simulator vì Chrome DevTools không giả lập bàn phím ảo iOS.
