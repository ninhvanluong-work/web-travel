import { useRouter } from 'next/router';
import { useState } from 'react';

import { useTourGuideList } from '@/api/tour-guide/queries';
import { Icons } from '@/assets/icons';
import { Button } from '@/components/ui/button';
import { StatCard } from '@/components/ui/stat-card';
import { ROUTE } from '@/types/routes';

import { DeleteConfirmDialog } from './components/DeleteConfirmDialog';
import { GuideTable } from './components/GuideTable';
import { useGuideListActions } from './hooks/use-guide-list-actions';

const PAGE_SIZE = 10;

export default function GuideListPage() {
  const router = useRouter();
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

  const highRatingCount = items.filter((g) => g.ratingValue >= 4).length;
  const experiencedCount = items.filter((g) => g.expYear >= 5).length;

  const { deleteTarget, setDeleteTarget, handleDeleteConfirm } = useGuideListActions(refetch);

  const handleKeywordChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setKeyword(e.target.value);
    setPage(1);
  };

  return (
    <div className="min-h-full bg-gray-50 dark:bg-gray-900 p-6 space-y-5">
      {/* Page header */}
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold tracking-tight text-gray-900 dark:text-white">Tour Guides</h1>
        <Button
          variant="primary"
          size="xs"
          rounded="md"
          blur={false}
          className="flex items-center gap-1.5 px-5 h-9 bg-brand-500 hover:bg-brand-600 border-0 shadow-theme-xs"
          onClick={() => router.push(ROUTE.ADMIN_GUIDES_CREATE)}
        >
          <Icons.plusCircle size={15} />
          Add New Guide
        </Button>
      </div>

      {/* Stat cards */}
      <div className="grid grid-cols-3 gap-4">
        <StatCard
          label="Total Guides"
          value={total}
          icon={Icons.user}
          accentClass="bg-blue-500"
          lightBgClass="bg-blue-50"
          iconColorClass="text-blue-600"
        />
        <StatCard
          label="Rating ≥ 4★"
          value={highRatingCount}
          icon={Icons.star}
          accentClass="bg-amber-400"
          lightBgClass="bg-amber-50"
          iconColorClass="text-amber-600"
        />
        <StatCard
          label="Exp ≥ 5 năm"
          value={experiencedCount}
          icon={Icons.user}
          accentClass="bg-emerald-500"
          lightBgClass="bg-emerald-50"
          iconColorClass="text-emerald-600"
        />
      </div>

      {/* Main table card */}
      <div className="overflow-hidden bg-white rounded-2xl border border-gray-200 shadow-theme-xs dark:border-gray-800 dark:bg-white/[0.03]">
        {/* Toolbar */}
        <div className="px-5 py-5 flex items-center border-b border-gray-100 dark:border-gray-800">
          <div className="relative flex-1 max-w-sm">
            <Icons.search
              size={18}
              className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none"
            />
            <input
              type="text"
              placeholder="Search guides..."
              value={keyword}
              onChange={handleKeywordChange}
              className="w-full h-11 pl-11 pr-4 rounded-xl border border-gray-200 bg-white text-sm text-gray-800 shadow-theme-xs placeholder:text-gray-400 outline-none focus:border-brand-300 focus:ring-4 focus:ring-brand-500/5 transition dark:bg-gray-900 dark:border-gray-700 dark:text-white/90 dark:placeholder:text-gray-500"
            />
          </div>
        </div>

        <div className="pt-2">
          <GuideTable guides={items} isLoading={isLoading || isFetching} onDelete={setDeleteTarget} />
        </div>

        {/* Pagination */}
        <div className="border-t border-gray-100 dark:border-gray-800 px-6 py-5 flex items-center justify-between bg-white dark:bg-transparent">
          <p className="text-sm text-gray-500 dark:text-gray-400 font-medium">
            Showing{' '}
            <span className="text-gray-900 dark:text-white">
              {total === 0 ? 0 : pageOffset + 1}–{Math.min(pageOffset + items.length, total)}
            </span>{' '}
            / <span className="text-gray-900 dark:text-white">{total}</span> guides
          </p>

          <div className="flex items-center gap-2">
            <button
              type="button"
              disabled={page === 1}
              onClick={() => setPage((p) => p - 1)}
              className="inline-flex items-center gap-1.5 h-10 px-4 rounded-lg border border-gray-200 bg-white text-sm font-medium text-gray-700 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition shadow-theme-xs dark:border-gray-700 dark:bg-gray-800 dark:text-gray-400"
            >
              <Icons.chevronLeft size={16} />
              Previous
            </button>

            <div className="flex items-center gap-1.5">
              {Array.from({ length: Math.min(totalPages, 5) }, (_, i) => {
                const p = i + 1;
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
              })}
            </div>

            <button
              type="button"
              disabled={page >= totalPages}
              onClick={() => setPage((p) => p + 1)}
              className="inline-flex items-center gap-1.5 h-10 px-4 rounded-lg border border-gray-200 bg-white text-sm font-medium text-gray-700 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition shadow-theme-xs dark:border-gray-700 dark:bg-gray-800 dark:text-gray-400"
            >
              Next
              <Icons.chevronRight size={16} />
            </button>
          </div>
        </div>
      </div>

      <DeleteConfirmDialog
        target={deleteTarget}
        onConfirm={handleDeleteConfirm}
        onCancel={() => setDeleteTarget(null)}
      />
    </div>
  );
}
