import { MapPin } from 'lucide-react';
import { useRouter } from 'next/router';
import { useTranslation } from 'next-i18next';
import { Fragment } from 'react';

import type { IDestination } from '@/api/destination/types';
import { Icons } from '@/assets/icons';
import { Button } from '@/components/ui/button';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';

import { DESTINATION_NS, DESTINATION_PAGE_SIZE, DESTINATION_ROUTES } from '../../constants';
import { DestinationTableRow } from './DestinationTableRow';

const COLUMN_COUNT = 7;

const thClass =
  '!text-[11px] !font-semibold !uppercase !tracking-wide !text-gray-500 dark:!text-gray-400 !px-5 !py-3.5 !h-auto';

const SKELETON_ROWS = Array.from({ length: Math.min(DESTINATION_PAGE_SIZE, 5) }, (_, i) => (
  <TableRow key={i} className="border-b border-gray-100 dark:border-gray-800 last:border-0">
    <TableCell className="py-6">
      <div className="flex items-center gap-2.5 animate-pulse">
        <div className="w-[32px] h-[32px] shrink-0 rounded-lg bg-gray-200 dark:bg-gray-700" />
        <div className="h-4 w-28 rounded bg-gray-200 dark:bg-gray-700" />
      </div>
    </TableCell>
    <TableCell className="py-6">
      <div className="space-y-2 animate-pulse">
        <div className="h-3 w-full max-w-[420px] rounded bg-gray-100 dark:bg-gray-800" />
        <div className="h-3 w-2/3 max-w-[300px] rounded bg-gray-100 dark:bg-gray-800" />
      </div>
    </TableCell>
    {[0, 1].map((c) => (
      <Fragment key={c}>
        <TableCell className="py-6">
          <div className="flex items-center gap-2 animate-pulse">
            <div className="w-6 h-6 rounded-full bg-gray-100 dark:bg-gray-800" />
            <div className="h-3 w-24 rounded bg-gray-100 dark:bg-gray-800" />
          </div>
        </TableCell>
        <TableCell className="py-6">
          <div className="space-y-1.5 animate-pulse">
            <div className="h-3 w-20 rounded bg-gray-100 dark:bg-gray-800" />
            <div className="h-2.5 w-10 rounded bg-gray-100 dark:bg-gray-800" />
          </div>
        </TableCell>
      </Fragment>
    ))}
    <TableCell className="w-14" />
  </TableRow>
));

interface DestinationTableProps {
  destinations: IDestination[];
  isInitialLoading: boolean;
  isFetching: boolean;
  hasKeyword: boolean;
  onClearKeyword: () => void;
  onDelete: (destination: IDestination) => void;
}

export function DestinationTable({
  destinations,
  isInitialLoading,
  isFetching,
  hasKeyword,
  onClearKeyword,
  onDelete,
}: DestinationTableProps) {
  const { t } = useTranslation(DESTINATION_NS);
  const router = useRouter();

  let body: React.ReactNode;
  if (isInitialLoading) {
    body = SKELETON_ROWS;
  } else if (destinations.length === 0) {
    body = (
      <TableRow>
        <td colSpan={COLUMN_COUNT}>
          <div className="flex flex-col items-center justify-center py-16 gap-3 text-gray-400">
            <MapPin size={40} className="opacity-25" />
            <p className="text-sm font-medium text-gray-500">
              {hasKeyword ? t('noDestinationsFound') : t('noDestinationsYet')}
            </p>
            {hasKeyword ? (
              <button type="button" onClick={onClearKeyword} className="text-xs text-brand-600 hover:underline">
                {t('clearSearch')}
              </button>
            ) : (
              <Button
                variant="primary"
                size="xs"
                rounded="md"
                blur={false}
                className="mt-1 flex items-center gap-1.5 px-4"
                onClick={() => router.push(DESTINATION_ROUTES.CREATE)}
              >
                <Icons.plusCircle size={14} />
                {t('addDestination')}
              </Button>
            )}
          </div>
        </td>
      </TableRow>
    );
  } else {
    body = destinations.map((destination) => (
      <DestinationTableRow key={destination.id} destination={destination} onDelete={onDelete} />
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
            <TableHead className={`${thClass} min-w-[180px]`}>{t('colDestination')}</TableHead>
            <TableHead className={`${thClass} min-w-[220px]`}>{t('colDescription')}</TableHead>
            <TableHead className={`${thClass} whitespace-nowrap min-w-[160px]`}>{t('colCreatedBy')}</TableHead>
            <TableHead className={`${thClass} whitespace-nowrap w-[110px]`}>{t('colCreatedAt')}</TableHead>
            <TableHead className={`${thClass} whitespace-nowrap min-w-[160px]`}>{t('colUpdatedBy')}</TableHead>
            <TableHead className={`${thClass} whitespace-nowrap w-[110px]`}>{t('colUpdatedAt')}</TableHead>
            <TableHead className={`${thClass} !w-14`} />
          </TableRow>
        </TableHeader>
        <TableBody className="[&_td]:px-5 [&_td]:py-4">{body}</TableBody>
      </Table>
    </div>
  );
}
