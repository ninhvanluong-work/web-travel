import { createMutation, createQuery } from 'react-query-kit';

import { createOption, deleteOption, getOptionById, updateOption } from './requests';
import type { ApiOptionDetail, CreateOptionPayload, UpdateOptionPayload } from './types';

export const useOptionDetail = createQuery<ApiOptionDetail, { id: string }>({
  primaryKey: '/option',
  queryFn: ({ queryKey: [, variables] }) => getOptionById(variables.id),
});

export const useCreateOption = createMutation<ApiOptionDetail, CreateOptionPayload>({
  mutationFn: (payload) => createOption(payload),
});

export const useUpdateOption = createMutation<ApiOptionDetail, { id: string } & UpdateOptionPayload>({
  mutationFn: ({ id, ...payload }) => updateOption(id, payload),
});

export const useDeleteOption = createMutation<void, string>({
  mutationFn: (id) => deleteOption(id),
});
