import { useCallback, useState } from 'react';

import type { UserRole } from '@/api/user/types';

/**
 * Keyword + role + page state for the admin user list.
 * `keyword` is the committed value from <AdminSearchInput /> (already debounced + normalized).
 * Page is derived: it falls back to 1 whenever a filter changes, so no effect is needed to reset it.
 */
export function useAdminUserFilters() {
  const [keyword, setKeyword] = useState<string | undefined>(undefined);
  const [role, setRole] = useState<UserRole | undefined>(undefined);
  const filterKey = `${keyword ?? ''}|${role ?? ''}`;
  const [pageState, setPageState] = useState({ filterKey: '|', page: 1 });

  const page = pageState.filterKey === filterKey ? pageState.page : 1;

  const setPage = useCallback((next: number) => setPageState({ filterKey, page: Math.max(1, next) }), [filterKey]);

  const resetFilters = useCallback(() => {
    setKeyword(undefined);
    setRole(undefined);
  }, []);

  return {
    keyword,
    setKeyword,
    role,
    setRole,
    page,
    setPage,
    hasFilters: keyword !== undefined || role !== undefined,
    resetFilters,
  };
}
