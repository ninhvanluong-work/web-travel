import React, { useEffect, useRef, useState } from 'react';

import type { IVideo } from '@/api/video';
import { Icons } from '@/assets/icons';
import { Button } from '@/components/ui/button';
import { useInView } from '@/hooks/useInview';

interface Props {
  video: IVideo;
  isAudioActive: boolean;
  isDimmed: boolean;
  onRequestAudio: (id: string) => void;
  onAudioDeactivate: (id: string) => void;
  onVideoClick: (id: string) => void;
}

const VideoCard = ({ video, isAudioActive, isDimmed, onRequestAudio, onAudioDeactivate, onVideoClick }: Props) => {
  const [ready, setReady] = useState(false);
  const [videoEl, setVideoEl] = useState<HTMLVideoElement | null>(null);
  // Detect when card is ~500px away from viewport → start buffering
  const isNear = useInView(videoEl, { rootMargin: '500px 0px', threshold: 0 });
  const isInView = useInView(videoEl, { threshold: 0.5 });
  const onAudioDeactivateRef = useRef(onAudioDeactivate);
  onAudioDeactivateRef.current = onAudioDeactivate;

  // Effect 0: pre-buffer when near viewport
  useEffect(() => {
    if (isNear && videoEl && videoEl.readyState === 0) {
      videoEl.load();
    }
  }, [isNear, videoEl]);

  // Effect 1: play/pause by visibility
  useEffect(() => {
    if (!isInView) {
      videoEl?.pause();
      // Do NOT reset ready — keep thumbnail hidden on scroll-back
    } else {
      videoEl?.play().catch(() => {});
    }
  }, [isInView, videoEl]);

  // Effect 2: notify parent when scrolled out while active
  useEffect(() => {
    if (!isInView && isAudioActive) {
      onAudioDeactivateRef.current(video.id);
    }
  }, [isInView, isAudioActive, video.id]);

  return (
    <div
      className="group relative overflow-hidden bg-black cursor-pointer transition-opacity duration-300 ease-in-out opacity-100"
      onClick={() => onVideoClick(video.id)}
    >
      <div className="aspect-[3/4] w-full relative">
        {/* Dimmed Overlay */}
        <div
          className={`absolute inset-0 bg-black/60 pointer-events-none transition-opacity duration-300 z-20 ${
            isDimmed ? 'opacity-100' : 'opacity-0'
          }`}
        />

        {/* Video */}
        <video
          ref={setVideoEl}
          src={video.shortUrl}
          className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-[1.03]"
          muted={!isAudioActive}
          playsInline
          loop
          poster={video.thumbnail}
          preload="none"
          onCanPlay={() => setReady(true)}
        />

        {/* Thumbnail placeholder */}
        {video.thumbnail && (
          <img
            src={video.thumbnail}
            alt=""
            aria-hidden="true"
            className={`absolute inset-0 h-full w-full object-cover transition-opacity duration-500 pointer-events-none ${
              ready ? 'opacity-0' : 'opacity-100'
            }`}
          />
        )}

        {/* DEBUG — xóa sau khi test */}
        <div className="absolute top-1 left-1 z-50 text-[9px] bg-black/70 text-white px-1 py-[2px] rounded leading-tight pointer-events-none">
          {isInView ? '▶ play' : '⏸ pause'} | {isNear ? 'near' : 'far'}
        </div>

        {/* Gradient overlay */}
        <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/[0.15] to-transparent pointer-events-none" />

        {/* Mute toggle — bottom right, above title */}
        <Button
          variant="overlay"
          size="icon"
          rounded="full"
          blur={false}
          className="absolute bottom-[42px] right-2 p-[6px] z-10"
          onClick={(e) => {
            e.stopPropagation();
            onRequestAudio(video.id);
          }}
          aria-label={isAudioActive ? 'Tắt âm thanh' : 'Bật âm thanh'}
        >
          {isAudioActive ? (
            <Icons.volume2Fill className="w-3.5 h-3.5 text-white" />
          ) : (
            <Icons.volumeXFill className="w-3.5 h-3.5 text-white/80" />
          )}
        </Button>

        {/* Title overlay — bottom */}
        <div className="absolute bottom-0 left-0 right-0 px-[10px] pb-[10px] pr-[36px] pointer-events-none">
          <h3 className="text-white text-[11px] font-dinpro font-bold leading-[1.35] line-clamp-2 drop-shadow-sm">
            {video.title}
          </h3>
        </div>
      </div>
    </div>
  );
};

export default React.memo(VideoCard);
