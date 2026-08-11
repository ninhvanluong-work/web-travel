import { useQueryClient } from '@tanstack/react-query';
import { format } from 'date-fns';
import { CalendarPlus } from 'lucide-react';
import { useTranslation } from 'next-i18next';
import { useState } from 'react';

import type { ApiProductUnit } from '@/api/product/booking-config-types';
import { useCreateSession } from '@/api/session';
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

export function CreateSessionModal({ open, productId, units, onClose }: Props) {
  const { t } = useTranslation('adminPage');
  const queryClient = useQueryClient();
  const { mutate, isLoading } = useCreateSession();

  const [date, setDate] = useState<Date | undefined>();
  const [status, setStatus] = useState<'active' | 'inactive'>('active');
  const [prices, setPrices] = useState<Record<string, number>>({});
  const [error, setError] = useState<string | null>(null);

  function reset() {
    setDate(undefined);
    setStatus('active');
    setPrices({});
    setError(null);
  }

  function handleClose() {
    reset();
    onClose();
  }

  function handleSubmit() {
    if (!date) return;
    setError(null);

    const travelDate = format(date, 'yyyy-MM-dd');
    const sessionUnits = units.map((u) => ({ unitId: u.id, price: prices[u.id] ?? 0 }));

    mutate(
      {
        productId,
        travelDate,
        status,
        sessionUnits: sessionUnits.length > 0 ? sessionUnits : undefined,
      },
      {
        onSuccess: () => {
          queryClient.invalidateQueries({ queryKey: ['/session'] });
          useAlertStore.getState().addAlert({ type: 'success', title: t('sessionCreateSuccess') });
          handleClose();
        },
        onError: (err: any) => {
          const msg = err?.response?.data?.message;
          const text = Array.isArray(msg) ? msg.join(', ') : msg ?? t('genericError');
          if (text.toLowerCase().includes('exist') || text.toLowerCase().includes('duplicate')) {
            setError(t('sessionDuplicateDate', { date: travelDate }));
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
            <CalendarPlus className="h-5 w-5 text-brand-600" />
            <span>{t('sessionModalCreateTitle')}</span>
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-4 py-2">
          {error && <AlertBanner variant="error" title={t('genericError')} message={error} />}

          <div className="space-y-1.5">
            <label
              htmlFor="create-session-date"
              className="text-xs font-semibold uppercase tracking-wider text-slate-600"
            >
              {t('sessionTravelDate')} *
            </label>
            <DatePicker id="create-session-date" value={date} onChange={setDate} placeholder="DD/MM/YYYY" />
          </div>

          <div className="space-y-1.5">
            <label
              htmlFor="create-session-status"
              className="text-xs font-semibold uppercase tracking-wider text-slate-600"
            >
              {t('sessionColStatus')}
            </label>
            <Select value={status} onValueChange={(v) => setStatus(v as 'active' | 'inactive')}>
              <SelectTrigger id="create-session-status" className="w-full rounded-xl">
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
            disabled={!date || isLoading}
            className="h-9 px-5 rounded-xl bg-brand-600 hover:bg-brand-700 active:scale-95 text-white font-semibold text-xs sm:text-sm shadow-sm flex items-center justify-center transition-all cursor-pointer disabled:opacity-50"
          >
            {isLoading ? '…' : t('sessionSubmit')}
          </button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
