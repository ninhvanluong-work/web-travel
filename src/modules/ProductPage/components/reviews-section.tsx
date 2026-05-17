interface Review {
  quote: string;
  author: string;
  country: string;
  date: string;
}

interface ReviewsSectionProps {
  rating: number;
  reviewCount: number;
  reviews: Review[];
}

export default function ReviewsSection({ rating, reviewCount, reviews }: ReviewsSectionProps) {
  return (
    <div id="reviews" className="bg-[#F8F6F0] px-[18px] py-6 border-t border-black/[0.08]">
      <p className="text-[11px] uppercase tracking-wide text-[#888884] font-medium">What guests say</p>

      <div className="flex items-baseline gap-2 mt-1 mb-4">
        <span className="text-[32px] font-medium leading-none">{rating}</span>
        <span className="text-[13px] text-[#888884]">/ 5 · {reviewCount} reviews</span>
      </div>

      <div className="flex flex-col gap-3">
        {reviews.map((r, i) => (
          <div key={i} className="bg-white rounded-[14px] p-4">
            <p
              className="text-[14px] leading-[1.6] mb-2"
              style={{ fontFamily: 'var(--font-serif)', fontStyle: 'italic' }}
            >
              &ldquo;{r.quote}&rdquo;
            </p>
            <p className="text-[12px] text-[#888884]">
              {r.author} · {r.country} · {r.date}
            </p>
          </div>
        ))}
      </div>
    </div>
  );
}
