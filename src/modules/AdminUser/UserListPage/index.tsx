import { Shield, User, UserCheck, Users } from 'lucide-react';
import { useRouter } from 'next/router';
import { useTranslation } from 'next-i18next';
import { useCallback, useState } from 'react';

import { useAdminUserList } from '@/api/user/queries';
import type { IAdminUser } from '@/api/user/types';
import { Icons } from '@/assets/icons';
import { AdminPagination } from '@/components/ui/admin-pagination';
import { AdminSearchInput } from '@/components/ui/admin-search-input';
import { Button } from '@/components/ui/button';
import { StatCard } from '@/components/ui/stat-card';
import { useAdminUserFilters } from '@/hooks/use-admin-user-filters';

import { DeleteUserDialog } from '../components/delete-user-dialog';
import { ResetPasswordDialog } from '../components/reset-password-dialog';
import { USER_NS, USER_PAGE_SIZE, USER_ROUTES } from '../constants';
import { useAdminActor } from '../hooks/use-admin-actor';
import { useUserDeleteAction } from '../hooks/use-user-delete-action';
import { getAssignableRoles } from '../permissions';
import { UserRoleFilter } from './components/user-role-filter';
import { UserTable } from './components/UserTable';

/** One tiny request per role for the stat cards (pageSize 1, only `pagination.total` is used) */
function useRoleTotal(role?: IAdminUser['role']) {
  const { data } = useAdminUserList({ variables: { role, page: 1, pageSize: 1 } });
  return data?.pagination.total;
}

export default function UserListPage() {
  const { t } = useTranslation(USER_NS);
  const router = useRouter();
  const actor = useAdminActor();
  const canCreate = getAssignableRoles(actor.role).length > 0;

  const { keyword, setKeyword, role, setRole, page, setPage, hasFilters, resetFilters } = useAdminUserFilters();

  const { data, isLoading, isFetching } = useAdminUserList({
    variables: { keyword, role, page, pageSize: USER_PAGE_SIZE },
    keepPreviousData: true,
  });

  const totalAll = useRoleTotal();
  const totalAdmins = useRoleTotal('admin');
  const totalSuperAdmins = useRoleTotal('super_admin');
  const totalGuides = useRoleTotal('tour_guide');
  const totalCustomers = useRoleTotal('normal');
  const adminsCount =
    totalAdmins === undefined || totalSuperAdmins === undefined ? undefined : totalAdmins + totalSuperAdmins;

  const items = data?.items ?? [];
  const total = data?.pagination.total ?? 0;
  const totalPages = Math.max(1, data?.pagination.totalPages ?? 1);

  const [resetTarget, setResetTarget] = useState<IAdminUser | null>(null);

  const handleDeleted = useCallback(() => {
    // Step back when the last row of a non-first page was removed
    if (items.length === 1 && page > 1) setPage(page - 1);
  }, [items.length, page, setPage]);

  const { deleteTarget, setDeleteTarget, handleDeleteConfirm, handleDeleteCancel, isDeleting } =
    useUserDeleteAction(handleDeleted);

  return (
    <div className="min-h-full bg-gray-50 dark:bg-gray-900 p-6 space-y-5">
      {/* Page header */}
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold tracking-tight text-gray-900 dark:text-white">{t('listTitle')}</h1>
        {canCreate ? (
          <Button
            variant="primary"
            size="xs"
            rounded="md"
            blur={false}
            className="flex items-center gap-1.5 px-5 h-9 bg-brand-500 hover:bg-brand-600 border-0 shadow-theme-xs"
            onClick={() => router.push(USER_ROUTES.CREATE)}
          >
            <Icons.plusCircle size={15} />
            {t('addUser')}
          </Button>
        ) : null}
      </div>

      {/* Stat cards */}
      <div className="grid grid-cols-4 gap-4">
        <StatCard
          label={t('totalUsers')}
          value={totalAll ?? '—'}
          icon={Users}
          accentClass="bg-blue-500"
          lightBgClass="bg-blue-50"
          iconColorClass="text-blue-600"
        />
        <StatCard
          label={t('statCustomers')}
          value={totalCustomers ?? '—'}
          icon={User}
          accentClass="bg-gray-400"
          lightBgClass="bg-gray-100"
          iconColorClass="text-gray-600"
        />
        <StatCard
          label={t('statGuides')}
          value={totalGuides ?? '—'}
          icon={UserCheck}
          accentClass="bg-emerald-500"
          lightBgClass="bg-emerald-50"
          iconColorClass="text-emerald-600"
        />
        <StatCard
          label={t('statAdmins')}
          value={adminsCount ?? '—'}
          icon={Shield}
          accentClass="bg-purple-500"
          lightBgClass="bg-purple-50"
          iconColorClass="text-purple-600"
        />
      </div>

      {/* Main table card */}
      <div className="overflow-hidden bg-white rounded-2xl border border-gray-200 shadow-theme-xs dark:border-gray-800 dark:bg-white/[0.03]">
        <div className="px-5 py-5 flex flex-wrap items-center gap-3 border-b border-gray-100 dark:border-gray-800">
          <AdminSearchInput
            value={keyword}
            onSearch={setKeyword}
            placeholder={t('searchPlaceholder')}
            isSearching={isFetching && !isLoading}
          />
          <UserRoleFilter value={role} onChange={setRole} />
        </div>

        <div className="pt-2">
          <UserTable
            users={items}
            actor={actor}
            isInitialLoading={isLoading}
            isFetching={isFetching}
            hasFilters={hasFilters}
            onClearFilters={resetFilters}
            onResetPassword={setResetTarget}
            onDelete={setDeleteTarget}
          />
        </div>

        <AdminPagination
          labels={{ showing: t('showing'), prev: t('prev'), next: t('next'), unit: t('usersUnit') }}
          page={page}
          totalPages={totalPages}
          total={total}
          itemsCount={items.length}
          pageSize={USER_PAGE_SIZE}
          onPageChange={setPage}
        />
      </div>

      <ResetPasswordDialog target={resetTarget} onClose={() => setResetTarget(null)} />
      <DeleteUserDialog
        target={deleteTarget}
        isDeleting={isDeleting}
        onConfirm={handleDeleteConfirm}
        onCancel={handleDeleteCancel}
      />
    </div>
  );
}
