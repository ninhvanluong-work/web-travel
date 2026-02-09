import React from 'react';

import type { NextPageWithLayout } from '@/types';

import SearchBox from '../HomePage/components/SearchBox';

const DetailSearchPage: NextPageWithLayout = () => {
  return (
    <>
      <div className="flex min-h-screen w-full max-w-3xl flex-col items-center justify-between py-32 px-16 bg-white  sm:items-start">
        <SearchBox />
      </div>
    </>
  );
};

export default DetailSearchPage;
