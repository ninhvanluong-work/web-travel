---
title: 'View More Tours by Guide — Button & DetailSearchPage Integration'
created: '2026-06-16'
status: 'draft'
domain: 'guide-profile'
related: 'moments-grid.md'
---

# Spec: "Xem thêm tour của [Tên HDV]" → DetailSearchPage Video Grid

## 1. Vấn đề / Mục tiêu

### Hiện trạng

Trang cá nhân của Tour Guide (`GuideProfilePage`) hiển thị các thông tin về hướng dẫn viên: slogan, thống kê, đánh giá khách, khoảnh khắc tour, v.v. Tuy nhiên, **chưa có điểm dẫn người dùng sang xem toàn bộ danh sách video tour** mà hướng dẫn viên đó đã dẫn.

Trong khi đó, `DetailSearchPage` (`/search?q=...`) đã có sẵn màn hình tìm kiếm video với lưới 2 cột và infinite scroll — hoàn toàn có thể tái sử dụng để hiển thị video theo tên HDV.

### Vấn đề

- **Discovery Gap**: Người dùng không thể khám phá nhanh tất cả video của một HDV mà họ quan tâm chỉ từ trang profile.
- **Bỏ lỡ chuyển đổi (Conversion Miss)**: Khi người dùng thấy thích HDV, không có CTA (call-to-action) rõ ràng để xem thêm → giảm thời gian tương tác.
- **Tái sử dụng chưa tốt**: `DetailSearchPage` có thể lọc video theo `query`, nhưng chưa được tận dụng từ các module khác.

### Mục tiêu

1. Thêm nút **"Xem thêm tour của [Tên HDV]"** ở cuối `GuideProfilePage`.
2. Khi bấm nút này → điều hướng sang `DetailSearchPage` với query pre-filled là tên của HDV.
3. `DetailSearchPage` sẽ hiển thị toàn bộ danh sách video liên quan đến HDV đó.

---

## 2. Brainstorming theo BMAD Framework

### Phase 1: Divergent Thinking — "Nếu như..."

**Câu hỏi 1: Đặt button ở đâu trong GuideProfilePage?**

- **Nếu như** đặt trong `ActionBar` (cạnh "Đặt tour" + "Rate me")?
  - _Đánh giá_: ActionBar đã có 4 phần tử, thêm vào sẽ quá chật. Không phù hợp về ý nghĩa: ActionBar là CTA chính (book/rate/share), không phải navigation.
- **Nếu như** đặt cuối trang (sau `CareerTimeline`), ngay trước `div h-8` spacer?
  - _Đánh giá_: **Tối ưu nhất** — đây là vị trí "tổng kết" tự nhiên nhất. User đã xem toàn bộ profile → thấy nút → tò mò → bấm xem video. Flow tuyến tính, không gián đoạn.
- **Nếu như** đặt trong section `MomentsGrid` (cạnh "Xem tất cả khoảnh khắc")?
  - _Đánh giá_: Gây nhầm lẫn vì `MomentsGrid` là section chuyên biệt cho "khoảnh khắc". Button "Xem thêm tour" có scope rộng hơn (tất cả video của HDV).

**Câu hỏi 2: Cơ chế điều hướng — search query hay route mới?**

- **Nếu như** tạo route mới `/guide/[id]/videos` với một page riêng?
  - _Đánh giá_: Tốn effort cao, phải build page mới, API mới. Over-engineering cho scope này.
- **Nếu như** điều hướng sang `DetailSearchPage` với `?q=[tên HDV]`?
  - _Đánh giá_: **Tái sử dụng triệt để** — toàn bộ VideoGrid, infinite scroll, audio control, navigation stack đã hoạt động tốt. Chỉ cần 1 dòng `router.push`.
- **Nếu như** mở một Bottom Sheet mới giống `moments-grid.tsx` nhưng chứa lưới video?
  - _Đánh giá_: Tốt cho UX, nhưng cần duplicate logic của `DetailSearchPage`. Phức tạp hóa không cần thiết. Bỏ qua.

**Câu hỏi 3: Tên query string truyền sang DetailSearchPage là gì?**

