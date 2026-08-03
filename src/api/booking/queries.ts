import { createMutation } from 'react-query-kit';

import { createBooking } from './requests';
import type { ApiBookingDetail, ICreateBookingPayload } from './types';

export const useCreateBooking = createMutation<ApiBookingDetail, ICreateBookingPayload>({
  mutationFn: (payload) => createBooking(payload),
});
