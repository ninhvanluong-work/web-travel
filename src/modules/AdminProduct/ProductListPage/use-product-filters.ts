import { useState } from 'react';

export interface ProductFilters {
  keyword: string;
  supplierId: string;
  destinationId: string;
  status: string;
  fromDate: string;
  toDate: string;
}

const DEFAULT_FILTERS: ProductFilters = {
  keyword: '',
  supplierId: '',
  destinationId: '',
  status: '',
  fromDate: '',
  toDate: '',
};

export function useProductFilters() {
  const [draft, setDraft] = useState<ProductFilters>(DEFAULT_FILTERS);
  const [applied, setApplied] = useState<ProductFilters>(DEFAULT_FILTERS);
  const [page, setPage] = useState(1);

  const applyFilters = () => {
    setApplied(draft);
    setPage(1);
  };

  const resetFilters = () => {
    setDraft(DEFAULT_FILTERS);
    setApplied(DEFAULT_FILTERS);
    setPage(1);
  };

  return {
    draft,
    setDraft,
    applied,
    page,
    setPage,
    applyFilters,
    resetFilters,
  };
}
