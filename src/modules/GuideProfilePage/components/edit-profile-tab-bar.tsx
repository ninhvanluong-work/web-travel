import { useTranslation } from 'next-i18next';
import { useEffect } from 'react';
import type { UseFormReturn } from 'react-hook-form';

import CustomTabs from '@/components/Tabs';
import type { TourGuideFormValues } from '@/lib/validations/tour-guide';

interface EditProfileTabBarProps {
  activeTab: string;
  onTabChange: (tab: string) => void;
  form: UseFormReturn<TourGuideFormValues>;
}

export function EditProfileTabBar({ activeTab, onTabChange, form }: EditProfileTabBarProps) {
  const { t } = useTranslation('guidePage');
  const { errors, submitCount, isValid } = form.formState;

  const hasProfileErrors = !!(
    errors.name ||
    errors.avatar ||
    errors.coverImg ||
    errors.summary ||
    errors.quote ||
    errors.expYear ||
    errors.languages ||
    errors.description
  );
  const hasExpertiseErrors = !!errors.experts;
  const hasCareerErrors = !!errors.careerPath;

  useEffect(() => {
    if (submitCount === 0 || isValid) return;
    if (
      errors.name ||
      errors.avatar ||
      errors.coverImg ||
      errors.summary ||
      errors.quote ||
      errors.expYear ||
      errors.languages ||
      errors.description
    ) {
      onTabChange('profile');
    } else if (errors.experts) {
      onTabChange('expertise');
    } else if (errors.careerPath) {
      onTabChange('career');
    }
  }, [submitCount, isValid, errors, onTabChange]);

  return (
    <div className="px-6 bg-[#F8FAFC] shrink-0">
      <CustomTabs
        value={activeTab}
        onChange={onTabChange}
        className="[&>div]:border-none"
        data={[
          {
            value: 'profile',
            name: (
              <span className="relative flex items-center justify-center gap-1.5 py-1">
                {t('editProfileSheet.tabProfile')}
                {hasProfileErrors && <span className="w-1.5 h-1.5 rounded-full bg-rose-500 animate-pulse" />}
              </span>
            ),
          },
          {
            value: 'expertise',
            name: (
              <span className="relative flex items-center justify-center gap-1.5 py-1">
                {t('editProfileSheet.tabExpertise')}
                {hasExpertiseErrors && <span className="w-1.5 h-1.5 rounded-full bg-rose-500 animate-pulse" />}
              </span>
            ),
          },
          {
            value: 'career',
            name: (
              <span className="relative flex items-center justify-center gap-1.5 py-1">
                {t('editProfileSheet.tabCareer')}
                {hasCareerErrors && <span className="w-1.5 h-1.5 rounded-full bg-rose-500 animate-pulse" />}
              </span>
            ),
          },
        ]}
      />
    </div>
  );
}
