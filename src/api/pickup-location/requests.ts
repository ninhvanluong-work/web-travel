import { request } from '../axios';
import type { ApiProductBookingPickupLocation } from '../product/booking-config-types';
import type { CreatePickupLocationPayload, UpdatePickupLocationPayload } from './types';

export async function createPickupLocation(
  payload: CreatePickupLocationPayload
): Promise<ApiProductBookingPickupLocation> {
  const { data } = await request.post<{ data: ApiProductBookingPickupLocation }>('/pickup-location', payload);
  return data.data;
}

export async function updatePickupLocation(
  id: string,
  payload: UpdatePickupLocationPayload
): Promise<ApiProductBookingPickupLocation> {
  const { data } = await request.put<{ data: ApiProductBookingPickupLocation }>(`/pickup-location/${id}`, payload);
  return data.data;
}

export async function deletePickupLocation(id: string): Promise<void> {
  await request.delete(`/pickup-location/${id}`);
}
