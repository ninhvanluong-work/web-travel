import { useTranslation } from 'next-i18next';

import type { IProductReview } from '@/api/product';
import { Skeleton } from '@/components/ui/skeleton';

interface ReviewsSectionProps {
  rating: number;
  reviewCount: number;
  reviews: IProductReview[];
  isLoading?: boolean;
}

export default function ReviewsSection({ rating, reviewCount, reviews, isLoading }: ReviewsSectionProps) {
  const { t } = useTranslation('productPage');

  return (
    <div id="reviews" className="bg-[#F8F6F0] px-[18px] py-6 border-t border-black/[0.08]">
      <p className="text-[11px] uppercase tracking-wide text-[#888884] font-medium">{t('whatGuestsSay')}</p>

      <div className="flex items-baseline gap-2 mt-1 mb-4">
        <span className="text-[32px] font-medium leading-none">{rating}</span>
        <span className="text-[13px] text-[#888884]">/ 5 · {t('reviewsCount', { count: reviewCount })}</span>
      </div>

      <div className="flex flex-col gap-3">
        {isLoading && (
          <>
            <Skeleton className="h-24 rounded-[14px]" />
            <Skeleton className="h-24 rounded-[14px]" />
          </>
        )}

        {!isLoading &&
          reviews.map((r) => (
            <div key={r.id} className="bg-white rounded-[14px] p-4">
              <p
                className="text-[14px] leading-[1.6] mb-2"
                style={{ fontFamily: 'var(--font-serif)', fontStyle: 'italic' }}
              >
                &ldquo;{r.comment}&rdquo;
              </p>
              <div className="flex items-center gap-1.5 mt-2">
                {r.name && <span className="text-[12px] text-[#888884]">{r.name}</span>}
                {r.name && <span className="text-[12px] text-[#888884]">·</span>}
                <span className="text-[12px] text-[#888884]">{r.date}</span>
              </div>
            </div>
          ))}

        {!isLoading && reviews.length === 0 && (
          <p className="text-[13px] text-[#888884] text-center py-4">{t('noReviewsYet')}</p>
        )}
      </div>
    </div>
  );
}
