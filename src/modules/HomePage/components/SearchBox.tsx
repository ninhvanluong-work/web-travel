import { Search } from 'lucide-react';
import { useRouter } from 'next/router';
import React from 'react';

import { Input } from '@/components/ui/input';

const SearchBox = () => {
  const router = useRouter();

  const handleSearchClick = () => {
    if (router.pathname !== '/search') {
      router.push('/search');
    }
  };

  return (
    <div className="w-full max-w-[500px] rounded-full">
      <Input
        id="searchBox"
        type="search"
        placeholder="Search..."
        fullWidth
        prefix={<Search className="w-6 h-6 text-white" strokeWidth={3} />}
        inputMode="search"
        enterKeyHint="search"
        autoComplete="off"
        className="rounded-full bg-white/10 backdrop-blur-sm border-transparent pl-14 pr-12 h-14 text-base text-white placeholder:text-gray-200 shadow-sm hover:bg-white/20 transition-colors focus-visible:ring-1 focus-visible:ring-white/50"
        onClick={handleSearchClick}
      />
    </div>
  );
};

export default SearchBox;
