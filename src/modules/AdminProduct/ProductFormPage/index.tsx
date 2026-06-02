import { AlertTriangle, AlignLeft, Calendar, FileText, MapPin, Sparkles, Tag, Tv } from 'lucide-react';
import { useEffect, useState } from 'react';

import { Button } from '@/components/ui/button';
import { FormWrapper } from '@/components/ui/form';
import { useProductForm } from '@/hooks/use-product-form';
import { useScrollSpy } from '@/hooks/use-scroll-spy';
import type { ProductFormValues } from '@/lib/validations/product';

import { DraftRecoveryBanner } from './components/draft-recovery-banner';
import { ProductFormHeader } from './components/product-form-header';
import { BannerSection } from './components/sections/banner-section';
import { BasicInfoSection } from './components/sections/basic-info-section';
import { DetailsSection } from './components/sections/details-section';
import { ExperiencesSection } from './components/sections/experiences-section';
// import { ImagesSection } from './components/sections/images-section';
// import { OptionsSection } from './components/sections/options-section';
import { QuickFactsSection } from './components/sections/quick-facts-section';
import { ReadBeforeSection } from './components/sections/read-before-section';
import { TagsSection } from './components/sections/tags-section';
import { TimeItinerarySection } from './components/sections/time-itinerary-section';

interface ProductFormPageProps {
  productId?: string;
}

const NAV_SECTIONS = [
  { id: 'section-banner', label: 'Product Video', icon: Tv },
  { id: 'section-tags', label: 'Product Tags', icon: Tag },
  { id: 'section-overview', label: 'Product Overview', icon: FileText },
  { id: 'section-quick-facts', label: 'Configuration', icon: MapPin },
  { id: 'section-experiences', label: 'Experiences', icon: Sparkles },
  { id: 'section-itinerary', label: 'Itinerary', icon: Calendar },
  { id: 'section-read-before', label: 'Notes', icon: AlertTriangle },
  { id: 'section-details', label: 'Details', icon: AlignLeft },
  // { id: 'section-images', label: 'Images', icon: ImageIcon },
  // { id: 'section-options', label: 'Pricing Options', icon: DollarSign },
];

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
};

const SECTION_IDS = NAV_SECTIONS.map((s) => s.id);

function SectionCard({ id, label, children }: { id: string; label: string; children: React.ReactNode }) {
  return (
    <div
      id={id}
      className="scroll-mt-20 bg-white rounded-2xl border border-slate-200 shadow-theme-xs dark:border-gray-800 dark:bg-white/[0.03]"
    >
      <div className="border-b border-slate-100 dark:border-gray-800 px-5 py-4 rounded-t-2xl">
        <h2 className="text-base font-bold text-slate-800 dark:text-white/90 tracking-tight">{label}</h2>
      </div>
      <div className="px-5 pt-5 pb-5">{children}</div>
    </div>
  );
}

export default function ProductFormPage({ productId }: ProductFormPageProps) {
  const { form, isEdit, productData, onSubmit, handlePublish, handleHide, isPending, draft } =
    useProductForm(productId);

  const [showDraftBanner, setShowDraftBanner] = useState(false);
  const activeSection = useScrollSpy(SECTION_IDS);

  useEffect(() => {
    if (draft.hasDraft && !isEdit) setShowDraftBanner(true);
  }, [draft.hasDraft, isEdit]);

  const currentStatus = form.watch('status') ?? 'draft';
  const { errors } = form.formState;

  const handleSaveDraft = form.handleSubmit((data) => onSubmit({ ...data, status: 'draft' }));
  const handleSaveChanges = form.handleSubmit((data) => onSubmit(data));

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
      />

      <div className="flex-1">
        <FormWrapper form={form} onSubmit={onSubmit}>
          <div className="flex gap-8 items-start w-full">
            {/* Scroll-spy nav */}
            <div className="hidden lg:flex flex-col gap-0.5 sticky top-[130px] w-40 shrink-0 pt-4">
              {NAV_SECTIONS.map(({ id, label, icon: Icon }) => (
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
                  <span className="flex-1 text-left">{label}</span>
                  {sectionHasError(id) && (
                    <span className="w-1.5 h-1.5 rounded-full bg-rose-500 animate-pulse shrink-0" />
                  )}
                </Button>
              ))}
            </div>

            {/* Main content */}
            <div className="flex-1 min-w-0 py-4 space-y-4">
              <SectionCard id="section-banner" label="Product Video">
                <BannerSection />
              </SectionCard>
              <SectionCard id="section-tags" label="Product Tags">
                <TagsSection />
              </SectionCard>
              <SectionCard id="section-overview" label="Product Overview">
                <BasicInfoSection isEdit={isEdit} heroVideo={productData?.heroVideo ?? null} />
              </SectionCard>
              <SectionCard id="section-quick-facts" label="Configuration">
                <QuickFactsSection />
              </SectionCard>
              <SectionCard id="section-experiences" label="Experiences">
                <ExperiencesSection />
              </SectionCard>
              <SectionCard id="section-itinerary" label="Itinerary">
                <TimeItinerarySection />
              </SectionCard>
              <SectionCard id="section-read-before" label="Notes">
                <ReadBeforeSection />
              </SectionCard>
              <SectionCard id="section-details" label="Details">
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
              {/* <SectionCard id="section-images" label="Images">
                  <ImagesSection />
                </SectionCard> */}
              {/* <SectionCard id="section-options" label="Pricing Options">
                  <OptionsSection />
                </SectionCard> */}
            </div>
          </div>
        </FormWrapper>
      </div>
    </div>
  );
}
