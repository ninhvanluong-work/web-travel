import { Loader2, User } from 'lucide-react';
import { useTranslation } from 'next-i18next';

import { Input } from '@/components/ui/input';
import { ExperienceImageUpload } from '@/modules/AdminProduct/ProductFormPage/components/shared/experience-image-upload';

import { SupplierFormHeader } from './components/supplier-form-header';
import { useSupplierForm } from './hooks/use-supplier-form';

interface SupplierFormPageProps {
  supplierId?: string;
}

const NAV_SECTIONS = [{ id: 'section-basic', labelKey: 'basicInfo', icon: User }] as const;

function SectionCard({ id, title, children }: { id: string; title: string; children: React.ReactNode }) {
  return (
    <div
      id={id}
      className="scroll-mt-20 bg-white rounded-2xl border border-slate-200 shadow-theme-xs dark:border-gray-800 dark:bg-white/[0.03]"
    >
      <div className="border-b border-slate-100 dark:border-gray-800 px-5 py-4 rounded-t-2xl">
        <h2 className="text-base font-bold text-slate-800 dark:text-white/90 tracking-tight">{title}</h2>
      </div>
      <div className="px-5 pt-5 pb-5">{children}</div>
    </div>
  );
}

export default function SupplierFormPage({ supplierId }: SupplierFormPageProps) {
  const { t } = useTranslation('adminPage');
  const { values, setValues, nameError, isEdit, isLoadingSupplier, isPending, onSubmit } = useSupplierForm(supplierId);

  if (isEdit && isLoadingSupplier) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Loader2 size={28} className="animate-spin text-brand-500" />
      </div>
    );
  }

  return (
    <div className="flex flex-col min-h-full bg-gray-50 dark:bg-gray-900">
      <SupplierFormHeader isEdit={isEdit} isPending={isPending} onSave={onSubmit} />

      <div className="flex-1 px-6">
        <div className="flex gap-8 items-start w-full">
          {/* Left scroll-spy nav */}
          <div className="hidden lg:flex flex-col gap-0.5 sticky top-[130px] w-40 shrink-0 pt-4">
            {NAV_SECTIONS.map(({ id, labelKey, icon: Icon }) => (
              <button
                key={id}
                type="button"
                onClick={() => document.getElementById(id)?.scrollIntoView({ behavior: 'smooth', block: 'start' })}
                className="w-full flex items-center gap-2 px-3 py-2 rounded-lg text-xs font-medium text-left transition-colors bg-brand-50 text-brand-600"
              >
                <Icon size={13} className="shrink-0" />
                <span className="flex-1 text-left">{t(labelKey)}</span>
              </button>
            ))}
          </div>

          {/* Main content */}
          <div className="flex-1 min-w-0 py-4 space-y-4">
            <SectionCard id="section-basic" title={t('basicInfo')}>
              <div className="grid grid-cols-2 gap-5">
                {/* Name */}
                <div className="space-y-1.5">
                  <label className="admin-form-label">
                    {t('supplierName')} <span className="text-red-500">*</span>
                  </label>
                  <Input
                    size="sm"
                    fullWidth
                    placeholder={t('supplierNamePlaceholder')}
                    value={values.name}
                    onChange={(e) => setValues((p) => ({ ...p, name: e.target.value }))}
                  />
                  {nameError && <p className="text-xs text-red-500">{nameError}</p>}
                </div>

                {/* Contact */}
                <div className="space-y-1.5">
                  <label className="admin-form-label">{t('contactLabel')}</label>
                  <Input
                    size="sm"
                    fullWidth
                    placeholder={t('contactPlaceholder')}
                    value={values.contact}
                    onChange={(e) => setValues((p) => ({ ...p, contact: e.target.value }))}
                  />
                </div>

                {/* Divider */}
                <div className="col-span-2 zone-divider" />

                {/* Avatar */}
                <div className="col-span-2 space-y-1.5">
                  <label className="admin-form-label">{t('avatarLabel')}</label>
                  <div className="flex items-start gap-6">
                    <ExperienceImageUpload
                      value={values.avatar || null}
                      onChange={(url) => setValues((p) => ({ ...p, avatar: url }))}
                      aspectRatio="w-[120px] h-[120px]"
                      shape="circle"
                      hideUrlInput={true}
                    />
                    <p className="text-[12px] text-slate-400 mt-2 leading-relaxed">{t('supportsImages')}</p>
                  </div>
                </div>
              </div>
            </SectionCard>
          </div>
        </div>
      </div>
    </div>
  );
}
