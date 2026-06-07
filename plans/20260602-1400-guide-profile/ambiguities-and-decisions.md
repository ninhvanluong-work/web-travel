# Điểm mơ hồ & Quyết định thiết kế

## Quyết định đã xác nhận ✓

| #   | Điểm mơ hồ                                 | Quyết định                                                                              |
| --- | ------------------------------------------ | --------------------------------------------------------------------------------------- |
| 1   | Route: `/guide/[id]` hay `/guide/[slug]`?  | `/guide/[id]` + mock data (chưa có API)                                                 |
| 2   | Video Moments click: overlay hay navigate? | Navigate `/video/[id]`. GuideProfilePage là đích của "View profile →" trong ProductPage |
| 3   | Badge `#HN-2847` click interaction?        | **Bỏ qua** — badge tĩnh, chưa có ý tưởng                                                |
| 4   | "Xem lệnh điều tour": API hay mock?        | Mock data, collapsible list trượt xuống                                                 |
| 5   | Operator Reviews: carousel hay stacked?    | Stacked dọc                                                                             |

---

## Chi tiết từng điểm

### 1. Route Pattern

**Mơ hồ:** Spec không định nghĩa URL. Prototype hiển thị `vvv.travel/g/minh-nguyen`.

`ApiTourGuide` hiện tại chỉ trả `id` (không có `slug`). Để dùng slug cần API thay đổi.

**Quyết định:** `/guide/[id]` — thêm vào `src/types/routes.ts`:

```ts
GUIDE_PROFILE: '/guide/[id]',
GUIDE_PROFILE_PATH: (id: string) => `/guide/${id}`,
```

---

### 2. Video Moments Overlay

**Mơ hồ:** Spec nói "mở ra lớp phủ phát video dọc (Shorts/Reels style) cho phép vuốt lên xem clip tiếp theo."

`VideoDetailPage` đã có snap-scroll feed với `forcePause` / `gated` logic (CLAUDE.md: không modify).

**Option A — Navigate (khuyến nghị):** Click → `router.push(ROUTE.VIDEO_DETAIL_PATH(moment.videoId))`. Không cần code mới, không đụng existing logic.

**Option B — Overlay Player:** Tạo `MomentsOverlay` component riêng với snap-scroll bên trong overlay. Phức tạp hơn, cần `framer-motion` scale animation. Phải xin phép trước vì đụng video playback logic.

---

### 3. Badge Flip (Card ID)

**Mơ hồ:** "Bấm vào badge mã thẻ sẽ lật hiển thị thông tin thẻ hướng dẫn viên dạng số hóa đã được cấp phép." Không rõ mặt sau hiển thị gì.

**Implement:** CSS 3D card flip (`perspective + rotateY(180deg)`), không cần thư viện. Mặt sau: số thẻ, họ tên, ngày cấp, VVV logo.

**Xác nhận cần:** Có thêm field nào khác trên thẻ số hóa không? (ngày hết hạn, hạng chứng chỉ, QR riêng?)

---

### 4. "Xem lệnh điều tour"

**Mơ hồ:** "Bảng danh sách mã điều tour đã được VVV xác thực" — không có API, không có data schema.

**Giả sử structure:**

```ts
interface TourDispatch {
  code: string; // "VVV-BKG-2026-0284"
  tourName: string; // "Sapa 2D1N trek"
  date: string; // "12/04/2026"
  status: 'completed' | 'upcoming';
}
```

**Implement:** Collapsible section bằng `framer-motion AnimatePresence`, data từ mock.

---

### 5. Operator Reviews Layout

**Mơ hồ:** Spec nói "vuốt ngang (carousel)" nhưng HTML prototype xếp cards dọc.

**Quyết định:** Xếp dọc theo HTML prototype (ground truth). Dùng carousel (shadcn `<Carousel>`) chỉ nếu user xác nhận muốn swipe horizontal.

---

### 6. QR Code — Thư viện mới

**Mơ hồ:** "QR Code động để lưu danh thiếp" — không có QR lib trong project.

**Quyết định:** `pnpm add qrcode.react`. QR encode URL `vvv.travel/g/[id]`. Hiển thị trong `<Sheet side="bottom">` (đã có `src/components/ui/sheet.tsx`).

---

### 7. "Xem tất cả đánh giá" / "Xem tất cả khoảnh khắc"

**Mơ hồ:** Hai nút này navigate đâu? Không có trang riêng trong spec.

**Quyết định:** Scroll anchor xuống section tương ứng trong cùng trang. Không tạo trang mới (YAGNI).

---

### 8. Specialty Tag Colors

**Mơ hồ:** HTML prototype dùng 5 màu nền khác nhau (purple, orange, green, amber, pink) — màu theo tag type hay data?

**Quyết định:** `SPECIALTY_COLORS` map cố định trong mock data. Mỗi specialty item có `{ label, bg, text }`. Không random.

---

## Điểm KHÔNG mơ hồ — implement thẳng

- Layout: `MainLayout` wrap, `max-w-[430px] h-[100dvh]`
- Typography: bảng ánh xạ đầy đủ trong spec (text-caption2, text-body3, text-h6...)
- Hero banner: gradient colors lấy thẳng từ HTML prototype
- Action bar: flex, gap-10px, shadcn `<Button>`
- Stats grid: 3 cột với `border-r`
- Progress bar: `h-[4px]`, animate `whileInView` với framer-motion
- Featured reviews: `border-l-2 border-neutral-black pl-3.5`
- Destinations chart: horizontal bars, animate `whileInView`
- Career timeline: `border-l` + dots pattern
- QR sheet: `<Sheet side="bottom">` đã có sẵn
- Share: Web Share API + clipboard fallback + Toast
- Skeleton: `<Skeleton>` component đã có sẵn

## Tailwind tokens đã verify

- `text-caption2`, `text-body3`, `text-body2`, `text-h6` ✓
- `bg-neutral-black`, `text-neutral-black` ✓
- `font-dinpro`, `font-serif` ✓
- `skeleton` shimmer ✓ (qua shadcn)
