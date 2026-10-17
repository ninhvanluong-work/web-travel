import { useEffect, useState } from 'react';

import { useListVideoAdminPaged } from '@/api/video';
import type { IVideo } from '@/api/video/types';

const PAGE_SIZE_OPTIONS = [10, 20, 50] as const;
export type PageSizeOption = (typeof PAGE_SIZE_OPTIONS)[number];
export { PAGE_SIZE_OPTIONS };

interface State {
  videos: IVideo[];
  isLoading: boolean;
  hasNext: boolean;
  page: number;
  totalPages: number;
  pageSize: PageSizeOption;
  search: string;
}

interface Actions {
  setSearch: (v: string) => void;
  setPageSize: (v: PageSizeOption) => void;
  nextPage: () => void;
  prevPage: () => void;
}

export function useVideoListPaged(refreshKey: number): State & Actions {
  // Committed keyword, already debounced + normalized by <AdminSearchInput />
  const [search, setSearch] = useState('');
  const [pageSize, setPageSize] = useState<PageSizeOption>(10);
  const [page, setPage] = useState(1);

  const { data, isLoading, refetch } = useListVideoAdminPaged({
    variables: { keyword: search || undefined, page, pageSize },
  });

  useEffect(() => {
    if (refreshKey > 0) refetch();
  }, [refreshKey]); // eslint-disable-line react-hooks/exhaustive-deps

  const videos = data?.items ?? [];
  const totalPages = data?.totalPages ?? 1;

  const handleSetSearch = (v: string) => {
    setSearch(v);
    setPage(1);
  };
  const handleSetPageSize = (v: PageSizeOption) => {
    setPageSize(v);
    setPage(1);
  };

  return {
    videos,
    isLoading,
    hasNext: page < totalPages,
    page,
    totalPages,
    pageSize,
    search,
    setSearch: handleSetSearch,
    setPageSize: handleSetPageSize,
    nextPage: () => setPage((p) => p + 1),
    prevPage: () => setPage((p) => p - 1),
  };
}
