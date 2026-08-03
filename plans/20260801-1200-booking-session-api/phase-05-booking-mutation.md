# Phase 05 — Booking Mutation & Pricing Cleanup

**Parent:** [plan.md](./plan.md)  
**Depends on:** Phase 01, 02, 03, 04  
**Status:** ⏳ pending

## Files

### A. `use-booking-sheet-state.ts`

**Changes:**

1. Add `productId: string` param to hook signature
2. Remove `premiumSurcharge` calculation (options are cosmetic)
3. Remove `goongSurcharge` from `runningTotal` (custom pickup display-only)
4. Simplify price calc:
   ```ts
   // BEFORE
   const runningTotal =
     guests.adults * (effectiveAdultPrice + premiumSurcharge) +
     guests.children * (effectiveChildPrice + premiumSurcharge * 0.5) +
     goongSurcharge;
   // AFTER
   const runningTotal = guests.adults * effectiveAdultPrice + guests.children * effectiveChildPrice;
   ```
5. Add `useCreateBooking` mutation
6. Add `bookingError: string | null` state (for AlertBanner)
7. Update `handleNext` for step 3:
   ```ts
   if (step === 3) {
     let preferredChatText: string | null = null;
     if (contactMessenger) {
       preferredChatText = `${contactMessenger}${contactMessengerHandle ? `: ${contactMessengerHandle}` : ''}`;
     }
     const passengers = [];
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
         name: contactName,
         email: contactEmail,
         phone: contactPhone,
         preferredChat: preferredChatText,
       },
       {
         onSuccess: () => {
           setBookingError(null);
           setStep(4);
         },
         onError: (err: unknown) => {
           const msg = err instanceof Error ? err.message : t('booking.errorGeneric');
           setBookingError(msg);
         },
       }
     );
   }
   ```
8. Add `isSavingBooking` and `bookingError` to returned object
9. `canContinue` at step 3: add `&& !isSavingBooking`

### B. `booking-bottom-bar.tsx`

**Changes:**

1. Add `isSavingBooking?: boolean` to props
2. Disable button when `isSavingBooking`
3. Show loading text when saving:
   ```ts
   {
     step === 3 ? (isSavingBooking ? t('booking.confirming') : t('booking.confirmBooking')) : t('booking.continue');
   }
   ```

### C. `booking-sheet/index.tsx`

**Changes:**

1. Receive `isSavingBooking`, `bookingError` from `useBookingSheetState`
2. Pass `isSavingBooking` to `BookingBottomBar`
3. Show `<AlertBanner>` above bottom bar when `bookingError !== null`:
   ```tsx
   {
     bookingError && <AlertBanner variant="error" message={bookingError} />;
   }
   ```
   Check `src/components/ui/AlertBanner` props before implementing.

## i18n Keys Needed

- `booking.confirming` — "Confirming..." loading text
- `booking.errorGeneric` — fallback error message
- `booking.daysNights` — "{day} days {night} nights" for option card (Phase 04)

## Success Criteria

- Step 3 confirm → POST /booking called with correct payload
- On success → step 4 shown
- On error → AlertBanner shown inline (no toast)
- Button disabled + text changes while API in flight
- `premiumSurcharge` and `goongSurcharge` completely removed from price calc
