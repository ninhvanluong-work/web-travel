import { motion } from 'framer-motion';
import { Check, Minus, Plus } from 'lucide-react';
import { useTranslation } from 'next-i18next';
import { useFormContext, useWatch } from 'react-hook-form';

import { FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { TextArea } from '@/components/ui/textarea';
import { type TourGuideFormValues } from '@/lib/validations/tour-guide';
import { ExperienceImageUpload } from '@/modules/AdminProduct/ProductFormPage/components/shared/experience-image-upload';
import { LanguageSelector } from '@/modules/AdminTourGuide/GuideFormPage/components/sections/language-selector';

const inputClass =
  'bg-slate-50/30 border-slate-200/80 focus-visible:bg-white focus-visible:ring-4 focus-visible:ring-brand-500/10 focus-visible:border-brand-500 transition-all rounded-xl';

const staggerContainer = {
  hidden: {},
  visible: { transition: { staggerChildren: 0.05 } },
};

const staggerItem = {
  hidden: { opacity: 0, y: 10 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.25, ease: 'easeOut' } },
};

function FieldCheckIcon({ value }: { value: string | null | undefined }) {
  if (!value || value.trim() === '') return null;
  return (
    <motion.span
      initial={{ opacity: 0, scale: 0.6 }}
      animate={{ opacity: 1, scale: 1 }}
      exit={{ opacity: 0, scale: 0.6 }}
      transition={{ duration: 0.15 }}
      className="absolute right-3 top-1/2 -translate-y-1/2 text-emerald-400 pointer-events-none"
    >
      <Check size={14} strokeWidth={2.5} />
    </motion.span>
  );
}

function YearStepper({
  value,
  onChange,
  min = 0,
  max = 50,
}: {
  value: number;
  onChange: (v: number) => void;
  min?: number;
  max?: number;
}) {
  return (
    <div className="flex items-center h-10 rounded-xl border border-slate-200/80 bg-slate-50/30 overflow-hidden">
      <button
        type="button"
        onClick={() => onChange(Math.max(min, value - 1))}
        disabled={value <= min}
        className="w-10 h-full flex items-center justify-center text-slate-500 hover:bg-slate-100 disabled:opacity-30 transition-colors shrink-0 border-r border-slate-200/80"
      >
        <Minus size={13} />
      </button>
      <div className="flex-1 flex items-center justify-center overflow-hidden">
        <motion.span
          key={value}
          initial={{ opacity: 0, y: -6 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.15 }}
          className="text-[13px] font-semibold text-slate-800 tabular-nums"
        >
          {value}
        </motion.span>
      </div>
      <button
        type="button"
        onClick={() => onChange(Math.min(max, value + 1))}
        disabled={value >= max}
        className="w-10 h-full flex items-center justify-center text-slate-500 hover:bg-slate-100 disabled:opacity-30 transition-colors shrink-0 border-l border-slate-200/80"
      >
        <Plus size={13} />
      </button>
    </div>
  );
}

