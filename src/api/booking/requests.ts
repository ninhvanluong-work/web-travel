import { request } from '../axios';
import type { ApiBookingDetail, ApiBookingResponse, ICreateBookingPayload } from './types';

export async function createBooking(payload: ICreateBookingPayload): Promise<ApiBookingDetail> {
  const { data } = await request.post<ApiBookingResponse>('/booking', payload);
  return data.data;
}
