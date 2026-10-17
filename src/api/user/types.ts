/** Minimal user info used to display audit fields (createdBy / updatedBy). */
export interface IUserSummary {
  id: string;
  name: string | null;
  email: string | null;
}

/** Raw user payload; the backend may or may not wrap it in `{ data }`. */
export interface ApiUserItem {
  id: string;
  name?: string | null;
  firstName?: string | null;
  lastName?: string | null;
  email?: string | null;
}

export type ApiUserDetailResponse = { data: ApiUserItem } | ApiUserItem;
