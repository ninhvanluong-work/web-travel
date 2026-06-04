import type { GuideProfileData } from '../data/mock-guide';

interface SpecialtyTagsProps {
  specialties: GuideProfileData['specialties'];
}

export default function SpecialtyTags({ specialties }: SpecialtyTagsProps) {
  return (
    <div className="py-[22px] px-[18px] bg-white border-b border-neutral-200">
      <p className="text-[14px] font-medium text-neutral-900 mb-3.5">Chuyên môn</p>
      <div className="flex gap-1.5 flex-wrap">
        {specialties.map((s) => (
          <span key={s.label} className={`text-[12px] px-[11px] py-1.5 rounded-full ${s.bg} ${s.text}`}>
            {s.label}
          </span>
        ))}
      </div>
    </div>
  );
}
