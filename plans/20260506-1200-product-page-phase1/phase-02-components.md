# Phase 02 — Section Components

All components live in `src/modules/ProductPage/components/`. Each is a pure presentational component — no state except where noted.

Import the `MockProduct` type from `../index` (or a shared `types.ts` if preferred). Use `Icons` from `@/assets/icons`.

---

## 1. `hero-carousel.tsx`

**Props:**

```typescript
interface HeroCarouselProps {
  media: { type: 'image' | 'video'; url: string }[];
}
```

**Implementation:**

- Container: `relative w-full` with `aspect-ratio: 16/10` (Tailwind: `aspect-[16/10]`)
- Inner track: `flex overflow-x-auto scroll-snap-type-x-mandatory scrollbar-hide` — use inline style `scrollSnapType: 'x mandatory'`
- Each slide: `flex-shrink-0 w-full scroll-snap-align-start` — inline style `scrollSnapAlign: 'start'`
- `useRef` on track + `useState` for `activeIndex`
- `IntersectionObserver` on each slide (threshold 0.6) → update `activeIndex`
- Dot tap: `trackRef.current.scrollTo({ left: index * width, behavior: 'smooth' })`

**Video slide:** gradient bg `linear-gradient(135deg, #1D9E75 0%, #0F6E56 50%, #04342C 100%)` as placeholder until real URL loads

- Badge top-left: `● Hero video` — `absolute top-3.5 left-3.5 flex items-center gap-1.5 px-[11px] py-1.5 bg-black/40 backdrop-blur-sm rounded-full text-[11px] text-white font-medium`
- Play button center: `absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-14 h-14 rounded-full bg-white/95 flex items-center justify-center` — tap toggles `videoRef.current.play()` / `pause()`

**Image slide:** `<img className="w-full h-full object-cover" />`

**Save + Share buttons** top-right: two `34×34` circle buttons `bg-white/95`

- Save: `Icons.heart` 14px; Share: `Icons.upload` 13px
- Both UI only (no handler in Phase 1)

**Pagination dots** bottom-left:

- Active: `w-[18px] h-[3px] bg-white rounded-[2px]`
- Inactive: `w-2 h-[3px] bg-white/50 rounded-[2px]`

**Counter** bottom-right: `{activeIndex + 1} / {media.length}` — `text-[11px] text-white bg-black/50 backdrop-blur-sm rounded-full px-2.5 py-1`

**Curved bottom edge:** `absolute bottom-[-1px] left-0 right-0 h-6 bg-[var(--bg)] rounded-t-[24px]` where `--bg` matches the page background (white). Use `bg-white` directly.

---

## 2. `product-header.tsx`

**Props:**

```typescript
interface ProductHeaderProps {
  tags: string[];
  name: string;
  shortDescription: string;
  rating: number;
  reviewCount: number;
}
```

**Implementation:**

- Wrapper: `px-[18px] pt-1 pb-4`
- Tag pills row: `flex gap-1.5 mb-3 flex-wrap`
  - First tag: `text-[11px] px-2.5 py-1 bg-[#E1F5EE] text-[#0F6E56] rounded-full font-medium`
  - Other tags: `text-[11px] px-2.5 py-1 bg-[#F1EFE8] text-[#444441] rounded-full font-medium`
- Name: `text-[23px] font-medium leading-[1.25] tracking-[-0.4px] mb-2`
- Short desc: `font-serif italic text-[15px] text-[#888884] leading-[1.55] mb-0` (use `style={{ fontFamily: 'var(--font-serif)' }}` if Tailwind serif class not configured)
- Rating row: `flex items-center gap-3 pt-3 border-t border-black/[0.08]`
  - Star: `Icons.star` 14px fill `#0F6E56`
  - Rating value: `text-base font-medium tracking-[-0.2px]`
  - Separator: `text-[12px] text-[#888884]` — `·`
  - Reviews link: `<a href="#reviews" className="text-[13px] text-[#1A1A18] underline underline-offset-[3px] decoration-black/20">{reviewCount} reviews</a>`

---

## 3. `quick-facts-grid.tsx`

