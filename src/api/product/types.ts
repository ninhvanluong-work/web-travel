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

// ── Full product detail (GET /product/:id, POST/PATCH response) ───────────
export interface ApiProductDetail {
  id: string;
  createdAt: string;
  updatedAt: string;
  deletedAt: string | null;
  name: string;
  description: string | null;
  slug: string;
  thumbnail: string | null;
  code: string; // server-generated, read-only
  images: string[];
  itineraryImage: string | null;
  duration: number;
  durationType: string;
  highlight: string | null;
  include: string | null;
  exclude: string | null;
  status: 'draft' | 'published' | 'hidden';
  minPrice: string; // server returns decimal string e.g. "1500000.00"
  reviewPoint: number; // computed from user reviews, read-only
  destinationId: string | null;
  supplierId: string | null;
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
