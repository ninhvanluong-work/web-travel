import { Film, Loader2, X } from 'lucide-react';
import { useTranslation } from 'next-i18next';
import { useEffect, useRef, useState } from 'react';
import { useFormContext } from 'react-hook-form';

import { useInfiniteListVideoAdmin } from '@/api/video';
import { getVideoById } from '@/api/video/requests';
import type { IVideo } from '@/api/video/types';
import { Button } from '@/components/ui/button';
import { FormField, FormItem } from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { useDebounce } from '@/hooks/use-debounce';
import type { ProductFormValues } from '@/lib/validations/product';

export function VideoCard() {
  const { control, watch } = useFormContext<ProductFormValues>();
  const currentVideoId = watch('videoId');
  const { t } = useTranslation('adminPage');

  const [query, setQuery] = useState('');
  const [selectedVideo, setSelectedVideo] = useState<IVideo | null>(null);
  const [showDropdown, setShowDropdown] = useState(false);

  const scrollRef = useRef<HTMLDivElement>(null);
  const sentinelRef = useRef<HTMLDivElement>(null);

  const debouncedQuery = useDebounce(query, 300);

  const { data, isLoading, fetchNextPage, hasNextPage, isFetchingNextPage } = useInfiniteListVideoAdmin({
    variables: { keyword: debouncedQuery || undefined, pageSize: 20 },
    enabled: showDropdown,
  });

  const results = data?.pages.flatMap((p) => p.items) ?? [];

  // Load selected video on edit mode
  useEffect(() => {
    if (!currentVideoId || selectedVideo?.id === currentVideoId) return;
    getVideoById(currentVideoId)
      .then(setSelectedVideo)
      .catch(() => null);
  }, [currentVideoId, selectedVideo?.id]);

  // Infinite scroll sentinel
  useEffect(() => {
    const sentinel = sentinelRef.current;
    const container = scrollRef.current;
    if (!sentinel || !container || !hasNextPage) return undefined;

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting && !isFetchingNextPage) fetchNextPage();
      },
      { root: container, threshold: 0.1 }
    );
    observer.observe(sentinel);
    return () => observer.disconnect();
  }, [hasNextPage, isFetchingNextPage, fetchNextPage]);

  return (
    <div className="overflow-hidden bg-white rounded-2xl border border-gray-200 shadow-theme-xs dark:border-gray-800 dark:bg-white/[0.03]">
      <div className="px-4 py-3 border-b border-gray-200 dark:border-gray-800 flex items-center gap-2.5">
        <span className="w-7 h-7 rounded-lg bg-rose-50 flex items-center justify-center shrink-0">
          <Film size={13} className="text-rose-500" />
        </span>
        <span className="text-xs font-semibold text-gray-700 dark:text-white/90 tracking-wide">{t('videoName')}</span>
      </div>

      <div className="p-4 space-y-3">
        <FormField
          control={control}
          name="videoId"
          render={({ field }) => (
            <FormItem>
              <div className="relative">
                <Input
                  size="sm"
                  placeholder={t('searchVideosPlaceholder')}
                  value={query}
                  onChange={(e) => {
                    setQuery(e.target.value);
                    setShowDropdown(true);
                  }}
                  onFocus={() => setShowDropdown(true)}
                  onBlur={() => setTimeout(() => setShowDropdown(false), 150)}
                />

                {showDropdown && (
                  <div
                    ref={scrollRef}
                    className="absolute z-20 top-full left-0 right-0 mt-1 bg-white rounded-xl shadow-lg ring-1 ring-black/10 overflow-y-auto max-h-48"
                  >
                    {isLoading && (
                      <div className="flex items-center justify-center py-4">
                        <Loader2 size={14} className="animate-spin text-gray-300" />
                      </div>
                    )}
                    {!isLoading && results.length === 0 && (
                      <p className="text-xs text-gray-400 text-center py-4">{t('noVideos')}</p>
                    )}
                    {results.map((video) => (
                      <button
                        key={video.id}
                        type="button"
                        className="w-full flex items-center gap-2.5 px-3 py-2 hover:bg-gray-50 transition-colors text-left"
                        onMouseDown={() => {
                          field.onChange(video.id);
                          setSelectedVideo(video);
                          setQuery('');
                          setShowDropdown(false);
                        }}
                      >
                        <div className="w-8 h-8 rounded bg-gray-100 overflow-hidden shrink-0">
                          {video.thumbnail ? (
                            <img src={video.thumbnail} alt={video.title} className="w-full h-full object-cover" />
                          ) : (
                            <Film size={14} className="m-auto mt-1.5 text-gray-300" />
                          )}
                        </div>
                        <span className="text-xs text-gray-700 truncate">{video.title}</span>
                      </button>
                    ))}

                    {hasNextPage && (
                      <div ref={sentinelRef} className="flex items-center justify-center py-3">
                        {isFetchingNextPage && <Loader2 size={14} className="animate-spin text-gray-300" />}
                      </div>
                    )}
                  </div>
                )}
              </div>

              {field.value && selectedVideo && (
                <div className="flex items-center gap-2.5 p-2.5 rounded-xl bg-gray-50 ring-1 ring-black/5 mt-2">
                  <div className="w-10 h-10 rounded-lg overflow-hidden bg-gray-100 shrink-0">
                    {selectedVideo.thumbnail ? (
                      <img
                        src={selectedVideo.thumbnail}
                        alt={selectedVideo.title}
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <Film size={16} className="m-auto mt-2 text-gray-300" />
                    )}
                  </div>
                  <span className="flex-1 text-xs text-gray-700 truncate font-medium">{selectedVideo.title}</span>
                  <Button
                    variant="ghost"
                    size="icon"
                    rounded="md"
                    className="shrink-0 h-6 w-6 text-gray-400 hover:text-gray-600 hover:bg-gray-100"
                    onClick={() => {
                      field.onChange(null);
                      setSelectedVideo(null);
                    }}
                  >
                    <X size={14} />
                  </Button>
                </div>
              )}
            </FormItem>
          )}
        />
      </div>
    </div>
  );
}
