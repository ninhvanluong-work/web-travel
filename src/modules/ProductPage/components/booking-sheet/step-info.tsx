import { format } from 'date-fns';
import { AnimatePresence, motion } from 'framer-motion';
import { Minus, Plus } from 'lucide-react';
import { useTranslation } from 'next-i18next';
import React from 'react';

import { useTourSessions } from '@/api/tour-session';
import { DatePicker } from '@/components/ui/date-picker';
import { cn } from '@/lib/utils';
import { useBookingStore } from '@/stores/BookingStore';

interface GuestCounterProps {
  value: number;
  min?: number;
  max?: number;
  onChange: (v: number) => void;
}

const numVariants = {
  enter: (d: number) => ({ y: d > 0 ? 15 : -15, opacity: 0 }),
  center: { y: 0, opacity: 1 },
  exit: (d: number) => ({ y: d > 0 ? -15 : 15, opacity: 0 }),
};

function GuestCounter({ value, min = 0, max = 20, onChange }: GuestCounterProps) {
  const prevValueRef = React.useRef(value);
  const scrollDirRef = React.useRef(1);

  if (value !== prevValueRef.current) {
    scrollDirRef.current = value > prevValueRef.current ? 1 : -1;
    prevValueRef.current = value;
  }

  const scrollDir = scrollDirRef.current;
  const isAtMin = value <= min;
  const isAtMax = value >= max;

  return (
    <div className="flex items-center gap-3">
      <motion.button
        whileTap={{ scale: 0.92 }}
        onClick={() => onChange(Math.max(min, value - 1))}
        disabled={isAtMin}
        className={cn(
          'w-9 h-9 rounded-full border-2 flex items-center justify-center select-none',
          isAtMin ? 'border-[#DDD] text-[#CCC]' : 'border-[#0F6E56] text-[#0F6E56]'
        )}
      >
        <Minus size={16} strokeWidth={2.5} />
      </motion.button>

      <div className="w-6 h-7 flex items-center justify-center overflow-hidden relative">
        <AnimatePresence mode="popLayout" initial={false} custom={scrollDir}>
          <motion.span
            key={value}
            custom={scrollDir}
            variants={numVariants}
            initial="enter"
            animate="center"
            exit="exit"
            transition={{ type: 'spring', stiffness: 350, damping: 22 }}
            className="absolute text-[18px] font-bold tabular-nums text-[#111]"
          >
            {value}
          </motion.span>
        </AnimatePresence>
      </div>

      <motion.button
        whileTap={{ scale: 0.92 }}
        onClick={() => onChange(Math.min(max, value + 1))}
        disabled={isAtMax}
        className={cn(
          'w-9 h-9 rounded-full flex items-center justify-center select-none',
          isAtMax ? 'bg-[#DDD] text-[#AAA]' : 'bg-[#0F6E56] text-white'
        )}
      >
        <Plus size={16} strokeWidth={2.5} />
      </motion.button>
    </div>
  );
}

function GuestCardSkeleton() {
  return (
    <div className="bg-white border border-[#E5E5E5] rounded-[16px] px-5 py-5 flex items-center justify-between shadow-sm animate-pulse">
      <div className="flex flex-col gap-2">
        <div className="h-4 w-16 bg-[#E5E5E5] rounded" />
        <div className="h-3 w-28 bg-[#F0F0F0] rounded" />
      </div>
      <div className="flex items-center gap-3">
        <div className="w-9 h-9 rounded-full bg-[#E5E5E5]" />
        <div className="w-6 h-5 bg-[#E5E5E5] rounded" />
        <div className="w-9 h-9 rounded-full bg-[#E5E5E5]" />
      </div>
    </div>
  );
}

interface StepInfoProps {
  adultPrice: number;
  currency: string;
  optionId: string | undefined;
}

