import type {
  ApiBannerItem,
  ApiItineraryItem,
  ApiProductDetail,
  ApiReadBeforeItem,
  ApiSupplier,
  ApiTourGuide,
} from '@/api/product/types';

import type { MockProduct } from './mock-data';
import type { BookItemType } from './types';

// ── Constants ─────────────────────────────────────────────────────────────

export const TEMP_PRODUCT_ID = '3dde9474-2f66-45d2-9951-320a4ae5dc68';

// ── Helpers ───────────────────────────────────────────────────────────────

function parseListString(s: string | null | undefined): string[] {
  if (!s) return [];
  return s
    .split(',')
    .map((item) => item.trim())
    .filter(Boolean);
}

function getInitials(name: string, count = 2): string {
  return name
    .split(/\s+/)
    .slice(0, count)
    .map((w) => w[0]?.toUpperCase() ?? '')
    .join('');
}

/** Map key from readBefore API → BookItemType for BeforeYouBook component.
 *  Uses substring matching to handle snake_case keys (e.g. "what_to_bring", "not_recommended_for"). */
function getBookItemType(key: string): BookItemType {
  const k = key.toLowerCase();
  if (k.includes('passport') || k.includes('visa') || k.includes('document') || k.includes('id_card'))
    return 'passport';
  if (k.includes('not_recommended') || k.includes('warning') || k.includes('avoid') || k.includes('caution'))
    return 'notRecommended';
  if (k.includes('bring') || k.includes('pack') || k.includes('luggage') || k.includes('carry')) return 'bring';
  if (k.includes('wear') || k.includes('clothing') || k.includes('dress') || k.includes('outfit')) return 'wear';
  if (k.includes('cultural') || k.includes('culture') || k.includes('etiquette') || k.includes('custom'))
    return 'cultural';
  return 'bestFor';
}

function parseHighlights(highlight: string | null | undefined): { image?: string; title: string; subtitle: string }[] {
  if (!highlight) return [];
  return parseListString(highlight)
    .slice(0, 10)
    .map((title) => ({
      title,
      subtitle: '',
    }));
}

function mapItinerary(items: ApiItineraryItem[]): MockProduct['itinerary'] {
  return [...items]
    .sort((a, b) => a.order - b.order)
    .map((item, idx) => ({
      step: idx + 1,
      time: item.featuredName ?? `Điểm ${idx + 1}`,
      title: item.name,
      description: item.description,
    }));
}

function mapReadBefore(items: ApiReadBeforeItem[]): MockProduct['beforeYouBook'] {
  return items.map((item) => ({
    type: getBookItemType(item.key),
    title: item.title,
    description: item.description,
  }));
}

function mapGuide(guide?: ApiTourGuide): MockProduct['guide'] {
  if (!guide) {
    return {
      initials: '?',
      name: 'Guide',
      rating: 0,
      yearsExperience: 0,
      toursInArea: 0,
      area: 'Vietnam',
    };
  }
  return {
    initials: getInitials(guide.name, 1),
    name: guide.name,
    rating: guide.ratingStar,
    yearsExperience: guide.expYear,
    toursInArea: guide.ratingCount,
    area: 'Vietnam',
  };
}

function mapOperator(supplier: ApiSupplier | null): MockProduct['operator'] {
  const name = supplier?.name ?? '';
  return {
    initials: getInitials(name),
    name,
    avatar: supplier?.avatar ?? null,
    rating: supplier?.ratingRate ?? 0,
    reviewCount: supplier?.ratingCount ?? 0,
    verified: supplier?.isVerified ?? false,
    yearsOnPlatform: supplier?.expYears ?? 0,
    toursOffered: supplier?.tourOffered ?? 0,
    responseRate: supplier?.responseRate ?? 0,
  };
}

function mapMedia(banner: ApiBannerItem[], thumbnail: string | null): MockProduct['media'] {
  if (banner && banner.length > 0) {
    return banner.map((item) => ({
      type: item.type,
      url: item.url,
    }));
  }
  if (thumbnail) {
    return [{ type: 'image', url: thumbnail }];
  }
  return [];
}

// ── Main adapter ──────────────────────────────────────────────────────────

export function mapApiToProductPage(data: ApiProductDetail): MockProduct {
  const price = parseFloat(data.minPrice) || 0;

  return {
    // ── Hero ───────────────────────────────────────────────────────────────
    media: mapMedia(data.banner ?? [], data.thumbnail),

    // ── Header ────────────────────────────────────────────────────────────
    tags: (data.tags ?? []).map((t) => t.name),
    name: data.name,
    shortDescription: data.shortDescription ?? data.description ?? '',
    rating: data.reviewPoint ?? 0,
    reviewCount: data.reviewCount ?? 0,

    // ── Cancellation ──────────────────────────────────────────────────────
    freeCancellation: false,
    cancellationDeadlineHours: 24,

    // ── Quick Facts ───────────────────────────────────────────────────────
    quickFacts: {
      duration: `${data.duration} ${data.durationType}`,
      departurePoint: '—',
      pickupTime: '—',
      groupSize: '—',
      languages: ['VI'],
      difficulty: '—',
    },

    // ── Highlights ────────────────────────────────────────────────────────
    highlights: [],

    // ── USP ───────────────────────────────────────────────────────────────
    uniqueSellingPoint: data.highlight ?? '',

    // ── Operator ──────────────────────────────────────────────────────────
    operator: mapOperator(data.supplier ?? null),

    // ── Guide ─────────────────────────────────────────────────────────────
    guide: mapGuide(data.tourGuides?.[0]),

    // ── Itinerary ─────────────────────────────────────────────────────────
    itinerary: mapItinerary(data.itineraries ?? []),

    // ── Before you book ───────────────────────────────────────────────────
    beforeYouBook: mapReadBefore(data.readBefore ?? []),

    // ── Included / Not included ───────────────────────────────────────────
    included: parseListString(data.include),
    notIncluded: parseListString(data.exclude),

    // ── Pricing ───────────────────────────────────────────────────────────
    originalPrice: price > 0 ? Math.round(price / 0.85) : 138,
    salePrice: price > 0 ? price : 117,
    discountPercent: 15,
    currency: '$',
    priceUnit: 'person',
  };
}
