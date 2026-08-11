import { format } from 'date-fns';
import { Pencil, Trash2 } from 'lucide-react';
import { useTranslation } from 'next-i18next';

import type { ApiProductUnit } from '@/api/product/booking-config-types';
import type { ISession, ISessionParams } from '@/api/session';
import { useSessionList } from '@/api/session';
import { Icons } from '@/assets/icons';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';

interface Props {
  params: ISessionParams;
  units: ApiProductUnit[];
  page: number;
  onPageChange: (p: number) => void;
  onEdit: (session: ISession) => void;
  onDelete: (session: ISession) => void;
}

function formatVND(v: number) {
  return `${new Intl.NumberFormat('vi-VN').format(v)}đ`;
}

export function SessionTable({ params, units, page, onPageChange, onEdit, onDelete }: Props) {
  const { t } = useTranslation('adminPage');
  const { data, isLoading } = useSessionList({ variables: { ...params, page } });

  const items = data?.items ?? [];
  const pagination = data?.pagination;
  const totalPages = pagination?.totalPages ?? 1;
  const total = pagination?.total ?? 0;

  const thClass =
    'text-left px-3.5 py-3 text-xs font-bold uppercase tracking-wider text-slate-500 bg-slate-50/90 whitespace-nowrap';

  if (isLoading) {
    return (
      <div className="rounded-xl border border-slate-200 overflow-hidden animate-pulse">
        {Array.from({ length: 5 }).map((_, i) => (
          <div key={i} className="px-4 py-3.5 border-b border-slate-100 last:border-0 flex gap-4">
            <div className="h-4 bg-slate-100 rounded w-24" />
            <div className="h-4 bg-slate-100 rounded w-16" />
            <div className="h-4 bg-slate-100 rounded w-14" />
            <div className="h-4 bg-slate-100 rounded w-32" />
          </div>
        ))}
      </div>
    );
  }

  if (items.length === 0) {
    return (
      <div className="rounded-xl border-2 border-dashed border-slate-200 py-12 flex flex-col items-center gap-2 text-slate-400 bg-slate-50/40">
        <Icons.calendar size={32} className="opacity-30" />
        <p className="text-sm font-semibold text-slate-600">{t('sessionEmpty')}</p>
        <p className="text-xs text-slate-400">{t('sessionEmptyDesc')}</p>
      </div>
    );
  }

  const hasUnits = units.length > 0;

  return (
    <div className="space-y-3">
      <div className="rounded-xl border border-slate-200/80 overflow-hidden bg-white">
        <div className="overflow-x-auto w-full">
          <table className="w-full text-xs">
            <thead>
              <tr className="border-b border-slate-200">
                <th scope="col" className={thClass}>
                  {t('sessionColDate')}
                </th>
                <th scope="col" className={thClass}>
                  {t('sessionColCapacity')}
                </th>
                <th scope="col" className={thClass}>
                  {t('sessionColStatus')}
                </th>
                {hasUnits ? (
                  units.map((unit) => (
                    <th scope="col" key={unit.id} className={`${thClass} min-w-[130px]`}>
                      {unit.name}
                    </th>
                  ))
                ) : (
                  <th scope="col" className={`${thClass} min-w-[160px]`}>
                    {t('sessionColPrices')}
                  </th>
                )}
                <th scope="col" className={`${thClass} text-right pr-4 w-20`}>
                  {t('sessionColActions')}
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {items.map((session) => {
                const dateFormatted = format(new Date(`${session.travelDate}T00:00:00`), 'dd/MM/yyyy');
                return (
                  <tr key={session.id} className="hover:bg-slate-50/80 transition-colors">
                    {/* Date */}
                    <td className="px-3.5 py-3 font-semibold text-slate-800 whitespace-nowrap">{dateFormatted}</td>

                    {/* Capacity */}
                    <td className="px-3.5 py-3 text-slate-600 font-medium">
                      {session.capacity > 0 ? (
                        <span className="inline-flex items-center gap-1 text-slate-700">
                          👥 {t('sessionCapacitySlots', { count: session.capacity })}
                        </span>
                      ) : (
                        <span className="text-slate-400 font-normal">♾️ {t('sessionCapacityFree', 'Mở tự do')}</span>
                      )}
                    </td>

                    {/* Status */}
                    <td className="px-3.5 py-3">
                      <button
                        type="button"
                        onClick={() => onEdit(session)}
                        title={t('sessionStatusToggleTip')}
                        className={cn(
                          'inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[11px] font-semibold transition-all cursor-pointer',
                          session.status === 'active'
                            ? 'bg-emerald-50 text-emerald-700 ring-1 ring-emerald-200/80 hover:bg-emerald-100'
                            : 'bg-slate-100 text-slate-500 ring-1 ring-slate-200 hover:bg-slate-200'
                        )}
                      >
                        <span
                          className={cn(
                            'w-1.5 h-1.5 rounded-full',
                            session.status === 'active' ? 'bg-emerald-500' : 'bg-slate-400'
                          )}
                        />
                        {t(session.status === 'active' ? 'sessionActive' : 'sessionInactive')}
                      </button>
                    </td>

                    {/* Pricing Matrix Columns */}
                    {hasUnits ? (
                      units.map((unit) => {
                        const matchedSu = session.sessionUnits.find((su) => su.unitId === unit.id);
                        return (
                          <td key={unit.id} className="px-3.5 py-3">
                            {matchedSu ? (
                              <span className="inline-flex items-center font-bold text-slate-800 bg-slate-100/90 px-2 py-1 rounded-md text-[11px]">
                                {formatVND(Number(matchedSu.price))}
                              </span>
                            ) : (
                              <button
                                type="button"
                                onClick={() => onEdit(session)}
                                className="inline-flex items-center gap-1 px-2 py-0.5 rounded bg-amber-50 text-amber-700 text-[11px] border border-amber-200/60 font-medium hover:bg-amber-100 transition-colors"
                              >
                                ⚠️ {t('sessionNoPricing')}
                              </button>
                            )}
                          </td>
                        );
                      })
                    ) : (
                      <td className="px-3.5 py-3">
                        {session.sessionUnits.length > 0 ? (
                          <div className="flex flex-wrap gap-1.5">
                            {session.sessionUnits.map((su) => (
                              <span
                                key={su.id}
                                className="inline-flex items-center px-2 py-0.5 rounded bg-brand-50 text-brand-700 text-[11px] font-semibold border border-brand-100"
                              >
                                {formatVND(Number(su.price))}
                              </span>
                            ))}
                          </div>
                        ) : (
                          <button
                            type="button"
                            onClick={() => onEdit(session)}
                            className="inline-flex items-center gap-1 px-2 py-0.5 rounded bg-amber-50 text-amber-700 text-[11px] border border-amber-200/60 font-medium hover:bg-amber-100 transition-colors"
                          >
                            ⚠️ {t('sessionNoPricing')}
                          </button>
                        )}
                      </td>
                    )}

                    {/* Actions */}
                    <td className="px-3.5 py-3 text-right">
                      <div className="flex items-center justify-end gap-1">
                        <button
                          type="button"
                          aria-label={t('edit')}
                          onClick={() => onEdit(session)}
                          className="p-1.5 rounded-lg text-slate-400 hover:text-brand-600 hover:bg-brand-50 transition-colors"
                        >
                          <Pencil size={14} />
                        </button>
                        <button
                          type="button"
                          aria-label={t('sessionDelete')}
                          onClick={() => onDelete(session)}
                          className="p-1.5 rounded-lg text-slate-400 hover:text-rose-600 hover:bg-rose-50 transition-colors"
                        >
                          <Trash2 size={14} />
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="flex items-center justify-between text-xs pt-1">
          <span className="text-slate-500 font-medium">
            {total} {t('sessionsUnit')}
          </span>
          <div className="flex items-center gap-1.5">
            <Button
              type="button"
              variant="ghost"
              size="xs"
              rounded="md"
              blur={false}
              disabled={page === 1}
              onClick={() => onPageChange(page - 1)}
              className="h-7 px-2.5 text-xs"
            >
              {t('prev')}
            </Button>
            <span className="text-slate-500 text-xs px-2 font-medium">
              {page} / {totalPages}
            </span>
            <Button
              type="button"
              variant="ghost"
              size="xs"
              rounded="md"
              blur={false}
              disabled={page === totalPages}
              onClick={() => onPageChange(page + 1)}
              className="h-7 px-2.5 text-xs"
            >
              {t('next')}
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}
