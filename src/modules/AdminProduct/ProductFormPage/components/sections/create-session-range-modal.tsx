import { useQueryClient } from '@tanstack/react-query';
import { eachDayOfInterval, format, getDay } from 'date-fns';
import { AlertCircle, CalendarRange, RefreshCw, Shield } from 'lucide-react';
import { useTranslation } from 'next-i18next';
import { useState } from 'react';

import type { ApiProductUnit } from '@/api/product/booking-config-types';
import { useCreateSessionRange } from '@/api/session';
import type { DuplicateStrategyType } from '@/api/session/types';
import AlertBanner from '@/components/ui/AlertBanner';
import { DatePicker } from '@/components/ui/date-picker';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { PriceInput } from '@/components/ui/price-input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useAlertStore } from '@/stores/use-alert-store';

// Spec encoding: 1=Mon … 7=Sun
const WEEKDAY_ORDER = [1, 2, 3, 4, 5, 6, 7] as const;
const WEEKDAY_KEY: Record<number, string> = {
  1: 'sessionWeekMon',
  2: 'sessionWeekTue',
  3: 'sessionWeekWed',
  4: 'sessionWeekThu',
  5: 'sessionWeekFri',
  6: 'sessionWeekSat',
  7: 'sessionWeekSun',
};

// specDay (1–7) → JS getDay() (0–6): Sunday spec=7 maps to JS 0
function specToJsDay(specDay: number): number {
  return specDay === 7 ? 0 : specDay;
}

