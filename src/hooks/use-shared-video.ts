import { type RefObject, useEffect, useRef, useState } from 'react';

import { logger } from '@/lib/logger';

function createPoolElement(): HTMLVideoElement {
  const video = document.createElement('video');
  video.style.cssText = 'position:absolute;inset:0;width:100%;height:100%;object-fit:cover';
  video.playsInline = true;
  video.loop = true;
  video.muted = true;
  video.preload = 'metadata';
  return video;
}

const pool: HTMLVideoElement[] =
  typeof window !== 'undefined'
    ? [createPoolElement(), createPoolElement(), createPoolElement(), createPoolElement(), createPoolElement()]
    : [];

const available: HTMLVideoElement[] = [...pool];

export function unlockVideoPool(): void {
  pool.forEach((video) => {
    video.play().catch(() => {});
    video.pause();
  });
}

interface SharedVideoOptions {
  poster?: string;
  loop?: boolean;
}

export function useSharedVideo(
  containerRef: RefObject<HTMLDivElement>,
  options: SharedVideoOptions = {}
): HTMLVideoElement | null {
  const [videoEl, setVideoEl] = useState<HTMLVideoElement | null>(null);
  const optionsRef = useRef(options);
  optionsRef.current = options;

  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    const video = available.pop() ?? null;
    if (!video) {
      logger.error('Video pool exhausted — slide eviction too slow, check rootMargin', {
        poolSize: pool.length,
        available: available.length,
      });
      return;
    }

    video.poster = optionsRef.current.poster ?? '';
    video.loop = optionsRef.current.loop ?? true;
    video.muted = true;

    container.appendChild(video);
    setVideoEl(video);

    // eslint-disable-next-line consistent-return
    return () => {
      video.pause();
      video.removeAttribute('src');
      video.poster = '';
      video.load();
      if (container.contains(video)) {
        container.removeChild(video);
      }
      available.push(video);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []); // mount/unmount only

  return videoEl;
}
