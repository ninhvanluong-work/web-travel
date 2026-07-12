import { format } from 'date-fns';
import { ShieldCheck } from 'lucide-react';

import { cn } from '@/lib/utils';
import { useBookingStore } from '@/stores/BookingStore';

const DEPARTURE_LABELS: Record<string, string> = {
  '07:30': '07:30 — Morning',
  '13:00': '13:00 — Afternoon',
};

const PICKUP_LABELS: Record<string, string> = {
  'old-quarter': 'Hanoi Old Quarter',
  'hoan-kiem': 'Hoan Kiem Lake',
  'ba-dinh': 'Ba Dinh Square',
};

const PACKAGE_LABELS: Record<string, string> = {
  basic: 'Basic',
  premium: 'Premium',
};

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
  const date = useBookingStore.use.date();
  const guests = useBookingStore.use.guests();
  const departureTime = useBookingStore.use.departureTime();
  const pickupLocation = useBookingStore.use.pickupLocation();
  const packageType = useBookingStore.use.packageType();
  const agreedToTerms = useBookingStore.use.agreedToTerms();
  const setAgreedToTerms = useBookingStore.use.setAgreedToTerms();

  const childPrice = adultPrice * 0.5;
  const premiumSurcharge = packageType === 'premium' ? 40 : 0;

  const adultTotal = guests.adults * (adultPrice + premiumSurcharge);
  const childTotal = guests.children * (childPrice + premiumSurcharge * 0.5);
  const grandTotal = adultTotal + childTotal;

  const fmt = (n: number) => (currency === '₫' ? `₫${n.toLocaleString('vi-VN')}` : `$${n.toLocaleString('en-US')}`);

  const guestLabel =
    [
      guests.adults > 0 ? `${guests.adults} adult${guests.adults > 1 ? 's' : ''}` : '',
      guests.children > 0 ? `${guests.children} child${guests.children > 1 ? 'ren' : ''}` : '',
    ]
      .filter(Boolean)
      .join(', ') || '—';

  return (
    <div className="flex flex-col gap-5 px-5 pt-5 pb-8">
      {/* Heading */}
      <div>
        <h2 className="text-[24px] font-bold text-[#111] tracking-tight leading-snug">Review Booking</h2>
        <p className="text-[14px] text-[#666] mt-1">Confirm everything before proceeding</p>
      </div>

      {/* Booking Details card */}
      <div className="bg-white border border-[#E5E5E5] rounded-[16px] overflow-hidden shadow-sm">
        <div className="px-5 py-3">
          <p className="text-[11px] font-bold text-[#0F6E56] uppercase tracking-widest">Booking Details</p>
        </div>
        <DetailRow label="Tour" value={productName} />
        <DetailRow label="Date" value={date ? format(date, 'EEE, MMM d, yyyy') : '—'} />
        <DetailRow label="Guests" value={guestLabel} />
        <DetailRow label="Departure" value={departureTime ? DEPARTURE_LABELS[departureTime] ?? departureTime : '—'} />
        <DetailRow label="Pickup" value={pickupLocation ? PICKUP_LABELS[pickupLocation] ?? pickupLocation : '—'} />
        <DetailRow label="Package" value={PACKAGE_LABELS[packageType ?? ''] ?? '—'} />
      </div>

      {/* Price Summary card */}
      <div className="bg-white border border-[#E5E5E5] rounded-[16px] overflow-hidden shadow-sm">
        <div className="px-5 py-3">
          <p className="text-[11px] font-bold text-[#0F6E56] uppercase tracking-widest">Price Summary</p>
        </div>

        {guests.adults > 0 && (
          <div className="flex items-center justify-between px-5 py-3 border-b border-[#F2F2F2]">
            <span className="text-[14px] text-[#666]">
              {guests.adults} adult{guests.adults > 1 ? 's' : ''} &times; {fmt(adultPrice + premiumSurcharge)}
            </span>
            <span className="text-[14px] font-semibold text-[#111]">{fmt(adultTotal)}</span>
          </div>
        )}

        {guests.children > 0 && (
          <div className="flex items-center justify-between px-5 py-3 border-b border-[#F2F2F2]">
            <span className="text-[14px] text-[#666]">
              {guests.children} child{guests.children > 1 ? 'ren' : ''} &times;{' '}
              {fmt(childPrice + premiumSurcharge * 0.5)}
            </span>
            <span className="text-[14px] font-semibold text-[#111]">{fmt(childTotal)}</span>
          </div>
        )}

        {/* Total row */}
        <div className="flex items-center justify-between px-5 py-3 pb-4">
          <span className="text-[16px] font-bold text-[#111]">Total</span>
          <span className="text-[20px] font-bold text-[#0F6E56]">{fmt(grandTotal)}</span>
        </div>
      </div>

      {/* Free cancellation */}
      <div className="bg-[#EAF7F1] rounded-[14px] py-4 px-5 flex gap-3 items-start">
        <div className="w-5 h-5 rounded-[4px] bg-[#0F6E56] flex items-center justify-center flex-shrink-0 mt-0.5">
          <ShieldCheck size={13} className="text-white" />
        </div>
        <p className="text-[13px] font-medium text-[#0F6E56] leading-relaxed">
          Free cancellation up to 24h before departure. Full refund guaranteed.
        </p>
      </div>

      {/* Terms checkbox */}
      <button onClick={() => setAgreedToTerms(!agreedToTerms)} className="flex items-start gap-3 text-left">
        <div
          className={cn(
            'w-5 h-5 rounded-[5px] border-2 flex items-center justify-center flex-shrink-0 mt-0.5 transition-colors',
            agreedToTerms ? 'bg-[#0F6E56] border-[#0F6E56]' : 'border-[#CCC] bg-white'
          )}
        >
          {agreedToTerms && (
            <svg width="11" height="9" viewBox="0 0 11 9" fill="none">
              <path
                d="M1 4.5L4 7.5L10 1"
                stroke="white"
                strokeWidth="1.8"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </svg>
          )}
        </div>
        <p className="text-[13px] text-[#444] leading-relaxed">
          I agree to the <span className="text-[#0F6E56] font-semibold underline">Terms and Conditions</span> and{' '}
          <span className="text-[#0F6E56] font-semibold underline">Cancellation Policy</span>
        </p>
      </button>
    </div>
  );
}
