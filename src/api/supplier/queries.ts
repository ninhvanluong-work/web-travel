import { createMutation, createQuery } from 'react-query-kit';

import { createSupplier, deleteSupplier, getSupplierById, getSupplierList, updateSupplier } from './requests';
import type { ISupplier, ISupplierListParams, ISupplierListResult, SupplierFormPayload } from './types';

export const useSupplierList = createQuery<ISupplierListResult, ISupplierListParams>({
  primaryKey: '/supplier/list',
  queryFn: ({ queryKey: [, variables] }) => getSupplierList(variables ?? {}),
  staleTime: 0,
});

export const useSupplierById = createQuery<ISupplier, { id: string }>({
  primaryKey: '/supplier/detail',
  queryFn: ({ queryKey: [, { id }] }) => getSupplierById(id),
  staleTime: 2 * 60 * 1000,
});

export const useCreateSupplier = createMutation<ISupplier, SupplierFormPayload>({
  mutationFn: (payload) => createSupplier(payload),
});

export const useUpdateSupplier = createMutation<ISupplier, { id: string; payload: SupplierFormPayload }>({
  mutationFn: ({ id, payload }) => updateSupplier(id, payload),
});

export const useDeleteSupplier = createMutation<void, { id: string }>({
  mutationFn: ({ id }) => deleteSupplier(id),
});
