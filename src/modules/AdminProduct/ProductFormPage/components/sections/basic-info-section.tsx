import { useTranslation } from 'next-i18next';
import { useEffect } from 'react';
import { useFormContext, useWatch } from 'react-hook-form';

import { FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { PriceInput } from '@/components/ui/price-input';
import { TextArea } from '@/components/ui/textarea';
import { generateSlug, type ProductFormValues } from '@/lib/validations/product';

import { TourMetadataSelects } from '../shared/tour-metadata-selects';
import { VideoSearchField } from '../shared/video-search-field';

export function BasicInfoSection({
  isEdit,
  heroVideo,
}: {
  isEdit: boolean;
  heroVideo?: { id: string; name: string; thumbnail: string } | null;
}) {
  const { control, setValue } = useFormContext<ProductFormValues>();
  const { t } = useTranslation('adminPage');
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
                <FormLabel className="text-[13px] text-slate-500 font-medium">{t('tourNameLabel')}</FormLabel>
                <FormControl>
                  <Input size="sm" placeholder={t('tourNamePlaceholder')} {...field} />
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
                <FormLabel className="text-[13px] text-slate-500 font-medium">{t('urlPathLabel')}</FormLabel>
                <FormControl>
                  <Input
                    size="sm"
                    placeholder={t('urlPathPlaceholder')}
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

      {/* Row 3: price | video */}
      <div className="grid grid-cols-2 gap-5 pt-4 border-t border-slate-100">
        <FormField
          control={control}
          name="minPrice"
          render={({ field }) => (
            <FormItem className="space-y-1.5">
              <FormLabel className="text-[13px] text-slate-500 font-medium">{t('startingPriceLabel')}</FormLabel>
              <FormControl>
                <PriceInput value={field.value ?? 0} onChange={field.onChange} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <VideoSearchField
          initialVideo={heroVideo ? { id: heroVideo.id, title: heroVideo.name, thumbnail: heroVideo.thumbnail } : null}
        />
      </div>

      {/* Row 4: Short Description (100% full-width) */}
      <div className="pt-4 border-t border-slate-100">
        <FormField
          control={control}
          name="shortDescription"
          render={({ field }) => (
            <FormItem className="space-y-1.5">
              <FormLabel className="text-[13px] text-slate-500 font-medium">{t('shortDescLabel')}</FormLabel>
              <FormControl>
                <TextArea
                  placeholder={t('shortDescPlaceholder')}
                  className="min-h-[100px] resize-none bg-slate-50/20 border-slate-200 focus-visible:bg-white transition-colors rounded-xl shadow-theme-xs"
                  maxLength={500}
                  rows={3}
                  {...field}
                  value={field.value ?? ''}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
      </div>

      {/* Row 5: Highlights (100% full-width) */}
      <div className="pt-4 border-t border-slate-100">
        <FormField
          control={control}
          name="highlight"
          render={({ field }) => (
            <FormItem className="space-y-1.5">
              <FormLabel className="text-[13px] text-slate-500 font-medium">{t('highlightsLabel')}</FormLabel>
              <FormControl>
                <TextArea
                  placeholder={t('highlightsPlaceholder')}
                  className="min-h-[100px] resize-none bg-slate-50/20 border-slate-200 focus-visible:bg-white transition-colors rounded-xl shadow-theme-xs italic font-medium text-slate-700"
                  rows={3}
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
  );
}
