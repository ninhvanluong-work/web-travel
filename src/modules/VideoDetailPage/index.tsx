import { useRouter } from 'next/router';
import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';

import type { IVideo } from '@/api/video';
import { useInfiniteListVideo } from '@/api/video';
import { Icons } from '@/assets/icons';
import { Button } from '@/components/ui/button';

import VideoSlide from './components/video-slide';

const PREFETCH_OFFSET = 3;

const VideoDetailPage = () => {
  const router = useRouter();
  const { id, ids } = router.query;

  const { data, fetchNextPage, hasNextPage, isFetchingNextPage } = useInfiniteListVideo({
    variables: {},
  });

  const allVideos = useMemo(() => data?.pages.flatMap((p) => p.items) ?? [], [data]);

  const videos = useMemo(() => {
    if (allVideos.length === 0) return [];
    const videoIds = typeof ids === 'string' ? ids.split(',') : null;
    if (videoIds && videoIds.length > 0) {
      return videoIds.map((vid) => allVideos.find((v) => v.id === vid)).filter(Boolean) as IVideo[];
    }
    return allVideos;
  }, [allVideos, ids]);

  const [currentIndex, setCurrentIndex] = useState(0);

  // Sync initial index khi videos load lần đầu
  useEffect(() => {
    if (!id || allVideos.length === 0) return;
    const idx = allVideos.findIndex((v) => v.id === id);
    if (idx >= 0) setCurrentIndex(idx);
  }, [id, allVideos]);

  // Fetch trang tiếp theo khi còn <= PREFETCH_OFFSET video phía sau
  useEffect(() => {
    if (!ids && hasNextPage && !isFetchingNextPage && currentIndex >= videos.length - PREFETCH_OFFSET) {
      fetchNextPage();
    }
  }, [currentIndex, videos.length, hasNextPage, isFetchingNextPage, fetchNextPage, ids]);

  const initialScrolled = useRef(false);
  useEffect(() => {
    if (initialScrolled.current || !id || videos.length === 0) return;
    const el = document.getElementById(`video-slide-${id}`);
    if (el) {
      el.scrollIntoView({ behavior: 'instant' as ScrollBehavior });
      initialScrolled.current = true;
    }
  }, [id, videos]);

  const handleVideoVisible = useCallback(
    (videoId: string) => {
      const currentId = typeof id === 'string' ? id : '';
      if (videoId === currentId) return;
      const newIndex = videos.findIndex((v) => v.id === videoId);
      if (newIndex >= 0) setCurrentIndex(newIndex);
      const idsParam = typeof ids === 'string' && ids ? `?ids=${ids}` : '';
      router.replace(`/video/${videoId}${idsParam}`, undefined, { shallow: true });
    },
    [id, ids, router, videos]
  );

  if (allVideos.length === 0) {
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
              key={video.id}
              video={video}
              onVisible={() => handleVideoVisible(video.id)}
              initialMuted={video.id !== id}
              preloadMode={preloadMode}
            />
          );
        })}
      </div>
    </div>
  );
};

export default VideoDetailPage;
