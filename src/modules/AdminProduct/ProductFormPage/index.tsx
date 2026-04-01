import { ArrowLeft } from 'lucide-react';
import { useRouter } from 'next/router';

import { Button } from '@/components/ui/button';
import { FormWrapper } from '@/components/ui/form';
import { ROUTE } from '@/types/routes';

import { FormActionButtons } from './components/form-action-buttons';
import { BasicInfoSection } from './components/sections/basic-info-section';
import { DetailsSection } from './components/sections/details-section';
import { ImagesSection } from './components/sections/images-section';
import { PricingSection } from './components/sections/pricing-section';
import { TimeItinerarySection } from './components/sections/time-itinerary-section';
import { useProductForm } from './use-product-form';

interface ProductFormPageProps {
  productId?: string;
}

export default function ProductFormPage({ productId }: ProductFormPageProps) {
  const router = useRouter();
  const { form, isEdit, itineraries, setItineraries, onSubmit } = useProductForm(productId);
  const pageTitle = isEdit ? `Sửa: ${form.watch('name') || '...'}` : 'Tạo tour mới';
  const currentStatus = form.watch('status') ?? 'draft';

  const handleSaveDraft = form.handleSubmit((data) => onSubmit({ ...data, status: 'draft' }));
  const handlePublish = form.handleSubmit((data) => onSubmit({ ...data, status: 'published' }));
  const handleUnpublish = form.handleSubmit((data) => onSubmit({ ...data, status: 'draft' }));

  return (
    <div className="flex flex-col h-full">
      {/* Sticky Header */}
      <div className="sticky top-0 z-10 bg-white border-b border-gray-200 px-6 py-3 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <Button
            variant="ghost"
            size="icon"
            rounded="md"
            blur={false}
            onClick={() => router.push(ROUTE.ADMIN_PRODUCTS)}
          >
            <ArrowLeft size={18} />
          </Button>
          <div>
            <div className="flex items-center gap-2">
              <p className="text-xs text-gray-400">+ {isEdit ? 'Chỉnh sửa tour' : 'Tạo tour mới'}</p>
              {isEdit && (
                <span
                  className={`text-[10px] font-semibold px-1.5 py-0.5 rounded-full ${
                    currentStatus === 'published' ? 'bg-green-100 text-green-700' : 'bg-yellow-100 text-yellow-700'
                  }`}
                >
                  {currentStatus === 'published' ? 'Công khai' : 'Bản nháp'}
                </span>
              )}
            </div>
            <h1 className="text-base font-bold text-gray-900">{pageTitle}</h1>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <FormActionButtons
            isEdit={isEdit}
            currentStatus={currentStatus}
            onSaveDraft={handleSaveDraft}
            onPublish={handlePublish}
            onUnpublish={handleUnpublish}
            disabled={form.formState.isSubmitting}
          />
        </div>
      </div>

      {/* Body */}
      <div className="flex-1 p-6">
        <FormWrapper form={form} onSubmit={onSubmit}>
          <div className="grid grid-cols-3 gap-6 items-start">
            {/* Main column */}
            <div className="col-span-2 space-y-5">
              <BasicInfoSection isEdit={isEdit} />
              <TimeItinerarySection itineraries={itineraries} onChange={setItineraries} />
              <ImagesSection />
              <DetailsSection />
            </div>

            {/* Sidebar */}
            <div className="col-span-1 space-y-4 sticky top-[57px]">
              <PricingSection />
            </div>
          </div>

          {/* Footer */}
          <div className="flex items-center justify-between mt-6 pt-5 border-t border-gray-200">
            <Button
              type="button"
              variant="ghost"
              size="xs"
              rounded="md"
              blur={false}
              className="px-4"
              onClick={() => router.push(ROUTE.ADMIN_PRODUCTS)}
            >
              Hủy
            </Button>
            <div className="flex items-center gap-2">
              <FormActionButtons
                isEdit={isEdit}
                currentStatus={currentStatus}
                onSaveDraft={handleSaveDraft}
                onPublish={handlePublish}
                onUnpublish={handleUnpublish}
                disabled={form.formState.isSubmitting}
              />
            </div>
          </div>
        </FormWrapper>
      </div>
    </div>
  );
}
