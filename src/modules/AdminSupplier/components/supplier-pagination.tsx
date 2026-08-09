import { useTranslation } from 'next-i18next';

import { Icons } from '@/assets/icons';

interface SupplierPaginationProps {
  page: number;
  totalPages: number;
  total: number;
  pageOffset: number;
  itemsCount: number;
  onPageChange: (page: number) => void;
}

export function SupplierPagination({
  page,
  totalPages,
  total,
  pageOffset,
  itemsCount,
  onPageChange,
}: SupplierPaginationProps) {
  const { t } = useTranslation('adminPage');

  const maxButtons = 5;
  let startPage = Math.max(1, page - Math.floor(maxButtons / 2));
  const endPage = Math.min(totalPages, startPage + maxButtons - 1);
  if (endPage - startPage + 1 < maxButtons) startPage = Math.max(1, endPage - maxButtons + 1);
  const pageNumbers = Array.from({ length: endPage - startPage + 1 }, (_, i) => startPage + i);

  return (
    <div className="border-t border-gray-100 dark:border-gray-800 px-6 py-5 flex items-center justify-between bg-white dark:bg-transparent">
      <p className="text-sm text-gray-500 dark:text-gray-400 font-medium">
        {t('showing')}{' '}
        <span className="text-gray-900 dark:text-white">
          {total === 0 ? 0 : pageOffset + 1}–{Math.min(pageOffset + itemsCount, total)}
        </span>{' '}
        / <span className="text-gray-900 dark:text-white">{total}</span> {t('suppliersUnit')}
      </p>

      <div className="flex items-center gap-2">
        <button
          type="button"
          disabled={page === 1}
          onClick={() => onPageChange(page - 1)}
          className="inline-flex items-center gap-1.5 h-10 px-4 rounded-lg border border-gray-200 bg-white text-sm font-medium text-gray-700 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition shadow-theme-xs dark:border-gray-700 dark:bg-gray-800 dark:text-gray-400"
        >
          <Icons.chevronLeft size={16} />
          {t('prev')}
        </button>

        <div className="flex items-center gap-1.5">
          {pageNumbers.map((p) => (
            <button
              key={p}
              type="button"
              onClick={() => onPageChange(p)}
              className={`inline-flex items-center justify-center h-10 w-10 rounded-lg text-sm font-semibold transition-all ${
                p === page
                  ? 'bg-brand-500 text-white shadow-md shadow-brand-500/20'
                  : 'text-gray-600 hover:bg-gray-100 dark:text-gray-400 dark:hover:bg-white/5'
              }`}
            >
              {p}
            </button>
          ))}
        </div>

        <button
          type="button"
          disabled={page === totalPages}
          onClick={() => onPageChange(page + 1)}
          className="inline-flex items-center gap-1.5 h-10 px-4 rounded-lg border border-gray-200 bg-white text-sm font-medium text-gray-700 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition shadow-theme-xs dark:border-gray-700 dark:bg-gray-800 dark:text-gray-400"
        >
          {t('next')}
          <Icons.chevronRight size={16} />
        </button>
      </div>
    </div>
  );
}
