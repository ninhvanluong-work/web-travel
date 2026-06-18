import { AnimatePresence, motion } from 'framer-motion';
import { ChevronDown, ChevronUp, Trash2 } from 'lucide-react';
import { useTranslation } from 'next-i18next';
import { useFormContext } from 'react-hook-form';

import { Checkbox } from '@/components/ui/checkbox';
import { FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { cn } from '@/lib/utils';
import { type TourGuideFormValues } from '@/lib/validations/tour-guide';

interface CareerEntryProps {
  index: number;
  isExpanded: boolean;
  isFirst: boolean;
  isLast: boolean;
  onToggle: () => void;
  onMoveUp: () => void;
  onMoveDown: () => void;
  onRemove: () => void;
}

export function CareerEntry({
  index,
  isExpanded,
  isFirst,
  isLast,
  onToggle,
  onMoveUp,
  onMoveDown,
  onRemove,
}: CareerEntryProps) {
  const form = useFormContext<TourGuideFormValues>();
  const { t } = useTranslation(['adminPage', 'guidePage']);

  const isCurrent = form.watch(`careerPath.${index}.isCurrent`);
  const role = form.watch(`careerPath.${index}.role`);
  const company = form.watch(`careerPath.${index}.company`);
  const startYear = form.watch(`careerPath.${index}.startYear`);
  const endYear = form.watch(`careerPath.${index}.endYear`);

  const presentLabel = t('editProfileSheet.present', { ns: 'guidePage' });
  let periodLabel = String(startYear);
  if (isCurrent) periodLabel = `${startYear} – ${presentLabel}`;
  else if (endYear) periodLabel = `${startYear} – ${endYear}`;

  return (
    <motion.div
      layout
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, scale: 0.95 }}
      transition={{ duration: 0.2 }}
      className={cn('overflow-hidden transition-all', index > 0 && 'border-t border-slate-100/80 pt-3 mt-2')}
    >
      {/* Collapsed header */}
      <button
        type="button"
        onClick={onToggle}
        className="w-full flex items-center justify-between py-2 text-left hover:bg-slate-50/20 transition-colors rounded-lg px-1"
      >
        <div className="flex-1 min-w-0">
          <span className="text-[10px] font-medium text-slate-400 uppercase block" style={{ letterSpacing: '0.5px' }}>
            {t('careerPosition', { index: index + 1 })}
          </span>
          {(role || company) && (
            <span className="text-[12px] font-semibold text-slate-700 truncate block mt-0.5">
              {[role, company].filter(Boolean).join(' · ')}
              {periodLabel && <span className="text-slate-400 font-normal"> · {periodLabel}</span>}
            </span>
          )}
        </div>
        <div className="flex items-center gap-1 ml-2 shrink-0">
          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation();
              onMoveUp();
            }}
            disabled={isFirst}
            className="p-1 rounded text-slate-400 hover:text-slate-700 disabled:opacity-30"
          >
            <ChevronUp size={14} />
          </button>
          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation();
              onMoveDown();
            }}
            disabled={isLast}
            className="p-1 rounded text-slate-400 hover:text-slate-700 disabled:opacity-30"
          >
            <ChevronDown size={14} />
          </button>
          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation();
              onRemove();
            }}
            className="p-1 rounded text-slate-400 hover:text-rose-600"
          >
            <Trash2 size={13} />
          </button>
        </div>
      </button>

      {/* Expanded fields */}
      <AnimatePresence initial={false}>
        {isExpanded && (
          <motion.div
            key="fields"
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.22, ease: 'easeInOut' }}
            className="overflow-hidden"
          >
            <div className="px-1 pb-3 pt-2 grid grid-cols-6 gap-2.5 border-t border-slate-100/80">
              <FormField
                control={form.control}
                name={`careerPath.${index}.role`}
                render={({ field: f }) => (
                  <FormItem className="col-span-3 space-y-1">
                    <FormLabel className="admin-form-label">{t('roleLabel')}</FormLabel>
                    <FormControl>
                      <Input size="sm" fullWidth placeholder={t('rolePlaceholder')} {...f} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name={`careerPath.${index}.company`}
                render={({ field: f }) => (
                  <FormItem className="col-span-3 space-y-1">
                    <FormLabel className="admin-form-label">{t('companyLabel')}</FormLabel>
                    <FormControl>
                      <Input size="sm" fullWidth placeholder={t('companyPlaceholder')} {...f} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name={`careerPath.${index}.startYear`}
                render={({ field: f }) => (
                  <FormItem className="col-span-2 space-y-1">
                    <FormLabel
                      className="admin-form-label"
                      style={{ minHeight: '42px', display: 'flex', alignItems: 'flex-end', paddingBottom: '2px' }}
                    >
                      {t('startYearLabel')}
                    </FormLabel>
                    <FormControl>
                      <Input size="sm" fullWidth type="number" placeholder={String(new Date().getFullYear())} {...f} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name={`careerPath.${index}.endYear`}
                render={({ field: f }) => (
                  <FormItem className="col-span-2 space-y-1">
                    <FormLabel
                      className="admin-form-label"
                      style={{ minHeight: '42px', display: 'flex', alignItems: 'flex-end', paddingBottom: '2px' }}
                    >
                      {t('editProfileSheet.endYearLabel', { ns: 'guidePage' })}
                    </FormLabel>
                    <FormControl>
                      <Input
                        size="sm"
                        fullWidth
                        type={isCurrent ? 'text' : 'number'}
                        disabled={isCurrent}
                        placeholder={isCurrent ? presentLabel : String(new Date().getFullYear())}
                        value={isCurrent ? '' : f.value ?? ''}
                        onChange={(e) => {
                          if (isCurrent) return;
                          const val = e.target.value.replace(/[^0-9]/g, '');
                          f.onChange(val === '' ? null : Number(val));
                        }}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name={`careerPath.${index}.tourCount`}
                render={({ field: f }) => (
                  <FormItem className="col-span-2 space-y-1">
                    <FormLabel
                      className="admin-form-label"
                      style={{ minHeight: '42px', display: 'flex', alignItems: 'flex-end', paddingBottom: '2px' }}
                    >
                      {t('tourCountLabel')}
                    </FormLabel>
                    <FormControl>
                      <Input size="sm" fullWidth type="number" placeholder="0" {...f} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name={`careerPath.${index}.isCurrent`}
                render={({ field: f }) => (
                  <FormItem className="col-span-6 flex flex-row items-center gap-2 space-y-0 h-6 mt-1 pt-0.5">
                    <FormControl>
                      <Checkbox
                        checked={f.value ?? false}
                        onCheckedChange={(checked) => {
                          f.onChange(checked);
                          if (checked) form.setValue(`careerPath.${index}.endYear`, null);
                        }}
                        className="h-4 w-4 rounded border-slate-300 text-brand-500 focus:ring-brand-500"
                      />
                    </FormControl>
                    <FormLabel className="text-xs font-semibold text-slate-500 select-none cursor-pointer">
                      {t('editProfileSheet.currentJob', { ns: 'guidePage' })}
                    </FormLabel>
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name={`careerPath.${index}.description`}
                render={({ field: f }) => (
                  <FormItem className="col-span-6 space-y-1">
                    <FormLabel className="admin-form-label">{t('shortDescLabel')}</FormLabel>
                    <FormControl>
                      <Input size="sm" fullWidth placeholder={t('shortDescPlaceholder')} {...f} value={f.value ?? ''} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
}
