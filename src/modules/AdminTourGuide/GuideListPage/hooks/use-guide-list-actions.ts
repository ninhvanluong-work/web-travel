import { useState } from 'react';

import { useDeleteTourGuide } from '@/api/tour-guide/queries';
import type { ITourGuide } from '@/api/tour-guide/types';
import { useAlertStore } from '@/stores/use-alert-store';

export function useGuideListActions(refetch: () => void) {
  const [deleteTarget, setDeleteTarget] = useState<ITourGuide | null>(null);
  const { addAlert } = useAlertStore.getState();

  const deleteMutation = useDeleteTourGuide({
    onSuccess: () => {
      addAlert({ type: 'success', title: 'Đã xóa hướng dẫn viên' });
      setDeleteTarget(null);
      refetch();
    },
    onError: () => addAlert({ type: 'error', title: 'Xóa thất bại' }),
  });

  const handleDeleteConfirm = () => {
    if (!deleteTarget) return;
    deleteMutation.mutate({ id: deleteTarget.id });
  };

  return { deleteTarget, setDeleteTarget, handleDeleteConfirm, isDeleting: deleteMutation.isPending };
}
