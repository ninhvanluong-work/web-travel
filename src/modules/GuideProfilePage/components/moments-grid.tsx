'use client';

import { X } from 'lucide-react';
import Image from 'next/image';
import { useEffect, useRef, useState } from 'react';

import { useTourGuideMoments, useTourGuideMomentsInfinite } from '@/api/tour-guide/queries';
import type { ITourGuideMoment } from '@/api/tour-guide/types';
import type { BunnyPlayerHandle } from '@/components/BunnyVideoPlayer';
import BunnyVideoPlayer from '@/components/BunnyVideoPlayer';
import { Button } from '@/components/ui/button';
import { Dialog, DialogClose, DialogContent } from '@/components/ui/dialog';
import { Sheet, SheetContent, SheetHeader, SheetTitle } from '@/components/ui/sheet';
import { Skeleton } from '@/components/ui/skeleton';
import { Spinner } from '@/components/ui/spinner';
import { unlockVideoPool } from '@/hooks/use-shared-video';

interface MomentsGridProps {
  guideId: string;
}

// ── VideoPopup ─────────────────────────────────────────────────────────────
// Uses BunnyVideoPlayer (native <video>) instead of iframe so that:
//   - pointer events are not swallowed by a cross-origin frame
//   - tap-to-pause works natively
//   - swipe-right follows the same pattern as useSwipeBack (pointer events,
//     resistance damping, velocity/threshold check)

