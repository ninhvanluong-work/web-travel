import { useRouter } from 'next/router';

import { Button } from '@/components/ui/button';

import type { GuideProfileData } from '../data/mock-guide';

interface MomentsGridProps {
  moments: GuideProfileData['moments'];
}

export default function MomentsGrid({ moments }: MomentsGridProps) {
  const router = useRouter();

  if (moments.length === 0) {
    return (
      <div className="py-[22px] px-[18px] bg-white border-b border-neutral-200">
        <p className="text-[14px] font-medium text-neutral-900 mb-2">Khoảnh khắc từ tour</p>
        <p className="text-caption2 text-neutral-400 italic text-center py-6">Chưa có khoảnh khắc nào được đăng tải</p>
      </div>
    );
  }

  const displayed = moments.slice(0, 4);

  return (
    <div className="py-[22px] px-[18px] bg-white border-b border-neutral-200">
      <div className="flex justify-between items-baseline mb-3">
        <p className="text-[14px] font-medium text-neutral-900">Khoảnh khắc từ tour</p>
        <span className="text-[12px] text-neutral-500">{moments.length} clips</span>
      </div>

      <div className="grid grid-cols-2 gap-2">
        {displayed.map((m) => (
          <button
            key={m.id}
            type="button"
            onClick={() => router.push(`/video/${m.videoId}`)}
            className="aspect-[9/14] rounded-lg relative overflow-hidden w-full"
            style={{ background: m.placeholderGradient }}
          >
            <div className="absolute inset-0 bg-gradient-to-t from-black/55 to-transparent" />

            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-9 h-9 rounded-full bg-white/[0.92] flex items-center justify-center">
              <svg width="13" height="13" viewBox="0 0 12 12">
                <path d="M3 2L10 6L3 10Z" fill="black" />
              </svg>
            </div>

            <div className="absolute bottom-2 left-2.5 right-2.5">
              <p
                className="text-[12px] text-white mb-0.5"
                style={{ fontFamily: 'var(--font-serif)', fontStyle: 'italic' }}
              >
                {m.title}
              </p>
              <p className="text-[10px] text-white/80">
                {m.location} · {m.duration}
              </p>
            </div>
          </button>
        ))}
      </div>

      <Button variant="ghost" fullWidth blur={false} className="mt-3 text-[12px] text-neutral-500 py-[9px] rounded-md">
        Xem tất cả khoảnh khắc
      </Button>
    </div>
  );
}
