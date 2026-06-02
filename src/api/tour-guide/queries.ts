import { createInfiniteQuery } from 'react-query-kit';

import { getTourGuidePage, type TourGuidePage } from './requests';

export const useTourGuideListInfinite = createInfiniteQuery<TourGuidePage, void, Error, number>({
  primaryKey: '/tour-guide',
  queryFn: ({ pageParam = 1 }) => getTourGuidePage(pageParam as number),
  getNextPageParam: (lastPage) => lastPage.nextPage,
  staleTime: 5 * 60 * 1000,
});
