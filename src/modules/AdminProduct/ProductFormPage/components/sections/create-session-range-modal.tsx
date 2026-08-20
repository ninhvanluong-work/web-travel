import { useQueryClient } from '@tanstack/react-query';
import { eachDayOfInterval, format, getDay } from 'date-fns';
import { AlertCircle, CalendarRange, CheckCircle2 } from 'lucide-react';
import { useTranslation } from 'next-i18next';
import { useState } from 'react';

import type { ApiProductUnit } from '@/api/product/booking-config-types';
import { useCreateSessionRange, useSessionList } from '@/api/session';
import AlertBanner from '@/components/ui/AlertBanner';
import { DatePicker } from '@/components/ui/date-picker';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { PriceInput } from '@/components/ui/price-input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useAlertStore } from '@/stores/use-alert-store';

// Display order: Mon→Sun (JS day values: 1-6, 0)
const WEEKDAY_ORDER = [1, 2, 3, 4, 5, 6, 0] as const;
const WEEKDAY_KEY: Record<number, string> = {
  0: 'sessionWeekSun',
  1: 'sessionWeekMon',
  2: 'sessionWeekTue',
  3: 'sessionWeekWed',
  4: 'sessionWeekThu',
  5: 'sessionWeekFri',
  6: 'sessionWeekSat',
};
const DAY_LABEL_VI = ['CN', 'T2', 'T3', 'T4', 'T5', 'T6', 'T7'];

