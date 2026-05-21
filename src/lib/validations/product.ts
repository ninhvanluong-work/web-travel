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

export const ELEMENT_KEY_OPTIONS = [
  { label: 'Độ khó', value: 'difficulty' },
  { label: 'Ngôn ngữ', value: 'language' },
  { label: 'Điểm khởi hành', value: 'departure' },
  { label: 'Quy mô nhóm', value: 'groupSize' },
  { label: 'Thời lượng', value: 'duration' },
  { label: 'Giờ đón (Pickup)', value: 'pickup' },
  { label: 'Giờ trả (Drop-off)', value: 'dropOff' },
  { label: 'Số ngày', value: 'day' },
  { label: 'Số đêm', value: 'night' },
];

export const READ_BEFORE_KEY_OPTIONS = [
  { label: 'Hộ chiếu/Giấy tờ', value: 'passport' },
  { label: 'Cần mang theo', value: 'bring' },
  { label: 'Không khuyến khích cho', value: 'not_recommended' },
  { label: 'Trang phục', value: 'wear' },
  { label: 'Văn hóa/Ứng xử', value: 'cultural' },
  { label: 'Khác', value: 'other' },
];

// ── Itinerary (standalone schema, reused in productSchema) ────────────────
export const itinerarySchema = z.object({
  id: z.string().uuid().optional(),
  name: z.string().min(1, 'Tiêu đề ngày không được để trống'),
  featuredName: z.string().optional().nullable(),
  order: z.coerce.number().int().min(1).default(1),
  description: z.string().optional().nullable(),
});

// ── Product ──────────────────────────────────────────────────────────────
export const productSchema = z.object({
  name: z.string().min(1, 'Tên sản phẩm không được để trống').max(500),
  slug: z.string().min(1, 'Đường dẫn không được để trống'),
  description: z.string().optional().nullable(),
  destinationId: z.string().uuid('Điểm đến không hợp lệ').optional().nullable(),
  supplierId: z.string().uuid('Nhà cung cấp không hợp lệ').optional().nullable(),
  tourGuideIds: z.array(z.string().uuid()).optional().default([]),
  duration: z.coerce.number().int().min(1).default(1),
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
  shortDescription: z.string().max(500).optional().nullable(),
  tags: z
    .array(z.object({ id: z.string(), name: z.string() }))
    .optional()
    .default([]),
  banner: z
    .array(z.object({ url: z.string(), type: z.enum(['image', 'video']) }))
    .optional()
    .default([]),
  elements: z
    .array(z.object({ key: z.string().min(1), name: z.string() }))
    .optional()
    .default([]),
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
  title: z.string().min(1, 'Tên gói không được để trống'),
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
export type ElementFormItem = { key: string; name: string };

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
