// ── Domain model ─────────────────────────────────────────────────────────────
export interface IProduct {
  id: string;
  name: string;
  slug: string | null;
  code: string | null;
  thumbnail: string | null;
  minPrice: number;
  status: 'draft' | 'published';
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

// ── Query params ──────────────────────────────────────────────────────────────
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

// ── Raw API response ──────────────────────────────────────────────────────────
// API returns minPrice as string (e.g. "1500000.00"), coerced to number in mapper
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
