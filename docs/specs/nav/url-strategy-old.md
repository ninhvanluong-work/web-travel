---
title: 'Chiến lược URL cho VideoDetailPage (cũ)'
created: '2026-03-04'
status: 'superseded'
domain: 'nav'
superseded_by: 'slug-store.md'
---

> ⚠️ **SUPERSEDED** — Xem [`slug-store.md`](./slug-store.md) (phương án đã chốt).

# Spec: Chiến lược URL cho VideoDetailPage

**Ngày tạo:** 2026-03-04
**Trạng thái:** Đang thảo luận

---

## Vấn đề gốc

URL hiện tại khi navigate từ search sang video detail quá dài:

```
/video/37418d9b-cae4-42ab-ba36-65a0893e6d33?ids=9b080bff-de62-4055-b67b-09844c6f5a8e,bda9898b-f4ab-401c-8b18-144af6380c43,...
```

~600+ ký tự — xấu, khó share, dễ bị cắt.

---

## Các giải pháp đã thảo luận

### Giải pháp A — SessionStorage (đã implement)

Lưu ids vào `sessionStorage` khi click, không đưa lên URL.

```
URL: /video/37418d9b-cae4-42ab-ba36-65a0893e6d33
```

| Tiêu chí             | Kết quả                                 |
| -------------------- | --------------------------------------- |
| URL ngắn             | ✅ Chỉ còn UUID                         |
| Navigation từ search | ✅ Giữ đúng thứ tự playlist             |
| Share link           | ⚠️ Mất playlist → fallback về allVideos |
| Cần backend          | ❌ Không                                |
| Độ phức tạp          | Thấp                                    |

**Fallback allVideos là gì:** Khi user B mở link được share, `sessionStorage` trống → VideoDetailPage hiển thị toàn bộ 20 video thay vì đúng playlist của user A. Video được share vẫn hiện đúng, nhưng context xung quanh khác.

---

### Giải pháp B — Slug

Thay UUID bằng slug readable trong URL path.

```
URL: /video/du-lich-mien-bac-moc-chau
```

| Tiêu chí             | Kết quả                                |
| -------------------- | -------------------------------------- |
| URL ngắn             | ✅ Readable                            |
| SEO                  | ✅ Tốt hơn UUID                        |
| Navigation từ search | ⚠️ Vẫn cần sessionStorage cho playlist |
| Share link           | ⚠️ Vẫn fallback allVideos (giống A)    |
| Cần backend          | ✅ Phải thêm `slug` field vào API      |
| Độ phức tạp          | Trung bình                             |

**Slug có cần base64 không:**

- Slug dùng cho **path** (`/video/ten-video`) → không cần base64, chỉ là text đọc được
- base64 chỉ liên quan nếu muốn encode **ids list** vào URL param
- Kết luận: **Slug không dùng base64**

**Vấn đề slug chưa unique:** API không có `slug` field, chỉ có `name`. Generate slug từ `name` có thể trùng:

- "Du lịch Miền Bắc - Mộc Châu" → `du-lich-mien-bac-moc-chau`
- Nếu có 2 video cùng tên → conflict
- Fix: thêm ID suffix ngắn → `du-lich-mien-bac-moc-chau--37418d9b`

---

### Giải pháp C — Slug + SessionStorage (kết hợp)

```
URL: /video/du-lich-mien-bac-moc-chau--37418d9b
```

Giải quyết cả hai vấn đề độc lập:

- Slug → URL đẹp, SEO
- SessionStorage → playlist context khi navigate từ search

| Tiêu chí             | Kết quả                   |
| -------------------- | ------------------------- |
| URL ngắn & đẹp       | ✅                        |
| SEO                  | ✅                        |
| Navigation từ search | ✅                        |
| Share link           | ⚠️ Vẫn fallback allVideos |
| Cần backend          | ✅ Backend thêm `slug`    |
| Độ phức tạp          | Trung bình                |

---

### Giải pháp D — Slug + ids base64 binary (fix share link)

Nếu muốn share link giữ nguyên playlist context:

```
URL: /video/du-lich-mien-bac-moc-chau--37418d9b?p=m7A3kK...
```

**Cơ chế base64 binary:**

- Pack UUID (128-bit) thành binary thay vì text
- 16 UUIDs × 16 bytes = 256 bytes → base64url → **~342 ký tự**
- So với text gốc: 591 ký tự → giảm **42%**

```
Text:   9b080bff-de62-4055-... (591 chars)
Base64: 9b080bffde62...binary...base64url (~342 chars)
```

| Tiêu chí                | Kết quả                              |
| ----------------------- | ------------------------------------ |
| URL ngắn                | ⚠️ Ngắn hơn 42% nhưng vẫn ~342 chars |
| Share link giữ playlist | ✅                                   |
| Cần backend             | ✅ Backend thêm `slug`               |
| Độ phức tạp             | Cao (encode/decode binary UUID)      |

> **Lưu ý quan trọng:** base64 của **text** sẽ DÀI HƠN (~33%). Chỉ base64 của **binary** mới ngắn hơn. Dùng `btoa(ids.join(','))` thẳng là SAI — sẽ từ 591 → 788 ký tự.

---

## So sánh tổng hợp

|                         | A — Session | B — Slug | C — Slug+Session | D — Slug+Base64 |
| ----------------------- | :---------: | :------: | :--------------: | :-------------: |
| URL ngắn                |     ✅      |    ✅    |        ✅        |       ⚠️        |
| URL đẹp/SEO             |     ❌      |    ✅    |        ✅        |       ✅        |
| Playlist khi navigate   |     ✅      |    ⚠️    |        ✅        |       ✅        |
| Share link giữ playlist |     ❌      |    ❌    |        ❌        |       ✅        |
| Cần backend             |     ❌      |    ✅    |        ✅        |       ✅        |
| Độ phức tạp             |    Thấp     |    TB    |        TB        |       Cao       |

---

## Quyết định

- [ ] Chấp nhận A (sessionStorage, đã có) — share link fallback allVideos là OK
- [ ] Làm thêm B/C — yêu cầu backend thêm `slug` field
- [ ] Làm D — fix triệt để share link, nhưng phức tạp

---

## Yêu cầu backend nếu chọn B/C/D

Thêm field `slug` vào bảng video:

```json
{
  "id": "37418d9b-...",
  "slug": "du-lich-mien-bac-moc-chau",
  "name": "Du lịch Miền Bắc - Mộc Châu",
  ...
}
```

API cần thêm endpoint lookup theo slug:

```
GET /video/by-slug/:slug
```
