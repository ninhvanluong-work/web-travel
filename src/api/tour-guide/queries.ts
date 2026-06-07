import { createInfiniteQuery, createQuery } from 'react-query-kit';

import { getTourGuideById, getTourGuidePage, type TourGuidePage } from './requests';
import type { ITourGuideProfile } from './types';

export const useTourGuideListInfinite = createInfiniteQuery<TourGuidePage, void, Error, number>({
  primaryKey: '/tour-guide',
  queryFn: ({ pageParam = 1 }) => getTourGuidePage(pageParam as number),
  getNextPageParam: (lastPage) => lastPage.nextPage,
  staleTime: 5 * 60 * 1000,
});

export const useTourGuideById = createQuery<ITourGuideProfile, { id: string }>({
  primaryKey: '/tour-guide/detail',
  queryFn: ({ queryKey: [, { id }] }) => getTourGuideById(id),
  staleTime: 5 * 60 * 1000,
});
