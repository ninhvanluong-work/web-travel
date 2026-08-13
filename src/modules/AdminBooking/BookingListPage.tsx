import { useTranslation } from 'next-i18next';
import { useMemo } from 'react';

import { useBookingList } from '@/api/booking/queries';

import { BookingDataTable } from './components/BookingDataTable';
import { BookingDetailDrawer } from './components/BookingDetailDrawer';
import { BookingFilterToolbar } from './components/BookingFilterToolbar';
import { BookingKpiCards } from './components/BookingKpiCards';
import { BookingPagination } from './components/BookingPagination';
import { useBookingListState } from './hooks/use-booking-list-state';

const PAGE_SIZE = 10;

export function BookingListPage() {
  const { t } = useTranslation('adminPage');

  const {
    filters,
    queryFilters,
    page,
    setPage,
    setFilter,
    resetFilters,
    hasActiveFilters,
    detailTarget,
    setDetailTarget,
  } = useBookingListState();

  const { data, isLoading, isFetching } = useBookingList({
    variables: queryFilters,
    keepPreviousData: true,
  } as any);

  // Queries cho KPI total counts
  const { data: paidData } = useBookingList({ variables: { status: 'paid', pageSize: 1 } } as any);
  const { data: pendingData } = useBookingList({ variables: { status: 'pending', pageSize: 1 } } as any);
  const { data: cancelData } = useBookingList({ variables: { status: 'cancel', pageSize: 1 } } as any);

  const items = useMemo(() => data?.items ?? [], [data?.items]);
  const pagination = data?.pagination;
  const totalPages = pagination?.totalPages ?? 1;
  const total = pagination?.total ?? 0;
  const pageOffset = (page - 1) * PAGE_SIZE;

  const paidCount = paidData?.pagination?.total ?? items.filter((i) => i.status === 'paid').length;
  const pendingCount = pendingData?.pagination?.total ?? items.filter((i) => i.status === 'pending').length;
  const cancelCount = cancelData?.pagination?.total ?? items.filter((i) => i.status === 'cancel').length;

  return (
    <div className="min-h-full bg-gray-50 dark:bg-gray-900 p-6 space-y-5">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold tracking-tight text-gray-900 dark:text-white">{t('bookingListTitle')}</h1>
      </div>

      <BookingKpiCards total={total} paid={paidCount} pending={pendingCount} cancelled={cancelCount} />

      <div className="bg-white rounded-2xl border border-gray-200 shadow-theme-xs dark:border-gray-800 dark:bg-white/[0.03]">
        <BookingFilterToolbar
          filters={filters}
          isFetching={isFetching}
          isLoading={isLoading}
          hasActiveFilters={hasActiveFilters}
          onFilterChange={setFilter}
          onReset={resetFilters}
        />

        <div className="pt-2">
          <BookingDataTable
            bookings={items}
            isLoading={isLoading}
            isFetching={isFetching}
            onViewDetail={setDetailTarget}
          />
        </div>

        <BookingPagination
          page={page}
          totalPages={totalPages}
          total={total}
          pageOffset={pageOffset}
          itemsCount={items.length}
          onPageChange={setPage}
        />
      </div>

      <BookingDetailDrawer booking={detailTarget} onClose={() => setDetailTarget(null)} />
    </div>
  );
}
