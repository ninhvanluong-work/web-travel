import 'animate.css';

import { useRouter } from 'next/router';
import { useEffect, useState } from 'react';

import { useInfiniteListVideo } from '@/api/video';
import { SEARCH_SUGGESTIONS } from '@/data/search';
import type { NextPageWithLayout } from '@/types';

import SearchInput from './components/SearchInput';
import VideoGrid from './components/VideoGrid';

const PRELOAD_COUNT = 6;

const DetailSearchPage: NextPageWithLayout = () => {
  const router = useRouter();
  const { q } = router.query;

  const [inputValue, setInputValue] = useState(() => (typeof q === 'string' ? q : ''));
  const [query, setQuery] = useState<string | undefined>(undefined);
  const [isFocused, setIsFocused] = useState(false);
  const [hasScrolled, setHasScrolled] = useState(false);

  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  useEffect(() => {
    if (router.isReady) {
      const val = typeof q === 'string' ? q : '';
      setInputValue(val);
      setQuery(val);
    }
  }, [router.isReady, q]);

  useEffect(() => {
    setHasScrolled(false);
  }, [query]);

  const handleSubmit = () => {
    const trimmed = inputValue.trim();
    setQuery(trimmed);
    setIsFocused(false);
    if (document.activeElement instanceof HTMLElement) {
      document.activeElement.blur();
    }
    router.replace(`/search${trimmed ? `?q=${encodeURIComponent(trimmed)}` : ''}`, undefined, { shallow: true });
  };

  const { data, isLoading, isFetchingNextPage, fetchNextPage, hasNextPage } = useInfiniteListVideo({
    variables: { query: query || undefined },
    enabled: query !== undefined,
  });

  const videos = data?.pages.flatMap((page) => page.items) ?? [];

  // Mobile browsers (incl. iOS Safari) ignore <link rel="preload"> and preload="auto" for video.
  // Only explicit .load() calls on a video element are honoured.
  // Create hidden video elements for the latest page's first N items and call .load()
  // so they enter the HTTP cache before VideoCard mounts.
  useEffect(() => {
    if (!data?.pages.length) return undefined;
    const lastPage = data.pages[data.pages.length - 1];
    const els = lastPage.items.slice(0, PRELOAD_COUNT).map((v) => {
      const el = document.createElement('video');
      el.src = v.shortUrl;
      el.muted = true;
      el.preload = 'auto';
      el.load();
      return el;
    });
    return () =>
      els.forEach((el) => {
        el.src = '';
      });
  }, [data?.pages.length]); // eslint-disable-line react-hooks/exhaustive-deps

  return (
    <div className="h-full w-full overflow-y-auto scrollbar-hide bg-white" onScroll={() => setHasScrolled(true)}>
      {isFocused && (
        <div
          className="fixed inset-0 bg-black/60 z-40 animate__animated animate__fadeIn"
          onClick={() => setIsFocused(false)}
        />
      )}

      <div className="sticky top-0 z-50 w-full bg-white/95 backdrop-blur-md px-[10px] pt-[10px] pb-[10px] border-b border-neutral-100/80">
        <SearchInput
          value={inputValue}
          onChange={setInputValue}
          onSubmit={handleSubmit}
          onFocus={() => setIsFocused(true)}
        />
        {isFocused && (
          <div className="absolute top-full left-0 right-0 px-[10px] py-4 animate__animated animate__fadeIn flex flex-col gap-3">
            <ul className="flex flex-wrap gap-2">
              {SEARCH_SUGGESTIONS.map((suggestion, index) => (
                <li
                  key={index}
                  className="px-4 py-2 bg-white/20 hover:bg-white/30 backdrop-blur-md rounded-full text-white text-[13px] font-dinpro cursor-pointer transition-colors"
                  onMouseDown={(e) => {
                    e.preventDefault();
                    setInputValue(suggestion);
                    setIsFocused(false);
                  }}
                >
                  {suggestion}
                </li>
              ))}
            </ul>
          </div>
        )}
      </div>

      <VideoGrid
        videos={videos}
        query={query || undefined}
        isLoading={isLoading}
        hasNextPage={hasNextPage ?? false}
        isFetchingMore={isFetchingNextPage}
        hasScrolled={hasScrolled}
        onFetchMore={fetchNextPage}
      />

      <div className="h-6" />
    </div>
  );
};

export default DetailSearchPage;
