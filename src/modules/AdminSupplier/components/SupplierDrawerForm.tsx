import { Loader2 } from 'lucide-react';
import { useTranslation } from 'next-i18next';
import { useEffect, useState } from 'react';

import { useSupplierById } from '@/api/supplier/queries';
import type { ISupplier, SupplierFormPayload } from '@/api/supplier/types';
import { Button } from '@/components/ui/button';
import { Sheet, SheetContent, SheetHeader, SheetTitle } from '@/components/ui/sheet';
import { cn } from '@/lib/utils';

import { SupplierAvatarDropzone } from './supplier-avatar-dropzone';

interface SupplierDrawerFormProps {
  open: boolean;
  editTarget: ISupplier | null;
  isSubmitting: boolean;
  onClose: () => void;
  onSubmit: (payload: SupplierFormPayload) => void;
}

const EMPTY_FORM: SupplierFormPayload = { name: '', contact: '', avatar: '' };

export function SupplierDrawerForm({ open, editTarget, isSubmitting, onClose, onSubmit }: SupplierDrawerFormProps) {
  const { t } = useTranslation('adminPage');
  const isEdit = !!editTarget;

  const [form, setForm] = useState<SupplierFormPayload>(EMPTY_FORM);
  const [nameError, setNameError] = useState('');

  const { data: fetchedSupplier, isLoading: isFetchingSupplier } = useSupplierById({
    variables: { id: editTarget?.id ?? '' },
    enabled: isEdit && open && !!editTarget?.id,
  } as any);

  useEffect(() => {
    if (!open) {
      setForm(EMPTY_FORM);
      setNameError('');
      return;
    }
    if (isEdit && fetchedSupplier) {
      setForm({ name: fetchedSupplier.name, contact: fetchedSupplier.contact, avatar: fetchedSupplier.avatar ?? '' });
    }
  }, [open, isEdit, fetchedSupplier]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.name.trim() || form.name.trim().length < 2) {
      setNameError(t('supplierNameError'));
      return;
    }
    setNameError('');
    onSubmit({ name: form.name.trim(), contact: form.contact.trim(), avatar: form.avatar?.trim() || undefined });
  };

  const isLoadingEdit = isEdit && isFetchingSupplier;

  return (
    <Sheet
      open={open}
      onOpenChange={(o) => {
        if (!o && !isSubmitting) onClose();
      }}
    >
      <SheetContent side="right" className="w-full sm:max-w-md flex flex-col p-0 gap-0 bg-white dark:bg-gray-900">
        <SheetHeader className="px-6 py-5 border-b border-gray-100 dark:border-gray-800 shrink-0">
          <SheetTitle className="text-gray-900 dark:text-white font-bold text-lg">
            {isEdit ? t('editSupplier') : t('addSupplier')}
          </SheetTitle>
        </SheetHeader>

        {isLoadingEdit ? (
          <div className="flex-1 flex items-center justify-center">
            <Loader2 size={24} className="animate-spin text-brand-500" />
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="flex-1 flex flex-col overflow-y-auto">
            <div className="flex-1 px-6 py-6 space-y-5">
              <div className="space-y-2">
                <label className="text-sm font-medium text-gray-700 dark:text-gray-300">{t('avatarLabel')}</label>
                <SupplierAvatarDropzone
                  value={form.avatar ?? ''}
                  onChange={(url) => setForm((p) => ({ ...p, avatar: url }))}
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-sm font-medium text-gray-700 dark:text-gray-300">
                  {t('supplierName')} <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  value={form.name}
                  onChange={(e) => setForm((p) => ({ ...p, name: e.target.value }))}
                  placeholder={t('supplierNamePlaceholder')}
                  className={cn(
                    'w-full h-11 px-4 rounded-xl border text-sm text-gray-800 shadow-theme-xs placeholder:text-gray-400 outline-none transition dark:bg-gray-900 dark:text-white/90 dark:placeholder:text-gray-500',
                    nameError
                      ? 'border-red-400 focus:border-red-400 focus:ring-4 focus:ring-red-500/10'
                      : 'border-gray-200 bg-white focus:border-brand-300 focus:ring-4 focus:ring-brand-500/5 dark:border-gray-700'
                  )}
                />
                {nameError && <p className="text-xs text-red-500">{nameError}</p>}
              </div>

              <div className="space-y-1.5">
                <label className="text-sm font-medium text-gray-700 dark:text-gray-300">{t('contactLabel')}</label>
                <input
                  type="text"
                  value={form.contact}
                  onChange={(e) => setForm((p) => ({ ...p, contact: e.target.value }))}
                  placeholder={t('contactPlaceholder')}
                  className="w-full h-11 px-4 rounded-xl border border-gray-200 bg-white text-sm text-gray-800 shadow-theme-xs placeholder:text-gray-400 outline-none focus:border-brand-300 focus:ring-4 focus:ring-brand-500/5 transition dark:bg-gray-900 dark:border-gray-700 dark:text-white/90 dark:placeholder:text-gray-500"
                />
              </div>
            </div>

            <div className="shrink-0 px-6 py-5 border-t border-gray-100 dark:border-gray-800 flex items-center justify-end gap-3">
              <button
                type="button"
                onClick={onClose}
                disabled={isSubmitting}
                className="h-10 px-5 rounded-xl border border-gray-200 bg-white text-sm font-semibold text-gray-700 hover:bg-gray-50 transition dark:border-gray-700 dark:bg-transparent dark:text-gray-300 dark:hover:bg-gray-800 disabled:opacity-50"
              >
                {t('cancel')}
              </button>
              <Button
                type="submit"
                disabled={isSubmitting}
                blur={false}
                className="h-10 px-5 rounded-xl bg-brand-500 hover:bg-brand-600 border-0 text-sm font-semibold text-white flex items-center gap-1.5 shadow-theme-xs disabled:opacity-50"
              >
                {isSubmitting && <Loader2 size={14} className="animate-spin" />}
                {isEdit ? t('saveChanges') : t('createSupplier')}
              </Button>
            </div>
          </form>
        )}
      </SheetContent>
    </Sheet>
  );
}
