import { Loader2 } from 'lucide-react';
import { useTranslation } from 'next-i18next';
import { useEffect, useId, useState } from 'react';

import { useResetAdminUserPassword } from '@/api/user/queries';
import type { IAdminUser } from '@/api/user/types';
import { DIALOG_CANCEL_CLASS, DIALOG_PRIMARY_CLASS } from '@/components/ui/admin-confirm-dialog';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { getAdminUserApiError } from '@/hooks/use-admin-user-form';
import { resetPasswordSchema } from '@/lib/validations/admin-user';
import { useAlertStore } from '@/stores/use-alert-store';

import { USER_NS } from '../constants';
import { PasswordField } from './password-field';

interface ResetPasswordDialogProps {
  target: IAdminUser | null;
  onClose: () => void;
}

/** Admin sets a new password directly. The value lives only in this dialog's state and is cleared on close. */
export function ResetPasswordDialog({ target, onClose }: ResetPasswordDialogProps) {
  const { t } = useTranslation(USER_NS);
  const fieldId = useId();
  const [password, setPassword] = useState('');
  const [error, setError] = useState<string | null>(null);

  // Never keep a password around once the dialog is closed or switches user
  useEffect(() => {
    setPassword('');
    setError(null);
  }, [target?.id]);

  const resetMutation = useResetAdminUserPassword({
    onSuccess: () => {
      useAlertStore.getState().addAlert({ type: 'success', title: t('passwordResetSuccess') });
      setPassword('');
      onClose();
    },
    onError: (err: unknown) => {
      useAlertStore.getState().addAlert({ type: 'error', title: getAdminUserApiError(err, t('passwordResetFailed')) });
    },
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!target) return;
    const parsed = resetPasswordSchema.safeParse({ newPassword: password });
    if (!parsed.success) {
      setError(t(parsed.error.issues[0].message.replace(`${USER_NS}:`, '')));
      return;
    }
    setError(null);
    resetMutation.mutate({ id: target.id, newPassword: parsed.data.newPassword });
  };

  const isPending = resetMutation.isLoading;
  const displayName = target?.name || target?.email || t('noName');

  return (
    <Dialog
      open={!!target}
      onOpenChange={(open) => {
        if (!open && !isPending) onClose();
      }}
    >
      <DialogContent className="sm:max-w-[460px]">
        <form onSubmit={handleSubmit} className="space-y-5">
          <DialogHeader>
            <DialogTitle>{t('resetPasswordTitle')}</DialogTitle>
            <DialogDescription>{t('resetPasswordDescription', { name: displayName })}</DialogDescription>
          </DialogHeader>

          <div className="space-y-1.5">
            <label htmlFor={fieldId} className="text-[13px] text-slate-500 font-medium">
              {t('newPasswordLabel')}
            </label>
            <PasswordField
              id={fieldId}
              value={password}
              onChange={(v) => {
                setPassword(v);
                if (error) setError(null);
              }}
              invalid={!!error}
              disabled={isPending}
              aria-describedby={error ? `${fieldId}-error` : undefined}
            />
            {error ? (
              <p id={`${fieldId}-error`} role="alert" className="text-sm text-destructive font-medium">
                {error}
              </p>
            ) : (
              <p className="text-xs text-gray-400">{t('passwordHint')}</p>
            )}
          </div>

          <DialogFooter className="gap-2 sm:gap-2">
            <button type="button" onClick={onClose} disabled={isPending} className={DIALOG_CANCEL_CLASS}>
              {t('cancel')}
            </button>
            <button type="submit" disabled={isPending} className={DIALOG_PRIMARY_CLASS}>
              {isPending ? <Loader2 size={14} className="animate-spin" /> : null}
              {t('confirmReset')}
            </button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