export function EditProfilePersonalFields() {
  const { t } = useTranslation(['guidePage', 'adminPage']);
  const form = useFormContext<TourGuideFormValues>();

  const nameVal = useWatch({ control: form.control, name: 'name' });
  const summaryVal = useWatch({ control: form.control, name: 'summary' });
  const quoteVal = useWatch({ control: form.control, name: 'quote' });
  const expYear = useWatch({ control: form.control, name: 'expYear' }) ?? 0;

  const handleBioResize = (e: React.FormEvent<HTMLTextAreaElement>) => {
    const el = e.currentTarget;
    el.style.height = 'auto';
    el.style.height = `${el.scrollHeight}px`;
  };

  return (
    <motion.div className="space-y-4" variants={staggerContainer} initial="hidden" animate="visible">
      {/* Avatar + Cover */}
      <motion.div variants={staggerItem} className="flex gap-4 items-center pt-1">
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
      </motion.div>

      {/* Name */}
      <motion.div variants={staggerItem}>
        <FormField
          control={form.control}
          name="name"
          render={({ field }) => (
            <FormItem className="space-y-1.5">
              <FormLabel className="admin-form-label">
                {t('editProfileSheet.fieldName', { ns: 'guidePage' })} <span className="text-red-500">*</span>
              </FormLabel>
              <div className="relative">
                <FormControl>
                  <Input
                    size="sm"
                    fullWidth
                    placeholder={t('guideNamePlaceholder', { ns: 'adminPage' })}
                    className={`${inputClass} pr-8`}
                    {...field}
                  />
                </FormControl>
                <FieldCheckIcon value={nameVal} />
              </div>
              <FormMessage />
            </FormItem>
          )}
        />
      </motion.div>

      {/* Title */}
      <motion.div variants={staggerItem}>
        <FormField
          control={form.control}
          name="summary"
          render={({ field }) => (
            <FormItem className="space-y-1.5">
              <FormLabel className="admin-form-label">
                {t('editProfileSheet.fieldTitle', { ns: 'guidePage' })}
              </FormLabel>
              <div className="relative">
                <FormControl>
                  <Input
                    size="sm"
                    fullWidth
                    placeholder={t('guideSummaryPlaceholder', { ns: 'adminPage' })}
                    className={`${inputClass} pr-8`}
                    {...field}
                    value={field.value ?? ''}
                  />
                </FormControl>
                <FieldCheckIcon value={summaryVal} />
              </div>
              <FormMessage />
            </FormItem>
          )}
        />
      </motion.div>

      {/* Slogan */}
      <motion.div variants={staggerItem}>
        <FormField
          control={form.control}
          name="quote"
          render={({ field }) => (
            <FormItem className="space-y-1.5">
              <FormLabel className="admin-form-label">
                {t('editProfileSheet.fieldSlogan', { ns: 'guidePage' })}
              </FormLabel>
              <div className="relative">
                <FormControl>
                  <Input
                    size="sm"
                    fullWidth
                    placeholder={t('editProfileSheet.fieldSloganPlaceholder', { ns: 'guidePage' })}
                    className={`${inputClass} pr-8`}
                    {...field}
                    value={field.value ?? ''}
                  />
                </FormControl>
                <FieldCheckIcon value={quoteVal} />
              </div>
              <FormMessage />
            </FormItem>
          )}
        />
      </motion.div>

      {/* ExpYear — Stepper */}
      <motion.div variants={staggerItem}>
        <FormField
          control={form.control}
          name="expYear"
          render={({ field }) => (
            <FormItem className="space-y-1.5">
              <FormLabel className="admin-form-label">
                {t('editProfileSheet.fieldExpYear', { ns: 'guidePage' })}
              </FormLabel>
              <YearStepper
                value={expYear}
                onChange={(v) => {
                  field.onChange(v);
                  field.onBlur();
                }}
              />
              <FormMessage />
            </FormItem>
          )}
        />
      </motion.div>

      {/* Languages */}
      <motion.div variants={staggerItem}>
        <LanguageSelector />
      </motion.div>

      {/* Bio — auto-resize */}
      <motion.div variants={staggerItem}>
        <FormField
          control={form.control}
          name="description"
          render={({ field }) => (
            <FormItem className="space-y-1.5">
              <FormLabel className="admin-form-label">{t('editProfileSheet.fieldBio', { ns: 'guidePage' })}</FormLabel>
              <FormControl>
                <TextArea
                  placeholder={t('editProfileSheet.fieldBioPlaceholder', { ns: 'guidePage' })}
                  className="min-h-[90px] resize-none bg-slate-50/30 border-slate-200/80 focus-visible:bg-white focus-visible:ring-4 focus-visible:ring-brand-500/10 focus-visible:border-brand-500 transition-all rounded-2xl shadow-theme-xs text-[13px] p-3.5 overflow-hidden"
                  rows={3}
                  {...field}
                  value={field.value ?? ''}
                  onInput={handleBioResize}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
      </motion.div>
    </motion.div>
  );
}
