import { useCallback, useState } from 'react';

/**
 * Keyword + page state for the destination list.
 * `keyword` is the committed value from <AdminSearchInput /> (already debounced + normalized).
 * Page is derived: it falls back to 1 whenever the keyword changes, so no effect is needed to reset it.
 */
export function useDestinationFilters() {
  const [keyword, setKeyword] = useState<string | undefined>(undefined);
  const [pageState, setPageState] = useState<{ keyword: string | undefined; page: number }>({
    keyword: undefined,
    page: 1,
  });

  const page = pageState.keyword === keyword ? pageState.page : 1;

  const setPage = useCallback((next: number) => setPageState({ keyword, page: Math.max(1, next) }), [keyword]);

  const clearKeyword = useCallback(() => setKeyword(undefined), []);

  return { keyword, setKeyword, clearKeyword, hasKeyword: keyword !== undefined, page, setPage };
}
