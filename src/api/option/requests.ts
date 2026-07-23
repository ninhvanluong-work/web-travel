import { request } from '../axios';
import type { ApiOptionDetail, CreateOptionPayload } from './types';

export async function createOption(payload: CreateOptionPayload): Promise<ApiOptionDetail> {
  const { data } = await request.post<{ data: ApiOptionDetail }>('/option', payload);
  return data.data;
}
