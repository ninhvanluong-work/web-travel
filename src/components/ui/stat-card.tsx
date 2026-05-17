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
    <div className="relative overflow-hidden rounded-2xl bg-white border border-gray-200 shadow-theme-xs px-6 py-5 flex items-center justify-between dark:border-gray-800 dark:bg-white/[0.03]">
      <div className={`absolute left-0 inset-y-0 w-[3px] rounded-l-2xl ${accentClass}`} />
      <div>
        <p className="text-[10px] font-semibold uppercase tracking-widest text-gray-400 dark:text-gray-500">{label}</p>
        <p className="mt-1 text-2xl font-bold tabular-nums text-gray-900 dark:text-white leading-none">{value}</p>
      </div>
      <div className={`w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0 ${lightBgClass}`}>
        <Icon size={18} className={iconColorClass} />
      </div>
    </div>
  );
}
