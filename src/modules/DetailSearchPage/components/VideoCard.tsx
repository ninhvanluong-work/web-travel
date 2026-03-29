import React, { useEffect, useRef, useState } from 'react';

import type { IVideo } from '@/api/video';
import { Icons } from '@/assets/icons';
import { Button } from '@/components/ui/button';
import { useInView } from '@/hooks/useInview';
import { VIDEO_SILENT_MP3 } from '@/lib/const';

interface Props {
  video: IVideo;
  index: number;
  isAudioActive: boolean;
  isDimmed: boolean;
  onRequestAudio: (id: string) => void;
  onAudioDeactivate: (id: string) => void;
  onVideoClick: (id: string) => void;
}

const BUNNY_CDN = 'https://vz-186cf1b9-231.b-cdn.net';

function prefetchVideoHls(embedUrl: string) {
  const guid = embedUrl.split('/').pop()?.split('?')[0];
  if (!guid) return;
  const base = `${BUNNY_CDN}/${guid}`;
  fetch(`${base}/playlist.m3u8`).catch(() => {});
  fetch(`${base}/240p/video.m3u8`).catch(() => {});
  fetch(`${base}/240p/video0.ts`).catch(() => {});
}

const VideoCard = ({
  video,
  index,
  isAudioActive,
  isDimmed,
  onRequestAudio,
  onAudioDeactivate,
  onVideoClick,
}: Props) => {
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

  // Effect 1: play/pause by visibility — stagger by index to avoid iOS rejecting simultaneous play() calls
  useEffect(() => {
    if (!isInView) {
      videoEl?.pause();
      // Do NOT reset ready — keep thumbnail hidden on scroll-back
      return undefined;
    }
    const timer = setTimeout(() => {
      videoEl?.play().catch(() => {});
    }, index * 100);
    return () => clearTimeout(timer);
  }, [isInView, videoEl, index]);

  // Effect 2: notify parent when scrolled out while active
  useEffect(() => {
    if (!isInView && isAudioActive) {
      onAudioDeactivateRef.current(video.id);
    }
  }, [isInView, isAudioActive, video.id]);

  return (
    <div
      className="group relative overflow-hidden bg-black cursor-pointer transition-opacity duration-300 ease-in-out opacity-100"
      onPointerDown={() => prefetchVideoHls(video.embedUrl)}
      onClick={() => {
        // Unlock iOS Safari HTMLMediaElement audio session trong user gesture.
        // new Audio().play() đánh dấu tab là "đã được user cho phép phát media",
        // token này tồn tại qua Client-Side Navigation nên VideoDetailPage
        // có thể gọi video.play() có tiếng ngay mà không cần tap lần 2.
        // (AudioContext unlock là gate riêng, không ảnh hưởng <video> element.)
        try {
          new Audio(VIDEO_SILENT_MP3).play().catch(() => {});
        } catch (_) {
          /* ignore */
        }
        onVideoClick(video.id);
      }}
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
