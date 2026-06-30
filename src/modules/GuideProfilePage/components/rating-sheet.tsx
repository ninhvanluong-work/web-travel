import { useQueryClient } from '@tanstack/react-query';
import { motion } from 'framer-motion';
import { useTranslation } from 'next-i18next';
import { useState } from 'react';

import { request } from '@/api/axios';
import { ScrollArea } from '@/components/ui/scrollArea';
import { Sheet, SheetContent, SheetTitle } from '@/components/ui/sheet';
import { TextArea } from '@/components/ui/textarea';
import { tourGuideReviewSchema } from '@/lib/validations/review';
import { useAlertStore } from '@/stores/use-alert-store';
import { API_ROUTE } from '@/types';

import RatingCriteriaPanel, { buildDefaultCriteria, CRITERIA } from './rating-criteria-panel';
import type { MediaQueueItem } from './rating-media-upload';
import RatingMediaUpload from './rating-media-upload';
import RatingStarInput from './rating-star-input';

interface RatingSheetProps {
  open: boolean;
  onClose: () => void;
  guideId: string;
  guideName: string;
}

export default function RatingSheet({ open, onClose, guideId, guideName }: RatingSheetProps) {
  const { t } = useTranslation('guidePage');
  const [rating, setRating] = useState<number | null>(null);
  const [comment, setComment] = useState('');
  const [criteria, setCriteria] = useState(buildDefaultCriteria);
  const [mediaItems, setMediaItems] = useState<MediaQueueItem[]>([]);
  const [submitting, setSubmitting] = useState(false);
  const [errors, setErrors] = useState<{ point?: string; comment?: string }>({});

  const queryClient = useQueryClient();
  const isUploading = mediaItems.some((it) => it.status === 'uploading');
  const isDisabled = submitting || isUploading;

  function handleCriteriaChange(key: string, value: number) {
    setCriteria((prev) => ({ ...prev, [key]: value }));
  }

  async function handleSubmit() {
    if (isDisabled) return;

    const result = tourGuideReviewSchema.safeParse({ point: rating ?? 0, comment });
    if (!result.success) {
      const { fieldErrors } = result.error.flatten();
      setErrors({
        point: fieldErrors.point?.[0],
        comment: fieldErrors.comment?.[0],
      });
      return;
    }
    setErrors({});
    setSubmitting(true);

    const payload = {
      comment,
      point: rating ?? 0,
      images: mediaItems.filter((it) => it.mediaType === 'image' && it.url).map((it) => it.url!),
      videos: mediaItems.filter((it) => it.mediaType === 'video' && it.url).map((it) => it.url!),
      tourGuideSubRatings: CRITERIA.map((c) => ({ key: c.key, name: c.name, value: criteria[c.key] })),
    };

    try {
      await request({ url: API_ROUTE.REVIEW_TOUR_GUIDE(guideId), method: 'POST', data: payload });
      await Promise.all([
        queryClient.invalidateQueries({ queryKey: ['/tour-guide/reviews'] }),
        queryClient.invalidateQueries({ queryKey: ['/tour-guide/reviews-infinite'] }),
        queryClient.invalidateQueries({ queryKey: ['/tour-guide/detail'] }),
      ]);
      useAlertStore.getState().addAlert({ type: 'success', title: t('ratingSheet.successAlert'), duration: 3000 });
      handleClose();
    } catch (err) {
      const apiError = err as { statusCode?: number };
      const isUnauthorized = apiError?.statusCode === 401;
      useAlertStore.getState().addAlert({
        type: 'error',
        title: isUnauthorized ? t('ratingSheet.errorUnauthorized') : t('ratingSheet.errorAlert'),
        duration: 3000,
      });
    } finally {
      setSubmitting(false);
    }
  }

  function handleClose() {
    onClose();
    setTimeout(() => {
      setRating(null);
      setComment('');
      setCriteria(buildDefaultCriteria());
      setMediaItems([]);
      setErrors({});
    }, 350);
  }

  return (
    <Sheet open={open} onOpenChange={(v) => !v && handleClose()}>
      <SheetContent
        side="bottom"
        className="rounded-t-2xl p-0 flex flex-col max-h-[800px]"
        style={{
          left: 'max(0px, calc(50% - 215px))',
          right: 'max(0px, calc(50% - 215px))',
        }}
      >
        {/* Drag handle — sits in the same top area as the default close button */}
        <div className="relative h-10 flex items-center justify-center shrink-0">
          <div className="w-10 h-1 rounded-full bg-slate-200" />
        </div>

        {/* Header */}
        <div className="px-5 pb-3 shrink-0">
          <SheetTitle className="text-[15px] font-semibold text-neutral-black leading-snug">
            {t('ratingSheet.title')}
          </SheetTitle>
          <p className="text-[12px] text-slate-400 mt-0.5">{t('ratingSheet.subtitle', { name: guideName })}</p>
        </div>

        {/* Scrollable form body */}
        <ScrollArea className="flex-1 px-5 pb-2">
          <div className="space-y-5">
            <div className="space-y-1">
              <RatingStarInput
                value={rating}
                onChange={(v) => {
                  setRating(v);
                  if (errors.point) setErrors((prev) => ({ ...prev, point: undefined }));
                }}
              />
              {errors.point && <p className="text-[11px] text-red-500">{errors.point}</p>}
            </div>

            <RatingCriteriaPanel values={criteria} onChange={handleCriteriaChange} />

            {/* Comment */}
            <div className="space-y-1.5">
              <p className="text-[13px] font-medium text-neutral-black">
                {t('ratingSheet.yourThoughts')} <span className="text-red-500">*</span>
              </p>
              <div className="relative">
                <TextArea
                  fullWidth
                  value={comment}
                  onChange={(e) => {
                    setComment(e.target.value.slice(0, 500));
                    if (errors.comment) setErrors((prev) => ({ ...prev, comment: undefined }));
                  }}
                  placeholder={t('ratingSheet.thoughtsPlaceholder')}
                  rows={4}
                  className={`resize-none text-[13px] pb-6 ${
                    errors.comment ? 'border-red-400 focus:border-red-400' : ''
                  }`}
                />
                <span className="absolute bottom-2 right-3 text-[10px] text-slate-400 pointer-events-none">
                  {comment.length} / 500
                </span>
              </div>
              {errors.comment && <p className="text-[11px] text-red-500">{errors.comment}</p>}
            </div>

            {/* Media upload */}
            <div className="space-y-1.5">
              <p className="text-[13px] font-medium text-neutral-black">
                {t('ratingSheet.media')}{' '}
                <span className="text-slate-400 font-normal text-[12px]">{t('ratingSheet.mediaOptional')}</span>
              </p>
              <RatingMediaUpload onChange={setMediaItems} />
            </div>
          </div>
        </ScrollArea>

        {/* Submit */}
        <div className="px-5 py-4 border-t border-slate-100 shrink-0">
          <motion.button
            type="button"
            whileTap={!isDisabled ? { scale: 0.97 } : undefined}
            onClick={handleSubmit}
            disabled={isDisabled}
            className="w-full py-3 rounded-xl bg-neutral-black text-white text-[14px] font-semibold disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {submitting ? t('ratingSheet.submitting') : t('ratingSheet.submit')}
          </motion.button>
        </div>
      </SheetContent>
    </Sheet>
  );
}
