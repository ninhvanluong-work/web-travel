import { motion } from 'framer-motion';

import type { GuideProfileData } from '../data/mock-guide';

interface DestinationsChartProps {
  destinations: GuideProfileData['destinations'];
  guideName: string;
}

export default function DestinationsChart({ destinations, guideName }: DestinationsChartProps) {
  return (
    <div className="py-[22px] px-[18px] bg-white border-b border-neutral-200">
      <p className="text-[14px] font-medium text-neutral-900 mb-1">Những nơi {guideName} dẫn tour</p>
      <p className="text-[11px] text-neutral-500 mb-3.5">sắp xếp theo số tour đã dẫn</p>

      <div className="flex flex-col gap-3">
        {destinations.map((d) => (
          <div key={d.name}>
            <div className="flex justify-between items-baseline mb-1 text-[13px]">
              <span className="text-neutral-900">{d.name}</span>
              <span className="text-[12px] text-neutral-500">{d.toursCount} tours</span>
            </div>
            <div className="h-[2px] bg-neutral-200 rounded-full overflow-hidden">
              <motion.div
                className="h-full bg-neutral-black rounded-full"
                initial={{ width: 0 }}
                whileInView={{ width: `${d.percentage}%` }}
                viewport={{ once: true }}
                transition={{ duration: 0.6, ease: 'easeOut' }}
              />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
