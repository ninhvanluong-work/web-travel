import { Loader2 } from 'lucide-react';
import type { ReactNode } from 'react';

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
import { cn } from '@/lib/utils';

// Same AlertDialog button styling as AdminTourGuide / AdminSupplier dialogs
export const DIALOG_CANCEL_CLASS =
  'mt-0 h-10 px-5 rounded-xl border border-slate-200 bg-white text-slate-700 hover:bg-slate-50 hover:text-slate-800 transition-all font-semibold text-sm active:scale-95 dark:border-gray-800 dark:bg-transparent dark:text-gray-300 dark:hover:bg-gray-800 shrink-0';

export const DIALOG_DANGER_CLASS =
  'h-10 px-5 rounded-xl bg-rose-600 text-white hover:bg-rose-700 hover:text-white transition-all font-semibold text-sm shadow-sm active:scale-95 active:bg-rose-700 border-0 shrink-0 inline-flex items-center gap-1.5 disabled:opacity-60';

export const DIALOG_PRIMARY_CLASS =
  'h-10 px-5 rounded-xl bg-brand-500 text-white hover:bg-brand-600 hover:text-white transition-all font-semibold text-sm shadow-sm active:scale-95 border-0 shrink-0 inline-flex items-center gap-1.5 disabled:opacity-60';

interface AdminConfirmDialogProps {
  open: boolean;
  title: string;
  description: ReactNode;
  confirmLabel: string;
  cancelLabel: string;
  /** Keeps the dialog open and shows a spinner while the request is running */
  isPending?: boolean;
  tone?: 'danger' | 'primary';
  /** Disables the confirm button (e.g. until a required reason is typed) */
  confirmDisabled?: boolean;
  /** Extra content between the description and the buttons (warnings, details) */
  children?: ReactNode;
  onConfirm: () => void;
  onCancel: () => void;
}

/** Confirmation dialog shared by admin pages (delete, discard changes, ...). */
export function AdminConfirmDialog({
  open,
  title,
  description,
  confirmLabel,
  cancelLabel,
  isPending = false,
  tone = 'danger',
  confirmDisabled = false,
  children,
  onConfirm,
  onCancel,
}: AdminConfirmDialogProps) {
  return (
    <AlertDialog
      open={open}
      onOpenChange={(next) => {
        if (!next && !isPending) onCancel();
      }}
    >
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>{title}</AlertDialogTitle>
          <AlertDialogDescription>{description}</AlertDialogDescription>
        </AlertDialogHeader>
        {children}
        <AlertDialogFooter>
          <AlertDialogCancel onClick={onCancel} disabled={isPending} className={DIALOG_CANCEL_CLASS}>
            {cancelLabel}
          </AlertDialogCancel>
          <AlertDialogAction
            onClick={(e) => {
              // Keep the dialog open until the request settles; the caller closes it
              e.preventDefault();
              onConfirm();
            }}
            disabled={isPending || confirmDisabled}
            className={cn(tone === 'danger' ? DIALOG_DANGER_CLASS : DIALOG_PRIMARY_CLASS)}
          >
            {isPending ? <Loader2 size={14} className="animate-spin" /> : null}
            {confirmLabel}
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}
