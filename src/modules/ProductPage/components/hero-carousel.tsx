'use client';

import { useEffect, useRef, useState } from 'react';

import { Icons } from '@/assets/icons';
import { Carousel, type CarouselApi, CarouselContent, CarouselItem } from '@/components/ui/carousel';

interface MediaItem {
  type: 'image' | 'video';
  url: string;
  poster?: string;
}

interface HeroCarouselProps {
  media: MediaItem[];
}

export default function HeroCarousel({ media }: HeroCarouselProps) {
  const videoRefs = useRef<Map<number, HTMLVideoElement>>(new Map());
  const [activeIndex, setActiveIndex] = useState(0);
  const [playingIndex, setPlayingIndex] = useState<number | null>(null);
  const [api, setApi] = useState<CarouselApi>();

  useEffect(() => {
    if (!api) return;

    setActiveIndex(api.selectedScrollSnap());

    api.on('select', () => {
      setActiveIndex(api.selectedScrollSnap());
    });
  }, [api]);

  const scrollToSlide = (index: number) => {
    api?.scrollTo(index);
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
      <Carousel setApi={setApi} className="w-full h-full [&>div]:h-full">
        <CarouselContent className="h-full ml-0">
          {media.map((item, i) => (
            <CarouselItem key={i} className="pl-0 h-full relative">
              {item.type === 'video' ? (
                <>
                  <div
                    className="w-full h-full bg-black relative overflow-hidden cursor-pointer"
                    onClick={() => toggleVideo(i)}
                  >
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
                      className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-14 h-14 rounded-full bg-white/95 flex items-center justify-center pointer-events-none"
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
            </CarouselItem>
          ))}
        </CarouselContent>
      </Carousel>

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
