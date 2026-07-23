import type { AxiosError } from 'axios';
import { useTranslation } from 'next-i18next';
import { useState } from 'react';

import type { IProduct } from '@/api/product';
import { useDeleteProduct, useUpdateProductStatus } from '@/api/product';
import { useAlertStore } from '@/stores/use-alert-store';

type ApiError = AxiosError<{ message?: string }>;

function getApiErrorMessage(err: unknown, fallback: string): string {
  return (err as ApiError)?.response?.data?.message || fallback;
}

export function useProductListActions(refetch: () => void) {
  const { t } = useTranslation('adminPage');
  const [deleteTarget, setDeleteTarget] = useState<IProduct | null>(null);
  const addAlert = useAlertStore((s) => s.addAlert);

  const updateStatus = useUpdateProductStatus({
    onSuccess: () => {
      addAlert({ type: 'success', title: t('updateStatusSuccess') });
      refetch();
    },
    onError: (err: unknown) => {
      addAlert({ type: 'error', title: getApiErrorMessage(err, t('updateStatusFailed')) });
    },
  });

  const deleteMutation = useDeleteProduct({
    onSuccess: () => {
      addAlert({ type: 'success', title: t('tourDeleted') });
      setDeleteTarget(null);
      refetch();
    },
    onError: (err: unknown) => {
      addAlert({ type: 'error', title: getApiErrorMessage(err, t('deleteTourFailed')) });
    },
  });

  const handleChangeStatus = (product: IProduct, status: 'published' | 'hidden') => {
    updateStatus.mutate({ id: product.id, status });
  };

  const handleDeleteConfirm = () => {
    if (!deleteTarget) return;
    deleteMutation.mutate({ id: deleteTarget.id });
  };

  return { deleteTarget, setDeleteTarget, handleChangeStatus, handleDeleteConfirm };
}
