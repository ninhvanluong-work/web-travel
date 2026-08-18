import { Users } from 'lucide-react';

import type { IBookingPassengerItem } from '@/api/booking/types';
import { Tooltip } from '@/components/ui/tooltip';

function formatPrice(price: number): string {
  return new Intl.NumberFormat('vi-VN').format(price);
}

interface PassengerTooltipProps {
  passengers: IBookingPassengerItem[];
}

export function PassengerTooltip({ passengers }: PassengerTooltipProps) {
  const list = Array.isArray(passengers) ? passengers : [];
  const total = list.reduce((sum, p) => sum + (p?.count || 0), 0);

  const tooltipContent = (
    <div className="space-y-1 text-xs min-w-[160px]">
      {list.map((p) => (
        <div key={p.unitId || p.unitName} className="flex items-center justify-between gap-4">
          <span className="text-gray-300">{p.unitName}</span>
          <span className="text-white font-medium">
            {p.count} × {formatPrice(p.price)} VND
          </span>
        </div>
      ))}
    </div>
  );

  return (
    <Tooltip label={tooltipContent}>
      <span className="inline-flex items-center gap-1.5 text-sm text-gray-700 dark:text-gray-300 cursor-default">
        <Users size={13} className="text-gray-400" />
        {total}
      </span>
    </Tooltip>
  );
}
