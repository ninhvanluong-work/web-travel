import { z } from 'zod';

export const PRODUCT_STATUS = {
  draft: 'draft',
  published: 'published',
} as const;

export const DURATION_TYPES = [
  { label: 'Ngày', value: 'day' },
  { label: 'Đêm', value: 'night' },
  { label: 'Giờ', value: 'hour' },
];

export const STATUS_OPTIONS = [
  { label: 'Bản nháp', value: 'draft' },
  { label: 'Công khai', value: 'published' },
];

export const CURRENCY_OPTIONS = [
  { label: 'VND', value: 'VND' },
  { label: 'USD', value: 'USD' },
];

// ── Product ──────────────────────────────────────────────────────────────
export const productSchema = z.object({
  name: z.string().min(1, 'Tên sản phẩm không được để trống').max(500),
  slug: z.string().min(1, 'Đường dẫn không được để trống'),
  code: z.string().max(255).optional().nullable(),
  description: z.string().optional().nullable(),
  destination_id: z.string().uuid('Điểm đến không hợp lệ').optional().nullable(),
  supplier_id: z.string().uuid('Nhà cung cấp không hợp lệ').optional().nullable(),
  duration: z.coerce.number().int().min(1, 'Thời lượng phải ≥ 1').default(1),
  duration_type: z.string().default('day'),
  highlight: z.string().optional().nullable(),
  include: z.string().optional().nullable(),
  exclude: z.string().optional().nullable(),
  min_price: z.coerce.number().min(0, 'Giá không được âm').default(0),
  review_point: z.coerce.number().min(0).max(5).default(0),
  status: z.enum(['draft', 'published', 'hidden']).default('draft'),
  thumbnail: z.string().optional().nullable(),
  itinerary_image: z.string().optional().nullable(),
  // Internal form representation: array of objects for useFieldArray
  images: z
    .array(z.object({ url: z.string() }))
    .optional()
    .nullable(),
});

// ── Option (gói giá) ──────────────────────────────────────────────────────
export const optionSchema = z.object({
  id: z.string().uuid().optional(),
  title: z.string().min(1, 'Tên gói không được để trống'),
  description: z.string().optional().nullable(),
  adult_price: z.coerce.number().min(0).default(0),
  child_price: z.coerce.number().min(0).default(0),
  infant_price: z.coerce.number().min(0).default(0),
  currency: z.string().default('VND'),
  order: z.coerce.number().int().min(0).default(0),
});

// ── Itinerary (lịch trình) ────────────────────────────────────────────────
export const itinerarySchema = z.object({
  id: z.string().uuid().optional(),
  name: z.string().min(1, 'Tiêu đề ngày không được để trống'),
  featured_name: z.string().optional().nullable(),
  order: z.coerce.number().int().min(1).default(1),
  description: z.string().optional().nullable(),
});

export type ProductFormValues = z.infer<typeof productSchema>;
export type OptionFormValues = z.infer<typeof optionSchema>;
export type ItineraryFormValues = z.infer<typeof itinerarySchema>;

// ── Storage Types ──────────────────────────────────────────────────────────
export type ProductRow = Omit<ProductFormValues, 'images'> & {
  id: string;
  created_at: string;
  updated_at: string;
  images?: string[] | null;
  options?: OptionFormValues[];
  itineraries?: ItineraryFormValues[];
  supplier?: { id: string; name: string };
  destination?: { id: string; name: string };
};

export type LookupItem = { id: string; name: string };

// ── localStorage helpers ───────────────────────────────────────────────────
const PRODUCTS_KEY = 'admin_products';
const SUPPLIERS_KEY = 'admin_suppliers';
const DESTINATIONS_KEY = 'admin_destinations';

export const getProducts = (): ProductRow[] => {
  if (typeof window === 'undefined') return [];
  try {
    return JSON.parse(localStorage.getItem(PRODUCTS_KEY) || '[]');
  } catch {
    return [];
  }
};

export const saveProducts = (data: ProductRow[]) => {
  localStorage.setItem(PRODUCTS_KEY, JSON.stringify(data));
};

const FAKE_SUPPLIERS: LookupItem[] = [
  { id: 'sup-001', name: 'Vietravel' },
  { id: 'sup-002', name: 'Saigontourist' },
  { id: 'sup-003', name: 'Fiditour' },
  { id: 'sup-004', name: 'Tugo Travel' },
  { id: 'sup-005', name: 'BenThanh Tourist' },
  { id: 'sup-006', name: 'Vietnamtourism' },
  { id: 'sup-007', name: 'Lux Travel DMC' },
  { id: 'sup-008', name: 'Exotissimo' },
];

const FAKE_DESTINATIONS: LookupItem[] = [
  { id: 'dest-001', name: 'Hà Nội' },
  { id: 'dest-002', name: 'Hồ Chí Minh' },
  { id: 'dest-003', name: 'Đà Nẵng' },
  { id: 'dest-004', name: 'Hội An' },
  { id: 'dest-005', name: 'Nha Trang' },
  { id: 'dest-006', name: 'Phú Quốc' },
  { id: 'dest-007', name: 'Đà Lạt' },
  { id: 'dest-008', name: 'Huế' },
  { id: 'dest-009', name: 'Hạ Long' },
  { id: 'dest-010', name: 'Sa Pa' },
  { id: 'dest-011', name: 'Mũi Né' },
  { id: 'dest-012', name: 'Quy Nhơn' },
  { id: 'dest-013', name: 'Côn Đảo' },
  { id: 'dest-014', name: 'Phong Nha' },
];

export const getSuppliers = (): LookupItem[] => {
  if (typeof window === 'undefined') return FAKE_SUPPLIERS;
  try {
    const stored = JSON.parse(localStorage.getItem(SUPPLIERS_KEY) || '[]') as LookupItem[];
    return stored.length > 0 ? stored : FAKE_SUPPLIERS;
  } catch {
    return FAKE_SUPPLIERS;
  }
};

export const getDestinations = (): LookupItem[] => {
  if (typeof window === 'undefined') return FAKE_DESTINATIONS;
  try {
    const stored = JSON.parse(localStorage.getItem(DESTINATIONS_KEY) || '[]') as LookupItem[];
    return stored.length > 0 ? stored : FAKE_DESTINATIONS;
  } catch {
    return FAKE_DESTINATIONS;
  }
};

// ── Slug generator (Vietnamese-aware) ────────────────────────────────────
export const generateSlug = (name: string): string =>
  name
    .toLowerCase()
    .normalize('NFD')
    .replace(/\p{Diacritic}/gu, '')
    .replace(/đ/gi, 'd')
    .replace(/[^a-z0-9\s-]/g, '')
    .replace(/\s+/g, '-')
    .replace(/-+/g, '-')
    .trim();
