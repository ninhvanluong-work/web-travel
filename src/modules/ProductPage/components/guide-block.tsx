import { useRouter } from 'next/router';

import { Button } from '@/components/ui/button';
import { ROUTE } from '@/types/routes';

interface GuideBlockProps {
  id?: string;
  initials: string;
  name: string;
  rating: number;
  yearsExperience: number;
  toursInArea: number;
  area: string;
}

export default function GuideBlock({
  id,
  initials,
  name,
  rating,
  yearsExperience,
  toursInArea,
  area,
}: GuideBlockProps) {
  const router = useRouter();
  return (
    <div className="px-[18px] pb-[22px]">
      <p className="text-[11px] uppercase tracking-wide text-[#888884] font-medium mb-3">Your guide</p>
      <div className="border border-black/[0.08] rounded-[14px] p-4 flex items-center gap-3">
        <div className="w-11 h-11 rounded-full bg-[#E1F5EE] flex items-center justify-center text-[#0F6E56] text-[15px] font-medium flex-shrink-0">
          {initials}
        </div>
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-1.5 mb-0.5">
            <p className="text-[14px] font-medium">{name}</p>
            <span className="text-[12px] text-[#888884]">· {rating} ★</span>
          </div>
          <p className="text-[12px] text-[#888884]">
            {yearsExperience} years experience · {toursInArea} tours in {area}
          </p>
        </div>
        <Button
          variant="ghost"
          size="icon"
          blur={false}
          className="ml-auto text-[12px] text-[#1A1A18] underline underline-offset-2 decoration-black/20 flex-shrink-0 hover:bg-transparent"
          onClick={() => id && router.push(ROUTE.GUIDE_PROFILE_PATH(id))}
          disabled={!id}
        >
          View profile →
        </Button>
      </div>
    </div>
  );
}
