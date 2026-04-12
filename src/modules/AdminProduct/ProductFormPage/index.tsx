import { AlignLeft, ArrowLeft, Calendar, DollarSign, FileText, ImageIcon, Loader2 } from 'lucide-react';
import { useRouter } from 'next/router';
import { useEffect, useState } from 'react';

import { Button } from '@/components/ui/button';
import { FormWrapper } from '@/components/ui/form';
import { useProductForm } from '@/hooks/use-product-form';
import { useScrollSpy } from '@/hooks/use-scroll-spy';
import { ROUTE } from '@/types/routes';

import { DraftRecoveryBanner } from './components/draft-recovery-banner';
import { FormActionButtons } from './components/form-action-buttons';
import { BasicInfoSection } from './components/sections/basic-info-section';
import { DetailsSection } from './components/sections/details-section';
import { ImagesSection } from './components/sections/images-section';
import { OptionsSection } from './components/sections/options-section';
import { PricingCard, RelationCard } from './components/sections/pricing-section';
import { TimeItinerarySection } from './components/sections/time-itinerary-section';
import { VideoCard } from './components/sidebar/VideoCard';

interface ProductFormPageProps {
  productId?: string;
}

const STATUS_CONFIG: Record<string, { dot: string; label: string; text: string }> = {
  published: { dot: 'bg-emerald-500', label: 'bg-emerald-50 text-emerald-700 ring-emerald-200', text: 'Công khai' },
  hidden: { dot: 'bg-slate-400', label: 'bg-slate-50 text-slate-600 ring-slate-200', text: 'Đã ẩn' },
  draft: { dot: 'bg-amber-400', label: 'bg-amber-50 text-amber-700 ring-amber-200', text: 'Bản nháp' },
};

const NAV_SECTIONS = [
  { id: 'section-overview', label: 'Tổng quan', icon: FileText },
  { id: 'section-images', label: 'Hình ảnh', icon: ImageIcon },
  { id: 'section-itinerary', label: 'Lịch trình', icon: Calendar },
  { id: 'section-pricing', label: 'Gói giá', icon: DollarSign },
  { id: 'section-details', label: 'Chi tiết', icon: AlignLeft },
];

const SECTION_IDS = NAV_SECTIONS.map((s) => s.id);

function SectionHeader({ icon: Icon, label }: { icon: React.ElementType; label: string }) {
  return (
    <div className="flex items-center gap-2">
      <Icon size={15} className="text-gray-400 dark:text-gray-500" />
      <h2 className="text-sm font-semibold text-gray-700 dark:text-white/90">{label}</h2>
    </div>
  );
}

function SectionCard({
  id,
  icon,
  label,
  children,
}: {
  id: string;
  icon: React.ElementType;
  label: string;
  children: React.ReactNode;
}) {
  return (
    <div
      id={id}
      className="scroll-mt-20 overflow-hidden bg-white rounded-2xl border border-gray-200 shadow-theme-xs dark:border-gray-800 dark:bg-white/[0.03]"
    >
      <div className="border-b border-gray-200 dark:border-gray-800 px-5 py-4">
        <SectionHeader icon={icon} label={label} />
      </div>
      <div className="p-5">{children}</div>
    </div>
  );
}

