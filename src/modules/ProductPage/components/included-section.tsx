import { Icons } from '@/assets/icons';

interface IncludedSectionProps {
  included: string[];
  notIncluded: string[];
}

export default function IncludedSection({ included, notIncluded }: IncludedSectionProps) {
  return (
    <div className="px-[18px] pb-[22px] border-t border-black/[0.08] pt-6">
      <p className="text-base font-medium mb-4">What&apos;s included</p>
      <div className="grid grid-cols-2 gap-3">
        {/* Included */}
        <div className="bg-[#F1EFE8] rounded-[14px] p-3">
          <div className="flex items-center gap-2 mb-3">
            <div className="w-[18px] h-[18px] rounded-full bg-[#0F6E56] flex items-center justify-center flex-shrink-0">
              <Icons.check className="w-[10px] h-[10px] text-white" />
            </div>
            <p className="text-[12px] font-medium">Included</p>
          </div>
          <ul className="space-y-1.5">
            {included.map((item) => (
              <li key={item} className="text-[13px] leading-snug">
                {item}
              </li>
            ))}
          </ul>
        </div>

        {/* Not included */}
        <div className="bg-[#F1EFE8] rounded-[14px] p-3">
          <div className="flex items-center gap-2 mb-3">
            <div className="w-[18px] h-[18px] rounded-full bg-white border border-black/[0.1] flex items-center justify-center flex-shrink-0">
              <Icons.x className="w-[8px] h-[8px] text-[#888884]" />
            </div>
            <p className="text-[12px] font-medium">Not included</p>
          </div>
          <ul className="space-y-1.5">
            {notIncluded.map((item) => (
              <li key={item} className="text-[13px] text-[#888884] leading-snug">
                {item}
              </li>
            ))}
          </ul>
        </div>
      </div>
    </div>
  );
}
