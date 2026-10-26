import dayjs from 'dayjs';
import { useTranslation } from 'next-i18next';
import { useEffect, useId, useRef, useState } from 'react';

import { useBookingPayments } from '@/api/booking/queries';
import type { IBookingListItem } from '@/api/booking/types';
import { AdminConfirmDialog } from '@/components/ui/admin-confirm-dialog';
import AlertBanner from '@/components/ui/AlertBanner';
import { TextArea } from '@/components/ui/textarea';
import { useBookingCancelAction } from '@/hooks/use-booking-cancel-action';
import { normalizeText } from '@/lib/text-normalize';

const REASON_MAX = 500;

interface BookingCancelDialogProps {
  /** The booking to cancel; the dialog is open while this is set */
  booking: IBookingListItem | null;
  /** Already formatted total (same format as the drawer) */
  totalLabel: string;
  onClose: () => void;
  onCancelled: (booking: IBookingListItem) => void;
  onGone: () => void;
}

function SummaryRow({ label, value }: { label: string; value: string | null | undefined }) {
  return (
    <div className="flex items-center justify-between gap-4 text-xs">
      <span className="text-slate-500 shrink-0">{label}</span>
      <span className="font-semibold text-slate-800 dark:text-slate-100 truncate">{value || '—'}</span>
    </div>
  );
}

export function BookingCancelDialog({ booking, totalLabel, onClose, onCancelled, onGone }: BookingCancelDialogProps) {
  const { t } = useTranslation('adminPage');
  const reasonId = useId();
  const reasonRef = useRef<HTMLTextAreaElement>(null);
  const [reason, setReason] = useState('');

  const { cancel, isCancelling } = useBookingCancelAction({
    onCancelled: (cancelled) => {
      setReason('');
      onCancelled(cancelled);
    },
    onGone: () => {
      setReason('');
      onGone();
    },
  });

  const { data: payments } = useBookingPayments({
    variables: { bookingId: booking?.id ?? '' },
    enabled: !!booking,
  });
  const hasPendingPayment = !!payments?.some((p) => p.status === 'pending');

  // Start typing the reason right away (AlertDialog focuses the cancel button by default)
  useEffect(() => {
    if (!booking) return undefined;
    const timer = setTimeout(() => reasonRef.current?.focus(), 50);
    return () => clearTimeout(timer);
  }, [booking]);

  const normalizedReason = normalizeText(reason);

  const handleClose = () => {
    setReason('');
    onClose();
  };

  const handleConfirm = () => {
    if (!booking || !normalizedReason) return;
    cancel(booking.id, normalizedReason);
  };

  return (
    <AdminConfirmDialog
      open={!!booking}
      tone="danger"
      title={
        booking?.bookingCode
          ? t('admin.booking.cancel.title', { code: booking.bookingCode })
          : t('admin.booking.cancel.titleNoCode')
      }
      description={t('admin.booking.cancel.description')}
      confirmLabel={t('admin.booking.cancel.confirm')}
      cancelLabel={t('admin.booking.cancel.keep')}
      isPending={isCancelling}
      confirmDisabled={!normalizedReason}
      onConfirm={handleConfirm}
      onCancel={handleClose}
    >
      {booking ? (
        <div className="space-y-[16px]">
          <div className="rounded-xl border border-slate-100 bg-slate-50/70 p-[16px] space-y-2 dark:border-slate-800 dark:bg-slate-900/40">
            <SummaryRow label={t('bookingProduct')} value={booking.productName} />
            <SummaryRow
              label={t('bookingTravelDate')}
              value={booking.travelDate ? dayjs(booking.travelDate).format('DD/MM/YYYY') : null}
            />
            <SummaryRow label={t('bookingCustomer')} value={booking.username} />
            <SummaryRow label={t('bookingTotalPrice')} value={totalLabel} />
          </div>

          {hasPendingPayment ? (
            <AlertBanner
              variant="warning"
              title={t('admin.booking.cancel.pendingPaymentTitle')}
              message={t('admin.booking.cancel.pendingPaymentMessage')}
            />
          ) : null}

          <div className="space-y-1.5">
            <label htmlFor={reasonId} className="text-[13px] font-medium text-slate-500">
              {t('admin.booking.cancel.reasonLabel')} <span className="text-red-500">*</span>
            </label>
            <TextArea
              id={reasonId}
              ref={reasonRef}
              rows={3}
              value={reason}
              maxLength={REASON_MAX}
              disabled={isCancelling}
              placeholder={t('admin.booking.cancel.reasonPlaceholder')}
              onChange={(e) => setReason(e.target.value)}
            />
            <div className="flex items-center justify-between text-xs text-slate-400">
              <span>{normalizedReason ? null : t('admin.booking.cancel.reasonHint')}</span>
              <span>
                {reason.length}/{REASON_MAX}
              </span>
            </div>
          </div>
        </div>
      ) : null}
    </AdminConfirmDialog>
  );
}
