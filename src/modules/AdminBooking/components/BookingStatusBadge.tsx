import { useTranslation } from 'next-i18next';

import type { BadgeProps } from '@/components/ui/badge';
import { Badge } from '@/components/ui/badge';

type BookingStatus = 'paid' | 'pending' | 'cancel' | string;

const STATUS_VARIANT: Record<string, BadgeProps['variant']> = {
  paid: 'success',
  pending: 'warning',
  cancel: 'error',
};

interface BookingStatusBadgeProps {
  status: BookingStatus;
}

export function BookingStatusBadge({ status }: BookingStatusBadgeProps) {
  const { t } = useTranslation('adminPage');
  const variant = STATUS_VARIANT[status] ?? 'secondary';
  const label = t(`bookingStatus_${status}`, { defaultValue: status });

  return <Badge variant={variant}>{label}</Badge>;
}
