import { useRouter } from 'next/router';
import { useEffect, useState } from 'react';

import { useListVideo } from '@/api/video';
import type { NextPageWithLayout } from '@/types';

import SearchInput from './components/SearchInput';
import VideoGrid from './components/VideoGrid';

const DetailSearchPage: NextPageWithLayout = () => {
  const router = useRouter();
  const { q } = router.query;

  // Lazy init: capture URL param ngay lần render đầu (client-side nav đã có router.query)
  const [query, setQuery] = useState(() => (typeof q === 'string' ? q : ''));

  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  // Fallback cho direct URL access: router.query chưa có ở lần render đầu
  useEffect(() => {
    if (router.isReady && typeof q === 'string') {
      setQuery(q);
    }
  }, [router.isReady, q]);

  const { data: videos, isLoading } = useListVideo({
    variables: { query: query || undefined },
    enabled: router.isReady,
  });

  return (
    <div className="h-full w-full overflow-y-auto scrollbar-hide bg-white">
      <div className="sticky top-0 z-50 w-full bg-white/95 backdrop-blur-md px-[10px] pt-[10px] pb-[10px] border-b border-neutral-100/80">
        <SearchInput value={query} onSearch={setQuery} />
      </div>

      <VideoGrid videos={videos ?? []} isLoading={isLoading} />

      <div className="h-6" />
    </div>
  );
};

export default DetailSearchPage;
