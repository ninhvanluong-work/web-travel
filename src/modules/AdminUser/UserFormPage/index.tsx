import { Lock, Users } from 'lucide-react';
import { useRouter } from 'next/router';
import { useTranslation } from 'next-i18next';
import { useCallback, useState } from 'react';

import { AdminConfirmDialog } from '@/components/ui/admin-confirm-dialog';
import { Button } from '@/components/ui/button';
import { FormWrapper } from '@/components/ui/form';
import { useAdminUserForm } from '@/hooks/use-admin-user-form';
import { useAlertStore } from '@/stores/use-alert-store';

import { SectionCard } from '../../AdminProduct/ProductFormPage/components/section-card';
import { DeleteUserDialog } from '../components/delete-user-dialog';
import { ResetPasswordDialog } from '../components/reset-password-dialog';
import { USER_FORM_ID, USER_NS, USER_ROUTES } from '../constants';
import { useAdminActor } from '../hooks/use-admin-actor';
import { useUserDeleteAction } from '../hooks/use-user-delete-action';
import { canChangeRole, canDeleteUser, canManageUser, getAssignableRoles, isSelf } from '../permissions';
import { AccountSection } from './components/sections/account-section';
import { UserFormHeader } from './components/user-form-header';
import { UserInfoCard } from './components/user-info-card';

const FORM_SKELETON = (
  <div className="space-y-6 animate-pulse">
    {[0, 1, 2].map((i) => (
      <div key={i} className="space-y-2">
        <div className="h-4 bg-slate-200/80 rounded w-24" />
        <div className="h-11 bg-slate-100 border border-slate-100 rounded-lg" />
      </div>
    ))}
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

interface UserFormPageProps {
  userId?: string;
}

export default function UserFormPage({ userId }: UserFormPageProps) {
  const { t } = useTranslation(USER_NS);
  const router = useRouter();
  const actor = useAdminActor();
  const { form, isEdit, user, isLoadingDetail, isNotFound, onSubmit, isPending } = useAdminUserForm(userId);
  const { isDirty } = form.formState;

  // Permissions (the BE remains the source of truth; these only hide actions it would reject)
  const canManage = !user || canManageUser(actor, user);
  const readOnly = isEdit && !!user && !canManage;
  let roleLockReason: string | null = null;
  if (user && isSelf(actor, user)) roleLockReason = t('roleLockedSelf');
  else if (user && !canChangeRole(actor, user)) roleLockReason = t('roleLockedPermission');

  const [confirmLeave, setConfirmLeave] = useState(false);
  const [resetOpen, setResetOpen] = useState(false);

  const goToList = useCallback(() => router.push(USER_ROUTES.LIST), [router]);

  const handleBack = useCallback(() => {
    if (isDirty && !isPending && !readOnly) setConfirmLeave(true);
    else goToList();
  }, [isDirty, isPending, readOnly, goToList]);

  const onValidationError = useCallback(() => {
    useAlertStore.getState().addAlert({ type: 'error', title: t('validationError') });
    scrollToFirstError();
  }, [t]);

  const { deleteTarget, setDeleteTarget, handleDeleteConfirm, handleDeleteCancel, isDeleting } =
    useUserDeleteAction(goToList);

  // Ctrl/Cmd + Enter submits
  const handleKeyDown = useCallback(
    (e: React.KeyboardEvent<HTMLDivElement>) => {
      if (e.key !== 'Enter' || !(e.ctrlKey || e.metaKey) || isPending || readOnly) return;
      e.preventDefault();
      form.handleSubmit(onSubmit, onValidationError)();
    },
    [form, onSubmit, onValidationError, isPending, readOnly]
  );

  if (isNotFound) {
    return (
      <div className="min-h-full bg-gray-50 dark:bg-gray-900 flex flex-col items-center justify-center gap-3 py-24 text-gray-400">
        <Users size={40} className="opacity-25" />
        <p className="text-sm font-medium text-gray-500">{t('userNotFound')}</p>
        <Button variant="secondary" size="xs" rounded="md" blur={false} className="px-4" onClick={goToList}>
          {t('backToList')}
        </Button>
      </div>
    );
  }

  return (
    <div className="flex flex-col min-h-full bg-gray-50 dark:bg-gray-900" onKeyDown={handleKeyDown}>
      <UserFormHeader
        isEdit={isEdit}
        isPending={isPending}
        isDirty={isDirty}
        canSubmit={!isLoadingDetail && (!isEdit || isDirty)}
        readOnly={readOnly}
        onBack={handleBack}
      />

      <FormWrapper form={form} onSubmit={onSubmit} onError={onValidationError} formId={USER_FORM_ID}>
        <div className="flex gap-6 items-start px-6 py-4">
          <div className="flex-1 min-w-0 space-y-4">
            {readOnly ? (
              <p className="flex items-center gap-2 rounded-xl bg-slate-100 px-4 py-3 text-sm text-slate-600">
                <Lock size={14} className="shrink-0" />
                {t('readOnlyNotice')}
              </p>
            ) : null}
            <SectionCard id="section-account" label={t('secAccount')}>
              {isLoadingDetail ? (
                FORM_SKELETON
              ) : (
                <fieldset disabled={readOnly} className="contents">
                  <AccountSection
                    isEdit={isEdit}
                    roleOptions={getAssignableRoles(actor.role)}
                    roleLockReason={readOnly ? null : roleLockReason}
                    autoFocusEmail={!isEdit}
                  />
                </fieldset>
              )}
            </SectionCard>
          </div>

          {isEdit && user ? (
            <aside className="w-[320px] shrink-0 sticky top-[140px]">
              <UserInfoCard
                user={user}
                canResetPassword={canManage}
                canDelete={canDeleteUser(actor, user)}
                disabled={isPending || isDeleting}
                onResetPassword={() => setResetOpen(true)}
                onDelete={() => setDeleteTarget(user)}
              />
            </aside>
          ) : null}
        </div>
      </FormWrapper>

      <ResetPasswordDialog target={resetOpen && user ? user : null} onClose={() => setResetOpen(false)} />
      <DeleteUserDialog
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
