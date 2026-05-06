# Spec: Product Page — Mở từ "More" trên VideoDetailPage

**Status:** ✅ Ready to implement  
**Tạo:** 2026-05-06  
**Cập nhật:** 2026-05-06  
**Feature area:** `VideoDetailPage → ProductPage`

---

## 1. Navigation

- Click vào info card / `... More` trên `VideoDetailPage` → `router.push({ pathname: ROUTE.PRODUCT, query: { videoSlug: video.slug } })`
- Render `ProductPage` full screen tại `src/pages/product.tsx`
- **Không có nút back pha 1**
- **Không có browser bar giả**

---

## 2. Layout

- ProductPage dùng `MainLayout` (phone frame 430px, scroll dọc trong frame)
- **Không có Header, không có Navbar** — clean page, chỉ có content + sticky CTA bar
- Cần định nghĩa `ProductPage.getLayout` để ẩn Header + Navbar khỏi `ModuleLayout`
- Content wrapper có `padding-bottom: calc(72px + env(safe-area-inset-bottom))` để không bị sticky CTA che

---

## 3. Mock Data Shape

```typescript
interface MediaItem {
  type: 'image' | 'video';
  url: string;
}

interface ItineraryStep {
  step: number;
  time: string; // "7:30 AM · Day 1"
  title: string;
  description: string; // expand khi tap
}

interface MockProduct {
  // Hero
  media: MediaItem[];

  // Header
  tags: string[];
  name: string;
  shortDescription: string;
  rating: number;
  reviewCount: number;

  // Cancellation
  freeCancellation: boolean;
  cancellationDeadlineHours: number;

  // Quick facts
  quickFacts: {
    duration: string;
    departurePoint: string;
    pickupTime: string;
    groupSize: string;
    languages: string[];
    difficulty: string;
  };

  // Highlights (experience cards 2x2)
  highlights: {
    icon: string; // icon key từ Icons.*
    title: string;
    subtitle: string;
  }[];

  // USP
  uniqueSellingPoint: string;

  // Operator
  operator: {
    initials: string;
    name: string;
    rating: number;
    reviewCount: number;
    verified: boolean;
    yearsOnPlatform: number;
    toursOffered: number;
    responseRate: number;
  };

  // Guide
  guide: {
    initials: string;
    name: string;
    rating: number;
    yearsExperience: number;
    toursInArea: number;
    area: string;
  };

  // Itinerary
  itinerary: ItineraryStep[];

  // Before you book
  beforeYouBook: {
    type: 'bestFor' | 'notRecommended' | 'bring' | 'wear' | 'cultural';
    title: string;
    description: string;
  }[];

  // Included
  included: string[];
  notIncluded: string[];

  // Reviews — hiển thị tất cả
  reviews: {
    quote: string;
    author: string;
    country: string;
    date: string;
  }[];

  // Pricing
  originalPrice: number;
  salePrice: number;
  discountPercent: number;
  currency: string; // "USD"
  priceUnit: string; // "person"
}
```

---

## 4. Sections (13 tổng)

### Section 1 — Hero Carousel

- **Swipe gesture** (touch drag) để chuyển slide + **tap dot** để nhảy tới slide cụ thể
- `type === 'video'` → render video player + badge **● Hero video** góc trên trái
- `type === 'image'` → render `<img>` (không có badge)
- Góc trên phải: nút **♡ Save** + **↑ Share** (UI only, chưa có logic)
- Giữa (chỉ khi video): nút **▶ Play** tròn trắng — tap để play **có âm thanh** (không muted)
- Dưới: pagination dots (tap để navigate) + counter `1/3` ở góc phải
- Cạnh dưới hero: curved edge `height: 24px; border-radius: 24px 24px 0 0` màu background tạo hiệu ứng bo vào content
- `aspect-ratio: 16/10`

### Section 2 — Product Header

- Tag pills: `tags[]` — pill đầu tiên: bg `#E1F5EE`, text `#0F6E56`; còn lại: bg `#F1EFE8`, text `#444441`
- `name` — font 23px, weight 500, letter-spacing -0.4px
- `shortDescription` — font-dinpro italic, 15px, màu secondary, line-height 1.55
- Rating row: ★ `rating` / 5 · `reviewCount` reviews (reviews là link anchor tới Section 12)

