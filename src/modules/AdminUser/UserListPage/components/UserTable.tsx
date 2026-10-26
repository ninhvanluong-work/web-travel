import { Users } from 'lucide-react';
import { useTranslation } from 'next-i18next';

import type { IAdminUser } from '@/api/user/types';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';

import { USER_NS, USER_PAGE_SIZE } from '../../constants';
import type { Actor } from '../../permissions';
import { canDeleteUser, canManageUser, isSelf } from '../../permissions';
import { UserTableRow } from './UserTableRow';

const COLUMN_COUNT = 6;

const thClass =
  '!text-[11px] !font-semibold !uppercase !tracking-wide !text-gray-500 dark:!text-gray-400 !px-5 !py-3.5 !h-auto';

const SKELETON_ROWS = Array.from({ length: Math.min(USER_PAGE_SIZE, 5) }, (_, i) => (
  <TableRow key={i} className="border-b border-gray-100 dark:border-gray-800 last:border-0">
    <TableCell className="py-5">
      <div className="flex items-center gap-2.5 animate-pulse">
        <div className="w-[32px] h-[32px] shrink-0 rounded-full bg-gray-200 dark:bg-gray-700" />
        <div className="space-y-1.5">
          <div className="h-3.5 w-32 rounded bg-gray-200 dark:bg-gray-700" />
          <div className="h-3 w-44 rounded bg-gray-100 dark:bg-gray-800" />
        </div>
      </div>
    </TableCell>
    {[0, 1, 2, 3].map((c) => (
      <TableCell key={c} className="py-5">
        <div className="h-3 w-20 rounded bg-gray-100 dark:bg-gray-800 animate-pulse" />
      </TableCell>
    ))}
    <TableCell className="w-14" />
  </TableRow>
));

interface UserTableProps {
  users: IAdminUser[];
  actor: Actor;
  isInitialLoading: boolean;
  isFetching: boolean;
  hasFilters: boolean;
  onClearFilters: () => void;
  onResetPassword: (user: IAdminUser) => void;
  onDelete: (user: IAdminUser) => void;
}

export function UserTable({
  users,
  actor,
  isInitialLoading,
  isFetching,
  hasFilters,
  onClearFilters,
  onResetPassword,
  onDelete,
}: UserTableProps) {
  const { t } = useTranslation(USER_NS);

  let body: React.ReactNode;
  if (isInitialLoading) {
    body = SKELETON_ROWS;
  } else if (users.length === 0) {
    body = (
      <TableRow>
        <td colSpan={COLUMN_COUNT}>
          <div className="flex flex-col items-center justify-center py-16 gap-3 text-gray-400">
            <Users size={40} className="opacity-25" />
            <p className="text-sm font-medium text-gray-500">{hasFilters ? t('noUsersFound') : t('noUsersYet')}</p>
            {hasFilters ? (
              <button type="button" onClick={onClearFilters} className="text-xs text-brand-600 hover:underline">
                {t('clearFilters')}
              </button>
            ) : null}
          </div>
        </td>
      </TableRow>
    );
  } else {
    body = users.map((user) => (
      <UserTableRow
        key={user.id}
        user={user}
        isSelf={isSelf(actor, user)}
        canManage={canManageUser(actor, user)}
        canDelete={canDeleteUser(actor, user)}
        onResetPassword={onResetPassword}
        onDelete={onDelete}
      />
    ));
  }

  return (
    <div
      className={`overflow-x-auto transition-opacity ${
        isFetching && !isInitialLoading ? 'opacity-60 pointer-events-none' : ''
      }`}
    >
      <Table>
        <TableHeader>
          <TableRow className="bg-slate-50 dark:bg-white/[0.03] border-b border-gray-200 dark:border-gray-800">
            <TableHead className={`${thClass} min-w-[260px]`}>{t('colUser')}</TableHead>
            <TableHead className={`${thClass} whitespace-nowrap`}>{t('colRole')}</TableHead>
            <TableHead className={`${thClass} whitespace-nowrap`}>{t('colGuideProfile')}</TableHead>
            <TableHead className={`${thClass} whitespace-nowrap w-[110px]`}>{t('colCreatedAt')}</TableHead>
            <TableHead className={`${thClass} whitespace-nowrap w-[110px]`}>{t('colUpdatedAt')}</TableHead>
            <TableHead className={`${thClass} !w-14`} />
          </TableRow>
        </TableHeader>
        <TableBody className="[&_td]:px-5 [&_td]:py-4">{body}</TableBody>
      </Table>
    </div>
  );
}
