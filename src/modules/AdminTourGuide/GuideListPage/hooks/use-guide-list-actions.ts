import { useTranslation } from 'next-i18next';
import { useState } from 'react';

import { useDeleteTourGuide } from '@/api/tour-guide/queries';
import type { ITourGuide } from '@/api/tour-guide/types';
import { useAlertStore } from '@/stores/use-alert-store';

export function useGuideListActions(refetch: () => void) {
  const { t } = useTranslation('adminPage');
  const [deleteTarget, setDeleteTarget] = useState<ITourGuide | null>(null);
  const { addAlert } = useAlertStore.getState();

  const deleteMutation = useDeleteTourGuide({
    onSuccess: () => {
      addAlert({ type: 'success', title: t('guideDeleted') });
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
