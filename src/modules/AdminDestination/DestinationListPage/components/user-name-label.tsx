import { useTranslation } from 'next-i18next';

import { useUserSummary } from '@/api/user/queries';
import { cn } from '@/lib/utils';
import { useAdminStore } from '@/stores/AdminStore';

import { DESTINATION_NS } from '../../constants';

const shortId = (id: string) => `${id.slice(0, 8)}…`;

/**
 * Resolves an audit user id (createdBy / updatedBy) to a readable label.
 * Order: current admin (no request) → GET /user/:id (cached per id) → short id.
 */
function useUserLabel(userId: string | null) {
  const { t } = useTranslation(DESTINATION_NS);
  const adminUser = useAdminStore.use.adminUser();
  const isMe = !!userId && adminUser?.id === userId;

  const { data, isLoading } = useUserSummary({
    variables: { id: userId ?? '' },
    enabled: !!userId && !isMe,
  });

  if (!userId) return { label: t('systemUser'), initial: '·', isSystem: true, isMe: false };

  let label: string;
  if (isMe) label = adminUser.name || adminUser.email;
  else if (data) label = data.name || data.email || shortId(userId);
  else label = isLoading ? '…' : shortId(userId);

  return { label, initial: label.charAt(0).toUpperCase(), isSystem: false, isMe };
}

interface UserLabelProps {
  userId: string | null;
  className?: string;
}

/** Plain text label, e.g. "admin@admin.com (you)". */
export function UserNameLabel({ userId, className }: UserLabelProps) {
  const { t } = useTranslation(DESTINATION_NS);
  const { label, isMe } = useUserLabel(userId);

  return (
    <span className={className} title={userId ?? undefined}>
      {isMe ? t('you', { name: label }) : label}
    </span>
  );
}

/** Avatar initial + name, for table columns. */
export function UserChip({ userId, className }: UserLabelProps) {
  const { t } = useTranslation(DESTINATION_NS);
  const { label, initial, isSystem, isMe } = useUserLabel(userId);

  return (
    <div className={cn('flex items-center gap-2 min-w-0', className)} title={userId ?? undefined}>
      <span
        aria-hidden
        className={cn(
          'w-6 h-6 min-w-6 shrink-0 rounded-full flex items-center justify-center text-[10px] font-bold',
          isSystem ? 'bg-gray-100 text-gray-400' : 'bg-brand-50 text-brand-600'
        )}
      >
        {initial}
      </span>
      <div className="min-w-0 leading-tight">
        <p className={cn('truncate text-xs', isSystem ? 'text-gray-400' : 'text-gray-700 dark:text-gray-300')}>
          {label}
        </p>
        {isMe ? <p className="text-[11px] text-gray-400">{t('youBadge')}</p> : null}
      </div>
    </div>
  );
}