**Props:**

```typescript
interface QuickFactsGridProps {
  duration: string;
  departurePoint: string;
  pickupTime: string;
  groupSize: string;
  languages: string[];
  difficulty: string;
}
```

**Implementation:**

- Wrapper: `px-[18px] pb-[22px]`
- Card: `bg-[#F1EFE8] rounded-[14px] p-[14px_16px]`
- Grid: `grid grid-cols-2 gap-x-[18px] gap-y-3`
- Each fact cell: `flex items-center gap-[9px]`
  - Icon: `<Image src={Icons.clock} width={15} height={15} style={{ opacity: 0.65 }} className="flex-shrink-0" />`
  - Text block: label `text-[10px] text-[#888884] leading-[1.2]` + value `text-[13px] font-medium leading-[1.2] mt-[1px]`
- Languages value: `languages.join(' · ')`

**Facts order (row-major, 2 cols):**

1. Duration → `Icons.clock`
2. Departs from → `Icons.location`
3. Pickup/dropoff → `Icons.personPickup`
4. Group size → `Icons.groupPeople`
5. Languages → `Icons.globe`
6. Difficulty → `Icons.mountain`

---

## 4. `experience-cards.tsx`

**Props:**

```typescript
interface ExperienceCardsProps {
  highlights: { icon: keyof typeof Icons; title: string; subtitle: string }[];
}
```

**Implementation:**

- Section wrapper: `bg-[#F8F6F0] px-[18px] py-5`
- Section label: `text-[11px] uppercase tracking-wide text-[#888884] font-medium mb-3` — "What you'll experience"
- Grid: `grid grid-cols-2 gap-3`
- Each card: `bg-white rounded-[14px] p-3 aspect-square flex flex-col justify-between`
  - Icon circle: `w-9 h-9 rounded-full bg-[#E1F5EE] flex items-center justify-center`
    - Icon inside: `<Image src={Icons[highlight.icon]} width={18} height={18} className="text-[#0F6E56]" />`
  - Text block at bottom:
    - Title: `text-[14px] font-medium leading-tight`
    - Subtitle: `text-[12px] text-[#888884] leading-tight mt-0.5`

---

## 5. `operator-block.tsx`

**Props:**

```typescript
interface OperatorBlockProps {
  initials: string;
  name: string;
  rating: number;
  reviewCount: number;
  verified: boolean;
  yearsOnPlatform: number;
  toursOffered: number;
  responseRate: number;
}
```

**Implementation:**

- Wrapper: `px-[18px] pb-[22px]`
- Card: `border border-black/[0.08] rounded-[14px] overflow-hidden`
- Header row `p-4`: `flex items-center gap-3`
  - Avatar: **square rounded** `w-12 h-12 rounded-md bg-[#0F6E56] flex items-center justify-center text-white text-[17px] font-medium flex-shrink-0`
  - Name row: name `text-[15px] font-medium` + verified star badge `text-[#0F6E56] text-xs ml-1`
  - Sub: `text-[12px] text-[#888884]` — `{rating} · {reviewCount} reviews · Verified operator`
- Stats footer: `bg-[#F8F6F0] grid grid-cols-3 divide-x divide-black/[0.08] border-t border-black/[0.08]`
  - Each cell `py-3 px-2 text-center`: value `text-[13px] font-medium`, label `text-[10px] text-[#888884] mt-0.5`
  - Col 1: `{yearsOnPlatform} years` / "On platform"
  - Col 2: `{toursOffered}` / "Tours offered"
  - Col 3: `{responseRate}%` / "Response rate"
- View profile button: `w-full py-3 text-center text-[13px] border-t border-black/[0.08]` — "View operator profile →" (UI only, no handler)

---

## 6. `guide-block.tsx`

**Props:**

```typescript
interface GuideBlockProps {
  initials: string;
  name: string;
  rating: number;
  yearsExperience: number;
  toursInArea: number;
  area: string;
}
```

**Implementation:**

