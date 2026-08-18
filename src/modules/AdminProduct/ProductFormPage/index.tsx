import {
  AlertTriangle,
  AlignLeft,
  Boxes,
  Calendar,
  Clock,
  FileText,
  MapPin,
  Package,
  Sparkles,
  Tag,
  Tv,
} from 'lucide-react';
import { useTranslation } from 'next-i18next';
import { useEffect, useState } from 'react';

import { Button } from '@/components/ui/button';
import { FormWrapper } from '@/components/ui/form';
import { useProductForm } from '@/hooks/use-product-form';
import { useScrollSpy } from '@/hooks/use-scroll-spy';
import type { ProductFormValues } from '@/lib/validations/product';
import { useAlertStore } from '@/stores/use-alert-store';

import { ProductSessionSheet } from '../ProductListPage/components/ProductSessionSheet';
import { DraftRecoveryBanner } from './components/draft-recovery-banner';
import { ProductFormHeader } from './components/product-form-header';
import { SectionCard } from './components/section-card';
import { BannerSection } from './components/sections/banner-section';
import { BasicInfoSection } from './components/sections/basic-info-section';
import { DepartureSection } from './components/sections/departure-section';
import { DetailsSection } from './components/sections/details-section';
import { ExperiencesSection } from './components/sections/experiences-section';
import { OptionsSection } from './components/sections/options-section';
import { PickupSection } from './components/sections/pickup-section';
import { QuickFactsSection } from './components/sections/quick-facts-section';
import { ReadBeforeSection } from './components/sections/read-before-section';
import { TagsSection } from './components/sections/tags-section';
import { TimeItinerarySection } from './components/sections/time-itinerary-section';
import { UnitSection } from './components/sections/unit-section';

interface ProductFormPageProps {
  productId?: string;
}

const NAV_SECTIONS = [
  { id: 'section-banner', labelKey: 'secProductVideo', icon: Tv },
  { id: 'section-tags', labelKey: 'secProductTags', icon: Tag },
  { id: 'section-overview', labelKey: 'secProductOverview', icon: FileText },
  { id: 'section-quick-facts', labelKey: 'secConfiguration', icon: MapPin },
  { id: 'section-experiences', labelKey: 'secExperiences', icon: Sparkles },
  { id: 'section-itinerary', labelKey: 'secItinerary', icon: Calendar },
  { id: 'section-read-before', labelKey: 'secNotes', icon: AlertTriangle },
  { id: 'section-details', labelKey: 'secDetails', icon: AlignLeft },
  { id: 'section-options', labelKey: 'secOptions', icon: Package },
  { id: 'section-pickups', labelKey: 'secPickups', icon: MapPin },
  { id: 'section-departures', labelKey: 'secDepartures', icon: Clock },
  { id: 'section-units', labelKey: 'secUnits', icon: Boxes },
] as const;

const SECTION_ERROR_FIELDS: Record<string, (keyof ProductFormValues)[]> = {
  'section-banner': ['banner'],
  'section-tags': ['tags'],
  'section-overview': [
    'name',
    'slug',
    'minPrice',
    'shortDescription',
    'highlight',
    'destinationId',
    'supplierId',
    'tourGuideIds',
    'videoId',
  ],
  'section-quick-facts': ['elementIds'],
  'section-experiences': ['experiences'],
  'section-itinerary': ['itineraries'],
  'section-read-before': ['readBefores'],
  'section-details': ['include', 'exclude'],
  'section-options': ['options'],
  'section-departures': ['departureTimes'],
  'section-pickups': ['pickupLocations'],
  'section-units': ['units'],
};

const SECTION_IDS = NAV_SECTIONS.map((s) => s.id);

