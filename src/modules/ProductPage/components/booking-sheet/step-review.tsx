import { format } from 'date-fns';
import { AnimatePresence, motion } from 'framer-motion';
import { ShieldCheck } from 'lucide-react';
import { useTranslation } from 'next-i18next';

import type {
  ApiProductBookingDepartureTime as ApiDepartureTime,
  ApiProductBookingOption,
  ApiProductBookingPickupLocation as ApiPickupLocation,
} from '@/api/product/booking-config-types';
import { cn } from '@/lib/utils';
import { useBookingStore } from '@/stores/BookingStore';

import { DetailRow } from './detail-row';

interface StepReviewProps {
  productName: string;
  adultPrice: number;
  currency: string;
  departureTimes: ApiDepartureTime[];
  pickupLocations: ApiPickupLocation[];
  options: ApiProductBookingOption[];
}

export default function StepReview({
  productName,
  adultPrice: _adultPrice,
  currency,
  departureTimes,
  pickupLocations,
  options,
}: StepReviewProps) {
  const { t } = useTranslation('productPage');

  const date = useBookingStore.use.date();
  const passengers = useBookingStore.use.passengers();
  const departureTime = useBookingStore.use.departureTime();
  const pickupLocation = useBookingStore.use.pickupLocation();
  const pickupType = useBookingStore.use.pickupType();
  const customPickup = useBookingStore.use.customPickup();
  const packageType = useBookingStore.use.packageType();
  const agreedToTerms = useBookingStore.use.agreedToTerms();
  const setAgreedToTerms = useBookingStore.use.setAgreedToTerms();
  const sessionPricing = useBookingStore.use.sessionPricing();
  const contactName = useBookingStore.use.contactName();
  const contactPhone = useBookingStore.use.contactPhone();
  const contactEmail = useBookingStore.use.contactEmail();
  const contactMessenger = useBookingStore.use.contactMessenger();
  const contactMessengerHandle = useBookingStore.use.contactMessengerHandle();

  const grandTotal = sessionPricing.units.reduce((sum, u) => {
    const count = passengers[u.unitId] ?? 0;
    return sum + count * u.price;
  }, 0);

  const fmt = (n: number) => (currency === '₫' ? `₫${n.toLocaleString('vi-VN')}` : `$${n.toLocaleString('en-US')}`);

  const selectedDeparture = departureTimes.find((d) => d.id === departureTime);
  const selectedPickup = pickupLocations.find((p) => p.id === pickupLocation);
  const pickupDisplay = pickupType === 'custom' ? customPickup?.name ?? '—' : selectedPickup?.name ?? '—';
  const selectedOption = options.find((o) => o.id === packageType);

  const guestLabel =
    sessionPricing.units
      .map((u) => {
        const count = passengers[u.unitId] ?? 0;
        if (count <= 0) return null;
        return `${count} ${u.name}`;
      })
      .filter(Boolean)
      .join(', ') || '—';

  return (
    <div className="flex flex-col gap-5 px-5 pt-5 pb-8">
      <div>
        <h2 className="text-[24px] font-bold text-[#111] tracking-tight leading-snug">{t('booking.reviewBooking')}</h2>
        <p className="text-[14px] text-[#666] mt-1">{t('booking.confirmEverythingBeforeProceeding')}</p>
      </div>

      {/* Booking Details card */}
      <div className="bg-white border border-[#E5E5E5] rounded-[16px] overflow-hidden shadow-sm">
        <div className="px-5 py-3">
          <p className="text-[11px] font-bold text-[#0F6E56] uppercase tracking-widest">
            {t('booking.bookingDetails')}
          </p>
        </div>
        <DetailRow label={t('booking.tourLabel')} value={productName} />
        <DetailRow label={t('booking.dateLabel')} value={date ? format(date, 'EEE, MMM d, yyyy') : '—'} />
        <DetailRow label={t('booking.guestsLabel')} value={guestLabel} />
        <DetailRow
          label={t('booking.departureLabel')}
          value={selectedDeparture ? `${selectedDeparture.time.slice(0, 5)} · ${selectedDeparture.label}` : '—'}
        />
        <DetailRow label={t('booking.pickupLabel')} value={pickupDisplay} />
        <DetailRow label={t('booking.packageLabel')} value={selectedOption?.title ?? '—'} />
      </div>

      {/* Contact Info card */}
      <div className="bg-white border border-[#E5E5E5] rounded-[16px] overflow-hidden shadow-sm">
        <div className="px-5 py-3">
          <p className="text-[11px] font-bold text-[#0F6E56] uppercase tracking-widest">
            {t('booking.contactInfoSection')}
          </p>
        </div>
        <DetailRow label={t('booking.contactName')} value={contactName || '—'} />
        <DetailRow label={t('booking.contactPhone')} value={contactPhone || '—'} />
        <DetailRow label={t('booking.contactEmail')} value={contactEmail || '—'} />
        {contactMessenger && (
          <DetailRow
            label={t('booking.contactMessengerLabel')}
            value={contactMessengerHandle ? `${contactMessenger}: ${contactMessengerHandle}` : contactMessenger}
          />
        )}
      </div>

      {/* Price Summary card */}
      <div className="bg-white border border-[#E5E5E5] rounded-[16px] overflow-hidden shadow-sm">
        <div className="px-5 py-3">
          <p className="text-[11px] font-bold text-[#0F6E56] uppercase tracking-widest">{t('booking.priceSummary')}</p>
        </div>

        {sessionPricing.units.map((u) => {
          const count = passengers[u.unitId] ?? 0;
          if (count <= 0) return null;
          const itemTotal = count * u.price;

          return (
            <div key={u.unitId} className="flex items-center justify-between px-5 py-3 border-b border-[#F2F2F2]">
              <span className="text-[14px] text-[#666]">
                {count} &times; {u.name} ({fmt(u.price)})
              </span>
              <span className="text-[14px] font-semibold text-[#111]">{fmt(itemTotal)}</span>
            </div>
          );
        })}

        <div className="flex items-center justify-between px-5 py-3 pb-4">
          <span className="text-[16px] font-bold text-[#111]">{t('booking.totalLabel')}</span>
          <span className="text-[20px] font-bold text-[#0F6E56]">{fmt(grandTotal)}</span>
        </div>
      </div>

      {/* Free cancellation */}
      <div className="bg-[#EAF7F1] rounded-[14px] py-4 px-5 flex gap-3 items-start">
        <div className="w-5 h-5 rounded-[4px] bg-[#0F6E56] flex items-center justify-center flex-shrink-0 mt-0.5">
          <ShieldCheck size={13} className="text-white" />
        </div>
        <p className="text-[13px] font-medium text-[#0F6E56] leading-relaxed">{t('booking.freeCancellationNotice')}</p>
      </div>

      {/* Terms checkbox */}
      <button onClick={() => setAgreedToTerms(!agreedToTerms)} className="flex items-start gap-3 text-left">
        <div
          className={cn(
            'w-5 h-5 rounded-[5px] border-2 flex items-center justify-center flex-shrink-0 mt-0.5 transition-colors',
            agreedToTerms ? 'bg-[#0F6E56] border-[#0F6E56]' : 'border-[#CCC] bg-white'
          )}
        >
          <AnimatePresence>
            {agreedToTerms && (
              <motion.svg
                key="checkmark"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                width="11"
                height="9"
                viewBox="0 0 11 9"
                fill="none"
              >
                <motion.path
                  d="M1 4.5L4 7.5L10 1"
                  stroke="white"
                  strokeWidth="1.8"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  initial={{ pathLength: 0 }}
                  animate={{ pathLength: 1 }}
                  transition={{ duration: 0.25, ease: 'easeOut' }}
                />
              </motion.svg>
            )}
          </AnimatePresence>
        </div>
        <p className="text-[13px] text-[#444] leading-relaxed">
          {t('booking.iAgreeToThe')}{' '}
          <span className="text-[#0F6E56] font-semibold underline">{t('booking.termsAndConditions')}</span>{' '}
          {t('booking.and')}{' '}
          <span className="text-[#0F6E56] font-semibold underline">{t('booking.cancellationPolicy')}</span>
        </p>
      </button>
    </div>
  );
}
