import { useFormContext } from 'react-hook-form';

import { FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { TextArea } from '@/components/ui/textarea';
import type { TourGuideFormValues } from '@/lib/validations/tour-guide';

export function BioSection() {
  const { control } = useFormContext<TourGuideFormValues>();

  return (
    <FormField
      control={control}
      name="description"
      render={({ field }) => (
        <FormItem className="space-y-1.5">
          <FormLabel className="text-[13px] text-slate-500 font-medium">Bio / Description</FormLabel>
          <FormControl>
            <TextArea
              placeholder="Giới thiệu về hướng dẫn viên..."
              className="min-h-[160px] resize-none bg-slate-50/20 border-slate-200 focus-visible:bg-white transition-colors rounded-xl shadow-theme-xs"
              rows={6}
              {...field}
              value={field.value ?? ''}
            />
          </FormControl>
          <FormMessage />
        </FormItem>
      )}
    />
  );
}
