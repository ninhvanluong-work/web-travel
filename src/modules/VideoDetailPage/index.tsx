import { useRouter } from 'next/router';
import React, { useCallback, useEffect, useMemo, useRef } from 'react';

import type { IVideo } from '@/api/video';
import { useListVideo } from '@/api/video';
import { Icons } from '@/assets/icons';
import { Button } from '@/components/ui/button';

import VideoSlide from './components/video-slide';

const VideoDetailPage = () => {
  const router = useRouter();
  const { id, ids } = router.query;
  const { data: allVideos } = useListVideo();

  const videos = useMemo(() => {
    if (!allVideos) return [];
    const videoIds = typeof ids === 'string' ? ids.split(',') : null;
    if (videoIds && videoIds.length > 0) {
      return videoIds.map((vid) => allVideos.find((v) => v.id === vid)).filter(Boolean) as IVideo[];
    }
    return allVideos;
  }, [allVideos, ids]);

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
      const idsParam = typeof ids === 'string' && ids ? `?ids=${ids}` : '';
      router.replace(`/video/${videoId}${idsParam}`, undefined, { shallow: true });
    },
    [id, ids, router]
  );

  if (!allVideos) {
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
        className="absolute top-[14px] left-[14px] z-50 p-[9px]"
        onClick={() => router.back()}
        aria-label="Quay lại"
      >
        <Icons.chevronLeft className="w-[20px] h-[20px]" />
      </Button>

      <div className="h-full overflow-y-scroll snap-y snap-mandatory scrollbar-hide">
        {videos.map((video) => (
          <VideoSlide key={video.id} video={video} onVisible={() => handleVideoVisible(video.id)} />
        ))}
      </div>
    </div>
  );
};

export default VideoDetailPage;
