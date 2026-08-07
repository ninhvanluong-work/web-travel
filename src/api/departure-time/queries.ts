import { createMutation } from 'react-query-kit';

import type { ApiProductBookingDepartureTime } from '../product/booking-config-types';
import { createDepartureTime, deleteDepartureTime, updateDepartureTime } from './requests';
import type { CreateDepartureTimePayload, UpdateDepartureTimePayload } from './types';

export const useCreateDepartureTime = createMutation<ApiProductBookingDepartureTime, CreateDepartureTimePayload>({
  mutationFn: (payload) => createDepartureTime(payload),
});

export const useUpdateDepartureTime = createMutation<
  ApiProductBookingDepartureTime,
  { id: string } & UpdateDepartureTimePayload
>({
  mutationFn: ({ id, ...payload }) => updateDepartureTime(id, payload),
});

export const useDeleteDepartureTime = createMutation<void, string>({
  mutationFn: (id) => deleteDepartureTime(id),
});
