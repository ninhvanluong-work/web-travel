import { useRouter } from 'next/router';
import React from 'react';

import { Icons } from '@/assets/icons';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';

interface Props {
  value: string;
  onChange: (searchText: string) => void;
  onSubmit: () => void;
  onFocus?: () => void;
}

const SearchInput = ({ value, onChange, onSubmit, onFocus }: Props) => {
  const router = useRouter();

  return (
    <div className="flex w-full items-center gap-[6px]">
      <Button
        variant="icon"
        size="icon"
        rounded="full"
        blur={false}
        className="flex-shrink-0 p-[7px]"
        onClick={() => router.back()}
        aria-label="Quay lại"
      >
        <Icons.chevronLeft className="h-[22px] w-[22px]" />
      </Button>

      <form
        onSubmit={(e) => {
          e.preventDefault();
          onSubmit();
        }}
        className="flex-1"
      >
        <Input
          className="rounded-full pl-5 h-[2.5rem] text-[13px] font-dinpro tracking-[0.01em] bg-neutral-100 border-transparent text-neutral-900 placeholder:text-neutral-400 focus-visible:bg-white focus-visible:border-neutral-200 focus-visible:ring-2 focus-visible:ring-main/20 transition-all duration-200 shadow-none w-full"
          placeholder="Tìm kiếm video..."
          variant="filled"
          inputMode="search"
          enterKeyHint="search"
          value={value}
          onChange={(e) => onChange(e.target.value)}
          onFocus={onFocus}
          suffix={
            <button
              type="submit"
              className="p-1 text-neutral-400 hover:text-neutral-900 transition-colors"
              aria-label="Tìm kiếm"
            >
              <Icons.search className="w-[18px] h-[18px]" strokeWidth={2.5} />
            </button>
          }
        />
      </form>

      <Button
        variant="icon"
        size="icon"
        rounded="full"
        blur={false}
        className="flex-shrink-0 p-[7px]"
        aria-label="Tuỳ chọn"
      >
        <Icons.dots className="h-[22px] w-[22px]" />
      </Button>
    </div>
  );
};

export default SearchInput;
