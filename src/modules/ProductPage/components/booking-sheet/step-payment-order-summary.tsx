import { format } from 'date-fns';
import { useTranslation } from 'next-i18next';

interface StepPaymentOrderSummaryProps {
  productName: string;
  date: Date | null;
  guestLabel: string;
  totalFormatted: string;
}

export function StepPaymentOrderSummary({
  productName,
  date,
  guestLabel,
  totalFormatted,
}: StepPaymentOrderSummaryProps) {
  const { t } = useTranslation('productPage');

  return (
    <div className="bg-white border border-[#E5E5E5] rounded-[16px] overflow-hidden shadow-sm">
      <div className="px-5 py-3">
        <p className="text-[11px] font-bold text-[#0F6E56] uppercase tracking-widest">
          {t('booking.paymentOrderSummary')}
        </p>
      </div>
      <div className="flex items-center justify-between px-5 py-3">
        <span className="text-[14px] font-medium text-[#555] w-[70px] flex-shrink-0">{t('booking.tourLabel')}</span>
        <span className="text-[14px] font-semibold text-[#111] text-right">{productName}</span>
      </div>
      <div className="flex items-center justify-between px-5 py-3">
        <span className="text-[14px] font-medium text-[#555] w-[70px] flex-shrink-0">{t('booking.dateLabel')}</span>
        <span className="text-[14px] font-semibold text-[#111] text-right">
          {date ? format(date, 'EEE, MMM d, yyyy') : '—'}
        </span>
      </div>
      <div className="flex items-center justify-between px-5 py-3">
        <span className="text-[14px] font-medium text-[#555] w-[70px] flex-shrink-0">{t('booking.guestsLabel')}</span>
        <span className="text-[14px] font-semibold text-[#111] text-right">{guestLabel}</span>
      </div>
      <div className="flex items-center justify-between px-5 pt-2 pb-4">
        <span className="text-[14px] font-bold text-[#111]">{t('booking.paymentTotalDue')}</span>
        <span className="text-[18px] font-bold text-[#0F6E56]">{totalFormatted}</span>
      </div>
    </div>
  );
}
