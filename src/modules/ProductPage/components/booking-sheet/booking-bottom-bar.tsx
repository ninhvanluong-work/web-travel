import { useTranslation } from 'next-i18next';

import AlertBanner from '@/components/ui/AlertBanner';

interface BookingBottomBarProps {
  step: number;
  canContinue: boolean;
  isSavingBooking?: boolean;
  bookingError?: string | null;
  displayTotal: number;
  totalLabel: string;
  fmt: (n: number) => string;
  onNext: () => void;
  onBack: () => void;
}

export default function BookingBottomBar({
  step,
  canContinue,
  isSavingBooking,
  bookingError,
  displayTotal,
  totalLabel,
  fmt,
  onNext,
  onBack,
}: BookingBottomBarProps) {
  const { t } = useTranslation('productPage');
  const isDisabled = !canContinue || !!isSavingBooking;

  return (
    <div
      className="flex-shrink-0 bg-white border-t border-black/[0.07] px-4 pt-3 pb-4"
      style={{ paddingBottom: 'max(16px, env(safe-area-inset-bottom))' }}
    >
      {bookingError && (
        <div className="mb-3">
          <AlertBanner variant="error" title={t('booking.errorTitle')} message={bookingError} />
        </div>
      )}

      <div className="flex items-center gap-3">
        {step > 1 && (
          <button
            onClick={onBack}
            className="w-11 h-11 rounded-[12px] border border-[#E0E0E0] flex items-center justify-center text-[18px] text-[#444] flex-shrink-0"
          >
            ←
          </button>
        )}

        <div className="flex-1 min-w-0">
          <p className="text-[11px] text-[#999] leading-none">{totalLabel}</p>
          <p className="text-[20px] font-bold tabular-nums text-[#111] leading-tight mt-0.5">{fmt(displayTotal)}</p>
        </div>

        <button
          onClick={onNext}
          disabled={isDisabled}
          className="h-11 px-5 rounded-[14px] text-[14px] font-semibold flex items-center justify-center flex-shrink-0 transition-all"
          style={{
            background: isDisabled ? '#D1D1D1' : '#0F6E56',
            color: isDisabled ? '#999' : 'white',
          }}
        >
          {step !== 3 && t('booking.continue')}
          {step === 3 && (isSavingBooking ? t('booking.confirming') : t('booking.confirmBooking'))}
        </button>
      </div>
    </div>
  );
}
