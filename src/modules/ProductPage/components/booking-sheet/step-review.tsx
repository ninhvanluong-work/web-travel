import { format } from 'date-fns';
import { AnimatePresence, motion } from 'framer-motion';
import { ShieldCheck } from 'lucide-react';
import { useTranslation } from 'next-i18next';

import { cn } from '@/lib/utils';
import { useBookingStore } from '@/stores/BookingStore';

function DetailRow({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex items-center justify-between px-5 py-3 border-b border-[#F2F2F2] last:border-0">
      <span className="text-[14px] font-medium text-[#555] flex-shrink-0 w-[90px]">{label}</span>
      <span className="text-[14px] font-semibold text-[#111] text-right flex-1">{value}</span>
    </div>
  );
}

interface StepReviewProps {
  productName: string;
  adultPrice: number;
  currency: string;
}

export default function StepReview({ productName, adultPrice, currency }: StepReviewProps) {
  const { t } = useTranslation('productPage');

  const date = useBookingStore.use.date();
  const guests = useBookingStore.use.guests();
  const departureTime = useBookingStore.use.departureTime();
  const pickupLocation = useBookingStore.use.pickupLocation();
  const packageType = useBookingStore.use.packageType();
  const agreedToTerms = useBookingStore.use.agreedToTerms();
  const setAgreedToTerms = useBookingStore.use.setAgreedToTerms();
  const sessionPricing = useBookingStore.use.sessionPricing();

  const effectiveAdultPrice = sessionPricing.adultPrice || adultPrice;
  const effectiveChildPrice = sessionPricing.childPrice || effectiveAdultPrice * 0.5;
  const premiumSurcharge = packageType === 'premium' ? 40 : 0;

  const adultTotal = guests.adults * (effectiveAdultPrice + premiumSurcharge);
  const childTotal = guests.children * (effectiveChildPrice + premiumSurcharge * 0.5);
  const grandTotal = adultTotal + childTotal;

  const fmt = (n: number) => (currency === '₫' ? `₫${n.toLocaleString('vi-VN')}` : `$${n.toLocaleString('en-US')}`);

  const DEPARTURE_LABELS: Record<string, string> = {
    '07:30': t('booking.morningDepartureLabel'),
    '13:00': t('booking.afternoonDepartureLabel'),
  };

  const PICKUP_LABELS: Record<string, string> = {
    'old-quarter': t('booking.locationOldQuarter'),
    'hoan-kiem': t('booking.locationHoanKiem'),
    'ba-dinh': t('booking.locationBaDinh'),
  };

  const PACKAGE_LABELS: Record<string, string> = {
    basic: t('booking.packageBasic'),
    premium: t('booking.packagePremium'),
  };

  const guestLabel =
    [
      guests.adults > 0 ? t('booking.adult', { count: guests.adults }) : '',
      guests.children > 0 ? t('booking.child', { count: guests.children }) : '',
    ]
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
          value={departureTime ? DEPARTURE_LABELS[departureTime] ?? departureTime : '—'}
        />
        <DetailRow
          label={t('booking.pickupLabel')}
          value={pickupLocation ? PICKUP_LABELS[pickupLocation] ?? pickupLocation : '—'}
        />
        <DetailRow label={t('booking.packageLabel')} value={PACKAGE_LABELS[packageType ?? ''] ?? '—'} />
      </div>

      {/* Price Summary card */}
      <div className="bg-white border border-[#E5E5E5] rounded-[16px] overflow-hidden shadow-sm">
        <div className="px-5 py-3">
          <p className="text-[11px] font-bold text-[#0F6E56] uppercase tracking-widest">{t('booking.priceSummary')}</p>
        </div>

        {guests.adults > 0 && (
          <div className="flex items-center justify-between px-5 py-3 border-b border-[#F2F2F2]">
            <span className="text-[14px] text-[#666]">
              {t('booking.adult', { count: guests.adults })} &times; {fmt(effectiveAdultPrice + premiumSurcharge)}
            </span>
            <span className="text-[14px] font-semibold text-[#111]">{fmt(adultTotal)}</span>
          </div>
        )}

        {guests.children > 0 && (
          <div className="flex items-center justify-between px-5 py-3 border-b border-[#F2F2F2]">
            <span className="text-[14px] text-[#666]">
              {t('booking.child', { count: guests.children })} &times;{' '}
              {fmt(effectiveChildPrice + premiumSurcharge * 0.5)}
            </span>
            <span className="text-[14px] font-semibold text-[#111]">{fmt(childTotal)}</span>
          </div>
        )}

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
