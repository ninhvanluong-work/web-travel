import { ensureAdminAuth } from '../admin-auth-guard';
import { request } from '../axios';
import type {
  AdminUserCreatePayload,
  AdminUserUpdatePayload,
  ApiUserDetailResponse,
  ApiUserItem,
  ApiUserListResponse,
  IAdminUser,
  IAdminUserListParams,
  IAdminUserListResult,
  IUserSummary,
  UserRole,
} from './types';
import { USER_ROLES } from './types';

const unwrap = (res: ApiUserDetailResponse): ApiUserItem =>
  'data' in res && res.data ? res.data : (res as ApiUserItem);

const toUserSummary = (item: ApiUserItem): IUserSummary => {
  const fullName = [item.firstName, item.lastName].filter(Boolean).join(' ').trim();
  return {
    id: item.id,
    name: item.name?.trim() || fullName || null,
    email: item.email ?? null,
  };
};

const toRole = (role: string | null | undefined): UserRole =>
  (USER_ROLES as readonly string[]).includes(role ?? '') ? (role as UserRole) : 'normal';

const toAdminUser = (item: ApiUserItem): IAdminUser => ({
  id: item.id,
  name: item.name?.trim() || null,
  email: item.email ?? null,
  role: toRole(item.role),
  tourGuideId: item.tourGuideId ?? null,
  createdAt: item.createdAt ?? '',
  updatedAt: item.updatedAt ?? '',
});

export async function getUserSummary(id: string): Promise<IUserSummary> {
  const { data } = await request.get<ApiUserDetailResponse>(`/user/${id}`);
  return toUserSummary(unwrap(data));
}

export async function getAdminUserList(params: IAdminUserListParams): Promise<IAdminUserListResult> {
  const cleanParams = Object.fromEntries(
    Object.entries(params).filter(([, v]) => v !== '' && v !== undefined && v !== null)
  );
  const { data } = await request.get<ApiUserListResponse>('/user', { params: cleanParams });
  return { items: data.data.items.map(toAdminUser), pagination: data.data.pagination };
}

export async function getAdminUserById(id: string): Promise<IAdminUser> {
  const { data } = await request.get<ApiUserDetailResponse>(`/user/${id}`);
  return toAdminUser(unwrap(data));
}

export async function createAdminUser(payload: AdminUserCreatePayload): Promise<IAdminUser> {
  ensureAdminAuth();
  const { data } = await request.post<ApiUserDetailResponse>('/user', payload);
  return toAdminUser(unwrap(data));
}

export async function updateAdminUser(id: string, payload: AdminUserUpdatePayload): Promise<IAdminUser> {
  ensureAdminAuth();
  const { data } = await request.put<ApiUserDetailResponse>(`/user/${id}`, payload);
  return toAdminUser(unwrap(data));
}

export async function deleteAdminUser(id: string): Promise<void> {
  ensureAdminAuth();
  await request.delete(`/user/${id}`);
}

/** Admin sets a new password directly (the BE has no "send reset email" for this flow). */
export async function resetAdminUserPassword(id: string, newPassword: string): Promise<void> {
  ensureAdminAuth();
  await request.post(`/user/${id}/reset-password`, { newPassword });
}
