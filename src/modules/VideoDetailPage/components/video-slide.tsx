import React, { memo, useEffect, useRef, useState } from 'react';

import type { IVideo } from '@/api/video';
import { dislikeVideo, likeVideo } from '@/api/video';
import { Icons } from '@/assets/icons';
import { Button } from '@/components/ui/button';
import { useInView } from '@/hooks/useInview';
import { useLikedVideos } from '@/hooks/useLikedVideos';

interface Props {
  video: IVideo;
  onVisible: (slug: string) => void;
  initialMuted?: boolean;
  preloadMode?: 'auto' | 'metadata' | 'none';
}

const VideoSlide = memo(({ video, onVisible, initialMuted = true, preloadMode = 'none' }: Props) => {
  const { isLiked, toggleLike: persistLike } = useLikedVideos();

  const [videoEl, setVideoEl] = useState<HTMLVideoElement | null>(null);
  const [muted, setMuted] = useState(initialMuted);
  const [liked, setLiked] = useState(() => isLiked(video.id));
  const [likeCount, setLikeCount] = useState(video.likeCount);
  const [likeAnimKey, setLikeAnimKey] = useState(0);

  // Track last server-confirmed state — for accurate rollback after multi-click spam
  const serverLikedRef = useRef(isLiked(video.id));
  const serverLikeCountRef = useRef(video.likeCount);

  // Debounce handle — per-slide instance
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const isInView = useInView(videoEl, { threshold: 0.6 });

  const onVisibleRef = useRef(onVisible);
  onVisibleRef.current = onVisible;

  useEffect(() => {
    if (isInView) {
      setMuted(false);
      videoEl?.play().catch(() => {});
      onVisibleRef.current(video.slug);
    } else {
      videoEl?.pause();
    }
  }, [isInView, videoEl, video.slug]);

  // Clear pending API call on unmount (user scrolled away quickly)
  useEffect(() => {
    return () => {
      if (debounceRef.current) clearTimeout(debounceRef.current);
    };
  }, []);

  const syncLikeToServer = (targetLikedState: boolean, currentLikeCount: number) => {
    if (debounceRef.current) clearTimeout(debounceRef.current);

    debounceRef.current = setTimeout(async () => {
      // Final state matches server — no API call needed
      if (targetLikedState === serverLikedRef.current) return;

      try {
        if (targetLikedState) {
          await likeVideo(video.id);
        } else {
          await dislikeVideo(video.id);
        }
        // Success: advance server refs
        serverLikedRef.current = targetLikedState;
        serverLikeCountRef.current = currentLikeCount;
      } catch (error) {
        // Rollback optimistic UI to last known server state
        setLiked(serverLikedRef.current);
        setLikeCount(serverLikeCountRef.current);
        // Revert localStorage (toggleLike is a pure toggle — calling again reverts)
        persistLike(video.id);
        console.error('[VideoSlide] like/dislike failed', error);
      }
    }, 500);
  };

  const toggleLike = () => {
    const newLikedState = !liked;
    const newLikeCount = newLikedState ? likeCount + 1 : likeCount - 1;

    // 1. Optimistic UI
    setLiked(newLikedState);
    setLikeCount(newLikeCount);
    setLikeAnimKey((k) => k + 1);

    // 2. Persist to localStorage immediately
    persistLike(video.id);

    // 3. Debounced API sync
    syncLikeToServer(newLikedState, newLikeCount);
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
});

export default VideoSlide;
