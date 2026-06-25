import { useTranslation } from 'next-i18next';
import { useFormContext } from 'react-hook-form';

import { FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { type ProductFormValues, STATUS_OPTIONS } from '@/lib/validations/product';

export function ConfigCard() {
  const { control } = useFormContext<ProductFormValues>();
  const { t } = useTranslation('adminPage');

  const getStatusLabelKey = (status: string) => {
    return `status${status.charAt(0).toUpperCase()}${status.slice(1)}`;
  };

  return (
    <div className="bg-white rounded-lg border border-gray-200 p-4 space-y-4">
      <h3 className="font-semibold text-gray-900">{t('configCardTitle')}</h3>

      {/* Status */}
      <FormField
        control={control}
        name="status"
        render={({ field }) => (
          <FormItem>
            <FormLabel>{t('configCardStatus')}</FormLabel>
            <FormControl>
              <Select value={field.value} onValueChange={field.onChange}>
                <SelectTrigger inputSize="sm" className="w-full">
                  <SelectValue placeholder={t('configCardStatusPlaceholder')} />
                </SelectTrigger>
                <SelectContent>
                  {STATUS_OPTIONS.map((opt) => (
                    <SelectItem key={opt.value} value={opt.value}>
                      {t(getStatusLabelKey(opt.value))}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </FormControl>
            <FormMessage />
          </FormItem>
        )}
      />
    </div>
  );
}
