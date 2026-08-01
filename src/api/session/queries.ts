import { createQuery } from 'react-query-kit';

import { getSessions } from './requests';
import type { ApiSessionData, ISessionParams } from './types';

export const useSessions = createQuery<ApiSessionData, ISessionParams>({
  primaryKey: '/session',
  queryFn: ({ queryKey: [, variables] }) => getSessions(variables),
});
