import { ArrowLeft, Loader2, SaveIcon } from 'lucide-react';
import { useTranslation } from 'next-i18next';

import { BackToListButton } from '@/components/ui/back-to-list-button';
import { Button } from '@/components/ui/button';

import { USER_FORM_ID, USER_NS } from '../../constants';

interface UserFormHeaderProps {
  isEdit: boolean;
  isPending: boolean;
  isDirty: boolean;
  canSubmit: boolean;
  /** Hide the save button entirely when the actor may only view this account */
  readOnly: boolean;
  onBack: () => void;
}

export function UserFormHeader({ isEdit, isPending, isDirty, canSubmit, readOnly, onBack }: UserFormHeaderProps) {
  const { t } = useTranslation(USER_NS);

  return (
    <div className="sticky top-[72px] z-30 bg-white/90 dark:bg-gray-900/90 backdrop-blur-md border-b border-gray-200 dark:border-gray-800 px-6 py-3 flex items-center justify-between gap-4 shadow-theme-sm">
      <div className="flex items-center gap-3 min-w-0">
        <Button
          type="button"
          variant="ghost"
          size="icon"
          rounded="md"
          blur={false}
          aria-label={t('backToList')}
          className="shrink-0 text-gray-500 hover:text-gray-900 hover:bg-gray-100"
          onClick={onBack}
        >
          <ArrowLeft size={18} />
        </Button>

        <h1 className="text-lg font-bold text-slate-800 dark:text-white/90 truncate leading-tight">
          {isEdit ? t('editUser') : t('addUser')}
        </h1>

        {isEdit && isDirty ? (
          <span className="hidden sm:inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold bg-amber-50 text-amber-700 ring-1 ring-amber-200 shrink-0">
            <span className="w-1.5 h-1.5 rounded-full bg-amber-400" />
            {t('unsavedChanges')}
          </span>
        ) : null}
      </div>

      <div className="flex items-center gap-2 shrink-0">
        {isPending ? <Loader2 size={16} className="animate-spin text-gray-400" /> : null}
        <BackToListButton label={t('goToList')} onClick={onBack} disabled={isPending} />
        {readOnly ? null : (
          <Button
            type="submit"
            form={USER_FORM_ID}
            variant="primary"
            size="xs"
            rounded="md"
            blur={false}
            className="flex items-center gap-2 px-4"
            disabled={isPending || !canSubmit}
          >
            <SaveIcon size={14} />
            {isEdit ? t('saveChanges') : t('createUser')}
          </Button>
        )}
      </div>
    </div>
  );
}
