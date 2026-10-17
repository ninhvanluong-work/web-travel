import { createQuery } from 'react-query-kit';

import { getUserSummary } from './requests';
import type { IUserSummary } from './types';

// Cached per user id so a table full of rows by the same admin triggers a single request
export const useUserSummary = createQuery<IUserSummary, { id: string }>({
  primaryKey: '/user/summary',
  queryFn: ({ queryKey: [, { id }] }) => getUserSummary(id),
  staleTime: 10 * 60 * 1000,
  retry: false,
});
