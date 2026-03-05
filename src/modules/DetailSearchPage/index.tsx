import { useRouter } from 'next/router';
import { useEffect, useState } from 'react';

import { useInfiniteListVideo } from '@/api/video';
import type { NextPageWithLayout } from '@/types';

import SearchInput from './components/SearchInput';
import VideoGrid from './components/VideoGrid';

const DetailSearchPage: NextPageWithLayout = () => {
  const router = useRouter();
  const { q } = router.query;

  const [inputValue, setInputValue] = useState(() => (typeof q === 'string' ? q : ''));
  const [query, setQuery] = useState(inputValue);

  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  useEffect(() => {
    if (router.isReady && typeof q === 'string') {
      setInputValue(q);
      setQuery(q);
    }
  }, [router.isReady, q]);

  // Debounce 300ms
  useEffect(() => {
    const timer = setTimeout(() => setQuery(inputValue), 300);
    return () => clearTimeout(timer);
  }, [inputValue]);

  const { data, isLoading, isFetchingNextPage, fetchNextPage, hasNextPage } = useInfiniteListVideo({
    variables: { query: query || undefined },
    enabled: router.isReady,
  });

  const videos = data?.pages.flatMap((page) => page.items) ?? [];

  return (
    <div className="h-full w-full overflow-y-auto scrollbar-hide bg-white">
      <div className="sticky top-0 z-50 w-full bg-white/95 backdrop-blur-md px-[10px] pt-[10px] pb-[10px] border-b border-neutral-100/80">
        <SearchInput value={inputValue} onSearch={setInputValue} />
      </div>

      <VideoGrid
        videos={videos}
        isLoading={isLoading}
        hasNextPage={hasNextPage ?? false}
        isFetchingMore={isFetchingNextPage}
        onFetchMore={fetchNextPage}
      />

      <div className="h-6" />
    </div>
  );
};

export default DetailSearchPage;
