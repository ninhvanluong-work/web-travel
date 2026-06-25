import { ArrowLeft, ExternalLink, Loader2 } from 'lucide-react';
import { useRouter } from 'next/router';
import { useTranslation } from 'next-i18next';

import { Button } from '@/components/ui/button';
import { ROUTE } from '@/types';

interface GuideFormHeaderProps {
  isEdit: boolean;
  guideId?: string;
  isPending: boolean;
  isDirty: boolean;
  onSave: () => void;
}

export function GuideFormHeader({ isEdit, guideId, isPending, isDirty, onSave }: GuideFormHeaderProps) {
  const router = useRouter();
  const { t } = useTranslation('adminPage');

  return (
    <div className="sticky top-[72px] z-30 bg-white/90 dark:bg-gray-900/90 backdrop-blur-md border-b border-gray-200 dark:border-gray-800 px-6 py-3 flex items-center justify-between gap-4 shadow-theme-sm">
      <div className="flex items-center gap-3 min-w-0">
        <Button
          variant="ghost"
          size="icon"
          rounded="md"
          blur={false}
          className="shrink-0 text-gray-500 hover:text-gray-900 hover:bg-gray-100"
          onClick={() => router.push(ROUTE.ADMIN_GUIDES)}
        >
          <ArrowLeft size={18} />
        </Button>
        <div className="min-w-0 flex items-center gap-3">
          <h1 className="text-lg font-bold text-slate-800 dark:text-white/90 truncate leading-tight">
            {isEdit ? t('editGuide') : t('addGuideNew')}
          </h1>
          {isDirty && (
            <span
              className="w-2 h-2 rounded-full bg-amber-400 animate-pulse shrink-0"
              title={t('unsavedChangesTitle')}
            />
          )}
          {isEdit && guideId && (
            <a
              href={ROUTE.GUIDE_PROFILE_PATH(guideId)}
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
        {isPending && <Loader2 size={16} className="animate-spin text-gray-400" />}
        <Button
          variant="primary"
          size="xs"
          rounded="md"
          blur={false}
          disabled={isPending}
          onClick={onSave}
          className="px-5 h-9 bg-brand-500 hover:bg-brand-600 border-0 shadow-theme-xs"
        >
          {isEdit ? t('saveChanges') : t('createGuide')}
        </Button>
      </div>
    </div>
  );
}
