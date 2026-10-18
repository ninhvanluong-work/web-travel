import type { UserRole } from '@/api/user/types';
import { ROUTE } from '@/types';

export const USER_ROUTES = {
  LIST: ROUTE.ADMIN_USERS,
  CREATE: ROUTE.ADMIN_USERS_CREATE,
  EDIT: ROUTE.ADMIN_USERS_EDIT,
} as const;

export const USER_NS = 'adminUser';

export const USER_PAGE_SIZE = 10;

export const USER_FORM_ID = 'admin-user-form';

/** Badge styling per role (labels come from i18n `role_<role>`) */
export const ROLE_BADGE_CLASS: Record<UserRole, string> = {
  super_admin: 'bg-purple-50 text-purple-700 ring-purple-200',
  admin: 'bg-blue-50 text-blue-700 ring-blue-200',
  tour_guide: 'bg-emerald-50 text-emerald-700 ring-emerald-200',
  normal: 'bg-gray-50 text-gray-600 ring-gray-200',
};
