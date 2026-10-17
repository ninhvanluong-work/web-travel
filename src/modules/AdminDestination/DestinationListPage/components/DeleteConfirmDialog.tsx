import { Loader2 } from 'lucide-react';
import { useTranslation } from 'next-i18next';

import type { IDestination } from '@/api/destination/types';
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

import { DESTINATION_NS, DIALOG_CANCEL_CLASS, DIALOG_DANGER_CLASS } from '../../constants';

interface DeleteConfirmDialogProps {
  target: IDestination | null;
  isDeleting: boolean;
  onConfirm: () => void;
  onCancel: () => void;
}

export function DeleteConfirmDialog({ target, isDeleting, onConfirm, onCancel }: DeleteConfirmDialogProps) {
  const { t } = useTranslation(DESTINATION_NS);

  return (
    <AlertDialog
      open={!!target}
      onOpenChange={(open) => {
        if (!open) onCancel();
      }}
    >
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>{t('confirmDeleteTitle')}</AlertDialogTitle>
          <AlertDialogDescription>{t('confirmDeleteMessage', { name: target?.name })}</AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel onClick={onCancel} disabled={isDeleting} className={DIALOG_CANCEL_CLASS}>
            {t('cancel')}
          </AlertDialogCancel>
          <AlertDialogAction
            onClick={(e) => {
              // Keep the dialog open until the request settles
              e.preventDefault();
              onConfirm();
            }}
            disabled={isDeleting}
            className={DIALOG_DANGER_CLASS}
          >
            {isDeleting ? <Loader2 size={14} className="animate-spin" /> : null}
            {t('deleteDestination')}
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}