export default function StepInfo({ adultPrice, currency, optionId }: StepInfoProps) {
  const { t } = useTranslation('productPage');

  const date = useBookingStore.use.date();
  const setDate = useBookingStore.use.setDate();
  const guests = useBookingStore.use.guests();
  const setGuests = useBookingStore.use.setGuests();
  const sessionPricing = useBookingStore.use.sessionPricing();
  const setSessionPricing = useBookingStore.use.setSessionPricing();

  const guestsRef = React.useRef(guests);
  guestsRef.current = guests;

  const dateStr = date ? format(date, 'yyyy-MM-dd') : undefined;

  const { data: sessionData, isLoading: isSessionLoading } = useTourSessions({
    variables: {
      optionId: optionId ?? '',
      fromDate: dateStr ?? '',
      toDate: dateStr ?? '',
      page: 1,
      pageSize: 10,
    },
    enabled: !!optionId && !!dateStr,
  });

  // Reset when date is cleared
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
      });
      setGuests({ adults: 0, children: 0 });
    }
  }, [date]); // eslint-disable-line react-hooks/exhaustive-deps

  // Sync query state → store
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
      });
      setGuests({ adults: 0, children: 0 });
      return;
    }

    const session = items[0];
    const unitRefs = session?.unitReferences ?? [];
    const adultRef = unitRefs.find((u) => u.name.toLowerCase().includes('adult'));
    const childRef = unitRefs.find((u) => u.name.toLowerCase().includes('child'));

    if (!adultRef && !childRef) {
      setSessionPricing({
        isLoadingSession: false,
        sessionError: t('booking.noSessionsForDate'),
        isAdultAvailable: false,
        isChildAvailable: false,
        adultMaxSlots: 0,
        childMaxSlots: 0,
      });
      setGuests({ adults: 0, children: 0 });
      return;
    }

    const adultPriceVal = adultRef ? parseFloat(adultRef.price) || adultPrice : adultPrice;
    const childPriceVal = childRef ? parseFloat(childRef.price) || adultPriceVal * 0.5 : 0;

    const remainingSlot = session?.remainingSlot ?? 0;

    setSessionPricing({
      isLoadingSession: false,
      sessionError: null,
      adultPrice: adultPriceVal,
      childPrice: childPriceVal,
      adultNote: adultRef?.note ?? null,
      childNote: childRef?.note ?? null,
      adultMaxSlots: remainingSlot,
      childMaxSlots: remainingSlot,
      isAdultAvailable: !!adultRef && remainingSlot > 0,
      isChildAvailable: !!childRef && remainingSlot > 0,
    });

    const cur = guestsRef.current;
    if (cur.adults > remainingSlot || cur.children > remainingSlot) {
      setGuests({
        adults: Math.min(cur.adults, remainingSlot),
        children: Math.min(cur.children, remainingSlot),
      });
    }
  }, [sessionData, isSessionLoading, dateStr, adultPrice]); // eslint-disable-line react-hooks/exhaustive-deps

  const fmtPrice = (n: number) => {
    if (currency === '₫') return `₫${n.toLocaleString('vi-VN')}`;
    return `$${n.toLocaleString('en-US')}`;
  };

  const adultSubtext = sessionPricing.adultNote ?? t('booking.adultAgeNote');
  const childSubtext = sessionPricing.childNote ?? t('booking.childAgeNote');

  return (
    <div className="flex flex-col gap-5 px-5 pt-5 pb-8">
      <div>
        <h2 className="text-[24px] font-bold text-[#111] tracking-tight leading-snug">{t('booking.whoIsJoining')}</h2>
        <p className="text-[14px] text-[#666] mt-1">{t('booking.setTravelDateAndGroupSize')}</p>
      </div>

      {/* Travel Date card */}
      <div className="bg-white border border-[#E5E5E5] rounded-[16px] px-5 py-5 shadow-sm">
        <p className="text-[10px] font-bold text-[#0F6E56] uppercase tracking-widest mb-2.5">
          {t('booking.travelDate')}
        </p>
        <DatePicker
          value={date ?? undefined}
          onChange={(d) => setDate(d ?? null)}
          disablePast
          placeholder="dd/mm/yyyy"
        />
      </div>

      {/* Session error */}
      {date && sessionPricing.sessionError && (
        <div className="bg-[#FFF3F3] border border-[#FFCDD2] rounded-[14px] px-5 py-4">
          <p className="text-[13px] font-medium text-[#C62828] leading-snug">{sessionPricing.sessionError}</p>
        </div>
      )}

      {/* Guest cards — only shown after date selection */}
      {date && !sessionPricing.sessionError && (
        <>
          {sessionPricing.isLoadingSession ? (
            <>
              <GuestCardSkeleton />
              <GuestCardSkeleton />
            </>
          ) : (
            <>
              {sessionPricing.isAdultAvailable && (
                <div className="bg-white border border-[#E5E5E5] rounded-[16px] px-5 py-5 flex items-center justify-between shadow-sm">
                  <div>
                    <p className="text-[15px] font-bold text-[#111]">{t('booking.adults')}</p>
                    <p className="text-[13px] text-[#888] mt-0.5">
                      {adultSubtext} &middot; {fmtPrice(sessionPricing.adultPrice)} {t('booking.perPerson')}
                    </p>
                  </div>
                  <GuestCounter
                    value={guests.adults}
                    min={0}
                    max={sessionPricing.adultMaxSlots}
                    onChange={(v) => setGuests({ ...guests, adults: v })}
                  />
                </div>
              )}

              {sessionPricing.isChildAvailable && (
                <div className="bg-white border border-[#E5E5E5] rounded-[16px] px-5 py-5 flex items-center justify-between shadow-sm">
                  <div>
                    <p className="text-[15px] font-bold text-[#111]">{t('booking.children')}</p>
                    <p className="text-[13px] text-[#888] mt-0.5">
                      {childSubtext} &middot; {fmtPrice(sessionPricing.childPrice)} {t('booking.perPerson')}
                    </p>
                  </div>
                  <GuestCounter
                    value={guests.children}
                    min={0}
                    max={sessionPricing.childMaxSlots}
                    onChange={(v) => setGuests({ ...guests, children: v })}
                  />
                </div>
              )}
            </>
          )}
        </>
      )}

      {/* Infant notice */}
      <div className="bg-[#EAF7F1] rounded-[14px] px-5 py-4 flex items-center gap-3">
        <span className="text-[18px] leading-none flex-shrink-0">&#x1F476;</span>
        <p className="text-[13px] font-medium text-[#0F6E56] leading-snug">{t('booking.infantFreeNotice')}</p>
      </div>
    </div>
  );
}
