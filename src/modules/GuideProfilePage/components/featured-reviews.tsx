import { Button } from '@/components/ui/button';

import type { GuideProfileData } from '../data/mock-guide';

interface FeaturedReviewsProps {
  reviews: GuideProfileData['guestFeedback']['featuredReviews'];
  totalReviews: number;
}

export default function FeaturedReviews({ reviews, totalReviews }: FeaturedReviewsProps) {
  return (
    <div>
      {reviews.map((r) => (
        <div key={r.id} className="border-l-2 border-neutral-black pl-3.5 mb-4">
          <p className="text-[16px] leading-[1.6] text-neutral-900 mb-2.5" style={{ fontFamily: 'var(--font-serif)' }}>
            {r.content}
          </p>
          <p className="text-[12px] text-neutral-500">
            {r.author} · {r.country} · {r.tourName} {r.date}
          </p>
        </div>
      ))}

      <Button variant="ghost" fullWidth blur={false} className="mt-1 text-[12px] text-neutral-500 py-[9px] rounded-md">
        Xem tất cả {totalReviews} đánh giá khách
      </Button>
    </div>
  );
}
