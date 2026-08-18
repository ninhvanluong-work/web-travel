import { format } from 'date-fns';
import { useTranslation } from 'next-i18next';
import React from 'react';

import { useSessionList } from '@/api/session';
import { useBookingStore } from '@/stores/BookingStore';

export function useSessionPricing(productId: string, adultPrice: number) {
  const { t } = useTranslation('productPage');

  const date = useBookingStore.use.date();
  const setDate = useBookingStore.use.setDate();
  const setGuests = useBookingStore.use.setGuests();
  const setSessionPricing = useBookingStore.use.setSessionPricing();

  const dateStr = date ? format(date, 'yyyy-MM-dd') : undefined;

  const { data: sessionData, isLoading: isSessionLoading } = useSessionList({
    variables: {
      productId,
      fromDate: dateStr ?? '',
      toDate: dateStr ?? '',
      page: 1,
      pageSize: 10,
    },
    enabled: !!productId && !!dateStr,
  });

  React.useEffect(() => {
    if (!date) setDate(new Date());
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  React.useEffect(() => {
    if (!date) {
      setSessionPricing({
        adultPrice: 0,
        childPrice: 0,
        adultNote: null,
        childNote: null,
        adultMaxSlots: 0,
        childMaxSlots: 0,
        isAdultAvailable: false,
        isChildAvailable: false,
        isLoadingSession: false,
        sessionError: null,
        adultUnitId: null,
        childUnitId: null,
        sessionId: null,
      });
      setGuests({ adults: 0, children: 0 });
    }
  }, [date]); // eslint-disable-line react-hooks/exhaustive-deps

  React.useEffect(() => {
    if (!dateStr) return;

    if (isSessionLoading) {
      setSessionPricing({ isLoadingSession: true, sessionError: null });
      return;
    }

    if (!sessionData) return;

    const items = sessionData.items ?? [];

    if (items.length === 0) {
      setSessionPricing({
        isLoadingSession: false,
        sessionError: t('booking.noSessionsForDate'),
        isAdultAvailable: false,
        isChildAvailable: false,
        adultMaxSlots: 0,
        childMaxSlots: 0,
        adultUnitId: null,
        childUnitId: null,
        sessionId: null,
      });
      setGuests({ adults: 0, children: 0 });
      return;
    }

    const session = items[0];
    const sessionUnits = session?.sessionUnits ?? [];

    // Units ordered by backend: index 0 = adult, index 1 = child
    const adultUnit = sessionUnits[0] ?? null;
    const childUnit = sessionUnits[1] ?? null;

    if (!adultUnit) {
      setSessionPricing({
        isLoadingSession: false,
        sessionError: t('booking.noSessionsForDate'),
        isAdultAvailable: false,
        isChildAvailable: false,
        adultMaxSlots: 0,
        childMaxSlots: 0,
        adultUnitId: null,
        childUnitId: null,
        sessionId: null,
      });
      setGuests({ adults: 0, children: 0 });
      return;
    }

    const adultPriceVal = adultUnit.price || adultPrice;
    const childPriceVal = childUnit ? childUnit.price || adultPriceVal * 0.5 : 0;

    setSessionPricing({
      isLoadingSession: false,
      sessionError: null,
      adultPrice: adultPriceVal,
      childPrice: childPriceVal,
      adultNote: adultUnit.unit?.note ?? null,
      childNote: childUnit?.unit?.note ?? null,
      adultMaxSlots: 99,
      childMaxSlots: 99,
      isAdultAvailable: true,
      isChildAvailable: !!childUnit,
      adultUnitId: adultUnit.unitId,
      childUnitId: childUnit?.unitId ?? null,
      sessionId: session.id,
    });
  }, [sessionData, isSessionLoading, dateStr, adultPrice]); // eslint-disable-line react-hooks/exhaustive-deps

  return { date, setDate };
}
