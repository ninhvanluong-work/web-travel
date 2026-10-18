import { createMutation, createQuery } from 'react-query-kit';

import {
  createAdminUser,
  deleteAdminUser,
  getAdminUserById,
  getAdminUserList,
  getUserSummary,
  resetAdminUserPassword,
  updateAdminUser,
} from './requests';
import type {
  AdminUserCreatePayload,
  AdminUserUpdatePayload,
  IAdminUser,
  IAdminUserListParams,
  IAdminUserListResult,
  IUserSummary,
} from './types';

// Cached per user id so a table full of rows by the same admin triggers a single request
export const useUserSummary = createQuery<IUserSummary, { id: string }>({
  primaryKey: '/user/summary',
  queryFn: ({ queryKey: [, { id }] }) => getUserSummary(id),
  staleTime: 10 * 60 * 1000,
  retry: false,
});

export const useAdminUserList = createQuery<IAdminUserListResult, IAdminUserListParams>({
  primaryKey: '/user/list',
  queryFn: ({ queryKey: [, variables] }) => getAdminUserList(variables ?? {}),
  // Global default is `refetchOnMount: false`; override so returning from create/edit shows fresh data
  refetchOnMount: true,
});

export const useAdminUserById = createQuery<IAdminUser, { id: string }>({
  primaryKey: '/user/detail',
  queryFn: ({ queryKey: [, { id }] }) => getAdminUserById(id),
});

export const useCreateAdminUser = createMutation<IAdminUser, AdminUserCreatePayload>({
  mutationFn: (payload) => createAdminUser(payload),
});

export const useUpdateAdminUser = createMutation<IAdminUser, { id: string; payload: AdminUserUpdatePayload }>({
  mutationFn: ({ id, payload }) => updateAdminUser(id, payload),
});

export const useDeleteAdminUser = createMutation<void, { id: string }>({
  mutationFn: ({ id }) => deleteAdminUser(id),
});

export const useResetAdminUserPassword = createMutation<void, { id: string; newPassword: string }>({
  mutationFn: ({ id, newPassword }) => resetAdminUserPassword(id, newPassword),
});
