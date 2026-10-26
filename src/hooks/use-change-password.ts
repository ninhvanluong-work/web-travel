import { zodResolver } from '@hookform/resolvers/zod';
import { useTranslation } from 'next-i18next';
import { useCallback } from 'react';
import { useForm } from 'react-hook-form';

import { useChangePasswordMutation } from '@/api/auth';
import { getApiErrorMessage } from '@/lib/utils';
import { type ChangePasswordSchema, changePasswordSchema } from '@/lib/validations/auth';
import { useAdminStore } from '@/stores/AdminStore';
import { useAlertStore } from '@/stores/use-alert-store';
import { useUserStore } from '@/stores/UserStore';

/** Which session the change applies to: the admin store and the client store hold separate tokens */
export type ChangePasswordScope = 'admin' | 'client';

const DEFAULT_VALUES: ChangePasswordSchema = { oldPassword: '', newPassword: '', confirmPassword: '' };

export function useChangePassword(scope: ChangePasswordScope, onSuccess: () => void) {
  const { t } = useTranslation('common');

  const form = useForm<ChangePasswordSchema>({
    resolver: zodResolver(changePasswordSchema),
    defaultValues: DEFAULT_VALUES,
  });

  const mutation = useChangePasswordMutation({
    onSuccess: (data) => {
      // The BE revokes the old refresh token, so the new pair must be stored before any other request
      if (scope === 'admin') useAdminStore.getState().setAdminStore(data);
      else useUserStore.getState().setStore(data);
      form.reset(DEFAULT_VALUES);
      useAlertStore.getState().addAlert({ type: 'success', title: t('changePassword.success') });
      onSuccess();
    },
    onError: (err: unknown) => {
      // The axios interceptor rejects with the response body ({ statusCode, message }), not an AxiosError
      const text = getApiErrorMessage(err, '');
      // Known BE validation errors are shown on the field they belong to
      if (/old password/i.test(text)) {
        form.setError('oldPassword', { type: 'server', message: 'changePassword.oldIncorrect' });
      } else if (/different/i.test(text)) {
        form.setError('newPassword', { type: 'server', message: 'changePassword.sameAsOld' });
      } else {
        useAlertStore.getState().addAlert({ type: 'error', title: t('changePassword.failed') });
      }
    },
  });

  const onSubmit = useCallback(
    ({ oldPassword, newPassword }: ChangePasswordSchema) => mutation.mutate({ oldPassword, newPassword }),
    [mutation]
  );

  const resetForm = useCallback(() => form.reset(DEFAULT_VALUES), [form]);

  return { form, onSubmit, resetForm, isPending: mutation.isLoading };
}
