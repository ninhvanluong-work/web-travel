import { AnimatePresence, motion } from 'framer-motion';
import { Tag, X } from 'lucide-react';
import { useCallback, useRef, useState } from 'react';
import { useFormContext, useWatch } from 'react-hook-form';

import { useTagListInfinite } from '@/api/tag';
import { useDebounce } from '@/hooks/use-debounce';
import type { ProductFormValues } from '@/lib/validations/product';

import { TagSearchDropdown } from './tag-search-dropdown';

type TagItem = { id: string; name: string };

export function TagsSection() {
  const { control, setValue } = useFormContext<ProductFormValues>();
  const tags = (useWatch({ control, name: 'tags' }) ?? []) as TagItem[];

  const [query, setQuery] = useState('');
  const [showDropdown, setShowDropdown] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  const debouncedQuery = useDebounce(query, 300);

  const {
    data: popularData,
    fetchNextPage: fetchNextPopular,
    hasNextPage: hasNextPopular,
    isFetchingNextPage: isFetchingPopular,
  } = useTagListInfinite();

  const popularTags = (popularData?.pages ?? []).flatMap((p) => p.items);
  const selectedIds = tags.map((t) => t.id);

  const addTag = useCallback(
    (tag: TagItem, shouldFocus = true) => {
      setValue('tags', [...tags, tag], { shouldValidate: true });
      setQuery('');
      setShowDropdown(false);
      if (shouldFocus) inputRef.current?.focus();
    },
    [tags, setValue]
  );

  function removeTag(id: string) {
    setValue(
      'tags',
      tags.filter((t) => t.id !== id),
      { shouldValidate: true }
    );
  }

  function handleKeyDown(e: React.KeyboardEvent) {
    if (e.key === 'Backspace' && !query && tags.length > 0) {
      removeTag(tags[tags.length - 1].id);
    }
  }

  function togglePopular(tag: TagItem) {
    if (selectedIds.includes(tag.id)) {
      removeTag(tag.id);
    } else {
      addTag(tag, false);
    }
  }

  return (
    <div className="space-y-5">
      <TagSearchDropdown
        open={showDropdown}
        onOpenChange={setShowDropdown}
        query={query}
        debouncedQuery={debouncedQuery}
        selectedIds={selectedIds}
        onAddTag={addTag}
      >
        <div
          onClick={() => inputRef.current?.focus()}
          className="flex flex-wrap items-center gap-1.5 p-2 rounded-2xl border border-slate-200 bg-slate-50/50 hover:bg-white focus-within:bg-white focus-within:border-brand-500 focus-within:ring-4 focus-within:ring-brand-500/10 transition-all duration-200 cursor-text w-full min-h-[46px]"
        >
          <AnimatePresence initial={false}>
            {tags.map((tag) => (
              <motion.span
                key={tag.id}
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.8 }}
                transition={{ duration: 0.15 }}
                className="inline-flex items-center gap-1.5 px-3 py-1 bg-brand-50 border border-brand-200 text-brand-700 text-[12px] font-semibold rounded-full select-none"
              >
                <Tag size={11} aria-hidden="true" className="text-brand-500" />
                {tag.name}
                <button
                  type="button"
                  aria-label={`Remove tag ${tag.name}`}
                  onClick={(e) => {
                    e.stopPropagation();
                    removeTag(tag.id);
                  }}
                  className="text-brand-400 hover:text-brand-700 transition-colors ml-0.5"
                >
                  <X size={11} aria-hidden="true" />
                </button>
              </motion.span>
            ))}
          </AnimatePresence>

          <input
            ref={inputRef}
            placeholder={tags.length === 0 ? 'Find or create a new tag...' : ''}
            value={query}
            onChange={(e) => {
              setQuery(e.target.value);
              setShowDropdown(true);
            }}
            onKeyDown={handleKeyDown}
            onFocus={() => setShowDropdown(true)}
            autoComplete="off"
            className="flex-1 min-w-[140px] bg-transparent border-0 outline-none focus:ring-0 p-1 text-[13px] text-slate-800 placeholder-slate-400"
          />
        </div>
      </TagSearchDropdown>

      <div className="space-y-2.5">
        <p className="text-[11px] text-slate-400 font-semibold uppercase tracking-wider">Popular Tags</p>
        <div className="flex flex-wrap gap-2">
          {popularTags.map((tag) => {
            const isSelected = selectedIds.includes(tag.id);
            return (
              <button
                key={tag.id}
                type="button"
                onClick={() => togglePopular(tag)}
                className={`inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-full text-[12px] font-medium border transition-all duration-200 ${
                  isSelected
                    ? 'bg-brand-500 border-brand-500 text-white shadow-sm'
                    : 'bg-white border-slate-200 text-slate-600 hover:border-brand-300 hover:text-brand-600 hover:bg-brand-50'
                }`}
              >
                {tag.name}
              </button>
            );
          })}
          {hasNextPopular && (
            <button
              type="button"
              onClick={() => fetchNextPopular()}
              disabled={isFetchingPopular}
              className="inline-flex items-center px-3.5 py-1.5 rounded-full text-[12px] font-medium border border-dashed border-slate-300 text-slate-400 hover:border-brand-300 hover:text-brand-500 transition-all disabled:opacity-50"
            >
              {isFetchingPopular ? 'Loading...' : 'View More'}
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
