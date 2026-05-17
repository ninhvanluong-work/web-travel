import { useEffect, useRef, useState } from 'react';

import { getListVideoPaged } from '@/api/video/requests';
import type { IVideo } from '@/api/video/types';

const PAGE_SIZE_OPTIONS = [10, 20, 50] as const;
export type PageSizeOption = (typeof PAGE_SIZE_OPTIONS)[number];
export { PAGE_SIZE_OPTIONS };

function useDebounce(value: string, delay: number) {
  const [debounced, setDebounced] = useState(value);
  useEffect(() => {
    const t = setTimeout(() => setDebounced(value), delay);
    return () => clearTimeout(t);
  }, [value, delay]);
  return debounced;
}

interface State {
  videos: IVideo[];
  isLoading: boolean;
  hasNext: boolean;
  page: number;
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
  const [search, setSearch] = useState('');
  const [pageSize, setPageSize] = useState<PageSizeOption>(10);
  const [page, setPage] = useState(1);
  const [cursors, setCursors] = useState<number[]>([0]);
  const [videos, setVideos] = useState<IVideo[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [hasNext, setHasNext] = useState(false);
  const fetchId = useRef(0);

  const debouncedSearch = useDebounce(search, 300);

  useEffect(() => {
    setPage(1);
    setCursors([0]);
  }, [debouncedSearch, pageSize]);

  useEffect(() => {
    const id = ++fetchId.current;
    setIsLoading(true);
    const cursor = cursors[page - 1] ?? 0;
    getListVideoPaged({
      query: debouncedSearch || undefined,
      pageSize,
      distanceScore: cursor,
    })
      .then((result) => {
        if (id !== fetchId.current) return;
        setVideos(result.items);
        setHasNext(result.nextCursor !== null);
        if (result.nextCursor !== null) {
          setCursors((prev) => {
            const next = [...prev];
            next[page] = result.nextCursor as number;
            return next;
          });
        }
      })
      .catch(() => null)
      .finally(() => {
        if (id === fetchId.current) setIsLoading(false);
      });
    // cursors intentionally excluded — only page/search/pageSize/refreshKey drive re-fetch
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [page, debouncedSearch, pageSize, refreshKey]);

  return {
    videos,
    isLoading,
    hasNext,
    page,
    pageSize,
    search,
    setSearch,
    setPageSize: (v: PageSizeOption) => setPageSize(v),
    nextPage: () => setPage((p) => p + 1),
    prevPage: () => setPage((p) => p - 1),
  };
}
