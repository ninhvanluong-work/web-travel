import { Check, Loader2 } from 'lucide-react';
import React, { forwardRef, type ReactNode, useCallback, useRef, useState } from 'react';

import { Icons } from '@/assets/icons';
import { Command, CommandEmpty, CommandGroup, CommandInput, CommandItem } from '@/components/ui/command';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { cn } from '@/lib/utils';

import type { InputProps } from './input';
import { Input } from './input';
import { Label } from './label';

interface IData {
  label: string;
  value: string;
  image?: string;
  group?: string;
}

interface SelectWithSearchProps extends InputProps {
  onValueChange?: (value: string) => void;
  onOpenChange?: (open: boolean) => void;
  onScrollToBottom?: () => void;
  isLoadingMore?: boolean;
  data: IData[];
  label?: ReactNode;
}

const SelectWithSearch = forwardRef<HTMLInputElement, SelectWithSearchProps>(
  (
    {
      className,
      value,
      size,
      label,
      placeholder = 'Please select',
      data,
      onValueChange,
      onOpenChange,
      onScrollToBottom,
      isLoadingMore,
      ...props
    },
    ref
  ) => {
    const [open, setOpen] = useState(false);
    const listRef = useRef<HTMLDivElement>(null);

    const handleScroll = useCallback(() => {
      const el = listRef.current;
      if (!el || !onScrollToBottom) return;
      if (el.scrollTop + el.clientHeight >= el.scrollHeight - 60) {
        onScrollToBottom();
      }
    }, [onScrollToBottom]);

    return (
      <Popover
        open={open}
        onOpenChange={(val) => {
          setOpen(val);
          onOpenChange?.(val);
        }}
      >
        <PopoverTrigger asChild>
          <div className="relative">
            <Label className="mb-1.5 block">{label}</Label>
            <Input
              onChange={() => null}
              value={data.find((item) => item.value === value)?.label ?? value ?? ''}
              size={size}
              placeholder={placeholder}
              {...props}
              className={cn(className)}
              ref={ref}
              suffix={<Icons.arrowDown />}
            />
          </div>
        </PopoverTrigger>
        <PopoverContent align="start" className="w-[var(--radix-popper-anchor-width)]">
          <Command>
            <CommandInput placeholder="Search by keyword..." />
            <CommandEmpty>No result found.</CommandEmpty>
            <CommandGroup>
              <div ref={listRef} className="max-h-[300px] overflow-auto" onScroll={handleScroll}>
                {data.map((x) => (
                  <CommandItem
                    onSelect={() => {
                      onValueChange?.(x.value);
                      setOpen(false);
                    }}
                    key={x.value}
                  >
                    <Check className={cn('mr-2 h-4 w-4', value === x.value ? 'opacity-100' : 'opacity-0')} />
                    <div className="flex items-center space-x-2">
                      {x.image && <img src={x.image} alt="" className="h-6 w-6" />}
                      <p>{x.label}</p>
                    </div>
                  </CommandItem>
                ))}
                {isLoadingMore && (
                  <div className="flex justify-center py-2">
                    <Loader2 size={14} className="animate-spin text-slate-400" />
                  </div>
                )}
              </div>
            </CommandGroup>
          </Command>
        </PopoverContent>
      </Popover>
    );
  }
);

export default SelectWithSearch;
