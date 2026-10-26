import { useTranslation } from 'next-i18next';

import type { UserRole } from '@/api/user/types';
import { cn } from '@/lib/utils';

import { ROLE_BADGE_CLASS, USER_NS } from '../constants';

export function RoleBadge({ role }: { role: UserRole }) {
  const { t } = useTranslation(USER_NS);
  return (
    <span
      className={cn(
        'inline-flex items-center whitespace-nowrap text-xs font-medium px-2 py-0.5 rounded-full ring-1',
        ROLE_BADGE_CLASS[role]
      )}
    >
      {t(`role_${role}`)}
    </span>
  );
}
