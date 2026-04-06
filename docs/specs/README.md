# docs/specs — Index

Spec tính năng của **web-travel**, tổ chức theo màn hình / domain.

> Template: [`_template.md`](./_template.md)

---

## Cấu trúc thư mục

```
docs/specs/
  homepage/       ← trang chủ
  search/         ← tìm kiếm, suggest
  video-grid/     ← DetailSearchPage (lưới video)
  video-detail/   ← VideoDetailPage (feed TikTok)
  ios/            ← iOS-specific behaviors
  nav/            ← URL, routing, navigation giữa trang
  infra/          ← CORS, proxy, env
  _template.md
  README.md  (file này)
```

---

## Cách tạo spec mới

1. Xác định màn hình / domain → vào đúng subfolder
2. Đặt tên file: `<tính-năng-ngắn-gọn>.md` (không cần prefix domain vì folder đã nói lên điều đó)
3. Copy từ `_template.md`, điền frontmatter đầy đủ
4. Thêm 1 dòng vào bảng tương ứng trong README này

**Naming examples:**

| Sai ❌                                   | Đúng ✅                             |
| ---------------------------------------- | ----------------------------------- |
| `video-grid/video-grid-single-audio.md`  | `video-grid/single-audio-source.md` |
| `video-detail/spec-video-detail-info.md` | `video-detail/info-overlay.md`      |
| `ios/spec-ios-shared-video-pool.md`      | `ios/shared-video-pool.md`          |

---

## Status Legend

| Icon | Status        | Ý nghĩa                        |
| ---- | ------------- | ------------------------------ |
| ✅   | `implemented` | Đã implement xong              |
| 📝   | `draft`       | Đang soạn / chờ review         |
| ❌   | `superseded`  | Bị thay thế — đọc file mới     |
| 📚   | `reference`   | Tài liệu tham khảo / phân tích |

---

## 🏠 homepage/

| File                                                              | Tính năng                              | Status |
| ----------------------------------------------------------------- | -------------------------------------- | ------ |
| [mobile-fix.md](./homepage/mobile-fix.md)                         | Video full-edge + bàn phím đẩy layout  | ✅     |
| [searchbox-keyboard-fix.md](./homepage/searchbox-keyboard-fix.md) | SearchBox không bị đẩy khi keyboard mở | ✅     |

---

## 🔍 search/

| File                                          | Tính năng                      | Status |
| --------------------------------------------- | ------------------------------ | ------ |
| [suggest-click.md](./search/suggest-click.md) | Bấm chip suggest → search ngay | ✅     |

---

## 📋 video-grid/

| File                                                                  | Tính năng                                      | Status | Notes                  |
| --------------------------------------------------------------------- | ---------------------------------------------- | ------ | ---------------------- |
| [detail-search-page.md](./video-grid/detail-search-page.md)           | White blur + submit behavior + suggestions UI  | ✅     |                        |
| [single-audio-source.md](./video-grid/single-audio-source.md)         | Chỉ 1 video có âm thanh cùng lúc               | ✅     |                        |
| [dim-effect-audio-active.md](./video-grid/dim-effect-audio-active.md) | Dim các card khác khi 1 card đang phát         | ✅     |                        |
| [infinite-scroll.md](./video-grid/infinite-scroll.md)                 | Cursor-based infinite scroll (`distanceScore`) | ✅     | Supersedes cũ bên dưới |
| [infinite-scroll-old.md](./video-grid/infinite-scroll-old.md)         | Infinite scroll page-based (cũ)                | ❌     | → `infinite-scroll.md` |

---

## 🎬 video-detail/

| File                                                          | Tính năng                                            | Status | Notes                             |
| ------------------------------------------------------------- | ---------------------------------------------------- | ------ | --------------------------------- |
| [feed-tiktok.md](./video-detail/feed-tiktok.md)               | TikTok-style snap-scroll feed — spec gốc             | ✅     | Base spec                         |
| [play-button.md](./video-detail/play-button.md)               | Play overlay khi autoplay bị chặn                    | ✅     |                                   |
| [improvements.md](./video-detail/improvements.md)             | Auto-audio khi scroll + text layout + like count fix | ✅     | Supersedes cũ bên dưới            |
| [info-overlay.md](./video-detail/info-overlay.md)             | Glassmorphism info box + description truncate        | ✅     |                                   |
| [like-dislike.md](./video-detail/like-dislike.md)             | Like/Dislike API + Optimistic UI + debounce          | ✅     |                                   |
| [shorturl-likecount.md](./video-detail/shorturl-likecount.md) | Grid dùng `shortUrl`, Detail hiển thị like count     | ✅     |                                   |
| [safe-area.md](./video-detail/safe-area.md)                   | Safe area — UI bị che trên màn hình lớn              | ✅     |                                   |
| [performance.md](./video-detail/performance.md)               | Phân tích frontend loading & preload strategy        | 📚     |                                   |
| [auto-unmute-old.md](./video-detail/auto-unmute-old.md)       | Auto-unmute on scroll (draft cũ)                     | ❌     | → `improvements.md`               |
| [iframe-embed-old.md](./video-detail/iframe-embed-old.md)     | Migration native → iframe (hướng bị bỏ)              | ❌     | → `../ios/autoplay-native-hls.md` |

