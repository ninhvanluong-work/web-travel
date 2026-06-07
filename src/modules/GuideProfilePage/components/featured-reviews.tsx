import type { ITourGuideReview } from '@/api/tour-guide/types';
import { Button } from '@/components/ui/button';

interface FeaturedReviewsProps {
  reviews: ITourGuideReview[];
  totalReviews: number;
}

export default function FeaturedReviews({ reviews, totalReviews }: FeaturedReviewsProps) {
  return (
    <div>
      {reviews.map((r, idx) => (
        <div
          key={r.id}
          className={`border-l-2 border-neutral-black pl-3.5 ${idx < reviews.length - 1 ? 'mb-5' : 'mb-4'}`}
        >
          <p className="text-[15px] leading-[1.65] text-neutral-900 mb-1.5" style={{ fontFamily: 'var(--font-serif)' }}>
            &ldquo;{r.content}&rdquo;
          </p>
          <p className="text-[12px] text-neutral-500">
            {r.authorName} · {r.date}
          </p>
        </div>
      ))}

      <Button variant="ghost" fullWidth blur={false} className="mt-1 text-[12px] text-neutral-500 py-[9px] rounded-md">
        Xem tất cả {totalReviews} đánh giá khách
      </Button>
    </div>
  );
}
