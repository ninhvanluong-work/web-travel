import { X } from 'lucide-react';
import { useEffect, useRef, useState } from 'react';

import type { ITourGuideMoment } from '@/api/tour-guide/types';
import type { BunnyPlayerHandle } from '@/components/BunnyVideoPlayer';
import BunnyVideoPlayer from '@/components/BunnyVideoPlayer';
import { Button } from '@/components/ui/button';
import { DialogClose } from '@/components/ui/dialog';

// Uses BunnyVideoPlayer (native <video>) instead of iframe so that:
//   - pointer events are not swallowed by a cross-origin frame
//   - tap-to-pause works natively
//   - swipe-right follows the same pattern as useSwipeBack (pointer events,
//     resistance damping, velocity/threshold check)

export function VideoPopup({ moment, onClose }: { moment: ITourGuideMoment; onClose: () => void }) {
  const playerRef = useRef<BunnyPlayerHandle>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const [playing, setPlaying] = useState(false);

  // swipe-right state (mirrors useSwipeBack internals)
  const startX = useRef(0);
  const startY = useRef(0);
  const startTime = useRef(0);
  const dragging = useRef(false);
  const rafId = useRef<number | null>(null);

  useEffect(() => {
    const player = playerRef.current;
    player?.play().then(() => setPlaying(true));
    return () => {
      player?.pause();
    };
  }, []);

  const handleTap = () => {
    if (dragging.current) return;
    if (playing) {
      playerRef.current?.pause();
      setPlaying(false);
    } else {
      playerRef.current?.play().then(() => setPlaying(true));
    }
  };

  const applyTransform = (deltaX: number) => {
    if (!containerRef.current) return;
    containerRef.current.style.transform = `translateX(${deltaX * 0.85}px)`;
  };

  const onPointerDown = (e: React.PointerEvent) => {
    startX.current = e.clientX;
    startY.current = e.clientY;
    startTime.current = Date.now();
    dragging.current = false;
    if (containerRef.current) {
      containerRef.current.style.transition = 'none';
      containerRef.current.style.willChange = 'transform';
    }
  };

  const onPointerMove = (e: React.PointerEvent) => {
    const deltaX = e.clientX - startX.current;
    const deltaY = Math.abs(e.clientY - startY.current);
    if (deltaX <= 0 || deltaY > deltaX) return;
    dragging.current = true;
    if (rafId.current !== null) cancelAnimationFrame(rafId.current);
    rafId.current = requestAnimationFrame(() => applyTransform(deltaX));
  };

  const onPointerUp = (e: React.PointerEvent) => {
    if (rafId.current !== null) {
      cancelAnimationFrame(rafId.current);
      rafId.current = null;
    }
    if (!dragging.current) return;
    dragging.current = false;

    const deltaX = e.clientX - startX.current;
    const elapsed = Date.now() - startTime.current;
    const velocity = deltaX / elapsed;

    if (deltaX / window.innerWidth >= 0.25 || velocity >= 0.3) {
      if (containerRef.current) {
        containerRef.current.style.transition = 'transform 0.2s ease-out';
        containerRef.current.style.transform = `translateX(${window.innerWidth}px)`;
      }
      setTimeout(onClose, 200);
      return;
    }

    if (containerRef.current) {
      containerRef.current.style.transition = 'transform 0.35s cubic-bezier(0.25, 0.46, 0.45, 0.94)';
      containerRef.current.style.transform = 'translateX(0)';
      containerRef.current.style.willChange = 'auto';
    }
  };

  const onPointerCancel = () => {
    dragging.current = false;
    if (containerRef.current) {
      containerRef.current.style.transition = 'transform 0.35s cubic-bezier(0.25, 0.46, 0.45, 0.94)';
      containerRef.current.style.transform = 'translateX(0)';
    }
  };

  return (
    <div
      ref={containerRef}
      className="relative w-full aspect-[9/16] bg-black"
      onPointerDown={onPointerDown}
      onPointerMove={onPointerMove}
      onPointerUp={onPointerUp}
      onPointerCancel={onPointerCancel}
    >
      <BunnyVideoPlayer
        ref={playerRef}
        embedUrl={moment.embedUrl}
        muted={false}
        className="absolute inset-0 w-full h-full"
      />

      {/* Full-area tap zone for play/pause */}
      <div className="absolute inset-0 z-10" onClick={handleTap} />

      {/* Close button — larger than the default DialogContent X */}
      <DialogClose asChild>
        <Button variant="glass" size="icon" rounded="full" blur={false} className="absolute right-3 top-3 z-30 p-2">
          <X className="h-5 w-5" />
        </Button>
      </DialogClose>

      {/* Pause indicator */}
      {!playing && (
        <div className="absolute inset-0 z-20 flex items-center justify-center pointer-events-none">
          <div className="w-14 h-14 rounded-full bg-black/50 backdrop-blur-md flex items-center justify-center">
            <svg width="22" height="22" viewBox="0 0 12 12">
              <path d="M3 2L10 6L3 10Z" fill="white" />
            </svg>
          </div>
        </div>
      )}
    </div>
  );
}
