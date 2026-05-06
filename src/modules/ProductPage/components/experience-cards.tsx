import { Icons } from '@/assets/icons';

interface Highlight {
  icon: keyof typeof Icons;
  title: string;
  subtitle: string;
}

interface ExperienceCardsProps {
  highlights: Highlight[];
}

export default function ExperienceCards({ highlights }: ExperienceCardsProps) {
  return (
    <div className="bg-[#F8F6F0] px-[18px] py-5">
      <p className="text-[11px] uppercase tracking-wide text-[#888884] font-medium mb-3 letter-spacing-[0.5px]">
        What you&apos;ll experience
      </p>
      <div className="grid grid-cols-2 gap-2.5">
        {highlights.map((h, i) => {
          const Icon = Icons[h.icon] as React.ElementType;
          return (
            <div key={i} className="bg-white rounded-[14px] p-4 aspect-square flex flex-col justify-between">
              <div className="w-[52px] h-[52px] rounded-full bg-[#E1F5EE] flex items-center justify-center flex-shrink-0 mb-2">
                <Icon className="w-[28px] h-[28px]" style={{ color: '#0F6E56' }} />
              </div>
              <div>
                <p className="text-[14px] font-medium leading-snug">{h.title}</p>
                <p className="text-[12px] text-[#888884] leading-snug mt-0.5">{h.subtitle}</p>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
