import { useTranslation } from 'next-i18next';
import { useFormContext } from 'react-hook-form';

import { FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { TextArea } from '@/components/ui/textarea';
import { type TourGuideFormValues } from '@/lib/validations/tour-guide';
import { ExperienceImageUpload } from '@/modules/AdminProduct/ProductFormPage/components/shared/experience-image-upload';
import { LanguageSelector } from '@/modules/AdminTourGuide/GuideFormPage/components/sections/language-selector';

export function EditProfilePersonalFields() {
  const { t } = useTranslation(['guidePage', 'adminPage']);
  const form = useFormContext<TourGuideFormValues>();

  return (
    <>
      {/* Avatar + Cover */}
      <div className="flex gap-4 items-center pt-1">
        <FormField
          control={form.control}
          name="avatar"
          render={({ field }) => (
            <FormItem className="space-y-1.5 shrink-0">
              <FormLabel className="admin-form-label">Avatar</FormLabel>
              <FormControl>
                <ExperienceImageUpload
                  value={field.value}
                  onChange={field.onChange}
                  aspectRatio="w-20 h-20"
                  shape="circle"
                  hideUrlInput={true}
                  changeLabel={t('editProfileSheet.changeAvatarLabel', { ns: 'guidePage' })}
                  uploadLabel="+"
                  uploadingLabel={t('editProfileSheet.uploadingLabel', { ns: 'guidePage' })}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name="coverImg"
          render={({ field }) => (
            <FormItem className="flex-1 space-y-1.5">
              <FormLabel className="admin-form-label">
                {t('editProfileSheet.coverImage', { ns: 'guidePage' })}
              </FormLabel>
              <FormControl>
                <ExperienceImageUpload
                  value={field.value}
                  onChange={field.onChange}
                  aspectRatio="w-full h-20"
                  hideUrlInput={true}
                  changeLabel={t('editProfileSheet.changeCoverLabel', { ns: 'guidePage' })}
                  uploadLabel={t('editProfileSheet.uploadCoverLabel', { ns: 'guidePage' })}
                  uploadingLabel={t('editProfileSheet.uploadingLabel', { ns: 'guidePage' })}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
      </div>

      {/* Name */}
      <FormField
        control={form.control}
        name="name"
        render={({ field }) => (
          <FormItem className="space-y-1.5">
            <FormLabel className="admin-form-label">
              {t('editProfileSheet.fieldName', { ns: 'guidePage' })} <span className="text-red-500">*</span>
            </FormLabel>
            <FormControl>
              <Input
                size="sm"
                fullWidth
                placeholder={t('guideNamePlaceholder', { ns: 'adminPage' })}
                className="bg-slate-50/30 border-slate-200/80 focus-visible:bg-white focus-visible:ring-4 focus-visible:ring-brand-500/10 focus-visible:border-brand-500 transition-all rounded-xl"
                {...field}
              />
            </FormControl>
            <FormMessage />
          </FormItem>
        )}
      />

      {/* Title */}
      <FormField
        control={form.control}
        name="summary"
        render={({ field }) => (
          <FormItem className="space-y-1.5">
            <FormLabel className="admin-form-label">{t('editProfileSheet.fieldTitle', { ns: 'guidePage' })}</FormLabel>
            <FormControl>
              <Input
                size="sm"
                fullWidth
                placeholder={t('guideSummaryPlaceholder', { ns: 'adminPage' })}
                className="bg-slate-50/30 border-slate-200/80 focus-visible:bg-white focus-visible:ring-4 focus-visible:ring-brand-500/10 focus-visible:border-brand-500 transition-all rounded-xl"
                {...field}
                value={field.value ?? ''}
              />
            </FormControl>
            <FormMessage />
          </FormItem>
        )}
      />

      {/* Slogan */}
      <FormField
        control={form.control}
        name="quote"
        render={({ field }) => (
          <FormItem className="space-y-1.5">
            <FormLabel className="admin-form-label">{t('editProfileSheet.fieldSlogan', { ns: 'guidePage' })}</FormLabel>
            <FormControl>
              <Input
                size="sm"
                fullWidth
                placeholder={t('editProfileSheet.fieldSloganPlaceholder', { ns: 'guidePage' })}
                className="bg-slate-50/30 border-slate-200/80 focus-visible:bg-white focus-visible:ring-4 focus-visible:ring-brand-500/10 focus-visible:border-brand-500 transition-all rounded-xl"
                {...field}
                value={field.value ?? ''}
              />
            </FormControl>
            <FormMessage />
          </FormItem>
        )}
      />

      {/* ExpYear */}
      <FormField
        control={form.control}
        name="expYear"
        render={({ field }) => (
          <FormItem className="space-y-1.5">
            <FormLabel className="admin-form-label">
              {t('editProfileSheet.fieldExpYear', { ns: 'guidePage' })}
            </FormLabel>
            <FormControl>
              <Input
                size="sm"
                fullWidth
                inputMode="numeric"
                placeholder="0"
                className="bg-slate-50/30 border-slate-200/80 focus-visible:bg-white focus-visible:ring-4 focus-visible:ring-brand-500/10 focus-visible:border-brand-500 transition-all rounded-xl"
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

      {/* Languages */}
      <LanguageSelector />

      {/* Bio */}
      <FormField
        control={form.control}
        name="description"
        render={({ field }) => (
          <FormItem className="space-y-1.5">
            <FormLabel className="admin-form-label">{t('editProfileSheet.fieldBio', { ns: 'guidePage' })}</FormLabel>
            <FormControl>
              <TextArea
                placeholder={t('editProfileSheet.fieldBioPlaceholder', { ns: 'guidePage' })}
                className="min-h-[90px] resize-none bg-slate-50/30 border-slate-200/80 focus-visible:bg-white focus-visible:ring-4 focus-visible:ring-brand-500/10 focus-visible:border-brand-500 transition-all rounded-2xl shadow-theme-xs text-[13px] p-3.5"
                rows={3}
                {...field}
                value={field.value ?? ''}
              />
            </FormControl>
            <FormMessage />
          </FormItem>
        )}
      />
    </>
  );
}
