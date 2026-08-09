import { useQueryClient } from '@tanstack/react-query';
import { useTranslation } from 'next-i18next';
import { useState } from 'react';

import { useDeleteSupplier } from '@/api/supplier/queries';
import type { ISupplier } from '@/api/supplier/types';
import { useAlertStore } from '@/stores/use-alert-store';

export function useSupplierListState(refetch: () => void) {
  const { t } = useTranslation('adminPage');
  const queryClient = useQueryClient();
  const { addAlert } = useAlertStore.getState();

  const [deleteTarget, setDeleteTarget] = useState<ISupplier | null>(null);

  const invalidate = () => {
    queryClient.removeQueries({ queryKey: ['/supplier/list'] });
    queryClient.removeQueries({ queryKey: ['/supplier/detail'] });
  };

  const deleteMutation = useDeleteSupplier({
    onSuccess: () => {
      invalidate();
      addAlert({ type: 'success', title: t('supplierDeleted') });
      setDeleteTarget(null);
      refetch();
    },
    onError: () => addAlert({ type: 'error', title: t('deleteFailed') }),
  });

  const handleDeleteConfirm = () => {
    if (!deleteTarget) return;
    deleteMutation.mutate({ id: deleteTarget.id });
  };

  return { deleteTarget, setDeleteTarget, handleDeleteConfirm, isDeleting: deleteMutation.isPending };
}
