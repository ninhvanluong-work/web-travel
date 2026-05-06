# Phase 03 — Module Index

File: `src/modules/ProductPage/index.tsx`

---

## Responsibilities

- Define all TypeScript interfaces for mock data
- Declare the `MOCK_PRODUCT` constant
- Compose all 13 sections in render order
- Export as default `ProductPage`

---

## Interfaces

```typescript
interface MediaItem {
  type: 'image' | 'video';
  url: string;
}

interface ItineraryStep {
  step: number;
  time: string;
  title: string;
  description: string;
}

type BookItemType = 'bestFor' | 'notRecommended' | 'bring' | 'wear' | 'cultural';

interface MockProduct {
  media: MediaItem[];
  tags: string[];
  name: string;
  shortDescription: string;
  rating: number;
  reviewCount: number;
  freeCancellation: boolean;
  cancellationDeadlineHours: number;
  quickFacts: {
    duration: string;
    departurePoint: string;
    pickupTime: string;
    groupSize: string;
    languages: string[];
    difficulty: string;
  };
  highlights: { icon: string; title: string; subtitle: string }[];
  uniqueSellingPoint: string;
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
  guide: {
    initials: string;
    name: string;
    rating: number;
    yearsExperience: number;
    toursInArea: number;
    area: string;
  };
  itinerary: ItineraryStep[];
  beforeYouBook: { type: BookItemType; title: string; description: string }[];
  included: string[];
  notIncluded: string[];
  reviews: { quote: string; author: string; country: string; date: string }[];
  originalPrice: number;
  salePrice: number;
  discountPercent: number;
  currency: string;
  priceUnit: string;
}
```

---

## Mock Data

```typescript
const MOCK_PRODUCT: MockProduct = {
  media: [
    { type: 'video', url: '' },
    { type: 'image', url: '' },
    { type: 'image', url: '' },
    { type: 'image', url: '' },
  ],
  tags: ['Trekking', 'Hmong culture', 'Homestay'],
  name: 'Two days on the mountains of Sapa',
  shortDescription:
    'Trek through three Hmong villages, sleep one night by the hearth, and walk slowly enough for the mountains to tell their stories.',
  rating: 4.9,
  reviewCount: 184,
  freeCancellation: true,
  cancellationDeadlineHours: 24,
  quickFacts: {
    duration: '2 days, 1 night',
    departurePoint: 'Hanoi Old Quarter',
    pickupTime: '7:30 → 18:00',
    groupSize: 'Up to 8 people',
    languages: ['EN', 'FR', 'VI'],
    difficulty: 'Moderate',
  },
  highlights: [
    { icon: 'trekMountain', title: 'Village trekking', subtitle: 'Through 3 Hmong villages' },
    { icon: 'hearthFire', title: 'Hearth dinner', subtitle: 'Cooked over open fire' },
    { icon: 'personHome', title: 'Homestay night', subtitle: 'Sleep in a local home' },
    { icon: 'sunRise', title: 'Sunrise at Fansipan', subtitle: 'Golden hour panorama' },
  ],
  uniqueSellingPoint:
    'Most Sapa tours rush you past the scenery. This one slows down — two full days, a real homestay, and a guide whose family has farmed these slopes for generations.',
  operator: {
    initials: 'VV',
    name: 'Vietnam Village Vibes',
    rating: 4.9,
    reviewCount: 312,
    verified: true,
    yearsOnPlatform: 4,
    toursOffered: 18,
    responseRate: 98,
  },
  guide: {
    initials: 'M',
    name: 'Minh',
    rating: 4.95,
    yearsExperience: 7,
    toursInArea: 140,
    area: 'Sapa',
  },
  itinerary: [
    {
      step: 1,
      time: '7:30 AM · Day 1',
      title: 'Pick up in Hanoi Old Quarter',
      description:
        'Your guide meets you at the corner of Hang Bac and Ta Hien. Private van transfer to Sapa (~5.5 hours) with one rest stop.',
    },
    {
      step: 2,
      time: '1:30 PM · Day 1',
      title: 'Begin trek through Cat Cat village',
      description:
        'Descend into the valley through Cat Cat, stopping to meet weavers and observe traditional indigo dyeing. Gradual terrain, suitable for moderate fitness.',
    },
    {
      step: 3,
      time: '6:00 PM · Day 1',
      title: 'Homestay arrival + hearth dinner',
      description:
        "Arrive at your host family's home. Share a meal cooked over an open hearth — rice wine, grilled pork, and foraged greens. Sleep in a traditional wooden loft.",
    },
    {
      step: 4,
      time: '5:45 AM · Day 2',
      title: 'Sunrise walk + return to Hanoi',
      description:
        'Early morning walk above the cloud line for panoramic views. Breakfast with the family, then van return to Hanoi Old Quarter arriving ~6 PM.',
    },
  ],
  beforeYouBook: [
    {
      type: 'bestFor',
      title: 'Best for',
      description: 'Travellers who enjoy slow travel, cultural connection, and moderate walking on uneven terrain.',
    },
    {
      type: 'notRecommended',
      title: 'Not recommended for',
      description: 'Those with knee or hip conditions. The descent into Cat Cat is steep and uneven in places.',
    },
    {
      type: 'bring',
      title: 'What to bring',
      description:
        'Warm layer for the evening, rain jacket, and cash for any personal purchases in the village market.',
    },
    {
      type: 'wear',
      title: 'What to wear',
      description: 'Sturdy closed-toe shoes or hiking boots. Avoid sandals — paths can be muddy after rain.',
    },
    {
      type: 'cultural',
      title: 'Cultural note',
      description:
        'Ask before photographing villagers. Homestay hosts appreciate small gifts — local fruit or snacks work well.',
    },
  ],
  included: [
    'Private van transfer Hanoi ↔ Sapa',
    'English/French-speaking guide',
    'One night homestay',
    'Hearth dinner + breakfast',
    'All entrance fees',
  ],
  notIncluded: [
    'Lunch on Day 1',
    'Personal travel insurance',
    'Tips (appreciated)',
    'Fansipan cable car (optional, +$18)',
  ],
  reviews: [
    {
      quote:
        'The homestay was the highlight of our entire Vietnam trip. Minh knew every family in the village by name — it felt nothing like a tour.',
      author: 'Sophie R.',
      country: 'France',
      date: 'April 2026',
    },
    {
      quote: 'Exactly the pace I needed. No rushing, no tourist traps. The hearth dinner alone was worth the price.',
      author: 'Daniel K.',
      country: 'Germany',
      date: 'March 2026',
    },
  ],
  originalPrice: 138,
  salePrice: 117,
  discountPercent: 15,
  currency: '$',
  priceUnit: 'person',
};
```

