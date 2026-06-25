import { AnimatePresence, motion } from 'framer-motion';
import { Tag, X } from 'lucide-react';
import { useTranslation } from 'next-i18next';
import { useCallback, useMemo, useRef, useState } from 'react';
import { useFormContext, useWatch } from 'react-hook-form';

import { useDebounce } from '@/hooks/use-debounce';
import type { ProductFormValues } from '@/lib/validations/product';

import { TagSearchDropdown } from './tag-search-dropdown';

type TagItem = { id: string; name: string };

export function TagsSection() {
  const { control, setValue } = useFormContext<ProductFormValues>();
  const { t } = useTranslation('adminPage');
  const rawTags = useWatch({ control, name: 'tags' });
  const tags = useMemo(() => (rawTags ?? []) as TagItem[], [rawTags]);

  const [query, setQuery] = useState('');
  const [showDropdown, setShowDropdown] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  const debouncedQuery = useDebounce(query, 300);
  const selectedIds = tags.map((tag) => tag.id);

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
      tags.filter((tag) => tag.id !== id),
      { shouldValidate: true }
    );
  }

  function handleKeyDown(e: React.KeyboardEvent) {
    if (e.key === 'Backspace' && !query && tags.length > 0) {
      removeTag(tags[tags.length - 1].id);
    }
  }

  return (
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
          placeholder={tags.length === 0 ? t('findOrCreateTag') : ''}
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
  );
}
