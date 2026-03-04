import { createQuery } from 'react-query-kit';

import { getListVideo } from './requests';
import type { IVideo, IVideoVariables } from './types';

export const useListVideo = createQuery<IVideo[], IVideoVariables>({
  primaryKey: '/video',
  queryFn: ({ queryKey: [, variables] }) => getListVideo(variables),
});
