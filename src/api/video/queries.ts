import { createInfiniteQuery, createQuery } from 'react-query-kit';

import { getListVideo, getVideoPage } from './requests';
import type { IVideo, IVideoPage, IVideoVariables, IVideoVariablesInfinite } from './types';

export const useListVideo = createQuery<IVideo[], IVideoVariables>({
  primaryKey: '/video',
  queryFn: ({ queryKey: [, variables] }) => getListVideo(variables),
});

export const useInfiniteListVideo = createInfiniteQuery<IVideoPage, IVideoVariablesInfinite, Error, number | undefined>(
  {
    primaryKey: '/video/infinite',
    queryFn: ({ queryKey: [, variables], pageParam }) =>
      getVideoPage({ ...variables, distanceScore: pageParam as number | undefined }),
    getNextPageParam: (lastPage) => lastPage.nextCursor ?? undefined,
  }
);
