---
title: 'Video Detail Info Box - Resolve Open Questions & Finalize Spec'
slug: 'video-detail-info-box'
created: '2026-03-18'
status: 'in-progress'
stepsCompleted: [1, 2, 3, 4]
tech_stack: ['Next.js 13 Pages Router', 'React', 'TypeScript', 'Tailwind CSS']
files_to_modify:
  - src/modules/VideoDetailPage/components/video-slide.tsx
  - src/types/routes.ts
  - src/pages/product.tsx
code_patterns: ['glassmorphism via Tailwind', 'Next.js router.push', 'hardcoded Vietnamese strings']
test_patterns: []
---

# Tech-Spec: Video Detail Info Box - Resolve Open Questions & Finalize Spec

**Created:** 2026-03-18

## Overview

### Problem Statement

Spec `docs/specs/spec-video-detail-info.md` có 3 điểm mơ hồ chặn implementation: (1) chưa biết route target cho "xem thêm", (2) chưa xác định styling glassmorphism box, (3) chưa rõ có dùng i18n không.

### Solution

Giải quyết từ phân tích code + tạo route `/product` placeholder. Cập nhật spec gốc với đáp án cụ thể, sẵn sàng cho dev implement ngay.

### Scope

**In Scope:**

- Tạo `/product` page placeholder (`src/pages/product.tsx`)
- Thêm `PRODUCT: '/product'` vào `src/types/routes.ts`
- Cập nhật spec gốc với 3 đáp án cụ thể (xoá section "Open Questions")

**Out of Scope:**

- Implement UI changes trong `video-slide.tsx` (đó là task của spec gốc)
- Phát triển nội dung trang `/product`

## Context for Development

### Codebase Patterns

- **Glassmorphism**: `button.tsx` định nghĩa `glass = 'bg-black/30 border border-white/[0.15] text-white backdrop-blur-md'` — dùng pattern này
- **Strings**: Không có `useTranslation`/`i18next` — toàn bộ strings hardcode tiếng Việt
- **Routing**: `src/types/routes.ts` là nơi tập trung routes, dùng `router.push(ROUTE.PRODUCT)`
- **Page pattern**: Pages trong `src/pages/` là thin wrappers, logic ở `src/modules/`

### Files to Reference

| File                                                     | Purpose                          |
| -------------------------------------------------------- | -------------------------------- |
| `src/components/ui/button.tsx`                           | Glassmorphism variants đang dùng |
| `src/types/routes.ts`                                    | Route constants                  |
| `src/modules/VideoDetailPage/components/video-slide.tsx` | Component cần modify             |

### Technical Decisions

- "xem thêm" navigate đến `/product` (placeholder), không expand in-place — theo yêu cầu PM
- Dùng `router.push(ROUTE.PRODUCT)` thay vì hardcode string route

## Implementation Plan

### Tasks

_(Được điền ở Step 3)_

### Acceptance Criteria

_(Được điền ở Step 3)_

## Additional Context

### Dependencies

- Route `/product` phải tồn tại trước khi deploy

### Testing Strategy

Manual testing trên mobile viewport (max 430px).

### Notes

Trang `/product` là placeholder — chỉ cần render một UI tối giản, không cần logic.
