import { zodResolver } from '@hookform/resolvers/zod';
import { useQueryClient } from '@tanstack/react-query';
import type { AxiosError } from 'axios';
import { useRouter } from 'next/router';
import { useTranslation } from 'next-i18next';
import { useCallback, useEffect, useRef } from 'react';
import { useForm } from 'react-hook-form';

import { useAdminUserById, useCreateAdminUser, useUpdateAdminUser } from '@/api/user/queries';
import type { IAdminUser } from '@/api/user/types';
import { getApiErrorMessage } from '@/lib/utils';
import { adminUserCreateSchema, type AdminUserFormValues, adminUserUpdateSchema } from '@/lib/validations/admin-user';
import { USER_NS, USER_ROUTES } from '@/modules/AdminUser/constants';
import { useAlertStore } from '@/stores/use-alert-store';

const DEFAULT_VALUES: AdminUserFormValues = { email: '', name: '', role: 'normal', password: '' };

// The axios interceptor rejects with the response body ({ statusCode, message }), not an AxiosError
export function getAdminUserApiError(err: unknown, fallback: string): string {
  return getApiErrorMessage(err, fallback);
}

const getApiStatus = (err: unknown) =>
  (err as { statusCode?: number } | null)?.statusCode ?? (err as AxiosError | null)?.response?.status;

/** Refresh lists (including inactive ones) and audit labels after a user mutation. */
export function invalidateAdminUserQueries(queryClient: ReturnType<typeof useQueryClient>) {
  queryClient.invalidateQueries({ queryKey: ['/user/list'], refetchType: 'all' });
  queryClient.invalidateQueries({ queryKey: ['/user/summary'] });
}

const toFormValues = (user: IAdminUser): AdminUserFormValues => ({
  email: user.email ?? '',
  name: user.name ?? '',
  role: user.role,
});

export function useAdminUserForm(userId?: string) {
  const router = useRouter();
  const queryClient = useQueryClient();
  const { t } = useTranslation(USER_NS);
  const isEdit = !!userId;

  const detailQuery = useAdminUserById({
    variables: { id: userId ?? '' },
    enabled: isEdit,
    retry: (count, err) => getApiStatus(err) !== 404 && count < 2,
    refetchOnWindowFocus: false,
  });

  const form = useForm<AdminUserFormValues>({
    resolver: zodResolver(isEdit ? adminUserUpdateSchema : adminUserCreateSchema),
    defaultValues: DEFAULT_VALUES,
  });

  // Populate once per user so background refetches never wipe in-progress edits
  const loadedIdRef = useRef<string | null>(null);
  const user = detailQuery.data;
  useEffect(() => {
    if (!user || loadedIdRef.current === user.id) return;
    loadedIdRef.current = user.id;
    form.reset(toFormValues(user));
  }, [user, form]);

  // After saving we stay on the form: refresh lists in the background and seed the detail cache
  const syncCaches = (saved: IAdminUser) => {
    invalidateAdminUserQueries(queryClient);
    queryClient.setQueryData(useAdminUserById.getKey({ id: saved.id }), saved);
  };

  const onError = (err: unknown) => {
    const message = getAdminUserApiError(err, t('genericError'));
    // Duplicate / invalid email is reported on the field itself, not only as a toast
    if (/email/i.test(message)) form.setError('email', { type: 'server', message });
    useAlertStore.getState().addAlert({ type: 'error', title: message });
  };

  const createMutation = useCreateAdminUser({
    onSuccess: (created) => {
      syncCaches(created);
      useAlertStore.getState().addAlert({ type: 'success', title: t('userCreated') });
      // Continue on the edit page so a second save updates instead of creating a duplicate
      router.replace(USER_ROUTES.EDIT(created.id));
    },
    onError,
  });

  const updateMutation = useUpdateAdminUser({
    onSuccess: (updated) => {
      syncCaches(updated);
      form.reset(toFormValues(updated));
      useAlertStore.getState().addAlert({ type: 'success', title: t('userUpdated') });
    },
    onError,
  });

  const onSubmit = useCallback(
    (values: AdminUserFormValues) => {
      const name = values.name || undefined;
      if (userId) {
        // Only send role when it changed: re-sending an unchanged admin/super_admin role is rejected
        // by the BE rules ("nobody can assign super_admin")
        const role = user && values.role === user.role ? undefined : values.role;
        updateMutation.mutate({ id: userId, payload: { email: values.email || undefined, name, role } });
      } else {
        createMutation.mutate({ email: values.email, name, role: values.role, password: values.password ?? '' });
      }
    },
    [userId, user, createMutation, updateMutation]
  );

  const isNotFound = isEdit && getApiStatus(detailQuery.error) === 404;

  return {
    form,
    isEdit,
    user,
    isLoadingDetail: isEdit && detailQuery.isLoading && !isNotFound,
    isNotFound,
    onSubmit,
    isPending: createMutation.isLoading || updateMutation.isLoading,
  };
}
