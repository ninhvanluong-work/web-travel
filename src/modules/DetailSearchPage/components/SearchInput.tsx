import React, { useRef } from 'react';

import { Icons } from '@/assets/icons';
import { Input } from '@/components/ui/input';

interface Props {
  onSearch: (searchText: string) => void;
  defaultValue?: string;
}

const SearchInput = ({ onSearch, defaultValue }: Props) => {
  const ref = useRef<HTMLInputElement>(null);

  React.useEffect(() => {
    if (ref.current && defaultValue) {
      ref.current.value = defaultValue;
    }
  }, [defaultValue]);

  return (
    <form
      onSubmit={(event) => {
        event.preventDefault();
        if (ref.current) onSearch(ref.current.value);
      }}
      className="w-full"
    >
      <Input
        ref={ref}
        className={
          'rounded-full pl-14 h-14 text-base shadow-sm transition-colors bg-white border-gray-300 text-black placeholder:text-gray-500 hover:bg-gray-50 focus-visible:ring-1 focus-visible:ring-black/20'
        }
        placeholder="Search videos..."
        variant="filled" // maintaining 'filled' prop but overriding class
        prefix={<Icons.search className="w-6 h-6 text-gray-500 ml-1" strokeWidth={3} />}
      />
    </form>
  );
};

export default SearchInput;
