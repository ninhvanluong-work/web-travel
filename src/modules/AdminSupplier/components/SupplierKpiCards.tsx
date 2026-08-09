import { useTranslation } from 'next-i18next';

import { Icons } from '@/assets/icons';
import { StatCard } from '@/components/ui/stat-card';

interface SupplierKpiCardsProps {
  total: number;
}

export function SupplierKpiCards({ total }: SupplierKpiCardsProps) {
  const { t } = useTranslation('adminPage');

  return (
    <div className="w-1/3">
      <StatCard
        label={t('totalSuppliers')}
        value={total}
        icon={Icons.user}
        accentClass="bg-blue-500"
        lightBgClass="bg-blue-50"
        iconColorClass="text-blue-600"
      />
    </div>
  );
}
