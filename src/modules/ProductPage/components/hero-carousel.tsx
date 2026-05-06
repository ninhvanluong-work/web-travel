'use client';

import { useEffect, useRef, useState } from 'react';

import { Icons } from '@/assets/icons';

interface MediaItem {
  type: 'image' | 'video';
  url: string;
  poster?: string;
}

interface HeroCarouselProps {
  media: MediaItem[];
}

export default function HeroCarousel({ media }: HeroCarouselProps) {
  const trackRef = useRef<HTMLDivElement>(null);
  const videoRefs = useRef<Map<number, HTMLVideoElement>>(new Map());
  const [activeIndex, setActiveIndex] = useState(0);
  const [playingIndex, setPlayingIndex] = useState<number | null>(null);

  useEffect(() => {
    const track = trackRef.current;
    const observers: IntersectionObserver[] = [];

    if (track) {
      const slides = track.querySelectorAll('[data-slide]');
      slides.forEach((slide, i) => {
        const obs = new IntersectionObserver(
          ([entry]) => {
            if (entry.isIntersecting) setActiveIndex(i);
          },
          { root: track, threshold: 0.6 }
        );
        obs.observe(slide);
        observers.push(obs);
      });
    }

    return () => observers.forEach((o) => o.disconnect());
  }, [media.length]);

  const scrollToSlide = (index: number) => {
    const track = trackRef.current;
    if (!track) return;
    track.scrollTo({ left: index * track.clientWidth, behavior: 'smooth' });
  };

  const toggleVideo = (index: number) => {
    const video = videoRefs.current.get(index);
    if (!video) return;
    if (video.paused) {
      video.play();
      setPlayingIndex(index);
    } else {
      video.pause();
      setPlayingIndex(null);
    }
  };

  return (
    <div className="relative w-full aspect-[16/10]">
      {/* Slide track */}
      <div
        ref={trackRef}
        className="flex w-full h-full overflow-x-auto scrollbar-hide"
        style={{ scrollSnapType: 'x mandatory' }}
      >
        {media.map((item, i) => (
          <div key={i} data-slide className="flex-shrink-0 w-full h-full relative" style={{ scrollSnapAlign: 'start' }}>
            {item.type === 'video' ? (
              <>
                <div className="w-full h-full bg-black relative overflow-hidden">
                  {item.url && (
                    <video
                      ref={(el) => {
                        if (el) videoRefs.current.set(i, el);
                        else videoRefs.current.delete(i);
                      }}
                      src={item.url}
                      poster={item.poster}
                      className="w-full h-full object-cover"
                      playsInline
                      preload="metadata"
                      onEnded={() => setPlayingIndex(null)}
                    />
                  )}
                </div>
                {/* Hero video badge */}
                <div className="absolute top-3.5 left-3.5 flex items-center gap-1.5 px-[11px] py-1.5 bg-black/40 backdrop-blur-sm rounded-full">
                  <span className="w-1.5 h-1.5 rounded-full bg-[#E24B4A]" />
                  <span className="text-[11px] text-white font-medium">Hero video</span>
                </div>
                {/* Play button */}
                {playingIndex !== i && (
                  <button
                    className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-14 h-14 rounded-full bg-white/95 flex items-center justify-center"
                    onClick={() => toggleVideo(i)}
                    aria-label="Play video"
                  >
                    <svg width="20" height="20" viewBox="0 0 12 12">
                      <path d="M3 2L10 6L3 10Z" fill="black" />
                    </svg>
                  </button>
                )}
              </>
            ) : (
              <img src={item.url} alt="" className="w-full h-full object-cover" />
            )}
          </div>
        ))}
      </div>

      {/* Save + Share buttons */}
      <div className="absolute top-3.5 right-3.5 flex gap-2">
        <button
          className="w-[34px] h-[34px] rounded-full bg-white/95 flex items-center justify-center"
          aria-label="Save"
        >
          <Icons.heart className="w-[14px] h-[14px] text-black" />
        </button>
        <button
          className="w-[34px] h-[34px] rounded-full bg-white/95 flex items-center justify-center"
          aria-label="Share"
        >
          <Icons.upload className="w-[13px] h-[13px] text-black" />
        </button>
      </div>

      {/* Pagination dots + counter */}
      <div className="absolute bottom-7 left-3.5 flex gap-1">
        {media.map((_, i) => (
          <button
            key={i}
            onClick={() => scrollToSlide(i)}
            aria-label={`Go to slide ${i + 1}`}
            className={`h-[3px] rounded-[2px] transition-all ${
              i === activeIndex ? 'w-[18px] bg-white' : 'w-2 bg-white/50'
            }`}
          />
        ))}
      </div>
      <div className="absolute bottom-7 right-3.5 px-2.5 py-1 bg-black/50 backdrop-blur-sm rounded-full">
        <span className="text-[11px] text-white">
          {activeIndex + 1} / {media.length}
        </span>
      </div>

      {/* Curved bottom edge */}
      <div className="absolute bottom-[-1px] left-0 right-0 h-6 bg-white rounded-t-[24px]" />
    </div>
  );
}
