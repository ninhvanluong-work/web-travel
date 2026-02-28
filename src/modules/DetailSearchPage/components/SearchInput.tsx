import { useRouter } from 'next/router';
import React, { useRef } from 'react';

import { Icons } from '@/assets/icons';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';

interface Props {
  onSearch: (searchText: string) => void;
  defaultValue?: string;
}

const SearchInput = ({ onSearch, defaultValue }: Props) => {
  const router = useRouter();
  const ref = useRef<HTMLInputElement>(null);

  React.useEffect(() => {
    if (ref.current && defaultValue) {
      ref.current.value = defaultValue;
    }
  }, [defaultValue]);

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
        onSubmit={(event) => {
          event.preventDefault();
          if (ref.current) onSearch(ref.current.value);
        }}
        className="flex-1"
      >
        <Input
          ref={ref}
          className="rounded-full pl-14 h-[2.5rem] text-[13px] font-dinpro tracking-[0.01em] bg-neutral-100 border-transparent text-neutral-900 placeholder:text-neutral-400 focus-visible:bg-white focus-visible:border-neutral-200 focus-visible:ring-2 focus-visible:ring-main/20 transition-all duration-200 shadow-none"
          placeholder="Tìm kiếm video..."
          variant="filled"
          prefix={<Icons.search className="w-[18px] h-[18px] text-neutral-400 ml-1" strokeWidth={2.5} />}
          onChange={(e) => {
            onSearch(e.target.value);
          }}
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
