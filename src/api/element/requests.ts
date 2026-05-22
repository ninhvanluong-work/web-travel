import { request } from '../axios';
import type { ApiElementItem, ApiElementListResponse, ElementListParams } from './types';

export async function getElements(params?: ElementListParams): Promise<ApiElementItem[]> {
  const { data } = await request.get<ApiElementListResponse>('/element', {
    params: { isActive: true, pageSize: 100, ...params },
  });
  return data.data.items;
}
