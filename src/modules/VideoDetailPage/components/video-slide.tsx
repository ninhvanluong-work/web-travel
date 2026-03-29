import { useRouter } from 'next/router';
import React, { memo, useRef, useState } from 'react';

import type { IVideo } from '@/api/video';
import { Icons } from '@/assets/icons';
import BunnyVideoPlayer, { type BunnyPlayerHandle } from '@/components/BunnyVideoPlayer';
import { Button } from '@/components/ui/button';
import { useInView } from '@/hooks/useInview';
import { useVideoSlideLike } from '@/hooks/useVideoSlideLike';
import { ROUTE } from '@/types/routes';

interface Props {
  video: IVideo;
  muted: boolean;
  onVisible: (slug: string) => void;
  onMutedChange: (muted: boolean) => void;
  onGateOpen?: () => void;
  autoLoad?: boolean;
  forcePause?: boolean; // true khi reload: chặn auto-play cho đến khi user bật loa
}

function VideoSlideComponent({
  video,
  muted,
  onVisible,
  onMutedChange,
  onGateOpen,
  autoLoad = false,
  forcePause = false,
}: Props) {
  const router = useRouter();
  const playerRef = useRef<BunnyPlayerHandle>(null);
  const [containerEl, setContainerEl] = useState<HTMLDivElement | null>(null);
  const [paused, setPaused] = useState(false);
  const [activated, setActivated] = useState(autoLoad);
  const [videoReady, setVideoReady] = useState(false);
  // Guard: chỉ cho phép deactivate sau khi IntersectionObserver đã fire true ít nhất 1 lần.
  // Tránh race condition: useInView khởi tạo false → effect chạy sớm → unmount sai.
  const hasActivatedOnce = useRef(false);

  const { liked, likeCount, likeAnimKey, toggleLike } = useVideoSlideLike(video.id, video.likeCount);

  const onVisibleRef = useRef(onVisible);
  onVisibleRef.current = onVisible;

  const isNearView = useInView(containerEl, { rootMargin: '100% 0px', threshold: 0 });
  const isInView = useInView(containerEl, { threshold: 0.6 });

  // Refs để onReady callback đọc state hiện tại (tránh stale closure)
  const isInViewRef = useRef(false);
  isInViewRef.current = isInView;
  const pausedRef = useRef(false);
  pausedRef.current = paused;
  const forcePauseRef = useRef(false);
  forcePauseRef.current = forcePause;

  // Khởi tạo / hủy HLS theo khoảng cách viewport (200% margin ≈ 2 màn hình).
  // - Activate khi slide vào vùng gần: mount BunnyVideoPlayer, bắt đầu load HLS.
  // - Deactivate khi slide rời xa >2 màn hình: unmount player, giải phóng iOS hardware decoder.
  // hasActivatedOnce guard: tránh deactivate sai khi useInView khởi tạo false
  // trước khi IntersectionObserver kịp fire lần đầu.
  React.useEffect(() => {
    if (isNearView) {
      hasActivatedOnce.current = true;
      setActivated(true);
    } else if (hasActivatedOnce.current) {
      setActivated(false);
      setVideoReady(false); // reset spinner cho lần remount tiếp theo
    }
  }, [isNearView]);

  React.useEffect(() => {
    if (!activated) return;
    if (isInView) {
      if (!paused && !forcePause) playerRef.current?.play();
      onVisibleRef.current(video.slug);
    } else {
      playerRef.current?.pause();
    }
  }, [isInView, video.slug, paused, activated, forcePause]);

  const handleTap = () => {
    if (forcePause) return;
    if (paused) {
      // User đã pause thủ công → resume
      playerRef.current?.play();
      setPaused(false);
    } else if (playerRef.current?.isPlaying()) {
      // Video đang thực sự phát → pause
      playerRef.current.pause();
      setPaused(true);
    } else {
      // Video chưa phát: có thể đang load hoặc bị iOS block.
      // Gọi play() trong gesture context:
      //   - Nếu data chưa có → shouldPlayRef=true → canplay sẽ tự play khi sẵn sàng
      //   - Nếu iOS block autoplay → gesture unlock cho phép play ngay
      playerRef.current?.play();
    }
  };

  const maxLength = 20;
  const isLongDesc = video.description && video.description.length > maxLength;
  const displayDesc = isLongDesc ? video.description.slice(0, maxLength) : video.description;

  return (
    <div
      ref={setContainerEl}
      id={`video-slide-${video.slug}`}
      className="relative h-dvh w-full snap-start overflow-hidden bg-black flex-shrink-0"
    >
      {/* Chỉ load HLS khi slide gần viewport */}
      {activated && (
        <BunnyVideoPlayer
          ref={playerRef}
          embedUrl={video.embedUrl}
          className="absolute inset-0 h-full w-full object-cover"
          muted={muted}
          poster={video.thumbnail}
          onReady={() => {
            setVideoReady(true);
            if (isInViewRef.current && !pausedRef.current && !forcePauseRef.current) {
              playerRef.current?.play();
            }
          }}
        />
      )}

      {/* Loading spinner — hiện khi HLS chưa sẵn sàng */}
      {activated && !videoReady && (
        <div className="absolute inset-0 flex items-center justify-center pointer-events-none z-10">
          <div className="w-8 h-8 rounded-full border-2 border-white/20 border-t-white/80 animate-spin" />
        </div>
      )}

      {/* Gradient overlay */}
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/[0.35] via-[42%] to-transparent" />
        <div className="absolute inset-0 bg-gradient-to-b from-black/30 to-transparent h-[30%]" />
      </div>

      {/* Tap zone */}
      <div className="absolute inset-0 z-10" onClick={handleTap} />

      {/* Gate overlay — chỉ hiện khi reload và đang ở slide này */}
      {forcePause && isInView && (
        <button
          className="absolute inset-0 z-30 flex items-center justify-center"
          aria-label="Phát video"
          onClick={() => {
            playerRef.current?.unmute();
            onMutedChange(false);
            onGateOpen?.();
          }}
        >
          <div className="flex items-center justify-center w-[72px] h-[72px] rounded-full bg-black/40 backdrop-blur-sm border border-white/20">
            <Icons.playSolid className="w-[32px] h-[32px] text-white ml-[4px]" />
          </div>
        </button>
      )}

      {/* Info overlay — bottom left */}
      <div
        className="absolute bottom-0 left-0 right-[72px] px-[18px] animate-fade-up z-20"
        style={{ paddingBottom: 'calc(28px + env(safe-area-inset-bottom, 0px))' }}
      >
        <div
          className="bg-black/30 border border-white/[0.15] backdrop-blur-md rounded-xl p-3 cursor-pointer"
          onClick={() => router.push({ pathname: ROUTE.PRODUCT, query: { videoSlug: video.slug } })}
        >
          <h2 className="text-white font-dinpro font-bold text-[18px] leading-[1.3] drop-shadow-md">{video.title}</h2>
          <p className="text-white/70 font-dinpro font-normal text-[13px] mt-[6px] leading-none drop-shadow-sm line-clamp-1">
            {displayDesc}
            <span className="font-bold text-white ml-1 text-[13px] font-dinpro">... More</span>
          </p>
        </div>
      </div>

      {/* Action bar — bottom right */}
      <div
        className="absolute right-[14px] flex flex-col items-center gap-[22px] z-20"
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

        {/* Mute toggle */}
        <Button
          variant="glassLight"
          size="icon"
          rounded="full"
          blur={false}
          className="p-[10px]"
          onClick={() => {
            const next = !muted;
            onMutedChange(next);
            if (next) {
              playerRef.current?.mute();
            } else {
              // unmute() tự gọi play() nếu cần để unlock iOS audio session
              playerRef.current?.unmute();
            }
          }}
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
