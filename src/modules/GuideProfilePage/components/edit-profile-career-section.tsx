import { AnimatePresence, motion } from 'framer-motion';
import { Plus, Undo2 } from 'lucide-react';
import { useTranslation } from 'next-i18next';
import { useCallback, useEffect, useState } from 'react';
import { useFieldArray, useFormContext } from 'react-hook-form';

import { type TourGuideFormValues } from '@/lib/validations/tour-guide';

import { CareerEntry } from './edit-profile-career-entry';

interface UndoEntry {
  item: TourGuideFormValues['careerPath'][number];
  originalIndex: number;
  timeoutId: ReturnType<typeof setTimeout>;
}

export function MobileCareerSection() {
  const form = useFormContext<TourGuideFormValues>();
  const { t } = useTranslation(['adminPage', 'guidePage']);
  const { fields, append, remove, insert, replace } = useFieldArray({ control: form.control, name: 'careerPath' });
  const [expandedIndex, setExpandedIndex] = useState<number | null>(null);
  const [undoEntry, setUndoEntry] = useState<UndoEntry | null>(null);

  const { errors, submitCount } = form.formState;
  useEffect(() => {
    if (submitCount === 0 || !errors.careerPath) return;
    const careerErrors = errors.careerPath as (Record<string, unknown> | undefined)[];
    const firstErrorIndex = careerErrors.findIndex((e) => e !== undefined);
    if (firstErrorIndex >= 0) setExpandedIndex(firstErrorIndex);
  }, [submitCount, errors.careerPath]);

  const move = useCallback(
    (from: number, to: number) => {
      if (to < 0 || to >= fields.length) return;
      const reordered = [...fields];
      const [item] = reordered.splice(from, 1);
      reordered.splice(to, 0, item);
      replace(
        reordered.map(({ role, company, startYear, endYear, tourCount, description }) => ({
          role,
          company,
          startYear,
          endYear,
          tourCount,
          description,
        }))
      );
      setExpandedIndex(to);
    },
    [fields, replace]
  );

  const handleRemove = useCallback(
    (index: number) => {
      const snapshot = { ...form.getValues(`careerPath.${index}`) };
      if (undoEntry) clearTimeout(undoEntry.timeoutId);
      remove(index);
      if (expandedIndex === index) setExpandedIndex(null);
      else if (expandedIndex !== null && expandedIndex > index) setExpandedIndex(expandedIndex - 1);
      const timeoutId = setTimeout(() => setUndoEntry(null), 5000);
      setUndoEntry({ item: snapshot, originalIndex: index, timeoutId });
    },
    [form, remove, expandedIndex, undoEntry]
  );

  const handleUndo = useCallback(() => {
    if (!undoEntry) return;
    clearTimeout(undoEntry.timeoutId);
    insert(undoEntry.originalIndex, undoEntry.item);
    setExpandedIndex(undoEntry.originalIndex);
    setUndoEntry(null);
  }, [undoEntry, insert]);

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
            isFirst={index === 0}
            isLast={index === fields.length - 1}
            onToggle={() => setExpandedIndex(expandedIndex === index ? null : index)}
            onMoveUp={() => move(index, index - 1)}
            onMoveDown={() => move(index, index + 1)}
            onRemove={() => handleRemove(index)}
          />
        ))}
      </AnimatePresence>

      <AnimatePresence>
        {undoEntry && (
          <motion.div
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 8 }}
            transition={{ duration: 0.18 }}
            className="flex items-center justify-between gap-3 px-4 py-3 rounded-xl bg-neutral-black/90 text-white shadow-lg"
          >
            <span className="text-[12px] font-medium">
              {t('editProfileSheet.careerDeletedToast', { ns: 'guidePage' })}
            </span>
            <button
              type="button"
              onClick={handleUndo}
              className="flex items-center gap-1 text-[12px] font-medium text-brand-300 hover:text-brand-200 transition-colors shrink-0"
            >
              <Undo2 size={13} />
              {t('editProfileSheet.undo', { ns: 'guidePage' })}
            </button>
          </motion.div>
        )}
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
    </div>
  );
}
