import { useRouter } from 'next/router';
import React, { useEffect, useRef, useState } from 'react';

import { Icons } from '@/assets/icons';
import { Button } from '@/components/ui/button';
import { useVideoDetailFeed } from '@/hooks/use-video-detail-feed';

import VideoSlide from './components/video-slide';

const VideoDetailPage = () => {
  const router = useRouter();
  const { slug } = router.query;
  const currentSlug = typeof slug === 'string' ? slug : '';

  const { videos, handleVideoTestVisible, isReloadInitializing, initialIndex, currentIndex, currentIndexReady } =
    useVideoDetailFeed(currentSlug);

  // autoplay=true khi đến từ grid, false khi reload/direct access
  const isFromGrid = router.query.autoplay === 'true';
  const [muted, setMuted] = useState(() => !isFromGrid);

  // Khi reload: khóa scroll + pause video cho đến khi user bật loa
  const [gated, setGated] = useState(() => !isFromGrid);

  const handleMutedChange = (newMuted: boolean) => {
    setMuted(newMuted);
  };

  // Swipe-back: vuốt phải từ bất kỳ đâu trên màn hình → router.back()
  // Dùng document.addEventListener (không phải React synthetic events) vì
  // overflow-y-scroll trên iOS có thể suppress touchmove bubble lên parent.
  // touchstart + touchend luôn fire trên iOS kể cả khi scroll container claim gesture.
  const touchStartRef = useRef<{ x: number; y: number } | null>(null);
  const [swipeProgress, setSwipeProgress] = useState(0);

  useEffect(() => {
    const onTouchStart = (e: TouchEvent) => {
      touchStartRef.current = { x: e.touches[0].clientX, y: e.touches[0].clientY };
    };
    const onTouchMove = (e: TouchEvent) => {
      if (!touchStartRef.current) return;
      const dx = e.touches[0].clientX - touchStartRef.current.x;
      const dy = e.touches[0].clientY - touchStartRef.current.y;
      // Chỉ track khi đang vuốt phải và rõ ràng là ngang (không phải scroll dọc)
      if (dx > 0 && Math.abs(dx) > Math.abs(dy) * 1.2) {
        setSwipeProgress(dx);
      }
    };
    const onTouchEnd = (e: TouchEvent) => {
      if (!touchStartRef.current) return;
      const dx = e.changedTouches[0].clientX - touchStartRef.current.x;
      const dy = e.changedTouches[0].clientY - touchStartRef.current.y;
      touchStartRef.current = null;
      setSwipeProgress(0);
      // Threshold: >60px ngang VÀ ngang > dọc * 2 (tránh trigger khi scroll chéo)
      if (dx > 60 && Math.abs(dx) > Math.abs(dy) * 2) {
        router.back();
      }
    };
    document.addEventListener('touchstart', onTouchStart, { passive: true });
    document.addEventListener('touchmove', onTouchMove, { passive: true });
    document.addEventListener('touchend', onTouchEnd, { passive: true });
    return () => {
      document.removeEventListener('touchstart', onTouchStart);
      document.removeEventListener('touchmove', onTouchMove);
      document.removeEventListener('touchend', onTouchEnd);
    };
  }, [router]);

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

      {/* Swipe-back indicator — hiện khi user đang vuốt phải đủ xa */}
      {swipeProgress > 20 && (
        <div
          className="absolute left-3 top-1/2 -translate-y-1/2 z-50 pointer-events-none"
          style={{ opacity: Math.min(swipeProgress / 80, 1) }}
        >
          <div className="w-9 h-9 rounded-full bg-white/20 backdrop-blur-md flex items-center justify-center">
            <Icons.chevronLeft className="w-5 h-5 text-white" />
          </div>
        </div>
      )}

      {/* gated=true: khóa scroll cho đến khi user bật loa (chỉ khi reload) */}
      <div
        className={`h-dvh snap-y snap-mandatory scrollbar-hide overscroll-none ${
          gated ? 'overflow-hidden' : 'overflow-y-scroll'
        }`}
      >
        {videos.map((video, index) => (
          <VideoSlide
            key={video.slug}
            video={video}
            muted={muted}
            onVisible={handleVideoTestVisible}
            onMutedChange={handleMutedChange}
            onGateOpen={() => setGated(false)}
            autoLoad={index === initialIndex || index === initialIndex + 1}
            isCurrentOrNext={currentIndexReady && (index === currentIndex || index === currentIndex + 1)}
            forcePause={gated}
          />
        ))}
      </div>
    </div>
  );
};

export default VideoDetailPage;
