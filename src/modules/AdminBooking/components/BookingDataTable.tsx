import { Loader2 } from 'lucide-react';
import { useTranslation } from 'next-i18next';

import type { IBookingListItem } from '@/api/booking/types';
import { Icons } from '@/assets/icons';
import { Table, TableBody, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { cn } from '@/lib/utils';

import { BookingTableRow } from './BookingTableRow';

const thClass =
  '!text-[11px] !font-semibold !uppercase !tracking-wide !text-gray-500 dark:!text-gray-400 !px-5 !py-3.5 !h-auto';

interface BookingDataTableProps {
  bookings: IBookingListItem[];
  isLoading?: boolean;
  isFetching?: boolean;
  onViewDetail: (booking: IBookingListItem) => void;
}

export function BookingDataTable({ bookings, isLoading, isFetching, onViewDetail }: BookingDataTableProps) {
  const { t } = useTranslation('adminPage');

  return (
    <div
      className={cn(
        'overflow-x-auto transition-opacity duration-200',
        (isLoading || isFetching) && 'opacity-50 pointer-events-none'
      )}
    >
      <Table>
        <TableHeader>
          <TableRow className="bg-slate-50 dark:bg-white/[0.03] border-b border-gray-200 dark:border-gray-800">
            <TableHead className={`${thClass} min-w-[160px]`}>{t('bookingCode')}</TableHead>
            <TableHead className={`${thClass} min-w-[200px]`}>{t('bookingCustomer')}</TableHead>
            <TableHead className={`${thClass} min-w-[180px]`}>{t('bookingProduct')}</TableHead>
            <TableHead className={`${thClass} whitespace-nowrap`}>{t('bookingTravelDate')}</TableHead>
            <TableHead className={`${thClass} whitespace-nowrap`}>{t('bookingPassengers')}</TableHead>
            <TableHead className={`${thClass} whitespace-nowrap`}>{t('bookingTotalPrice')}</TableHead>
            <TableHead className={`${thClass} whitespace-nowrap`}>{t('bookingStatus')}</TableHead>
            <TableHead className={`${thClass} !w-14`} />
          </TableRow>
        </TableHeader>

        <TableBody className="[&_td]:px-5 [&_td]:py-4">
          {isLoading && (
            <TableRow>
              <td colSpan={8}>
                <div className="flex items-center justify-center py-16">
                  <Loader2 size={24} className="animate-spin text-brand-500" />
                </div>
              </td>
            </TableRow>
          )}
          {!isLoading && bookings.length === 0 && (
            <TableRow>
              <td colSpan={8}>
                <div className="flex flex-col items-center justify-center py-16 gap-3 text-gray-400">
                  <Icons.search size={40} className="opacity-25" />
                  <p className="text-sm font-medium text-gray-500">{t('noBookingsYet')}</p>
                </div>
              </td>
            </TableRow>
          )}
          {!isLoading &&
            bookings.length > 0 &&
            bookings.map((booking) => (
              <BookingTableRow key={booking.id} booking={booking} onViewDetail={onViewDetail} />
            ))}
        </TableBody>
      </Table>
    </div>
  );
}
