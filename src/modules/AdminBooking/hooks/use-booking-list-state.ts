import { useMemo, useState } from 'react';

import type { IBookingListItem } from '@/api/booking/types';
import { useDebounce } from '@/hooks/use-debounce';

export interface BookingFilters {
  keyword: string;
  status: string;
  supplierId: string;
  productId: string;
  fromDate: string;
  toDate: string;
}

const DEFAULT_FILTERS: BookingFilters = {
  keyword: '',
  status: '',
  supplierId: '',
  productId: '',
  fromDate: '',
  toDate: '',
};

const PAGE_SIZE = 10;

export function useBookingListState() {
  const [filters, setFiltersRaw] = useState<BookingFilters>(DEFAULT_FILTERS);
  const [page, setPageRaw] = useState(1);
  const [detailTarget, setDetailTarget] = useState<IBookingListItem | null>(null);

  const debouncedKeyword = useDebounce(filters.keyword, 300);

  const setFilter = (patch: Partial<BookingFilters>) => {
    setFiltersRaw((prev) => ({ ...prev, ...patch }));
    setPageRaw(1);
  };

  const setPage = (p: number) => setPageRaw(p);

  const resetFilters = () => {
    setFiltersRaw(DEFAULT_FILTERS);
    setPageRaw(1);
  };

  const hasActiveFilters = useMemo(
    () => Object.values({ ...filters, keyword: debouncedKeyword }).some((v) => v !== ''),
    [filters, debouncedKeyword]
  );

  const queryFilters = useMemo(
    () => ({
      page,
      pageSize: PAGE_SIZE,
      keyword: debouncedKeyword || undefined,
      status: filters.status || undefined,
      supplierId: filters.supplierId || undefined,
      productId: filters.productId || undefined,
      fromDate: filters.fromDate || undefined,
      toDate: filters.toDate || undefined,
    }),
    [page, debouncedKeyword, filters.status, filters.supplierId, filters.productId, filters.fromDate, filters.toDate]
  );

  return {
    filters,
    queryFilters,
    page,
    setPage,
    setFilter,
    resetFilters,
    hasActiveFilters,
    detailTarget,
    setDetailTarget,
  };
}
