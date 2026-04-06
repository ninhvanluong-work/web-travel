import { useRouter } from 'next/router';
import React, { useState } from 'react';

import { Icons } from '@/assets/icons';
import { Button } from '@/components/ui/button';
import { useSwipeBack } from '@/hooks/use-swipe-back';
import { useVideoDetailFeed } from '@/hooks/use-video-detail-feed';

import VideoSlide from './components/video-slide';

const VideoDetailPage = () => {
  const router = useRouter();
  const { slug } = router.query;
  const currentSlug = typeof slug === 'string' ? slug : '';

  const { videos, handleVideoTestVisible, isReloadInitializing, initialIndex } = useVideoDetailFeed(currentSlug);

  // autoplay=true khi đến từ grid, false khi reload/direct access
  const isFromGrid = router.query.autoplay === 'true';
  const [muted, setMuted] = useState(() => !isFromGrid);

  // Khi reload: khóa scroll + pause video cho đến khi user bật loa
  const [gated, setGated] = useState(() => !isFromGrid);

  const handleMutedChange = (newMuted: boolean) => {
    setMuted(newMuted);
  };

  const { containerRef, onPointerDown, onPointerMove, onPointerUp } = useSwipeBack({
    disabled: gated,
  });

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
    <div
      ref={containerRef}
      className="relative h-dvh overflow-hidden bg-black"
      onPointerDown={onPointerDown}
      onPointerMove={onPointerMove}
      onPointerUp={onPointerUp}
    >
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

      {/* gated=true: khóa scroll cho đến khi user bật loa (chỉ khi reload) */}
      <div
        className={`h-dvh snap-y snap-mandatory scrollbar-hide overscroll-none ${
          gated ? 'overflow-hidden' : 'overflow-y-scroll'
        }`}
        style={{ touchAction: 'pan-y' }}
      >
        {videos.map((video, index) => (
          <VideoSlide
            key={video.slug}
            video={video}
            muted={muted}
            onVisible={handleVideoTestVisible}
            onMutedChange={handleMutedChange}
            onGateOpen={() => setGated(false)}
            autoLoad={Math.abs(index - initialIndex) <= 1}
            forcePause={gated}
          />
        ))}
      </div>
    </div>
  );
};

export default VideoDetailPage;
