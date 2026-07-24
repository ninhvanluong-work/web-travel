import { AnimatePresence, motion } from 'framer-motion';
import { useTranslation } from 'next-i18next';

import type { ApiDepartureTime, ApiPickupLocation } from '@/api/option/types';
import { cn } from '@/lib/utils';
import { useBookingStore } from '@/stores/BookingStore';

interface StepOptionsProps {
  departureTimes: ApiDepartureTime[];
  pickupLocations: ApiPickupLocation[];
  isLoading?: boolean;
}

function OptionSkeleton() {
  return (
    <div className="grid grid-cols-2 gap-3 animate-pulse">
      <div className="rounded-[16px] border border-[#E5E5E5] bg-[#F5F5F5] h-[100px]" />
      <div className="rounded-[16px] border border-[#E5E5E5] bg-[#F5F5F5] h-[100px]" />
    </div>
  );
}

export default function StepOptions({ departureTimes, pickupLocations, isLoading }: StepOptionsProps) {
  const { t } = useTranslation('productPage');

  if (isLoading) {
    return (
      <div className="flex flex-col items-center justify-center py-20 gap-3">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#0F6E56]" />
        <p className="text-[14px] text-[#888] font-medium">Loading options...</p>
      </div>
    );
  }

  const departureTime = useBookingStore.use.departureTime();
  const setDepartureTime = useBookingStore.use.setDepartureTime();
  const pickupLocation = useBookingStore.use.pickupLocation();
  const setPickupLocation = useBookingStore.use.setPickupLocation();

  const activeSlots = departureTimes.filter((slot) => slot.isActive);

  const renderDepartureTimes = () => {
    if (isLoading) {
      return <OptionSkeleton />;
    }
    if (activeSlots.length === 0) {
      return <p className="text-[13px] text-[#999]">{t('booking.noDepartureTimes')}</p>;
    }
    return (
      <div className="grid grid-cols-2 gap-3">
        {activeSlots.map((slot) => {
          const active = departureTime === slot.id;
          return (
            <motion.button
              key={slot.id}
              whileTap={{ scale: 0.98 }}
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
                {slot.time.slice(0, 5)}
              </p>
              <p className={cn('text-[12px] mt-1', active ? 'text-[#A8D8C9]' : 'text-[#666]')}>{slot.label}</p>
              {slot.note && (
                <p className={cn('text-[11px] mt-1', active ? 'text-[#A8D8C9]' : 'text-[#999]')}>{slot.note}</p>
              )}
            </motion.button>
          );
        })}
      </div>
    );
  };

  const renderPickupLocations = () => {
    if (isLoading) {
      return <div className="bg-[#F5F5F5] border border-[#E5E5E5] rounded-[16px] h-[120px] animate-pulse" />;
    }
    if (pickupLocations.length === 0) {
      return <p className="text-[13px] text-[#999]">{t('booking.noPickupLocations')}</p>;
    }
    return (
      <div className="bg-white border border-[#E5E5E5] rounded-[16px] overflow-hidden shadow-sm">
        {pickupLocations.map((point, i) => {
          const active = pickupLocation === point.id;
          return (
            <motion.button
              key={point.id}
              whileTap={{ scale: 0.99 }}
              onClick={() => setPickupLocation(point.id)}
              className={cn(
                'w-full flex items-center gap-4 px-6 py-5 text-left transition-colors bg-white',
                i > 0 && 'border-t border-[#EBEBEB]'
              )}
            >
              <div
                className={cn(
                  'w-6 h-6 rounded-full border-2 flex items-center justify-center flex-shrink-0 transition-colors',
                  active ? 'border-[#0F6E56]' : 'border-[#CCC]'
                )}
              >
                <AnimatePresence>
                  {active && (
                    <motion.div
                      initial={{ scale: 0 }}
                      animate={{ scale: 1 }}
                      exit={{ scale: 0 }}
                      transition={{ type: 'spring', stiffness: 400, damping: 20 }}
                      className="w-3.5 h-3.5 rounded-full bg-[#0F6E56]"
                    />
                  )}
                </AnimatePresence>
              </div>

              <div>
                <span
                  className={cn(
                    'text-[14px] block leading-snug',
                    active ? 'font-bold text-[#0F6E56]' : 'font-medium text-[#222]'
                  )}
                >
                  {point.name}
                </span>
                {point.isPopular && (
                  <span className="text-[12px] text-[#0F6E56] font-medium">{t('booking.mostPopular')}</span>
                )}
              </div>
            </motion.button>
          );
        })}
      </div>
    );
  };

  return (
    <div className="flex flex-col gap-5 px-5 pt-5 pb-8">
      <div>
        <h2 className="text-[24px] font-bold text-[#111] tracking-tight">{t('booking.customizeYourTrip')}</h2>
        <p className="text-[14px] text-[#555] mt-1">{t('booking.selectDeparturePickupPackage')}</p>
      </div>

      {/* Departure Time */}
      <div>
        <div className="flex items-center gap-1.5 mb-3">
          <span className="text-[14px]">⏰</span>
          <span className="text-[11px] font-bold text-[#333] uppercase tracking-wider">
            {t('booking.departureTime')}
          </span>
        </div>
        {renderDepartureTimes()}
      </div>

      {/* Pickup Location */}
      <div>
        <div className="flex items-center gap-1.5 mb-3">
          <span className="text-[14px]">📍</span>
          <span className="text-[11px] font-bold text-[#333] uppercase tracking-wider">
            {t('booking.pickupLocation')}
          </span>
        </div>
        {renderPickupLocations()}
      </div>
    </div>
  );
}
