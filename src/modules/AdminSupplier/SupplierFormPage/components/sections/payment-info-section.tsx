import { useQueryClient } from '@tanstack/react-query';
import { Loader2, Plus } from 'lucide-react';
import { useTranslation } from 'next-i18next';
import { useState } from 'react';

import {
  useDeleteSupplierPayment,
  useSupplierPaymentList,
  useUpdateSupplierPayment,
} from '@/api/supplier-payment/queries';
import type { ISupplierPayment, SupplierPaymentPayload } from '@/api/supplier-payment/types';
import {
  AlertDialog,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import { Button } from '@/components/ui/button';
import { getApiErrorMessage } from '@/lib/utils';
import { useAlertStore } from '@/stores/use-alert-store';

import { BankCardItem } from './bank-card-item';
import { SupplierPaymentModal } from './supplier-payment-modal';

interface PaymentInfoSectionProps {
  supplierId: string;
}

export function PaymentInfoSection({ supplierId }: PaymentInfoSectionProps) {
  const { t } = useTranslation('adminPage');
  const queryClient = useQueryClient();
  const { addAlert } = useAlertStore.getState();

  const [modalOpen, setModalOpen] = useState(false);
  const [editTarget, setEditTarget] = useState<ISupplierPayment | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<ISupplierPayment | null>(null);

  const { data, isLoading } = useSupplierPaymentList({
    variables: { supplierId, pageSize: 50 },
  });

  const invalidate = () => queryClient.invalidateQueries({ queryKey: ['/supplier-payment/list'] });

  const setDefaultMutation = useUpdateSupplierPayment({
    onSuccess: () => {
      invalidate();
      addAlert({ type: 'success', title: t('paymentDefaultSet') });
    },
    onError: (err: any) => {
      addAlert({ type: 'error', title: getApiErrorMessage(err, t('saveFailed')) });
    },
  });

  const deleteMutation = useDeleteSupplierPayment({
    onSuccess: () => {
      invalidate();
      setDeleteTarget(null);
      addAlert({ type: 'success', title: t('paymentDeleted') });
    },
    onError: (err: any) => {
      addAlert({ type: 'error', title: getApiErrorMessage(err, t('saveFailed')) });
    },
  });

  const handleSetDefault = (payment: ISupplierPayment) => {
    const payload: SupplierPaymentPayload = {
      supplierId: payment.supplierId,
      method: payment.method,
      currency: payment.currency,
      details: payment.details,
      isDefault: true,
    };
    setDefaultMutation.mutate({ id: payment.id, payload });
  };

  const handleOpenAdd = () => {
    setEditTarget(null);
    setModalOpen(true);
  };

  const handleOpenEdit = (payment: ISupplierPayment) => {
    setEditTarget(payment);
    setModalOpen(true);
  };

  const items = data?.items ?? [];

  return (
    <div className="space-y-4">
      {isLoading ? (
        <div className="flex items-center justify-center py-10">
          <Loader2 size={22} className="animate-spin text-brand-500" />
        </div>
      ) : (
        <div className="space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {items.map((payment) => (
              <BankCardItem
                key={payment.id}
                payment={payment}
                isSettingDefault={setDefaultMutation.isPending}
                isDeleting={deleteMutation.isPending && deleteTarget?.id === payment.id}
                onSetDefault={() => handleSetDefault(payment)}
                onEdit={() => handleOpenEdit(payment)}
                onDelete={() => setDeleteTarget(payment)}
              />
            ))}
          </div>

          {/* Bottom action row: Add New Bank Account Button */}
          <div className="flex justify-end pt-1">
            <button
              type="button"
              onClick={handleOpenAdd}
              className="inline-flex items-center gap-2 rounded-xl bg-slate-900 border border-slate-700/80 px-4 py-2 text-xs font-semibold text-white shadow-sm hover:bg-slate-800 transition-colors dark:bg-brand-500 dark:border-brand-400 dark:hover:bg-brand-600 cursor-pointer active:scale-95"
            >
              <Plus size={14} />
              <span>{t('paymentAddAccount')}</span>
            </button>
          </div>
        </div>
      )}

      <SupplierPaymentModal
        supplierId={supplierId}
        target={editTarget}
        open={modalOpen}
        onClose={() => setModalOpen(false)}
      />

      {/* Delete confirm */}
      <AlertDialog
        open={!!deleteTarget}
        onOpenChange={(open) => {
          if (!open && !deleteMutation.isPending) setDeleteTarget(null);
        }}
      >
        <AlertDialogContent className="rounded-2xl border-slate-100 shadow-2xl max-w-md dark:border-gray-800/80">
          <AlertDialogHeader>
            <AlertDialogTitle className="text-slate-800 dark:text-white/90 font-bold">
              {t('confirmDeleteTitle')}
            </AlertDialogTitle>
            <AlertDialogDescription className="text-slate-500 dark:text-gray-400">
              {t('paymentConfirmDelete', { name: deleteTarget?.details?.bankName ?? deleteTarget?.method })}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter className="flex flex-row justify-end gap-3 sm:space-x-0 mt-2">
            <AlertDialogCancel
              className="mt-0 h-10 px-5 rounded-xl border border-slate-200 bg-white text-slate-700 hover:bg-slate-50 hover:text-slate-800 transition-all font-semibold text-sm active:scale-95 dark:border-gray-800 dark:bg-transparent dark:text-gray-300 dark:hover:bg-gray-800 shrink-0"
              onClick={() => setDeleteTarget(null)}
              disabled={deleteMutation.isPending}
            >
              {t('cancel')}
            </AlertDialogCancel>
            <Button
              blur={false}
              disabled={deleteMutation.isPending}
              onClick={() => deleteTarget && deleteMutation.mutate({ id: deleteTarget.id })}
              className="h-10 px-5 rounded-xl bg-rose-600 hover:bg-rose-700 hover:text-white transition-all font-semibold text-sm active:scale-95 active:bg-rose-800 border-0 flex items-center gap-1.5 shrink-0 shadow-sm disabled:opacity-50"
            >
              {deleteMutation.isPending ? <Loader2 size={14} className="animate-spin mr-1" /> : null}
              {t('delete')}
            </Button>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
