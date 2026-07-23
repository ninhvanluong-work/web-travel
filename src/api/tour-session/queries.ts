import { createQuery } from 'react-query-kit';

import { getTourSessions } from './requests';
import type { ApiTourSessionData, ITourSessionParams } from './types';

export const useTourSessions = createQuery<ApiTourSessionData, ITourSessionParams>({
  primaryKey: '/tour-session',
  queryFn: ({ queryKey: [, variables] }) => getTourSessions(variables),
});
