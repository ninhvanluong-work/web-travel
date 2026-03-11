import { useCallback, useState } from 'react';

const STORAGE_KEY = 'likedVideoIds';

function readFromStorage(): Set<string> {
  if (typeof window === 'undefined') return new Set();
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return new Set();
    const parsed = JSON.parse(raw) as unknown;
    if (!Array.isArray(parsed)) return new Set();
    return new Set(parsed as string[]);
  } catch {
    return new Set();
  }
}

function writeToStorage(ids: Set<string>): void {
  if (typeof window === 'undefined') return;
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(Array.from(ids)));
  } catch {
    // localStorage full hoặc unavailable — silently fail
  }
}

export function useLikedVideos() {
  const [likedIds, setLikedIds] = useState<Set<string>>(() => readFromStorage());

  const isLiked = useCallback((id: string): boolean => likedIds.has(id), [likedIds]);

  const toggleLike = useCallback((id: string): void => {
    setLikedIds((prev) => {
      const next = new Set(prev);
      if (next.has(id)) {
        next.delete(id);
      } else {
        next.add(id);
      }
      writeToStorage(next);
      return next;
    });
  }, []);

  return { isLiked, toggleLike };
}
