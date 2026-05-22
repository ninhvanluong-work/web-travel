import type { ApiElementItem, IProductPagination } from '@/api/product/types';

export type { ApiElementItem };

export interface ApiElementListResponse {
  data: {
    items: ApiElementItem[];
    pagination: IProductPagination;
  };
  code: number;
  error: string | null;
  message: string;
}

export interface ElementListParams {
  keyword?: string;
  pageSize?: number;
}
