import { useEffect } from 'react';
import { useFormContext, useWatch } from 'react-hook-form';

import { FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { PriceInput } from '@/components/ui/price-input';
import { TextArea } from '@/components/ui/textarea';
import { generateSlug, type ProductFormValues } from '@/lib/validations/product';

import { TourMetadataSelects } from '../shared/tour-metadata-selects';
import { VideoSearchField } from '../shared/video-search-field';

export function BasicInfoSection({ isEdit }: { isEdit: boolean }) {
  const { control, setValue } = useFormContext<ProductFormValues>();
  const nameValue = useWatch({ control, name: 'name' });

  useEffect(() => {
    if (!isEdit && nameValue) {
      setValue('slug', generateSlug(nameValue), { shouldValidate: false });
    }
  }, [isEdit, nameValue, setValue]);

  return (
    <div className="space-y-6">
      {/* name + slug */}
      <div className="flex flex-row gap-5">
        <div className="flex-1 min-w-0">
          <FormField
            control={control}
            name="name"
            render={({ field }) => (
              <FormItem className="space-y-1.5">
                <FormLabel className="text-[13px] text-slate-500 font-medium">Tour Name</FormLabel>
                <FormControl>
                  <Input size="sm" placeholder="Enter product name" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>

        <div className="flex-1 min-w-0">
          <FormField
            control={control}
            name="slug"
            render={({ field }) => (
              <FormItem className="space-y-1.5">
                <FormLabel className="text-[13px] text-slate-500 font-medium">URL Path</FormLabel>
                <FormControl>
                  <Input
                    size="sm"
                    placeholder="product-slug"
                    {...field}
                    className="bg-slate-50/50 text-slate-500 border-slate-200"
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>
      </div>

      {/* destination + supplier + tour guide */}
      <TourMetadataSelects />

      {/* 2-column: left = price + short desc, right = video + highlights */}
      <div className="grid grid-cols-2 gap-5 pt-4 border-t border-slate-100">
        {/* Left column */}
        <div className="space-y-5">
          <FormField
            control={control}
            name="minPrice"
            render={({ field }) => (
              <FormItem className="space-y-1.5">
                <FormLabel className="text-[13px] text-slate-500 font-medium">Starting Price</FormLabel>
                <FormControl>
                  <PriceInput value={field.value ?? 0} onChange={field.onChange} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={control}
            name="shortDescription"
            render={({ field }) => (
              <FormItem className="space-y-1.5">
                <FormLabel className="text-[13px] text-slate-500 font-medium">Short Description</FormLabel>
                <FormControl>
                  <TextArea
                    placeholder="Enter short description of the tour..."
                    className="min-h-[120px] resize-none bg-slate-50/20 border-slate-200 focus-visible:bg-white transition-colors rounded-xl shadow-theme-xs"
                    maxLength={500}
                    rows={4}
                    {...field}
                    value={field.value ?? ''}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>

        {/* Right column */}
        <div className="space-y-5">
          <VideoSearchField />

          <FormField
            control={control}
            name="highlight"
            render={({ field }) => (
              <FormItem className="space-y-1.5">
                <FormLabel className="text-[13px] text-slate-500 font-medium">Highlights</FormLabel>
                <FormControl>
                  <TextArea
                    placeholder="Describe the tour highlights..."
                    className="min-h-[120px] resize-none bg-slate-50/20 border-slate-200 focus-visible:bg-white transition-colors rounded-xl shadow-theme-xs italic font-medium text-slate-700"
                    rows={4}
                    {...field}
                    value={field.value ?? ''}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>
      </div>
    </div>
  );
}