function computeTargetDates(from: Date, to: Date, weekdays: number[]): string[] {
  if (from > to || weekdays.length === 0) return [];
  const wdSet = new Set(weekdays);
  return eachDayOfInterval({ start: from, end: to })
    .filter((d) => wdSet.has(getDay(d)))
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
  const [selectedWeekdays, setSelectedWeekdays] = useState<number[]>([0, 1, 2, 3, 4, 5, 6]);
  const [status, setStatus] = useState<'active' | 'inactive'>('active');
  const [capacity, setCapacity] = useState('');
  const [prices, setPrices] = useState<Record<string, number>>({});
  const [conflictActions, setConflictActions] = useState<Record<string, 'skip' | 'overwrite'>>({});
  const [error, setError] = useState<string | null>(null);
  const [result, setResult] = useState<{ created: number; skipped: number } | null>(null);

  const rangeValid = !!(fromDate && toDate && fromDate <= toDate);
  const rangeDays = rangeValid ? Math.floor((toDate!.getTime() - fromDate!.getTime()) / (1000 * 60 * 60 * 24)) + 1 : 0;
  const isExceedingRange = rangeDays > 366;
  const isValidRange = rangeValid && !isExceedingRange;

  const fromDateStr = fromDate ? format(fromDate, 'yyyy-MM-dd') : undefined;
  const toDateStr = toDate ? format(toDate, 'yyyy-MM-dd') : undefined;

  // Fetch existing sessions in range for conflict detection
  const { data: existingData, isLoading: isCheckingConflicts } = useSessionList({
    variables: { productId, fromDate: fromDateStr!, toDate: toDateStr!, pageSize: 366 },
    enabled: isValidRange,
  });

  const targetDates = isValidRange ? computeTargetDates(fromDate!, toDate!, selectedWeekdays) : [];
  const existingDateSet = new Set(existingData?.items.map((s) => s.travelDate) ?? []);
  const conflictDates = targetDates.filter((d) => existingDateSet.has(d));
  const newDateCount = targetDates.length - conflictDates.length;

  // Conflict actions with safe 'skip' default
  const getAction = (date: string): 'skip' | 'overwrite' => conflictActions[date] ?? 'skip';
  const allSkip = conflictDates.length > 0 && conflictDates.every((d) => getAction(d) === 'skip');
  const allOverwrite = conflictDates.length > 0 && conflictDates.every((d) => getAction(d) === 'overwrite');

  function setAllAction(action: 'skip' | 'overwrite') {
    const next: Record<string, 'skip' | 'overwrite'> = {};
    conflictDates.forEach((d) => {
      next[d] = action;
    });
    setConflictActions(next);
  }

  // Weekday helpers
  const allWeekChecked = selectedWeekdays.length === 7;

  function toggleAllWeek(checked: boolean) {
    setSelectedWeekdays(checked ? [0, 1, 2, 3, 4, 5, 6] : []);
  }

  function toggleWeekday(day: number) {
    setSelectedWeekdays((prev) => (prev.includes(day) ? prev.filter((d) => d !== day) : [...prev, day]));
  }

  function reset() {
    setFromDate(undefined);
    setToDate(undefined);
    setSelectedWeekdays([0, 1, 2, 3, 4, 5, 6]);
    setStatus('active');
    setCapacity('');
    setPrices({});
    setConflictActions({});
    setError(null);
    setResult(null);
  }

  function handleClose() {
    reset();
    onClose();
  }

  function handleSubmit() {
    if (!isValidRange || targetDates.length === 0) return;
    setError(null);
    setResult(null);

    const sessionUnits = units.map((u) => ({ unitId: u.id, price: prices[u.id] ?? 0 }));
    const overrides = conflictDates.map((d) => ({ date: d, action: getAction(d) }));

    mutate(
      {
        productId,
        fromDate: fromDateStr!,
        toDate: toDateStr!,
        weekdays: selectedWeekdays,
        status,
        capacity: capacity ? Number(capacity) : undefined,
        sessionUnits: sessionUnits.length > 0 ? sessionUnits : undefined,
        conflictResolutions: conflictDates.length > 0 ? { defaultAction: 'skip', overrides } : undefined,
      },
      {
        onSuccess: (sessions) => {
          queryClient.invalidateQueries({ queryKey: ['/session'] });
          const created = sessions.length;
          const skipped = conflictDates.filter((d) => getAction(d) === 'skip').length;
          setResult({ created, skipped });
          if (created > 0) {
            useAlertStore.getState().addAlert({
              type: 'success',
              title: t('sessionCreateRangeSuccess', { count: created }),
            });
          }
        },
        onError: (err: any) => {
          const msg = err?.response?.data?.message;
          const text = Array.isArray(msg) ? msg.join(', ') : msg ?? t('genericError');
          setError(err?.response?.status === 409 ? `${t('sessionRangeConflict')}. ${text}` : text);
        },
      }
    );
  }

  const sectionIndex = (base: number) => (conflictDates.length > 0 ? base + 1 : base);

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
          {result && (
            <AlertBanner
              variant="success"
              title={t('sessionCreateRangeSuccess', { count: result.created })}
              message={result.skipped > 0 ? t('sessionSkipped', { count: result.skipped }) : ''}
            />
          )}

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

            {/* Summary badges */}
            {isValidRange && (
              <div className="flex flex-wrap gap-2 pt-0.5">
                {selectedWeekdays.length === 0 ? (
                  <div className="flex items-center gap-1.5 rounded-lg bg-rose-50 border border-rose-200 px-2.5 py-1.5 text-[11px] font-medium text-rose-600">
                    <AlertCircle size={12} className="shrink-0" />
                    Select at least one weekday.
                  </div>
                ) : (
                  <>
                    <div className="flex items-center gap-1.5 rounded-lg bg-emerald-50 border border-emerald-200 px-2.5 py-1.5 text-[11px] text-emerald-800">
                      <CheckCircle2 size={12} className="text-emerald-600 shrink-0" />
                      <span className="font-medium">{t('sessionEstimatedNew')}</span>
                      <span className="font-bold bg-emerald-100 px-1.5 py-0.5 rounded">{newDateCount}</span>
                    </div>
                    {isCheckingConflicts && (
                      <span className="text-[11px] text-slate-400 italic self-center">Checking conflicts…</span>
                    )}
                    {!isCheckingConflicts && conflictDates.length > 0 && (
                      <div className="flex items-center gap-1.5 rounded-lg bg-amber-50 border border-amber-200 px-2.5 py-1.5 text-[11px] text-amber-800">
                        <AlertCircle size={12} className="text-amber-500 shrink-0" />
                        <span className="font-medium">{t('sessionConflictCount')}</span>
                        <span className="font-bold bg-amber-100 px-1.5 py-0.5 rounded">{conflictDates.length}</span>
                      </div>
                    )}
                  </>
                )}
              </div>
            )}
          </section>

          {/* ── 3. Conflict resolution table (conditional) ─────────── */}
          {conflictDates.length > 0 && (
            <section className="space-y-2">
              <p className="text-[11px] font-bold uppercase tracking-wider text-slate-400">
                3. {t('sessionConflictTitle')}
              </p>
              <p className="text-[11px] text-slate-500">{t('sessionConflictDesc', { count: conflictDates.length })}</p>

              <div className="rounded-xl border border-amber-200 overflow-hidden">
                <table className="w-full text-xs">
                  <thead>
                    <tr className="bg-amber-50 border-b border-amber-200">
                      <th className="text-left px-3 py-2.5 font-semibold text-slate-600">{t('sessionConflictDate')}</th>
                      <th className="px-3 py-2.5 w-36 text-center">
                        <label className="inline-flex items-center gap-1.5 cursor-pointer select-none font-semibold text-slate-600">
                          <input
                            type="checkbox"
                            checked={allSkip}
                            onChange={(e) => e.target.checked && setAllAction('skip')}
                            className="w-3 h-3 accent-slate-600"
                          />
                          {t('sessionConflictSkipAll')}
                        </label>
                      </th>
                      <th className="px-3 py-2.5 w-40 text-center">
                        <label className="inline-flex items-center gap-1.5 cursor-pointer select-none font-semibold text-brand-700">
                          <input
                            type="checkbox"
                            checked={allOverwrite}
                            onChange={(e) => e.target.checked && setAllAction('overwrite')}
                            className="w-3 h-3 accent-brand-600"
                          />
                          {t('sessionConflictOverwriteAll')}
                        </label>
                      </th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 bg-white">
                    {conflictDates.map((date) => {
                      const [y, m, d] = date.split('-').map(Number);
                      const dateObj = new Date(y, m - 1, d);
                      const display = `${String(d).padStart(2, '0')}/${String(m).padStart(2, '0')}/${y}`;
                      const dayLabel = DAY_LABEL_VI[getDay(dateObj)];
                      const action = getAction(date);
                      return (
                        <tr key={date} className="hover:bg-slate-50/60 transition-colors">
                          <td className="px-3 py-2.5 font-medium text-slate-700">
                            {display}
                            <span className="ml-1.5 text-slate-400 font-normal">({dayLabel})</span>
                          </td>
                          <td className="px-3 py-2.5 text-center">
                            <input
                              type="radio"
                              name={`conflict-${date}`}
                              checked={action === 'skip'}
                              onChange={() => setConflictActions((p) => ({ ...p, [date]: 'skip' }))}
                              className="w-3.5 h-3.5 accent-slate-600 cursor-pointer"
                            />
                          </td>
                          <td className="px-3 py-2.5 text-center">
                            <input
                              type="radio"
                              name={`conflict-${date}`}
                              checked={action === 'overwrite'}
                              onChange={() => setConflictActions((p) => ({ ...p, [date]: 'overwrite' }))}
                              className="w-3.5 h-3.5 accent-brand-600 cursor-pointer"
                            />
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
              <p className="text-[10px] text-slate-400 italic px-0.5">{t('sessionConflictNote')}</p>
            </section>
          )}

          {/* ── 4 (or 3). Capacity + Status + Unit prices ─────────── */}
          <section className="space-y-3">
            <p className="text-[11px] font-bold uppercase tracking-wider text-slate-400">
              {sectionIndex(3)}. {t('sessionUnitPrices')}
            </p>

            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1">
                <label className="text-xs font-medium text-slate-600">{t('sessionCapacity')}</label>
                <input
                  type="number"
                  min={0}
                  value={capacity}
                  onChange={(e) => setCapacity(e.target.value)}
                  placeholder={t('sessionCapacityPlaceholder')}
                  className="w-full rounded-xl border border-slate-200 bg-white px-3 py-2 text-xs text-slate-700 placeholder:text-slate-400 focus:outline-none focus:ring-1 focus:ring-brand-300"
                />
              </div>
              <div className="space-y-1">
                <label className="text-xs font-medium text-slate-600">{t('sessionColStatus')}</label>
                <Select value={status} onValueChange={(v) => setStatus(v as 'active' | 'inactive')}>
                  <SelectTrigger className="w-full rounded-xl text-xs">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="active">{t('sessionActive')}</SelectItem>
                    <SelectItem value="inactive">{t('sessionInactive')}</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

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
