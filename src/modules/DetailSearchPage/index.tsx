import React from 'react';

import { SEARCH_SUGGESTIONS } from '@/data/search';
import type { NextPageWithLayout } from '@/types';

import SearchBox from '../HomePage/components/SearchBox';

const DetailSearchPage: NextPageWithLayout = () => {
  React.useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  return (
    <div className="h-full w-full overflow-y-auto scrollbar-hide">
      <div className="flex min-h-full w-full max-w-3xl flex-col items-center justify-start bg-white sm:items-start">
        <div className="sticky top-0 z-50 w-full bg-white px-16 pt-8 pb-4 shadow-sm">
          <SearchBox autoFocus variant="outline" />
          <div className="mt-4 flex flex-col gap-3 p-1">
            {SEARCH_SUGGESTIONS.map((item) => (
              <button
                key={item}
                className="w-fit rounded-full border border-gray-200 bg-white px-4 py-1.5 text-sm text-gray-600 shadow-sm transition-colors hover:bg-gray-50 hover:text-black hover:border-gray-300"
              >
                {item}
              </button>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default DetailSearchPage;
