---
title: '[Tên tính năng ngắn gọn]'
created: 'YYYY-MM-DD'
status: 'draft'
# Status options: draft | implemented | superseded | reference
domain: '[video-detail | video-grid | homepage | search | nav | ios | infra]'
# Nếu file này supersede file khác:
# supersedes: 'tên-file-cũ.md'
# Nếu file này bị supersede:
# superseded_by: 'tên-file-mới.md'
# Nếu có quan hệ với file khác:
# related: 'tên-file.md'
# conflicts_with: 'tên-file.md'
---

<!--
VỊ TRÍ LƯU FILE: docs/specs/<domain>/<tính-năng>.md
  homepage/     → trang chủ
  search/       → tìm kiếm, suggest
  video-grid/   → DetailSearchPage
  video-detail/ → VideoDetailPage
  ios/          → iOS-specific
  nav/          → URL, routing, navigation
  infra/        → CORS, proxy, env

TÊN FILE: <tính-năng-ngắn-gọn>.md  (không prefix domain — folder đã nói lên điều đó)
  ✅ info-overlay.md
  ✅ slug-store.md
  ❌ spec-video-detail-info.md
  ❌ video-grid-single-audio.md
-->

# Spec: [Tên tính năng]

## 1. Vấn đề / Mục tiêu

> Mô tả ngắn gọn: tại sao cần làm, hiện trạng đang tệ ở đâu.

---

## 2. Hành vi mong muốn

> Mô tả behavior cuối cùng theo dạng user-story hoặc bảng trạng thái.

| Hành động | Kết quả mong đợi |
| --------- | ---------------- |
| ...       | ...              |

---

## 3. Thay đổi kỹ thuật

> Liệt kê file nào thay đổi, thêm gì, bỏ gì.

| File      | Thay đổi |
| --------- | -------- |
| `src/...` | ...      |

---

## 4. Dependencies & Conflicts ← PHẦN BẮT BUỘC

> Điền đầy đủ trước khi approve. Nếu không có thì ghi "None".

- **Depends on:** [spec nào phải implement trước]
- **Modifies:** [component / hook / store nào bị thay đổi logic]
- **Must NOT break:** [behavior nào phải giữ nguyên — tham chiếu Protected Behaviors trong INDEX.md]
- **Conflicts with:** [spec nào đang draft mà có thể đá nhau]

---

## 5. Out of scope

> Những gì cố tình KHÔNG làm trong spec này.

---

## 6. Open questions

> Những điểm chưa quyết định. Xóa section này khi đã resolve hết trước approve.
