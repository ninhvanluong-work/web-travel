import { useTranslation } from 'next-i18next';
import { useFormContext } from 'react-hook-form';

import { useDestinationList } from '@/api/product/lookup';
import { useSupplierListInfinite } from '@/api/supplier';
import { useTourGuideListInfinite } from '@/api/tour-guide';
import { FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import SelectWithSearch from '@/components/ui/select-with-search';
import type { ProductFormValues } from '@/lib/validations/product';

export function TourMetadataSelects() {
  const { control } = useFormContext<ProductFormValues>();
  const { t } = useTranslation('adminPage');

  const { data: destinations = [] } = useDestinationList();
  const {
    data: suppliersData,
    fetchNextPage: fetchNextSupplierPage,
    hasNextPage: hasNextSupplierPage,
    isFetchingNextPage: isFetchingNextSupplierPage,
  } = useSupplierListInfinite();
  const { data: tourGuidesData, fetchNextPage, hasNextPage, isFetchingNextPage } = useTourGuideListInfinite();

  const destinationOptions = destinations.map((item) => ({ label: item.name, value: item.id }));
  const supplierOptions = (suppliersData?.pages ?? [])
    .flatMap((p) => p.items)
    .map((item) => ({ label: item.name, value: item.id }));
  const tourGuideOptions = (tourGuidesData?.pages ?? [])
    .flatMap((p) => p.items)
    .map((item) => ({ label: item.name, value: item.id }));

  return (
    <div className="grid grid-cols-3 gap-5">
      <FormField
        control={control}
        name="destinationId"
        render={({ field }) => (
          <FormItem className="space-y-1.5">
            <FormLabel className="text-[13px] text-slate-500 font-medium">{t('destinationLabel')}</FormLabel>
            <FormControl>
              <SelectWithSearch
                placeholder={t('selectCategory')}
                value={field.value ?? ''}
                onValueChange={(v) => field.onChange(v || undefined)}
                data={destinationOptions}
                className="w-full bg-slate-50/50 border-slate-200 shadow-none hover:bg-slate-50 transition-colors"
              />
            </FormControl>
            <FormMessage />
          </FormItem>
        )}
      />

      <FormField
        control={control}
        name="supplierId"
        render={({ field }) => (
          <FormItem className="space-y-1.5">
            <FormLabel className="text-[13px] text-slate-500 font-medium">{t('supplierLabel')}</FormLabel>
            <FormControl>
              <SelectWithSearch
                placeholder={t('selectSupplier')}
                value={field.value ?? ''}
                onValueChange={(v) => field.onChange(v || undefined)}
                data={supplierOptions}
                onScrollToBottom={() => {
                  if (hasNextSupplierPage) fetchNextSupplierPage();
                }}
                isLoadingMore={isFetchingNextSupplierPage}
                className="w-full bg-slate-50/50 border-slate-200 shadow-none hover:bg-slate-50 transition-colors"
              />
            </FormControl>
            <FormMessage />
          </FormItem>
        )}
      />

      <FormField
        control={control}
        name="tourGuideIds"
        render={({ field }) => (
          <FormItem className="space-y-1.5">
            <FormLabel className="text-[13px] text-slate-500 font-medium">{t('tourGuideLabel')}</FormLabel>
            <FormControl>
              <SelectWithSearch
                placeholder={t('selectTourGuide')}
                value={field.value?.[0] ?? ''}
                onValueChange={(v) => field.onChange(v ? [v] : [])}
                data={[{ label: t('none'), value: '' }, ...tourGuideOptions]}
                onScrollToBottom={() => {
                  if (hasNextPage) fetchNextPage();
                }}
                isLoadingMore={isFetchingNextPage}
                className="w-full bg-slate-50/50 border-slate-200 shadow-none hover:bg-slate-50 transition-colors"
              />
            </FormControl>
            <FormMessage />
          </FormItem>
        )}
      />
    </div>
  );
}
