import React, { useEffect, useRef, useState } from 'react';

import type { IVideo } from '@/api/video';
import { Icons } from '@/assets/icons';
import { Button } from '@/components/ui/button';
import { useInView } from '@/hooks/useInview';

function formatCount(n: number): string {
  if (n >= 1000) return `${(n / 1000).toFixed(1).replace(/\.0$/, '')}K`;
  return String(n);
}

interface Props {
  video: IVideo;
  onVisible: () => void;
}

const VideoSlide = ({ video, onVisible }: Props) => {
  const [videoEl, setVideoEl] = useState<HTMLVideoElement | null>(null);
  const [muted, setMuted] = useState(true);
  const [liked, setLiked] = useState(false);
  const [likeCount, setLikeCount] = useState(video.likeCount);
  const [likeAnimKey, setLikeAnimKey] = useState(0);

  const isInView = useInView(videoEl, { threshold: 0.8 });

  const onVisibleRef = useRef(onVisible);
  onVisibleRef.current = onVisible;

  useEffect(() => {
    if (isInView) {
      videoEl?.play().catch(() => {});
      onVisibleRef.current();
    } else {
      videoEl?.pause();
    }
  }, [isInView, videoEl]);

  const toggleLike = () => {
    setLiked((prev) => {
      setLikeCount((c) => (prev ? c - 1 : c + 1));
      return !prev;
    });
    setLikeAnimKey((k) => k + 1);
  };

  return (
    <div
      id={`video-slide-${video.id}`}
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
        preload="none"
      />

      {/* Multi-stop gradient — strong bottom, subtle top vignette */}
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/[0.35] via-[42%] to-transparent" />
        <div className="absolute inset-0 bg-gradient-to-b from-black/30 to-transparent h-[30%]" />
      </div>

      {/* Info overlay — bottom left */}
      <div className="absolute bottom-0 left-0 right-[72px] px-[18px] pb-[28px] animate-fade-up">
        <h2 className="text-white font-dinpro font-bold text-[18px] leading-[1.3] drop-shadow-md">{video.title}</h2>
        <p className="text-white/70 font-dinpro font-normal text-[13px] mt-[6px] leading-[1.5] line-clamp-3 drop-shadow-sm">
          {video.description}
        </p>
      </div>

      {/* Action bar — bottom right */}
      <div className="absolute bottom-[24px] right-[14px] flex flex-col items-center gap-[22px]">
        {/* Like */}
        <Button
          variant="transparent"
          size="icon"
          blur={false}
          className="flex-col gap-[5px] h-auto p-0"
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
            {formatCount(likeCount)}
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
};

export default VideoSlide;
