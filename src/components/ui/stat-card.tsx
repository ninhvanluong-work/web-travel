import type { ElementType } from 'react';

interface StatCardProps {
  label: string;
  value: number;
  icon: ElementType;
  accentClass: string;
  lightBgClass: string;
  iconColorClass: string;
}

export function StatCard({ label, value, icon: Icon, accentClass, lightBgClass, iconColorClass }: StatCardProps) {
  return (
    <div className="relative overflow-hidden rounded-xl bg-white border border-gray-200 shadow-sm px-6 py-5 flex items-center justify-between">
      <div className={`absolute left-0 inset-y-0 w-1 rounded-l-xl ${accentClass}`} />
      <div>
        <p className="text-[11px] font-semibold uppercase tracking-widest text-gray-400">{label}</p>
        <p className="mt-1.5 text-4xl font-black tabular-nums text-gray-900 leading-none">{value}</p>
      </div>
      <div className={`w-11 h-11 rounded-xl flex items-center justify-center flex-shrink-0 ${lightBgClass}`}>
        <Icon size={20} className={iconColorClass} />
      </div>
    </div>
  );
}
