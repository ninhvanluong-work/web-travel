// ── Raw API types — GET /supplier ────────────────────────────────────────────

export interface ApiSupplierItem {
  id: string;
  createdAt: string;
  updatedAt: string;
  deletedAt: string | null;
  name: string;
  contact: string;
  avatar: string | null;
  ratingCount: number;
  ratingRate: number;
  isVerified: boolean;
  tourOffered: number;
  responseRate: number;
  expYears: number;
}

export interface ApiSupplierListResponse {
  data: {
    items: ApiSupplierItem[];
    pagination: {
      page: number;
      pageSize: number;
      total: number;
      totalPages: number;
    };
  };
  code: number;
  message: string;
  error: string | null;
}

export interface ApiSupplierDetailResponse {
  data: ApiSupplierItem;
  code: number;
  message: string;
  error: string | null;
}

export interface ApiSupplierDeleteResponse {
  data: null;
  code: number;
  message: string;
  error: string | null;
}

// ── Domain model ──────────────────────────────────────────────────────────────

export interface ISupplier {
  id: string;
  createdAt: string;
  updatedAt: string;
  name: string;
  contact: string;
  avatar: string | null;
  ratingCount: number;
  ratingRate: number;
  isVerified: boolean;
  tourOffered: number;
  responseRate: number;
  expYears: number;
}

export interface ISupplierPagination {
  page: number;
  pageSize: number;
  total: number;
  totalPages: number;
}

export interface ISupplierListResult {
  items: ISupplier[];
  pagination: ISupplierPagination;
}

export interface ISupplierListParams {
  keyword?: string;
  page?: number;
  pageSize?: number;
}

// ── Form payload (POST / PUT) ─────────────────────────────────────────────────

export interface SupplierFormPayload {
  name: string;
  contact: string;
  avatar?: string;
}
