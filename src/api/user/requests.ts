import { request } from '../axios';
import type { ApiUserDetailResponse, ApiUserItem, IUserSummary } from './types';

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

export async function getUserSummary(id: string): Promise<IUserSummary> {
  const { data } = await request.get<ApiUserDetailResponse>(`/user/${id}`);
  return toUserSummary(unwrap(data));
}
