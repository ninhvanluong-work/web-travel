import { createInfiniteQuery, createMutation, createQuery } from 'react-query-kit';

import {
  createTourGuide,
  deleteTourGuide,
  getTourGuideById,
  getTourGuideList,
  getTourGuideMoments,
  getTourGuidePage,
  getTourGuideReviews,
  type TourGuidePage,
  updateTourGuide,
} from './requests';
import type {
  ApiTourGuideDetail,
  ITourGuideListParams,
  ITourGuideListResult,
  ITourGuideMomentsParams,
  ITourGuideMomentsResult,
  ITourGuideProfile,
  ITourGuideReviewParams,
  ITourGuideReviewResult,
  TourGuideFormPayload,
} from './types';

export interface ITourGuideReviewsInfiniteVariables {
  id: string;
  pageSize?: number;
}

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

export interface ITourGuideMomentsInfiniteVariables {
  id: string;
}

export const useTourGuideMoments = createQuery<ITourGuideMomentsResult, ITourGuideMomentsParams>({
  primaryKey: '/tour-guide/moments',
  queryFn: ({ queryKey: [, variables] }) => getTourGuideMoments(variables!),
  staleTime: 2 * 60 * 1000,
});

export const useTourGuideMomentsInfinite = createInfiniteQuery<
  ITourGuideMomentsResult,
  ITourGuideMomentsInfiniteVariables,
  Error,
  number
>({
  primaryKey: '/tour-guide/moments-infinite',
  queryFn: ({ queryKey: [, { id }], pageParam = 1 }) =>
    getTourGuideMoments({ id, page: pageParam as number, pageSize: 10 }),
  getNextPageParam: (lastPage) =>
    lastPage.pagination.page < lastPage.pagination.totalPages ? lastPage.pagination.page + 1 : undefined,
  staleTime: 2 * 60 * 1000,
});

export const useTourGuideReviewsInfinite = createInfiniteQuery<
  ITourGuideReviewResult,
  ITourGuideReviewsInfiniteVariables,
  Error,
  number
>({
  primaryKey: '/tour-guide/reviews-infinite',
  queryFn: ({ queryKey: [, { id, pageSize = 5 }], pageParam = 1 }) =>
    getTourGuideReviews({ id, page: pageParam as number, pageSize }),
  getNextPageParam: (lastPage) =>
    lastPage.pagination.page < lastPage.pagination.totalPages ? lastPage.pagination.page + 1 : undefined,
  staleTime: 2 * 60 * 1000,
});
