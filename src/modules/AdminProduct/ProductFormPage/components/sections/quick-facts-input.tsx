import { Check, ChevronsUpDown, Plus } from 'lucide-react';
import { useState } from 'react';

import { Command, CommandGroup, CommandInput, CommandItem, CommandList } from '@/components/ui/command';
import { Input } from '@/components/ui/input';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { TimeSelectPicker } from '@/components/ui/time-select-picker';
import { cn } from '@/lib/utils';
import { ELEMENT_KEY_OPTIONS } from '@/lib/validations/product';

export const MOCK_SUGGESTIONS: Record<string, string[]> = {
  difficulty: ['Easy', 'Medium', 'Hard', 'Very hard'],
  language: ['English', 'Vietnamese', 'French', 'Chinese', 'Japanese'],
  departure: ['Ha Noi', 'Da Nang', 'Ho Chi Minh City', 'Nha Trang', 'Phu Quoc'],
  duration: ['1 day', '2 days 1 night', '3 days 2 nights', '4 days 3 nights'],
};

export const NUMBER_KEYS = new Set(['groupSize', 'day', 'night']);
export const TIME_KEYS = new Set(['pickup', 'dropOff']);
export const AUTOCOMPLETE_KEYS = new Set(['difficulty', 'language', 'departure', 'duration']);

interface ComboboxInputProps {
  value: string;
  onChange: (val: string) => void;
  suggestions: string[];
  placeholder?: string;
  disabled?: boolean;
}

export function ComboboxInput({
  value,
  onChange,
  suggestions,
  placeholder = 'Select or enter...',
  disabled,
}: ComboboxInputProps) {
  const [open, setOpen] = useState(false);
  const [search, setSearch] = useState('');

  const filtered = suggestions.filter((s) => s.toLowerCase().includes(search.toLowerCase()));
  const hasExactMatch = suggestions.some((s) => s.toLowerCase() === search.trim().toLowerCase());

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <button
          type="button"
          disabled={disabled}
          className="w-full flex h-10 items-center justify-between rounded-lg border border-input bg-white px-3 py-2 text-[13px] text-slate-700 hover:bg-slate-50 disabled:bg-slate-50 disabled:text-slate-400 focus:outline-none focus:ring-2 focus:ring-brand-500/20 focus:border-brand-400 transition-all text-left"
        >
          <span className="truncate">{value || placeholder}</span>
          <ChevronsUpDown size={14} className="opacity-50 shrink-0 ml-2" />
        </button>
      </PopoverTrigger>
      <PopoverContent align="start" className="w-[var(--radix-popper-anchor-width)] p-0">
        <Command className="w-full">
          <CommandInput placeholder="Search suggestions..." value={search} onValueChange={setSearch} />
          <CommandList className="max-h-[200px] overflow-y-auto w-full">
            {filtered.length === 0 && !search.trim() && (
              <div className="p-4 text-center text-[12px] text-slate-400">No suggestions found</div>
            )}
            <CommandGroup>
              {filtered.map((item) => (
                <CommandItem
                  key={item}
                  value={item}
                  onSelect={() => {
                    onChange(item);
                    setOpen(false);
                    setSearch('');
                  }}
                  className="flex items-center justify-between text-[13px] px-3 py-2 cursor-pointer hover:bg-slate-50 rounded-md"
                >
                  <span>{item}</span>
                  <Check size={14} className={cn('text-brand-500', value === item ? 'opacity-100' : 'opacity-0')} />
                </CommandItem>
              ))}

              {search.trim() && !hasExactMatch && (
                <CommandItem
                  value={search}
                  onSelect={() => {
                    onChange(search.trim());
                    setOpen(false);
                    setSearch('');
                  }}
                  className="flex items-center gap-1.5 text-[13px] text-brand-600 font-medium px-3 py-2 cursor-pointer hover:bg-brand-50 rounded-md mt-1 border-t border-dashed border-slate-100"
                >
                  <Plus size={14} />
                  <span>Create new: &quot;{search.trim()}&quot;</span>
                </CommandItem>
              )}
            </CommandGroup>
          </CommandList>
        </Command>
      </PopoverContent>
    </Popover>
  );
}

export function ValueInput({
  factKey,
  value,
  onChange,
  disabled,
}: {
  factKey: string;
  value: string;
  onChange: (v: string) => void;
  disabled?: boolean;
}) {
  if (!factKey) {
    return (
      <Input
        size="sm"
        placeholder="Select type first..."
        disabled
        value=""
        fullWidth
        className="w-full bg-slate-50 text-slate-400"
      />
    );
  }

  if (TIME_KEYS.has(factKey)) {
    return <TimeSelectPicker value={value} onChange={onChange} disabled={disabled} />;
  }

  if (NUMBER_KEYS.has(factKey)) {
    return (
      <Input
        size="sm"
        placeholder="Enter number..."
        value={value}
        onChange={(e) => onChange(e.target.value.replace(/\D/g, ''))}
        inputMode="numeric"
        fullWidth
        className="w-full"
        disabled={disabled}
      />
    );
  }

  if (AUTOCOMPLETE_KEYS.has(factKey)) {
    return (
      <ComboboxInput
        value={value}
        onChange={onChange}
        suggestions={MOCK_SUGGESTIONS[factKey] || []}
        placeholder={`Select or enter ${ELEMENT_KEY_OPTIONS.find((o) => o.value === factKey)?.label.toLowerCase()}...`}
        disabled={disabled}
      />
    );
  }

  return (
    <Input
      size="sm"
      placeholder="Enter value..."
      value={value}
      onChange={(e) => onChange(e.target.value)}
      fullWidth
      className="w-full"
      disabled={disabled}
    />
  );
}
