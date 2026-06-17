import type {
  ApiBannerItem,
  ApiElementItem,
  ApiExperienceItem,
  ApiItineraryItem,
  ApiProductDetail,
  ApiReadBeforeItem,
  ApiSupplier,
  ApiTourGuide,
} from '@/api/product/types';

import type { MockProduct } from './mock-data';
import type { BookItemType } from './types';

// ── Constants ─────────────────────────────────────────────────────────────

// ── Helpers ───────────────────────────────────────────────────────────────

function isHtmlString(s: string): boolean {
  return /<[a-z][\s\S]*>/i.test(s);
}

function parseInclude(s: string | null | undefined): string | string[] {
  if (!s) return [];
  if (isHtmlString(s)) return s;
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

function mapExperience(items: ApiExperienceItem[]): MockProduct['highlights'] {
  return items.map((item) => ({
    image: item.imageUrl,
    title: item.title,
    subtitle: item.content,
  }));
}

function mapItinerary(items: ApiItineraryItem[]): MockProduct['itinerary'] {
  return [...items]
    .sort((a, b) => a.order - b.order)
    .map((item, idx) => ({
      step: idx + 1,
      time: item.featuredName ?? `Point ${idx + 1}`,
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
    return null;
  }
  return {
    id: guide.id,
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

function mapElements(elements: ApiElementItem[], t: (key: string, options?: any) => string): MockProduct['quickFacts'] {
  const byKey = elements.reduce<Record<string, string>>((acc, el) => {
    if (el.isActive) acc[el.key] = el.name;
    return acc;
  }, {});

  const dayVal = byKey.day;
  const nightVal = byKey.night;
  let duration = '—';
  if (dayVal || nightVal) {
    const parts: string[] = [];
    if (dayVal) {
      const d = parseInt(dayVal, 10);
      parts.push(t('dayUnit', { count: d }));
    }
    if (nightVal) {
      const n = parseInt(nightVal, 10);
      parts.push(t('nightUnit', { count: n }));
    }
    duration = parts.join(', ');
  }

  const pickup = byKey.pickup ?? '';
  const dropOff = byKey.dropOff ?? '';
  const pickupTime = pickup && dropOff ? `${pickup} → ${dropOff}` : pickup || dropOff || '—';

  let groupSize = byKey.groupSize ?? '—';
  if (groupSize !== '—' && /^\d+$/.test(groupSize)) {
    groupSize = t('upToPeople', { count: parseInt(groupSize, 10) });
  }

  const languages = byKey.language
    ? byKey.language
        .split(',')
        .map((l) => l.trim())
        .filter(Boolean)
    : ['EN'];

  return {
    duration,
    departurePoint: byKey.departure ?? '—',
    pickupTime,
    groupSize,
    languages,
    difficulty: byKey.difficulty ?? '—',
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

export function mapApiToProductPage(data: ApiProductDetail, t: (key: string, options?: any) => string): MockProduct {
  const price = parseFloat(data.minPrice) || 0;

  return {
    // ── Hero ───────────────────────────────────────────────────────────────
    media: mapMedia(data.banner ?? [], data.thumbnail),

    // ── Header ────────────────────────────────────────────────────────────
    tags: (data.tags ?? []).map((tag) => tag.name),
    name: data.name,
    shortDescription: data.shortDescription ?? data.description ?? '',
    rating: data.reviewPoint ?? 0,
    reviewCount: data.reviewCount ?? 0,

    // ── Cancellation ──────────────────────────────────────────────────────
    freeCancellation: true,
    cancellationDeadlineHours: 24,

    // ── Quick Facts ───────────────────────────────────────────────────────
    quickFacts: mapElements(data.elements ?? [], t),

    // ── Highlights ────────────────────────────────────────────────────────
    highlights: mapExperience(data.experience ?? []),

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
    included: parseInclude(data.include),
    notIncluded: parseInclude(data.exclude),

    // ── Pricing ───────────────────────────────────────────────────────────
    originalPrice: price > 0 ? Math.round(price / 0.85) : 138,
    salePrice: price > 0 ? price : 117,
    discountPercent: 15,
    currency: '$',
    priceUnit: t('personUnit'),
  };
}
