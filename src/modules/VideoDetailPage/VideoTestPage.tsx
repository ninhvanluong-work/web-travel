import { useRouter } from 'next/router';
import React, { useState } from 'react';

import { Icons } from '@/assets/icons';
import { Button } from '@/components/ui/button';
import { useVideoDetailFeed } from '@/hooks/use-video-detail-feed';

import VideoTestSlideComponent from './components/video-test-slide';

const VideoTestPage = () => {
  const router = useRouter();
  const { slug } = router.query;
  const currentSlug = typeof slug === 'string' ? slug : '';

  const { videos, handleVideoTestVisible, isReloadInitializing } = useVideoDetailFeed(currentSlug);
  const [muted, setMuted] = useState(true);

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

      <div className="h-dvh snap-y snap-mandatory scrollbar-hide overscroll-none overflow-y-scroll">
        {videos.map((video) => (
          <VideoTestSlideComponent
            key={video.slug}
            video={video}
            muted={muted}
            onVisible={handleVideoTestVisible}
            onMutedChange={setMuted}
          />
        ))}
      </div>
    </div>
  );
};

export default VideoTestPage;
