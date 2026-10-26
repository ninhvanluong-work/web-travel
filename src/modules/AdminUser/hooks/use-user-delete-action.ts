import { useQueryClient } from '@tanstack/react-query';
import { useTranslation } from 'next-i18next';
import { useCallback, useState } from 'react';

import { useDeleteAdminUser } from '@/api/user/queries';
import type { IAdminUser } from '@/api/user/types';
import { getAdminUserApiError, invalidateAdminUserQueries } from '@/hooks/use-admin-user-form';
import { useAlertStore } from '@/stores/use-alert-store';

import { USER_NS } from '../constants';

/** Delete flow shared by the list page and the edit page (soft delete on the BE). */
export function useUserDeleteAction(onDeleted: (deleted: IAdminUser) => void) {
  const { t } = useTranslation(USER_NS);
  const queryClient = useQueryClient();
  const [deleteTarget, setDeleteTarget] = useState<IAdminUser | null>(null);

  const deleteMutation = useDeleteAdminUser({
    onSuccess: () => {
      const deleted = deleteTarget;
      invalidateAdminUserQueries(queryClient);
      queryClient.removeQueries({ queryKey: ['/user/detail'] });
      useAlertStore.getState().addAlert({ type: 'success', title: t('userDeleted') });
      setDeleteTarget(null);
      if (deleted) onDeleted(deleted);
    },
    onError: (err: unknown) => {
      useAlertStore.getState().addAlert({ type: 'error', title: getAdminUserApiError(err, t('deleteUserFailed')) });
      setDeleteTarget(null);
    },
  });

  const handleDeleteConfirm = useCallback(() => {
    if (deleteTarget) deleteMutation.mutate({ id: deleteTarget.id });
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
