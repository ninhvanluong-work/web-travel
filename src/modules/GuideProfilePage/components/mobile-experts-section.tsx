import { AnimatePresence, motion } from 'framer-motion';
import { Check, ChevronDown, Plus, RefreshCw, Sparkles, X } from 'lucide-react';
import { useTranslation } from 'next-i18next';
import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { useFormContext, useWatch } from 'react-hook-form';

import { useTourGuideSkills } from '@/api/tour-guide/queries';
import type { ApiSkillCategory } from '@/api/tour-guide/types';
import { getSpecialtyColor } from '@/lib/specialty-colors';
import type { TourGuideFormValues } from '@/lib/validations/tour-guide';

function capitalize(s: string) {
  return s.replace(/\b\w/g, (c) => c.toUpperCase());
}

function groupExpertsByCategory(
  experts: string[],
  categories: ApiSkillCategory[]
): Array<{ categoryName: string; skills: string[] }> {
  const categoryMap = new Map<string, string[]>();
  const others: string[] = [];

  experts.forEach((expert) => {
    const matchingCat = categories.find((cat) => cat.skills.some((s) => s.name === expert));
    if (matchingCat) {
      const existing = categoryMap.get(matchingCat.name) ?? [];
      categoryMap.set(matchingCat.name, [...existing, expert]);
    } else {
      others.push(expert);
    }
  });

  const result: Array<{ categoryName: string; skills: string[] }> = Array.from(categoryMap.entries()).map(
    ([catName, skills]) => ({ categoryName: catName, skills })
  );
  if (others.length > 0) {
    result.push({ categoryName: '__other__', skills: others });
  }
  return result;
}