### Section 3 — Free Cancellation Badge

- Hiển thị khi `freeCancellation === true`
- Text: "Free cancellation up to `cancellationDeadlineHours`h before"
- Sub-text: "Full refund if your plans change"
- Background `#E1F5EE`, icon ✓ tròn xanh `#0F6E56`

### Section 4 — Quick Facts Grid (2 cột × 3 hàng)

- Background card `#F1EFE8`, border-radius 14px
- Mỗi fact: icon SVG (opacity 0.65) + label 10px secondary + value 13px weight 500
- Icons (thêm vào `Icons.*` nếu thiếu, dựa trên HTML SVG):
  - Duration → `clock`
  - Departs from → `location` (đã có)
  - Pickup / dropoff → `personPickup`
  - Group size → `groupPeople`
  - Languages → `globe`
  - Difficulty → `mountain`

### Section 5 — Experience Cards (2×2 grid)

- Background section `#F8F6F0`
- Section title: "What you'll experience" uppercase 11px
- Mỗi card: bg trắng, `aspect-ratio: 1/1`, icon tròn `#E1F5EE` + icon SVG `#0F6E56`, title 14px weight 500 + subtitle 12px secondary
- 4 highlights từ `highlights[]`, icon key từ `Icons.*`

### Section 6 — Unique Selling Point

- Card bordered `#0F6E56`, icon ★ `#0F6E56`
- Label uppercase "What makes this different" — màu `#0F6E56`
- Text `uniqueSellingPoint` — font-dinpro italic, 15px, line-height 1.55

### Section 7 — Hosted By (Operator)

- Avatar: **hình vuông bo góc** (border-radius md), bg `#0F6E56`, initials trắng
- Name + verified badge ★
- Stats: rating · reviewCount · "Verified operator"
- Footer grid (bg `#F8F6F0`): years on platform / tours offered / response rate — 3 cột
- Nút "View operator profile →" full width, border-top (UI only)

### Section 8 — Your Guide

- Avatar: **hình tròn**, bg `#E1F5EE`, initials `#0F6E56`
- Name + rating ★ inline
- "X years experience · Y tours in [area]"
- Nút "View profile →" bên phải (UI only)

### Section 9 — Itinerary (Accordion)

- Header: "Itinerary" 16px weight 500 + sub "tap to see details for each leg" 12px secondary
- Danh sách steps từ `itinerary[]`
- Mỗi step: số thứ tự tròn (bg trắng, border) + time uppercase 11px + title 14px weight 500 + chevron ›
- **Single expand**: tap một step → expand với animation, các step khác tự đóng
- Animation: height transition + fade, mượt trên mobile
- Tap lại step đang mở → collapse

### Section 10 — Read Before You Book

- Background section `#F8F6F0`
- Header: "Read before you book" 16px + sub "To make your trip as smooth as possible" 12px secondary
- 5 loại card, màu icon tròn per type:
  - `bestFor` → bg `#E1F5EE`, icon màu `#0F6E56`
  - `notRecommended` → bg `#FCEBEB`, icon màu `#791F1F`
  - `bring` → bg `#F1EFE8`, icon màu `#444441`
  - `wear` → bg `#F1EFE8`, icon màu `#444441`
  - `cultural` → bg `#F1EFE8`, icon màu `#444441`
- Mỗi card: icon tròn 34px + title 13px weight 500 + description 12px secondary line-height 1.55

### Section 11 — What's Included

- **2 card độc lập** đặt cạnh nhau (grid 2 cột), mỗi card bg `#F1EFE8`
- Card trái — "Included": header icon tròn xanh `#0F6E56` + ✓ trắng, list items 13px
- Card phải — "Not included": header icon tròn trắng + ✗ xám, list items 13px màu secondary

### Section 12 — Reviews

