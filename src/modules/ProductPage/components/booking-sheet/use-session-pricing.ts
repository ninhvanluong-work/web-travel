import { format } from 'date-fns';
import { useTranslation } from 'next-i18next';
import React from 'react';

import { useSessionList } from '@/api/session';
import { type BookingSessionUnit, useBookingStore } from '@/stores/BookingStore';

export function useSessionPricing(productId: string, adultPrice: number) {
  const { t } = useTranslation('productPage');

  const date = useBookingStore.use.date();
  const setDate = useBookingStore.use.setDate();
  const setPassengers = useBookingStore.use.setPassengers();
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
        isLoadingSession: false,
        sessionError: null,
        sessionId: null,
        units: [],
      });
      setPassengers({});
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
        sessionId: null,
        units: [],
      });
      setPassengers({});
      return;
    }

    const session = items[0];
    const sessionUnits = session?.sessionUnits ?? [];

    if (sessionUnits.length === 0) {
      setSessionPricing({
        isLoadingSession: false,
        sessionError: t('booking.noSessionsForDate'),
        sessionId: null,
        units: [],
      });
      setPassengers({});
      return;
    }

    const units: BookingSessionUnit[] = sessionUnits.map((su) => ({
      unitId: su.unitId,
      name: su.unit?.name || 'Person',
      note: su.unit?.note ?? null,
      price: su.price > 0 ? su.price : adultPrice,
    }));

    setSessionPricing({
      isLoadingSession: false,
      sessionError: null,
      sessionId: session.id,
      units,
    });
    setPassengers({});
  }, [sessionData, isSessionLoading, dateStr, adultPrice]); // eslint-disable-line react-hooks/exhaustive-deps

  return { date, setDate };
}
