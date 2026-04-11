import { useCallback, useEffect, useState } from 'react';

function useDebounce<T>(value: T, delay: number): T {
  const [debounced, setDebounced] = useState<T>(value);
  useEffect(() => {
    const t = setTimeout(() => setDebounced(value), delay);
    return () => clearTimeout(t);
  }, [value, delay]);
  return debounced;
}

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
  const [keyword, setKeyword] = useState('');
  const [selects, setSelects] = useState<ProductSelectFilters>(DEFAULT_SELECTS);
  const [page, setPage] = useState(1);

  const debouncedKeyword = useDebounce(keyword, 300);

  useEffect(() => {
    setPage(1);
  }, [debouncedKeyword, selects]);

  const updateSelect = useCallback((patch: Partial<ProductSelectFilters>) => {
    setSelects((prev) => ({ ...prev, ...patch }));
  }, []);

  const resetFilters = useCallback(() => {
    setKeyword('');
    setSelects(DEFAULT_SELECTS);
    setPage(1);
  }, []);

  const hasActiveFilters = !!debouncedKeyword || Object.values(selects).some(Boolean);

  const queryFilters: ProductFilters = { keyword: debouncedKeyword, ...selects };

  return { keyword, setKeyword, selects, updateSelect, page, setPage, resetFilters, hasActiveFilters, queryFilters };
}
