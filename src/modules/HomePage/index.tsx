import 'animate.css';

import { Search } from 'lucide-react';
import { useRouter } from 'next/router';
import React, { useEffect, useRef, useState } from 'react';

import { Icons } from '@/assets/icons';
import { SEARCH_SUGGESTIONS } from '@/data/search';
import type { NextPageWithLayout } from '@/types';

import SearchBox from './components/SearchBox';

const HomePage: NextPageWithLayout = () => {
  const router = useRouter();

  const videoRef = useRef<HTMLVideoElement>(null);
  const modalInputRef = useRef<HTMLInputElement>(null);
  const [isMuted, setIsMuted] = useState(false);
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [userMutedManually, setUserMutedManually] = useState(false);

  useEffect(() => {
    const video = videoRef.current;
    if (video) {
      video.muted = false;
      video
        .play()
        .then(() => {
          setIsMuted(false);
        })
        .catch((error) => {
          console.log('Autoplay with sound prevented:', error);
          video.muted = true;
          video.play();
          setIsMuted(true);
        });
    }
  }, []);

  useEffect(() => {
    if (isSearchOpen) {
      const t = setTimeout(() => modalInputRef.current?.focus(), 50);
      return () => clearTimeout(t);
    }
    return undefined;
  }, [isSearchOpen]);

  const unmuteOnInteraction = () => {
    if (videoRef.current && isMuted && !userMutedManually) {
      videoRef.current.muted = false;
      videoRef.current
        .play()
        .then(() => {
          setIsMuted(false);
        })
        .catch((error) => {
          console.log('Play failed:', error);
          videoRef.current!.muted = true;
        });
    }
  };

  const handleSuggestionClick = (suggestion: string) => {
    router.push(`/search?q=${encodeURIComponent(suggestion)}`);
  };

  const toggleMute = () => {
    if (!videoRef.current) return;
    const newMutedState = !videoRef.current.muted;
    videoRef.current.muted = newMutedState;
    setUserMutedManually(newMutedState);
    if (!newMutedState && videoRef.current.paused) {
      videoRef.current.play().catch(() => {});
    }
    setIsMuted(newMutedState);
  };

  return (
    <div
      className="relative h-full w-full overflow-hidden"
      onClick={unmuteOnInteraction}
      onTouchStart={unmuteOnInteraction}
    >
      <video
        ref={videoRef}
        id="myVideo"
        className="fixed top-1/2 left-1/2 h-[100dvh] max-h-[932px] w-full max-w-[430px] -translate-x-1/2 -translate-y-1/2 object-cover"
        src="https://web-travel.sgp1.cdn.digitaloceanspaces.com/dev/Village%20Tour.mp4"
        autoPlay
        loop
        muted={isMuted}
        playsInline
      />

      {/* Search trigger — button giả trông như search box, không phải input */}
      <div className="absolute bottom-[22%] left-1/2 -translate-x-1/2 w-full max-w-3xl px-[30px] z-30 pointer-events-auto">
        <div className="w-full flex flex-col items-center animate__animated animate__slideInUp">
          <button
            type="button"
            className="w-full max-w-[500px] flex items-center gap-3 h-14 px-5 rounded-full bg-white/10 backdrop-blur-sm border border-transparent text-gray-200 text-base shadow-sm hover:bg-white/20 active:bg-white/20 transition-colors"
            onClick={(e) => {
              e.stopPropagation();
              setIsSearchOpen(true);
            }}
          >
            <Search className="w-6 h-6 text-white shrink-0" strokeWidth={3} />
            <span className="opacity-70">Search...</span>
          </button>
        </div>
      </div>

      {/* Fixed search modal — input đã ở top, iOS không cần scroll khi keyboard mở */}
      {isSearchOpen && (
        <div className="fixed inset-0 z-50 animate__animated animate__fadeIn animate__faster">
          {/* Backdrop */}
          <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={() => setIsSearchOpen(false)} />

          {/* Search container ở top — luôn trên keyboard */}
          <div className="relative z-10 px-[30px] pt-14">
            <div className="w-full max-w-[500px] mx-auto flex flex-col items-center">
              <SearchBox ref={modalInputRef} onSearchClick={() => {}} />

              <div className="mt-8 w-full animate__animated animate__fadeIn animate__faster">
                <ul className="flex flex-wrap gap-3 justify-start">
                  {SEARCH_SUGGESTIONS.map((suggestion, index) => (
                    <li
                      key={index}
                      className="px-4 py-2 bg-white/20 hover:bg-white/30 backdrop-blur-md rounded-full text-white text-sm cursor-pointer transition-colors flex items-center gap-2"
                      onClick={() => handleSuggestionClick(suggestion)}
                    >
                      {suggestion}
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Volume button */}
      <button
        className="fixed top-4 right-4 p-3 bg-black/50 rounded-full text-white hover:bg-black/70 transition-colors z-40 active:scale-95"
        onClick={(e) => {
          e.stopPropagation();
          toggleMute();
        }}
        onTouchEnd={(e) => {
          e.preventDefault();
          e.stopPropagation();
          toggleMute();
        }}
        aria-label={isMuted ? 'Bật âm thanh' : 'Tắt âm thanh'}
      >
        {isMuted ? <Icons.volumeX size={24} /> : <Icons.volume2 size={24} />}
      </button>
    </div>
  );
};

export default HomePage;
