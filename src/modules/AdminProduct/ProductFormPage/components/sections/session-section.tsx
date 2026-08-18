import { useQueryClient } from '@tanstack/react-query';
import { format } from 'date-fns';
import { CalendarPlus, CalendarRange, Filter, RotateCcw } from 'lucide-react';
import { useTranslation } from 'next-i18next';
import { useState } from 'react';

import type { ApiProductUnit } from '@/api/product/booking-config-types';
import type { ISession } from '@/api/session';
import { useDeleteSession } from '@/api/session';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import { DatePicker } from '@/components/ui/date-picker';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useAlertStore } from '@/stores/use-alert-store';

import { CreateSessionModal } from './create-session-modal';
import { CreateSessionRangeModal } from './create-session-range-modal';
import { EditSessionModal } from './edit-session-modal';
import { SessionTable } from './session-table';

interface Props {
  productId: string;
  units: ApiProductUnit[];
}

export function SessionSection({ productId, units }: Props) {
  const { t } = useTranslation('adminPage');
  const queryClient = useQueryClient();
  const { mutate: deleteSession, isLoading: isDeleting } = useDeleteSession();

  const [fromDate, setFromDate] = useState<Date | undefined>();
  const [toDate, setToDate] = useState<Date | undefined>();
  const [filterStatus, setFilterStatus] = useState<'active' | 'inactive' | 'all'>('all');
  const [page, setPage] = useState(1);

  const [createOpen, setCreateOpen] = useState(false);
  const [rangeOpen, setRangeOpen] = useState(false);
  const [editTarget, setEditTarget] = useState<ISession | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<ISession | null>(null);

  function handleDelete() {
    if (!deleteTarget) return;
    deleteSession(
      { id: deleteTarget.id },
      {
        onSuccess: () => {
          queryClient.invalidateQueries({ queryKey: ['/session'] });
          useAlertStore.getState().addAlert({ type: 'success', title: t('sessionDeleteSuccess') });
          setDeleteTarget(null);
        },
        onError: (err: any) => {
          const msg = err?.response?.data?.message;
          const text = Array.isArray(msg) ? msg.join(', ') : msg ?? t('genericError');
          useAlertStore.getState().addAlert({ type: 'error', title: text });
          setDeleteTarget(null);
        },
      }
    );
  }

  const hasFilter = !!fromDate || !!toDate || filterStatus !== 'all';

  function handleResetFilter() {
    setFromDate(undefined);
    setToDate(undefined);
    setFilterStatus('all');
    setPage(1);
  }

  const tableParams = {
    productId,
    fromDate: fromDate ? format(fromDate, 'yyyy-MM-dd') : undefined,
    toDate: toDate ? format(toDate, 'yyyy-MM-dd') : undefined,
    status: filterStatus === 'all' ? undefined : filterStatus,
    pageSize: 10,
  };

  return (
    <div className="space-y-4">
      {/* Row 1: Action Buttons */}
      <div className="flex items-center justify-end">
        <div className="flex items-center gap-2 shrink-0">
          <button
            type="button"
            onClick={() => setRangeOpen(true)}
            className="h-9 px-3.5 rounded-lg border border-slate-200 bg-white text-slate-700 font-semibold text-xs hover:text-brand-600 hover:border-brand-200 hover:bg-brand-50/50 shadow-sm flex items-center gap-1.5 transition-all cursor-pointer shrink-0 whitespace-nowrap"
          >
            <CalendarRange size={15} className="text-slate-500 shrink-0" />
            <span>{t('sessionCreateRange')}</span>
          </button>
          <button
            type="button"
            onClick={() => setCreateOpen(true)}
            className="h-9 px-3.5 rounded-lg bg-brand-600 hover:bg-brand-700 text-white font-semibold text-xs shadow-sm flex items-center gap-1.5 transition-all cursor-pointer shrink-0 whitespace-nowrap"
          >
            <CalendarPlus size={15} className="shrink-0" />
            <span>{t('sessionCreateOne')}</span>
          </button>
        </div>
      </div>

      {/* Row 2: Clean Inline Filter Bar */}
      <div className="flex flex-wrap items-center gap-2.5 p-2.5 bg-slate-50/90 rounded-xl border border-slate-200/80">
        <div className="flex items-center gap-1.5 text-slate-500 shrink-0 text-xs font-bold uppercase tracking-wider px-1">
          <Filter size={13} />
          <span>{t('filter')}</span>
        </div>

        <div className="flex flex-wrap items-center gap-2 flex-1">
          <div className="w-36 shrink-0">
            <DatePicker
              value={fromDate}
              onChange={(d) => {
                setFromDate(d);
                setPage(1);
              }}
              placeholder={t('sessionFilterFrom')}
              className="!h-9 text-xs bg-white !pr-8"
            />
          </div>
          <span className="text-slate-300 text-xs shrink-0">—</span>
          <div className="w-36 shrink-0">
            <DatePicker
              value={toDate}
              onChange={(d) => {
                setToDate(d);
                setPage(1);
              }}
              placeholder={t('sessionFilterTo')}
              className="!h-9 text-xs bg-white !pr-8"
            />
          </div>

          <Select
            value={filterStatus}
            onValueChange={(v) => {
              setFilterStatus(v as typeof filterStatus);
              setPage(1);
            }}
          >
            <SelectTrigger className="h-9 text-xs w-36 bg-white border-slate-200 shrink-0">
              <SelectValue placeholder={t('sessionColStatus')} />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">{t('sessionAllStatus')}</SelectItem>
              <SelectItem value="active">{t('sessionActive')}</SelectItem>
              <SelectItem value="inactive">{t('sessionInactive')}</SelectItem>
            </SelectContent>
          </Select>

          {hasFilter && (
            <button
              type="button"
              onClick={handleResetFilter}
              className="h-8 px-2.5 text-xs text-slate-500 hover:text-slate-800 flex items-center gap-1 hover:bg-slate-200/60 rounded-md transition-colors font-medium cursor-pointer"
            >
              <RotateCcw size={12} />
              <span>Xóa bộ lọc</span>
            </button>
          )}
        </div>
      </div>

      {/* Table */}
      <SessionTable
        params={tableParams}
        units={units}
        page={page}
        onPageChange={setPage}
        onEdit={setEditTarget}
        onDelete={setDeleteTarget}
      />

      {/* Modals */}
      <CreateSessionModal open={createOpen} productId={productId} units={units} onClose={() => setCreateOpen(false)} />
      <CreateSessionRangeModal
        open={rangeOpen}
        productId={productId}
        units={units}
        onClose={() => setRangeOpen(false)}
      />
      <EditSessionModal session={editTarget} units={units} onClose={() => setEditTarget(null)} />

      {/* Delete confirmation */}
      <AlertDialog open={!!deleteTarget} onOpenChange={(o) => !o && setDeleteTarget(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>{t('sessionDeleteConfirm')}</AlertDialogTitle>
            <AlertDialogDescription>
              {deleteTarget?.travelDate} — {t('sessionDeleteDesc')}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel onClick={() => setDeleteTarget(null)}>{t('sessionCancel')}</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDelete}
              disabled={isDeleting}
              className="bg-red-600 text-white hover:bg-red-700"
            >
              {t('sessionDelete')}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
