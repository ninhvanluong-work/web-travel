import { createInfiniteQuery, createQuery } from 'react-query-kit';

import {
  getListVideo,
  getListVideoAdmin,
  getListVideoAdminPaged,
  getVideoAdminPage,
  getVideoBySlug,
  getVideoPage,
} from './requests';
import type {
  IVideo,
  IVideoAdminPage,
  IVideoPage,
  IVideoPageAdmin,
  IVideoVariables,
  IVideoVariablesInfinite,
} from './types';

export const useListVideo = createQuery<IVideo[], IVideoVariables>({
  primaryKey: '/video',
  queryFn: ({ queryKey: [, variables] }) => getListVideo(variables),
});

export const useVideoBySlug = createQuery<IVideo, { slug: string }>({
  primaryKey: '/video/slug',
  queryFn: ({ queryKey: [, variables] }) => getVideoBySlug(variables.slug),
});

export const useListVideoAdmin = createQuery<IVideo[], { keyword?: string; page?: number; pageSize?: number }>({
  primaryKey: '/video/admin',
  queryFn: ({ queryKey: [, variables] }) => getListVideoAdmin(variables),
});

export const useListVideoAdminPaged = createQuery<
  IVideoPageAdmin,
  { keyword?: string; page?: number; pageSize?: number }
>({
  primaryKey: '/video/admin/paged',
  queryFn: ({ queryKey: [, variables] }) => getListVideoAdminPaged(variables),
});

export const useInfiniteListVideoAdmin = createInfiniteQuery<
  IVideoAdminPage,
  { keyword?: string; pageSize?: number },
  Error,
  number
>({
  primaryKey: '/video/admin/infinite',
  queryFn: ({ queryKey: [, variables], pageParam = 1 }) =>
    getVideoAdminPage({ ...(variables as { keyword?: string; pageSize?: number }), page: pageParam as number }),
  getNextPageParam: (lastPage) => lastPage.nextPage,
});

export const useInfiniteListVideo = createInfiniteQuery<IVideoPage, IVideoVariablesInfinite, Error, number | undefined>(
  {
    primaryKey: '/video/infinite',
    queryFn: ({ queryKey: [, variables], pageParam }) =>
      getVideoPage({ ...variables, distanceScore: (pageParam as number | undefined) ?? variables?.distanceScore ?? 0 }),
    getNextPageParam: (lastPage) => lastPage.nextCursor ?? undefined,
  }
);
