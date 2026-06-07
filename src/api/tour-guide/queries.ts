import { createInfiniteQuery, createMutation, createQuery } from 'react-query-kit';

import {
  createTourGuide,
  deleteTourGuide,
  getTourGuideById,
  getTourGuideList,
  getTourGuidePage,
  getTourGuideReviews,
  type TourGuidePage,
  updateTourGuide,
} from './requests';
import type {
  ApiTourGuideDetail,
  ITourGuideListParams,
  ITourGuideListResult,
  ITourGuideProfile,
  ITourGuideReviewParams,
  ITourGuideReviewResult,
  TourGuideFormPayload,
} from './types';

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

export const useTourGuideList = createQuery<ITourGuideListResult, ITourGuideListParams>({
  primaryKey: '/tour-guide/list',
  queryFn: ({ queryKey: [, variables] }) => getTourGuideList(variables ?? {}),
  staleTime: 2 * 60 * 1000,
});

export const useCreateTourGuide = createMutation<ApiTourGuideDetail, TourGuideFormPayload>({
  mutationFn: (payload) => createTourGuide(payload),
});

export const useUpdateTourGuide = createMutation<ApiTourGuideDetail, { id: string; payload: TourGuideFormPayload }>({
  mutationFn: ({ id, payload }) => updateTourGuide(id, payload),
});

export const useDeleteTourGuide = createMutation<void, { id: string }>({
  mutationFn: ({ id }) => deleteTourGuide(id),
});

export const useTourGuideReviews = createQuery<ITourGuideReviewResult, ITourGuideReviewParams>({
  primaryKey: '/tour-guide/reviews',
  queryFn: ({ queryKey: [, variables] }) => getTourGuideReviews(variables!),
  staleTime: 2 * 60 * 1000,
});
