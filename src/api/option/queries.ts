import { createMutation, createQuery } from 'react-query-kit';

import { createOption, getOptionById } from './requests';
import type { ApiOptionDetail, CreateOptionPayload } from './types';

export const useOptionDetail = createQuery<ApiOptionDetail, { id: string }>({
  primaryKey: '/option',
  queryFn: ({ queryKey: [, variables] }) => getOptionById(variables.id),
});

export const useCreateOption = createMutation<ApiOptionDetail, CreateOptionPayload>({
  mutationFn: (payload) => createOption(payload),
});
