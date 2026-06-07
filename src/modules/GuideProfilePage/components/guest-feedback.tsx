import { useTourGuideReviews } from '@/api/tour-guide/queries';

import type { GuideProfileData } from '../data/mock-guide';
import CriteriaBar from './criteria-bar';
import FeaturedReviews from './featured-reviews';

interface GuestFeedbackProps {
  feedback: GuideProfileData['guestFeedback'];
  guideName: string;
  guideId: string;
}

export default function GuestFeedback({ feedback, guideName, guideId }: GuestFeedbackProps) {
  const { data: reviewData } = useTourGuideReviews({
    variables: { id: guideId, page: 1, pageSize: 10 },
    enabled: !!guideId,
  });

  return (
    <>
      <div className="py-[22px] px-[18px] bg-white border-b border-neutral-200">
        <p className="text-[14px] font-medium text-neutral-900 mb-1">Khách nói gì về {guideName}</p>
        <p className="text-[12px] text-neutral-500 mb-4">
          {feedback.totalReviews} đánh giá · trung bình {feedback.averageRating.toFixed(2)}
        </p>
        <div className="flex flex-col gap-[10px]">
          {feedback.criteria.map((c) => (
            <CriteriaBar key={c.label} label={c.label} score={c.score} />
          ))}
        </div>
      </div>

      <div className="py-[22px] px-[18px] bg-white border-b border-neutral-200">
        <FeaturedReviews
          reviews={reviewData?.items ?? []}
          totalReviews={reviewData?.pagination.total ?? feedback.totalReviews}
        />
      </div>
    </>
  );
}
