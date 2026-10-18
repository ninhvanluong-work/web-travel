import dayjs from 'dayjs';
import { Eye, KeyRound, MoreHorizontal, Pencil, Trash2, User } from 'lucide-react';
import Link from 'next/link';
import { useTranslation } from 'next-i18next';
import { memo } from 'react';

import type { IAdminUser } from '@/api/user/types';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { TableCell, TableRow } from '@/components/ui/table';
import { ROUTE } from '@/types';

import { RoleBadge } from '../../components/role-badge';
import { USER_NS, USER_ROUTES } from '../../constants';

function DateCell({ date }: { date: string }) {
  if (!date) return <span className="text-xs text-gray-400">—</span>;
  const d = dayjs(date);
  return (
    <div className="leading-tight tabular-nums">
      <p className="text-xs text-gray-700 dark:text-gray-300">{d.format('DD/MM/YYYY')}</p>
      <p className="mt-0.5 text-[11px] text-gray-400">{d.format('HH:mm')}</p>
    </div>
  );
}

interface Props {
  user: IAdminUser;
  isSelf: boolean;
  canManage: boolean;
  canDelete: boolean;
  onResetPassword: (user: IAdminUser) => void;
  onDelete: (user: IAdminUser) => void;
}

function UserTableRowBase({ user, isSelf, canManage, canDelete, onResetPassword, onDelete }: Props) {
  const { t } = useTranslation(USER_NS);
  const editHref = USER_ROUTES.EDIT(user.id);
  const label = user.name || user.email || t('noName');

  return (
    <TableRow className="hover:bg-gray-50 dark:hover:bg-white/[0.02] transition-colors border-b border-gray-100 dark:border-gray-800 last:border-0">
      {/* User */}
      <TableCell className="py-5">
        <div className="flex items-center gap-2.5">
          <div className="w-[32px] h-[32px] min-w-[32px] shrink-0 rounded-full bg-brand-50 text-brand-600 flex items-center justify-center text-xs font-bold">
            {label.charAt(0).toUpperCase()}
          </div>
          <div className="min-w-0">
            <div className="flex items-center gap-1.5">
              <Link
                href={editHref}
                className="block truncate font-semibold text-sm text-gray-900 dark:text-white/90 hover:text-brand-600 transition-colors"
              >
                {user.name || <span className="font-normal italic text-gray-400">{t('noName')}</span>}
              </Link>
              {isSelf ? (
                <span className="shrink-0 rounded-full bg-gray-100 px-1.5 py-px text-[10px] font-semibold text-gray-500">
                  {t('you')}
                </span>
              ) : null}
            </div>
            <p className="truncate text-xs text-gray-500">{user.email || t('noEmail')}</p>
          </div>
        </div>
      </TableCell>

      {/* Role */}
      <TableCell className="py-5">
        <RoleBadge role={user.role} />
      </TableCell>

      {/* Linked guide profile (1:1) */}
      <TableCell className="py-5">
        {user.tourGuideId ? (
          <Link
            href={ROUTE.ADMIN_GUIDES_EDIT(user.tourGuideId)}
            className="inline-flex items-center gap-1 text-xs text-brand-600 hover:underline"
          >
            <User size={12} />
            {t('viewGuideProfile')}
          </Link>
        ) : (
          <span className="text-xs text-gray-400">—</span>
        )}
      </TableCell>

      <TableCell className="py-5 whitespace-nowrap">
        <DateCell date={user.createdAt} />
      </TableCell>
      <TableCell className="py-5 whitespace-nowrap">
        <DateCell date={user.updatedAt} />
      </TableCell>

      {/* Actions */}
      <TableCell className="w-14">
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button
              variant="ghost"
              aria-label={t('actions')}
              className="h-11 w-11 rounded-xl text-gray-500 hover:text-brand-600 hover:bg-brand-50 p-0"
            >
              <MoreHorizontal size={28} strokeWidth={2.5} />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="min-w-[180px]">
            <DropdownMenuItem asChild>
              <Link href={editHref} className="flex items-center">
                {canManage ? <Pencil size={14} className="mr-2" /> : <Eye size={14} className="mr-2" />}
                {t('edit')}
              </Link>
            </DropdownMenuItem>
            {canManage ? (
              <DropdownMenuItem onSelect={() => onResetPassword(user)}>
                <KeyRound size={14} className="mr-2" />
                {t('resetPassword')}
              </DropdownMenuItem>
            ) : null}
            {canDelete ? (
              <>
                <DropdownMenuSeparator />
                <DropdownMenuItem
                  className="text-red-600 focus:text-red-600 focus:bg-red-50"
                  onSelect={() => onDelete(user)}
                >
                  <Trash2 size={14} className="mr-2" />
                  {t('deleteUser')}
                </DropdownMenuItem>
              </>
            ) : null}
          </DropdownMenuContent>
        </DropdownMenu>
      </TableCell>
    </TableRow>
  );
}

export const UserTableRow = memo(UserTableRowBase);
