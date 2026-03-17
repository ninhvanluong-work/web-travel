import React, { memo, useEffect, useRef, useState } from 'react';

import type { IVideo } from '@/api/video';
import { Icons } from '@/assets/icons';
import { Button } from '@/components/ui/button';
import { useInView } from '@/hooks/useInview';
import { useVideoSlideLike } from '@/hooks/useVideoSlideLike';

import VideoPlayOverlay from './video-play-overlay';

interface Props {
  video: IVideo;
  onVisible: (slug: string) => void;
  initialMuted?: boolean;
  preloadMode?: 'auto' | 'metadata' | 'none';
  onBlockedChange?: (isBlocked: boolean) => void;
}

function VideoSlideComponent({ video, onVisible, initialMuted = true, preloadMode = 'none', onBlockedChange }: Props) {
  const [videoEl, setVideoEl] = useState<HTMLVideoElement | null>(null);
  const [muted, setMuted] = useState(initialMuted);
  const [showPlayOverlay, setShowPlayOverlay] = useState(false);

  const { liked, likeCount, likeAnimKey, toggleLike } = useVideoSlideLike(video.id, video.likeCount);

  const isInView = useInView(videoEl, { threshold: 0.6 });

  const onVisibleRef = useRef(onVisible);
  onVisibleRef.current = onVisible;

  const onBlockedChangeRef = useRef(onBlockedChange);
  onBlockedChangeRef.current = onBlockedChange;

  useEffect(() => {
    if (isInView && videoEl) {
      // Always attempt unmuted — browser allows if user has gesture (scrolled before),
      // blocks if no gesture yet (direct link / reload) → show overlay.
      videoEl.muted = false;
      videoEl
        .play()
        .then(() => {
          setMuted(false); // sync React state
        })
        .catch((error: unknown) => {
          if (error instanceof DOMException && error.name === 'NotAllowedError') {
            // Blocked — keep video paused, show overlay, lock scroll
            videoEl.muted = true;
            setMuted(true);
            setShowPlayOverlay(true);
            onBlockedChangeRef.current?.(true);
          }
        });
      onVisibleRef.current(video.slug);
    } else {
      videoEl?.pause();
      setShowPlayOverlay(false);
      onBlockedChangeRef.current?.(false);
    }
  }, [isInView, videoEl, video.slug]);

  const handleForcePlay = () => {
    if (videoEl) videoEl.muted = false; // DOM property — immediate, before play()
    setMuted(false); // React state — sync UI icon
    setShowPlayOverlay(false);
    onBlockedChangeRef.current?.(false);
    videoEl?.play().catch(() => {});
  };

  return (
    <div
      id={`video-slide-${video.slug}`}
      className="relative h-dvh w-full snap-start overflow-hidden bg-black flex-shrink-0"
    >
      {/* Video */}
      <video
        ref={setVideoEl}
        src={video.link}
        className="h-full w-full object-cover"
        muted={muted}
        playsInline
        loop
        poster={video.thumbnail}
        preload={preloadMode}
      />

      {/* Play overlay — shown when autoplay is blocked */}
      <VideoPlayOverlay visible={showPlayOverlay} onPlay={handleForcePlay} />

      {/* Gradient overlay */}
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/[0.35] via-[42%] to-transparent" />
        <div className="absolute inset-0 bg-gradient-to-b from-black/30 to-transparent h-[30%]" />
      </div>

      {/* Info overlay — bottom left */}
      <div
        className="absolute bottom-0 left-0 right-[72px] px-[18px] animate-fade-up"
        style={{ paddingBottom: 'calc(28px + env(safe-area-inset-bottom, 0px))' }}
      >
        <h2 className="text-white font-dinpro font-bold text-[18px] leading-[1.3] drop-shadow-md">{video.title}</h2>
        <p className="text-white/70 font-dinpro font-normal text-[13px] mt-[6px] leading-[1.5] line-clamp-3 drop-shadow-sm">
          {video.description}
        </p>
      </div>

      {/* Action bar — bottom right */}
      <div
        className="absolute right-[14px] flex flex-col items-center gap-[22px]"
        style={{ bottom: 'calc(24px + env(safe-area-inset-bottom, 0px))' }}
      >
        {/* Like */}
        <Button
          variant="transparent"
          size="icon"
          blur={false}
          className="flex-col gap-[5px] h-auto p-[7px]"
          onClick={toggleLike}
          aria-label={liked ? 'Bỏ thích' : 'Thích'}
        >
          <Icons.thumbsUp
            key={likeAnimKey}
            className={`w-[30px] h-[30px] drop-shadow transition-colors duration-200 ${
              liked ? 'text-blue-400 animate-like-pop' : 'text-white'
            }`}
          />
          <span className="text-white text-[11px] font-dinpro font-bold drop-shadow leading-none">
            {likeCount.toLocaleString()}
          </span>
        </Button>

        {/* Mute */}
        <Button
          variant="glassLight"
          size="icon"
          rounded="full"
          blur={false}
          className="p-[10px]"
          onClick={() => setMuted((prev) => !prev)}
          aria-label={muted ? 'Bật âm thanh' : 'Tắt âm thanh'}
        >
          {muted ? (
            <Icons.volumeXFill className="w-[22px] h-[22px] text-white" />
          ) : (
            <Icons.volume2Fill className="w-[22px] h-[22px] text-white" />
          )}
        </Button>
      </div>
    </div>
  );
}

const VideoSlide = memo(VideoSlideComponent);

export default VideoSlide;
