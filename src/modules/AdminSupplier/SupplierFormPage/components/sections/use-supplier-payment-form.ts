import { useQueryClient } from '@tanstack/react-query';
import { useTranslation } from 'next-i18next';
import { useEffect, useState } from 'react';

import { useCreateSupplierPayment, useUpdateSupplierPayment } from '@/api/supplier-payment/queries';
import type { ISupplierPayment, ISupplierPaymentDetails, SupplierPaymentPayload } from '@/api/supplier-payment/types';
import { getApiErrorMessage } from '@/lib/utils';
import { useAlertStore } from '@/stores/use-alert-store';

const EMPTY_DETAILS: ISupplierPaymentDetails = {
  bankName: '',
  accountHolder: '',
  accountNumber: '',
  swiftCode: '',
  cardHolder: '',
  cardNumber: '',
  expiryMonth: '',
  expiryYear: '',
  email: '',
};

export function useSupplierPaymentForm(supplierId: string, target: ISupplierPayment | null, onClose: () => void) {
  const { t } = useTranslation('adminPage');
  const queryClient = useQueryClient();
  const { addAlert } = useAlertStore.getState();

  const [method, setMethod] = useState<string>('bank');
  const [currency, setCurrency] = useState<string>('VND');
  const [isDefault, setIsDefault] = useState(false);
  const [details, setDetails] = useState<ISupplierPaymentDetails>(EMPTY_DETAILS);
  const [errors, setErrors] = useState<Record<string, string>>({});

  const isEdit = !!target;

  const resetToTarget = () => {
    if (target) {
      setMethod(target.method);
      setCurrency(target.currency);
      setIsDefault(target.isDefault);
      setDetails({ ...EMPTY_DETAILS, ...target.details });
    } else {
      setMethod('bank');
      setCurrency('VND');
      setIsDefault(false);
      setDetails(EMPTY_DETAILS);
    }
    setErrors({});
  };

  useEffect(resetToTarget, [target]);

  const setDetail = (key: keyof ISupplierPaymentDetails, value: string) => {
    setDetails((prev) => ({ ...prev, [key]: value }));
    if (errors[key]) setErrors((prev) => ({ ...prev, [key]: '' }));
  };

  const validate = (): boolean => {
    const errs: Record<string, string> = {};
    if (method === 'bank') {
      if (!details.bankName?.trim()) errs.bankName = t('paymentBankNameRequired');
      if (!details.accountHolder?.trim()) errs.accountHolder = t('paymentAccountHolderRequired');
    }
    if (!details.accountNumber?.trim() && method !== 'paypal') errs.accountNumber = t('paymentAccountNumberRequired');
    if (details.email?.trim() && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(details.email.trim())) {
      errs.email = t('supplierEmailError');
    }
    setErrors(errs);
    return Object.keys(errs).length === 0;
  };

  const invalidate = () => queryClient.invalidateQueries({ queryKey: ['/supplier-payment/list'] });

  const createMutation = useCreateSupplierPayment({
    onSuccess: () => {
      invalidate();
      addAlert({ type: 'success', title: t('paymentCreated') });
      onClose();
    },
    onError: (err: any) => {
      addAlert({ type: 'error', title: getApiErrorMessage(err, t('saveFailed')) });
    },
  });

  const updateMutation = useUpdateSupplierPayment({
    onSuccess: () => {
      invalidate();
      addAlert({ type: 'success', title: t('paymentUpdated') });
      onClose();
    },
    onError: (err: any) => {
      addAlert({ type: 'error', title: getApiErrorMessage(err, t('saveFailed')) });
    },
  });

  const isPending = createMutation.isPending || updateMutation.isPending;

  const handleSubmit = () => {
    if (!validate()) return;
    const payload: SupplierPaymentPayload = {
      supplierId,
      method,
      currency,
      isDefault,
      details: {
        bankName: details.bankName?.trim() || undefined,
        accountHolder: details.accountHolder?.trim() || undefined,
        accountNumber: details.accountNumber?.trim() || undefined,
        swiftCode: details.swiftCode?.trim() || undefined,
        cardHolder: details.cardHolder?.trim() || undefined,
        cardNumber: details.cardNumber?.trim() || undefined,
        expiryMonth: details.expiryMonth?.trim() || undefined,
        expiryYear: details.expiryYear?.trim() || undefined,
        email: details.email?.trim() || undefined,
      },
    };
    if (isEdit && target) {
      updateMutation.mutate({ id: target.id, payload });
    } else {
      createMutation.mutate(payload);
    }
  };

  return {
    method,
    setMethod,
    currency,
    setCurrency,
    isDefault,
    setIsDefault,
    details,
    setDetail,
    errors,
    isEdit,
    isPending,
    handleSubmit,
    resetToTarget,
  };
}