- Tên đầy đủ của HDV (ví dụ: `?q=Nguyễn Văn A`)? — Tìm kiếm ngữ nghĩa, backend xử lý embedding search.
- Họ tên rút gọn (chỉ tên cuối)? — Quá mơ hồ, kết quả không chính xác.
- `guideId` thay vì tên? — Phải thay đổi API backend nếu hiện tại chỉ filter theo `query` text.
- **Kết luận**: Dùng tên đầy đủ `guide.name` — đơn giản, backend đã có sẵn semantic search.

### Phase 2: SCAMPER — Tinh chỉnh ý tưởng

- **S (Substitute)**: Thay vì button riêng lẻ cuối trang, có thể làm thành một "section strip" mỏng với icon mũi tên + text, để nhìn chuyên nghiệp hơn.
- **C (Combine)**: Kết hợp `motion.button` (Framer Motion, theo pattern `ActionBar`) với ghost style để nhất quán với các button ghost khác trong cùng trang (ví dụ: "Xem tất cả khoảnh khắc" trong `MomentsGrid`).
- **A (Adapt)**: Tham chiếu style của `Button ghost fullWidth` trong `moments-grid.tsx` dòng 278–287 — đây là precedent trực tiếp.
- **M (Modify)**: Thêm `chevronRight` icon bên phải để gợi ý "có điều hướng ra màn hình khác".
- **E (Eliminate)**: Không cần loading state hay confirmation — chỉ đơn giản `router.push`.
- **R (Reverse)**: Sắp xếp button ngay **trước** `div h-8` spacer, không phải sau `CareerTimeline` header.

### Phase 3: Solution Matrix — So sánh phương án

| Tiêu chí                          | Phương án A: Đặt trong ActionBar | Phương án B: Section cuối trang (ĐƯỢC CHỌN) | Phương án C: Bottom Sheet mới |
| :-------------------------------- | :------------------------------- | :------------------------------------------ | :---------------------------- |
| **Vị trí tự nhiên trong flow UX** | Thấp (quá sớm)                   | **Cao** (sau khi user đã xem hết)           | Trung bình                    |
| **Effort implementation**         | Thấp                             | **Thấp**                                    | Cao                           |
| **Tái sử dụng code**              | Không                            | **Tái dùng DetailSearchPage**               | Phải duplicate                |
| **Ảnh hưởng performance**         | Không                            | **Không** (push route)                      | Cần fetch thêm                |
| **Nhất quán với UI hiện tại**     | Thay đổi ActionBar               | **Nhất quán** (ghost button pattern)        | Thêm Sheet mới                |

---

## 3. Hành vi mong muốn

### A. Button "Xem thêm tour của [Tên HDV]"

| Hành động                           | Kết quả mong đợi                                           |
| :---------------------------------- | :--------------------------------------------------------- |
| User cuộn hết profile               | Thấy button ghost "Xem thêm tour của [tên]" ở cuối trang   |
| Bấm vào button                      | Điều hướng sang `/search?q=[tên HDV đầy đủ]`               |
| Tap với haptic (nếu iOS)            | `whileTap={{ scale: 0.97 }}` animation như các button khác |
| Button disabled khi guide chưa load | Không hiện button cho đến khi `data` available             |

### B. Màn hình DetailSearchPage sau khi điều hướng

| State                         | Hành vi                                             |
| :---------------------------- | :-------------------------------------------------- |
| URL: `/search?q=Nguyễn Văn A` | SearchInput tự populate với tên HDV                 |
| Kết quả video                 | Hiển thị lưới 2 cột các video liên quan đến tên HDV |
| Infinite scroll               | Hoạt động bình thường như search tay                |
| Back button                   | `router.back()` → quay về GuideProfilePage          |

### C. Trạng thái Edge Cases

| Edge Case                 | Hành vi                                                      |
| :------------------------ | :----------------------------------------------------------- |
| HDV chưa có video nào     | DetailSearchPage hiển thị empty state "Không tìm thấy video" |
| Tên HDV có dấu tiếng Việt | URL encode đúng: `encodeURIComponent(guide.name)`            |
| Guide data chưa load      | Button không render (component trả về null khi `!data`)      |

---

## 4. Thay đổi kỹ thuật

### A. File thay đổi chính

| File                                                                 | Loại thay đổi | Mô tả                                                                                               |
| :------------------------------------------------------------------- | :------------ | :-------------------------------------------------------------------------------------------------- |
| `src/modules/GuideProfilePage/index.tsx`                             | **MODIFY**    | Thêm `ViewMoreToursButton` component hoặc inline button ở cuối JSX, trước `<div className="h-8" />` |
| `src/modules/GuideProfilePage/components/view-more-tours-button.tsx` | **NEW**       | Component button tách riêng nhận `guideName` và `guideId` props, xử lý navigation                   |

