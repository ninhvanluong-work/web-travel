import { useQueryClient } from '@tanstack/react-query';
import { useRouter } from 'next/router';
import { useTranslation } from 'next-i18next';
import { useEffect, useState } from 'react';

import { useCreateSupplier, useSupplierById, useUpdateSupplier } from '@/api/supplier/queries';
import type { SupplierFormPayload } from '@/api/supplier/types';
import { getApiErrorMessage } from '@/lib/utils';
import { useAlertStore } from '@/stores/use-alert-store';
import { ROUTE } from '@/types';

export interface SupplierFormValues {
  name: string;
  phone: string;
  email: string;
  avatar: string;
}

const EMPTY: SupplierFormValues = { name: '', phone: '', email: '', avatar: '' };

export function useSupplierForm(supplierId?: string) {
  const { t } = useTranslation('adminPage');
  const router = useRouter();
  const queryClient = useQueryClient();
  const { addAlert } = useAlertStore.getState();
  const isEdit = !!supplierId;

  const [values, setValues] = useState<SupplierFormValues>(EMPTY);
  const [nameError, setNameError] = useState('');
  const [phoneError, setPhoneError] = useState('');
  const [emailError, setEmailError] = useState('');

  const { data: supplier, isLoading: isLoadingSupplier } = useSupplierById({
    variables: { id: supplierId ?? '' },
    enabled: isEdit && !!supplierId,
  } as any);

  useEffect(() => {
    if (supplier) {
      setValues({
        name: supplier.name,
        phone: supplier.phone ?? '',
        email: supplier.email ?? '',
        avatar: supplier.avatar ?? '',
      });
    }
  }, [supplier]);

  const invalidate = () => {
    queryClient.removeQueries({ queryKey: ['/supplier/list'] });
    queryClient.removeQueries({ queryKey: ['/supplier/detail'] });
  };

  const handleApiError = (err: any) => {
    const message = getApiErrorMessage(err, t('saveFailed'));
    addAlert({ type: 'error', title: message });
    const lower = message.toLowerCase();
    if (lower.includes('email')) {
      setEmailError(message);
    }
    if (lower.includes('phone')) {
      setPhoneError(message);
    }
    if (lower.includes('name')) {
      setNameError(message);
    }
  };

  const createMutation = useCreateSupplier({
    onSuccess: () => {
      invalidate();
      addAlert({ type: 'success', title: t('supplierCreated') });
      router.push(ROUTE.ADMIN_SUPPLIERS);
    },
    onError: handleApiError,
  });

  const updateMutation = useUpdateSupplier({
    onSuccess: () => {
      invalidate();
      addAlert({ type: 'success', title: t('supplierUpdated') });
      router.push(ROUTE.ADMIN_SUPPLIERS);
    },
    onError: handleApiError,
  });

  const validate = (): boolean => {
    let isValid = true;

    if (!values.name.trim() || values.name.trim().length < 2) {
      setNameError(t('supplierNameError'));
      isValid = false;
    } else {
      setNameError('');
    }

    if (values.phone.trim() && !/^[0-9+\s\-().]{7,20}$/.test(values.phone.trim())) {
      setPhoneError(t('supplierPhoneError'));
      isValid = false;
    } else {
      setPhoneError('');
    }

    if (values.email.trim() && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(values.email.trim())) {
      setEmailError(t('supplierEmailError'));
      isValid = false;
    } else {
      setEmailError('');
    }

    return isValid;
  };

  const onSubmit = () => {
    if (!validate()) return;
    const payload: SupplierFormPayload = {
      name: values.name.trim(),
      phone: values.phone.trim() || undefined,
      email: values.email.trim() || undefined,
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
    phoneError,
    emailError,
    isEdit,
    isLoadingSupplier,
    isPending: createMutation.isPending || updateMutation.isPending,
    onSubmit,
  };
}
