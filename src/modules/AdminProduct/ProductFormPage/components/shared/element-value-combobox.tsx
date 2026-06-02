import { useQueryClient } from '@tanstack/react-query';
import { Check, Loader2, Plus, X } from 'lucide-react';
import { useRef, useState } from 'react';

import { useCreateElement } from '@/api/element';
import type { ApiElementItem } from '@/api/element/types';
import { Icons } from '@/assets/icons';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { useAlertStore } from '@/stores/use-alert-store';

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
  const [createdEl, setCreatedEl] = useState<ApiElementItem | null>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  const selectedEl =
    allElements.find((e) => e.id === selectedId) || (createdEl && createdEl.id === selectedId ? createdEl : undefined);

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
      setCreatedEl(newEl);
      await queryClient.invalidateQueries({ queryKey: ['/element'] });
      setCreatedEl(null);
      onChange(rowKey, newEl.id);
      setQuery('');
      setOpen(false);
      useAlertStore.getState().addAlert({ type: 'success', title: `Created element "${newEl.name}" successfully` });
    } catch (err: unknown) {
      const axiosMsg = (err as { response?: { data?: { message?: string } } })?.response?.data?.message;
      const msg = axiosMsg ?? (err instanceof Error ? err.message : 'Failed to create element');
      useAlertStore.getState().addAlert({ type: 'error', title: msg });
    }
  }

  function getSuffix() {
    if (selectedEl && !open) {
      return (
        <button
          type="button"
          onMouseDown={handleClear}
          className="flex items-center justify-center text-slate-300 transition-colors hover:text-slate-500"
        >
          <X size={13} />
        </button>
      );
    }
    if (elementKey) {
      return <Icons.arrowDown className="pointer-events-none min-w-[24px] text-gray-400" />;
    }
    return undefined;
  }
  const clearSuffix = getSuffix();

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
        <div className="absolute z-50 top-full left-0 right-0 min-w-[280px] mt-1 bg-white rounded-xl shadow-theme-lg border border-gray-200 p-1 max-h-56 overflow-y-auto">
          {filtered.length === 0 && !showCreate && (
            <p className="py-4 text-center text-sm text-gray-400">
              {elementKey ? 'No results' : 'Select a type first'}
            </p>
          )}

          {filtered.map((el) => {
            const isSelected = el.id === selectedId;
            return (
              <button
                key={el.id}
                type="button"
                onMouseDown={() => handleSelect(el)}
                className={`w-full flex items-center justify-between gap-2 px-3 py-2.5 rounded-lg text-left text-sm transition-colors outline-none ${
                  isSelected
                    ? 'bg-brand-50 text-brand-600 font-semibold'
                    : 'text-gray-700 hover:bg-brand-50 hover:text-brand-700'
                }`}
              >
                <span>{el.name}</span>
                {isSelected && <Check size={14} className="text-brand-600 shrink-0" />}
              </button>
            );
          })}

          {showCreate && (
            <div className="border-t border-gray-100 mt-1 pt-1">
              <Button
                type="button"
                variant="ghost"
                size="xs"
                rounded="md"
                blur={false}
                onMouseDown={(e) => {
                  e.preventDefault();
                  handleCreate();
                }}
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