- Wrapper: `px-[18px] pb-[22px]`
- Card: `border border-black/[0.08] rounded-[14px] p-4`
- Row: `flex items-center gap-3`
  - Avatar: **circle** `w-11 h-11 rounded-full bg-[#E1F5EE] flex items-center justify-center text-[#0F6E56] text-[15px] font-medium flex-shrink-0`
  - Content:
    - Name line: `flex items-center gap-1.5` — name `text-[15px] font-medium` + star + rating `text-[13px] font-medium text-[#0F6E56]`
    - Sub: `text-[12px] text-[#888884] mt-0.5` — `{yearsExperience} years experience · {toursInArea} tours in {area}`
  - View profile link: `ml-auto text-[12px] text-[#1A1A18] underline underline-offset-2 decoration-black/20 flex-shrink-0` — "View profile →"

---

## 7. `itinerary-accordion.tsx`

**Props:**

```typescript
interface ItineraryStep {
  step: number;
  time: string;
  title: string;
  description: string;
}

interface ItineraryAccordionProps {
  steps: ItineraryStep[];
}
```

**Implementation:**

- Wrapper: `px-[18px] pb-[22px]`
- Section header: title `text-base font-medium` + sub `text-[12px] text-[#888884] mt-0.5`
- Steps list `mt-4 flex flex-col gap-2`

**Each step (uses framer-motion):**

```typescript
const [openIndex, setOpenIndex] = useState<number | null>(null);

// Per step:
<div className="border border-black/[0.08] rounded-[14px] overflow-hidden">
  {/* Header row — tap to toggle */}
  <button
    className="w-full flex items-center gap-3 p-4 text-left"
    onClick={() => setOpenIndex(openIndex === step.step ? null : step.step)}
  >
    <span className="w-7 h-7 rounded-full border border-black/[0.15] flex items-center justify-center text-[12px] font-medium flex-shrink-0">
      {step.step}
    </span>
    <div className="flex-1 min-w-0">
      <p className="text-[11px] uppercase tracking-wide text-[#888884]">{step.time}</p>
      <p className="text-[14px] font-medium mt-0.5">{step.title}</p>
    </div>
    <motion.span animate={{ rotate: openIndex === step.step ? 90 : 0 }} transition={{ duration: 0.2 }}>
      <Image src={Icons.chevronRight} width={16} height={16} />
    </motion.span>
  </button>

  {/* Animated body */}
  <AnimatePresence initial={false}>
    {openIndex === step.step && (
      <motion.div
        key="content"
        initial={{ height: 0, opacity: 0 }}
        animate={{ height: 'auto', opacity: 1 }}
        exit={{ height: 0, opacity: 0 }}
        transition={{ duration: 0.25, ease: 'easeInOut' }}
        style={{ overflow: 'hidden' }}
      >
        <p className="px-4 pb-4 text-[13px] text-[#888884] leading-[1.55]">{step.description}</p>
      </motion.div>
    )}
  </AnimatePresence>
</div>;
```

---

## 8. `before-you-book.tsx`

**Props:**

```typescript
type BookItemType = 'bestFor' | 'notRecommended' | 'bring' | 'wear' | 'cultural';

interface BeforeYouBookItem {
  type: BookItemType;
  title: string;
  description: string;
}

interface BeforeYouBookProps {
  items: BeforeYouBookItem[];
}
```

**Implementation:**

- Section wrapper: `bg-[#F8F6F0] px-[18px] py-5`
- Header: title `text-base font-medium` + sub `text-[12px] text-[#888884] mt-0.5`
- List `mt-4 flex flex-col gap-3`

**Type → icon + color map:**

```typescript
const TYPE_CONFIG: Record<BookItemType, { icon: keyof typeof Icons; bg: string; color: string }> = {
  bestFor: { icon: 'personBest', bg: '#E1F5EE', color: '#0F6E56' },
  notRecommended: { icon: 'warningCircle', bg: '#FCEBEB', color: '#791F1F' },
  bring: { icon: 'houseBring', bg: '#F1EFE8', color: '#444441' },
  wear: { icon: 'clothingWear', bg: '#F1EFE8', color: '#444441' },
  cultural: { icon: 'culturalSmile', bg: '#F1EFE8', color: '#444441' },
};
```

