import { Loader2, Plus, Tag } from 'lucide-react';
import { useEffect, useRef } from 'react';

import { useCreateTag, useTagSearchInfinite } from '@/api/tag';
import { Popover, PopoverAnchor, PopoverContent } from '@/components/ui/popover';

type TagItem = { id: string; name: string };

interface TagSearchDropdownProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  query: string;
  debouncedQuery: string;
  selectedIds: string[];
  onAddTag: (tag: TagItem) => void;
  children: React.ReactNode;
}

export function TagSearchDropdown({
  open,
  onOpenChange,
  query,
  debouncedQuery,
  selectedIds,
  onAddTag,
  children,
}: TagSearchDropdownProps) {
  const scrollRef = useRef<HTMLDivElement>(null);
  const sentinelRef = useRef<HTMLDivElement>(null);

  const {
    data: searchData,
    fetchNextPage,
    hasNextPage,
    isFetchingNextPage,
    isLoading,
  } = useTagSearchInfinite({
    variables: { keyword: debouncedQuery },
    enabled: open,
  });

  const { mutateAsync: createTagMutation, isPending: isCreating } = useCreateTag();

  const searchResults = (searchData?.pages ?? []).flatMap((p) => p.items);
  const filtered = searchResults.filter((t) => !selectedIds.includes(t.id));
  const exactMatch = searchResults.some((t) => t.name.toLowerCase() === debouncedQuery.trim().toLowerCase());
  const showCreate = debouncedQuery.trim() && !exactMatch && !isLoading;

  // Sentinel observes relative to the scroll container (not viewport)
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

  async function handleCreate() {
    const name = query.trim();
    if (!name || isCreating) return;
    const newTag = await createTagMutation(name);
    onAddTag(newTag);
  }

  return (
    <Popover open={open} onOpenChange={onOpenChange}>
      <PopoverAnchor asChild>{children}</PopoverAnchor>

      <PopoverContent
        align="start"
        sideOffset={6}
        onOpenAutoFocus={(e) => e.preventDefault()}
        className="w-[var(--radix-popover-trigger-width)] min-w-[300px] p-0 rounded-2xl shadow-xl shadow-slate-200/50 border border-slate-100 bg-white/95 backdrop-blur-md overflow-hidden"
      >
        {/* Header */}
        <div className="px-4 pt-3 pb-2 border-b border-slate-50 bg-slate-50/30">
          <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">
            {debouncedQuery ? `Results for "${debouncedQuery}"` : 'All Tags'}
          </p>
        </div>

        {/* Scrollable list */}
        <div ref={scrollRef} className="overflow-y-auto overscroll-contain max-h-72 scrollbar-thin">
          {isLoading && (
            <div className="flex items-center justify-center gap-2 py-8">
              <Loader2 size={16} className="animate-spin text-slate-400" />
              <span className="text-[13px] text-slate-400 font-medium">Loading tags...</span>
            </div>
          )}

          {!isLoading && filtered.length === 0 && !showCreate && (
            <div className="py-8 text-center">
              <p className="text-[13px] text-slate-400">No tags found</p>
            </div>
          )}

          {filtered.map((tag) => (
            <button
              key={tag.id}
              type="button"
              onMouseDown={(e) => {
                e.preventDefault();
                onAddTag(tag);
              }}
              className="group w-full flex items-center gap-3 px-4 py-2.5 hover:bg-brand-50/80 text-left transition-all duration-150 active:bg-brand-100/50"
            >
              <Tag
                size={13}
                aria-hidden="true"
                className="text-slate-400 group-hover:text-brand-500 shrink-0 transition-colors"
              />
              <span className="text-[13px] text-slate-700 group-hover:text-brand-700 font-medium">{tag.name}</span>
            </button>
          ))}

          {/* Sentinel: must be inside scroll container */}
          {hasNextPage && (
            <div ref={sentinelRef} className="flex items-center justify-center py-4">
              {isFetchingNextPage && <Loader2 size={16} className="animate-spin text-slate-300" />}
            </div>
          )}
        </div>

        {/* Create new tag — pinned below list */}
        {showCreate && (
          <div className="border-t border-slate-100 bg-slate-50/10">
            <button
              type="button"
              onMouseDown={(e) => {
                e.preventDefault();
                handleCreate();
              }}
              disabled={isCreating}
              className="w-full flex items-center gap-3 px-4 py-3 hover:bg-brand-50 text-left transition-all duration-150 disabled:opacity-50"
            >
              {isCreating ? (
                <Loader2 size={14} aria-hidden="true" className="animate-spin text-brand-500 shrink-0" />
              ) : (
                <Plus size={14} aria-hidden="true" className="text-brand-500 shrink-0" />
              )}
              <span className="text-[13px] text-brand-600 font-semibold">
                {isCreating ? 'Creating...' : `Create "${debouncedQuery.trim()}"`}
              </span>
            </button>
          </div>
        )}
      </PopoverContent>
    </Popover>
  );
}
