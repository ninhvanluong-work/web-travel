import type { MotionValue } from 'framer-motion';
import { motion, useScroll, useTransform } from 'framer-motion';
import { useTranslation } from 'next-i18next';
import { useRef } from 'react';

import type { GuideProfileData } from '../data/mock-guide';

interface CareerTimelineProps {
  timeline: GuideProfileData['careerTimeline'];
}

type TimelineEntry = GuideProfileData['careerTimeline'][number];

function TimelineItem({
  item,
  threshold,
  scrollYProgress,
  presentLabel,
}: {
  item: TimelineEntry;
  threshold: number;
  scrollYProgress: MotionValue<number>;
  presentLabel: string;
}) {
  const dotColor = useTransform(scrollYProgress, (v) => (v >= threshold ? 'rgb(15 15 15)' : 'rgb(212 212 212)'));

  return (
    <motion.div
      variants={{
        hidden: { opacity: 0, y: 12 },
        visible: { opacity: 1, y: 0, transition: { duration: 0.3, ease: 'easeOut' } },
      }}
      className="relative mb-[18px] last:mb-0"
    >
      <motion.div
        className="absolute -left-[18px] top-1 w-[9px] h-[9px] rounded-full border"
        style={{ backgroundColor: dotColor, borderColor: dotColor }}
      />
      <p className="text-[13px] font-medium text-neutral-900 mb-0.5">{item.companyName}</p>
      <p className="text-[11px] text-neutral-500 mb-1">
        {item.role} · {item.period.replace(/nay/gi, presentLabel)}
      </p>
      <p className="text-[12px] text-neutral-500">{item.description}</p>
    </motion.div>
  );
}

export default function CareerTimeline({ timeline }: CareerTimelineProps) {
  const { t } = useTranslation('guidePage');
  const containerRef = useRef<HTMLDivElement>(null);

  const { scrollYProgress } = useScroll({
    target: containerRef,
    offset: ['start 0.85', 'end 0.5'],
  });

  const lineHeight = useTransform(scrollYProgress, [0, 1], ['0%', '100%']);
  const presentLabel = t('editProfileSheet.present', { defaultValue: 'nay' });

  return (
    <div className="py-[22px] px-[18px] bg-white">
      <p className="text-[14px] font-medium text-neutral-900 mb-4">{t('careerJourney')}</p>

      <motion.div
        ref={containerRef}
        className="relative pl-[18px]"
        variants={{ hidden: {}, visible: { transition: { staggerChildren: 0.05 } } }}
        initial="hidden"
        whileInView="visible"
        viewport={{ once: true, amount: 0.1 }}
      >
        {/* base track */}
        <div className="absolute left-1 top-1.5 bottom-1.5 w-px bg-neutral-200" />

        {/* highlight line grows as user scrolls */}
        <motion.div
          className="absolute left-1 top-1.5 w-px bg-neutral-black origin-top"
          style={{ height: lineHeight }}
        />

        {timeline.map((item, index) => (
          <TimelineItem
            key={item.id}
            item={item}
            threshold={index / Math.max(timeline.length - 1, 1)}
            scrollYProgress={scrollYProgress}
            presentLabel={presentLabel}
          />
        ))}
      </motion.div>
    </div>
  );
}
