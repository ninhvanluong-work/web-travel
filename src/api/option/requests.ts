import { ensureAdminAuth } from '../admin-auth-guard';
import { request } from '../axios';
import type { ApiOptionDetail, CreateOptionPayload, UpdateOptionPayload } from './types';

export async function getOptionById(id: string): Promise<ApiOptionDetail> {
  const { data } = await request.get<{ data: ApiOptionDetail }>(`/option/${id}`);
  return data.data;
}

export async function createOption(payload: CreateOptionPayload): Promise<ApiOptionDetail> {
  ensureAdminAuth();
  const { data } = await request.post<{ data: ApiOptionDetail }>('/option', payload);
  return data.data;
}

export async function updateOption(id: string, payload: UpdateOptionPayload): Promise<ApiOptionDetail> {
  ensureAdminAuth();
  const { data } = await request.put<{ data: ApiOptionDetail }>(`/option/${id}`, payload);
  return data.data;
}

export async function deleteOption(id: string): Promise<void> {
  ensureAdminAuth();
  await request.delete(`/option/${id}`);
}
