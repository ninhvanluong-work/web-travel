import { z } from 'zod';

export const PRODUCT_STATUS = {
  draft: 'draft',
  published: 'published',
  hidden: 'hidden',
} as const;

export const STATUS_OPTIONS = [
  { label: 'Bản nháp', value: 'draft' },
  { label: 'Công khai', value: 'published' },
  { label: 'Ẩn', value: 'hidden' },
];

export const CURRENCY_OPTIONS = [
  { label: 'VND', value: 'VND' },
  { label: 'USD', value: 'USD' },
];

export const ELEMENT_KEY_OPTIONS = [
  { label: 'Difficulty', value: 'difficulty' },
  { label: 'Language', value: 'language' },
  { label: 'Departure', value: 'departure' },
  { label: 'Group size', value: 'groupSize' },
  { label: 'Duration', value: 'duration' },
  { label: 'Pickup time', value: 'pickup' },
  { label: 'Drop-off time', value: 'dropOff' },
  { label: 'Days', value: 'day' },
  { label: 'Nights', value: 'night' },
];

export const READ_BEFORE_KEY_OPTIONS = [
  { label: 'Passport / ID / Documents', value: 'passport' },
  { label: 'What to bring', value: 'bring' },
  { label: 'Not recommended for', value: 'not_recommended' },
  { label: 'What to wear', value: 'wear' },
  { label: 'Cultural / Etiquette', value: 'cultural' },
  { label: 'Others', value: 'other' },
];

// ── Itinerary (standalone schema, reused in productSchema) ────────────────
export const itinerarySchema = z.object({
  id: z.string().uuid().optional(),
  name: z.string().min(1, 'Day title is required'),
  featuredName: z.string().optional().nullable(),
  order: z.coerce.number().int().min(1).default(1),
  description: z.string().optional().nullable(),
});

// ── Product ──────────────────────────────────────────────────────────────
export const productSchema = z.object({
  name: z.string().min(1, 'Product name is required').max(500),
  slug: z.string().min(1, 'URL path is required'),
  description: z.string().optional().nullable(),
  destinationId: z.string().uuid('Invalid destination').optional().nullable(),
  supplierId: z.string().uuid('Invalid supplier').optional().nullable(),
  tourGuideIds: z.array(z.string().uuid()).optional().default([]),
  highlight: z.string().optional().nullable(),
  include: z.string().optional().nullable(),
  exclude: z.string().optional().nullable(),
  minPrice: z.coerce.number().min(0, 'Price cannot be negative').default(0),
  status: z.enum(['draft', 'published', 'hidden']).default('draft'),
  thumbnail: z.string().optional().nullable(),
  itineraryImage: z.string().optional().nullable(),
  images: z
    .array(z.object({ url: z.string() }))
    .optional()
    .nullable(),
  videoId: z.string().optional().nullable(),
  shortDescription: z.string().max(500).optional().nullable(),
  tags: z
    .array(z.object({ id: z.string(), name: z.string() }))
    .optional()
    .default([]),
  banner: z
    .array(z.object({ url: z.string(), type: z.enum(['image', 'video']) }))
    .optional()
    .default([]),
  elementIds: z.array(z.string().uuid()).optional().default([]),
  experiences: z
    .array(
      z.object({
        imageUrl: z.string().optional().nullable(),
        title: z.string().min(1, 'Title required'),
        content: z.string().optional().nullable(),
      })
    )
    .optional()
    .default([]),
  itineraries: z.array(itinerarySchema).optional().default([]),
  readBefores: z
    .array(
      z.object({
        key: z.string().min(1),
        title: z.string().optional().nullable(),
        description: z.string().optional().nullable(),
      })
    )
    .optional()
    .default([]),
});

export const optionSchema = z.object({
  id: z.string().uuid().optional(),
  title: z.string().min(1, 'Package name is required'),
  description: z.string().optional().nullable(),
  adultPrice: z.coerce.number().min(0).default(0),
  childPrice: z.coerce.number().min(0).default(0),
  infantPrice: z.coerce.number().min(0).default(0),
  currency: z.string().default('VND'),
  order: z.coerce.number().int().min(0).default(0),
  originalPrice: z.coerce.number().min(0).optional().nullable(),
});

export type ProductFormValues = z.infer<typeof productSchema>;
export type OptionFormValues = z.infer<typeof optionSchema>;
export type ItineraryFormValues = z.infer<typeof itinerarySchema>;

export type ExperienceFormValues = {
  imageUrl?: string | null;
  title: string;
  content?: string | null;
};

export type ReadBeforeFormValues = {
  key: string;
  title?: string | null;
  description?: string | null;
};

export type BannerFormValues = {
  url: string;
  type: 'image' | 'video';
};

export type LookupItem = { id: string; name: string };

// ── Slug generator (Vietnamese-aware) ────────────────────────────────────
export const generateSlug = (name: string): string =>
  name
    .toLowerCase()
    .normalize('NFD')
    .replace(/[̀-ͯ]/g, '')
    .replace(/đ/gi, 'd')
    .replace(/[^a-z0-9\s-]/g, '')
    .replace(/\s+/g, '-')
    .replace(/-+/g, '-')
    .trim();
