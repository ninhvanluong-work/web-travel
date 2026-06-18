import Image from 'next/image';

import type { ITourGuideMoment } from '@/api/tour-guide/types';

interface MomentCardProps {
  moment: ITourGuideMoment;
  onClick: (m: ITourGuideMoment) => void;
}

export function MomentCard({ moment, onClick }: MomentCardProps) {
  return (
    <button
      type="button"
      onClick={() => onClick(moment)}
      className="aspect-[9/14] rounded-lg relative overflow-hidden w-full bg-neutral-800 group"
    >
      {moment.thumbnail && (
        <Image
          src={moment.thumbnail}
          alt={moment.title}
          fill
          className="object-cover transition-transform duration-300 group-hover:scale-105"
          sizes="50vw"
        />
      )}
      <div className="absolute inset-0 bg-gradient-to-t from-black/55 to-transparent" />
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-9 h-9 rounded-full bg-white/[0.92] flex items-center justify-center transition-transform duration-200 group-hover:scale-110">
        <svg width="13" height="13" viewBox="0 0 12 12">
          <path d="M3 2L10 6L3 10Z" fill="black" />
        </svg>
      </div>
      <div className="absolute bottom-2 left-2.5 right-2.5">
        <p className="text-[12px] text-white mb-0.5 italic" style={{ fontFamily: 'var(--font-serif)' }}>
          {moment.title}
        </p>
        <p className="text-[10px] text-white/80">{moment.duration}</p>
      </div>
    </button>
  );
}
