import { AnimatePresence, motion } from 'framer-motion';
import { useTranslation } from 'next-i18next';

import type { ApiProductBookingPickupLocation as ApiPickupLocation } from '@/api/product/booking-config-types';
import { cn } from '@/lib/utils';
import { useBookingStore } from '@/stores/BookingStore';

import CustomPickupForm from './custom-pickup-form';

interface PickupLocationSectionProps {
  pickupLocations: ApiPickupLocation[];
  currency: string;
}

export default function PickupLocationSection({ pickupLocations, currency }: PickupLocationSectionProps) {
  const { t } = useTranslation('productPage');
  const pickupLocation = useBookingStore.use.pickupLocation();
  const setPickupLocation = useBookingStore.use.setPickupLocation();
  const pickupType = useBookingStore.use.pickupType();
  const setPickupType = useBookingStore.use.setPickupType();

  if (pickupLocations.length === 0 && pickupType === 'predefined') {
    return <p className="text-[13px] text-[#999]">{t('booking.noPickupLocations')}</p>;
  }

  return (
    <div className="flex flex-col gap-3">
      {/* Tab toggle */}
      <div className="grid grid-cols-2 gap-2 bg-[#F0F2F5] p-1 rounded-[12px]">
        <button
          onClick={() => setPickupType('predefined')}
          className={cn(
            'py-2.5 text-[13px] font-semibold rounded-[9px] transition-all',
            pickupType === 'predefined' ? 'bg-white text-[#0F6E56] shadow-sm' : 'text-[#666]'
          )}
        >
          {t('booking.pickupTabPredefined')}
        </button>
        <button
          onClick={() => setPickupType('custom')}
          className={cn(
            'py-2.5 text-[13px] font-semibold rounded-[9px] transition-all',
            pickupType === 'custom' ? 'bg-white text-[#0F6E56] shadow-sm' : 'text-[#666]'
          )}
        >
          {t('booking.pickupTabCustom')}
        </button>
      </div>

      {pickupType === 'predefined' ? (
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
      ) : (
        <CustomPickupForm pickupLocations={pickupLocations} currency={currency} />
      )}
    </div>
  );
}
