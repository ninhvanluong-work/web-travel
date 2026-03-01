import React, { useEffect, useRef, useState } from 'react';

import type { IVideo } from '@/api/video';
import { Icons } from '@/assets/icons';
import { Button } from '@/components/ui/button';
import { useInView } from '@/hooks/useInview';

interface Props {
  video: IVideo;
  isAudioActive: boolean;
  onRequestAudio: (id: string) => void;
  onAudioDeactivate: (id: string) => void;
}

const VideoCard = ({ video, isAudioActive, onRequestAudio, onAudioDeactivate }: Props) => {
  const [ready, setReady] = useState(false);
  const [videoEl, setVideoEl] = useState<HTMLVideoElement | null>(null);
  const isInView = useInView(videoEl, { threshold: 0.5 });
  const onAudioDeactivateRef = useRef(onAudioDeactivate);
  onAudioDeactivateRef.current = onAudioDeactivate;

  // Effect 1: play/pause theo visibility
  useEffect(() => {
    if (!isInView) {
      videoEl?.pause();
      setReady(false);
    } else {
      videoEl?.play().catch(() => {});
    }
  }, [isInView, videoEl]);

  // Effect 2: notify parent khi scroll out khi đang active
  useEffect(() => {
    if (!isInView && isAudioActive) {
      onAudioDeactivateRef.current(video.id);
    }
  }, [isInView, isAudioActive, video.id]);

  return (
    <div className="group relative overflow-hidden bg-black">
      <div className="aspect-[3/4] w-full relative">
        {/* Video */}
        <video
          ref={setVideoEl}
          src={video.link}
          className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-[1.03]"
          muted={!isAudioActive}
          playsInline
          loop
          poster={video.thumbnail}
          preload="metadata"
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
