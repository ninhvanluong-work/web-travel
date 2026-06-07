import type { GuideProfileData } from '../data/mock-guide';
import CriteriaBar from './criteria-bar';
import FeaturedReviews from './featured-reviews';

interface GuestFeedbackProps {
  feedback: GuideProfileData['guestFeedback'];
  guideName: string;
}

export default function GuestFeedback({ feedback, guideName }: GuestFeedbackProps) {
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
        <FeaturedReviews reviews={feedback.featuredReviews} totalReviews={feedback.totalReviews} />
      </div>
    </>
  );
}
