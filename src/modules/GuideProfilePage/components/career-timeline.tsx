import { useTranslation } from 'next-i18next';

import type { GuideProfileData } from '../data/mock-guide';

interface CareerTimelineProps {
  timeline: GuideProfileData['careerTimeline'];
}

export default function CareerTimeline({ timeline }: CareerTimelineProps) {
  const { t } = useTranslation('guidePage');
  return (
    <div className="py-[22px] px-[18px] bg-white">
      <p className="text-[14px] font-medium text-neutral-900 mb-4">{t('careerJourney')}</p>

      <div className="relative pl-[18px]">
        <div className="absolute left-1 top-1.5 bottom-1.5 w-px bg-neutral-200" />

        {timeline.map((item) => (
          <div key={item.id} className="relative mb-[18px] last:mb-0">
            <div
              className={`absolute -left-[18px] top-1 w-[9px] h-[9px] rounded-full border ${
                item.isCurrent ? 'bg-neutral-black border-neutral-black' : 'bg-neutral-300 border-neutral-300'
              }`}
            />
            <p className="text-[13px] font-medium text-neutral-900 mb-0.5">{item.companyName}</p>
            <p className="text-[11px] text-neutral-500 mb-1">
              {item.role} · {item.period.replace(/nay/gi, t('editProfileSheet.present', { defaultValue: 'nay' }))}
            </p>
            <p className="text-[12px] text-neutral-500">{item.description}</p>
          </div>
        ))}
      </div>
    </div>
  );
}
