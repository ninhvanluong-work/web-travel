import { createMutation } from 'react-query-kit';

import type { ApiProductBookingPickupLocation } from '../product/booking-config-types';
import { createPickupLocation, deletePickupLocation, updatePickupLocation } from './requests';
import type { CreatePickupLocationPayload, UpdatePickupLocationPayload } from './types';

export const useCreatePickupLocation = createMutation<ApiProductBookingPickupLocation, CreatePickupLocationPayload>({
  mutationFn: (payload) => createPickupLocation(payload),
});

export const useUpdatePickupLocation = createMutation<
  ApiProductBookingPickupLocation,
  { id: string } & UpdatePickupLocationPayload
>({
  mutationFn: ({ id, ...payload }) => updatePickupLocation(id, payload),
});

export const useDeletePickupLocation = createMutation<void, string>({
  mutationFn: (id) => deletePickupLocation(id),
});
