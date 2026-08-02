import { motion } from 'framer-motion';
import { useTranslation } from 'next-i18next';
import React from 'react';

import type {
  ApiProductBookingDepartureTime,
  ApiProductBookingOption,
  ApiProductBookingPickupLocation,
} from '@/api/product/booking-config-types';
import { cn } from '@/lib/utils';
import { useBookingStore } from '@/stores/BookingStore';

import PickupLocationSection from './pickup-location-section';

interface StepOptionsProps {
  departureTimes: ApiProductBookingDepartureTime[];
  pickupLocations: ApiProductBookingPickupLocation[];
  options: ApiProductBookingOption[];
  currency: string;
  isLoading?: boolean;
}

export default function StepOptions({
  departureTimes,
  pickupLocations,
  options,
  currency,
  isLoading,
}: StepOptionsProps) {
  const { t } = useTranslation('productPage');
  const departureTime = useBookingStore.use.departureTime();
  const setDepartureTime = useBookingStore.use.setDepartureTime();
  const packageType = useBookingStore.use.packageType();
  const setPackageType = useBookingStore.use.setPackageType();

  React.useEffect(() => {
    if (isLoading) return;
    const activeSlots = departureTimes.filter((slot) => slot.isActive);
    if (activeSlots.length === 1 && !departureTime) {
      setDepartureTime(activeSlots[0].id);
    }
  }, [departureTimes, departureTime, setDepartureTime, isLoading]);

  React.useEffect(() => {
    if (isLoading || options.length !== 1) return;
    if (!packageType) {
      setPackageType(options[0].id);
    }
  }, [options, packageType, setPackageType, isLoading]);

  if (isLoading) {
    return (
      <div className="flex flex-col items-center justify-center py-20 gap-3">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#0F6E56]" />
        <p className="text-[14px] text-[#888] font-medium">{t('booking.loadingOptions')}</p>
      </div>
    );
  }

  const activeSlots = departureTimes.filter((slot) => slot.isActive);

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
        {activeSlots.length === 0 ? (
          <p className="text-[13px] text-[#999]">{t('booking.noDepartureTimes')}</p>
        ) : (
          <div className="grid grid-cols-2 gap-3">
            {activeSlots.map((slot) => {
              const active = departureTime === slot.id;
              return (
                <motion.button
                  key={slot.id}
                  whileTap={{ scale: 0.98 }}
                  onClick={() => setDepartureTime(slot.id)}
                  className={cn(
                    'rounded-[16px] border px-6 py-[22px] text-left',
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
        )}
      </div>

      {/* Pickup Location */}
      <div>
        <div className="flex items-center gap-1.5 mb-3">
          <span className="text-[14px]">📍</span>
          <span className="text-[11px] font-bold text-[#333] uppercase tracking-wider">
            {t('booking.pickupLocation')}
          </span>
        </div>
        <PickupLocationSection pickupLocations={pickupLocations} currency={currency} />
      </div>

      {/* Tour Package — dynamic from API */}
      {options.length > 0 && (
        <div>
          <div className="flex items-center gap-1.5 mb-3">
            <span className="text-[14px]">🎒</span>
            <span className="text-[11px] font-bold text-[#333] uppercase tracking-wider">
              {t('booking.tourPackage')}
            </span>
          </div>
          <div className="grid grid-cols-2 gap-3">
            {options.map((opt) => {
              const active = packageType === opt.id;
              return (
                <motion.button
                  key={opt.id}
                  whileTap={{ scale: 0.98 }}
                  onClick={() => setPackageType(opt.id)}
                  className={cn(
                    'rounded-[16px] border px-6 py-6 text-left w-full flex flex-col h-full',
                    active ? 'border-[#0F6E56] bg-[#0F6E56] shadow-md' : 'border-[#E5E5E5] bg-white shadow-sm'
                  )}
                >
                  <p className={cn('text-[16px] font-bold', active ? 'text-white' : 'text-[#111]')}>{opt.title}</p>
                  <p className={cn('text-[12px] font-semibold mt-0.5', active ? 'text-[#A8D8C9]' : 'text-[#777]')}>
                    {t('booking.daysNights', { day: opt.day, night: opt.night })}
                  </p>
                  {opt.description && (
                    <p className={cn('text-[12px] mt-3 leading-relaxed', active ? 'text-[#A8D8C9]' : 'text-[#555]')}>
                      {opt.description}
                    </p>
                  )}
                </motion.button>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}
