import { Icons } from '@/assets/icons';

interface QuickFactsGridProps {
  duration: string;
  departurePoint: string;
  pickupTime: string;
  groupSize: string;
  languages: string[];
  difficulty: string;
}

function FactCell({ icon: Icon, label, value }: { icon: React.ElementType; label: string; value: string }) {
  return (
    <div className="flex items-center gap-[9px]">
      <Icon className="w-[15px] h-[15px] flex-shrink-0 opacity-65" />
      <div className="min-w-0">
        <p className="text-[10px] text-[#888884] leading-[1.2]">{label}</p>
        <p className="text-[13px] font-medium leading-[1.2] mt-[1px]">{value}</p>
      </div>
    </div>
  );
}

export default function QuickFactsGrid({
  duration,
  departurePoint,
  pickupTime,
  groupSize,
  languages,
  difficulty,
}: QuickFactsGridProps) {
  return (
    <div className="px-[18px] pb-[22px]">
      <div className="bg-[#F1EFE8] rounded-[14px] p-[14px_16px]">
        <div className="grid grid-cols-2 gap-x-[18px] gap-y-3">
          <FactCell icon={Icons.clock} label="Duration" value={duration} />
          <FactCell icon={Icons.location} label="Departs from" value={departurePoint} />
          <FactCell icon={Icons.personPickup} label="Pickup / dropoff" value={pickupTime} />
          <FactCell icon={Icons.groupPeople} label="Group size" value={groupSize} />
          <FactCell icon={Icons.globe} label="Languages" value={languages.join(' · ')} />
          <FactCell icon={Icons.mountain} label="Difficulty" value={difficulty} />
        </div>
      </div>
    </div>
  );
}
