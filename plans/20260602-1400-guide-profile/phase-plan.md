# Phase Plan: Guide Profile Page

## Phase 1 — Scaffold & Static UI (no animations)

**Mục tiêu:** Trang render đúng layout với mock data, không có animation, không có interactivity.

1. `pnpm add qrcode.react`
2. Thêm routes vào `src/types/routes.ts`:
   ```ts
   GUIDE_PROFILE: '/guide/[id]',
   GUIDE_PROFILE_PATH: (id: string) => `/guide/${id}`,
   ```
3. Tạo `src/pages/guide/[id].tsx` — thin page wrapper
4. Tạo `src/modules/GuideProfilePage/data/mock-guide.ts` — type + mock data object
5. Tạo `src/modules/GuideProfilePage/hooks/use-guide-profile.ts` — trả mock với `useState(true)` loading 800ms
6. Tạo các section components (không có motion):
   - `hero-banner.tsx` — gradient bg, slogan, name, title, badge pill
   - `action-bar.tsx` — CTA button, QR button (static), Share button (static)
   - `storytelling-block.tsx` — label + font-serif bio text
   - `stats-block.tsx` — 3-col grid, "Xem lệnh điều tour" button (static)
   - `operator-reviews.tsx` — stacked cards trên `bg-neutral-100`
   - `guest-feedback.tsx` + `criteria-bar.tsx` (static width) + `featured-reviews.tsx`
   - `specialty-tags.tsx` — colored chips
   - `moments-grid.tsx` — 2-col grid với placeholder gradient + play icon
   - `destinations-chart.tsx` — horizontal bars (static width)
   - `career-timeline.tsx` — border-l + dots
7. Tạo `guide-profile-skeleton.tsx`
8. Compose tất cả trong `src/modules/GuideProfilePage/index.tsx`

**Done khi:** `pnpm dev` → `/guide/1` render đúng layout, đủ sections, không lỗi TypeScript.

---

## Phase 2 — Interactivity

**Mục tiêu:** Các interactions hoạt động đúng.

9. `card-flip-badge.tsx` — CSS 3D flip (`[perspective:600px]`, `[transform-style:preserve-3d]`):

   - Mặt trước: pill badge `#HN-2847`
   - Mặt sau: số thẻ, họ tên, ngày cấp, VVV text
   - Toggle `isFlipped` state on click

10. `qr-sheet.tsx` — `<Sheet side="bottom">`:

    ```tsx
    import QRCode from 'qrcode.react';
    // <QRCode value={`https://vvv.travel/g/${guide.id}`} size={200} />
    ```

    Mở khi bấm nút QR trong action-bar.

11. Share button trong `action-bar.tsx`:

    ```ts
    const url = `https://vvv.travel/g/${guide.id}`;
    if (navigator.share) {
      await navigator.share({ title: guide.name, url });
    } else {
      await navigator.clipboard.writeText(url);
      toast({ description: 'Đã sao chép liên kết' });
    }
    ```

    Dùng `toast` từ `src/components/ui/use-toast.ts`.

12. `dispatch-list.tsx` — collapsible với `framer-motion AnimatePresence`:

    ```tsx
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ height: 0, opacity: 0 }}
          animate={{ height: 'auto', opacity: 1 }}
          exit={{ height: 0, opacity: 0 }}
        >
          {/* dispatch rows */}
        </motion.div>
      )}
    </AnimatePresence>
    ```

13. Moments card click → `router.push(ROUTE.VIDEO_DETAIL_PATH(moment.videoId))`

**Done khi:** Badge flip hoạt động, QR Sheet mở/đóng, Share copies link + toast, dispatch list toggle, moments navigate.

---

## Phase 3 — Animations

**Mục tiêu:** Premium UX feel theo spec.

14. Page entrance (`index.tsx`) — `motion.div` với stagger delay `0.08s`:

    ```tsx
    const sections = [HeroBanner, ActionBar, StorytellingBlock, StatsBlock, ...];
    // Wrap mỗi section:
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.08 }}
    >
    ```

    Chỉ áp dụng cho 4 block đầu (Banner, ActionBar, Storytelling, Stats) theo spec.

15. `criteria-bar.tsx` — animate width `whileInView`:

    ```tsx
    <motion.div
      className="h-[4px] bg-neutral-black rounded-full"
      initial={{ width: 0 }}
      whileInView={{ width: `${(score / 5) * 100}%` }}
      viewport={{ once: true }}
      transition={{ duration: 0.6, ease: 'easeOut' }}
    />
    ```

16. `destinations-chart.tsx` — tương tự `criteria-bar`, animate `percentage`%.

17. CTA button trong `action-bar.tsx`:

    ```tsx
    <motion.button whileTap={{ scale: 0.96 }} transition={{ duration: 0.1 }}>
      Đặt tour với Minh
    </motion.button>
    ```

18. QR/Share icon buttons — `whileHover={{ rotate: 5 }}`.

**Done khi:** Bars animate vào khi scroll đến, CTA scales on tap, icons rotate on hover.

---

## Phase 4 — Edge Cases & States

**Mục tiêu:** Robust UI khi thiếu data.

19. Empty state cho `moments-grid.tsx` khi `moments.length === 0`:

    ```tsx
    <div className="text-center py-8 text-neutral-400 text-caption2">Chưa có khoảnh khắc nào được đăng tải</div>
    ```

20. Empty state cho `dispatch-list.tsx` khi `dispatches.length === 0`:

    ```tsx
    <p className="text-caption2 text-neutral-400 italic text-center py-3">Chưa có lệnh điều tour được xác nhận</p>
    ```

21. Empty state cho `operator-reviews.tsx` tương tự.

22. Run `pnpm check-types` — fix mọi TypeScript error.
23. Nhắc user chạy `lint-changed.bat`.

**Done khi:** Không có TypeScript error, empty states hiển thị đúng.

---

## Checklist cuối

- [ ] `pnpm check-types` pass
- [ ] `/guide/1` render đủ tất cả sections
- [ ] Badge flip hoạt động
- [ ] QR Sheet mở/đóng
- [ ] Share button: Web Share API hoặc clipboard + toast
- [ ] Dispatch list toggle
- [ ] Moments click navigate sang video
- [ ] Progress bars animate when in view
- [ ] CTA tap scale
- [ ] Page entrance stagger
- [ ] Skeleton hiển thị khi loading
- [ ] Empty states cho 3 sections
