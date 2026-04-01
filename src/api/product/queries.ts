import { createQuery } from 'react-query-kit';

import { getProductList } from './requests';
import type { IProductListParams, IProductListResult } from './types';

export const useProductList = createQuery<IProductListResult, IProductListParams>({
  primaryKey: '/product',
  queryFn: ({ queryKey: [, variables] }) => getProductList(variables ?? {}),
});
