import { Loader2, Trash2 } from 'lucide-react';
import { useTranslation } from 'next-i18next';

import type { ITourGuide } from '@/api/tour-guide/types';
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

interface DeleteConfirmDialogProps {
  target: ITourGuide | null;
  isDeleting: boolean;
  onConfirm: () => void;
  onCancel: () => void;
}

export function DeleteConfirmDialog({ target, isDeleting, onConfirm, onCancel }: DeleteConfirmDialogProps) {
  const { t } = useTranslation('adminPage');
  return (
    <AlertDialog
      open={!!target}
      onOpenChange={(open) => {
        if (!open && !isDeleting) onCancel();
      }}
    >
      <AlertDialogContent className="rounded-2xl border-slate-100 shadow-2xl max-w-md dark:border-gray-800/80">
        <AlertDialogHeader>
          <AlertDialogTitle className="text-slate-800 dark:text-white/90 font-bold">
            {t('confirmDeleteTitle')}
          </AlertDialogTitle>
          <AlertDialogDescription className="text-slate-500 dark:text-gray-400">
            {t('confirmDeleteMessage', { name: target?.name })}
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter className="flex flex-row justify-end gap-3 sm:space-x-0 mt-2">
          <AlertDialogCancel
            className="mt-0 h-10 px-5 rounded-xl border border-slate-200 bg-white text-slate-700 hover:bg-slate-50 hover:text-slate-800 transition-all font-semibold text-sm active:scale-95 dark:border-gray-800 dark:bg-transparent dark:text-gray-300 dark:hover:bg-gray-800 shrink-0"
            onClick={onCancel}
            disabled={isDeleting}
          >
            {t('cancel')}
          </AlertDialogCancel>
          <Button
            disabled={isDeleting}
            onClick={onConfirm}
            blur={false}
            className="h-10 px-5 rounded-xl bg-rose-600 hover:bg-rose-700 hover:text-white transition-all font-semibold text-sm active:scale-95 active:bg-rose-800 border-0 flex items-center gap-1.5 shrink-0 shadow-sm disabled:opacity-50"
          >
            {isDeleting ? (
              <Loader2 size={14} className="animate-spin mr-1.5" />
            ) : (
              <Trash2 size={14} className="mr-1.5" />
            )}
            {isDeleting ? t('deleting') : t('deleteGuide')}
          </Button>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}
