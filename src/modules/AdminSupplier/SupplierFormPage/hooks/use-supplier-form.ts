import { useQueryClient } from '@tanstack/react-query';
import { useRouter } from 'next/router';
import { useTranslation } from 'next-i18next';
import { useEffect, useState } from 'react';

import { useCreateSupplier, useSupplierById, useUpdateSupplier } from '@/api/supplier/queries';
import type { SupplierFormPayload } from '@/api/supplier/types';
import { useAlertStore } from '@/stores/use-alert-store';
import { ROUTE } from '@/types';

export interface SupplierFormValues {
  name: string;
  contact: string;
  avatar: string;
}

const EMPTY: SupplierFormValues = { name: '', contact: '', avatar: '' };

export function useSupplierForm(supplierId?: string) {
  const { t } = useTranslation('adminPage');
  const router = useRouter();
  const queryClient = useQueryClient();
  const { addAlert } = useAlertStore.getState();
  const isEdit = !!supplierId;

  const [values, setValues] = useState<SupplierFormValues>(EMPTY);
  const [nameError, setNameError] = useState('');

  const { data: supplier, isLoading: isLoadingSupplier } = useSupplierById({
    variables: { id: supplierId ?? '' },
    enabled: isEdit && !!supplierId,
  } as any);

  useEffect(() => {
    if (supplier) {
      setValues({ name: supplier.name, contact: supplier.contact, avatar: supplier.avatar ?? '' });
    }
  }, [supplier]);

  const invalidate = () => {
    queryClient.removeQueries({ queryKey: ['/supplier/list'] });
    queryClient.removeQueries({ queryKey: ['/supplier/detail'] });
  };

  const createMutation = useCreateSupplier({
    onSuccess: () => {
      invalidate();
      addAlert({ type: 'success', title: t('supplierCreated') });
      router.push(ROUTE.ADMIN_SUPPLIERS);
    },
    onError: () => addAlert({ type: 'error', title: t('saveFailed') }),
  });

  const updateMutation = useUpdateSupplier({
    onSuccess: () => {
      invalidate();
      addAlert({ type: 'success', title: t('supplierUpdated') });
      router.push(ROUTE.ADMIN_SUPPLIERS);
    },
    onError: () => addAlert({ type: 'error', title: t('saveFailed') }),
  });

  const validate = (): boolean => {
    if (!values.name.trim() || values.name.trim().length < 2) {
      setNameError(t('supplierNameError'));
      return false;
    }
    setNameError('');
    return true;
  };

  const onSubmit = () => {
    if (!validate()) return;
    const payload: SupplierFormPayload = {
      name: values.name.trim(),
      contact: values.contact.trim(),
      avatar: values.avatar.trim() || undefined,
    };
    if (isEdit && supplierId) {
      updateMutation.mutate({ id: supplierId, payload });
    } else {
      createMutation.mutate(payload);
    }
  };

  return {
    values,
    setValues,
    nameError,
    isEdit,
    isLoadingSupplier,
    isPending: createMutation.isPending || updateMutation.isPending,
    onSubmit,
  };
}
