import { useQueryClient } from '@tanstack/react-query';
import { format } from 'date-fns';
import { AlertCircle, CalendarRange, CheckCircle2 } from 'lucide-react';
import { useTranslation } from 'next-i18next';
import { useState } from 'react';

import type { ApiProductUnit } from '@/api/product/booking-config-types';
import { useCreateSessionRange } from '@/api/session';
import AlertBanner from '@/components/ui/AlertBanner';
import { DatePicker } from '@/components/ui/date-picker';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { PriceInput } from '@/components/ui/price-input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useAlertStore } from '@/stores/use-alert-store';

interface Props {
  open: boolean;
  productId: string;
  units: ApiProductUnit[];
  onClose: () => void;
}

export function CreateSessionRangeModal({ open, productId, units, onClose }: Props) {
  const { t } = useTranslation('adminPage');
  const queryClient = useQueryClient();
  const { mutate, isLoading } = useCreateSessionRange();

  const [fromDate, setFromDate] = useState<Date | undefined>();
  const [toDate, setToDate] = useState<Date | undefined>();
  const [status, setStatus] = useState<'active' | 'inactive'>('active');
  const [prices, setPrices] = useState<Record<string, number>>({});
  const [error, setError] = useState<string | null>(null);
  const [result, setResult] = useState<{ created: number; skipped: number } | null>(null);

  function reset() {
    setFromDate(undefined);
    setToDate(undefined);
    setStatus('active');
    setPrices({});
    setError(null);
    setResult(null);
  }

  function handleClose() {
    reset();
    onClose();
  }

  const rangeDays =
    fromDate && toDate && fromDate <= toDate
      ? Math.floor((toDate.getTime() - fromDate.getTime()) / (1000 * 60 * 60 * 24)) + 1
      : 0;

  const isExceedingRange = rangeDays > 366;
  const isValid = fromDate && toDate && fromDate <= toDate && !isExceedingRange;

  function handleSubmit() {
    if (!fromDate || !toDate || !isValid) return;
    setError(null);
    setResult(null);

    const from = format(fromDate, 'yyyy-MM-dd');
    const to = format(toDate, 'yyyy-MM-dd');
    const sessionUnits = units.map((u) => ({ unitId: u.id, price: prices[u.id] ?? 0 }));

    mutate(
      {
        productId,
        fromDate: from,
        toDate: to,
        status,
        sessionUnits: sessionUnits.length > 0 ? sessionUnits : undefined,
      },
      {
        onSuccess: (sessions) => {
          queryClient.invalidateQueries({ queryKey: ['/session'] });
          const created = sessions.length;
          const skipped = Math.max(0, rangeDays - created);
          setResult({ created, skipped });
          if (created > 0) {
            useAlertStore.getState().addAlert({
              type: 'success',
              title: t('sessionCreateRangeSuccess', { count: created }),
            });
          }
        },
        onError: (err: any) => {
          const errStatus = err?.response?.status;
          const msg = err?.response?.data?.message;
          const text = Array.isArray(msg) ? msg.join(', ') : msg ?? t('genericError');
          if (errStatus === 409) {
            setError(`${t('sessionRangeConflict')}. ${text}`);
          } else {
            setError(text);
          }
        },
      }
    );
  }

  return (
    <Dialog open={open} onOpenChange={(o) => !o && handleClose()}>
      <DialogContent className="max-w-md rounded-2xl p-6">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2 text-lg font-bold text-slate-800">
            <CalendarRange className="h-5 w-5 text-brand-600" />
            <span>{t('sessionModalRangeTitle')}</span>
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-4 py-2">
          {error && <AlertBanner variant="error" title={t('genericError')} message={error} />}

          {result && (
            <AlertBanner
              variant="success"
              title={t('sessionCreateRangeSuccess', { count: result.created })}
              message={result.skipped > 0 ? t('sessionSkipped', { count: result.skipped }) : ''}
            />
          )}

          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1.5">
              <label className="text-xs font-semibold uppercase tracking-wider text-slate-600">
                {t('sessionFromDate')} *
              </label>
              <DatePicker value={fromDate} onChange={setFromDate} placeholder="DD/MM/YYYY" />
            </div>
            <div className="space-y-1.5">
              <label className="text-xs font-semibold uppercase tracking-wider text-slate-600">
                {t('sessionToDate')} *
              </label>
              <DatePicker value={toDate} onChange={setToDate} placeholder="DD/MM/YYYY" />
            </div>
          </div>

          {fromDate && toDate && fromDate > toDate && (
            <div className="flex items-center gap-2 rounded-xl bg-rose-50/80 border border-rose-200/80 px-3.5 py-2.5 text-xs font-medium text-rose-600">
              <AlertCircle size={15} className="shrink-0 text-rose-500" />
              <span>{t('sessionDateOrderError')}</span>
            </div>
          )}

          {isExceedingRange && (
            <div className="flex items-center gap-2 rounded-xl bg-rose-50/80 border border-rose-200/80 px-3.5 py-2.5 text-xs font-medium text-rose-600">
              <AlertCircle size={15} className="shrink-0 text-rose-500" />
              <span>{t('sessionRangeLimitError')}</span>
            </div>
          )}

          {isValid && rangeDays > 0 && (
            <div className="flex items-center justify-between rounded-xl bg-emerald-50/70 border border-emerald-200/70 px-3.5 py-2.5 text-xs text-emerald-800">
              <div className="flex items-center gap-2 font-medium">
                <CheckCircle2 size={15} className="text-emerald-600 shrink-0" />
                <span>{t('sessionRangePreview')}</span>
              </div>
              <span className="font-bold text-emerald-700 bg-emerald-100/80 px-2 py-0.5 rounded-md">
                {rangeDays} {t('sessionsUnit')}
              </span>
            </div>
          )}

          <div className="space-y-1.5">
            <label
              htmlFor="range-session-status"
              className="text-xs font-semibold uppercase tracking-wider text-slate-600"
            >
              {t('sessionColStatus')}
            </label>
            <Select value={status} onValueChange={(v) => setStatus(v as 'active' | 'inactive')}>
              <SelectTrigger id="range-session-status" className="w-full rounded-xl">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="active">{t('sessionActive')}</SelectItem>
                <SelectItem value="inactive">{t('sessionInactive')}</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {units.length > 0 ? (
            <div className="space-y-2 pt-1">
              <p className="text-xs font-semibold uppercase tracking-wider text-slate-600">{t('sessionUnitPrices')}</p>
              <div className="rounded-xl border border-slate-200/80 bg-slate-50/50 p-3 space-y-2.5">
                {units.map((u) => (
                  <div key={u.id} className="flex items-center gap-3">
                    <span className="text-sm font-medium text-slate-700 w-28 shrink-0 truncate">{u.name}</span>
                    <PriceInput value={prices[u.id] ?? 0} onChange={(v) => setPrices((p) => ({ ...p, [u.id]: v }))} />
                  </div>
                ))}
              </div>
              <p className="text-[11px] text-slate-400 italic px-1">{t('sessionRangePriceNote')}</p>
            </div>
          ) : (
            <p className="text-xs text-slate-400 italic bg-slate-50 p-3 rounded-xl border border-dashed border-slate-200 text-center">
              {t('sessionNoUnits')}
            </p>
          )}
        </div>

        <div className="flex items-center justify-end gap-2.5 pt-3 border-t border-slate-100 mt-2">
          <button
            type="button"
            onClick={handleClose}
            disabled={isLoading}
            className="h-9 px-4 rounded-xl text-slate-600 hover:text-slate-900 hover:bg-slate-100 font-medium text-xs sm:text-sm transition-all cursor-pointer disabled:opacity-50"
          >
            {t('sessionCancel')}
          </button>
          <button
            type="button"
            onClick={handleSubmit}
            disabled={!isValid || isLoading}
            className="h-9 px-5 rounded-xl bg-brand-600 hover:bg-brand-700 active:scale-95 text-white font-semibold text-xs sm:text-sm shadow-sm flex items-center justify-center transition-all cursor-pointer disabled:opacity-50"
          >
            {isLoading ? '…' : t('sessionSubmit')}
          </button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
