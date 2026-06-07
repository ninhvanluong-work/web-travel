import { Button } from '@/components/ui/button';

import type { GuideProfileData } from '../data/mock-guide';

interface StatsBlockProps {
  metrics: GuideProfileData['metrics'];
}

export default function StatsBlock({ metrics }: StatsBlockProps) {
  return (
    <div className="py-[22px] px-[18px] bg-white border-b border-neutral-200">
      <div className="grid grid-cols-3 text-center">
        <div>
          <p className="text-[26px] font-medium text-neutral-black leading-none tracking-[-0.5px]">
            {metrics.toursLed}
          </p>
          <p className="text-caption2 text-neutral-500 mt-1.5">tour đã dẫn</p>
        </div>

        <div className="border-x border-neutral-200">
          <p className="text-[26px] font-medium text-neutral-black leading-none tracking-[-0.5px]">
            {metrics.yearsOfExperience}
            <span className="text-[14px] text-neutral-500 font-normal"> năm</span>
          </p>
          <p className="text-caption2 text-neutral-500 mt-1.5">trong nghề</p>
        </div>

        <div>
          <p className="text-[26px] font-medium text-neutral-black leading-none tracking-[-0.5px]">
            {metrics.languages.length}
            <span className="text-[14px] text-neutral-500 font-normal"> ngôn ngữ</span>
          </p>
          <p className="text-caption2 text-neutral-500 mt-1.5">{metrics.languages.join(' · ')}</p>
        </div>
      </div>

      <Button
        variant="ghost"
        fullWidth
        blur={false}
        className="mt-4 text-[11px] text-neutral-500 py-2 gap-1 rounded-md"
      >
        <svg width="11" height="11" viewBox="0 0 16 16" fill="none" className="inline-block">
          <path
            d="M3 4H13M3 4V12C3 12.5523 3.44772 13 4 13H12C12.5523 13 13 12.5523 13 12V4M3 4L4 2H12L13 4M6 7V11M10 7V11"
            stroke="currentColor"
            strokeWidth="1.3"
            strokeLinecap="round"
          />
        </svg>
        Xem lệnh điều tour cho từng booking
      </Button>
    </div>
  );
}
