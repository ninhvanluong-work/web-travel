import { useCallback, useEffect, useState } from 'react';

export interface ProductSelectFilters {
  supplierId: string;
  destinationId: string;
  status: string;
  fromDate: string;
  toDate: string;
}

export interface ProductFilters extends ProductSelectFilters {
  keyword: string;
}

const DEFAULT_SELECTS: ProductSelectFilters = {
  supplierId: '',
  destinationId: '',
  status: '',
  fromDate: '',
  toDate: '',
};

export function useProductFilters() {
  // Committed keyword, already debounced + normalized by <AdminSearchInput />
  const [keyword, setKeyword] = useState('');
  const [selects, setSelects] = useState<ProductSelectFilters>(DEFAULT_SELECTS);
  const [page, setPage] = useState(1);

  useEffect(() => {
    setPage(1);
  }, [keyword, selects]);

  const updateSelect = useCallback((patch: Partial<ProductSelectFilters>) => {
    setSelects((prev) => ({ ...prev, ...patch }));
  }, []);

  const resetFilters = useCallback(() => {
    setKeyword('');
    setSelects(DEFAULT_SELECTS);
    setPage(1);
  }, []);

  const hasActiveFilters = !!keyword || Object.values(selects).some(Boolean);

  const queryFilters: ProductFilters = { keyword, ...selects };

  return { keyword, setKeyword, selects, updateSelect, page, setPage, resetFilters, hasActiveFilters, queryFilters };
}
