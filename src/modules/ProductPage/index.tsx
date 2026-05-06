import { Icons } from '@/assets/icons';

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
import { MOCK_PRODUCT } from './mock-data';

export default function ProductPage() {
  const p = MOCK_PRODUCT;

  return (
    <div className="flex flex-col h-full bg-white font-dinpro">
      <div className="flex-1 overflow-y-auto scrollbar-hide">
        <HeroCarousel media={p.media} />

        <ProductHeader
          tags={p.tags}
          name={p.name}
          shortDescription={p.shortDescription}
          rating={p.rating}
          reviewCount={p.reviewCount}
        />

        {p.freeCancellation && (
          <div className="px-[18px] pb-[22px]">
            <div className="flex items-center gap-3 p-[12px_14px] bg-[#E1F5EE] rounded-[14px]">
              <div className="w-8 h-8 rounded-full bg-[#0F6E56] flex items-center justify-center flex-shrink-0">
                <Icons.check className="w-[14px] h-[14px] text-white" />
              </div>
              <div>
                <p className="text-[13px] font-medium text-[#04342C]">
                  Free cancellation up to {p.cancellationDeadlineHours}h before
                </p>
                <p className="text-[11px] text-[#085041]">Full refund if your plans change</p>
              </div>
            </div>
          </div>
        )}

        <QuickFactsGrid {...p.quickFacts} />

        <ExperienceCards highlights={p.highlights} />

        <div className="px-[18px] pb-6 border-t border-black/[0.08] pt-6">
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
        </div>

        <OperatorBlock {...p.operator} />

        <GuideBlock {...p.guide} />

        <ItineraryAccordion steps={p.itinerary} />

        <BeforeYouBook items={p.beforeYouBook} />

        <IncludedSection included={p.included} notIncluded={p.notIncluded} />

        <ReviewsSection rating={p.rating} reviewCount={p.reviewCount} reviews={p.reviews} />

        <div className="h-4" />
      </div>

      <StickyCTABar
        originalPrice={p.originalPrice}
        salePrice={p.salePrice}
        discountPercent={p.discountPercent}
        currency={p.currency}
        priceUnit={p.priceUnit}
      />
    </div>
  );
}
