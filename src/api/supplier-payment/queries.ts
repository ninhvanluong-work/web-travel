import { createMutation, createQuery } from 'react-query-kit';

import {
  createSupplierPayment,
  deleteSupplierPayment,
  getSupplierPaymentList,
  updateSupplierPayment,
} from './requests';
import type {
  ISupplierPayment,
  ISupplierPaymentListParams,
  ISupplierPaymentListResult,
  SupplierPaymentPayload,
} from './types';

export const useSupplierPaymentList = createQuery<ISupplierPaymentListResult, ISupplierPaymentListParams>({
  primaryKey: '/supplier-payment/list',
  queryFn: ({ queryKey: [, variables] }) => getSupplierPaymentList(variables ?? {}),
  staleTime: 0,
});

export const useCreateSupplierPayment = createMutation<ISupplierPayment, SupplierPaymentPayload>({
  mutationFn: (payload) => createSupplierPayment(payload),
});

export const useUpdateSupplierPayment = createMutation<
  ISupplierPayment,
  { id: string; payload: SupplierPaymentPayload }
>({
  mutationFn: ({ id, payload }) => updateSupplierPayment(id, payload),
});

export const useDeleteSupplierPayment = createMutation<void, { id: string }>({
  mutationFn: ({ id }) => deleteSupplierPayment(id),
});
