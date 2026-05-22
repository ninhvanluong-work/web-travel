import { createQuery } from 'react-query-kit';

import type { ApiElementItem } from '@/api/product/types';

import { getElements } from './requests';
import type { ElementListParams } from './types';

export const useElementList = createQuery<ApiElementItem[], ElementListParams>({
  primaryKey: '/element',
  queryFn: ({ queryKey: [, vars] }) => getElements(vars),
  staleTime: 5 * 60 * 1000,
});
