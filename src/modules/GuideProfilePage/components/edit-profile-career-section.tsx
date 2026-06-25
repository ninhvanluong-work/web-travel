import { AnimatePresence } from 'framer-motion';
import { Plus } from 'lucide-react';
import { useTranslation } from 'next-i18next';
import { useCallback, useEffect, useState } from 'react';
import { useFieldArray, useFormContext } from 'react-hook-form';

import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import { type TourGuideFormValues } from '@/lib/validations/tour-guide';

import { CareerEntry } from './edit-profile-career-entry';

export function MobileCareerSection() {
  const form = useFormContext<TourGuideFormValues>();
  const { t } = useTranslation(['adminPage', 'guidePage']);
  const { fields, append, remove, replace } = useFieldArray({ control: form.control, name: 'careerPath' });
  const [expandedIndex, setExpandedIndex] = useState<number | null>(null);
  const [itemToDelete, setItemToDelete] = useState<number | null>(null);

  const { errors, submitCount } = form.formState;
  useEffect(() => {
    if (submitCount === 0 || !errors.careerPath) return;
    const careerErrors = errors.careerPath as (Record<string, unknown> | undefined)[];
    const firstErrorIndex = careerErrors.findIndex((e) => e !== undefined);
    if (firstErrorIndex >= 0) setExpandedIndex(firstErrorIndex);
  }, [submitCount, errors.careerPath]);

  const confirmRemove = useCallback(() => {
    if (itemToDelete === null) return;
    const index = itemToDelete;

    remove(index);

    // Delay the forced cleanup until AFTER React completes unmounting
    // This prevents react-hook-form from resurrecting the unmounted input values
    setTimeout(() => {
      const currentVals = form.getValues('careerPath') || [];
      const cleaned = currentVals.filter((_, i) => i !== index);
      form.setValue('careerPath', cleaned, { shouldValidate: true, shouldDirty: true });
      form.clearErrors(`careerPath.${index}`);
      form.clearErrors('careerPath');
    }, 50);

    if (expandedIndex === index) setExpandedIndex(null);
    else if (expandedIndex !== null && expandedIndex > index) setExpandedIndex(expandedIndex - 1);

    setItemToDelete(null);
  }, [itemToDelete, remove, form, expandedIndex]);

  return (
    <div className="space-y-3">
      {fields.length === 0 && (
        <div className="py-6 text-center border border-dashed border-slate-200 rounded-xl bg-slate-50/20">
          <p className="text-xs text-slate-400 italic">{t('noCareerEntries')}</p>
        </div>
      )}

      <AnimatePresence initial={false}>
        {fields.map((field, index) => (
          <CareerEntry
            key={field.id}
            index={index}
            isExpanded={expandedIndex === index}
            onToggle={() => setExpandedIndex(expandedIndex === index ? null : index)}
            onRemove={() => setItemToDelete(index)}
          />
        ))}
      </AnimatePresence>

      <button
        type="button"
        onClick={() =>
          append({
            role: '',
            company: '',
            startYear: new Date().getFullYear(),
            endYear: null,
            tourCount: 0,
            description: '',
          })
        }
        className="w-full h-9 border border-dashed border-slate-300 rounded-xl text-xs font-semibold text-slate-500 hover:border-brand-500 hover:text-brand-600 transition-all flex items-center justify-center gap-1"
      >
        <Plus size={13} />
        {t('addCareerEntry')}
      </button>

      <AlertDialog open={itemToDelete !== null} onOpenChange={(open) => !open && setItemToDelete(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete this position?</AlertDialogTitle>
            <AlertDialogDescription>
              This action cannot be undone. Are you sure you want to remove this career position from your profile?
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter className="flex gap-3 sm:gap-3">
            <AlertDialogCancel className="flex-1 m-0">{t('cancel', { ns: 'adminPage' })}</AlertDialogCancel>
            <AlertDialogAction
              onClick={confirmRemove}
              className="flex-1 bg-rose-600 hover:bg-rose-700 text-white focus-visible:ring-rose-600"
            >
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
