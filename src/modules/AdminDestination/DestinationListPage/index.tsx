import { MapPin } from 'lucide-react';
import { useRouter } from 'next/router';
import { useTranslation } from 'next-i18next';
import { useCallback } from 'react';

import { useDestinationPagedList } from '@/api/destination/queries';
import type { IDestination } from '@/api/destination/types';
import { Icons } from '@/assets/icons';
import { AdminPagination } from '@/components/ui/admin-pagination';
import { AdminSearchInput } from '@/components/ui/admin-search-input';
import { Button } from '@/components/ui/button';
import { StatCard } from '@/components/ui/stat-card';
import { useDestinationFilters } from '@/hooks/use-destination-filters';

import { DESTINATION_NS, DESTINATION_PAGE_SIZE, DESTINATION_ROUTES } from '../constants';
import { DeleteConfirmDialog } from './components/DeleteConfirmDialog';
import { DestinationTable } from './components/DestinationTable';
import { useDestinationDeleteAction } from './hooks/use-destination-list-actions';

export default function DestinationListPage() {
  const { t } = useTranslation(DESTINATION_NS);
  const router = useRouter();

  const { keyword, setKeyword, clearKeyword, hasKeyword, page, setPage } = useDestinationFilters();

  const { data, isLoading, isFetching } = useDestinationPagedList({
    variables: { keyword, page, pageSize: DESTINATION_PAGE_SIZE },
    keepPreviousData: true,
  });

  // Unfiltered total for the stat card, independent of the search keyword
  const { data: totalData } = useDestinationPagedList({ variables: { page: 1, pageSize: 1 } });

  const items = data?.items ?? [];
  const total = data?.pagination.total ?? 0;
  const totalPages = Math.max(1, data?.pagination.totalPages ?? 1);

  const handleDeleted = useCallback(() => {
    // Step back when the last row of a non-first page was removed
    if (items.length === 1 && page > 1) setPage(page - 1);
  }, [items.length, page, setPage]);

  const { deleteTarget, setDeleteTarget, handleDeleteConfirm, handleDeleteCancel, isDeleting } =
    useDestinationDeleteAction(handleDeleted);

  const handleDelete = useCallback((destination: IDestination) => setDeleteTarget(destination), [setDeleteTarget]);

  return (
    <div className="min-h-full bg-gray-50 dark:bg-gray-900 p-6 space-y-5">
      {/* Page header */}
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold tracking-tight text-gray-900 dark:text-white">{t('listTitle')}</h1>
        <Button
          variant="primary"
          size="xs"
          rounded="md"
          blur={false}
          className="flex items-center gap-1.5 px-5 h-9 bg-brand-500 hover:bg-brand-600 border-0 shadow-theme-xs"
          onClick={() => router.push(DESTINATION_ROUTES.CREATE)}
        >
          <Icons.plusCircle size={15} />
          {t('addDestination')}
        </Button>
      </div>

      {/* Stat cards */}
      <div className="grid grid-cols-3 gap-4">
        <StatCard
          label={t('totalDestinations')}
          value={totalData?.pagination.total ?? '—'}
          icon={MapPin}
          accentClass="bg-blue-500"
          lightBgClass="bg-blue-50"
          iconColorClass="text-blue-600"
        />
      </div>

      {/* Main table card */}
      <div className="overflow-hidden bg-white rounded-2xl border border-gray-200 shadow-theme-xs dark:border-gray-800 dark:bg-white/[0.03]">
        {/* Toolbar */}
        <div className="px-5 py-5 flex items-center justify-between gap-4 border-b border-gray-100 dark:border-gray-800">
          <AdminSearchInput
            value={keyword}
            onSearch={setKeyword}
            placeholder={t('searchPlaceholder')}
            isSearching={isFetching && !isLoading}
          />
        </div>

        <div className="pt-2">
          <DestinationTable
            destinations={items}
            isInitialLoading={isLoading}
            isFetching={isFetching}
            hasKeyword={hasKeyword}
            onClearKeyword={clearKeyword}
            onDelete={handleDelete}
          />
        </div>

        <AdminPagination
          labels={{ showing: t('showing'), prev: t('prev'), next: t('next'), unit: t('destinationsUnit') }}
          page={page}
          totalPages={totalPages}
          total={total}
          itemsCount={items.length}
          pageSize={DESTINATION_PAGE_SIZE}
          onPageChange={setPage}
        />
      </div>

      <DeleteConfirmDialog
        target={deleteTarget}
        isDeleting={isDeleting}
        onConfirm={handleDeleteConfirm}
        onCancel={handleDeleteCancel}
      />
    </div>
  );
}
