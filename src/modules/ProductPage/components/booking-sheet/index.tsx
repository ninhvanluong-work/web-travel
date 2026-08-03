import { AnimatePresence, motion } from 'framer-motion';
import { useTranslation } from 'next-i18next';
import React from 'react';

import { useProductBookingDetail } from '@/api/product';
import { Icons } from '@/assets/icons';
import { useBookingStore } from '@/stores/BookingStore';

import BookingBottomBar from './booking-bottom-bar';
import BookingStepper from './booking-stepper';
import StepInfo from './step-info';
import StepOptions from './step-options';
import StepPayment from './step-payment';
import StepReview from './step-review';
import { useBookingSheetState } from './use-booking-sheet-state';

interface BookingSheetProps {
  productId: string;
  productName: string;
  duration: string;
  adultPrice: number;
  currency: string;
  onClose: () => void;
}

const slideVariants = {
  enter: (direction: 'forward' | 'backward') => ({
    x: direction === 'forward' ? '100%' : '-100%',
    opacity: 0,
  }),
  center: { x: 0, opacity: 1 },
  exit: (direction: 'forward' | 'backward') => ({
    x: direction === 'forward' ? '-100%' : '100%',
    opacity: 0,
  }),
};

export default function BookingSheet({
  productId,
  productName,
  duration,
  adultPrice,
  currency,
  onClose: _onClose,
}: BookingSheetProps) {
  const { t } = useTranslation('productPage');

  const reset = useBookingStore.use.reset();
  React.useEffect(() => () => reset(), [reset]);

  const {
    step,
    setStep,
    direction,
    runningTotal,
    displayTotal,
    fmt,
    totalLabel,
    canContinue,
    isSavingBooking,
    bookingError,
    handleNext,
    handleBack,
    handleTouchStart,
    handleTouchEnd,
    effectiveMinPrice,
  } = useBookingSheetState(productId, adultPrice, currency);

  const { data: bookingDetail, isLoading: isLoadingBookingDetail } = useProductBookingDetail({
    variables: { id: productId },
    enabled: !!productId,
  });

  const departureTimes = bookingDetail?.departureTimes ?? [];
  const pickupLocations = bookingDetail?.pickupLocations ?? [];
  const options = bookingDetail?.options ?? [];

  return (
    <div className="flex flex-col h-full bg-[#F8F8F8]">
      {/* Header */}
      <div className="flex items-center px-4 pt-4 pb-3 bg-white border-b border-black/[0.07] flex-shrink-0">
        <div className="flex items-center gap-3 min-w-0">
          <div className="w-11 h-11 rounded-[12px] bg-[#0F6E56] flex items-center justify-center flex-shrink-0">
            <Icons.mountain className="w-5 h-5 text-white" />
          </div>
          <div className="min-w-0">
            <p className="text-[14px] font-bold text-[#111] truncate">{productName}</p>
            <p className="text-[12px] text-[#777] mt-0.5">
              {duration} · {t('booking.from')}{' '}
              <span className="text-[#0F6E56] font-semibold">{fmt(effectiveMinPrice)}</span>
              {t('booking.perPerson')}
            </p>
          </div>
        </div>
      </div>

      {/* Stepper */}
      <div className="flex-shrink-0">
        <BookingStepper currentStep={step} />
      </div>

      {/* Step content */}
      <div className="flex-1 relative overflow-hidden" onTouchStart={handleTouchStart} onTouchEnd={handleTouchEnd}>
        <AnimatePresence initial={false} mode="sync" custom={direction}>
          <motion.div
            key={step}
            custom={direction}
            variants={slideVariants}
            initial="enter"
            animate="center"
            exit="exit"
            transition={{
              x: { type: 'spring', stiffness: 300, damping: 30 },
              opacity: { duration: 0.2 },
            }}
            className="absolute inset-0 overflow-y-auto scrollbar-hide"
          >
            {step === 1 && <StepInfo adultPrice={adultPrice} currency={currency} productId={productId} />}
            {step === 2 && (
              <StepOptions
                departureTimes={departureTimes}
                pickupLocations={pickupLocations}
                options={options}
                currency={currency}
                isLoading={isLoadingBookingDetail}
              />
            )}
            {step === 3 && (
              <StepReview
                productName={productName}
                adultPrice={adultPrice}
                currency={currency}
                departureTimes={departureTimes}
                pickupLocations={pickupLocations}
                options={options}
              />
            )}
            {step === 4 && (
              <StepPayment
                productName={productName}
                duration={duration}
                total={runningTotal}
                currency={currency}
                onEditBooking={() => setStep(3)}
              />
            )}
          </motion.div>
        </AnimatePresence>
      </div>

      {step < 4 && (
        <BookingBottomBar
          step={step}
          canContinue={canContinue}
          isSavingBooking={isSavingBooking}
          bookingError={bookingError}
          displayTotal={displayTotal}
          totalLabel={totalLabel}
          fmt={fmt}
          onNext={handleNext}
          onBack={handleBack}
        />
      )}
    </div>
  );
}
