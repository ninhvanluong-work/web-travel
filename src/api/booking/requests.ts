import { ensureAdminAuth } from '../admin-auth-guard';
import { request } from '../axios';
import type {
  ApiBookingDetail,
  ApiBookingPaymentListResponse,
  ApiBookingPaymentLogsResponse,
  ApiBookingResponse,
  ApiCancelBookingResponse,
  IBookingListItem,
  IBookingListResponse,
  IBookingListResult,
  IBookingPayment,
  IBookingPaymentLog,
  IBookingQueryParams,
  ICancelBookingPayload,
  ICreateBookingPayload,
} from './types';

export async function createBooking(payload: ICreateBookingPayload): Promise<ApiBookingDetail> {
  const { data } = await request.post<ApiBookingResponse>('/booking', payload);
  return data.data;
}

export async function getBookingList(params: IBookingQueryParams): Promise<IBookingListResult> {
  const cleanParams = Object.fromEntries(
    Object.entries(params).filter(([, v]) => v !== '' && v !== undefined && v !== null)
  );
  const { data } = await request.get<IBookingListResponse>('/booking', { params: cleanParams });
  return { items: data.data.items, pagination: data.data.pagination, stats: data.data.stats };
}

/** Admin only: cancels a pending booking (400 "Booking is not pending" otherwise). */
export async function cancelBooking({ id, reason }: ICancelBookingPayload): Promise<IBookingListItem> {
  ensureAdminAuth();
  const { data } = await request.post<ApiCancelBookingResponse>(`/booking/${id}/cancel`, { reason });
  return data.data;
}

export async function getBookingPayments(bookingId: string): Promise<IBookingPayment[]> {
  const { data } = await request.get<ApiBookingPaymentListResponse>(`/booking/${bookingId}/payment`);
  return data.data;
}

export async function getBookingPaymentLogs(paymentId: string): Promise<IBookingPaymentLog[]> {
  const { data } = await request.get<ApiBookingPaymentLogsResponse>(`/booking-payment/${paymentId}/logs`);
  return data.data;
}