export function MobileExpertsSection() {
  const { control, setValue } = useFormContext<TourGuideFormValues>();
  const { t } = useTranslation(['adminPage', 'guidePage']);
  const rawExperts = useWatch({ control, name: 'experts' });
  const experts = useMemo(() => (rawExperts ?? []) as string[], [rawExperts]);

  const [query, setQuery] = useState('');
  const [manualOpen, setManualOpen] = useState<Set<string>>(new Set());
  const inputRef = useRef<HTMLInputElement>(null);

  const {
    data: categories = [],
    isLoading: skillsLoading,
    isError: skillsError,
    refetch: retrySkills,
  } = useTourGuideSkills();

  const allApiSkillNames = useMemo(() => new Set(categories.flatMap((c) => c.skills.map((s) => s.name))), [categories]);

  const allSkillNamesLower = useMemo(
    () => new Set(categories.flatMap((c) => c.skills.map((s) => s.name.toLowerCase()))),
    [categories]
  );

  const trimmedLower = query.trim().toLowerCase();

  const filteredCategories = useMemo(() => {
    if (!trimmedLower) return categories;
    return categories
      .map((cat) => ({
        ...cat,
        skills: cat.skills.filter((s) => s.name.toLowerCase().includes(trimmedLower)),
      }))
      .filter((cat) => cat.skills.length > 0);
  }, [categories, trimmedLower]);

  const toggleCategory = useCallback((code: string) => {
    setManualOpen((prev) => {
      const next = new Set(prev);
      if (next.has(code)) next.delete(code);
      else next.add(code);
      return next;
    });
  }, []);

  // Khi từ khóa tìm kiếm thay đổi, tự động mở rộng các category có kết quả khớp
  useEffect(() => {
    if (!trimmedLower) {
      setManualOpen(new Set()); // Reset về đóng hết khi xoá ô tìm kiếm
      return;
    }
    setManualOpen((prev) => {
      const next = new Set(prev);
      categories.forEach((cat) => {
        const hasMatch = cat.skills.some((s) => s.name.toLowerCase().includes(trimmedLower));
        if (hasMatch) {
          next.add(cat.code);
        }
      });
      return next;
    });
  }, [trimmedLower, categories]);

  const isCategoryOpen = useCallback(
    (code: string) => {
      return manualOpen.has(code);
    },
    [manualOpen]
  );

  const addExpert = useCallback(
    (label: string) => {
      const isApiSkill = allApiSkillNames.has(label);
      const trimmed = isApiSkill ? label.trim() : capitalize(label.trim());
      if (!trimmed || experts.includes(trimmed)) return;
      setValue('experts', [...experts, trimmed], { shouldValidate: true });
      setQuery('');
      inputRef.current?.focus();
    },
    [experts, setValue, allApiSkillNames]
  );

  const toggleExpertSelection = useCallback(
    (skillName: string) => {
      if (experts.includes(skillName)) {
        setValue(
          'experts',
          experts.filter((e) => e !== skillName),
          { shouldValidate: true }
        );
      } else {
        setValue('experts', [...experts, skillName], { shouldValidate: true });
      }
    },
    [experts, setValue]
  );

  const removeExpert = (label: string) => {
    setValue(
      'experts',
      experts.filter((e) => e !== label),
      { shouldValidate: true }
    );
  };

  const groupedExperts = useMemo(
    () => (categories.length > 0 ? groupExpertsByCategory(experts, categories) : null),
    [experts, categories]
  );

  const exactMatchExists =
    allSkillNamesLower.has(trimmedLower) || experts.some((e) => e.toLowerCase() === trimmedLower);
  const showCreate = trimmedLower.length > 0 && !exactMatchExists;

  const otherLabel = t('expertise.otherSpecialties', { ns: 'guidePage' });

  const renderChipsArea = () => {
    if (experts.length === 0) {
      return (
        <div className="py-3.5 px-4 rounded-xl border border-dashed border-slate-200 bg-slate-50/30 text-center">
          <p className="text-xs text-slate-400 italic">{t('noExpertsSelected')}</p>
        </div>
      );
    }
    if (groupedExperts) {
      return (
        <div className="space-y-3 p-3.5 rounded-2xl border border-slate-100 bg-slate-50/10">
          {groupedExperts.map(({ categoryName, skills }) => (
            <div key={categoryName} className="space-y-1.5">
              <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">
                {categoryName === '__other__' ? otherLabel : categoryName} ({skills.length})
              </p>
              <div className="flex flex-wrap gap-2">{chipList(skills)}</div>
            </div>
          ))}
        </div>
      );
    }
    return (
      <div className="flex flex-wrap gap-2 p-3.5 rounded-xl border border-slate-100 bg-slate-50/20">
        {chipList(experts)}
      </div>
    );
  };

  const chipList = (skills: string[]) => (
    <AnimatePresence initial={false}>
      {skills.map((label) => {
        const colors = getSpecialtyColor(label);
        return (
          <motion.span
            key={label}
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.8 }}
            transition={{ duration: 0.15 }}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-semibold shadow-theme-xs border transition-all"
            style={{
              backgroundColor: colors.bg,
              color: colors.text,
              borderColor: `${colors.text}18`,
            }}
          >
            {label}
            <button
              type="button"
              onClick={() => removeExpert(label)}
              className="opacity-60 hover:opacity-100 hover:bg-black/5 rounded-full p-0.5 transition-all"
            >
              <X size={11} />
            </button>
          </motion.span>
        );
      })}
    </AnimatePresence>
  );

  return (
    <div className="space-y-6">
      {/* Selected chips */}
      <div className="space-y-2.5">
        <label className="section-label-caps">{t('selectedExperts', { count: experts.length })}</label>
        {renderChipsArea()}
      </div>

      {/* Input */}
      <div className="space-y-2">
        <label className="section-label-caps">{t('enterNewExpert')}</label>
        <div className="relative w-full">
          <input
            ref={inputRef}
            placeholder={t('expertPlaceholder')}
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === 'Enter' || e.key === ',') {
                e.preventDefault();
                addExpert(query);
              }
            }}
            autoComplete="off"
            className="h-10 w-full pl-[14px] pr-10 rounded-xl border border-slate-200 shadow-theme-xs bg-slate-50/50 text-[13px] text-slate-800 placeholder-slate-400 outline-none focus:bg-white focus:border-brand-500 focus:ring-4 focus:ring-brand-500/10 transition-all duration-200"
          />
          {query.trim() && (
            <button
              type="button"
              onClick={() => addExpert(query)}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-brand-500 transition-colors"
              title={t('add', { ns: 'adminPage' })}
            >
              <Plus size={16} />
            </button>
          )}
        </div>
      </div>

      {/* Browse Standard Skills Inline List */}
      <div className="space-y-3">
        <div className="flex items-center justify-between border-b border-slate-100 pb-2">
          <p className="text-[11px] font-bold text-slate-400 uppercase tracking-widest">
            {trimmedLower
              ? t('expertise.searchResults', { ns: 'guidePage', query: query.trim() })
              : t('expertise.browseSkills', { ns: 'guidePage' })}
          </p>
        </div>

        {skillsLoading && (
          <div className="space-y-3">
            {[1, 2, 3].map((i) => (
              <div key={i} className="animate-pulse space-y-1.5">
                <div className="h-2.5 w-28 bg-slate-100 rounded" />
                <div className="h-8 w-full bg-slate-50 rounded-lg" />
              </div>
            ))}
          </div>
        )}

        {skillsError && !skillsLoading && (
          <div className="py-4 text-center space-y-2">
            <p className="text-[12px] text-slate-500">{t('expertise.loadFailed', { ns: 'guidePage' })}</p>
            <button
              type="button"
              onClick={() => retrySkills()}
              className="inline-flex items-center gap-1.5 text-[12px] font-semibold text-brand-600 hover:text-brand-700 transition-colors"
            >
              <RefreshCw size={12} />
              {t('expertise.retry', { ns: 'guidePage' })}
            </button>
          </div>
        )}

        {!skillsLoading && !skillsError && (
          <div className="space-y-2.5 max-h-[360px] overflow-y-auto pr-1">
            {filteredCategories.length === 0 && !showCreate && (
              <div className="py-8 text-center">
                <Sparkles size={20} className="mx-auto mb-2 text-slate-200" />
                <p className="text-[12px] text-slate-400">{t('expertise.noResults', { ns: 'guidePage' })}</p>
              </div>
            )}

            {filteredCategories.map((cat) => {
              const selectedCount = cat.skills.filter((s) => experts.includes(s.name)).length;
              const catOpen = isCategoryOpen(cat.code);

              return (
                <div
                  key={cat.code}
                  className="border border-slate-100 rounded-xl overflow-hidden bg-white shadow-theme-xs"
                >
                  <button
                    type="button"
                    onClick={() => toggleCategory(cat.code)}
                    className="w-full flex items-center justify-between px-4 py-3 bg-slate-50/50 hover:bg-slate-50 transition-colors"
                  >
                    <span className="text-[12px] font-bold text-slate-700">{cat.name}</span>
                    <div className="flex items-center gap-2">
                      {selectedCount > 0 && (
                        <span className="text-[10px] font-bold text-brand-600 bg-brand-50 px-2 py-0.5 rounded-full">
                          {selectedCount}
                        </span>
                      )}
                      <motion.div animate={{ rotate: catOpen ? 180 : 0 }} transition={{ duration: 0.2 }}>
                        <ChevronDown size={14} className="text-slate-400" />
                      </motion.div>
                    </div>
                  </button>

                  <AnimatePresence initial={false}>
                    {catOpen && (
                      <motion.div
                        initial={{ height: 0, opacity: 0 }}
                        animate={{ height: 'auto', opacity: 1 }}
                        exit={{ height: 0, opacity: 0 }}
                        transition={{ duration: 0.2, ease: 'easeInOut' }}
                        className="overflow-hidden"
                      >
                        <div className="py-1 bg-white divide-y divide-slate-50">
                          {cat.skills.map((skill) => {
                            const isSelected = experts.includes(skill.name);
                            return (
                              <button
                                key={skill.code}
                                type="button"
                                onClick={() => toggleExpertSelection(skill.name)}
                                className={`group w-full flex items-start gap-3 pl-6 pr-4 py-2.5 text-left transition-all duration-150 ${
                                  isSelected
                                    ? 'bg-brand-50/20 hover:bg-brand-50/40'
                                    : 'hover:bg-slate-50/80 active:bg-slate-100/50'
                                }`}
                              >
                                <div
                                  className={`w-5 h-5 rounded-md border flex items-center justify-center shrink-0 mt-0.5 transition-all duration-150 ${
                                    isSelected
                                      ? 'border-brand-500 bg-brand-500 text-white shadow-theme-xs'
                                      : 'border-slate-300 bg-white group-hover:border-brand-500'
                                  }`}
                                >
                                  {isSelected && <Check size={13} className="text-white" />}
                                </div>
                                <span
                                  className={`flex-1 text-[13px] font-medium transition-colors whitespace-normal break-words ${
                                    isSelected ? 'text-brand-600 font-semibold' : 'text-slate-700'
                                  }`}
                                >
                                  {skill.name}
                                </span>
                              </button>
                            );
                          })}
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
