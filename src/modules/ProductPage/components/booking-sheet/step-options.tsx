import { AnimatePresence, motion } from 'framer-motion';
import { Check } from 'lucide-react';
import { useTranslation } from 'next-i18next';

import { cn } from '@/lib/utils';
import { useBookingStore } from '@/stores/BookingStore';

export default function StepOptions() {
  const { t } = useTranslation('productPage');

  const departureTime = useBookingStore.use.departureTime();
  const setDepartureTime = useBookingStore.use.setDepartureTime();
  const pickupLocation = useBookingStore.use.pickupLocation();
  const setPickupLocation = useBookingStore.use.setPickupLocation();
  const packageType = useBookingStore.use.packageType();
  const setPackageType = useBookingStore.use.setPackageType();

  const DEPARTURE_SLOTS = [
    { id: '07:30', time: '07:30', label: t('booking.morningDeparture'), spots: 4 },
    { id: '13:00', time: '13:00', label: t('booking.afternoonDeparture'), spots: 2 },
  ];

  const PICKUP_POINTS = [
    { id: 'old-quarter', label: t('booking.locationOldQuarter'), popular: true },
    { id: 'hoan-kiem', label: t('booking.locationHoanKiem'), popular: false },
    { id: 'ba-dinh', label: t('booking.locationBaDinh'), popular: false },
  ];

  const PACKAGES = [
    {
      id: 'basic' as const,
      label: t('booking.packageBasic'),
      note: t('booking.packageIncluded'),
      surcharge: 0,
      features: [t('booking.featureSharedGuide'), t('booking.featureLunchIncluded'), t('booking.featureTransport')],
    },
    {
      id: 'premium' as const,
      label: t('booking.packagePremium'),
      note: '+$40/pp',
      surcharge: 40,
      features: [
        t('booking.featurePrivateGuide'),
        t('booking.featureAllMeals'),
        t('booking.featureTransport'),
        t('booking.featureHotelPickup'),
      ],
    },
  ];

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
        <div className="grid grid-cols-2 gap-3">
          {DEPARTURE_SLOTS.map((slot) => {
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
                  {slot.time}
                </p>
                <p className={cn('text-[12px] mt-1', active ? 'text-[#A8D8C9]' : 'text-[#666]')}>{slot.label}</p>
                <div className="flex items-center gap-1 mt-2">
                  <span className={cn('w-1.5 h-1.5 rounded-full', active ? 'bg-[#A8D8C9]' : 'bg-[#999]')} />
                  <p className={cn('text-[11px]', active ? 'text-[#A8D8C9]' : 'text-[#888]')}>
                    {t('booking.spotsLeft', { count: slot.spots })}
                  </p>
                </div>
              </motion.button>
            );
          })}
        </div>
      </div>

      {/* Pickup Location */}
      <div>
        <div className="flex items-center gap-1.5 mb-3">
          <span className="text-[14px]">📍</span>
          <span className="text-[11px] font-bold text-[#333] uppercase tracking-wider">
            {t('booking.pickupLocation')}
          </span>
        </div>
        <div className="bg-white border border-[#E5E5E5] rounded-[16px] overflow-hidden shadow-sm">
          {PICKUP_POINTS.map((point, i) => {
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
                    {point.label}
                  </span>
                  {point.popular && (
                    <span className="text-[12px] text-[#0F6E56] font-medium">{t('booking.mostPopular')}</span>
                  )}
                </div>
              </motion.button>
            );
          })}
        </div>
      </div>

      {/* Tour Package */}
      <div>
        <div className="flex items-center gap-1.5 mb-3">
          <span className="text-[14px]">🎒</span>
          <span className="text-[11px] font-bold text-[#333] uppercase tracking-wider">{t('booking.tourPackage')}</span>
        </div>
        <div className="grid grid-cols-2 gap-3">
          {PACKAGES.map((pkg) => {
            const active = packageType === pkg.id;
            return (
              <motion.button
                key={pkg.id}
                whileTap={{ scale: 0.98 }}
                onClick={() => setPackageType(pkg.id)}
                className={cn(
                  'rounded-[16px] border px-6 py-6 text-left transition-all w-full',
                  active ? 'border-[#0F6E56] bg-[#0F6E56] shadow-md' : 'border-[#E5E5E5] bg-white shadow-sm'
                )}
              >
                <p className={cn('text-[16px] font-bold', active ? 'text-white' : 'text-[#111]')}>{pkg.label}</p>
                <p className={cn('text-[12px] font-semibold mt-0.5', active ? 'text-[#A8D8C9]' : 'text-[#777]')}>
                  {pkg.note}
                </p>
                <div className="flex flex-col gap-1 mt-3">
                  {pkg.features.map((f) => (
                    <span
                      key={f}
                      className={cn(
                        'inline-flex items-center gap-1.5 text-[12px]',
                        active ? 'text-[#A8D8C9]' : 'text-[#333]'
                      )}
                    >
                      <Check size={11} strokeWidth={2.5} className={active ? 'text-[#A8D8C9]' : 'text-[#B2C5D4]'} />
                      {f}
                    </span>
                  ))}
                </div>
              </motion.button>
            );
          })}
        </div>
      </div>
    </div>
  );
}
