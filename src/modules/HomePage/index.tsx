import 'animate.css';

import { useRouter } from 'next/router';
import React, { useEffect, useRef, useState } from 'react';

import { Icons } from '@/assets/icons';
import { SEARCH_SUGGESTIONS } from '@/data/search';
import type { NextPageWithLayout } from '@/types';

import SearchBox from './components/SearchBox';

const HomePage: NextPageWithLayout = () => {
  const router = useRouter();

  const videoRef = useRef<HTMLVideoElement>(null);
  const searchRef = useRef<HTMLDivElement>(null);
  const searchAnimRef = useRef<HTMLDivElement>(null);
  const rafRef = useRef<number>(0);
  const [isMuted, setIsMuted] = useState(false);
  const [isFocused, setIsFocused] = useState(false);
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
    const el = searchAnimRef.current;
    if (!el) return undefined;
    const handleAnimationEnd = () => {
      el.classList.remove('animate__animated', 'animate__slideInUp');
    };
    el.addEventListener('animationend', handleAnimationEnd);
    return () => el.removeEventListener('animationend', handleAnimationEnd);
  }, []);

  useEffect(() => {
    const vv = window.visualViewport;

    const applyTransform = (offsetTop: number) => {
      if (searchRef.current) {
        searchRef.current.style.transform = `translateY(${offsetTop}px)`;
      }
    };

    applyTransform(vv?.offsetTop ?? 0);

    const update = () => {
      cancelAnimationFrame(rafRef.current);
      rafRef.current = requestAnimationFrame(() => applyTransform(vv?.offsetTop ?? 0));
    };

    vv?.addEventListener('resize', update);
    vv?.addEventListener('scroll', update);
    return () => {
      cancelAnimationFrame(rafRef.current);
      vv?.removeEventListener('resize', update);
      vv?.removeEventListener('scroll', update);
    };
  }, []);

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

      {isFocused && (
        <div
          className="fixed inset-0 bg-black/60 z-20 animate__animated animate__fadeIn"
          onClick={(e) => {
            e.stopPropagation();
            setIsFocused(false);
          }}
        />
      )}

      <div
        className="fixed left-1/2 top-1/2 w-full max-w-3xl px-[30px] z-30 pointer-events-auto"
        style={{
          transform: isFocused
            ? 'translateX(-50%) translateY(calc(10rem - 50vh - 50%))'
            : 'translateX(-50%) translateY(calc(30vh - 50%))',
          transition: 'transform 0.5s cubic-bezier(0.4, 0, 0.2, 1)',
        }}
      >
        <div ref={searchRef}>
          <div ref={searchAnimRef} className="w-full flex flex-col items-center animate__animated animate__slideInUp">
            <div className="w-full max-w-[500px]">
              <SearchBox onSearchClick={() => setIsFocused(true)} />
            </div>

            {isFocused && (
              <div className="mt-8 w-full max-w-[500px] animate__animated animate__fadeIn">
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
            )}
          </div>
        </div>
      </div>

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
