---
stepsCompleted: [1, 2, 3]
inputDocuments: []
session_topic: 'Thumbnail làm hình ảnh cover trước khi phát video trong DetailSearchPage'
session_goals: 'Trải nghiệm UX mượt mà — người dùng thấy hình ảnh ngay lập tức thay vì màn hình trống/loading'
selected_approach: 'ai-recommended'
techniques_used: ['SCAMPER Method']
ideas_generated: [40]
context_file: ''
---

# Brainstorming Session Results

**Facilitator:** User
**Date:** 2026-02-27

## Session Overview

**Topic:** Thumbnail làm hình ảnh cover trước khi phát video trong DetailSearchPage
**Goals:** Trải nghiệm UX mượt mà — người dùng thấy hình ảnh ngay lập tức thay vì màn hình trống/loading

## Top Ideas để Thực Thi

### Nhóm Core (Ưu tiên cao)

- **#1 The Classic Poster** — `<video poster="thumbnailUrl">` native HTML5
- **#3 Scroll-Triggered Swap** — thumbnail hiện ngay khi vào viewport, crossfade 150ms khi canplay
- **#11 The Synchronized Gate** — giữ thumbnail cho đến khi cả 4 video canplay, phát đồng loạt
- **#13 Timeout Fallback** — nếu sau X giây vẫn có video chưa ready thì tự phát
- **#30 Paused-State Return** — khi scroll ra viewport, video pause + thumbnail fade trở lại

### Nhóm Visual Polish

- **#9 Speaker-on-Thumbnail** — icon loa render ngay trên thumbnail trước khi video play
- **#15 Blur-to-Sharp** — thumbnail blur → sharp trong 200ms khi decode
- **#18 Scale-Up Entry** — 4 thumbnail scale 0.97→1.0 đồng loạt trước khi video bắt đầu
- **#23 Dark Gradient Footer** — gradient tối phía dưới thumbnail để icon readable
- **#25 Sync Progress Ring** — ring nhỏ ở góc mỗi thumbnail báo progress buffer

### Nhóm Performance

- **#14 Preemptive Batch Load** — prefetch batch tiếp theo khi đang xem batch hiện tại
- **#26 Network-Adaptive Thumbnail** — full-res / blur / color swatch tùy connection speed
- **#31 Batch-Aware Preload** — prefetch thumbnails batch 2, 3 trong khi xem batch 1
- **#28 Skeleton-Before-Thumbnail** — skeleton → thumbnail → video, không có nền trắng

### Nhóm UX mở rộng

- **#27 Error State Thumbnail** — thumbnail ở lại với "Thử lại" khi video fail
- **#32 Reduced Motion Respect** — tắt animation khi prefers-reduced-motion
- **#40 Offline Cached Preview** — cache thumbnails để feed hiển thị khi mất mạng
