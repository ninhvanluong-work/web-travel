import { request } from '../axios';
import type {
  ApiSupplierPaymentDeleteResponse,
  ApiSupplierPaymentListResponse,
  ApiSupplierPaymentSingleResponse,
  ISupplierPayment,
  ISupplierPaymentListParams,
  ISupplierPaymentListResult,
  SupplierPaymentPayload,
} from './types';

export async function getSupplierPaymentList(params: ISupplierPaymentListParams): Promise<ISupplierPaymentListResult> {
  const cleanParams = Object.fromEntries(
    Object.entries(params).filter(([, v]) => v !== '' && v !== undefined && v !== null)
  );
  const { data } = await request.get<ApiSupplierPaymentListResponse>('/supplier-payment', { params: cleanParams });
  return {
    items: data.data.items,
    pagination: data.data.pagination,
  };
}

export async function createSupplierPayment(payload: SupplierPaymentPayload): Promise<ISupplierPayment> {
  const { data } = await request.post<ApiSupplierPaymentSingleResponse>('/supplier-payment', payload);
  return data.data;
}

export async function updateSupplierPayment(id: string, payload: SupplierPaymentPayload): Promise<ISupplierPayment> {
  const { data } = await request.put<ApiSupplierPaymentSingleResponse>(`/supplier-payment/${id}`, payload);
  return data.data;
}

export async function deleteSupplierPayment(id: string): Promise<void> {
  await request.delete<ApiSupplierPaymentDeleteResponse>(`/supplier-payment/${id}`);
}
