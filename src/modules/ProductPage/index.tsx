'use client';

import { motion } from 'framer-motion';
import { useRouter } from 'next/router';

import { useProductById, useProductReviews } from '@/api/product';
import { Icons } from '@/assets/icons';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';

import { mapApiToProductPage, TEMP_PRODUCT_ID } from './adapter';
import BeforeYouBook from './components/before-you-book';
import ExperienceCards from './components/experience-cards';
import GuideBlock from './components/guide-block';
import HeroCarousel from './components/hero-carousel';
import IncludedSection from './components/included-section';
import ItineraryAccordion from './components/itinerary-accordion';
import OperatorBlock from './components/operator-block';
import ProductHeader from './components/product-header';
import QuickFactsGrid from './components/quick-facts-grid';
import ReviewsSection from './components/reviews-section';
import StickyCTABar from './components/sticky-cta-bar';

function ProductPageSkeleton() {
  return (
    <div className="flex flex-col h-full bg-white">
      <Skeleton className="aspect-[16/10] w-full rounded-none" />
      <div className="px-[18px] pt-5 pb-4 space-y-3">
        <div className="flex gap-2">
          <Skeleton className="h-5 w-16 rounded-full" />
          <Skeleton className="h-5 w-20 rounded-full" />
        </div>
        <Skeleton className="h-6 w-3/4" />
        <Skeleton className="h-4 w-full" />
        <Skeleton className="h-4 w-5/6" />
      </div>
      <div className="px-[18px] pt-2 grid grid-cols-3 gap-3">
        {Array.from({ length: 6 }).map((_, i) => (
          <Skeleton key={i} className="h-16 rounded-xl" />
        ))}
      </div>
    </div>
  );
}

const fadeInUp = {
  initial: { opacity: 0, y: 20 },
  whileInView: { opacity: 1, y: 0 },
  viewport: { once: false, margin: '-40px' },
  transition: { duration: 0.5, ease: 'easeOut' },
};

export default function ProductPage() {
  const router = useRouter();
  const productId = (router.query.productId as string) ?? TEMP_PRODUCT_ID;

  const { data, isLoading, isError, refetch } = useProductById({ variables: { id: productId } });
  const { data: reviewData, isLoading: reviewsLoading } = useProductReviews({
    variables: { id: productId, pageSize: 2 },
    enabled: !!productId,
  });

  if (isLoading) return <ProductPageSkeleton />;

  if (isError || !data) {
    return (
      <div className="flex flex-col h-full items-center justify-center gap-4 px-6 bg-white">
        <div className="w-12 h-12 rounded-full bg-red-50 flex items-center justify-center">
          <Icons.close className="w-5 h-5 text-red-500" />
        </div>
        <div className="text-center">
          <p className="text-[15px] font-medium text-gray-800">Failed to load tour</p>
          <p className="text-[13px] text-gray-500 mt-1">Please try again</p>
        </div>
        <Button
          variant="ghost"
          rounded="full"
          blur={false}
          className="bg-[#0F6E56] text-white px-6 h-auto py-2.5 text-[14px]"
          onClick={() => refetch()}
        >
          Try again
        </Button>
      </div>
    );
  }

  const p = mapApiToProductPage(data);

  return (
    <div className="flex flex-col h-full bg-white font-dinpro">
      <div className="flex-1 overflow-y-auto scrollbar-hide">
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 0.6 }}>
          <HeroCarousel media={p.media} />
        </motion.div>

        <motion.div {...fadeInUp} transition={{ duration: 0.5, ease: 'easeOut', delay: 0.1 }}>
          <ProductHeader
            tags={p.tags}
            name={p.name}
            shortDescription={p.shortDescription}
            rating={p.rating}
            reviewCount={p.reviewCount}
          />
        </motion.div>

        {p.freeCancellation && (
          <motion.div {...fadeInUp} className="px-[18px] pb-[22px]">
            <div className="flex items-center gap-3 p-[12px_14px] bg-[#E1F5EE] rounded-[14px]">
              <div className="w-10 h-10 rounded-full bg-[#0F6E56] flex items-center justify-center flex-shrink-0">
                <Icons.check className="w-[18px] h-[18px] text-white" />
              </div>
              <div>
                <p className="text-[13px] font-medium text-[#04342C]">
                  Free cancellation up to {p.cancellationDeadlineHours}h before
                </p>
                <p className="text-[11px] text-[#085041]">Full refund if your plans change</p>
              </div>
            </div>
          </motion.div>
        )}

        <motion.div {...fadeInUp}>
          <QuickFactsGrid {...p.quickFacts} />
        </motion.div>

        {p.highlights && p.highlights.length > 0 && (
          <motion.div {...fadeInUp}>
            <ExperienceCards highlights={p.highlights} />
          </motion.div>
        )}

        {p.uniqueSellingPoint && (
          <motion.div {...fadeInUp} className="px-[18px] pb-6 border-t border-black/[0.08] pt-6">
            <div className="border border-[#0F6E56] rounded-[14px] p-4 flex gap-3 items-start">
              <Icons.star className="w-[14px] h-[14px] text-[#0F6E56] flex-shrink-0 mt-[2px]" />
              <div>
                <p className="text-[11px] uppercase tracking-wide text-[#0F6E56] font-medium mb-1">
                  What makes this different
                </p>
                <p
                  className="text-[15px] leading-[1.55]"
                  style={{ fontFamily: 'var(--font-serif)', fontStyle: 'italic' }}
                >
                  {p.uniqueSellingPoint}
                </p>
              </div>
            </div>
          </motion.div>
        )}

        <motion.div {...fadeInUp}>
          <OperatorBlock {...p.operator} />
        </motion.div>

        <motion.div {...fadeInUp}>
          <GuideBlock {...p.guide} />
        </motion.div>

        <motion.div {...fadeInUp}>
          <ItineraryAccordion steps={p.itinerary} />
        </motion.div>

        <motion.div {...fadeInUp}>
          <ReviewsSection
            rating={p.rating}
            reviewCount={p.reviewCount}
            reviews={reviewData?.items ?? []}
            isLoading={reviewsLoading}
          />
        </motion.div>

        <motion.div {...fadeInUp}>
          <IncludedSection included={p.included} notIncluded={p.notIncluded} />
        </motion.div>

        <motion.div {...fadeInUp}>
          <BeforeYouBook items={p.beforeYouBook} />
        </motion.div>

        <div className="h-4" />
      </div>

      <motion.div
        initial={{ y: 100 }}
        animate={{ y: 0 }}
        transition={{ type: 'spring', damping: 25, stiffness: 200, delay: 0.2 }}
      >
        <StickyCTABar
          originalPrice={p.originalPrice}
          salePrice={p.salePrice}
          discountPercent={p.discountPercent}
          currency={p.currency}
          priceUnit={p.priceUnit}
        />
      </motion.div>
    </div>
  );
}
