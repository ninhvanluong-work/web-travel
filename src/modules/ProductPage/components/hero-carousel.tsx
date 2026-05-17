'use client';

import { useEffect, useRef, useState } from 'react';

import { Icons } from '@/assets/icons';
import BunnyVideoPlayer, { type BunnyPlayerHandle } from '@/components/BunnyVideoPlayer';
import { Button } from '@/components/ui/button';
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
  const playerRefs = useRef<Map<number, BunnyPlayerHandle>>(new Map());
  const [activeIndex, setActiveIndex] = useState(0);
  const [playingIndex, setPlayingIndex] = useState<number | null>(null);
  const [api, setApi] = useState<CarouselApi>();

  useEffect(() => {
    if (!api) return () => {};

    setActiveIndex(api.selectedScrollSnap());

    const handleSelect = () => {
      const newIndex = api.selectedScrollSnap();

      setPlayingIndex((prev) => {
        if (prev !== null) playerRefs.current.get(prev)?.pause();
        return null;
      });

      setActiveIndex(newIndex);
    };

    api.on('select', handleSelect);
    return () => {
      api.off('select', handleSelect);
    };
  }, [api]);

  const scrollToSlide = (index: number) => {
    api?.scrollTo(index);
  };

  // Cleanup stale player refs when media slides change
  useEffect(() => {
    return () => {
      playerRefs.current.forEach((p) => p.pause());
      playerRefs.current.clear();
    };
  }, [media]);

  const toggleVideo = async (index: number) => {
    const player = playerRefs.current.get(index);
    if (!player) return;
    if (player.isPlaying()) {
      player.pause();
      setPlayingIndex(null);
    } else {
      // muted={false} is passed to BunnyVideoPlayer so play() already plays with sound
      await player.play();
      setPlayingIndex(index);
    }
  };

  return (
    <div className="relative w-full aspect-[16/10]">
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
                    <BunnyVideoPlayer
                      ref={(handle) => {
                        if (handle) playerRefs.current.set(i, handle);
                        else playerRefs.current.delete(i);
                      }}
                      embedUrl={item.url}
                      poster={item.poster}
                      muted={false}
                      className="absolute inset-0 w-full h-full"
                    />
                  </div>

                  {playingIndex !== i && (
                    <Button
                      variant="ghost"
                      size="icon"
                      rounded="full"
                      blur={false}
                      className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-14 h-14 bg-white/95"
                      aria-label="Play video"
                      onClick={(e) => {
                        e.stopPropagation();
                        toggleVideo(i);
                      }}
                    >
                      <Icons.playTriangleFill className="w-5 h-5 text-black" />
                    </Button>
                  )}
                </>
              ) : (
                <img src={item.url} alt="Image unavailable" className="w-full h-full object-cover" />
              )}
            </CarouselItem>
          ))}
        </CarouselContent>
      </Carousel>

      {/* Save + Share buttons */}
      <div className="absolute top-3.5 right-3.5 flex gap-2">
        <Button
          variant="ghost"
          size="icon"
          rounded="full"
          blur={false}
          className="w-[34px] h-[34px] bg-white/95"
          aria-label="Save"
        >
          <Icons.heart className="w-[14px] h-[14px] text-black" />
        </Button>
        <Button
          variant="ghost"
          size="icon"
          rounded="full"
          blur={false}
          className="w-[34px] h-[34px] bg-white/95"
          aria-label="Share"
        >
          <Icons.upload className="w-[13px] h-[13px] text-black" />
        </Button>
      </div>

      {/* Pagination dots + counter */}
      <div className="absolute bottom-7 left-3.5 flex">
        {media.map((_, i) => (
          <Button
            key={i}
            variant="transparent"
            size="icon"
            blur={false}
            className="py-5 px-1 h-auto"
            aria-label={`Go to slide ${i + 1}`}
            onClick={() => scrollToSlide(i)}
          >
            <span
              className={`block h-[3px] rounded-[2px] transition-all ${
                i === activeIndex ? 'w-[18px] bg-white' : 'w-2 bg-white/50'
              }`}
            />
          </Button>
        ))}
      </div>
      <div className="absolute bottom-7 right-3.5 px-2.5 py-1 bg-black/50 backdrop-blur-sm rounded-full">
        <span className="text-[11px] text-white">
          {activeIndex + 1} / {media.length}
        </span>
      </div>

      <span aria-live="polite" className="sr-only">
        Slide {activeIndex + 1} of {media.length}
      </span>

      <div className="absolute bottom-[-1px] left-0 right-0 h-6 bg-white rounded-t-[24px]" />
    </div>
  );
}
