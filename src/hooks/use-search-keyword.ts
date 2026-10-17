import { useCallback, useMemo, useState } from 'react';

import { normalizeSearchKeyword } from '@/lib/text-normalize';

import { useDebounce } from './use-debounce';

/**
 * Debounce + normalize a keyword that lives elsewhere (e.g. inside a filters object).
 * Returns `undefined` for empty/whitespace-only input.
 */
export function useDebouncedSearchKeyword(raw: string, delay = 300): string | undefined {
  const debounced = useDebounce(raw, delay);
  return useMemo(() => normalizeSearchKeyword(debounced), [debounced]);
}

/**
 * Self-contained search box state.
 * - `keyword`: raw value bound to the input (what the user typed)
 * - `debouncedKeyword`: normalized value to send to the API / use in query keys
 * - `isActive`: true only when a meaningful keyword is applied (use for "Clear" buttons / empty states)
 */
export function useSearchKeyword({ delay = 300, initial = '' }: { delay?: number; initial?: string } = {}) {
  const [keyword, setKeyword] = useState(initial);
  const debouncedKeyword = useDebouncedSearchKeyword(keyword, delay);
  const clear = useCallback(() => setKeyword(''), []);

  return { keyword, setKeyword, debouncedKeyword, isActive: debouncedKeyword !== undefined, clear };
}
