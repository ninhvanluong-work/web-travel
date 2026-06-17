import { useTranslation } from 'next-i18next';
import { useFormContext, useWatch } from 'react-hook-form';

import { FormField, FormMessage } from '@/components/ui/form';
import { cn } from '@/lib/utils';
import type { TourGuideFormValues } from '@/lib/validations/tour-guide';

const LANGUAGE_OPTIONS = [
  { code: 'VI', label: 'Tiếng Việt', flag: '🇻🇳' },
  { code: 'EN', label: 'English', flag: '🇬🇧' },
  { code: 'FR', label: 'Français', flag: '🇫🇷' },
  { code: 'JP', label: '日本語', flag: '🇯🇵' },
  { code: 'KO', label: '한국어', flag: '🇰🇷' },
  { code: 'DE', label: 'Deutsch', flag: '🇩🇪' },
  { code: 'ES', label: 'Español', flag: '🇪🇸' },
  { code: 'IT', label: 'Italiano', flag: '🇮🇹' },
  { code: 'ZH', label: '中文', flag: '🇨🇳' },
];

export function LanguageSelector() {
  const { control, setValue } = useFormContext<TourGuideFormValues>();
  const { t } = useTranslation('adminPage');
  const languages = (useWatch({ control, name: 'languages' }) ?? []) as string[];

  const toggle = (code: string) => {
    const next = languages.includes(code) ? languages.filter((l) => l !== code) : [...languages, code];
    setValue('languages', next, { shouldValidate: true });
  };

  return (
    <div className="col-span-2 space-y-2">
      <p className="admin-form-label">
        {t('languagesLabel')} <span className="text-red-500">*</span>
      </p>
      <div className="flex flex-wrap gap-2">
        {LANGUAGE_OPTIONS.map((lang) => (
          <button
            key={lang.code}
            type="button"
            title={lang.label}
            onClick={() => toggle(lang.code)}
            className={cn(
              'flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-semibold border transition-all',
              languages.includes(lang.code)
                ? 'bg-brand-500 text-white border-brand-500 shadow-sm'
                : 'bg-white text-gray-600 border-gray-200 hover:border-brand-300 hover:bg-brand-50/30'
            )}
          >
            <span>{lang.flag}</span>
            <span>{lang.code}</span>
          </button>
        ))}
      </div>
      <FormField control={control} name="languages" render={() => <FormMessage />} />
    </div>
  );
}