---

## 📱 ios/

| File                                                   | Tính năng                                          | Status | Notes                    |
| ------------------------------------------------------ | -------------------------------------------------- | ------ | ------------------------ |
| [shared-video-pool.md](./ios/shared-video-pool.md)     | Shared Video Element Pool — **kiến trúc hiện tại** | ✅     | Current architecture     |
| [autoplay-native-hls.md](./ios/autoplay-native-hls.md) | Hành trình iframe → Native HLS (Bunny Direct Play) | 📚     | Giải thích "tại sao"     |
| [autoplay-old.md](./ios/autoplay-old.md)               | iOS autoplay — phân tích vấn đề gốc                | ❌     | → `shared-video-pool.md` |

---

## 🔗 nav/

| File                                                   | Tính năng                                           | Status | Notes                             |
| ------------------------------------------------------ | --------------------------------------------------- | ------ | --------------------------------- |
| [slug-store.md](./nav/slug-store.md)                   | Slug URL + Zustand store danh sách từ search        | ✅     |                                   |
| [slug-store-analysis.md](./nav/slug-store-analysis.md) | Phân tích edge cases của slug store                 | 📚     | Companion cho `slug-store.md`     |
| [from-search.md](./nav/from-search.md)                 | Navigation từ Search → Detail + infinite scroll mới | 📝     | Extends `slug-store.md`           |
| [popup.md](./nav/popup.md)                             | Detail Page dạng full-screen popup (thay navigate)  | 📝     | ⚠️ Conflicts với `from-search.md` |
| [url-strategy-old.md](./nav/url-strategy-old.md)       | Chiến lược URL — thảo luận ban đầu                  | ❌     | → `slug-store.md`                 |

---

## ⚙️ infra/

| File                                   | Tính năng                         | Status |
| -------------------------------------- | --------------------------------- | ------ |
| [cors-proxy.md](./infra/cors-proxy.md) | CORS fix bằng Next.js Proxy route | ✅     |

---

## Superseded Chain

```
iOS Autoplay:
  ios/autoplay-old.md → ios/autoplay-native-hls.md (📚 hành trình)
                      → ios/shared-video-pool.md ✅ CURRENT

Video Grid — Infinite Scroll:
  video-grid/infinite-scroll-old.md → video-grid/infinite-scroll.md ✅ CURRENT

Navigation / URL:
  nav/url-strategy-old.md → nav/slug-store.md ✅ CURRENT

Video Detail — Auto Audio:
  video-detail/auto-unmute-old.md → video-detail/improvements.md ✅ CURRENT

Video Detail — Player:
  video-detail/iframe-embed-old.md → ios/autoplay-native-hls.md (📚) → ios/shared-video-pool.md ✅ CURRENT
```

---

## Open Conflicts

| Files                                  | Vấn đề                                           |
| -------------------------------------- | ------------------------------------------------ |
| `nav/from-search.md` vs `nav/popup.md` | Hai hướng UX khi mở video từ search — cần chốt 1 |

---

## Protected Behaviors

Không được thay đổi khi implement spec mới:

| Behavior                                                   | Spec nguồn                          |
| ---------------------------------------------------------- | ----------------------------------- |
| `forcePause` / reload gate — user phải tap Play sau reload | `video-detail/play-button.md`       |
| Shared video pool iOS — không tạo `<video>` ngoài pool     | `ios/shared-video-pool.md`          |
| `activeAudioId` lift state — tối đa 1 card unmuted         | `video-grid/single-audio-source.md` |
| IntersectionObserver 80% threshold + URL update shallow    | `video-detail/feed-tiktok.md`       |
