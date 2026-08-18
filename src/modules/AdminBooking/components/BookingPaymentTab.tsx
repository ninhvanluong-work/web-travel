import dayjs from 'dayjs';
import { Check, Copy } from 'lucide-react';
import { useTranslation } from 'next-i18next';
import { useState } from 'react';

import { useBookingPaymentLogs, useBookingPayments } from '@/api/booking/queries';
import type { IBookingPayment, IBookingPaymentLog, PaymentStatus } from '@/api/booking/types';
import AlertBanner from '@/components/ui/AlertBanner';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { useCopy } from '@/hooks/useCopy';
import { cn } from '@/lib/utils';

// ── Helpers ──────────────────────────────────────────────────────────────────

function normalizeStatus(s: PaymentStatus): string {
  return s === 'succeed' ? 'succeeded' : s;
}

const STATUS_VARIANT: Record<string, 'success' | 'warning' | 'error' | 'secondary'> = {
  succeeded: 'success',
  pending: 'warning',
  failed: 'error',
  cancelled: 'secondary',
  refunded: 'secondary',
};

const PROVIDER_CLASS: Record<string, string> = {
  paypal: 'bg-blue-100 text-blue-700 border-blue-200 dark:bg-blue-900/30 dark:text-blue-300 dark:border-blue-800',
  vnpay: 'bg-red-100 text-red-700 border-red-200 dark:bg-red-900/30 dark:text-red-300 dark:border-red-800',
  stripe:
    'bg-purple-100 text-purple-700 border-purple-200 dark:bg-purple-900/30 dark:text-purple-300 dark:border-purple-800',
  cash: 'bg-gray-100 text-gray-600 border-gray-200 dark:bg-gray-800 dark:text-gray-300 dark:border-gray-700',
  bank_transfer: 'bg-gray-100 text-gray-600 border-gray-200 dark:bg-gray-800 dark:text-gray-300 dark:border-gray-700',
};

function providerClass(provider: string): string {
  return (
    PROVIDER_CLASS[provider] ??
    'bg-gray-100 text-gray-600 border-gray-200 dark:bg-gray-800 dark:text-gray-300 dark:border-gray-700'
  );
}

function formatAmount(price: string | number, currency: string): string {
  const num = Number(price);
  if (Number.isNaN(num)) return `${price} ${currency}`;
  if (currency === 'USD') return `$${num.toLocaleString('en-US', { minimumFractionDigits: 2 })} USD`;
  return `${new Intl.NumberFormat('vi-VN').format(num)} VND`;
}

// ── Sub-components ────────────────────────────────────────────────────────────

function CopyButton({ text, label }: { text: string; label: string }) {
  const [copied, copy] = useCopy(false);
  return (
    <button
      onClick={() => copy(text)}
      title={label}
      className="ml-1.5 inline-flex items-center text-gray-400 hover:text-gray-600 dark:hover:text-gray-200 transition-colors"
    >
      {copied ? <Check size={12} className="text-green-500" /> : <Copy size={12} />}
    </button>
  );
}

function RawResponseViewer({ raw }: { raw: Record<string, unknown> }) {
  const { t } = useTranslation('adminPage');
  const [open, setOpen] = useState(false);
  const [copied, copy] = useCopy(false);
  const json = JSON.stringify(raw, null, 2);

  return (
    <div className="mt-2">
      <button
        onClick={() => setOpen((v) => !v)}
        className="text-xs text-gray-400 hover:text-gray-600 dark:hover:text-gray-200 underline underline-offset-2 transition-colors"
      >
        {open ? t('admin.booking.payment.rawResponse.hide') : t('admin.booking.payment.rawResponse')}
      </button>
      {open && (
        <div className="relative mt-2 max-h-[300px] overflow-y-auto bg-slate-950 text-slate-100 rounded-lg p-3 font-mono text-xs">
          <button
            onClick={() => copy(json)}
            title={t('admin.booking.payment.copy')}
            className="absolute top-2 right-2 text-slate-400 hover:text-slate-100 transition-colors"
          >
            {copied ? <Check size={12} className="text-green-400" /> : <Copy size={12} />}
          </button>
          <pre className="pr-6 whitespace-pre-wrap break-all">{json}</pre>
        </div>
      )}
    </div>
  );
}

