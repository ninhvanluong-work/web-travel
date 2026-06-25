import { useTranslation } from 'next-i18next';
import { useFormContext } from 'react-hook-form';

import { FormControl, FormField, FormItem, FormLabel } from '@/components/ui/form';
import { TextArea } from '@/components/ui/textarea';
import { type ProductFormValues, READ_BEFORE_KEY_OPTIONS } from '@/lib/validations/product';

export function ReadBeforeSection() {
  const { control } = useFormContext<ProductFormValues>();
  const { t } = useTranslation('adminPage');

  return (
    <div className="grid grid-cols-2 gap-5">
      {READ_BEFORE_KEY_OPTIONS.map((opt, index) => (
        <FormField
          key={opt.value}
          control={control}
          name={`readBefores.${index}.description`}
          render={({ field }) => (
            <FormItem className="space-y-1.5">
              <FormLabel className="text-[13px] text-slate-600 font-semibold">
                {t(`read_before_key_${opt.value}`)}
              </FormLabel>
              <FormControl>
                <TextArea
                  placeholder={t('enterContentFor', { name: t(`read_before_key_${opt.value}`) })}
                  rows={3}
                  className="resize-none bg-slate-50/50 border-slate-200 focus-visible:bg-white transition-colors text-[13px]"
                  {...field}
                  value={field.value ?? ''}
                />
              </FormControl>
            </FormItem>
          )}
        />
      ))}
    </div>
  );
}
