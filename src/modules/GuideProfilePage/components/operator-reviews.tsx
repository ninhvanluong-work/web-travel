import { useTranslation } from 'next-i18next';

import type { GuideProfileData } from '../data/mock-guide';

interface OperatorReviewsProps {
  reviews: GuideProfileData['operatorReviews'];
}

export default function OperatorReviews({ reviews }: OperatorReviewsProps) {
  const { t } = useTranslation('guidePage');

  if (reviews.length === 0) {
    return (
      <div className="py-[22px] px-[18px] bg-neutral-100 border-b border-neutral-200">
        <p className="text-caption2 text-neutral-400 italic text-center">{t('operatorReviewsEmpty')}</p>
      </div>
    );
  }

  return (
    <div className="py-[22px] px-[18px] bg-neutral-100 border-b border-neutral-200">
      <div className="flex items-center gap-2 mb-3.5">
        <svg width="14" height="14" viewBox="0 0 16 16" fill="none">
          <path d="M8 1L10 5.5L15 6L11.5 9.5L12.5 14.5L8 12L3.5 14.5L4.5 9.5L1 6L6 5.5L8 1Z" fill="#F5A623" />
        </svg>
        <p className="text-[11px] text-neutral-500 uppercase font-medium" style={{ letterSpacing: '0.5px' }}>
          {t('operatorReviews')}
        </p>
      </div>

      <div className="flex flex-col gap-2">
        {reviews.map((r) => (
          <div key={r.id} className="bg-white border border-neutral-200 rounded-lg p-3.5">
            <div className="flex justify-between items-start mb-2.5">
              <div>
                <p className="text-[13px] font-medium text-neutral-900">{r.companyName}</p>
                <p className="text-[11px] text-neutral-500 mt-0.5">
                  {r.tourName} · {r.date}
                </p>
              </div>
              <span className="text-[13px] font-medium text-neutral-900">{r.rating.toFixed(1)}</span>
            </div>
            <p className="text-[13px] leading-[1.6] text-neutral-900" style={{ fontFamily: 'var(--font-serif)' }}>
              {r.comment}
            </p>
          </div>
        ))}
      </div>

      <p className="text-[11px] text-neutral-500 italic text-center mt-3">{t('operatorReviewsNote')}</p>
    </div>
  );
}
