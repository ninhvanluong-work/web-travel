import { createMutation, createQuery } from 'react-query-kit';

import type { ApiElementItem } from '@/api/product/types';

import { createElement, getElements } from './requests';
import type { ElementCreatePayload, ElementListParams } from './types';

export const useElementList = createQuery<ApiElementItem[], ElementListParams>({
  primaryKey: '/element',
  queryFn: ({ queryKey: [, vars] }) => getElements(vars),
  staleTime: 5 * 60 * 1000,
});

export const useCreateElement = createMutation<ApiElementItem, ElementCreatePayload>({
  mutationFn: (payload) => createElement(payload),
});
