import { useRouter } from 'next/router';
import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';

import type { IVideo } from '@/api/video';
import { useInfiniteListVideo, useVideoBySlug } from '@/api/video';
import { Icons } from '@/assets/icons';
import { Button } from '@/components/ui/button';
import { useVideoListStore } from '@/stores';

import VideoSlide from './components/video-slide';

const PREFETCH_OFFSET = 3;

const VideoDetailPage = () => {
  const router = useRouter();
  const { slug } = router.query;
  const currentSlug = typeof slug === 'string' ? slug : '';

  const storeVideos = useVideoListStore.use.videos();
  const storeQuery = useVideoListStore.use.query();
  const hasStoreList = storeVideos.length > 0;

  const { data: slugVideo } = useVideoBySlug({
    variables: { slug: currentSlug },
    enabled: !!currentSlug && !hasStoreList,
  });

  const { data, fetchNextPage, hasNextPage, isFetchingNextPage } = useInfiniteListVideo({
    variables: { query: storeQuery },
    enabled: !hasStoreList,
  });

  const allFallbackVideos = useMemo(() => data?.pages.flatMap((p) => p.items) ?? [], [data]);

  const fallbackVideos = useMemo<IVideo[]>(() => {
    if (!slugVideo) return allFallbackVideos;
    const rest = allFallbackVideos.filter((v) => v.slug !== slugVideo.slug);
    return [slugVideo, ...rest];
  }, [slugVideo, allFallbackVideos]);

  const videos = hasStoreList ? storeVideos : fallbackVideos;

  const initialIndex = useMemo(() => {
    if (!currentSlug || videos.length === 0) return 0;
    const idx = videos.findIndex((v) => v.slug === currentSlug);
    return idx >= 0 ? idx : 0;
  }, [currentSlug, videos]);

  const [currentIndex, setCurrentIndex] = useState(0);

  // Only initialize once — do NOT reset when videos array grows (infinite load)
  const indexInitialized = useRef(false);
  useEffect(() => {
    if (indexInitialized.current || videos.length === 0) return;
    setCurrentIndex(initialIndex);
    indexInitialized.current = true;
  }, [initialIndex, videos.length]);

  useEffect(() => {
    if (!hasStoreList && hasNextPage && !isFetchingNextPage && currentIndex >= videos.length - PREFETCH_OFFSET) {
      fetchNextPage();
    }
  }, [currentIndex, videos.length, hasNextPage, isFetchingNextPage, fetchNextPage, hasStoreList]);

  const initialScrolled = useRef(false);
  useEffect(() => {
    if (initialScrolled.current || !currentSlug || videos.length === 0) return;
    const el = document.getElementById(`video-slide-${currentSlug}`);
    if (el) {
      el.scrollIntoView({ behavior: 'instant' as ScrollBehavior });
      initialScrolled.current = true;
    }
  }, [currentSlug, videos]);

  // Use ref for immediate dedup — router.query updates async so currentSlug lags
  const visibleSlugRef = useRef(currentSlug);
  const handleVideoVisible = useCallback(
    (videoSlug: string) => {
      if (videoSlug === visibleSlugRef.current) return;
      visibleSlugRef.current = videoSlug;
      const newIndex = videos.findIndex((v) => v.slug === videoSlug);
      if (newIndex >= 0) setCurrentIndex(newIndex);
      router.replace(`/video/${videoSlug}`, undefined, { shallow: true });
    },
    [router, videos]
  );

  if (videos.length === 0) {
    return (
      <div className="flex h-dvh w-full items-center justify-center bg-black">
        <div className="flex flex-col items-center gap-3">
          <div className="w-8 h-8 rounded-full border-2 border-white/20 border-t-white/80 animate-spin" />
          <p className="text-white/50 text-xs font-dinpro tracking-wider uppercase">Đang tải</p>
        </div>
      </div>
    );
  }

  return (
    <div className="relative h-dvh overflow-hidden bg-black">
      <Button
        variant="glass"
        size="icon"
        rounded="full"
        blur={false}
        className="absolute left-[14px] z-50 p-[9px]"
        style={{ top: 'calc(14px + env(safe-area-inset-top, 0px))' }}
        onClick={() => router.back()}
        aria-label="Quay lại"
      >
        <Icons.chevronLeft className="w-[20px] h-[20px]" />
      </Button>

      <div className="h-dvh overflow-y-scroll snap-y snap-mandatory scrollbar-hide overscroll-none">
        {videos.map((video, index) => {
          const diff = index - currentIndex;
          let preloadMode: 'auto' | 'metadata' | 'none' = 'none';
          if (diff >= -2 && diff <= 3) preloadMode = 'auto';
          return (
            <VideoSlide
              key={video.slug}
              video={video}
              onVisible={() => handleVideoVisible(video.slug)}
              initialMuted={video.slug !== currentSlug}
              preloadMode={preloadMode}
            />
          );
        })}
      </div>
    </div>
  );
};

export default VideoDetailPage;
