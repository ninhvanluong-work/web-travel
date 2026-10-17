import { ensureAdminAuth } from '../admin-auth-guard';
import { request } from '../axios';
import type {
  ApiDestinationDetailResponse,
  ApiDestinationItem,
  ApiDestinationListResponse,
  DestinationFormPayload,
  IDestination,
  IDestinationListParams,
  IDestinationListResult,
} from './types';

const toDestination = (item: ApiDestinationItem): IDestination => ({
  id: item.id,
  name: item.name,
  description: item.description ?? '',
  createdAt: item.createdAt,
  updatedAt: item.updatedAt,
  createdBy: item.createdBy ?? null,
  updatedBy: item.updatedBy ?? null,
});

export async function getDestinationList(params: IDestinationListParams): Promise<IDestinationListResult> {
  const cleanParams = Object.fromEntries(
    Object.entries(params).filter(([, v]) => v !== '' && v !== undefined && v !== null)
  );
  const { data } = await request.get<ApiDestinationListResponse>('/destination', { params: cleanParams });
  return {
    items: data.data.items.map(toDestination),
    pagination: data.data.pagination,
  };
}

export async function getDestinationById(id: string): Promise<IDestination> {
  const { data } = await request.get<ApiDestinationDetailResponse>(`/destination/${id}`);
  return toDestination(data.data);
}

export async function createDestination(payload: DestinationFormPayload): Promise<IDestination> {
  ensureAdminAuth();
  const { data } = await request.post<ApiDestinationDetailResponse>('/destination', payload);
  return toDestination(data.data);
}

export async function updateDestination(id: string, payload: DestinationFormPayload): Promise<IDestination> {
  ensureAdminAuth();
  const { data } = await request.put<ApiDestinationDetailResponse>(`/destination/${id}`, payload);
  return toDestination(data.data);
}

export async function deleteDestination(id: string): Promise<void> {
  ensureAdminAuth();
  await request.delete<ApiDestinationDetailResponse>(`/destination/${id}`);
}
