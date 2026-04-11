import { z } from 'zod';

export const PRODUCT_STATUS = {
  draft: 'draft',
  published: 'published',
  hidden: 'hidden',
} as const;

export const DURATION_TYPES = [
  { label: 'Ngày', value: 'day' },
  { label: 'Đêm', value: 'night' },
  { label: 'Giờ', value: 'hour' },
];

export const STATUS_OPTIONS = [
  { label: 'Bản nháp', value: 'draft' },
  { label: 'Công khai', value: 'published' },
  { label: 'Ẩn', value: 'hidden' },
];

export const CURRENCY_OPTIONS = [
  { label: 'VND', value: 'VND' },
  { label: 'USD', value: 'USD' },
];

// ── Product ──────────────────────────────────────────────────────────────
export const productSchema = z.object({
  name: z.string().min(1, 'Tên sản phẩm không được để trống').max(500),
  slug: z.string().min(1, 'Đường dẫn không được để trống'),
  description: z.string().optional().nullable(),
  destinationId: z.string().uuid('Điểm đến không hợp lệ').optional().nullable(),
  supplierId: z.string().uuid('Nhà cung cấp không hợp lệ').optional().nullable(),
  duration: z.coerce.number().int().min(1, 'Thời lượng phải ≥ 1').default(1),
  durationType: z.string().default('day'),
  highlight: z.string().optional().nullable(),
  include: z.string().optional().nullable(),
  exclude: z.string().optional().nullable(),
  minPrice: z.coerce.number().min(0, 'Giá không được âm').default(0),
  status: z.enum(['draft', 'published', 'hidden']).default('draft'),
  thumbnail: z.string().optional().nullable(),
  itineraryImage: z.string().optional().nullable(),
  images: z
    .array(z.object({ url: z.string() }))
    .optional()
    .nullable(),
  videoId: z.string().optional().nullable(),
});

// ── Option (gói giá) ──────────────────────────────────────────────────────
export const optionSchema = z.object({
  id: z.string().uuid().optional(),
  title: z.string().min(1, 'Tên gói không được để trống'),
  description: z.string().optional().nullable(),
  adultPrice: z.coerce.number().min(0).default(0),
  childPrice: z.coerce.number().min(0).default(0),
  infantPrice: z.coerce.number().min(0).default(0),
  currency: z.string().default('VND'),
  order: z.coerce.number().int().min(0).default(0),
});

// ── Itinerary (lịch trình) ────────────────────────────────────────────────
export const itinerarySchema = z.object({
  id: z.string().uuid().optional(),
  name: z.string().min(1, 'Tiêu đề ngày không được để trống'),
  featuredName: z.string().optional().nullable(),
  order: z.coerce.number().int().min(1).default(1),
  description: z.string().optional().nullable(),
});

export type ProductFormValues = z.infer<typeof productSchema>;
export type OptionFormValues = z.infer<typeof optionSchema>;
export type ItineraryFormValues = z.infer<typeof itinerarySchema>;

export type LookupItem = { id: string; name: string };

// ── Slug generator (Vietnamese-aware) ────────────────────────────────────
export const generateSlug = (name: string): string =>
  name
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/đ/gi, 'd')
    .replace(/[^a-z0-9\s-]/g, '')
    .replace(/\s+/g, '-')
    .replace(/-+/g, '-')
    .trim();
