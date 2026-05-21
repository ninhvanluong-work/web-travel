import { Tag, X } from 'lucide-react';
import { useRef, useState } from 'react';
import { useFormContext, useWatch } from 'react-hook-form';

import { useCreateTag, useTagListInfinite } from '@/api/tag';
import { Input } from '@/components/ui/input';
import type { ProductFormValues } from '@/lib/validations/product';

type TagItem = { id: string; name: string };

export function TagsSection() {
  const { control, setValue } = useFormContext<ProductFormValues>();
  const tags = (useWatch({ control, name: 'tags' }) ?? []) as TagItem[];

  const [query, setQuery] = useState('');
  const [showDropdown, setShowDropdown] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  const { data: tagData, fetchNextPage, hasNextPage, isFetchingNextPage } = useTagListInfinite();
  const allTags = (tagData?.pages ?? []).flatMap((p) => p.items);
  const { mutateAsync: createTagMutation, isPending: isCreating } = useCreateTag();

  const selectedIds = tags.map((t) => t.id);
  const filtered = allTags.filter(
    (t) => !selectedIds.includes(t.id) && t.name.toLowerCase().includes(query.toLowerCase())
  );
  const exactMatch = allTags.some((t) => t.name.toLowerCase() === query.trim().toLowerCase());
  const hasDropdownContent = filtered.length > 0 || (query.trim() && !exactMatch);

  function addTag(tag: TagItem) {
    setValue('tags', [...tags, tag], { shouldValidate: true });
    setQuery('');
    setShowDropdown(false);
    inputRef.current?.focus();
  }

  function removeTag(id: string) {
    setValue(
      'tags',
      tags.filter((t) => t.id !== id),
      { shouldValidate: true }
    );
  }

  async function handleCreateTag() {
    const name = query.trim();
    if (!name || isCreating) return;
    const newTag = await createTagMutation(name);
    addTag(newTag);
  }

  function handleKeyDown(e: React.KeyboardEvent) {
    if (e.key === 'Enter') {
      e.preventDefault();
      if (filtered.length > 0) {
        addTag(filtered[0]);
      } else if (query.trim() && !exactMatch) {
        handleCreateTag();
      }
    }
    if (e.key === 'Backspace' && !query && tags.length > 0) {
      removeTag(tags[tags.length - 1].id);
    }
  }

  function togglePopular(tag: TagItem) {
    if (selectedIds.includes(tag.id)) {
      removeTag(tag.id);
    } else {
      addTag(tag);
    }
  }

  return (
    <div className="space-y-4">
      {tags.length > 0 && (
        <div className="flex flex-wrap gap-2">
          {tags.map((tag) => (
            <span
              key={tag.id}
              className="inline-flex items-center gap-1.5 px-3 py-1 bg-brand-50 border border-brand-200 text-brand-700 text-[12px] font-semibold rounded-full"
            >
              <Tag size={11} />
              {tag.name}
              <button
                type="button"
                onClick={() => removeTag(tag.id)}
                className="text-brand-400 hover:text-brand-700 transition-colors ml-0.5"
              >
                <X size={11} />
              </button>
            </span>
          ))}
        </div>
      )}

      <div className="relative">
        <Input
          ref={inputRef}
          size="sm"
          placeholder="Tìm hoặc tạo tag mới..."
          value={query}
          onChange={(e) => {
            setQuery(e.target.value);
            setShowDropdown(true);
          }}
          onFocus={() => setShowDropdown(true)}
          onBlur={() => setTimeout(() => setShowDropdown(false), 200)}
          onKeyDown={handleKeyDown}
          className="bg-slate-50/50 border-slate-200 hover:bg-white focus:bg-white transition-colors"
        />
        {showDropdown && hasDropdownContent && (
          <div className="absolute z-50 top-full left-0 right-0 mt-1 bg-white rounded-xl shadow-xl border border-slate-200 py-1 max-h-48 overflow-y-auto">
            {filtered.map((tag) => (
              <button
                key={tag.id}
                type="button"
                onMouseDown={() => addTag(tag)}
                className="w-full flex items-center gap-2.5 px-3 py-2 hover:bg-slate-50 text-left transition-colors"
              >
                <Tag size={12} className="text-slate-400 shrink-0" />
                <span className="text-[13px] text-slate-700">{tag.name}</span>
              </button>
            ))}
            {query.trim() && !exactMatch && (
              <button
                type="button"
                onMouseDown={handleCreateTag}
                disabled={isCreating}
                className="w-full flex items-center gap-2.5 px-3 py-2 hover:bg-brand-50 text-left transition-colors border-t border-slate-100 disabled:opacity-50"
              >
                <Tag size={12} className="text-brand-500 shrink-0" />
                <span className="text-[13px] text-brand-600 font-medium">
                  {isCreating ? 'Đang tạo...' : `+ Tạo tag mới: "${query.trim()}"`}
                </span>
              </button>
            )}
          </div>
        )}
      </div>

      <div className="space-y-2">
        <p className="text-[11px] text-slate-400 font-medium uppercase tracking-wider">Tag phổ biến</p>
        <div className="flex flex-wrap gap-2">
          {allTags.map((tag) => {
            const isSelected = selectedIds.includes(tag.id);
            return (
              <button
                key={tag.id}
                type="button"
                onClick={() => togglePopular(tag)}
                className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[12px] font-medium border transition-all ${
                  isSelected
                    ? 'bg-brand-500 border-brand-500 text-white shadow-sm'
                    : 'bg-white border-slate-200 text-slate-600 hover:border-brand-300 hover:text-brand-600 hover:bg-brand-50'
                }`}
              >
                {tag.name}
              </button>
            );
          })}
          {hasNextPage && (
            <button
              type="button"
              onClick={() => fetchNextPage()}
              disabled={isFetchingNextPage}
              className="inline-flex items-center px-3 py-1 rounded-full text-[12px] font-medium border border-dashed border-slate-300 text-slate-400 hover:border-brand-300 hover:text-brand-500 transition-all disabled:opacity-50"
            >
              {isFetchingNextPage ? 'Đang tải...' : 'Xem thêm'}
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
