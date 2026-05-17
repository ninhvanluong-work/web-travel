// ── Domain model (list) ───────────────────────────────────────────────────
export interface IProduct {
  id: string;
  name: string;
  slug: string | null;
  code: string | null;
  thumbnail: string | null;
  minPrice: number;
  status: 'draft' | 'published' | 'hidden';
  reviewPoint: number;
  destination: { id: string; name: string } | null;
  supplier: { id: string; name: string } | null;
  createdAt: string;
  updatedAt: string;
}

export interface IProductPagination {
  page: number;
  pageSize: number;
  total: number;
  totalPages: number;
}

export interface IProductListResult {
  items: IProduct[];
  pagination: IProductPagination;
}

// ── Query params ──────────────────────────────────────────────────────────
export interface IProductListParams {
  keyword?: string;
  page?: number;
  pageSize?: number;
  supplierId?: string;
  destinationId?: string;
  status?: string;
  fromDate?: string;
  toDate?: string;
}

// ── Supplier ──────────────────────────────────────────────────────────────
export interface ApiSupplier {
  id: string;
  name: string;
  contact: string | null;
  avatar: string | null;
  ratingCount: number;
  ratingRate: number;
  isVerified: boolean;
  tourOffered: number;
  responseRate: number;
  expYears: number;
}

// ── Product detail sub-types ──────────────────────────────────────────────
export interface ApiBannerItem {
  url: string;
  type: 'image' | 'video';
}

export interface ApiReadBeforeItem {
  key: string;
  title: string;
  description: string;
}

export interface ApiItineraryItem {
  id: string;
  createdAt: string;
  updatedAt: string;
  deletedAt: string | null;
  name: string;
  featuredName: string;
  order: number;
  description: string;
  productId: string;
}

export interface ApiTagItem {
  id: string;
  createdAt: string;
  updatedAt: string;
  deletedAt: string | null;
  name: string;
}

export interface ApiTourGuide {
  id: string;
  createdAt: string;
  updatedAt: string;
  deletedAt: string | null;
  name: string;
  avatar: string | null;
  ratingCount: number;
  expYear: number;
  ratingStar: number;
}

// ── Full product detail (GET /product/:id, POST/PATCH response) ───────────
export interface ApiProductDetail {
  id: string;
  createdAt: string;
  updatedAt: string;
  deletedAt: string | null;
  name: string;
  description: string | null;
  shortDescription: string | null;
  slug: string;
  thumbnail: string | null;
  code: string | null;
  images: string[];
  banner: ApiBannerItem[];
  readBefore: ApiReadBeforeItem[];
  itineraryImage: string | null;
  duration: number;
  durationType: string;
  highlight: string | null;
  include: string | null;
  exclude: string | null;
  status: 'draft' | 'published' | 'hidden';
  minPrice: string; // server returns decimal string e.g. "1500000.00"
  reviewPoint: number; // computed from user reviews, read-only
  reviewCount: number;
  destinationId: string | null;
  supplierId: string | null;
  supplier: ApiSupplier | null;
  itineraries: ApiItineraryItem[];
  tags: ApiTagItem[];
  tourGuides: ApiTourGuide[];
}

// ── Product review ────────────────────────────────────────────────────────
export interface IProductReview {
  id: string;
  comment: string;
  point: number;
  date: string; // formatted from createdAt e.g. "April 2026"
}

export interface IProductReviewResult {
  items: IProductReview[];
  pagination: IProductPagination;
}

export interface IProductReviewParams {
  id: string;
  pageSize?: number;
}

interface ApiProductReviewItem {
  id: string;
  createdAt: string;
  updatedAt: string;
  comment: string;
  point: number;
}

export interface ApiProductReviewListResponse {
  data: {
    items: ApiProductReviewItem[];
    pagination: IProductPagination;
  };
  code: number;
  error: string | null;
  message: string;
}

// ── Raw API list response ─────────────────────────────────────────────────
export interface ApiProductItem extends Omit<IProduct, 'minPrice'> {
  minPrice: string | number;
}

export interface ApiProductListResponse {
  data: {
    items: ApiProductItem[];
    pagination: IProductPagination;
  };
  code: number;
  error: string | null;
  message: string;
}
