import { request } from '../axios';
import type {
  ApiBookingDetail,
  ApiBookingPaymentListResponse,
  ApiBookingPaymentLogsResponse,
  ApiBookingResponse,
  IBookingListResponse,
  IBookingListResult,
  IBookingPayment,
  IBookingPaymentLog,
  IBookingQueryParams,
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

export async function getBookingPayments(bookingId: string): Promise<IBookingPayment[]> {
  const { data } = await request.get<ApiBookingPaymentListResponse>(`/booking/${bookingId}/payment`);
  return data.data;
}

export async function getBookingPaymentLogs(paymentId: string): Promise<IBookingPaymentLog[]> {
  const { data } = await request.get<ApiBookingPaymentLogsResponse>(`/booking-payment/${paymentId}/logs`);
  return data.data;
}
