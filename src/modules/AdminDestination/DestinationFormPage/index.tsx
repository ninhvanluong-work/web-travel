import { MapPin } from 'lucide-react';
import { useRouter } from 'next/router';
import { useTranslation } from 'next-i18next';
import { useCallback, useState } from 'react';

import { AdminConfirmDialog } from '@/components/ui/admin-confirm-dialog';
import { Button } from '@/components/ui/button';
import { FormWrapper } from '@/components/ui/form';
import { useDestinationForm } from '@/hooks/use-destination-form';
import { useAlertStore } from '@/stores/use-alert-store';

import { SectionCard } from '../../AdminProduct/ProductFormPage/components/section-card';
import { DESTINATION_FORM_ID, DESTINATION_NS, DESTINATION_ROUTES } from '../constants';
import { DeleteConfirmDialog } from '../DestinationListPage/components/DeleteConfirmDialog';
import { useDestinationDeleteAction } from '../DestinationListPage/hooks/use-destination-list-actions';
import { DestinationFormHeader } from './components/destination-form-header';
import { DestinationInfoCard } from './components/destination-info-card';
import { BasicInfoSection } from './components/sections/basic-info-section';

const FORM_SKELETON = (
  <div className="space-y-6 animate-pulse">
    <div className="space-y-2">
      <div className="h-4 bg-slate-200/80 rounded w-28" />
      <div className="h-11 bg-slate-100 border border-slate-100 rounded-lg" />
    </div>
    <div className="space-y-2">
      <div className="h-4 bg-slate-200/80 rounded w-20" />
      <div className="h-[320px] bg-slate-100 border border-slate-100 rounded-lg" />
    </div>
  </div>
);

function scrollToFirstError() {
  setTimeout(() => {
    const el = document.querySelector<HTMLElement>('[aria-invalid="true"]');
    if (!el) return;
    el.scrollIntoView({ behavior: 'smooth', block: 'center' });
    el.focus({ preventScroll: true });
  }, 100);
}

interface DestinationFormPageProps {
  destinationId?: string;
}

export default function DestinationFormPage({ destinationId }: DestinationFormPageProps) {
  const { t } = useTranslation(DESTINATION_NS);
  const router = useRouter();
  const { form, isEdit, destination, isLoadingDetail, isNotFound, onSubmit, isPending } =
    useDestinationForm(destinationId);
  const { isDirty } = form.formState;

  const [confirmLeave, setConfirmLeave] = useState(false);

  const goToList = useCallback(() => router.push(DESTINATION_ROUTES.LIST), [router]);

  const handleBack = useCallback(() => {
    if (isDirty && !isPending) setConfirmLeave(true);
    else goToList();
  }, [isDirty, isPending, goToList]);

  const onValidationError = useCallback(() => {
    useAlertStore.getState().addAlert({ type: 'error', title: t('validationError') });
    scrollToFirstError();
  }, [t]);

  const { deleteTarget, setDeleteTarget, handleDeleteConfirm, handleDeleteCancel, isDeleting } =
    useDestinationDeleteAction(goToList);

  // Ctrl/Cmd + Enter submits, handy while typing a long description
  const handleKeyDown = useCallback(
    (e: React.KeyboardEvent<HTMLDivElement>) => {
      if (e.key !== 'Enter' || !(e.ctrlKey || e.metaKey) || isPending) return;
      e.preventDefault();
      form.handleSubmit(onSubmit, onValidationError)();
    },
    [form, onSubmit, onValidationError, isPending]
  );

  if (isNotFound) {
    return (
      <div className="min-h-full bg-gray-50 dark:bg-gray-900 flex flex-col items-center justify-center gap-3 py-24 text-gray-400">
        <MapPin size={40} className="opacity-25" />
        <p className="text-sm font-medium text-gray-500">{t('destinationNotFound')}</p>
        <Button variant="secondary" size="xs" rounded="md" blur={false} className="px-4" onClick={goToList}>
          {t('backToList')}
        </Button>
      </div>
    );
  }

  return (
    <div className="flex flex-col min-h-full bg-gray-50 dark:bg-gray-900" onKeyDown={handleKeyDown}>
      <DestinationFormHeader
        isEdit={isEdit}
        isPending={isPending}
        isDirty={isDirty}
        canSubmit={!isLoadingDetail && (!isEdit || isDirty)}
        onBack={handleBack}
      />

      <FormWrapper form={form} onSubmit={onSubmit} onError={onValidationError} formId={DESTINATION_FORM_ID}>
        <div className="flex gap-6 items-start px-6 py-4">
          <div className="flex-1 min-w-0">
            <SectionCard id="section-info" label={t('secDestinationInfo')}>
              {isLoadingDetail ? FORM_SKELETON : <BasicInfoSection autoFocusName={!isEdit} />}
            </SectionCard>
          </div>

          {isEdit && destination ? (
            <aside className="w-[320px] shrink-0 sticky top-[140px]">
              <DestinationInfoCard
                destination={destination}
                disabled={isPending || isDeleting}
                onDelete={() => setDeleteTarget(destination)}
              />
            </aside>
          ) : null}
        </div>
      </FormWrapper>

      <DeleteConfirmDialog
        target={deleteTarget}
        isDeleting={isDeleting}
        onConfirm={handleDeleteConfirm}
        onCancel={handleDeleteCancel}
      />

      <AdminConfirmDialog
        open={confirmLeave}
        title={t('discardChangesTitle')}
        description={t('discardChangesMessage')}
        confirmLabel={t('discardChanges')}
        cancelLabel={t('keepEditing')}
        onConfirm={goToList}
        onCancel={() => setConfirmLeave(false)}
      />
    </div>
  );
}
