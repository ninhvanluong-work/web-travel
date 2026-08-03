import { createMutation, createQuery } from 'react-query-kit';

import { capturePaypalOrder, createPaypalOrder, getPaypalConfig } from './requests';
import type { ApiPaypalCaptureOrderResponse, ApiPaypalConfig } from './types';

export const usePaypalConfig = createQuery<ApiPaypalConfig>({
  primaryKey: '/payment/paypal/config',
  queryFn: () => getPaypalConfig(),
});

export const useCreatePaypalOrder = createMutation<string, { bookingId: string }>({
  mutationFn: ({ bookingId }) => createPaypalOrder(bookingId),
});

export const useCapturePaypalOrder = createMutation<
  ApiPaypalCaptureOrderResponse['data'],
  { bookingId: string; orderId: string }
>({
  mutationFn: ({ bookingId, orderId }) => capturePaypalOrder(bookingId, orderId),
});