function VideoPopup({ moment, onClose }: { moment: ITourGuideMoment; onClose: () => void }) {
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

// ── MomentCard ─────────────────────────────────────────────────────────────

function MomentCard({ moment, onClick }: { moment: ITourGuideMoment; onClick: (m: ITourGuideMoment) => void }) {
  return (
    <button
      type="button"
      onClick={() => onClick(moment)}
      className="aspect-[9/14] rounded-lg relative overflow-hidden w-full bg-neutral-800 group"
    >
      {moment.thumbnail && (
        <Image
          src={moment.thumbnail}
          alt={moment.title}
          fill
          className="object-cover transition-transform duration-300 group-hover:scale-105"
          sizes="50vw"
        />
      )}
      <div className="absolute inset-0 bg-gradient-to-t from-black/55 to-transparent" />
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-9 h-9 rounded-full bg-white/[0.92] flex items-center justify-center transition-transform duration-200 group-hover:scale-110">
        <svg width="13" height="13" viewBox="0 0 12 12">
          <path d="M3 2L10 6L3 10Z" fill="black" />
        </svg>
      </div>
      <div className="absolute bottom-2 left-2.5 right-2.5">
        <p className="text-[12px] text-white mb-0.5 italic" style={{ fontFamily: 'var(--font-serif)' }}>
          {moment.title}
        </p>
        <p className="text-[10px] text-white/80">{moment.duration}</p>
      </div>
    </button>
  );
}

// ── MomentsGrid ────────────────────────────────────────────────────────────

export default function MomentsGrid({ guideId }: MomentsGridProps) {
  const [sheetOpen, setSheetOpen] = useState(false);
  const [activeVideo, setActiveVideo] = useState<ITourGuideMoment | null>(null);
  const sentinelRef = useRef<HTMLDivElement>(null);
  const scrollContainerRef = useRef<HTMLDivElement>(null);

  const { data: firstPage, isLoading } = useTourGuideMoments({
    variables: { id: guideId, page: 1, pageSize: 4 },
    enabled: !!guideId,
  });

  const {
    data: infiniteData,
    fetchNextPage,
    hasNextPage,
    isFetchingNextPage,
  } = useTourGuideMomentsInfinite({
    variables: { id: guideId },
    enabled: sheetOpen && !!guideId,
  });

  const openVideo = (m: ITourGuideMoment) => {
    unlockVideoPool();
    setActiveVideo(m);
  };

  const displayedMoments = firstPage?.items ?? [];
  const totalMoments = firstPage?.pagination.total ?? 0;
  const allMoments = infiniteData?.pages.flatMap((p) => p.items) ?? [];

  useEffect(() => {
    if (!sheetOpen) return undefined;
    const sentinel = sentinelRef.current;
    const container = scrollContainerRef.current;
    if (!sentinel || !container) return undefined;
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting && hasNextPage && !isFetchingNextPage) fetchNextPage();
      },
      { root: container, threshold: 0.1 }
    );
    observer.observe(sentinel);
    return () => observer.disconnect();
  }, [sheetOpen, hasNextPage, isFetchingNextPage, fetchNextPage]);

  if (isLoading) {
    return (
      <div className="py-[22px] px-[18px] bg-white border-b border-neutral-200">
        <p className="text-[14px] font-medium text-neutral-900 mb-3">Khoảnh khắc từ tour</p>
        <div className="grid grid-cols-2 gap-2">
          {Array.from({ length: 4 }).map((_, i) => (
            <Skeleton key={i} className="aspect-[9/14] rounded-lg" />
          ))}
        </div>
      </div>
    );
  }

  if (displayedMoments.length === 0) {
    return (
      <div className="py-[22px] px-[18px] bg-white border-b border-neutral-200">
        <p className="text-[14px] font-medium text-neutral-900 mb-2">Khoảnh khắc từ tour</p>
        <p className="text-caption2 text-neutral-400 italic text-center py-6">Chưa có khoảnh khắc nào được đăng tải</p>
      </div>
    );
  }

  return (
    <>
      <div className="py-[22px] px-[18px] bg-white border-b border-neutral-200">
        <div className="flex justify-between items-baseline mb-3">
          <p className="text-[14px] font-medium text-neutral-900">Khoảnh khắc từ tour</p>
          <span className="text-[12px] text-neutral-500">{totalMoments} clips</span>
        </div>

        <div className="grid grid-cols-2 gap-2">
          {displayedMoments.map((m) => (
            <MomentCard key={m.id} moment={m} onClick={openVideo} />
          ))}
        </div>

        {totalMoments > 4 && (
          <Button
            variant="ghost"
            fullWidth
            blur={false}
            className="mt-3 text-[12px] text-neutral-500 py-[9px] rounded-md"
            onClick={() => setSheetOpen(true)}
          >
            Xem tất cả khoảnh khắc
          </Button>
        )}
      </div>

      <Sheet open={sheetOpen} onOpenChange={setSheetOpen}>
        <SheetContent side="bottom" className="h-[80dvh] p-0 rounded-t-2xl flex flex-col max-w-[430px] mx-auto">
          <SheetHeader className="px-4 pt-4 pb-2 flex-shrink-0">
            <SheetTitle className="text-[14px] font-medium text-neutral-900">
              Khoảnh khắc từ tour · {totalMoments} clips
            </SheetTitle>
          </SheetHeader>
          <div ref={scrollContainerRef} className="flex-1 overflow-y-auto px-4 pb-4">
            <div className="grid grid-cols-2 gap-2">
              {allMoments.map((m) => (
                <MomentCard key={m.id} moment={m} onClick={openVideo} />
              ))}
            </div>
            <div ref={sentinelRef} className="h-2" />
            {isFetchingNextPage && (
              <div className="flex justify-center py-3">
                <Spinner size="1.25rem" className="text-neutral-400" />
              </div>
            )}
          </div>
        </SheetContent>
      </Sheet>

      {/* overflow-visible lets the swipe-out translateX animation escape the box */}
      <Dialog open={!!activeVideo} onOpenChange={(open) => !open && setActiveVideo(null)}>
        <DialogContent className="p-0 bg-black border-0 max-w-[380px] w-full overflow-visible">
          {activeVideo && <VideoPopup key={activeVideo.id} moment={activeVideo} onClose={() => setActiveVideo(null)} />}
        </DialogContent>
      </Dialog>
    </>
  );
}
