import { AnimatePresence, motion } from 'framer-motion';
import { Plus, X } from 'lucide-react';
import { useTranslation } from 'next-i18next';
import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { useFormContext, useWatch } from 'react-hook-form';

import { Button } from '@/components/ui/button';
import { getSpecialtyColor } from '@/lib/specialty-colors';
import type { TourGuideFormValues } from '@/lib/validations/tour-guide';

import { ExpertSearchDropdown } from './expert-search-dropdown';

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

export function ExpertsSection() {
  const { control, setValue } = useFormContext<TourGuideFormValues>();
  const { t } = useTranslation('adminPage');
  const rawExperts = useWatch({ control, name: 'experts' });
  const experts = useMemo(() => (rawExperts ?? []) as string[], [rawExperts]);

  const [query, setQuery] = useState('');
  const [showDropdown, setShowDropdown] = useState(false);
  const [suggestions, setSuggestions] = useState<string[]>([]);
  const inputRef = useRef<HTMLInputElement>(null);

  // Tải gợi ý từ localStorage khi mount
  useEffect(() => {
    setSuggestions(loadSuggestions());
  }, []);

  const addExpert = useCallback(
    (label: string, shouldFocus = true) => {
      const trimmed = label.trim();
      if (!trimmed || experts.includes(trimmed)) return;

      setValue('experts', [...experts, trimmed], { shouldValidate: true });

      // Lưu vào localStorage nếu chưa có
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
    <div className="space-y-6">
      {/* Zone 1: Chips đã chọn */}
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
                    className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-semibold shadow-theme-xs border transition-all hover:scale-[1.02]"
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

      {/* Zone 2: Input + nút Thêm (giữ nguyên bố cục gốc, thêm dropdown gợi ý) */}
      <div className="space-y-2">
        <label className="section-label-caps">{t('enterNewExpert')}</label>
        <div className="flex gap-3 items-center w-full">
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
                  if (e.key === 'Enter') {
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
          <Button
            type="button"
            onClick={() => addExpert(query)}
            variant="primary"
            size="xs"
            rounded="md"
            blur={false}
            className="h-10 px-5 rounded-xl bg-brand-500 hover:bg-brand-600 border-0 flex items-center gap-1 shrink-0 shadow-theme-xs font-semibold text-xs"
          >
            <Plus size={14} />
            {t('add')}
          </Button>
        </div>
      </div>
    </div>
  );
}
