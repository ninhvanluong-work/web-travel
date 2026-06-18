import { Pencil } from 'lucide-react';
import { useTranslation } from 'next-i18next';
import { useEffect, useRef, useState } from 'react';

import { useTourGuideMoments, useTourGuideMomentsInfinite } from '@/api/tour-guide/queries';
import type { ITourGuideMoment } from '@/api/tour-guide/types';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent } from '@/components/ui/dialog';
import { Sheet, SheetContent, SheetHeader, SheetTitle } from '@/components/ui/sheet';
import { Skeleton } from '@/components/ui/skeleton';
import { Spinner } from '@/components/ui/spinner';
import { unlockVideoPool } from '@/hooks/use-shared-video';

import ManageMomentsSheet from './manage-moments-sheet';
import { MomentCard } from './moments-grid-card';
import { VideoPopup } from './moments-grid-video-popup';

interface MomentsGridProps {
  guideId: string;
  isOwner?: boolean;
}

export default function MomentsGrid({ guideId, isOwner }: MomentsGridProps) {
  const { t } = useTranslation('guidePage');
  const [sheetOpen, setSheetOpen] = useState(false);
  const [manageMomentsOpen, setManageMomentsOpen] = useState(false);
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
        <p className="text-[14px] font-medium text-neutral-900 mb-3">{t('momentsFromTour')}</p>
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
      <>
        <div className="py-[22px] px-[18px] bg-white border-b border-neutral-200">
          <div className="flex items-center gap-2 mb-2">
            <p className="text-[14px] font-medium text-neutral-900">{t('momentsFromTour')}</p>
            {isOwner && (
              <button
                type="button"
                onClick={() => setManageMomentsOpen(true)}
                className="flex items-center gap-1 text-[12px] font-medium text-brand-500 hover:text-brand-600 transition-colors"
              >
                <Pencil size={12} />
                {t('manageMomentsSheet.manage')}
              </button>
            )}
          </div>
          <p className="text-caption2 text-neutral-400 italic text-center py-6">{t('noMomentsYet')}</p>
        </div>
        <ManageMomentsSheet open={manageMomentsOpen} onClose={() => setManageMomentsOpen(false)} guideId={guideId} />
      </>
    );
  }

  return (
    <>
      <div className="py-[22px] px-[18px] bg-white border-b border-neutral-200">
        <div className="flex justify-between items-baseline mb-3">
          <div className="flex items-center gap-2">
            <p className="text-[14px] font-medium text-neutral-900">{t('momentsFromTour')}</p>
            {isOwner && (
              <button
                type="button"
                onClick={() => setManageMomentsOpen(true)}
                className="flex items-center gap-1 text-[12px] font-medium text-brand-500 hover:text-brand-600 transition-colors"
              >
                <Pencil size={12} />
                {t('manageMomentsSheet.manage')}
              </button>
            )}
          </div>
          <span className="text-[12px] text-neutral-500">{t('clips', { count: totalMoments })}</span>
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
            {t('viewAllMoments')}
          </Button>
        )}
      </div>

      <Sheet open={sheetOpen} onOpenChange={setSheetOpen}>
        <SheetContent side="bottom" className="h-[80dvh] p-0 rounded-t-2xl flex flex-col max-w-[430px] mx-auto">
          <SheetHeader className="px-4 pt-4 pb-2 flex-shrink-0">
            <SheetTitle className="text-[14px] font-medium text-neutral-900">
              {t('clipsCount', { count: totalMoments })}
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

      <ManageMomentsSheet open={manageMomentsOpen} onClose={() => setManageMomentsOpen(false)} guideId={guideId} />
    </>
  );
}
