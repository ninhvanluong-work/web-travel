import { useQueryClient } from '@tanstack/react-query';
import { Film, Trash2 } from 'lucide-react';
import { useTranslation } from 'next-i18next';
import { useState } from 'react';

import {
  useAdminDeleteTourGuideMoment,
  useTourGuideMoments,
  useTourGuideMomentsInfinite,
} from '@/api/tour-guide/queries';
import type { ITourGuideMoment } from '@/api/tour-guide/types';
import { AdminConfirmDialog } from '@/components/ui/admin-confirm-dialog';
import { AdminPagination } from '@/components/ui/admin-pagination';
import { getApiErrorMessage } from '@/lib/utils';
import { useAlertStore } from '@/stores/use-alert-store';

const PAGE_SIZE = 12;

interface MomentsSectionProps {
  guideId: string;
}

/**
 * Admin moderation of a guide's video moments: list + delete only.
 * The BE lets admins delete moments but not create or edit them (those stay with the guide).
 */
export function MomentsSection({ guideId }: MomentsSectionProps) {
  const { t } = useTranslation('adminPage');
  const queryClient = useQueryClient();
  const [page, setPage] = useState(1);
  const [target, setTarget] = useState<ITourGuideMoment | null>(null);

  const { data, isLoading } = useTourGuideMoments({
    variables: { id: guideId, page, pageSize: PAGE_SIZE },
    // Keep the current page visible while the next one loads (no skeleton flash between pages)
    keepPreviousData: true,
  });
  const items = data?.items ?? [];
  const total = data?.pagination.total ?? 0;
  const totalPages = data?.pagination.totalPages ?? 1;

  const deleteMutation = useAdminDeleteTourGuideMoment({
    onSuccess: () => {
      // Deleted the last item of a page > 1: step back first so the refetch targets a page that exists
      if (items.length === 1 && page > 1) setPage((p) => p - 1);
      // Both the admin list and the public profile grid read these keys
      queryClient.invalidateQueries({ queryKey: useTourGuideMoments.getKey(), refetchType: 'all' });
      queryClient.invalidateQueries({ queryKey: useTourGuideMomentsInfinite.getKey(), refetchType: 'all' });
      useAlertStore.getState().addAlert({ type: 'success', title: t('admin.guide.moments.deleted') });
      setTarget(null);
    },
    onError: (err: unknown) => {
      useAlertStore
        .getState()
        .addAlert({ type: 'error', title: getApiErrorMessage(err, t('admin.guide.moments.deleteFailed')) });
    },
  });

  if (isLoading) {
    return (
      <div className="grid grid-cols-4 gap-[16px] animate-pulse">
        {Array.from({ length: 4 }, (_, i) => (
          <div key={i} className="aspect-[9/16] rounded-xl bg-slate-100" />
        ))}
      </div>
    );
  }

  if (items.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center gap-2 py-10 text-gray-400">
        <Film size={32} className="opacity-30" />
        <p className="text-sm text-gray-500">{t('admin.guide.moments.empty')}</p>
      </div>
    );
  }

  return (
    <div className="space-y-[16px]">
      <div className="grid grid-cols-4 gap-[16px]">
        {items.map((moment) => (
          <div
            key={moment.id}
            className="group relative aspect-[9/16] overflow-hidden rounded-xl bg-slate-100 dark:bg-slate-800"
          >
            {moment.thumbnail ? (
              <img src={moment.thumbnail} alt={moment.title} className="h-full w-full object-cover" loading="lazy" />
            ) : (
              <div className="flex h-full w-full items-center justify-center text-slate-300">
                <Film size={28} />
              </div>
            )}
            <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/70 to-transparent p-[12px] pt-[32px]">
              <p className="line-clamp-2 text-xs font-semibold text-white">{moment.title || moment.name}</p>
              {moment.duration ? <p className="mt-0.5 text-[11px] text-white/70">{moment.duration}</p> : null}
            </div>
            <button
              type="button"
              onClick={() => setTarget(moment)}
              aria-label={t('admin.guide.moments.delete')}
              className="absolute right-2 top-2 flex h-[32px] w-[32px] items-center justify-center rounded-lg bg-white/90 text-rose-600 shadow-sm transition-colors hover:bg-rose-50"
            >
              <Trash2 size={15} />
            </button>
          </div>
        ))}
      </div>

      {totalPages > 1 ? (
        <AdminPagination
          labels={{
            showing: t('showing'),
            prev: t('prev'),
            next: t('next'),
            unit: t('admin.guide.moments.unit'),
          }}
          page={page}
          totalPages={totalPages}
          total={total}
          itemsCount={items.length}
          pageSize={PAGE_SIZE}
          onPageChange={setPage}
        />
      ) : null}

      <AdminConfirmDialog
        open={!!target}
        tone="danger"
        title={t('admin.guide.moments.deleteTitle')}
        description={t('admin.guide.moments.deleteMessage', { name: target?.title || target?.name || '' })}
        confirmLabel={t('admin.guide.moments.delete')}
        cancelLabel={t('cancel')}
        isPending={deleteMutation.isLoading}
        onConfirm={() => target && deleteMutation.mutate({ guideId, momentId: target.id })}
        onCancel={() => setTarget(null)}
      />
    </div>
  );
}
