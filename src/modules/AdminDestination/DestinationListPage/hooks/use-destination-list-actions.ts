import { useQueryClient } from '@tanstack/react-query';
import { useTranslation } from 'next-i18next';
import { useCallback, useState } from 'react';

import { useDeleteDestination } from '@/api/destination/queries';
import type { IDestination } from '@/api/destination/types';
import { getDestinationApiError, invalidateDestinationQueries } from '@/hooks/use-destination-form';
import { useAlertStore } from '@/stores/use-alert-store';

import { DESTINATION_NS } from '../../constants';

/** Delete flow shared by the list page and the edit page. */
export function useDestinationDeleteAction(onDeleted: (deleted: IDestination) => void) {
  const { t } = useTranslation(DESTINATION_NS);
  const queryClient = useQueryClient();
  const [deleteTarget, setDeleteTarget] = useState<IDestination | null>(null);

  const deleteMutation = useDeleteDestination({
    onSuccess: () => {
      const deleted = deleteTarget;
      invalidateDestinationQueries(queryClient);
      useAlertStore.getState().addAlert({ type: 'success', title: t('destinationDeleted') });
      setDeleteTarget(null);
      if (deleted) onDeleted(deleted);
    },
    onError: (err: unknown) => {
      useAlertStore
        .getState()
        .addAlert({ type: 'error', title: getDestinationApiError(err, t('deleteDestinationFailed')) });
      setDeleteTarget(null);
    },
  });

  const handleDeleteConfirm = useCallback(() => {
    if (!deleteTarget) return;
    deleteMutation.mutate({ id: deleteTarget.id });
  }, [deleteTarget, deleteMutation]);

  const handleDeleteCancel = useCallback(() => {
    if (!deleteMutation.isLoading) setDeleteTarget(null);
  }, [deleteMutation.isLoading]);

  return {
    deleteTarget,
    setDeleteTarget,
    handleDeleteConfirm,
    handleDeleteCancel,
    isDeleting: deleteMutation.isLoading,
  };
}
