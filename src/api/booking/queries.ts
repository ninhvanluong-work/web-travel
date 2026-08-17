import { createMutation, createQuery } from 'react-query-kit';

import { createBooking, getBookingList, getBookingPaymentLogs, getBookingPayments } from './requests';
import type {
  ApiBookingDetail,
  IBookingListResult,
  IBookingPayment,
  IBookingPaymentLog,
  IBookingQueryParams,
  ICreateBookingPayload,
} from './types';

export const useCreateBooking = createMutation<ApiBookingDetail, ICreateBookingPayload>({
  mutationFn: (payload) => createBooking(payload),
});

export const useBookingList = createQuery<IBookingListResult, IBookingQueryParams>({
  primaryKey: '/booking/list',
  queryFn: ({ queryKey: [, variables] }) => getBookingList(variables ?? {}),
  staleTime: 0,
});

export const useBookingPayments = createQuery<IBookingPayment[], { bookingId: string }>({
  primaryKey: '/booking/payments',
  queryFn: ({ queryKey: [, { bookingId }] }) => getBookingPayments(bookingId),
  staleTime: 0,
});

export const useBookingPaymentLogs = createQuery<IBookingPaymentLog[], { paymentId: string }>({
  primaryKey: '/booking-payment/logs',
  queryFn: ({ queryKey: [, { paymentId }] }) => getBookingPaymentLogs(paymentId),
  staleTime: 0,
});
