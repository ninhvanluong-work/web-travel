import { createQuery } from 'react-query-kit';

import { getListVideo } from './requests';
import type { IVideo } from './types';

export const useListVideo = createQuery<IVideo[]>({
  primaryKey: '/videos',
  queryFn: getListVideo,
});
