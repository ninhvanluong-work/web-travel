import { BookOpen, CheckCircle, Clock, XCircle } from 'lucide-react';
import { useTranslation } from 'next-i18next';

import { StatCard } from '@/components/ui/stat-card';

interface BookingKpiCardsProps {
  total: number;
  paid: number;
  pending: number;
  cancelled: number;
}

export function BookingKpiCards({ total, paid, pending, cancelled }: BookingKpiCardsProps) {
  const { t } = useTranslation('adminPage');

  return (
    <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
      <StatCard
        label={t('bookingTotal')}
        value={total}
        icon={BookOpen}
        accentClass="bg-blue-500"
        lightBgClass="bg-blue-50"
        iconColorClass="text-blue-600"
      />
      <StatCard
        label={t('bookingPaidCount')}
        value={paid}
        icon={CheckCircle}
        accentClass="bg-emerald-500"
        lightBgClass="bg-emerald-50"
        iconColorClass="text-emerald-600"
      />
      <StatCard
        label={t('bookingPendingCount')}
        value={pending}
        icon={Clock}
        accentClass="bg-amber-500"
        lightBgClass="bg-amber-50"
        iconColorClass="text-amber-600"
      />
      <StatCard
        label={t('bookingCancelCount')}
        value={cancelled}
        icon={XCircle}
        accentClass="bg-rose-500"
        lightBgClass="bg-rose-50"
        iconColorClass="text-rose-600"
      />
    </div>
  );
}
