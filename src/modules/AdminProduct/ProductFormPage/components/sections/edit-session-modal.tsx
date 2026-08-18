import { useQueryClient } from '@tanstack/react-query';
import { Pencil } from 'lucide-react';
import { useTranslation } from 'next-i18next';
import { useEffect, useState } from 'react';

import type { ApiProductUnit } from '@/api/product/booking-config-types';
import type { ISession } from '@/api/session';
import { useUpdateSession } from '@/api/session';
import AlertBanner from '@/components/ui/AlertBanner';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { PriceInput } from '@/components/ui/price-input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useAlertStore } from '@/stores/use-alert-store';

interface Props {
  session: ISession | null;
  units: ApiProductUnit[];
  onClose: () => void;
}

export function EditSessionModal({ session, units, onClose }: Props) {
  const { t } = useTranslation('adminPage');
  const queryClient = useQueryClient();
  const { mutate, isLoading } = useUpdateSession();

  const [status, setStatus] = useState<'active' | 'inactive'>('active');
  const [prices, setPrices] = useState<Record<string, number>>({});
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!session) return;
    setStatus(session.status);
    const initialPrices: Record<string, number> = {};
    session.sessionUnits.forEach((su) => {
      initialPrices[su.unitId] = su.price;
    });
    setPrices(initialPrices);
    setError(null);
  }, [session]);

  function handleClose() {
    setError(null);
    onClose();
  }

  function handleSubmit() {
    if (!session) return;
    setError(null);

    const sessionUnits = units.map((u) => ({ unitId: u.id, price: prices[u.id] ?? 0 }));

    mutate(
      {
        id: session.id,
        payload: {
          status,
          sessionUnits: sessionUnits.length > 0 ? sessionUnits : undefined,
        },
      },
      {
        onSuccess: () => {
          queryClient.invalidateQueries({ queryKey: ['/session'] });
          useAlertStore.getState().addAlert({ type: 'success', title: t('sessionUpdateSuccess') });
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
    <Dialog open={!!session} onOpenChange={(o) => !o && handleClose()}>
      <DialogContent className="max-w-md rounded-2xl p-6">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2 text-lg font-bold text-slate-800">
            <Pencil className="h-5 w-5 text-brand-600" />
            <span>
              {t('sessionModalEditTitle')} —{' '}
              {session ? new Intl.DateTimeFormat('vi-VN').format(new Date(`${session.travelDate}T00:00:00`)) : ''}
            </span>
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-4 py-2">
          {error && <AlertBanner variant="error" title={t('genericError')} message={error} />}

          <div className="space-y-1.5">
            <label
              htmlFor="edit-session-status"
              className="text-xs font-semibold uppercase tracking-wider text-slate-600"
            >
              {t('sessionColStatus')}
            </label>
            <Select value={status} onValueChange={(v) => setStatus(v as 'active' | 'inactive')}>
              <SelectTrigger id="edit-session-status" className="w-full rounded-xl">
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
            disabled={isLoading}
            className="h-9 px-5 rounded-xl bg-brand-600 hover:bg-brand-700 active:scale-95 text-white font-semibold text-xs sm:text-sm shadow-sm flex items-center justify-center transition-all cursor-pointer disabled:opacity-50"
          >
            {isLoading ? '…' : t('sessionSubmit')}
          </button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
