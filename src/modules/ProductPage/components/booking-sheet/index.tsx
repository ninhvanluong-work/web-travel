import React from 'react';

import { useBookingStore } from '@/stores/BookingStore';

import BookingStepper from './booking-stepper';
import StepInfo from './step-info';
import StepOptions from './step-options';
import StepPayment from './step-payment';
import StepReview from './step-review';

interface BookingSheetProps {
  productName: string;
  duration: string;
  adultPrice: number;
  currency: string;
  onClose: () => void;
}

export default function BookingSheet({
  productName,
  duration,
  adultPrice,
  currency,
  onClose: _onClose,
}: BookingSheetProps) {
  const step = useBookingStore.use.step();
  const setStep = useBookingStore.use.setStep();

  const date = useBookingStore.use.date();
  const guests = useBookingStore.use.guests();
  const departureTime = useBookingStore.use.departureTime();
  const pickupLocation = useBookingStore.use.pickupLocation();
  const packageType = useBookingStore.use.packageType();
  const agreedToTerms = useBookingStore.use.agreedToTerms();

  const scrollRef = React.useRef<HTMLDivElement>(null);

  // Scroll to top whenever step changes
  React.useEffect(() => {
    scrollRef.current?.scrollTo({ top: 0, behavior: 'instant' });
  }, [step]);

  const childPrice = adultPrice * 0.5;
  const premiumSurcharge = packageType === 'premium' ? 40 : 0;
  const estimatedTotal = guests.adults * adultPrice + guests.children * childPrice;
  const runningTotal =
    guests.adults * (adultPrice + premiumSurcharge) + guests.children * (childPrice + premiumSurcharge * 0.5);

  const fmt = (n: number) => (currency === '₫' ? `₫${n.toLocaleString('vi-VN')}` : `$${n.toLocaleString('en-US')}`);

  const displayTotal = step === 1 ? estimatedTotal : runningTotal;
  let totalLabel = 'Total to pay';
  if (step === 1) totalLabel = 'Estimated total';
  else if (step === 2) totalLabel = 'Running total';

  let canContinue = false;
  if (step === 1) canContinue = date !== null && guests.adults >= 1;
  else if (step === 2) canContinue = departureTime !== null && pickupLocation !== null && packageType !== null;
  else if (step === 3) canContinue = agreedToTerms;

  const handleNext = () => {
    if (step < 4) setStep((step + 1) as 2 | 3 | 4);
  };

  const handleBack = () => {
    if (step > 1) setStep((step - 1) as 1 | 2 | 3);
  };

  return (
    <div className="flex flex-col h-full bg-[#F8F8F8]">
      {/* Header */}
      <div className="flex items-center px-4 pt-4 pb-3 bg-white border-b border-black/[0.07] flex-shrink-0">
        <div className="flex items-center gap-3 min-w-0">
          {/* Tour icon */}
          <div className="w-11 h-11 rounded-[12px] bg-[#0F6E56] flex items-center justify-center flex-shrink-0">
            <span className="text-[20px]">🧳</span>
          </div>
          <div className="min-w-0">
            <p className="text-[14px] font-bold text-[#111] truncate">{productName}</p>
            <p className="text-[12px] text-[#777] mt-0.5">
              {duration} · from <span className="text-[#0F6E56] font-semibold">{fmt(adultPrice)}</span>/person
            </p>
          </div>
        </div>
      </div>

      {/* Stepper */}
      <div className="flex-shrink-0">
        <BookingStepper currentStep={step} />
      </div>

      {/* Step content */}
      <div ref={scrollRef} className="flex-1 overflow-y-auto scrollbar-hide">
        {step === 1 && <StepInfo adultPrice={adultPrice} currency={currency} />}
        {step === 2 && <StepOptions />}
        {step === 3 && <StepReview productName={productName} adultPrice={adultPrice} currency={currency} />}
        {step === 4 && (
          <StepPayment
            productName={productName}
            duration={duration}
            total={runningTotal}
            currency={currency}
            onEditBooking={() => setStep(1)}
          />
        )}
      </div>

      {/* Bottom bar — hidden on step 4 */}
      {step < 4 && (
        <div
          className="flex-shrink-0 bg-white border-t border-black/[0.07] px-4 pt-3 pb-4"
          style={{ paddingBottom: 'max(16px, env(safe-area-inset-bottom))' }}
        >
          <div className="flex items-center gap-3">
            {/* Back arrow — only from step 2 onwards */}
            {step > 1 && (
              <button
                onClick={handleBack}
                className="w-11 h-11 rounded-[12px] border border-[#E0E0E0] flex items-center justify-center text-[18px] text-[#444] flex-shrink-0"
              >
                ←
              </button>
            )}

            {/* Total — centered, takes remaining space */}
            <div className="flex-1 min-w-0">
              <p className="text-[11px] text-[#999] leading-none">{totalLabel}</p>
              <p className="text-[20px] font-bold tabular-nums text-[#111] leading-tight mt-0.5">{fmt(displayTotal)}</p>
            </div>

            {/* Continue / Confirm button */}
            <button
              onClick={handleNext}
              disabled={!canContinue}
              className="h-11 px-5 rounded-[14px] text-[14px] font-semibold flex items-center justify-center flex-shrink-0 transition-all"
              style={{
                background: canContinue ? '#0F6E56' : '#D1D1D1',
                color: canContinue ? 'white' : '#999',
              }}
            >
              {step === 3 ? 'Confirm Booking →' : 'Continue →'}
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
