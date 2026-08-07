import { request } from '../axios';
import type { ApiProductBookingDepartureTime } from '../product/booking-config-types';
import type { CreateDepartureTimePayload, UpdateDepartureTimePayload } from './types';

export async function createDepartureTime(
  payload: CreateDepartureTimePayload
): Promise<ApiProductBookingDepartureTime> {
  const { data } = await request.post<{ data: ApiProductBookingDepartureTime }>('/departure-time', payload);
  return data.data;
}

export async function updateDepartureTime(
  id: string,
  payload: UpdateDepartureTimePayload
): Promise<ApiProductBookingDepartureTime> {
  const { data } = await request.put<{ data: ApiProductBookingDepartureTime }>(`/departure-time/${id}`, payload);
  return data.data;
}

export async function deleteDepartureTime(id: string): Promise<void> {
  await request.delete(`/departure-time/${id}`);
}
