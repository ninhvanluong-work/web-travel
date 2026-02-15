import 'animate.css';

import { useRouter } from 'next/router';
import React, { useEffect, useRef, useState } from 'react';

import { Icons } from '@/assets/icons';
import { SEARCH_SUGGESTIONS } from '@/data/search';
import { cn } from '@/lib/utils';
import type { NextPageWithLayout } from '@/types';

import SearchBox from './components/SearchBox';
import VirtualKeyboard from './components/VirtualKeyboard';

const HomePage: NextPageWithLayout = () => {
  const router = useRouter();

  const videoRef = useRef<HTMLVideoElement>(null);
  const searchInputRef = useRef<HTMLInputElement>(null);
  const [isMuted, setIsMuted] = useState(false);
  const [isFocused, setIsFocused] = useState(false);

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

  const unmuteOnInteraction = () => {
    if (videoRef.current && isMuted) {
      videoRef.current.muted = false;
      videoRef.current.play();
      setIsMuted(false);
    }
  };

  const handleSearchFocus = () => {
    setIsFocused(true);
  };

  const handleSuggestionClick = (suggestion: string) => {
    router.push(`/search?q=${encodeURIComponent(suggestion)}`);
  };

  const handleVirtualKeyPress = (key: string) => {
    if (!searchInputRef.current) return;

    const input = searchInputRef.current;
    const scrollPos = input.scrollTop;
    const currentVal = input.value;
    let newVal = currentVal;
    let selectionStart = input.selectionStart || currentVal.length;
    let selectionEnd = input.selectionEnd || currentVal.length;

    if (key === 'backspace') {
      if (selectionStart === selectionEnd && selectionStart > 0) {
        newVal = currentVal.slice(0, selectionStart - 1) + currentVal.slice(selectionStart);
        selectionStart--;
      } else if (selectionStart !== selectionEnd) {
        newVal = currentVal.slice(0, selectionStart) + currentVal.slice(selectionEnd);
      }
      selectionEnd = selectionStart;
    } else if (key === 'space') {
      newVal = `${currentVal.slice(0, selectionStart)} ${currentVal.slice(selectionEnd)}`;
      selectionStart++;
      selectionEnd = selectionStart;
    } else if (key === 'return') {
      if (newVal.trim()) {
        router.push(`/search?q=${encodeURIComponent(newVal.trim())}`);
      }
      return;
    } else if (key === 'shift' || key === '123') {
      return;
    } else {
      newVal = currentVal.slice(0, selectionStart) + key + currentVal.slice(selectionEnd);
      selectionStart++;
      selectionEnd = selectionStart;
    }

    const nativeInputValueSetter = Object.getOwnPropertyDescriptor(window.HTMLInputElement.prototype, 'value')?.set;
    nativeInputValueSetter?.call(input, newVal);

    const event = new Event('input', { bubbles: true });
    input.dispatchEvent(event);

    input.setSelectionRange(selectionStart, selectionEnd);
    input.focus();
    input.scrollTop = scrollPos;
  };

  return (
    <div
      className="relative h-full w-full overflow-hidden"
      onClick={unmuteOnInteraction}
      onTouchStart={unmuteOnInteraction}
    >
      <VirtualKeyboard isVisible={isFocused} onKeyPress={handleVirtualKeyPress} />
      <video
        ref={videoRef}
        id="myVideo"
        className="absolute top-1/2 left-1/2 min-h-full min-w-full -translate-x-1/2 -translate-y-1/2 object-cover"
        src="https://web-travel.sgp1.cdn.digitaloceanspaces.com/dev/Village%20Tour.mov"
        autoPlay
        loop
        muted={isMuted}
        playsInline
      />

      {isFocused && (
        <div
          className="absolute inset-0 bg-black/60 z-20 animate__animated animate__fadeIn"
          onClick={(e) => {
            e.stopPropagation();
            setIsFocused(false);
          }}
        />
      )}

      <div className="absolute inset-0 bg-black/30" />
      <main className="relative z-30 h-full w-full pointer-events-none">
        <div
          className={cn(
            'absolute left-1/2 w-full max-w-3xl -translate-x-1/2 px-[30px] pointer-events-auto transition-all duration-500 ease-in-out -translate-y-1/2',
            isFocused ? 'top-28' : 'top-[80%]'
          )}
        >
          <div className="w-full flex flex-col items-center animate__animated animate__slideInUp">
            <div className="w-full max-w-[500px]">
              <SearchBox ref={searchInputRef} onSearchClick={handleSearchFocus} />
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

        <button
          className="absolute top-4 right-4 p-2 bg-black/50 rounded-full text-white hover:bg-black/70 transition-colors pointer-events-auto z-50"
          onClick={(e) => {
            e.stopPropagation();
            if (videoRef.current) {
              videoRef.current.muted = !videoRef.current.muted;
              setIsMuted(videoRef.current.muted);
            }
          }}
          onTouchStart={(e) => e.stopPropagation()}
        >
          {isMuted ? <Icons.volumeX size={24} /> : <Icons.volume2 size={24} />}
        </button>
      </main>
    </div>
  );
};

export default HomePage;
