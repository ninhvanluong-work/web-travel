import { useTranslation } from 'next-i18next';

import { DatePicker } from '@/components/ui/date-picker';
import { useBookingStore } from '@/stores/BookingStore';

import { ContactInfoCard } from './contact-info-card';
import { GuestCardSkeleton, GuestCounter } from './guest-counter';
import { useSessionPricing } from './use-session-pricing';

interface StepInfoProps {
  adultPrice: number;
  currency: string;
  productId: string;
}

export default function StepInfo({ adultPrice, currency, productId }: StepInfoProps) {
  const { t } = useTranslation('productPage');

  const { date, setDate } = useSessionPricing(productId, adultPrice);
  const passengers = useBookingStore.use.passengers();
  const setPassengerCount = useBookingStore.use.setPassengerCount();
  const sessionPricing = useBookingStore.use.sessionPricing();

  const fmtPrice = (n: number) => {
    if (currency === '₫') return `₫${n.toLocaleString('vi-VN')}`;
    return `$${n.toLocaleString('en-US')}`;
  };

  return (
    <div className="flex flex-col gap-5 px-5 pt-5 pb-8">
      <div>
        <h2 className="text-[24px] font-bold text-[#111] tracking-tight leading-snug">{t('booking.whoIsJoining')}</h2>
        <p className="text-[14px] text-[#666] mt-1">{t('booking.setTravelDateAndGroupSize')}</p>
      </div>

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

      {date && sessionPricing.sessionError && (
        <div className="bg-[#FFF3F3] border border-[#FFCDD2] rounded-[14px] px-5 py-4">
          <p className="text-[13px] font-medium text-[#C62828] leading-snug">{sessionPricing.sessionError}</p>
        </div>
      )}

      {date && !sessionPricing.sessionError && (
        <>
          {sessionPricing.isLoadingSession ? (
            <>
              <GuestCardSkeleton />
              <GuestCardSkeleton />
            </>
          ) : (
            <>
              {sessionPricing.units.map((unit) => {
                const count = passengers[unit.unitId] ?? 0;
                const noteText = unit.note ?? '';
                const priceText = `${fmtPrice(unit.price)} ${t('booking.perPerson')}`;
                const subtext = noteText ? `${noteText} · ${priceText}` : priceText;

                return (
                  <div
                    key={unit.unitId}
                    className="bg-white border border-[#E5E5E5] rounded-[16px] px-5 py-5 flex items-center justify-between shadow-sm"
                  >
                    <div>
                      <p className="text-[15px] font-bold text-[#111]">{unit.name}</p>
                      <p className="text-[13px] text-[#888] mt-0.5">{subtext}</p>
                    </div>
                    <GuestCounter value={count} min={0} max={99} onChange={(v) => setPassengerCount(unit.unitId, v)} />
                  </div>
                );
              })}

              <ContactInfoCard />
            </>
          )}
        </>
      )}

      <div className="bg-[#EAF7F1] rounded-[14px] px-5 py-4 flex items-center gap-3">
        <span className="text-[18px] leading-none flex-shrink-0">&#x1F476;</span>
        <p className="text-[13px] font-medium text-[#0F6E56] leading-snug">{t('booking.infantFreeNotice')}</p>
      </div>
    </div>
  );
}
