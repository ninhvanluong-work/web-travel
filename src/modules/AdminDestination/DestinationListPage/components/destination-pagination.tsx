import { useTranslation } from 'next-i18next';

import { Icons } from '@/assets/icons';

import { DESTINATION_NS } from '../../constants';

const MAX_BUTTONS = 5;

const navBtnClass =
  'inline-flex items-center gap-1.5 h-10 px-4 rounded-lg border border-gray-200 bg-white text-sm font-medium text-gray-700 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition shadow-theme-xs dark:border-gray-700 dark:bg-gray-800 dark:text-gray-400';

function getPageWindow(page: number, totalPages: number): number[] {
  let start = Math.max(1, page - Math.floor(MAX_BUTTONS / 2));
  const end = Math.min(totalPages, start + MAX_BUTTONS - 1);
  if (end - start + 1 < MAX_BUTTONS) start = Math.max(1, end - MAX_BUTTONS + 1);
  return Array.from({ length: end - start + 1 }, (_, i) => start + i);
}

interface DestinationPaginationProps {
  page: number;
  totalPages: number;
  total: number;
  itemsCount: number;
  pageSize: number;
  onPageChange: (page: number) => void;
}

export function DestinationPagination({
  page,
  totalPages,
  total,
  itemsCount,
  pageSize,
  onPageChange,
}: DestinationPaginationProps) {
  const { t } = useTranslation(DESTINATION_NS);
  const pageOffset = (page - 1) * pageSize;
  const from = total === 0 ? 0 : pageOffset + 1;
  const to = Math.min(pageOffset + itemsCount, total);

  return (
    <div className="border-t border-gray-100 dark:border-gray-800 px-6 py-5 flex items-center justify-between bg-white dark:bg-transparent">
      <p className="text-sm text-gray-500 dark:text-gray-400 font-medium">
        {t('showing')}{' '}
        <span className="text-gray-900 dark:text-white">
          {from}–{to}
        </span>{' '}
        / <span className="text-gray-900 dark:text-white">{total}</span> {t('destinationsUnit')}
      </p>

      {totalPages > 1 ? (
        <div className="flex items-center gap-2">
          <button type="button" disabled={page === 1} onClick={() => onPageChange(page - 1)} className={navBtnClass}>
            <Icons.chevronLeft size={16} />
            {t('prev')}
          </button>

          <div className="flex items-center gap-1.5">
            {getPageWindow(page, totalPages).map((p) => (
              <button
                key={p}
                type="button"
                onClick={() => onPageChange(p)}
                aria-current={p === page ? 'page' : undefined}
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
            disabled={page >= totalPages}
            onClick={() => onPageChange(page + 1)}
            className={navBtnClass}
          >
            {t('next')}
            <Icons.chevronRight size={16} />
          </button>
        </div>
      ) : null}
    </div>
  );
}
