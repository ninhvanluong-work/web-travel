import { Search } from 'lucide-react';
import { useRouter } from 'next/router';
import React from 'react';

import { Input } from '@/components/ui/input';
import { cn } from '@/lib/utils';

interface SearchBoxProps {
  autoFocus?: boolean;
  variant?: 'transparent' | 'outline';
  onSearchClick?: () => void;
}

const SearchBox = React.forwardRef<HTMLInputElement, SearchBoxProps>(
  ({ autoFocus, variant = 'transparent', onSearchClick }, ref) => {
    const router = useRouter();

    const [searchValue, setSearchValue] = React.useState('');

    const handleSearch = () => {
      const query = searchValue.trim();
      if (query) {
        router.push(`/search?q=${encodeURIComponent(query)}`);
      } else if (router.pathname !== '/search') {
        router.push('/search');
      }
    };

    const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
      if (e.key === 'Enter') {
        handleSearch();
      }
    };

    const handleSearchClick = () => {
      if (onSearchClick) {
        onSearchClick();
      } else {
        handleSearch();
      }
    };

    return (
      <div className="w-full max-w-[500px] rounded-full">
        <Input
          ref={ref}
          id="searchBox"
          type="search"
          placeholder="Search..."
          fullWidth
          prefix={
            <Search
              className={cn('w-6 h-6', variant === 'transparent' ? 'text-white' : 'text-gray-500')}
              strokeWidth={3}
            />
          }
          inputMode="search"
          enterKeyHint="search"
          autoComplete="off"
          autoFocus={autoFocus}
          className={cn(
            'rounded-full pl-14 pr-12 h-14 text-base shadow-sm transition-colors',
            variant === 'transparent'
              ? 'bg-white/10 backdrop-blur-sm border-transparent text-white placeholder:text-gray-200 hover:bg-white/20 focus-visible:ring-1 focus-visible:ring-white/50'
              : 'bg-white border-gray-300 text-black placeholder:text-gray-500 hover:bg-gray-50 focus-visible:ring-1 focus-visible:ring-black/20'
          )}
          value={searchValue}
          onChange={(e) => setSearchValue(e.target.value)}
          onKeyDown={handleKeyDown}
          onClick={handleSearchClick}
        />
      </div>
    );
  }
);
SearchBox.displayName = 'SearchBox';

export default SearchBox;
