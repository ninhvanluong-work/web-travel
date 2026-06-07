import { motion } from 'framer-motion';
import { useRouter } from 'next/router';

import { useGuideProfile } from '@/hooks/use-guide-profile';

import ActionBar from './components/action-bar';
import CareerTimeline from './components/career-timeline';
import DestinationsChart from './components/destinations-chart';
import GuestFeedback from './components/guest-feedback';
import GuideProfileSkeleton from './components/guide-profile-skeleton';
import HeroBanner from './components/hero-banner';
import MomentsGrid from './components/moments-grid';
import OperatorReviews from './components/operator-reviews';
import SpecialtyTags from './components/specialty-tags';
import StatsBlock from './components/stats-block';
import StorytellingBlock from './components/storytelling-block';

const fadeUp = (delay: number) => ({
  initial: { opacity: 0, y: 16 },
  animate: { opacity: 1, y: 0 },
  transition: { duration: 0.4, ease: 'easeOut', delay },
});

export default function GuideProfilePage() {
  const router = useRouter();
  const id = router.query.id as string | undefined;

  const { data, isLoading } = useGuideProfile(id);

  if (isLoading) return <GuideProfileSkeleton />;
  if (!data) return null;

  return (
    <div className="bg-[#F3F3F7] h-full overflow-y-auto scrollbar-hide font-dinpro">
      <motion.div {...fadeUp(0)}>
        <HeroBanner guide={data} />
      </motion.div>
      <motion.div {...fadeUp(0.08)}>
        <ActionBar guide={data} />
      </motion.div>
      <motion.div {...fadeUp(0.16)}>
        <StorytellingBlock bio={data.bio} />
      </motion.div>
      <motion.div {...fadeUp(0.24)}>
        <StatsBlock metrics={data.metrics} />
      </motion.div>

      <OperatorReviews reviews={data.operatorReviews} />
      <GuestFeedback feedback={data.guestFeedback} guideName={data.name.split(' ').pop()!} guideId={data.id} />
      <SpecialtyTags specialties={data.specialties} />
      <MomentsGrid moments={data.moments} />
      <DestinationsChart destinations={data.destinations} guideName={data.name.split(' ').pop()!} />
      <CareerTimeline timeline={data.careerTimeline} />
      <div className="h-8" />
    </div>
  );
}
