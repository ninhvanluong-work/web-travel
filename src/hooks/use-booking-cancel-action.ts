import { useQueryClient } from '@tanstack/react-query';
import { useTranslation } from 'next-i18next';
import { useCallback } from 'react';

import { useCancelBooking } from '@/api/booking/queries';
import type { IBookingListItem } from '@/api/booking/types';
import { getApiErrorMessage } from '@/lib/utils';
import { useAlertStore } from '@/stores/use-alert-store';

interface BookingCancelActionOptions {
  /** Called with the cancelled booking returned by the BE */
  onCancelled: (booking: IBookingListItem) => void;
  /** The booking is no longer cancellable (404 / not pending): the caller should close its views */
  onGone: () => void;
}

export function useBookingCancelAction({ onCancelled, onGone }: BookingCancelActionOptions) {
  const { t } = useTranslation('adminPage');
  const queryClient = useQueryClient();

  // Global refetchOnMount is false: refetch every cached list page, including inactive ones
  const refreshLists = useCallback(
    () => queryClient.invalidateQueries({ queryKey: ['/booking/list'], refetchType: 'all' }),
    [queryClient]
  );

  const mutation = useCancelBooking({
    onSuccess: (cancelled) => {
      refreshLists();
      useAlertStore.getState().addAlert({
        type: 'success',
        title: cancelled.bookingCode
          ? t('admin.booking.cancel.success', { code: cancelled.bookingCode })
          : t('admin.booking.cancel.successNoCode'),
      });
      onCancelled(cancelled);
    },
    onError: (err: unknown) => {
      // Show the BE message as-is; the interceptor rejects with the body { statusCode, message, ... }
      const message = getApiErrorMessage(err, t('admin.booking.cancel.failed'));
      useAlertStore.getState().addAlert({ type: 'error', title: message });

      const statusCode = (err as { statusCode?: number } | null)?.statusCode;
      if (statusCode === 404 || /not pending/i.test(message)) {
        refreshLists();
        onGone();
      }
    },
  });

  const cancel = useCallback((id: string, reason: string) => mutation.mutate({ id, reason }), [mutation]);

  return { cancel, isCancelling: mutation.isLoading };
}