function TimelineEntry({ log }: { log: IBookingPaymentLog }) {
  const { t } = useTranslation('adminPage');
  const fromNorm = normalizeStatus(log.fromStatus);
  const toNorm = normalizeStatus(log.toStatus);

  return (
    <div className="relative pl-6 pb-5 last:pb-0">
      <span className="absolute left-0 top-1.5 h-2.5 w-2.5 rounded-full border-2 border-white dark:border-gray-900 bg-gray-300 dark:bg-gray-600 ring-1 ring-gray-200 dark:ring-gray-700" />
      <div className="absolute left-[4.5px] top-4 bottom-0 w-px bg-gray-100 dark:bg-gray-800 last:hidden" />

      <p className="text-[11px] text-gray-400 tabular-nums">{dayjs(log.createdAt).format('DD/MM/YYYY HH:mm:ss')}</p>

      <div className="mt-1 flex flex-wrap items-center gap-1.5">
        <Badge variant={STATUS_VARIANT[fromNorm] ?? 'secondary'} className="text-[10px]">
          {t(`admin.booking.payment.status.${fromNorm}`, { defaultValue: fromNorm })}
        </Badge>
        <span className="text-xs text-gray-400">→</span>
        <Badge variant={STATUS_VARIANT[toNorm] ?? 'secondary'} className="text-[10px]">
          {t(`admin.booking.payment.status.${toNorm}`, { defaultValue: toNorm })}
        </Badge>
      </div>

      <div className="mt-1.5 flex items-center gap-1.5">
        <span className="text-[10px] text-gray-400">{t('admin.booking.payment.source')}:</span>
        <span className="inline-flex items-center rounded border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-white/[0.04] px-1.5 py-0.5 font-mono text-[10px] text-gray-600 dark:text-gray-300">
          {log.source}
        </span>
        {log.providerTxId && (
          <span className="ml-auto font-mono text-[10px] text-gray-500 dark:text-gray-400">{log.providerTxId}</span>
        )}
      </div>

      {log.reason && <p className="mt-1 text-xs text-gray-500 dark:text-gray-400 italic">{log.reason}</p>}

      {log.rawResponse && <RawResponseViewer raw={log.rawResponse} />}
    </div>
  );
}

function PaymentAuditTimeline({ paymentId }: { paymentId: string }) {
  const { data: logs, isLoading } = useBookingPaymentLogs({
    variables: { paymentId },
    enabled: !!paymentId,
  });

  if (isLoading) {
    return (
      <div className="space-y-2 mt-3">
        <Skeleton className="h-3 w-24" />
        <Skeleton className="h-3 w-full" />
        <Skeleton className="h-3 w-3/4" />
      </div>
    );
  }

  if (!logs || logs.length === 0) return null;

  return (
    <div className="mt-4 border-t border-gray-100 dark:border-gray-800 pt-4">
      <p className="text-[10px] font-semibold uppercase tracking-widest text-gray-400 mb-3">Timeline</p>
      <div>
        {logs.map((log) => (
          <TimelineEntry key={log.id} log={log} />
        ))}
      </div>
    </div>
  );
}

