import type { ApiElementItem } from '@/api/product/types';

export type { ApiElementItem };

export interface ApiElementListResponse {
  data: ApiElementItem[];
  code: number;
  error: string | null;
  message: string;
}

export interface ApiElementCreateResponse {
  data: ApiElementItem;
  code: number;
  error: string | null;
  message: string;
}

export interface ElementListParams {
  keyword?: string;
  pageSize?: number;
}

export interface ElementCreatePayload {
  key: string;
  name: string;
}