- Background section `#F8F6F0`
- Section label uppercase "What guests say"
- `rating` lớn 32px weight 500 · `reviewCount` reviews
- **Hiển thị tất cả** reviews — không giới hạn, không có "See all"
- Mỗi card: quote font-serif italic 14px line-height 1.6 + author · country · date 12px secondary

### Section 13 — Sticky CTA Bar (Fixed Bottom)

- Fixed, `bottom: 0`, `padding-bottom: env(safe-area-inset-bottom)`
- Wrapper: bg trắng, border, border-radius 14px, padding 14px 16px
- Trái: giá gốc gạch ngang 11px + badge −X% bg `#E1F5EE` text `#0F6E56` + giá sale 19px weight 500 / unit 12px secondary
- Phải: nút **"Book now"** — bg `#0F6E56`, text trắng, border-radius 99px, padding 13px 22px (UI only)

---

## 5. Design Tokens

| Token            | Value              |
| ---------------- | ------------------ |
| Primary green    | `#0F6E56`          |
| Primary light    | `#E1F5EE`          |
| Primary dark     | `#04342C`          |
| Surface cream    | `#F1EFE8`          |
| Surface alt      | `#F8F6F0`          |
| Text primary     | `#1A1A18`          |
| Text secondary   | `#888884`          |
| Text neutral     | `#444441`          |
| Warning red bg   | `#FCEBEB`          |
| Warning red text | `#791F1F`          |
| Border           | `rgba(0,0,0,0.08)` |
| Card radius      | `14px`             |
| Pill radius      | `99px`             |

Font: `font-dinpro` (hệ thống đang có)  
Font serif: `var(--font-serif)` — dùng cho shortDescription, USP text, review quotes

---

## 6. Icons cần thêm vào `Icons.*`

Dựa trên SVG inline từ HTML mockup, các icon sau cần được thêm vào `src/assets/svg/` và register vào `src/assets/icons.tsx`:

| Icon key        | Dùng ở                           |
| --------------- | -------------------------------- |
| `clock`         | Quick Facts — Duration           |
| `personPickup`  | Quick Facts — Pickup/dropoff     |
| `groupPeople`   | Quick Facts — Group size         |
| `globe`         | Quick Facts — Languages          |
| `mountain`      | Quick Facts — Difficulty         |
| `trekMountain`  | Experience card — Trek           |
| `hearthFire`    | Experience card — Dinner         |
| `personHome`    | Experience card — Homestay       |
| `sunRise`       | Experience card — Sunrise        |
| `personBest`    | Before You Book — bestFor        |
| `warningCircle` | Before You Book — notRecommended |
| `houseBring`    | Before You Book — bring          |
| `clothingWear`  | Before You Book — wear           |
| `culturalSmile` | Before You Book — cultural       |

---

## 7. Mobile Constraints

- Width: `100vw`, không có breakpoint desktop
- Scroll: `overflow-y: auto` toàn trang trong MainLayout phone frame
- CTA bar: `position: fixed; bottom: 0` + safe-area
- Content: `padding-bottom: calc(72px + env(safe-area-inset-bottom))` để không bị CTA bar che
- Touch targets: min `44×44px`

---

## 8. File Structure (đề xuất)

```
src/
  pages/
    product.tsx                          ← entry point + custom getLayout (no Header/Navbar)
  modules/
    ProductPage/
      index.tsx                          ← main component + mock data
      components/
        hero-carousel.tsx
        product-header.tsx
        quick-facts-grid.tsx
        experience-cards.tsx
        operator-block.tsx
        guide-block.tsx
        itinerary-accordion.tsx
        before-you-book.tsx
        included-section.tsx
        reviews-section.tsx
        sticky-cta-bar.tsx
  assets/
    svg/                                 ← thêm các icon SVG còn thiếu
```

---

## 9. Phases

| Phase       | Nội dung                                                                 |
| ----------- | ------------------------------------------------------------------------ |
| **Phase 1** | UI với mock data — tất cả 13 sections, icons đầy đủ, accordion animation |
| **Phase 2** | Gọi API theo `videoSlug`, loading/error states                           |
| **Phase 3** | Save/Share logic, booking flow, review pagination                        |