function PaymentCard({ payment }: { payment: IBookingPayment }) {
  const { t } = useTranslation('adminPage');
  const status = normalizeStatus(payment.status);

  return (
    <div className="rounded-2xl border border-slate-100 dark:border-slate-800/80 bg-slate-50/60 dark:bg-slate-900/30 p-5 space-y-3.5 shadow-sm hover:shadow-md transition-shadow duration-200">
      <div className="flex items-center justify-between gap-2 flex-wrap">
        <div className="flex items-center gap-2">
          <span
            className={cn(
              'inline-flex items-center rounded-full border px-2.5 py-0.5 text-[10px] font-bold uppercase tracking-wide',
              providerClass(payment.provider)
            )}
          >
            {payment.provider}
          </span>
          <Badge variant={STATUS_VARIANT[status] ?? 'secondary'} className="text-[10px]">
            {t(`admin.booking.payment.status.${status}`, { defaultValue: status })}
          </Badge>
        </div>
        <span className="text-[11px] text-slate-400 dark:text-slate-500 font-normal">
          {dayjs(payment.createdAt).format('DD/MM/YYYY HH:mm')}
        </span>
      </div>

      <div className="py-1">
        <p className="text-2xl font-black text-slate-900 dark:text-white tracking-tight">
          {formatAmount(payment.price, payment.currency)}
        </p>
      </div>

      <div className="space-y-2 text-xs pt-2.5 border-t border-slate-200/60 dark:border-slate-800">
        {payment.providerTxId && (
          <div className="flex items-center justify-between gap-2">
            <span className="text-slate-400 shrink-0 font-medium">{t('admin.booking.payment.txId')}:</span>
            <div className="flex items-center gap-1 min-w-0">
              <span className="font-mono text-slate-700 dark:text-slate-200 truncate font-semibold">
                {payment.providerTxId}
              </span>
              <CopyButton text={payment.providerTxId} label={t('admin.booking.payment.copy')} />
            </div>
          </div>
        )}
        {payment.providerIntentId && (
          <div className="flex items-center justify-between gap-2">
            <span className="text-slate-400 shrink-0 font-medium">{t('admin.booking.payment.intentId')}:</span>
            <div className="flex items-center gap-1 min-w-0">
              <span className="font-mono text-slate-700 dark:text-slate-200 truncate font-semibold">
                {payment.providerIntentId}
              </span>
              <CopyButton text={payment.providerIntentId} label={t('admin.booking.payment.copy')} />
            </div>
          </div>
        )}
      </div>

      {payment.failureReason && (
        <AlertBanner variant="error" title={t('admin.booking.payment.failureReason')} message={payment.failureReason} />
      )}

      <PaymentAuditTimeline paymentId={payment.id} />
    </div>
  );
}

function PaymentSkeleton() {
  return (
    <div className="space-y-5">
      {[0, 1].map((i) => (
        <div key={i} className="rounded-2xl border border-gray-100 dark:border-gray-800 p-5 space-y-3">
          <div className="flex gap-2">
            <Skeleton className="h-5 w-16 rounded-full" />
            <Skeleton className="h-5 w-16 rounded-full" />
          </div>
          <Skeleton className="h-8 w-36" />
          <Skeleton className="h-3 w-full" />
          <Skeleton className="h-3 w-3/4" />
        </div>
      ))}
    </div>
  );
}

// ── Main component ────────────────────────────────────────────────────────────

interface BookingPaymentTabProps {
  bookingId: string;
}

export function BookingPaymentTab({ bookingId }: BookingPaymentTabProps) {
  const { t } = useTranslation('adminPage');
  const {
    data: payments,
    isLoading,
    isError,
  } = useBookingPayments({
    variables: { bookingId },
    enabled: !!bookingId,
  });

  if (isLoading) return <PaymentSkeleton />;

  if (isError) {
    return (
      <AlertBanner
        variant="error"
        title={t('admin.booking.payment.error.title')}
        message={t('admin.booking.payment.error.message')}
      />
    );
  }

  if (!payments || payments.length === 0) {
    return <div className="py-10 text-center text-sm text-gray-400">{t('admin.booking.payment.empty')}</div>;
  }

  const sorted = [...payments].sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
  const succeededFirst = [
    ...sorted.filter((p) => normalizeStatus(p.status) === 'succeeded'),
    ...sorted.filter((p) => normalizeStatus(p.status) !== 'succeeded'),
  ];

  return (
    <div className="space-y-5 pb-2">
      {succeededFirst.map((payment) => (
        <PaymentCard key={payment.id} payment={payment} />
      ))}
    </div>
  );
}
