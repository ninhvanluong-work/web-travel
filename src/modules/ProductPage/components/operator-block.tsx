import { Icons } from '@/assets/icons';
import { Button } from '@/components/ui/button';

interface OperatorBlockProps {
  initials: string;
  name: string;
  avatar?: string | null;
  rating: number;
  reviewCount: number;
  verified: boolean;
  yearsOnPlatform: number;
  toursOffered: number;
  responseRate: number;
}

export default function OperatorBlock({
  initials,
  name,
  avatar,
  rating,
  reviewCount,
  yearsOnPlatform,
  toursOffered,
  responseRate,
}: OperatorBlockProps) {
  return (
    <div className="px-[18px] pb-[22px]">
      <p className="text-[11px] uppercase tracking-wide text-[#888884] font-medium mb-3">Hosted by</p>
      <div className="border border-black/[0.08] rounded-[14px] overflow-hidden">
        {/* Header */}
        <div className="p-4 flex items-center gap-3">
          <div className="w-14 h-14 rounded-md bg-[#0F6E56] flex items-center justify-center text-white text-[15px] font-medium flex-shrink-0 tracking-[-0.3px] overflow-hidden">
            {avatar ? <img src={avatar} alt={name} className="w-full h-full object-cover" /> : initials}
          </div>
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-1.5 mb-0.5">
              <p className="text-[14px] font-medium">{name}</p>
              <Icons.star className="w-3 h-3 text-[#0F6E56]" />
            </div>
            <p className="text-[11px] text-[#888884]">
              <span className="font-medium text-[#1A1A18]">{rating}</span> · {reviewCount.toLocaleString()} reviews ·
              Verified operator
            </p>
          </div>
        </div>

        {/* Stats footer */}
        <div className="bg-[#F8F6F0] grid grid-cols-3 divide-x divide-black/[0.08] border-t border-black/[0.08]">
          <div className="py-3 px-2 text-center">
            <p className="text-[13px] font-medium">{yearsOnPlatform} yrs</p>
            <p className="text-[10px] text-[#888884] mt-0.5">on platform</p>
          </div>
          <div className="py-3 px-2 text-center">
            <p className="text-[13px] font-medium">{toursOffered}</p>
            <p className="text-[10px] text-[#888884] mt-0.5">tours offered</p>
          </div>
          <div className="py-3 px-2 text-center">
            <p className="text-[13px] font-medium">{responseRate}%</p>
            <p className="text-[10px] text-[#888884] mt-0.5">response rate</p>
          </div>
        </div>

        {/* View profile */}
        <Button
          variant="ghost"
          rounded="none"
          size="icon"
          blur={false}
          className="w-full py-3 text-center text-[13px] border-t border-black/[0.08] hover:bg-[#F8F6F0] h-auto font-normal active:scale-95"
        >
          View operator profile →
        </Button>
      </div>
    </div>
  );
}
