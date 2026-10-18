// ─── Audit label (createdBy / updatedBy) ──────────────────────────────────────

/** Minimal user info used to display audit fields (createdBy / updatedBy). */
export interface IUserSummary {
  id: string;
  name: string | null;
  email: string | null;
}

// ─── Admin user management ────────────────────────────────────────────────────

export const USER_ROLES = ['normal', 'tour_guide', 'admin', 'super_admin'] as const;
export type UserRole = (typeof USER_ROLES)[number];

export interface IAdminUser {
  id: string;
  name: string | null;
  /** Can be null (e.g. legacy/guest accounts) */
  email: string | null;
  role: UserRole;
  /** 1:1 link to a tour guide profile (only for role tour_guide) */
  tourGuideId: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface IAdminUserPagination {
  page: number;
  pageSize: number;
  total: number;
  totalPages: number;
}

export interface IAdminUserListParams {
  /** Matches name and email */
  keyword?: string;
  role?: UserRole;
  page?: number;
  pageSize?: number;
}

export interface IAdminUserListResult {
  items: IAdminUser[];
  pagination: IAdminUserPagination;
}

/** BE rules: admin may assign normal/tour_guide; super_admin may also assign admin; nobody can assign super_admin. */
export interface AdminUserCreatePayload {
  email: string;
  password: string;
  name?: string;
  role: UserRole;
}

export interface AdminUserUpdatePayload {
  email?: string;
  name?: string;
  role?: UserRole;
}

// ─── Raw API types ────────────────────────────────────────────────────────────

/** Raw user payload; the backend may or may not wrap it in `{ data }`. */
export interface ApiUserItem {
  id: string;
  name?: string | null;
  firstName?: string | null;
  lastName?: string | null;
  email?: string | null;
  role?: string | null;
  tourGuideId?: string | null;
  createdAt?: string;
  updatedAt?: string;
}

export type ApiUserDetailResponse = { data: ApiUserItem } | ApiUserItem;

export interface ApiUserListResponse {
  data: { items: ApiUserItem[]; pagination: IAdminUserPagination };
  code: number;
  message: string;
  error: unknown;
}
