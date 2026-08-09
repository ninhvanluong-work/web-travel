import { request } from '../axios';
import type {
  ApiSupplierDeleteResponse,
  ApiSupplierDetailResponse,
  ApiSupplierListResponse,
  ISupplier,
  ISupplierListParams,
  ISupplierListResult,
  SupplierFormPayload,
} from './types';

const toSupplier = (item: ApiSupplierDetailResponse['data']): ISupplier => ({
  id: item.id,
  createdAt: item.createdAt,
  updatedAt: item.updatedAt,
  name: item.name,
  contact: item.contact,
  avatar: item.avatar,
  ratingCount: item.ratingCount,
  ratingRate: item.ratingRate,
  isVerified: item.isVerified,
  tourOffered: item.tourOffered,
  responseRate: item.responseRate,
  expYears: item.expYears,
});

export async function getSupplierList(params: ISupplierListParams): Promise<ISupplierListResult> {
  const cleanParams = Object.fromEntries(
    Object.entries(params).filter(([, v]) => v !== '' && v !== undefined && v !== null)
  );
  const { data } = await request.get<ApiSupplierListResponse>('/supplier', { params: cleanParams });
  return {
    items: data.data.items.map(toSupplier),
    pagination: data.data.pagination,
  };
}

export async function getSupplierById(id: string): Promise<ISupplier> {
  const { data } = await request.get<ApiSupplierDetailResponse>(`/supplier/${id}`);
  return toSupplier(data.data);
}

export async function createSupplier(payload: SupplierFormPayload): Promise<ISupplier> {
  const { data } = await request.post<ApiSupplierDetailResponse>('/supplier', payload);
  return toSupplier(data.data);
}

export async function updateSupplier(id: string, payload: SupplierFormPayload): Promise<ISupplier> {
  const { data } = await request.put<ApiSupplierDetailResponse>(`/supplier/${id}`, payload);
  return toSupplier(data.data);
}

export async function deleteSupplier(id: string): Promise<void> {
  await request.delete<ApiSupplierDeleteResponse>(`/supplier/${id}`);
}
