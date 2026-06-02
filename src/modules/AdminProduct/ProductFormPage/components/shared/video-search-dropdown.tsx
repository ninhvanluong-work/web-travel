import { Check, Film, Loader2 } from 'lucide-react';
import { useEffect, useRef } from 'react';

import type { IVideo } from '@/api/video/types';

interface VideoSearchDropdownProps {
  isLoading: boolean;
  results: IVideo[];
  hasNextPage: boolean | undefined;
  isFetchingNextPage: boolean;
  fetchNextPage: () => void;
  selectedId: string | null | undefined;
  onSelect: (video: IVideo) => void;
}

export function VideoSearchDropdown({
  isLoading,
  results,
  hasNextPage,
  isFetchingNextPage,
  fetchNextPage,
  selectedId,
  onSelect,
}: VideoSearchDropdownProps) {
  const scrollRef = useRef<HTMLDivElement>(null);
  const sentinelRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const sentinel = sentinelRef.current;
    const container = scrollRef.current;
    if (!sentinel || !container || !hasNextPage) return undefined;

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting && !isFetchingNextPage) fetchNextPage();
      },
      { root: container, threshold: 0.1 }
    );
    observer.observe(sentinel);
    return () => observer.disconnect();
  }, [hasNextPage, isFetchingNextPage, fetchNextPage]);

  return (
    <div
      ref={scrollRef}
      className="absolute z-50 top-full left-0 right-0 mt-1.5 bg-white rounded-xl shadow-lg border border-slate-200/80 py-1 max-h-60 overflow-y-auto"
    >
      {isLoading && (
        <div className="flex items-center justify-center gap-2 py-5">
          <Loader2 size={14} className="animate-spin text-slate-400" />
          <span className="text-[11px] text-slate-400">Searching...</span>
        </div>
      )}

      {!isLoading && results.length === 0 && (
        <div className="py-5 flex flex-col items-center gap-1.5">
          <Film size={20} className="text-slate-300" />
          <span className="text-[12px] text-slate-400">No videos found</span>
        </div>
      )}

      {results.map((video) => (
        <button
          key={video.id}
          type="button"
          className="w-full flex items-center gap-3 px-3 py-2 hover:bg-slate-50 text-left transition-colors group/item"
          onMouseDown={() => onSelect(video)}
        >
          <div className="w-14 h-9 rounded-lg bg-slate-100 flex-shrink-0 overflow-hidden ring-1 ring-slate-200 group-hover/item:ring-brand-200 transition-all">
            {video.thumbnail ? (
              <img src={video.thumbnail} alt="" className="w-full h-full object-cover" />
            ) : (
              <div className="w-full h-full flex items-center justify-center">
                <Film size={12} className="text-slate-300" />
              </div>
            )}
          </div>
          <span className="text-[13px] text-slate-700 font-medium truncate flex-1">{video.title}</span>
          {selectedId === video.id && <Check size={13} className="text-brand-500 shrink-0" />}
        </button>
      ))}

      {hasNextPage && (
        <div ref={sentinelRef} className="flex items-center justify-center py-4">
          {isFetchingNextPage && <Loader2 size={14} className="animate-spin text-slate-300" />}
        </div>
      )}
    </div>
  );
}
