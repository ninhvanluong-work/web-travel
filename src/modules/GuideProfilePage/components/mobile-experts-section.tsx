import { AnimatePresence, motion } from 'framer-motion';
import { Plus, X } from 'lucide-react';
import { useTranslation } from 'next-i18next';
import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { useFormContext, useWatch } from 'react-hook-form';

import { getSpecialtyColor } from '@/lib/specialty-colors';
import type { TourGuideFormValues } from '@/lib/validations/tour-guide';
import { ExpertSearchDropdown } from '@/modules/AdminTourGuide/GuideFormPage/components/sections/expert-search-dropdown';

const STORAGE_KEY = 'guide_expert_suggestions';

function loadSuggestions(): string[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    return raw ? (JSON.parse(raw) as string[]) : [];
  } catch {
    return [];
  }
}

function saveSuggestions(list: string[]) {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(list));
  } catch {
    // ignore
  }
}

function capitalize(s: string) {
  return s.replace(/\b\w/g, (c) => c.toUpperCase());
}

export function MobileExpertsSection() {
  const { control, setValue } = useFormContext<TourGuideFormValues>();
  const { t } = useTranslation('adminPage');
  const rawExperts = useWatch({ control, name: 'experts' });
  const experts = useMemo(() => (rawExperts ?? []) as string[], [rawExperts]);

  const [query, setQuery] = useState('');
  const [showDropdown, setShowDropdown] = useState(false);
  const [suggestions, setSuggestions] = useState<string[]>([]);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    setSuggestions(loadSuggestions());
  }, []);

  const addExpert = useCallback(
    (label: string, shouldFocus = true) => {
      const trimmed = capitalize(label.trim());
      if (!trimmed || experts.includes(trimmed)) return;

      setValue('experts', [...experts, trimmed], { shouldValidate: true });
      setSuggestions((prev) => {
        if (prev.includes(trimmed)) return prev;
        const updated = [...prev, trimmed];
        saveSuggestions(updated);
        return updated;
      });

      setQuery('');
      setShowDropdown(false);
      if (shouldFocus) inputRef.current?.focus();
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

  return (
    <div className="space-y-5">
      {/* Selected chips */}
      <div className="space-y-2">
        <label className="section-label-caps">{t('selectedExperts', { count: experts.length })}</label>
        {experts.length === 0 ? (
          <div className="py-3 px-4 rounded-xl border border-dashed border-slate-200 bg-slate-50/30 text-center">
            <p className="text-xs text-slate-400 italic">{t('noExpertsSelected')}</p>
          </div>
        ) : (
          <div className="flex flex-wrap gap-2 p-1.5 rounded-xl border border-slate-100 bg-slate-50/20">
            <AnimatePresence initial={false}>
              {experts.map((label) => {
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
          </div>
        )}
      </div>

      {/* Input + outline Add button */}
      <div className="space-y-2">
        <label className="section-label-caps">{t('enterNewExpert')}</label>
        <div className="flex gap-2 items-center w-full">
          <div className="flex-1">
            <ExpertSearchDropdown
              open={showDropdown}
              onOpenChange={setShowDropdown}
              query={query}
              suggestions={suggestions}
              selectedExperts={experts}
              onAdd={addExpert}
            >
              <input
                ref={inputRef}
                placeholder={t('expertPlaceholder')}
                value={query}
                onChange={(e) => {
                  setQuery(e.target.value);
                  setShowDropdown(true);
                }}
                onKeyDown={(e) => {
                  if (e.key === 'Enter' || e.key === ',') {
                    e.preventDefault();
                    addExpert(query);
                  }
                  if (e.key === 'Escape') setShowDropdown(false);
                }}
                onFocus={() => setShowDropdown(true)}
                autoComplete="off"
                className="h-10 w-full px-[14px] rounded-xl border border-slate-200 shadow-theme-xs bg-slate-50/50 text-[13px] text-slate-800 placeholder-slate-400 outline-none focus:bg-white focus:border-brand-500 focus:ring-4 focus:ring-brand-500/10 transition-all duration-200"
              />
            </ExpertSearchDropdown>
          </div>
          <button
            type="button"
            onClick={() => addExpert(query)}
            className="h-10 px-4 rounded-xl border border-slate-300 text-slate-600 text-xs font-semibold hover:border-brand-400 hover:text-brand-600 hover:bg-brand-50 transition-all active:scale-[0.97] flex items-center gap-1 shrink-0"
          >
            <Plus size={13} />
            {t('add')}
          </button>
        </div>
        <p className="text-[11px] text-slate-400">{t('expertInputHint', 'Press Enter or comma to add')}</p>
      </div>
    </div>
  );
}
