import { MessageSquare } from 'lucide-react';
import { useTranslation } from 'next-i18next';

import type { ITourGuide } from '@/api/tour-guide/types';
import { Icons } from '@/assets/icons';
import { Table, TableBody, TableHead, TableHeader, TableRow } from '@/components/ui/table';

import { GuideTableRow } from './GuideTableRow';

interface GuideTableProps {
  guides: ITourGuide[];
  isLoading?: boolean;
  isFetching?: boolean;
  onDelete: (guide: ITourGuide) => void;
}

const thClass =
  '!text-[11px] !font-semibold !uppercase !tracking-wide !text-gray-500 dark:!text-gray-400 !px-5 !py-3.5 !h-auto';

export function GuideTable({ guides, isLoading, isFetching, onDelete }: GuideTableProps) {
  const { t } = useTranslation('adminPage');
  return (
    <div
      className={`overflow-x-auto transition-opacity duration-200 ${
        isLoading || isFetching ? 'opacity-50 pointer-events-none' : ''
      }`}
    >
      <Table>
        <TableHeader>
          <TableRow className="bg-slate-50 dark:bg-white/[0.03] border-b border-gray-200 dark:border-gray-800">
            <TableHead className={`${thClass} min-w-[220px]`}>{t('guide')}</TableHead>
            <TableHead className={`${thClass} whitespace-nowrap`}>{t('expYears')}</TableHead>
            <TableHead className={`${thClass} min-w-[140px]`}>{t('rating')}</TableHead>
            <TableHead className={`${thClass} whitespace-nowrap`}>
              <span className="inline-flex items-center gap-1">
                <MessageSquare size={12} />
                {t('reviews')}
              </span>
            </TableHead>
            <TableHead className={`${thClass} whitespace-nowrap`}>{t('createdAt')}</TableHead>
            <TableHead className={`${thClass} !w-14`} />
          </TableRow>
        </TableHeader>

        <TableBody className="[&_td]:px-5 [&_td]:py-4">
          {guides.length === 0 ? (
            <TableRow>
              <td colSpan={6}>
                <div className="flex flex-col items-center justify-center py-16 gap-3 text-gray-400">
                  <Icons.user size={40} className="opacity-25" />
                  <p className="text-sm font-medium text-gray-500">{t('noGuidesYet')}</p>
                </div>
              </td>
            </TableRow>
          ) : (
            guides.map((guide) => <GuideTableRow key={guide.id} guide={guide} onDelete={onDelete} />)
          )}
        </TableBody>
      </Table>
    </div>
  );
}
