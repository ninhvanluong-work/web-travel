import { BookOpen, CheckCircle, Clock, XCircle } from 'lucide-react';
import { useTranslation } from 'next-i18next';

import type { IBookingStats } from '@/api/booking/types';
import { StatCard } from '@/components/ui/stat-card';

interface BookingKpiCardsProps {
  stats?: IBookingStats;
  total?: number;
  paid?: number;
  pending?: number;
  cancelled?: number;
}

function formatTotalPrice(totalPrice?: number): string | undefined {
  if (totalPrice === undefined || totalPrice === null) return undefined;
  return `$${totalPrice.toLocaleString('en-US')}`;
}

export function BookingKpiCards({ stats, total = 0, paid = 0, pending = 0, cancelled = 0 }: BookingKpiCardsProps) {
  const { t } = useTranslation('adminPage');

  const totalCount = stats?.total.count ?? total;
  const paidCount = stats?.paid.count ?? paid;
  const pendingCount = stats?.pending.count ?? pending;
  const cancelCount = stats?.cancel.count ?? cancelled;

  const totalSubValue = stats ? `${t('bookingTotalPrice')}: ${formatTotalPrice(stats.total.totalPrice)}` : undefined;
  const paidSubValue = stats ? `${t('bookingTotalPrice')}: ${formatTotalPrice(stats.paid.totalPrice)}` : undefined;
  const pendingSubValue = stats
    ? `${t('bookingTotalPrice')}: ${formatTotalPrice(stats.pending.totalPrice)}`
    : undefined;
  const cancelSubValue = stats ? `${t('bookingTotalPrice')}: ${formatTotalPrice(stats.cancel.totalPrice)}` : undefined;

  return (
    <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
      <StatCard
        label={t('bookingTotal')}
        value={totalCount}
        subValue={totalSubValue}
        icon={BookOpen}
        accentClass="bg-blue-500"
        lightBgClass="bg-blue-50"
        iconColorClass="text-blue-600"
      />
      <StatCard
        label={t('bookingPaidCount')}
        value={paidCount}
        subValue={paidSubValue}
        icon={CheckCircle}
        accentClass="bg-emerald-500"
        lightBgClass="bg-emerald-50"
        iconColorClass="text-emerald-600"
      />
      <StatCard
        label={t('bookingPendingCount')}
        value={pendingCount}
        subValue={pendingSubValue}
        icon={Clock}
        accentClass="bg-amber-500"
        lightBgClass="bg-amber-50"
        iconColorClass="text-amber-600"
      />
      <StatCard
        label={t('bookingCancelCount')}
        value={cancelCount}
        subValue={cancelSubValue}
        icon={XCircle}
        accentClass="bg-rose-500"
        lightBgClass="bg-rose-50"
        iconColorClass="text-rose-600"
      />
    </div>
  );
}
