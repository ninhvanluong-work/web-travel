import type { BookItemType } from './types';

export interface MockProduct {
  media: { type: 'image' | 'video'; url: string; poster?: string }[];
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
  highlights: { image?: string; title: string; subtitle: string }[];
  uniqueSellingPoint: string;
  operator: {
    initials: string;
    name: string;
    avatar?: string | null;
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
  } | null;
  itinerary: { step: number; time: string; title: string; description: string }[];
  beforeYouBook: { type: BookItemType; title: string; description: string }[];
  included: string[];
  notIncluded: string[];
  originalPrice: number;
  salePrice: number;
  discountPercent: number;
  currency: string;
  priceUnit: string;
}

export const MOCK_PRODUCT: MockProduct = {
  media: [
    {
      type: 'video',
      url: 'https://web-travel.b-cdn.net/village-tour.mp4',
      poster: 'https://images.unsplash.com/photo-1528360983277-13d401cdc186?w=800&q=80',
    },
    { type: 'image', url: 'https://images.unsplash.com/photo-1528360983277-13d401cdc186?w=800&q=80' },
    { type: 'image', url: 'https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=800&q=80' },
    { type: 'image', url: 'https://images.unsplash.com/photo-1540206395-68808572332f?w=800&q=80' },
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
    { title: 'Village trekking', subtitle: 'Through 3 Hmong villages' },
    { title: 'Hearth dinner', subtitle: 'Cooked over open fire' },
    { title: 'Homestay night', subtitle: 'Sleep in a local home' },
    { title: 'Sunrise panorama', subtitle: "Sapa's most beautiful moment" },
  ],
  uniqueSellingPoint:
    'The only tour where you sleep in the home of a Hmong elder who has practised traditional weaving for 40 years.',
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
        'Your guide meets you at the corner of Hang Bac and Ta Hien. Private van transfer to Sapa (~5.5 hours) with one rest stop en route.',
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
  notIncluded: ['Lunch on Day 1', 'Personal travel insurance', 'Tips (appreciated)', 'Fansipan cable car (optional)'],
  originalPrice: 138,
  salePrice: 117,
  discountPercent: 15,
  currency: '$',
  priceUnit: 'person',
};
