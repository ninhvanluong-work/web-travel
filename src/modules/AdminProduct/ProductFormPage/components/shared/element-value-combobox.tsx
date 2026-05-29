import { useQueryClient } from '@tanstack/react-query';
import { Loader2, Plus, X } from 'lucide-react';
import { useRef, useState } from 'react';

import { useCreateElement } from '@/api/element';
import type { ApiElementItem } from '@/api/element/types';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';

interface ElementComboboxProps {
  rowKey: string;
  elementKey: string;
  selectedId: string;
  allElements: ApiElementItem[];
  otherSelectedIds: string[];
  onChange: (rowKey: string, elementId: string) => void;
  className?: string;
}

export function ElementCombobox({
  rowKey,
  elementKey,
  selectedId,
  allElements,
  otherSelectedIds,
  onChange,
  className,
}: ElementComboboxProps) {
  const queryClient = useQueryClient();
  const { mutateAsync: createEl, isPending: isCreating } = useCreateElement();

  const [query, setQuery] = useState('');
  const [open, setOpen] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  const selectedEl = allElements.find((e) => e.id === selectedId);

  const filtered = allElements.filter(
    (e) =>
      e.key === elementKey &&
      !otherSelectedIds.includes(e.id) &&
      (!query || e.name.toLowerCase().includes(query.toLowerCase()))
  );

  const exactMatch = filtered.some((e) => e.name.toLowerCase() === query.trim().toLowerCase());
  const showCreate = !!elementKey && query.trim().length > 0 && !exactMatch;

  const displayValue = selectedEl && !open ? selectedEl.name : query;

  function handleFocus() {
    setOpen(true);
    if (selectedEl) setQuery('');
  }

  function handleBlur() {
    setTimeout(() => {
      setOpen(false);
      if (!selectedId) setQuery('');
    }, 150);
  }

  function handleSelect(el: ApiElementItem) {
    onChange(rowKey, el.id);
    setQuery('');
    setOpen(false);
  }

  function handleClear(e: React.MouseEvent) {
    e.stopPropagation();
    onChange(rowKey, '');
    setQuery('');
    inputRef.current?.focus();
  }

  async function handleCreate() {
    if (!elementKey || !query.trim() || isCreating) return;
    try {
      const newEl = await createEl({ key: elementKey, name: query.trim() });
      await queryClient.invalidateQueries({ queryKey: ['/element'] });
      onChange(rowKey, newEl.id);
      setQuery('');
      setOpen(false);
    } catch {
      // ignore — error boundary or toast can be added if needed
    }
  }

  const clearSuffix =
    selectedEl && !open ? (
      <button type="button" onMouseDown={handleClear} className="text-slate-300 hover:text-slate-500 transition-colors">
        <X size={13} />
      </button>
    ) : undefined;

  return (
    <div className={className ?? 'relative w-[360px] shrink-0'}>
      <Input
        ref={inputRef}
        size="sm"
        fullWidth
        value={displayValue}
        placeholder={elementKey ? 'Search or create...' : 'Select type first...'}
        disabled={!elementKey}
        suffix={clearSuffix}
        onChange={(e) => {
          setQuery(e.target.value);
          setOpen(true);
        }}
        onFocus={handleFocus}
        onBlur={handleBlur}
      />

      {open && (
        <div className="absolute z-50 top-full left-0 right-0 mt-1 bg-white rounded-xl shadow-xl border border-slate-200 py-1 max-h-56 overflow-y-auto">
          {filtered.length === 0 && !showCreate && (
            <p className="py-4 text-center text-[12px] text-slate-400">
              {elementKey ? 'No results' : 'Select a type first'}
            </p>
          )}

          {filtered.map((el) => (
            <button
              key={el.id}
              type="button"
              onMouseDown={() => handleSelect(el)}
              className="w-full flex items-center gap-2 px-3 py-2 hover:bg-brand-50 text-left transition-colors"
            >
              <span className="text-[13px] text-slate-700">{el.name}</span>
            </button>
          ))}

          {showCreate && (
            <div className="border-t border-slate-100">
              <Button
                type="button"
                variant="ghost"
                size="xs"
                rounded="md"
                blur={false}
                onMouseDown={handleCreate}
                disabled={isCreating}
                className="w-full justify-start gap-2 px-3 py-2.5 text-brand-600 hover:bg-brand-50 hover:text-brand-700 disabled:opacity-50"
              >
                {isCreating ? (
                  <Loader2 size={13} className="animate-spin shrink-0" />
                ) : (
                  <Plus size={13} className="shrink-0" />
                )}
                <span className="text-[13px] font-semibold">
                  {isCreating ? 'Creating...' : `Create "${query.trim()}"`}
                </span>
              </Button>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
