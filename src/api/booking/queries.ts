import { createMutation, createQuery } from 'react-query-kit';

import { createBooking, getBookingList } from './requests';
import type { ApiBookingDetail, IBookingListResult, IBookingQueryParams, ICreateBookingPayload } from './types';

export const useCreateBooking = createMutation<ApiBookingDetail, ICreateBookingPayload>({
  mutationFn: (payload) => createBooking(payload),
});

export const useBookingList = createQuery<IBookingListResult, IBookingQueryParams>({
  primaryKey: '/booking/list',
  queryFn: ({ queryKey: [, variables] }) => getBookingList(variables ?? {}),
  staleTime: 0,
});
