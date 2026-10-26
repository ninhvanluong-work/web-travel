import { Loader2 } from 'lucide-react';
import { useTranslation } from 'next-i18next';
import { useId } from 'react';

import { DIALOG_CANCEL_CLASS, DIALOG_PRIMARY_CLASS } from '@/components/ui/admin-confirm-dialog';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { FormControl, FormField, FormItem, FormLabel, FormMessage, FormWrapper } from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { type ChangePasswordScope, useChangePassword } from '@/hooks/use-change-password';
import type { ChangePasswordSchema } from '@/lib/validations/auth';

const labelClass = 'text-[13px] text-slate-500 font-medium';

const FIELDS: { name: keyof ChangePasswordSchema; labelKey: string; autoComplete: string }[] = [
  { name: 'oldPassword', labelKey: 'changePassword.oldLabel', autoComplete: 'current-password' },
  { name: 'newPassword', labelKey: 'changePassword.newLabel', autoComplete: 'new-password' },
  { name: 'confirmPassword', labelKey: 'changePassword.confirmLabel', autoComplete: 'new-password' },
];

interface ChangePasswordDialogProps {
  open: boolean;
  onClose: () => void;
  scope: ChangePasswordScope;
}

/** Change the signed-in user's own password. Used by the admin sidebar and the client user menu. */
export function ChangePasswordDialog({ open, onClose, scope }: ChangePasswordDialogProps) {
  const { t } = useTranslation('common');
  const formId = useId();
  const { form, onSubmit, resetForm, isPending } = useChangePassword(scope, onClose);
  const newPassword = form.watch('newPassword');

  const handleClose = () => {
    if (isPending) return;
    // Never keep typed passwords around after the dialog closes
    resetForm();
    onClose();
  };

  return (
    <Dialog open={open} onOpenChange={(next) => !next && handleClose()}>
      <DialogContent className="max-w-[400px]">
        <DialogHeader>
          <DialogTitle>{t('changePassword.title')}</DialogTitle>
          <DialogDescription>{t('changePassword.description')}</DialogDescription>
        </DialogHeader>

        <FormWrapper form={form} onSubmit={onSubmit} formId={formId} className="space-y-4">
          {FIELDS.map(({ name, labelKey, autoComplete }) => (
            <FormField
              key={name}
              control={form.control}
              name={name}
              render={({ field }) => (
                <FormItem className="space-y-1.5">
                  <FormLabel className={labelClass}>{t(labelKey)}</FormLabel>
                  <FormControl>
                    <Input
                      size="sm"
                      type="password"
                      autoComplete={autoComplete}
                      autoCapitalize="none"
                      autoCorrect="off"
                      spellCheck={false}
                      maxLength={100}
                      disabled={isPending}
                      autoFocus={name === 'oldPassword'}
                      {...field}
                    />
                  </FormControl>
                  <FormMessage>
                    {name === 'newPassword' && !newPassword ? (
                      <span className="text-xs font-normal text-gray-400">{t('changePassword.hint')}</span>
                    ) : null}
                  </FormMessage>
                </FormItem>
              )}
            />
          ))}
          <p className="text-xs text-gray-500">{t('changePassword.otherDevices')}</p>
        </FormWrapper>

        <DialogFooter className="flex-row gap-2 sm:gap-2 justify-end">
          <button type="button" onClick={handleClose} disabled={isPending} className={DIALOG_CANCEL_CLASS}>
            {t('changePassword.cancel')}
          </button>
          <button type="submit" form={formId} disabled={isPending} className={DIALOG_PRIMARY_CLASS}>
            {isPending ? <Loader2 size={14} className="animate-spin" /> : null}
            {t('changePassword.submit')}
          </button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
