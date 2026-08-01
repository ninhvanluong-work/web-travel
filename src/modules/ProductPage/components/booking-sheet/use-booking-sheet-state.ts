import { useTranslation } from 'next-i18next';
import React from 'react';

import { useCreateBooking } from '@/api/booking';
import { useBookingStore } from '@/stores/BookingStore';

const isValidEmail = (v: string) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v.trim());

export function useBookingSheetState(productId: string, adultPrice: number, currency: string) {
  const { t } = useTranslation('productPage');

  const step = useBookingStore.use.step();
  const setStep = useBookingStore.use.setStep();
  const date = useBookingStore.use.date();
  const guests = useBookingStore.use.guests();
  const departureTime = useBookingStore.use.departureTime();
  const pickupLocation = useBookingStore.use.pickupLocation();
  const pickupType = useBookingStore.use.pickupType();
  const customPickup = useBookingStore.use.customPickup();
  const packageType = useBookingStore.use.packageType();
  const agreedToTerms = useBookingStore.use.agreedToTerms();
  const sessionPricing = useBookingStore.use.sessionPricing();
  const contactName = useBookingStore.use.contactName();
  const contactPhone = useBookingStore.use.contactPhone();
  const contactEmail = useBookingStore.use.contactEmail();
  const contactMessenger = useBookingStore.use.contactMessenger();
  const contactMessengerHandle = useBookingStore.use.contactMessengerHandle();

  const setBookingId = useBookingStore.use.setBookingId();

  const [bookingError, setBookingError] = React.useState<string | null>(null);

  const { mutate: callCreateBooking, isLoading: isSavingBooking } = useCreateBooking();

  const directionRef = React.useRef<'forward' | 'backward'>('forward');
  const prevStepRef = React.useRef(step);
  if (step !== prevStepRef.current) {
    directionRef.current = step > prevStepRef.current ? 'forward' : 'backward';
    prevStepRef.current = step;
  }

  const effectiveAdultPrice = sessionPricing.adultPrice || adultPrice;
  const effectiveChildPrice = sessionPricing.childPrice || effectiveAdultPrice * 0.5;

  const estimatedTotal = guests.adults * effectiveAdultPrice + guests.children * effectiveChildPrice;
  const runningTotal = guests.adults * effectiveAdultPrice + guests.children * effectiveChildPrice;

  const displayTotal = step === 1 ? estimatedTotal : runningTotal;
  const fmt = (n: number) => (currency === '₫' ? `₫${n.toLocaleString('vi-VN')}` : `$${n.toLocaleString('en-US')}`);

  let totalLabel = t('booking.totalToPay');
  if (step === 1) totalLabel = t('booking.estimatedTotal');
  else if (step === 2) totalLabel = t('booking.runningTotal');

  let canContinue = false;
  if (step === 1) {
    canContinue =
      date !== null &&
      guests.adults >= 1 &&
      !sessionPricing.isLoadingSession &&
      sessionPricing.sessionError === null &&
      sessionPricing.isAdultAvailable &&
      contactName.trim() !== '' &&
      contactPhone.trim() !== '' &&
      contactEmail.trim() !== '' &&
      isValidEmail(contactEmail) &&
      (!contactMessenger || contactMessengerHandle.trim() !== '');
  } else if (step === 2) {
    let pickupValid = false;
    if (pickupType === 'predefined') pickupValid = pickupLocation !== null;
    else if (pickupType === 'custom') pickupValid = customPickup !== null;
    canContinue = departureTime !== null && pickupValid && packageType !== null;
  } else if (step === 3) {
    canContinue = agreedToTerms && !isSavingBooking;
  }

  const handleNext = () => {
    if (step === 3) {
      setBookingError(null);

      const messengerApp =
        contactMessenger && contactMessengerHandle
          ? [{ name: contactMessenger, username: contactMessengerHandle }]
          : [];

      const passengers: { unitId: string; count: number }[] = [];
      if (guests.adults > 0 && sessionPricing.adultUnitId) {
        passengers.push({ unitId: sessionPricing.adultUnitId, count: guests.adults });
      }
      if (guests.children > 0 && sessionPricing.childUnitId) {
        passengers.push({ unitId: sessionPricing.childUnitId, count: guests.children });
      }

      callCreateBooking(
        {
          productId,
          optionId: packageType!,
          tourSessionId: sessionPricing.sessionId!,
          pickupLocationId: pickupType === 'predefined' ? pickupLocation : null,
          departureId: departureTime!,
          passengers,
          username: contactName,
          email: contactEmail,
          phone: contactPhone,
          messengerApp,
        },
        {
          onSuccess: (data) => {
            setBookingId(data.id);
            setBookingError(null);
            setStep(4);
          },
          onError: (err: unknown) => {
            const msg = err instanceof Error ? err.message : t('booking.errorGeneric');
            setBookingError(msg);
          },
        }
      );
    } else if (step < 4) {
      setStep((step + 1) as 2 | 3 | 4);
    }
  };

  const handleBack = () => {
    if (step > 1) setStep((step - 1) as 1 | 2 | 3);
  };

  const swipeTouchStart = React.useRef<{ x: number; y: number } | null>(null);
  const handleTouchStart = (e: React.TouchEvent) => {
    swipeTouchStart.current = { x: e.touches[0].clientX, y: e.touches[0].clientY };
  };
  const handleTouchEnd = (e: React.TouchEvent) => {
    if (!swipeTouchStart.current) return;
    const dx = swipeTouchStart.current.x - e.changedTouches[0].clientX;
    const dy = swipeTouchStart.current.y - e.changedTouches[0].clientY;
    swipeTouchStart.current = null;
    if (Math.abs(dx) < Math.abs(dy) || Math.abs(dx) < 50) return;
    if (dx > 0 && canContinue) handleNext();
    else if (dx < 0) handleBack();
  };

  return {
    step,
    setStep,
    direction: directionRef.current,
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
  };
}
