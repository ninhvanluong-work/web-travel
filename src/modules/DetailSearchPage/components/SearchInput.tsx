import { useRouter } from 'next/router';
import React, { useRef } from 'react';

import { Icons } from '@/assets/icons';
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
    <div className="flex w-full items-center gap-2">
      <button
        type="button"
        onClick={() => router.back()}
        className="rounded-full p-2 transition-colors hover:bg-gray-100"
        aria-label="Go back"
      >
        <Icons.chevronLeft className="h-6 w-6 text-gray-500" />
      </button>
      <form
        onSubmit={(event) => {
          event.preventDefault();
          if (ref.current) onSearch(ref.current.value);
        }}
        className="flex-1"
      >
        <Input
          ref={ref}
          className={
            'rounded-full pl-14 h-[2.65rem] text-base shadow-sm transition-colors bg-white border-gray-300 text-black placeholder:text-gray-500 hover:bg-gray-50 focus-visible:ring-1 focus-visible:ring-black/20'
          }
          placeholder="Search videos..."
          variant="filled"
          prefix={<Icons.search className="w-6 h-6 text-gray-500 ml-1" strokeWidth={3} />}
        />
      </form>
      <button type="button" className="rounded-full p-2 transition-colors hover:bg-gray-100" aria-label="More options">
        <Icons.dots className="h-6 w-6 text-gray-500" />
      </button>
    </div>
  );
};

export default SearchInput;