export default function ProductFormPage({ productId }: ProductFormPageProps) {
  const router = useRouter();
  const { form, isEdit, productData, itineraries, setItineraries, options, setOptions, onSubmit, isPending, draft } =
    useProductForm(productId);

  const [showDraftBanner, setShowDraftBanner] = useState(false);
  const activeSection = useScrollSpy(SECTION_IDS);

  useEffect(() => {
    if (draft.hasDraft && !isEdit) setShowDraftBanner(true);
  }, [draft.hasDraft, isEdit]);

  const currentStatus = form.watch('status') ?? 'draft';
  const status = STATUS_CONFIG[currentStatus] ?? STATUS_CONFIG.draft;
  const pageTitle = isEdit ? form.watch('name') || '...' : 'Tạo tour mới';

  const handleSaveDraft = form.handleSubmit((data) => onSubmit({ ...data, status: 'draft' }));
  const handleSaveChanges = form.handleSubmit((data) => onSubmit(data));
  const handlePublish = form.handleSubmit((data) => onSubmit({ ...data, status: 'published' }));
  const handleHide = form.handleSubmit((data) => onSubmit({ ...data, status: 'hidden' }));

  function handleRestoreDraft() {
    const restored = draft.restoreDraft();
    if (restored) {
      setItineraries(restored.itineraries);
      setOptions(restored.options);
    }
    setShowDraftBanner(false);
  }

  return (
    <div className="flex flex-col min-h-full bg-gray-50 dark:bg-gray-900">
      {/* Sticky header */}
      <div className="sticky top-0 z-10 bg-white/90 dark:bg-gray-900/90 backdrop-blur-md border-b border-gray-200 dark:border-gray-800 px-6 py-4 flex items-center justify-between shadow-theme-sm">
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
          <div className="min-w-0">
            <div className="flex items-center gap-2 flex-wrap">
              <span className="text-xs text-gray-400">{isEdit ? 'Chỉnh sửa tour' : 'Tour mới'}</span>
              {isEdit && (
                <span
                  className={`inline-flex items-center gap-1.5 text-[11px] font-medium px-2 py-0.5 rounded-full ring-1 ${status.label}`}
                >
                  <span className={`w-1.5 h-1.5 rounded-full ${status.dot}`} /> {status.text}
                </span>
              )}
              {isEdit && productData?.code && (
                <span className="text-[10px] font-mono text-gray-400 bg-gray-100 px-2 py-0.5 rounded-md">
                  #{productData.code}
                </span>
              )}
            </div>
            <h1 className="text-base font-bold text-gray-900 truncate leading-tight">{pageTitle}</h1>
          </div>
        </div>
        <div className="flex items-center gap-2 shrink-0 ml-4">
          {draft.lastSaved && (
            <span className="text-[10px] text-gray-400 hidden sm:block">Nháp lúc {draft.lastSaved}</span>
          )}
          {isPending && <Loader2 size={16} className="animate-spin text-gray-400" />}
          <FormActionButtons
            isEdit={isEdit}
            currentStatus={currentStatus}
            onSaveDraft={handleSaveDraft}
            onSaveChanges={handleSaveChanges}
            onPublish={handlePublish}
            onHide={handleHide}
            disabled={isPending}
          />
        </div>
      </div>

      {showDraftBanner && (
        <DraftRecoveryBanner
          onRestore={handleRestoreDraft}
          onDiscard={() => {
            draft.discardDraft();
            setShowDraftBanner(false);
          }}
        />
      )}

      <div className="flex-1 p-6">
        <FormWrapper form={form} onSubmit={onSubmit}>
          <div className="flex gap-6 items-start w-full">
            {/* Scroll-spy nav sidebar */}
            <div className="hidden lg:flex flex-col gap-1 sticky top-[57px] w-36 shrink-0">
              {NAV_SECTIONS.map(({ id, label, icon: Icon }) => (
                <button
                  key={id}
                  type="button"
                  onClick={() => document.getElementById(id)?.scrollIntoView({ behavior: 'smooth', block: 'start' })}
                  className={`flex items-center gap-2 px-3 py-2 rounded-lg text-xs font-medium transition-colors text-left ${
                    activeSection === id
                      ? 'bg-brand-50 text-brand-600'
                      : 'text-gray-500 hover:bg-gray-100 hover:text-gray-800 dark:text-gray-400 dark:hover:bg-gray-800 dark:hover:text-gray-200'
                  }`}
                >
                  <Icon size={13} className="shrink-0" />
                  {label}
                </button>
              ))}
            </div>

            {/* Main content */}
            <div className="flex-1 min-w-0 space-y-4">
              <SectionCard id="section-overview" icon={FileText} label="Tổng quan">
                <BasicInfoSection isEdit={isEdit} />
              </SectionCard>
              <SectionCard id="section-images" icon={ImageIcon} label="Hình ảnh">
                <ImagesSection />
              </SectionCard>
              <SectionCard id="section-itinerary" icon={Calendar} label="Lịch trình">
                <TimeItinerarySection itineraries={itineraries} onChange={setItineraries} />
              </SectionCard>
              <SectionCard id="section-pricing" icon={DollarSign} label="Gói giá">
                <OptionsSection options={options} onChange={setOptions} />
              </SectionCard>
              <SectionCard id="section-details" icon={AlignLeft} label="Chi tiết">
                <DetailsSection />
              </SectionCard>
            </div>

            {/* Sidebar */}
            <div className="space-y-4 sticky top-[57px] w-[280px] shrink-0">
              {isEdit && (
                <div className="overflow-hidden bg-white rounded-2xl border border-gray-200 shadow-theme-xs dark:border-gray-800 dark:bg-white/[0.03]">
                  <div className="border-b border-gray-200 dark:border-gray-800 px-5 py-4">
                    <p className="text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wide">
                      Trạng thái
                    </p>
                  </div>
                  <div className="p-5 space-y-3">
                    <div
                      className={`inline-flex items-center gap-2 text-sm font-medium px-3 py-1.5 rounded-lg ring-1 ${status.label}`}
                    >
                      <span className={`w-2 h-2 rounded-full ${status.dot}`} />
                      {status.text}
                    </div>
                    {productData?.code && (
                      <p className="text-xs text-gray-400">
                        Mã tour:{' '}
                        <span className="font-mono text-gray-600 bg-gray-50 px-1.5 py-0.5 rounded">
                          {productData.code}
                        </span>
                      </p>
                    )}
                  </div>
                </div>
              )}
              <PricingCard />
              <RelationCard />
              <VideoCard />
            </div>
          </div>
        </FormWrapper>
      </div>
    </div>
  );
}
