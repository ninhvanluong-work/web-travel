import { request } from '../axios';
import type { ApiOptionDetail, CreateOptionPayload } from './types';

export async function getOptionById(id: string): Promise<ApiOptionDetail> {
  const { data } = await request.get<{ data: ApiOptionDetail }>(`/option/${id}`);
  return data.data;
}

export async function createOption(payload: CreateOptionPayload): Promise<ApiOptionDetail> {
  const { data } = await request.post<{ data: ApiOptionDetail }>('/option', payload);
  return data.data;
}
