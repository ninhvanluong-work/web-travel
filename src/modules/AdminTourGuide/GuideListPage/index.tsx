import { useRouter } from 'next/router';
import { useTranslation } from 'next-i18next';
import { useState } from 'react';

import { useTourGuideList } from '@/api/tour-guide/queries';
import { Icons } from '@/assets/icons';
import { AdminSearchInput } from '@/components/ui/admin-search-input';
import { Button } from '@/components/ui/button';
import { StatCard } from '@/components/ui/stat-card';
import { ROUTE } from '@/types';

import { DeleteConfirmDialog } from './components/DeleteConfirmDialog';
import { GuideTable } from './components/GuideTable';
import { useGuideListActions } from './hooks/use-guide-list-actions';

const PAGE_SIZE = 10;

export default function GuideListPage() {
  const { t } = useTranslation('adminPage');
  const router = useRouter();
  // Committed keyword, already debounced + normalized by <AdminSearchInput />
  const [keyword, setKeyword] = useState('');
  const [page, setPage] = useState(1);

  const { data, isLoading, isFetching, refetch } = useTourGuideList({
    variables: {
      keyword: keyword || undefined,
      page,
      pageSize: PAGE_SIZE,
    },
    keepPreviousData: true,
  } as any);

  const items = data?.items ?? [];
  const pagination = data?.pagination;
  const totalPages = pagination?.totalPages ?? 1;
  const total = pagination?.total ?? 0;
  const pageOffset = (page - 1) * PAGE_SIZE;

  const now = new Date();
  const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1).toISOString();
  const newThisMonthCount = items.filter((g) => g.createdAt >= startOfMonth).length;
  const avgExpYear = items.length > 0 ? Math.round(items.reduce((sum, g) => sum + g.expYear, 0) / items.length) : 0;

  const { deleteTarget, setDeleteTarget, handleDeleteConfirm, isDeleting } = useGuideListActions(refetch);

  const handleSearch = (kw: string | undefined) => {
    setKeyword(kw ?? '');
    setPage(1);
  };

  return (
    <div className="min-h-full bg-gray-50 dark:bg-gray-900 p-6 space-y-5">
      {/* Page header */}
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold tracking-tight text-gray-900 dark:text-white">{t('guideListTitle')}</h1>
        <Button
          variant="primary"
          size="xs"
          rounded="md"
          blur={false}
          className="flex items-center gap-1.5 px-5 h-9 bg-brand-500 hover:bg-brand-600 border-0 shadow-theme-xs"
          onClick={() => router.push(ROUTE.ADMIN_GUIDES_CREATE)}
        >
          <Icons.plusCircle size={15} />
          {t('addGuide')}
        </Button>
      </div>

      {/* Stat cards */}
      <div className="grid grid-cols-3 gap-4">
        <StatCard
          label={t('totalGuides')}
          value={total}
          icon={Icons.user}
          accentClass="bg-blue-500"
          lightBgClass="bg-blue-50"
          iconColorClass="text-blue-600"
        />
        <StatCard
          label={t('newThisMonth')}
          value={newThisMonthCount}
          icon={Icons.plusCircle}
          accentClass="bg-emerald-500"
          lightBgClass="bg-emerald-50"
          iconColorClass="text-emerald-600"
        />
        <StatCard
          label={t('avgExperience')}
          value={avgExpYear}
          icon={Icons.star}
          accentClass="bg-amber-400"
          lightBgClass="bg-amber-50"
          iconColorClass="text-amber-600"
        />
      </div>

      {/* Main table card */}
      <div className="overflow-hidden bg-white rounded-2xl border border-gray-200 shadow-theme-xs dark:border-gray-800 dark:bg-white/[0.03]">
        {/* Toolbar */}
        <div className="px-5 py-5 flex items-center gap-3 border-b border-gray-100 dark:border-gray-800">
          <AdminSearchInput
            value={keyword}
            onSearch={handleSearch}
            placeholder={t('searchGuidesPlaceholder')}
            isSearching={isFetching && !isLoading}
          />
        </div>

        <div className="pt-2">
          <GuideTable guides={items} isLoading={isLoading} isFetching={isFetching} onDelete={setDeleteTarget} />
        </div>

        {/* Pagination - TailAdmin Style */}
        <div className="border-t border-gray-100 dark:border-gray-800 px-6 py-5 flex items-center justify-between bg-white dark:bg-transparent">
          <p className="text-sm text-gray-500 dark:text-gray-400 font-medium">
            {t('showing')}{' '}
            <span className="text-gray-900 dark:text-white">
              {total === 0 ? 0 : pageOffset + 1}–{Math.min(pageOffset + items.length, total)}
            </span>{' '}
            / <span className="text-gray-900 dark:text-white">{total}</span> {t('guidesUnit')}
          </p>

          <div className="flex items-center gap-2">
            <button
              type="button"
              disabled={page === 1}
              onClick={() => setPage((p) => p - 1)}
              className="inline-flex items-center gap-1.5 h-10 px-4 rounded-lg border border-gray-200 bg-white text-sm font-medium text-gray-700 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition shadow-theme-xs dark:border-gray-700 dark:bg-gray-800 dark:text-gray-400"
            >
              <Icons.chevronLeft size={16} />
              {t('prev')}
            </button>

            <div className="flex items-center gap-1.5">
              {(() => {
                const maxButtons = 5;
                let startPage = Math.max(1, page - Math.floor(maxButtons / 2));
                const endPage = Math.min(totalPages, startPage + maxButtons - 1);

                if (endPage - startPage + 1 < maxButtons) {
                  startPage = Math.max(1, endPage - maxButtons + 1);
                }

                return Array.from({ length: endPage - startPage + 1 }, (_, i) => {
                  const p = startPage + i;
                  return (
                    <button
                      key={p}
                      type="button"
                      onClick={() => setPage(p)}
                      className={`inline-flex items-center justify-center h-10 w-10 rounded-lg text-sm font-semibold transition-all ${
                        p === page
                          ? 'bg-brand-500 text-white shadow-md shadow-brand-500/20'
                          : 'text-gray-600 hover:bg-gray-100 dark:text-gray-400 dark:hover:bg-white/5'
                      }`}
                    >
                      {p}
                    </button>
                  );
                });
              })()}
            </div>

            <button
              type="button"
              disabled={page === totalPages}
              onClick={() => setPage((p) => p + 1)}
              className="inline-flex items-center gap-1.5 h-10 px-4 rounded-lg border border-gray-200 bg-white text-sm font-medium text-gray-700 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition shadow-theme-xs dark:border-gray-700 dark:bg-gray-800 dark:text-gray-400"
            >
              {t('next')}
              <Icons.chevronRight size={16} />
            </button>
          </div>
        </div>
      </div>

      <DeleteConfirmDialog
        target={deleteTarget}
        isDeleting={isDeleting}
        onConfirm={handleDeleteConfirm}
        onCancel={() => setDeleteTarget(null)}
      />
    </div>
  );
}