---

## Component Structure

```typescript
export default function ProductPage() {
  return (
    <div className="flex flex-col h-full">
      {/* Scrollable content area */}
      <div className="flex-1 overflow-y-auto scrollbar-hide pb-[calc(72px+env(safe-area-inset-bottom))]">
        {/* S1 — Hero */}
        <HeroCarousel media={MOCK_PRODUCT.media} />

        {/* S2 — Header */}
        <ProductHeader
          tags={MOCK_PRODUCT.tags}
          name={MOCK_PRODUCT.name}
          shortDescription={MOCK_PRODUCT.shortDescription}
          rating={MOCK_PRODUCT.rating}
          reviewCount={MOCK_PRODUCT.reviewCount}
        />

        {/* S3 — Free cancellation */}
        {MOCK_PRODUCT.freeCancellation && (
          <div className="px-[18px] pb-[22px]">
            <div className="flex items-center gap-3 p-[12px_14px] bg-[#E1F5EE] rounded-[14px]">
              <div className="w-8 h-8 rounded-full bg-[#0F6E56] flex items-center justify-center flex-shrink-0">
                <Image src={Icons.check} width={14} height={14} className="brightness-0 invert" alt="" />
              </div>
              <div>
                <p className="text-[13px] font-medium text-[#04342C]">
                  Free cancellation up to {MOCK_PRODUCT.cancellationDeadlineHours}h before
                </p>
                <p className="text-[11px] text-[#085041]">Full refund if your plans change</p>
              </div>
            </div>
          </div>
        )}

        {/* S4 — Quick facts */}
        <QuickFactsGrid {...MOCK_PRODUCT.quickFacts} />

        {/* S5 — Experience cards */}
        <ExperienceCards highlights={MOCK_PRODUCT.highlights} />

        {/* S6 — USP */}
        <div className="px-[18px] pb-[22px]">
          <div className="border border-[#0F6E56] rounded-[14px] p-4">
            <div className="flex items-center gap-2 mb-2">
              <Image src={Icons.star} width={14} height={14} alt="" />
              <p className="text-[11px] uppercase tracking-wide text-[#0F6E56] font-medium">
                What makes this different
              </p>
            </div>
            <p className="font-serif italic text-[15px] leading-[1.55]" style={{ fontFamily: 'var(--font-serif)' }}>
              {MOCK_PRODUCT.uniqueSellingPoint}
            </p>
          </div>
        </div>

        {/* S7 — Operator */}
        <OperatorBlock {...MOCK_PRODUCT.operator} />

        {/* S8 — Guide */}
        <GuideBlock {...MOCK_PRODUCT.guide} />

        {/* S9 — Itinerary */}
        <ItineraryAccordion steps={MOCK_PRODUCT.itinerary} />

        {/* S10 — Before you book */}
        <BeforeYouBook items={MOCK_PRODUCT.beforeYouBook} />

        {/* S11 — Included */}
        <IncludedSection included={MOCK_PRODUCT.included} notIncluded={MOCK_PRODUCT.notIncluded} />

        {/* S12 — Reviews */}
        <ReviewsSection
          rating={MOCK_PRODUCT.rating}
          reviewCount={MOCK_PRODUCT.reviewCount}
          reviews={MOCK_PRODUCT.reviews}
        />
      </div>
      {/* end scroll area */}

      {/* S13 — Sticky CTA */}
      <StickyCTABar
        originalPrice={MOCK_PRODUCT.originalPrice}
        salePrice={MOCK_PRODUCT.salePrice}
        discountPercent={MOCK_PRODUCT.discountPercent}
        currency={MOCK_PRODUCT.currency}
        priceUnit={MOCK_PRODUCT.priceUnit}
      />
    </div>
  );
}
```

---

## Imports needed

```typescript
import Image from 'next/image';
import { Icons } from '@/assets/icons';
import HeroCarousel from './components/hero-carousel';
import ProductHeader from './components/product-header';
import QuickFactsGrid from './components/quick-facts-grid';
import ExperienceCards from './components/experience-cards';
import OperatorBlock from './components/operator-block';
import GuideBlock from './components/guide-block';
import ItineraryAccordion from './components/itinerary-accordion';
import BeforeYouBook from './components/before-you-book';
import IncludedSection from './components/included-section';
import ReviewsSection from './components/reviews-section';
import StickyCTABar from './components/sticky-cta-bar';
```