**Each card:**

```
flex items-start gap-3 bg-white rounded-[14px] p-3
  Icon circle: w-[34px] h-[34px] rounded-full flex-shrink-0 flex items-center justify-center (bg from config)
    Icon: 16px, color from config (apply via CSS filter or className)
  Text: title text-[13px] font-medium + description text-[12px] text-[#888884] leading-[1.55] mt-0.5
```

Note: SVG icons use `currentColor` — wrap icon in a `<span style={{ color: config.color }}>` to apply color.

---

## 9. `included-section.tsx`

**Props:**

```typescript
interface IncludedSectionProps {
  included: string[];
  notIncluded: string[];
}
```

**Implementation:**

- Wrapper: `px-[18px] pb-[22px]`
- Grid: `grid grid-cols-2 gap-3`

**Included card** (`bg-[#F1EFE8] rounded-[14px] p-3`):

- Header: `flex items-center gap-2 mb-3`
  - Icon circle: `w-7 h-7 rounded-full bg-[#0F6E56] flex items-center justify-center`
    - `Icons.check` 12px white
  - Label: `text-[13px] font-medium` — "Included"
- List: each item `flex items-start gap-1.5 text-[13px] mb-1.5 last:mb-0`

**Not included card** (`bg-[#F1EFE8] rounded-[14px] p-3`):

- Header same structure, icon circle `bg-white border border-black/[0.1]`
  - `Icons.x` 12px gray (`text-[#888884]`)
  - Label: "Not included"
- List items: `text-[13px] text-[#888884]`

---

## 10. `reviews-section.tsx`

**Props:**

```typescript
interface Review {
  quote: string;
  author: string;
  country: string;
  date: string;
}

interface ReviewsSectionProps {
  rating: number;
  reviewCount: number;
  reviews: Review[];
}
```

**Implementation:**

- Section wrapper: `bg-[#F8F6F0] px-[18px] py-5` — add `id="reviews"` for anchor scroll from header
- Label: `text-[11px] uppercase tracking-wide text-[#888884] font-medium`
- Rating display: `flex items-baseline gap-2 mt-1 mb-4`
  - Big rating: `text-[32px] font-medium leading-none`
  - Sub: `text-[13px] text-[#888884]` — `{reviewCount} reviews`
- Reviews list `flex flex-col gap-3`: render all `reviews[]`, no limit

**Each review card** (`bg-white rounded-[14px] p-4`):

- Quote: `font-serif italic text-[14px] leading-[1.6] mb-2` (style fontFamily var(--font-serif))
- Meta: `text-[12px] text-[#888884]` — `{author} · {country} · {date}`

---

## 11. `sticky-cta-bar.tsx`

**Props:**

```typescript
interface StickyCTABarProps {
  originalPrice: number;
  salePrice: number;
  discountPercent: number;
  currency: string;
  priceUnit: string;
}
```

**Implementation:**

- Outer: `flex-shrink-0` (sits at natural bottom of flex column in ProductPage)
- Inner wrapper: `bg-white border border-black/[0.08] rounded-[14px] mx-3 mb-3 p-[14px_16px] flex items-center justify-between`
  - Safe area: add `style={{ paddingBottom: 'max(12px, env(safe-area-inset-bottom))' }}` on outer if needed (the parent scroll container handles this via pb-[calc(72px+...)])
- Left — pricing:
  - Original price: `text-[11px] text-[#888884] line-through` — `${currency}{originalPrice}`
  - Discount badge: `inline-block text-[11px] px-1.5 py-0.5 bg-[#E1F5EE] text-[#0F6E56] rounded-full font-medium ml-1.5` — `-{discountPercent}%`
  - Sale price line: `flex items-baseline gap-1 mt-0.5`
    - Price: `text-[19px] font-medium` — `${currency}{salePrice}`
    - Unit: `text-[12px] text-[#888884]` — `/ {priceUnit}`
- Right — Book button:
  - `bg-[#0F6E56] text-white rounded-full px-[22px] py-[13px] text-[14px] font-medium` — "Book now"
  - UI only, no onClick in Phase 1
