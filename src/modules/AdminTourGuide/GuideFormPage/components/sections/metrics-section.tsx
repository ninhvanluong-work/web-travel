import { useFormContext, useWatch } from 'react-hook-form';

import { FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { cn } from '@/lib/utils';
import type { TourGuideFormValues } from '@/lib/validations/tour-guide';

const LANGUAGE_OPTIONS = ['VI', 'EN', 'FR', 'JP', 'KO', 'DE', 'ES', 'IT', 'ZH'];

export function MetricsSection() {
  const { control, setValue } = useFormContext<TourGuideFormValues>();
  const languages = useWatch({ control, name: 'languages' }) ?? [];

  const toggleLanguage = (lang: string) => {
    if (languages.includes(lang)) {
      setValue(
        'languages',
        languages.filter((l) => l !== lang),
        { shouldValidate: true }
      );
    } else {
      setValue('languages', [...languages, lang], { shouldValidate: true });
    }
  };

  return (
    <div className="space-y-6">
      {/* expYear */}
      <FormField
        control={control}
        name="expYear"
        render={({ field }) => (
          <FormItem className="space-y-1.5">
            <FormLabel className="text-[13px] text-slate-500 font-medium">Số năm kinh nghiệm</FormLabel>
            <FormControl>
              <Input
                size="sm"
                inputMode="numeric"
                placeholder="0"
                className="w-32"
                value={field.value === 0 ? '' : String(field.value)}
                onChange={(e) => {
                  const raw = e.target.value.replace(/[^0-9]/g, '');
                  field.onChange(raw === '' ? 0 : Number(raw));
                }}
                onBlur={field.onBlur}
                name={field.name}
                ref={field.ref}
              />
            </FormControl>
            <FormMessage />
          </FormItem>
        )}
      />

      {/* languages */}
      <div className="space-y-2">
        <p className="text-[13px] text-slate-500 font-medium">
          Ngôn ngữ <span className="text-red-500">*</span>
        </p>
        <div className="flex flex-wrap gap-2">
          {LANGUAGE_OPTIONS.map((lang) => (
            <button
              key={lang}
              type="button"
              onClick={() => toggleLanguage(lang)}
              className={cn(
                'px-3 py-1.5 rounded-full text-xs font-semibold border transition-all',
                languages.includes(lang)
                  ? 'bg-brand-500 text-white border-brand-500'
                  : 'bg-white text-gray-600 border-gray-200 hover:border-brand-300'
              )}
            >
              {lang}
            </button>
          ))}
        </div>
        {/* show validation error via hidden field */}
        <FormField control={control} name="languages" render={() => <FormMessage />} />
      </div>
    </div>
  );
}