function computeTargetDates(from: Date, to: Date, weekdays: number[]): string[] {
  if (from > to || weekdays.length === 0) return [];
  const jsSet = new Set(weekdays.map(specToJsDay));
  return eachDayOfInterval({ start: from, end: to })
    .filter((d) => jsSet.has(getDay(d)))
    .map((d) => format(d, 'yyyy-MM-dd'));
}

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
  const [selectedWeekdays, setSelectedWeekdays] = useState<number[]>([1, 2, 3, 4, 5, 6, 7]);
  const [status, setStatus] = useState<'active' | 'inactive'>('active');
  const [duplicateStrategy, setDuplicateStrategy] = useState<DuplicateStrategyType>('skip');
  const [prices, setPrices] = useState<Record<string, number>>({});
  const [error, setError] = useState<string | null>(null);

  const rangeValid = !!(fromDate && toDate && fromDate <= toDate);
  const rangeDays = rangeValid ? Math.floor((toDate!.getTime() - fromDate!.getTime()) / (1000 * 60 * 60 * 24)) + 1 : 0;
  const isExceedingRange = rangeDays > 366;
  const isValidRange = rangeValid && !isExceedingRange;

  const targetDates = isValidRange ? computeTargetDates(fromDate!, toDate!, selectedWeekdays) : [];

  const allWeekChecked = selectedWeekdays.length === 7;

  function toggleAllWeek(checked: boolean) {
    setSelectedWeekdays(checked ? [1, 2, 3, 4, 5, 6, 7] : []);
  }

  function toggleWeekday(day: number) {
    setSelectedWeekdays((prev) => (prev.includes(day) ? prev.filter((d) => d !== day) : [...prev, day]));
  }

  function reset() {
    setFromDate(undefined);
    setToDate(undefined);
    setSelectedWeekdays([1, 2, 3, 4, 5, 6, 7]);
    setStatus('active');
    setDuplicateStrategy('skip');
    setPrices({});
    setError(null);
  }

  function handleClose() {
    reset();
    onClose();
  }

  function handleSubmit() {
    if (!isValidRange || targetDates.length === 0) return;
    setError(null);

    const isAllWeek = selectedWeekdays.length === 7;
    const sessionUnits = units.map((u) => ({ unitId: u.id, price: prices[u.id] ?? 0 }));

    mutate(
      {
        productId,
        fromDate: format(fromDate!, 'yyyy-MM-dd'),
        toDate: format(toDate!, 'yyyy-MM-dd'),
        status,
        duplicateStrategy,
        ...(isAllWeek ? {} : { daysOfWeek: selectedWeekdays.slice().sort((a, b) => a - b) }),
        sessionUnits: sessionUnits.length > 0 ? sessionUnits : undefined,
      },
      {
        onSuccess: (sessions) => {
          queryClient.invalidateQueries({ queryKey: ['/session'] });
          useAlertStore.getState().addAlert({
            type: 'success',
            title: t('sessionCreateRangeSuccess', { count: sessions.length }),
          });
          handleClose();
        },
        onError: (err: any) => {
          const msg = err?.response?.data?.message;
          const text = Array.isArray(msg) ? msg.join(', ') : msg ?? t('genericError');
          setError(text);
        },
      }
    );
  }

  return (
    <Dialog open={open} onOpenChange={(o) => !o && handleClose()}>
      <DialogContent className="max-w-2xl rounded-2xl p-0 max-h-[88vh] flex flex-col">
        <DialogHeader className="px-6 pt-5 pb-4 border-b border-slate-100 shrink-0">
          <DialogTitle className="flex items-center gap-2 text-lg font-bold text-slate-800">
            <CalendarRange className="h-5 w-5 text-brand-600" />
            <span>{t('sessionModalRangeTitle')}</span>
          </DialogTitle>
        </DialogHeader>

        <div className="flex-1 overflow-y-auto px-6 py-4 space-y-5">
          {error && <AlertBanner variant="error" title={t('genericError')} message={error} />}

          {/* ── 1. Date range ─────────────────────────────────────── */}
          <section className="space-y-2">
            <p className="text-[11px] font-bold uppercase tracking-wider text-slate-400">
              1. {t('sessionFromDate')} → {t('sessionToDate')}
            </p>
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1">
                <label className="text-xs font-medium text-slate-600">{t('sessionFromDate')} *</label>
                <DatePicker value={fromDate} onChange={setFromDate} placeholder="DD/MM/YYYY" />
              </div>
              <div className="space-y-1">
                <label className="text-xs font-medium text-slate-600">{t('sessionToDate')} *</label>
                <DatePicker value={toDate} onChange={setToDate} placeholder="DD/MM/YYYY" />
              </div>
            </div>

            {fromDate && toDate && fromDate > toDate && (
              <div className="flex items-center gap-2 rounded-xl bg-rose-50 border border-rose-200 px-3 py-2 text-xs font-medium text-rose-600">
                <AlertCircle size={13} className="shrink-0" />
                {t('sessionDateOrderError')}
              </div>
            )}
            {isExceedingRange && (
              <div className="flex items-center gap-2 rounded-xl bg-rose-50 border border-rose-200 px-3 py-2 text-xs font-medium text-rose-600">
                <AlertCircle size={13} className="shrink-0" />
                {t('sessionRangeLimitError')}
              </div>
            )}
          </section>

          {/* ── 2. Weekday filter ─────────────────────────────────── */}
          <section className="space-y-2">
            <p className="text-[11px] font-bold uppercase tracking-wider text-slate-400">2. {t('sessionWeekdays')}</p>
            <div className="rounded-xl border border-slate-200 bg-slate-50/40 p-3 space-y-3">
              <label className="flex items-center gap-2 cursor-pointer select-none">
                <input
                  type="checkbox"
                  checked={allWeekChecked}
                  onChange={(e) => toggleAllWeek(e.target.checked)}
                  className="w-3.5 h-3.5 rounded accent-brand-600"
                />
                <span className="text-xs font-semibold text-slate-700">{t('sessionAllWeek')}</span>
              </label>

              <div className="grid grid-cols-7 gap-1.5">
                {WEEKDAY_ORDER.map((day) => {
                  const active = selectedWeekdays.includes(day);
                  return (
                    <label
                      key={day}
                      className={`flex flex-col items-center gap-1 cursor-pointer select-none px-1 py-2 rounded-lg border text-center transition-colors ${
                        active
                          ? 'bg-brand-50 border-brand-300 text-brand-700'
                          : 'bg-white border-slate-200 text-slate-500 hover:border-slate-300'
                      }`}
                    >
                      <input
                        type="checkbox"
                        checked={active}
                        onChange={() => toggleWeekday(day)}
                        className="w-3 h-3 accent-brand-600"
                      />
                      <span className="text-[10px] font-semibold leading-none">{t(WEEKDAY_KEY[day])}</span>
                    </label>
                  );
                })}
              </div>
              <p className="text-[10px] text-slate-400 italic">{t('sessionWeekNote')}</p>
            </div>

            {isValidRange && selectedWeekdays.length === 0 && (
              <div className="flex items-center gap-1.5 rounded-lg bg-rose-50 border border-rose-200 px-2.5 py-1.5 text-[11px] font-medium text-rose-600">
                <AlertCircle size={12} className="shrink-0" />
                {t('sessionWeekNote')}
              </div>
            )}
            {isValidRange && selectedWeekdays.length > 0 && (
              <div className="flex items-center gap-1.5 rounded-lg bg-emerald-50 border border-emerald-200 px-2.5 py-1.5 text-[11px] text-emerald-800">
                <span className="font-medium">{t('sessionEstimatedNew')}</span>
                <span className="font-bold bg-emerald-100 px-1.5 py-0.5 rounded">{targetDates.length}</span>
              </div>
            )}
          </section>

          {/* ── 3. Duplicate strategy ─────────────────────────────── */}
          <section className="space-y-2">
            <p className="text-[11px] font-bold uppercase tracking-wider text-slate-400">
              3. {t('sessionDuplicateStrategyTitle')}
            </p>
            <div className="grid grid-cols-2 gap-3">
              <button
                type="button"
                onClick={() => setDuplicateStrategy('skip')}
                className={`flex flex-col gap-1.5 rounded-xl border p-3 text-left transition-colors ${
                  duplicateStrategy === 'skip'
                    ? 'border-brand-400 bg-brand-50 ring-1 ring-brand-300'
                    : 'border-slate-200 bg-white hover:border-slate-300'
                }`}
              >
                <span className="flex items-center gap-1.5 text-xs font-semibold text-slate-700">
                  <Shield size={14} className="text-slate-500 shrink-0" />
                  {t('sessionDuplicateSkipLabel')}
                </span>
                <span className="text-[10px] text-slate-500 leading-snug">{t('sessionDuplicateSkipDesc')}</span>
              </button>

              <button
                type="button"
                onClick={() => setDuplicateStrategy('overwrite')}
                className={`flex flex-col gap-1.5 rounded-xl border p-3 text-left transition-colors ${
                  duplicateStrategy === 'overwrite'
                    ? 'border-amber-400 bg-amber-50 ring-1 ring-amber-300'
                    : 'border-slate-200 bg-white hover:border-slate-300'
                }`}
              >
                <span className="flex items-center gap-1.5 text-xs font-semibold text-slate-700">
                  <RefreshCw size={14} className="text-amber-500 shrink-0" />
                  {t('sessionDuplicateOverwriteLabel')}
                </span>
                <span className="text-[10px] text-slate-500 leading-snug">{t('sessionDuplicateOverwriteDesc')}</span>
              </button>
            </div>
          </section>

          {/* ── 4. Session status ─────────────────────────────────── */}
          <section className="space-y-2">
            <p className="text-[11px] font-bold uppercase tracking-wider text-slate-400">4. {t('sessionColStatus')}</p>
            <Select value={status} onValueChange={(v) => setStatus(v as 'active' | 'inactive')}>
              <SelectTrigger className="w-full rounded-xl text-xs">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="active">{t('sessionActive')}</SelectItem>
                <SelectItem value="inactive">{t('sessionInactive')}</SelectItem>
              </SelectContent>
            </Select>
          </section>

          {/* ── 5. Unit prices ────────────────────────────────────── */}
          <section className="space-y-3">
            <p className="text-[11px] font-bold uppercase tracking-wider text-slate-400">5. {t('sessionUnitPrices')}</p>
            {units.length > 0 ? (
              <div className="rounded-xl border border-slate-200/80 bg-slate-50/50 p-3 space-y-2.5">
                {units.map((u) => (
                  <div key={u.id} className="flex items-center gap-3">
                    <span className="text-sm font-medium text-slate-700 w-28 shrink-0 truncate">{u.name}</span>
                    <PriceInput value={prices[u.id] ?? 0} onChange={(v) => setPrices((p) => ({ ...p, [u.id]: v }))} />
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-xs text-slate-400 italic bg-slate-50 p-3 rounded-xl border border-dashed border-slate-200 text-center">
                {t('sessionNoUnits')}
              </p>
            )}
            <p className="text-[11px] text-slate-400 italic px-0.5">{t('sessionRangePriceNote')}</p>
          </section>
        </div>

        {/* ── Footer ──────────────────────────────────────────────── */}
        <div className="flex items-center justify-end gap-2.5 px-6 py-4 border-t border-slate-100 shrink-0">
          <button
            type="button"
            onClick={handleClose}
            disabled={isLoading}
            className="h-9 px-4 rounded-xl text-slate-600 hover:text-slate-900 hover:bg-slate-100 font-medium text-sm transition-all cursor-pointer disabled:opacity-50"
          >
            {t('sessionCancel')}
          </button>
          <button
            type="button"
            onClick={handleSubmit}
            disabled={!isValidRange || isLoading || targetDates.length === 0}
            className="h-9 px-5 rounded-xl bg-brand-600 hover:bg-brand-700 active:scale-95 text-white font-semibold text-sm shadow-sm flex items-center justify-center transition-all cursor-pointer disabled:opacity-50"
          >
            {isLoading ? '…' : t('sessionApplyRange')}
          </button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
