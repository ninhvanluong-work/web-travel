// ─── Domain model ────────────────────────────────────────────────────────────

export interface IDestination {
  id: string;
  name: string;
  description: string;
  createdAt: string;
  updatedAt: string;
  /** User id of the creator / last editor (null for seeded data) */
  createdBy: string | null;
  updatedBy: string | null;
}

export interface IDestinationPagination {
  page: number;
  pageSize: number;
  total: number;
  totalPages: number;
}

export interface IDestinationListParams {
  keyword?: string;
  page?: number;
  /** Backend rejects values greater than 50 */
  pageSize?: number;
}

export interface IDestinationListResult {
  items: IDestination[];
  pagination: IDestinationPagination;
}

export interface DestinationFormPayload {
  name: string;
  description: string;
}

// ─── Raw API types ───────────────────────────────────────────────────────────

export interface ApiDestinationItem {
  id: string;
  createdAt: string;
  updatedAt: string;
  deletedAt: string | null;
  createdBy: string | null;
  updatedBy: string | null;
  deletedBy: string | null;
  name: string;
  description: string | null;
}

interface ApiEnvelope<T> {
  data: T;
  code: number;
  error: unknown;
  message: string;
}

export type ApiDestinationListResponse = ApiEnvelope<{
  items: ApiDestinationItem[];
  pagination: IDestinationPagination;
  stats?: Record<string, unknown>;
}>;

export type ApiDestinationDetailResponse = ApiEnvelope<ApiDestinationItem>;