### B. Chi tiết implementation

#### `view-more-tours-button.tsx` (NEW)

```tsx
'use client';

import { ChevronRight } from 'lucide-react';
import { motion } from 'framer-motion';
import { useRouter } from 'next/router';

import { ROUTE } from '@/types/routes';

interface ViewMoreToursButtonProps {
  guideName: string;
}

export default function ViewMoreToursButton({ guideName }: ViewMoreToursButtonProps) {
  const router = useRouter();
  const lastName = guideName.split(' ').pop() ?? guideName;

  const handleClick = () => {
    router.push(`${ROUTE.SEARCH}?q=${encodeURIComponent(guideName)}`);
  };

  return (
    <div className="py-[22px] px-[18px] bg-white border-b border-neutral-200">
      <motion.button
        whileTap={{ scale: 0.97 }}
        transition={{ duration: 0.1 }}
        onClick={handleClick}
        className="w-full flex items-center justify-between py-[12px] px-[14px] rounded-xl border border-neutral-200 text-[13px] font-medium text-neutral-700 hover:bg-neutral-50 transition-colors"
      >
        <span>Xem thêm tour của {lastName}</span>
        <ChevronRight className="w-4 h-4 text-neutral-400 flex-shrink-0" />
      </motion.button>
    </div>
  );
}
```

#### `GuideProfilePage/index.tsx` — vị trí chèn button

```tsx
// Thêm vào sau <CareerTimeline />, trước <div className="h-8" />
<ViewMoreToursButton guideName={data.name} />
<div className="h-8" />
```

### C. Routing / URL

- Route target: `ROUTE.SEARCH` = `/search` (đã có sẵn trong `src/types/routes.ts`)
- Query string: `?q=<tên HDV full>` — `DetailSearchPage` đọc `router.query.q` và truyền vào `useInfiniteListVideo`
- **Không cần thay đổi** `DetailSearchPage` hay API — hoạt động out-of-the-box

---

## 5. Dependencies & Conflicts

- **Depends on:** Không có — `ROUTE.SEARCH` và `DetailSearchPage` đã hoạt động.
- **Modifies:**
  - [`GuideProfilePage/index.tsx`](file:///d:/Remote/web-travel/src/modules/GuideProfilePage/index.tsx) — thêm component mới vào JSX tree
- **Must NOT break:**
  - Pattern cuộn của `GuideProfilePage` (overflow-y-auto, scrollbar-hide)
  - Swipe-right-to-go-back gesture đang dùng `touchStartX` / `touchStartY` refs
  - `MomentsGrid` và `CareerTimeline` không bị ảnh hưởng
- **Conflicts with:** Không có

---

## 6. Out of scope

- Lọc video theo `guideId` trực tiếp ở backend (hiện tại search theo text; nếu cần filter chính xác theo ID thì cần backend task riêng).
- Hiển thị tên HDV như một "header" hoặc "chip filter" trong `DetailSearchPage` (có thể là follow-up spec).
- Animation transition đặc biệt (shared element transition) khi navigate từ GuideProfilePage sang DetailSearchPage.
- Đặt button này ở bất kỳ trang nào khác ngoài `GuideProfilePage`.

---

## 7. Open Questions

> Nếu đã resolve trước approve thì xóa câu hỏi đó.

1. **Query string hay guideId filter?** Hiện tại dùng `?q=<tên HDV>` (text search). Nếu backend sau này support `?guideId=<id>` để filter chính xác, sẽ cần update URL và `DetailSearchPage`. Có cần plan cho backend task này không?
2. **Tên rút gọn hay tên đầy đủ trong label button?** Spec này dùng họ tên cuối (`lastName`) trong label nhưng truyền full name vào query. Xác nhận UX: "Xem thêm tour của **Tuấn**" (ngắn, thân thiện) vs "Xem thêm tour của **Nguyễn Văn Tuấn**" (đầy đủ, formal).
3. **Animation khi navigate?** Có muốn thêm animation slide-in giống native iOS khi push sang `/search` không, hay giữ default Next.js navigation?
