import { ArrowLeft, ExternalLink, Loader2 } from 'lucide-react';
import { useRouter } from 'next/router';
import { useTranslation } from 'next-i18next';

import { Button } from '@/components/ui/button';
import { ROUTE } from '@/types';

import { FormActionButtons } from './form-action-buttons';

const STATUS_CONFIG: Record<string, { dot: string; badge: string; textKey: string }> = {
  published: {
    dot: 'bg-emerald-500',
    badge: 'bg-emerald-50 text-emerald-700 ring-1 ring-emerald-200',
    textKey: 'statusPublished',
  },
  hidden: {
    dot: 'bg-slate-400',
    badge: 'bg-slate-100 text-slate-600 ring-1 ring-slate-200',
    textKey: 'statusHidden',
  },
  draft: {
    dot: 'bg-amber-400',
    badge: 'bg-amber-50 text-amber-700 ring-1 ring-amber-200',
    textKey: 'statusDraft',
  },
};

interface ProductFormHeaderProps {
  isEdit: boolean;
  productId?: string;
  currentStatus: string;
  lastSaved: string | null;
  isPending: boolean;
  onSaveDraft: () => void;
  onSaveChanges: () => void;
  onPublish: () => void;
  onHide: () => void;
}

export function ProductFormHeader({
  isEdit,
  productId,
  currentStatus,
  lastSaved,
  isPending,
  onSaveDraft,
  onSaveChanges,
  onPublish,
  onHide,
}: ProductFormHeaderProps) {
  const router = useRouter();
  const { t } = useTranslation('adminPage');
  const statusCfg = STATUS_CONFIG[currentStatus] ?? STATUS_CONFIG.draft;

  return (
    <div className="sticky top-[72px] z-30 bg-white/90 dark:bg-gray-900/90 backdrop-blur-md border-b border-gray-200 dark:border-gray-800 px-6 py-3 flex items-center justify-between gap-4 shadow-theme-sm">
      <div className="flex items-center gap-3 min-w-0">
        <Button
          variant="ghost"
          size="icon"
          rounded="md"
          blur={false}
          className="shrink-0 text-gray-500 hover:text-gray-900 hover:bg-gray-100"
          onClick={() => router.push(ROUTE.ADMIN_PRODUCTS)}
        >
          <ArrowLeft size={18} />
        </Button>

        <div className="min-w-0 flex items-center gap-3">
          <h1 className="text-lg font-bold text-slate-800 dark:text-white/90 truncate leading-tight">
            {isEdit ? t('editTour') : t('addTour')}
          </h1>

          {isEdit && (
            <span
              className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold shrink-0 ${statusCfg.badge}`}
            >
              <span className={`w-1.5 h-1.5 rounded-full ${statusCfg.dot}`} />
              {t(statusCfg.textKey)}
            </span>
          )}

          {isEdit && productId && (
            <a
              href={ROUTE.PRODUCT_DETAIL(productId)}
              target="_blank"
              rel="noopener noreferrer"
              className="hidden sm:inline-flex items-center gap-1 text-[11px] text-slate-400 hover:text-brand-500 transition-colors shrink-0"
            >
              <ExternalLink size={12} />
              {t('viewPage')}
            </a>
          )}
        </div>
      </div>

      <div className="flex items-center gap-2 shrink-0">
        {lastSaved && (
          <span className="text-[10px] text-gray-400 hidden sm:block">{t('draftAt', { time: lastSaved })}</span>
        )}
        {isPending && <Loader2 size={16} className="animate-spin text-gray-400" />}
        <FormActionButtons
          isEdit={isEdit}
          currentStatus={currentStatus}
          onSaveDraft={onSaveDraft}
          onSaveChanges={onSaveChanges}
          onPublish={onPublish}
          onHide={onHide}
          disabled={isPending}
        />
      </div>
    </div>
  );
}
