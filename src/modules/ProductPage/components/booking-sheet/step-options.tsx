import { Check } from 'lucide-react';

import { cn } from '@/lib/utils';
import { useBookingStore } from '@/stores/BookingStore';

const DEPARTURE_SLOTS = [
  { id: '07:30', time: '07:30', label: 'Morning departure', spots: 4 },
  { id: '13:00', time: '13:00', label: 'Afternoon departure', spots: 2 },
];

const PICKUP_POINTS = [
  { id: 'old-quarter', label: 'Hanoi Old Quarter', popular: true },
  { id: 'hoan-kiem', label: 'Hoan Kiem Lake', popular: false },
  { id: 'ba-dinh', label: 'Ba Dinh Square', popular: false },
];

const PACKAGES = [
  {
    id: 'basic' as const,
    label: 'Basic',
    note: 'Included',
    surcharge: 0,
    features: ['Shared guide', 'Lunch included', 'Transport'],
  },
  {
    id: 'premium' as const,
    label: 'Premium',
    note: '+$40/pp',
    surcharge: 40,
    features: ['Private guide', 'All meals', 'Transport', 'Hotel pickup'],
  },
];

export default function StepOptions() {
  const departureTime = useBookingStore.use.departureTime();
  const setDepartureTime = useBookingStore.use.setDepartureTime();
  const pickupLocation = useBookingStore.use.pickupLocation();
  const setPickupLocation = useBookingStore.use.setPickupLocation();
  const packageType = useBookingStore.use.packageType();
  const setPackageType = useBookingStore.use.setPackageType();

  return (
    <div className="flex flex-col gap-5 px-5 pt-5 pb-8">
      {/* Heading */}
      <div>
        <h2 className="text-[24px] font-bold text-[#111] tracking-tight">Customize your trip</h2>
        <p className="text-[14px] text-[#555] mt-1">Select departure, pickup, and package</p>
      </div>

      {/* Departure Time */}
      <div>
        <div className="flex items-center gap-1.5 mb-3">
          <span className="text-[14px]">⏰</span>
          <span className="text-[11px] font-bold text-[#333] uppercase tracking-wider">Departure Time</span>
        </div>
        <div className="grid grid-cols-2 gap-3">
          {DEPARTURE_SLOTS.map((slot) => {
            const active = departureTime === slot.id;
            return (
              <button
                key={slot.id}
                onClick={() => setDepartureTime(slot.id)}
                className={cn(
                  'rounded-[16px] border px-6 py-[22px] text-left transition-all',
                  active ? 'border-[#0F6E56] bg-[#0F6E56] shadow-md' : 'border-[#E5E5E5] bg-white shadow-sm'
                )}
              >
                <p
                  className={cn(
                    'text-[26px] font-bold leading-none tracking-tight',
                    active ? 'text-white' : 'text-[#111]'
                  )}
                >
                  {slot.time}
                </p>
                <p className={cn('text-[12px] mt-1', active ? 'text-[#A8D8C9]' : 'text-[#666]')}>{slot.label}</p>
                <div className="flex items-center gap-1 mt-2">
                  <span className={cn('w-1.5 h-1.5 rounded-full', active ? 'bg-[#A8D8C9]' : 'bg-[#999]')} />
                  <p className={cn('text-[11px]', active ? 'text-[#A8D8C9]' : 'text-[#888]')}>
                    {slot.spots} spots left
                  </p>
                </div>
              </button>
            );
          })}
        </div>
      </div>

      {/* Pickup Location */}
      <div>
        <div className="flex items-center gap-1.5 mb-3">
          <span className="text-[14px]">📍</span>
          <span className="text-[11px] font-bold text-[#333] uppercase tracking-wider">Pickup Location</span>
        </div>
        <div className="bg-white border border-[#E5E5E5] rounded-[16px] overflow-hidden shadow-sm">
          {PICKUP_POINTS.map((point, i) => {
            const active = pickupLocation === point.id;
            return (
              <button
                key={point.id}
                onClick={() => setPickupLocation(point.id)}
                className={cn(
                  'w-full flex items-center gap-4 px-6 py-5 text-left transition-colors bg-white',
                  i > 0 && 'border-t border-[#EBEBEB]'
                )}
              >
                {/* Radio circle */}
                <div
                  className={cn(
                    'w-6 h-6 rounded-full border-2 flex items-center justify-center flex-shrink-0',
                    active ? 'border-[#0F6E56]' : 'border-[#CCC]'
                  )}
                >
                  {active && <div className="w-3.5 h-3.5 rounded-full bg-[#0F6E56]" />}
                </div>

                {/* Label + Most popular stacked */}
                <div>
                  <span
                    className={cn(
                      'text-[14px] block leading-snug',
                      active ? 'font-bold text-[#0F6E56]' : 'font-medium text-[#222]'
                    )}
                  >
                    {point.label}
                  </span>
                  {point.popular && <span className="text-[12px] text-[#0F6E56] font-medium">Most popular</span>}
                </div>
              </button>
            );
          })}
        </div>
      </div>

      {/* Tour Package */}
      <div>
        <div className="flex items-center gap-1.5 mb-3">
          <span className="text-[14px]">🎒</span>
          <span className="text-[11px] font-bold text-[#333] uppercase tracking-wider">Tour Package</span>
        </div>
        <div className="grid grid-cols-2 gap-3">
          {PACKAGES.map((pkg) => {
            const active = packageType === pkg.id;
            return (
              <button
                key={pkg.id}
                onClick={() => setPackageType(pkg.id)}
                className={cn(
                  'rounded-[16px] border px-6 py-6 text-left transition-all w-full',
                  active ? 'border-[#0F6E56] bg-[#0F6E56] shadow-md' : 'border-[#E5E5E5] bg-white shadow-sm'
                )}
              >
                <p className={cn('text-[16px] font-bold', active ? 'text-white' : 'text-[#111]')}>{pkg.label}</p>
                <p className={cn('text-[12px] font-semibold mt-0.5', active ? 'text-[#A8D8C9]' : 'text-[#0F6E56]')}>
                  {pkg.note}
                </p>
                <div className="flex flex-col gap-1 mt-3">
                  {pkg.features.map((f) => (
                    <span
                      key={f}
                      className={cn(
                        'inline-flex items-center gap-1.5 text-[12px]',
                        active ? 'text-[#A8D8C9]' : 'text-[#555]'
                      )}
                    >
                      <Check size={11} strokeWidth={2.5} className={active ? 'text-[#A8D8C9]' : 'text-[#0F6E56]'} />
                      {f}
                    </span>
                  ))}
                </div>
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
}
