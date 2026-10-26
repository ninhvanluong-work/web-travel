import { useTranslation } from 'next-i18next';

import { USER_ROLES, type UserRole } from '@/api/user/types';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';

import { USER_NS } from '../../constants';

const ALL = 'all';

interface UserRoleFilterProps {
  value: UserRole | undefined;
  onChange: (role: UserRole | undefined) => void;
}

export function UserRoleFilter({ value, onChange }: UserRoleFilterProps) {
  const { t } = useTranslation(USER_NS);

  return (
    <Select value={value ?? ALL} onValueChange={(v) => onChange(v === ALL ? undefined : (v as UserRole))}>
      <SelectTrigger className="h-11 w-[190px] rounded-xl" aria-label={t('filterRole')}>
        <SelectValue placeholder={t('allRoles')} />
      </SelectTrigger>
      <SelectContent>
        <SelectItem value={ALL}>{t('allRoles')}</SelectItem>
        {USER_ROLES.map((role) => (
          <SelectItem key={role} value={role}>
            {t(`role_${role}`)}
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  );
}
