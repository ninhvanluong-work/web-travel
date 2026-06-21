import { type InfiniteData, useQueryClient } from '@tanstack/react-query';
import { AnimatePresence, motion } from 'framer-motion';
import { Pencil, Plus, Trash2, X } from 'lucide-react';
import Image from 'next/image';
import { useTranslation } from 'next-i18next';
import { useCallback, useRef, useState } from 'react';

import {
  type IDeleteMomentVariables,
  useDeleteTourGuideMoment,
  useTourGuideMoments,
  useTourGuideMomentsInfinite,
} from '@/api/tour-guide/queries';
import type { ITourGuideMoment, ITourGuideMomentsResult } from '@/api/tour-guide/types';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import { Dialog, DialogContent } from '@/components/ui/dialog';
import { Sheet, SheetContent, SheetTitle } from '@/components/ui/sheet';
import { Spinner } from '@/components/ui/spinner';
import { unlockVideoPool } from '@/hooks/use-shared-video';

import { AddMomentSheet } from './manage-moments-add-sheet';
import { VideoPopup } from './moments-grid-video-popup';

// ── Moment manage card ─────────────────────────────────────────────────────

function MomentManageCard({
  moment,
  onDelete,
  onEdit,
  onClick,
}: {
  moment: ITourGuideMoment;
  onDelete: (id: string) => void;
  onEdit: (moment: ITourGuideMoment) => void;
  onClick: (moment: ITourGuideMoment) => void;
}) {
  return (
    <div
      onClick={() => onClick(moment)}
      className="relative aspect-[9/14] rounded-xl overflow-hidden bg-neutral-800 group cursor-pointer"
    >
      {moment.thumbnail && (
        <Image
          src={moment.thumbnail}
          alt={moment.title}
          fill
          className="object-cover transition-transform duration-300 group-hover:scale-105"
          sizes="45vw"
        />
      )}
      <div className="absolute inset-0 bg-gradient-to-t from-black/55 to-transparent" />

      {/* Play button overlay */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-10 h-10 rounded-full bg-white/[0.92] flex items-center justify-center transition-transform duration-200 group-hover:scale-110 shadow-md">
        <svg width="14" height="14" viewBox="0 0 12 12">
          <path d="M3 2L10 6L3 10Z" fill="black" />
        </svg>
      </div>

      <div className="absolute bottom-2 left-2 right-8">
        <p className="text-[11px] text-white truncate italic" style={{ fontFamily: 'var(--font-serif)' }}>
          {moment.title}
        </p>
        <p className="text-[10px] text-white/70">{moment.duration}</p>
      </div>
      <div className="absolute top-2 right-2 flex flex-col gap-1.5 z-10" onClick={(e) => e.stopPropagation()}>
        <button
          type="button"
          onClick={() => onEdit(moment)}
          className="w-7 h-7 rounded-full bg-black/60 backdrop-blur-sm flex items-center justify-center active:bg-brand-500 transition-colors"
        >
          <Pencil size={13} className="text-white" />
        </button>
        <button
          type="button"
          onClick={() => onDelete(moment.id)}
          className="w-7 h-7 rounded-full bg-black/60 backdrop-blur-sm flex items-center justify-center active:bg-rose-600 transition-colors"
        >
          <Trash2 size={13} className="text-white" />
        </button>
      </div>
    </div>
  );
}

// ── Main sheet ─────────────────────────────────────────────────────────────

interface ManageMomentsSheetProps {
  open: boolean;
  onClose: () => void;
  guideId: string;
}

export default function ManageMomentsSheet({ open, onClose, guideId }: ManageMomentsSheetProps) {
  const { t } = useTranslation('guidePage');
  const [deletedIds, setDeletedIds] = useState<Set<string>>(new Set());
  const [confirmId, setConfirmId] = useState<string | null>(null);
  const [addOpen, setAddOpen] = useState(false);
  const [editMoment, setEditMoment] = useState<ITourGuideMoment | null>(null);
  const [activeVideo, setActiveVideo] = useState<ITourGuideMoment | null>(null);
  const scrollRef = useRef<HTMLDivElement>(null);

  const queryClient = useQueryClient();
  const { mutate: deleteMoment } = useDeleteTourGuideMoment();

  const { data, fetchNextPage, hasNextPage, isFetchingNextPage, isLoading } = useTourGuideMomentsInfinite({
    variables: { id: guideId },
    enabled: open && !!guideId,
  });

  const allMoments = (data?.pages.flatMap((p) => p.items) ?? []).filter((m) => !deletedIds.has(m.id));

  const openVideo = (m: ITourGuideMoment) => {
    unlockVideoPool();
    setActiveVideo(m);
  };

  const invalidateMoments = useCallback(() => {
    queryClient.invalidateQueries({ queryKey: useTourGuideMoments.getKey() });
    queryClient.invalidateQueries({ queryKey: useTourGuideMomentsInfinite.getKey() });
  }, [queryClient]);

  const onDeleteSuccess = useCallback(
    (_: unknown, vars: IDeleteMomentVariables) => {
      queryClient.setQueriesData<ITourGuideMomentsResult>({ queryKey: useTourGuideMoments.getKey() }, (old) => {
        if (!old) return old;
        return {
          ...old,
          items: old.items.filter((m) => m.id !== vars.momentId),
          pagination: { ...old.pagination, total: Math.max(0, old.pagination.total - 1) },
        };
      });
      queryClient.setQueriesData<InfiniteData<ITourGuideMomentsResult>>(
        { queryKey: useTourGuideMomentsInfinite.getKey() },
        (old) => {
          if (!old) return old;
          return {
            ...old,
            pages: old.pages.map((page) => ({
              ...page,
              items: page.items.filter((m) => m.id !== vars.momentId),
              pagination: { ...page.pagination, total: Math.max(0, page.pagination.total - 1) },
            })),
          };
        }
      );
      invalidateMoments();
    },
    [queryClient, invalidateMoments]
  );

  const handleDelete = useCallback(
    (id: string) => {
      setDeletedIds((prev) => {
        const next = new Set(prev);
        next.add(id);
        return next;
      });
      deleteMoment({ guideId, momentId: id }, { onSuccess: onDeleteSuccess });
    },
    [guideId, deleteMoment, onDeleteSuccess]
  );

  // Infinite scroll sentinel
  const observerRef = useCallback(
    (node: HTMLDivElement | null) => {
      if (!node || !scrollRef.current) return;
      const observer = new IntersectionObserver(
        ([entry]) => {
          if (entry.isIntersecting && hasNextPage && !isFetchingNextPage) fetchNextPage();
        },
        { root: scrollRef.current, threshold: 0.1 }
      );
      observer.observe(node);
    },
    [hasNextPage, isFetchingNextPage, fetchNextPage]
  );

  // Touch handlers to swipe down to close on mobile
  const touchStartY = useRef(0);
  const touchCurrentY = useRef(0);

  const handleTouchStart = (e: React.TouchEvent) => {
    touchStartY.current = e.touches[0].clientY;
    touchCurrentY.current = e.touches[0].clientY;
  };

  const handleTouchMove = (e: React.TouchEvent) => {
    touchCurrentY.current = e.touches[0].clientY;
  };

  const handleTouchEnd = () => {
    const deltaY = touchCurrentY.current - touchStartY.current;
    if (deltaY > 80) {
      onClose();
    }
  };

  return (
    <>
      <Sheet open={open} onOpenChange={(v) => !v && onClose()}>
        <SheetContent
          side="bottom"
          className="rounded-t-3xl p-0 flex flex-col max-h-[88vh] bg-[#F8FAFC] border-t border-slate-200/80 shadow-2xl"
          style={{
            left: 'max(0px, calc(50% - 215px))',
            right: 'max(0px, calc(50% - 215px))',
          }}
        >
          <div
            onTouchStart={handleTouchStart}
            onTouchMove={handleTouchMove}
            onTouchEnd={handleTouchEnd}
            className="relative h-6 flex items-center justify-center shrink-0 cursor-ns-resize"
          >
            <div className="w-12 h-1.5 rounded-full bg-slate-200" />
          </div>

          <div
            onTouchStart={handleTouchStart}
            onTouchMove={handleTouchMove}
            onTouchEnd={handleTouchEnd}
            className="px-6 pb-4 border-b border-slate-100 shrink-0 flex flex-row items-center justify-between select-none cursor-ns-resize"
          >
            <SheetTitle className="text-[15px] font-semibold text-neutral-black">
              {t('manageMomentsSheet.title')}
            </SheetTitle>
            <button
              type="button"
              onClick={onClose}
              className="text-slate-400 hover:text-slate-600 transition-colors p-1.5 rounded-full hover:bg-slate-100 flex items-center justify-center active:scale-95"
            >
              <X size={18} />
            </button>
          </div>

          <div ref={scrollRef} className="flex-1 overflow-y-auto px-4 py-4 scrollbar-hide">
            {isLoading && (
              <div className="flex justify-center py-10">
                <Spinner size="1.5rem" className="text-brand-500" />
              </div>
            )}
            {!isLoading && allMoments.length === 0 && (
              <div className="py-10 text-center">
                <p className="text-[13px] text-slate-400 italic">{t('manageMomentsSheet.empty')}</p>
              </div>
            )}
            {!isLoading && allMoments.length > 0 && (
              <div className="grid grid-cols-2 gap-2">
                <AnimatePresence initial={false}>
                  {allMoments.map((m) => (
                    <motion.div
                      key={m.id}
                      layout
                      initial={{ opacity: 0, scale: 0.9 }}
                      animate={{ opacity: 1, scale: 1 }}
                      exit={{ opacity: 0, scale: 0.9 }}
                      transition={{ duration: 0.18 }}
                    >
                      <MomentManageCard moment={m} onDelete={setConfirmId} onEdit={setEditMoment} onClick={openVideo} />
                    </motion.div>
                  ))}
                </AnimatePresence>
              </div>
            )}

            <div ref={observerRef} className="h-2" />
            {isFetchingNextPage && (
              <div className="flex justify-center py-3">
                <Spinner size="1.25rem" className="text-neutral-400" />
              </div>
            )}
          </div>

          <div className="sticky bottom-0 z-10 px-6 py-4 border-t border-slate-100 bg-white/90 backdrop-blur-md shrink-0">
            <button
              type="button"
              onClick={() => setAddOpen(true)}
              className="w-full py-3 rounded-xl bg-neutral-black text-white text-[13px] font-bold hover:bg-neutral-black/90 transition-all active:scale-[0.98] flex items-center justify-center gap-2"
            >
              <Plus size={15} />
              {t('manageMomentsSheet.addMoment')}
            </button>
          </div>
        </SheetContent>
      </Sheet>

      <AddMomentSheet
        open={addOpen || !!editMoment}
        onClose={() => {
          setAddOpen(false);
          setEditMoment(null);
        }}
        guideId={guideId}
        editMoment={editMoment ?? undefined}
      />

      <Dialog open={!!activeVideo} onOpenChange={(isOpen) => !isOpen && setActiveVideo(null)}>
        <DialogContent className="p-0 bg-black border-0 max-w-[380px] w-full overflow-visible z-[110]">
          {activeVideo && <VideoPopup key={activeVideo.id} moment={activeVideo} onClose={() => setActiveVideo(null)} />}
        </DialogContent>
      </Dialog>

      <AlertDialog open={!!confirmId} onOpenChange={(v) => !v && setConfirmId(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>
              {t('manageMomentsSheet.deleteConfirmTitle', { defaultValue: 'Delete this moment?' })}
            </AlertDialogTitle>
            <AlertDialogDescription>
              {t('manageMomentsSheet.deleteConfirmDesc', { defaultValue: 'This action cannot be undone.' })}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter className="flex-row gap-3 sm:space-x-0">
            <AlertDialogCancel className="flex-1 m-0 h-11">
              {t('manageMomentsSheet.cancel', { defaultValue: 'Cancel' })}
            </AlertDialogCancel>
            <AlertDialogAction
              onClick={() => {
                if (confirmId) handleDelete(confirmId);
                setConfirmId(null);
              }}
              className="flex-1 h-11 bg-rose-600 hover:bg-rose-700 text-white focus-visible:ring-rose-600"
            >
              {t('manageMomentsSheet.deleteConfirm', { defaultValue: 'Delete' })}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}
