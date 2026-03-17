import { useRouter } from 'next/router';
import React, { useState } from 'react';

import { Icons } from '@/assets/icons';
import { Button } from '@/components/ui/button';
import { useVideoDetailFeed } from '@/hooks/use-video-detail-feed';

import VideoSlide from './components/video-slide';

const VideoDetailPage = () => {
  const router = useRouter();
  const { slug } = router.query;
  const currentSlug = typeof slug === 'string' ? slug : '';

  const { videos, currentIndex, handleVideoVisible, isReloadInitializing, hasStoreList } =
    useVideoDetailFeed(currentSlug);

  const [scrollLocked, setScrollLocked] = useState(false);

  if (videos.length === 0 || isReloadInitializing) {
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

      <div
        className={`h-dvh overflow-y-scroll snap-y snap-mandatory scrollbar-hide overscroll-none ${
          scrollLocked ? 'overflow-hidden' : ''
        }`}
      >
        {videos.map((video, index) => {
          const diff = index - currentIndex;
          let preloadMode: 'auto' | 'metadata' | 'none' = 'none';
          if (diff === 0 || diff === 1) preloadMode = 'auto';
          else if (diff >= -1 && diff <= 2) preloadMode = 'metadata';
          return (
            <VideoSlide
              key={video.slug}
              video={video}
              onVisible={handleVideoVisible}
              initialMuted={!hasStoreList || video.slug !== currentSlug}
              preloadMode={preloadMode}
              onBlockedChange={setScrollLocked}
            />
          );
        })}
      </div>
    </div>
  );
};

export default VideoDetailPage;
