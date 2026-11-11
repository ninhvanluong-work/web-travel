import { useTranslation } from 'next-i18next';

import { useTourGuideMoments } from '@/api/tour-guide/queries';
import type { ITourGuide } from '@/api/tour-guide/types';
import { useAdminUserList } from '@/api/user/queries';

/**
 * What else deleting a tour guide affects: a linked user account and/or video moments.
 * The tour guide API has no owner field, so the linked account is looked up in the tour_guide user
 * list. Limitation: only the first 50 such accounts are checked (BE max pageSize) until the BE
 * returns the owner on the tour guide.
 */
export function useGuideDeleteImpact(target: ITourGuide | null) {
  const { t } = useTranslation('adminPage');

  const momentsQuery = useTourGuideMoments({
    variables: { id: target?.id ?? '', pageSize: 1 },
    enabled: !!target,
    // The guide may have added moments since the last open; the global default skips refetch on mount
    refetchOnMount: 'always',
  });
  const usersQuery = useAdminUserList({
    variables: { role: 'tour_guide', pageSize: 50 },
    enabled: !!target,
  });

  const momentCount = momentsQuery.data?.pagination.total ?? 0;
  const linkedUser = target ? usersQuery.data?.items.find((u) => u.tourGuideId === target.id) : undefined;

  const impactMessage = [
    linkedUser ? t('admin.guide.delete.linkedAccount', { account: linkedUser.email || linkedUser.name || '—' }) : '',
    momentCount > 0 ? t('admin.guide.delete.moments', { count: momentCount }) : '',
  ]
    .filter(Boolean)
    .join(' ');

  return {
    impactMessage,
    // Confirm stays disabled until the check is done, so the warning cannot be skipped by a fast click
    isCheckingImpact: !!target && (momentsQuery.isFetching || usersQuery.isFetching),
  };
}
