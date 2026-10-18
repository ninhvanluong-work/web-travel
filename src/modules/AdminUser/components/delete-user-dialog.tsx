import { useTranslation } from 'next-i18next';

import type { IAdminUser } from '@/api/user/types';
import { AdminConfirmDialog } from '@/components/ui/admin-confirm-dialog';

import { USER_NS } from '../constants';

interface DeleteUserDialogProps {
  target: IAdminUser | null;
  isDeleting: boolean;
  onConfirm: () => void;
  onCancel: () => void;
}

export function DeleteUserDialog({ target, isDeleting, onConfirm, onCancel }: DeleteUserDialogProps) {
  const { t } = useTranslation(USER_NS);
  const displayName = target?.name || target?.email || t('noName');

  return (
    <AdminConfirmDialog
      open={!!target}
      title={t('confirmDeleteTitle')}
      description={t('confirmDeleteMessage', { name: displayName })}
      confirmLabel={t('deleteUser')}
      cancelLabel={t('cancel')}
      isPending={isDeleting}
      onConfirm={onConfirm}
      onCancel={onCancel}
    >
      {target?.tourGuideId ? (
        <p className="rounded-lg bg-amber-50 px-3 py-2 text-xs text-amber-800 ring-1 ring-amber-200">
          {t('deleteImpactGuide')}
        </p>
      ) : null}
    </AdminConfirmDialog>
  );
}
