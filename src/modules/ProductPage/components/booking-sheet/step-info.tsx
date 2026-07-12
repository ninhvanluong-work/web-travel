import { Minus, Plus } from 'lucide-react';

import { DatePicker } from '@/components/ui/date-picker';
import { cn } from '@/lib/utils';
import { useBookingStore } from '@/stores/BookingStore';

interface GuestCounterProps {
  value: number;
  min?: number;
  max?: number;
  onChange: (v: number) => void;
}

function GuestCounter({ value, min = 0, max = 20, onChange }: GuestCounterProps) {
  const isAtMin = value <= min;
  const isAtMax = value >= max;

  return (
    <div className="flex items-center gap-3">
      {/* Minus button */}
      <button
        onClick={() => onChange(Math.max(min, value - 1))}
        disabled={isAtMin}
        className={cn(
          'w-9 h-9 rounded-full border-2 flex items-center justify-center transition-all select-none',
          isAtMin ? 'border-[#DDD] text-[#CCC]' : 'border-[#0F6E56] text-[#0F6E56] active:scale-95'
        )}
      >
        <Minus size={16} strokeWidth={2.5} />
      </button>

      <span className="w-6 text-center text-[18px] font-bold tabular-nums text-[#111]">{value}</span>

      {/* Plus button */}
      <button
        onClick={() => onChange(Math.min(max, value + 1))}
        disabled={isAtMax}
        className={cn(
          'w-9 h-9 rounded-full flex items-center justify-center transition-all select-none',
          isAtMax ? 'bg-[#DDD] text-[#AAA]' : 'bg-[#0F6E56] text-white active:scale-95'
        )}
      >
        <Plus size={16} strokeWidth={2.5} />
      </button>
    </div>
  );
}

interface StepInfoProps {
  adultPrice: number;
  currency: string;
}

export default function StepInfo({ adultPrice, currency }: StepInfoProps) {
  const date = useBookingStore.use.date();
  const setDate = useBookingStore.use.setDate();
  const guests = useBookingStore.use.guests();
  const setGuests = useBookingStore.use.setGuests();

  const fmtPrice = (n: number) => {
    if (currency === '₫') return `₫${n.toLocaleString('vi-VN')}`;
    return `$${n.toLocaleString('en-US')}`;
  };

  return (
    <div className="flex flex-col gap-5 px-5 pt-5 pb-8">
      {/* Heading */}
      <div>
        <h2 className="text-[24px] font-bold text-[#111] tracking-tight leading-snug">{"Who's joining?"}</h2>
        <p className="text-[14px] text-[#666] mt-1">Set your travel date and group size</p>
      </div>

      {/* Travel Date card */}
      <div className="bg-white border border-[#E5E5E5] rounded-[16px] px-5 py-5 shadow-sm">
        <p className="text-[10px] font-bold text-[#0F6E56] uppercase tracking-widest mb-2.5">Travel Date</p>
        <DatePicker
          value={date ?? undefined}
          onChange={(d) => setDate(d ?? null)}
          disablePast
          placeholder="dd/mm/yyyy"
        />
      </div>

      {/* Adults card */}
      <div className="bg-white border border-[#E5E5E5] rounded-[16px] px-5 py-5 flex items-center justify-between shadow-sm">
        <div>
          <p className="text-[15px] font-bold text-[#111]">Adults</p>
          <p className="text-[13px] text-[#888] mt-0.5">Age 12+ &middot; {fmtPrice(adultPrice)} / person</p>
        </div>
        <GuestCounter value={guests.adults} min={0} onChange={(v) => setGuests({ ...guests, adults: v })} />
      </div>

      {/* Children card */}
      <div className="bg-white border border-[#E5E5E5] rounded-[16px] px-5 py-5 flex items-center justify-between shadow-sm">
        <div>
          <p className="text-[15px] font-bold text-[#111]">Children</p>
          <p className="text-[13px] text-[#888] mt-0.5">Age 2–11 &middot; 50% discount</p>
        </div>
        <GuestCounter value={guests.children} min={0} onChange={(v) => setGuests({ ...guests, children: v })} />
      </div>

      {/* Infant notice — green, matches design */}
      <div className="bg-[#EAF7F1] rounded-[14px] px-5 py-4 flex items-center gap-3">
        <span className="text-[18px] leading-none flex-shrink-0">&#x1F476;</span>
        <p className="text-[13px] font-medium text-[#0F6E56] leading-snug">
          Children under 2 travel free — no reservation needed
        </p>
      </div>
    </div>
  );
}