export default function ProductFormPage({ productId }: ProductFormPageProps) {
  const { t } = useTranslation('adminPage');
  const { form, isEdit, productData, onSubmit, handlePublish, handleHide, isPending, draft } =
    useProductForm(productId);

  const [showDraftBanner, setShowDraftBanner] = useState(false);
  const [sessionDrawerOpen, setSessionDrawerOpen] = useState(false);
  const activeSection = useScrollSpy(SECTION_IDS);

  useEffect(() => {
    if (draft.hasDraft && !isEdit) setShowDraftBanner(true);
  }, [draft.hasDraft, isEdit]);

  const currentStatus = form.watch('status') ?? 'draft';
  const { errors, isSubmitted } = form.formState;
  const { addAlert } = useAlertStore.getState();

  const onValidationError = () => addAlert({ type: 'error', title: t('tourValidationError') });

  const handleSaveDraft = form.handleSubmit((data) => onSubmit({ ...data, status: 'draft' }), onValidationError);
  const handleSaveChanges = form.handleSubmit((data) => onSubmit(data), onValidationError);

  const sectionHasError = (sectionId: string) => (SECTION_ERROR_FIELDS[sectionId] ?? []).some((f) => !!errors[f]);

  return (
    <div className="flex flex-col min-h-full bg-gray-50 dark:bg-gray-900">
      {showDraftBanner && (
        <DraftRecoveryBanner
          onRestore={() => {
            draft.restoreDraft();
            setShowDraftBanner(false);
          }}
          onDiscard={() => {
            draft.discardDraft();
            setShowDraftBanner(false);
          }}
        />
      )}

      <ProductFormHeader
        isEdit={isEdit}
        productId={productId}
        currentStatus={currentStatus}
        lastSaved={draft.lastSaved}
        isPending={isPending}
        onSaveDraft={handleSaveDraft}
        onSaveChanges={handleSaveChanges}
        onPublish={handlePublish}
        onHide={handleHide}
        onManageSessions={isEdit && productId ? () => setSessionDrawerOpen(true) : undefined}
      />

      <div className="flex-1">
        <FormWrapper form={form} onSubmit={onSubmit}>
          <div className="flex gap-8 items-start w-full">
            <div className="hidden lg:flex flex-col gap-0.5 sticky top-[130px] w-40 shrink-0 pt-4">
              {NAV_SECTIONS.map(({ id, labelKey, icon: Icon }) => (
                <Button
                  key={id}
                  variant="ghost"
                  onClick={() => document.getElementById(id)?.scrollIntoView({ behavior: 'smooth', block: 'start' })}
                  className={`w-full justify-start gap-2 px-3 py-2 rounded-lg text-xs font-medium text-left ${
                    activeSection === id
                      ? 'bg-brand-50 text-brand-600 hover:bg-brand-50 hover:text-brand-600'
                      : 'text-gray-500 hover:bg-gray-100 hover:text-gray-800 dark:text-gray-400 dark:hover:bg-gray-800 dark:hover:text-gray-200'
                  }`}
                >
                  <Icon size={13} className="shrink-0" />
                  <span className="flex-1 text-left">{t(labelKey)}</span>
                  {sectionHasError(id) && (
                    <span className="w-1.5 h-1.5 rounded-full bg-rose-500 animate-pulse shrink-0" />
                  )}
                </Button>
              ))}
            </div>

            <div className="flex-1 min-w-0 py-4 space-y-4">
              <SectionCard id="section-banner" label={t('secProductVideo')}>
                <BannerSection />
              </SectionCard>
              <SectionCard id="section-tags" label={t('secProductTags')}>
                <TagsSection />
              </SectionCard>
              <SectionCard id="section-overview" label={t('secProductOverview')}>
                <BasicInfoSection isEdit={isEdit} heroVideo={productData?.heroVideo ?? null} />
              </SectionCard>
              <SectionCard id="section-quick-facts" label={t('secConfiguration')}>
                <QuickFactsSection />
              </SectionCard>
              <SectionCard id="section-experiences" label={t('secExperiences')}>
                <ExperiencesSection />
              </SectionCard>
              <SectionCard id="section-itinerary" label={t('secItinerary')}>
                <TimeItinerarySection />
              </SectionCard>
              <SectionCard id="section-read-before" label={t('secNotes')}>
                <ReadBeforeSection />
              </SectionCard>
              <SectionCard id="section-details" label={t('secDetails')}>
                {!isEdit || productData ? (
                  <DetailsSection />
                ) : (
                  <div className="space-y-4">
                    <div className="space-y-2 animate-pulse">
                      <div className="h-4 bg-slate-200/80 rounded w-28" />
                      <div className="h-[280px] bg-slate-100 border border-slate-100 rounded-xl" />
                    </div>
                    <div className="space-y-2 animate-pulse">
                      <div className="h-4 bg-slate-200/80 rounded w-36" />
                      <div className="h-[280px] bg-slate-100 border border-slate-100 rounded-xl" />
                    </div>
                  </div>
                )}
              </SectionCard>
              <SectionCard id="section-options" label={t('secOptions')}>
                <OptionsSection
                  value={form.watch('options') ?? []}
                  onChange={(rows) => form.setValue('options', rows, { shouldDirty: true })}
                  isSubmitted={isSubmitted}
                />
              </SectionCard>
              <SectionCard id="section-pickups" label={t('secPickups')}>
                <PickupSection
                  value={form.watch('pickupLocations') ?? []}
                  onChange={(rows) => form.setValue('pickupLocations', rows, { shouldDirty: true })}
                  isSubmitted={isSubmitted}
                />
              </SectionCard>
              <SectionCard id="section-departures" label={t('secDepartures')}>
                <DepartureSection
                  value={form.watch('departureTimes') ?? []}
                  onChange={(rows) => form.setValue('departureTimes', rows, { shouldDirty: true })}
                  isSubmitted={isSubmitted}
                />
              </SectionCard>
              <SectionCard id="section-units" label={t('secUnits')}>
                <UnitSection
                  value={form.watch('units') ?? []}
                  onChange={(rows) => form.setValue('units', rows, { shouldDirty: true })}
                  isSubmitted={isSubmitted}
                />
              </SectionCard>
            </div>
          </div>
        </FormWrapper>
      </div>

      {isEdit && productId && (
        <ProductSessionSheet
          open={sessionDrawerOpen}
          productId={productId}
          productName={form.watch('name') ?? ''}
          onClose={() => setSessionDrawerOpen(false)}
        />
      )}
    </div>
  );
}
