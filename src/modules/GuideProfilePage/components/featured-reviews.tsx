'use client';

import Image from 'next/image';
import { useEffect, useRef, useState } from 'react';

import { useTourGuideReviewsInfinite } from '@/api/tour-guide/queries';
import type { ITourGuideReview } from '@/api/tour-guide/types';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent } from '@/components/ui/dialog';

interface FeaturedReviewsProps {
  reviews: ITourGuideReview[];
  totalReviews: number;
  guideId: string;
  guideName: string;
}

const MAX_VISIBLE = 4;

type MediaItem = { type: 'image' | 'video'; url: string };

function ReviewMediaGrid({ images, videos }: { images: string[]; videos: string[] }) {
  const [viewer, setViewer] = useState<MediaItem | null>(null);

  const allMedia: MediaItem[] = [
    ...images.map((url) => ({ type: 'image' as const, url })),
    ...videos.map((url) => ({ type: 'video' as const, url })),
  ];

  if (allMedia.length === 0) return null;

  const visible = allMedia.slice(0, MAX_VISIBLE);
  const overflow = allMedia.length - MAX_VISIBLE;

  return (
    <>
      <div className="grid grid-cols-4 gap-1.5 mt-2 mb-2">
        {visible.map((item, idx) => {
          const isOverflowCell = idx === MAX_VISIBLE - 1 && overflow > 0;
          return (
            <button
              key={idx}
              type="button"
              className="relative aspect-square rounded-lg overflow-hidden bg-neutral-100"
              onClick={() => setViewer(isOverflowCell ? null : item)}
            >
              {item.type === 'image' ? (
                <Image src={item.url} alt="" fill className="object-cover" sizes="25vw" />
              ) : (
                <div className="w-full h-full bg-neutral-800 flex items-center justify-center">
                  <div className="w-7 h-7 rounded-full bg-black/55 flex items-center justify-center">
                    <svg className="w-3.5 h-3.5 fill-white ml-0.5" viewBox="0 0 10 10">
                      <path d="M2 1.5l7 3.5-7 3.5V1.5z" />
                    </svg>
                  </div>
                </div>
              )}
              {isOverflowCell && (
                <div className="absolute inset-0 bg-black/55 flex items-center justify-center rounded-lg">
                  <span className="text-white text-[14px] font-semibold">+{overflow}</span>
                </div>
              )}
            </button>
          );
        })}
      </div>

      <Dialog open={!!viewer} onOpenChange={(open) => !open && setViewer(null)}>
        <DialogContent className="p-0 bg-black border-0 max-w-[400px] w-full overflow-hidden">
          {viewer?.type === 'image' && (
            // eslint-disable-next-line @next/next/no-img-element
            <img src={viewer.url} alt="" className="w-full h-auto max-h-[80vh] object-contain" />
          )}
          {viewer?.type === 'video' && (
            <iframe src={viewer.url} className="w-full aspect-video" allow="autoplay; fullscreen" allowFullScreen />
          )}
        </DialogContent>
      </Dialog>
    </>
  );
}

function ReviewCard({ review, className }: { review: ITourGuideReview; className?: string }) {
  return (
    <div className={`border-l-2 border-neutral-black pl-3.5 ${className ?? ''}`}>
      <p className="text-[15px] leading-[1.65] text-neutral-900 mb-1" style={{ fontFamily: 'var(--font-serif)' }}>
        &ldquo;{review.content}&rdquo;
      </p>
      <ReviewMediaGrid images={review.images} videos={review.videos} />
      <p className="text-[12px] text-neutral-500">
        {review.authorName} · {review.date}
      </p>
    </div>
  );
}

export default function FeaturedReviews({ reviews, totalReviews, guideId }: FeaturedReviewsProps) {
  const [expanded, setExpanded] = useState(false);
  const sentinelRef = useRef<HTMLDivElement>(null);
  const scrollContainerRef = useRef<HTMLDivElement>(null);

  const { data, fetchNextPage, hasNextPage, isFetchingNextPage } = useTourGuideReviewsInfinite({
    variables: { id: guideId, pageSize: 5 },
    enabled: expanded && !!guideId,
  });

  const expandedReviews = data?.pages.flatMap((p) => p.items) ?? [];

  useEffect(() => {
    if (!expanded) return undefined;
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
  }, [expanded, hasNextPage, isFetchingNextPage, fetchNextPage]);

  if (!expanded) {
    return (
      <div>
        {reviews.map((r, idx) => (
          <ReviewCard key={r.id} review={r} className={idx < reviews.length - 1 ? 'mb-5' : 'mb-4'} />
        ))}
        <Button
          variant="ghost"
          fullWidth
          blur={false}
          className="mt-1 text-[12px] text-neutral-500 py-[9px] rounded-md"
          onClick={() => setExpanded(true)}
        >
          Xem tất cả {totalReviews} đánh giá khách
        </Button>
      </div>
    );
  }

  return (
    <div ref={scrollContainerRef} className="max-h-[420px] overflow-y-auto pr-1">
      <div className="py-1">
        {expandedReviews.map((r, idx) => (
          <ReviewCard key={r.id} review={r} className={idx < expandedReviews.length - 1 ? 'mb-5' : 'mb-4'} />
        ))}
        <div ref={sentinelRef} className="h-2" />
        {isFetchingNextPage && <p className="text-center text-[12px] text-neutral-400 py-3">Đang tải thêm...</p>}
        <Button
          variant="ghost"
          fullWidth
          blur={false}
          className="mt-1 text-[12px] text-neutral-500 py-[9px] rounded-md"
          onClick={() => setExpanded(false)}
        >
          Thu gọn
        </Button>
      </div>
    </div>
  );
}
