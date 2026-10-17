import { createMutation, createQuery } from 'react-query-kit';

import {
  createDestination,
  deleteDestination,
  getDestinationById,
  getDestinationList,
  updateDestination,
} from './requests';
import type { DestinationFormPayload, IDestination, IDestinationListParams, IDestinationListResult } from './types';

// Named "PagedList" to avoid clashing with the lookup hook `useDestinationList` in `@/api/product/lookup`
export const useDestinationPagedList = createQuery<IDestinationListResult, IDestinationListParams>({
  primaryKey: '/destination/list',
  queryFn: ({ queryKey: [, variables] }) => getDestinationList(variables ?? {}),
  // Global default is `refetchOnMount: false`; override so returning from create/edit shows fresh data
  refetchOnMount: true,
});

export const useDestinationById = createQuery<IDestination, { id: string }>({
  primaryKey: '/destination/detail',
  queryFn: ({ queryKey: [, { id }] }) => getDestinationById(id),
});

export const useCreateDestination = createMutation<IDestination, DestinationFormPayload>({
  mutationFn: (payload) => createDestination(payload),
});

export const useUpdateDestination = createMutation<IDestination, { id: string; payload: DestinationFormPayload }>({
  mutationFn: ({ id, payload }) => updateDestination(id, payload),
});

export const useDeleteDestination = createMutation<void, { id: string }>({
  mutationFn: ({ id }) => deleteDestination(id),
});
