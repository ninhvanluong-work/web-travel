import { useTranslation } from 'next-i18next';
import { useFormContext, useWatch } from 'react-hook-form';

import { FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { TextArea } from '@/components/ui/textarea';
import { DESTINATION_DESCRIPTION_MAX, type DestinationFormValues } from '@/lib/validations/destination';

import { DESTINATION_NS } from '../../../constants';

function DescriptionCounter() {
  const { control } = useFormContext<DestinationFormValues>();
  const description = useWatch({ control, name: 'description' }) ?? '';
  const over = description.length > DESTINATION_DESCRIPTION_MAX;

  return (
    <span className={`text-xs tabular-nums shrink-0 ${over ? 'text-red-500 font-semibold' : 'text-gray-400'}`}>
      {description.length}/{DESTINATION_DESCRIPTION_MAX}
    </span>
  );
}

export function BasicInfoSection({ autoFocusName }: { autoFocusName: boolean }) {
  const { control } = useFormContext<DestinationFormValues>();
  const { t } = useTranslation(DESTINATION_NS);

  return (
    <div className="space-y-6">
      <FormField
        control={control}
        name="name"
        render={({ field }) => (
          <FormItem className="space-y-1.5">
            <FormLabel className="text-[13px] text-slate-500 font-medium">
              {t('nameLabel')} <span className="text-red-500">*</span>
            </FormLabel>
            <FormControl>
              <Input
                size="sm"
                placeholder={t('namePlaceholder')}
                autoComplete="off"
                autoFocus={autoFocusName}
                {...field}
              />
            </FormControl>
            <FormMessage />
          </FormItem>
        )}
      />

      <FormField
        control={control}
        name="description"
        render={({ field }) => (
          <FormItem className="space-y-1.5">
            <FormLabel className="text-[13px] text-slate-500 font-medium">{t('descriptionLabel')}</FormLabel>
            <FormControl>
              <TextArea
                rows={14}
                placeholder={t('descriptionPlaceholder')}
                className="min-h-[320px] resize-y leading-relaxed"
                {...field}
              />
            </FormControl>
            <div className="flex items-start justify-between gap-4">
              <p className="text-xs text-gray-400">{t('descriptionHint')}</p>
              <DescriptionCounter />
            </div>
            <FormMessage />
          </FormItem>
        )}
      />
    </div>
  );
}
