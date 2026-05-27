import { request } from '../axios';
import type {
  ApiElementCreateResponse,
  ApiElementItem,
  ApiElementListResponse,
  ElementCreatePayload,
  ElementListParams,
} from './types';

export async function getElements(params?: ElementListParams): Promise<ApiElementItem[]> {
  const { data } = await request.get<ApiElementListResponse>('/element', {
    params: { isActive: true, ...params },
  });
  return data.data;
}

export async function createElement(payload: ElementCreatePayload): Promise<ApiElementItem> {
  const { data } = await request.post<ApiElementCreateResponse>('/element', payload);
  return data.data;
}
