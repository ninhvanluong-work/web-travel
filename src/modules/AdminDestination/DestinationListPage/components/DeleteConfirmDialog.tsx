import { useTranslation } from 'next-i18next';

import type { IDestination } from '@/api/destination/types';
import { AdminConfirmDialog } from '@/components/ui/admin-confirm-dialog';

import { DESTINATION_NS } from '../../constants';

interface DeleteConfirmDialogProps {
  target: IDestination | null;
  isDeleting: boolean;
  onConfirm: () => void;
  onCancel: () => void;
}

export function DeleteConfirmDialog({ target, isDeleting, onConfirm, onCancel }: DeleteConfirmDialogProps) {
  const { t } = useTranslation(DESTINATION_NS);

  return (
    <AdminConfirmDialog
      open={!!target}
      title={t('confirmDeleteTitle')}
      description={t('confirmDeleteMessage', { name: target?.name })}
      confirmLabel={t('deleteDestination')}
      cancelLabel={t('cancel')}
      isPending={isDeleting}
      onConfirm={onConfirm}
      onCancel={onCancel}
    />
  );
}
