import { Check, Plus, Sparkles } from 'lucide-react';
import { useTranslation } from 'next-i18next';

import { Popover, PopoverAnchor, PopoverContent } from '@/components/ui/popover';
import { getSpecialtyColor } from '@/lib/specialty-colors';

interface ExpertSearchDropdownProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  query: string;
  suggestions: string[]; // toàn bộ chuyên môn đã từng lưu
  selectedExperts: string[];
  onAdd: (label: string) => void;
  children: React.ReactNode;
}

export function ExpertSearchDropdown({
  open,
  onOpenChange,
  query,
  suggestions,
  selectedExperts,
  onAdd,
  children,
}: ExpertSearchDropdownProps) {
  const { t } = useTranslation('adminPage');
  const trimmed = query.trim();

  // Hiện tất cả, lọc theo query nếu có
  const filtered = trimmed ? suggestions.filter((s) => s.toLowerCase().includes(trimmed.toLowerCase())) : suggestions;

  // Kiểm tra exact match để biết có cần "Tạo mới" không
  const exactMatchInSuggestions = suggestions.some((s) => s.toLowerCase() === trimmed.toLowerCase());
  const showCreate = trimmed && !exactMatchInSuggestions;

  const isEmpty = filtered.length === 0 && !showCreate;

  return (
    <Popover open={open} onOpenChange={onOpenChange}>
      <PopoverAnchor asChild>{children}</PopoverAnchor>

      <PopoverContent
        align="start"
        sideOffset={6}
        onOpenAutoFocus={(e) => e.preventDefault()}
        className="w-[var(--radix-popover-trigger-width)] min-w-[300px] p-0 rounded-2xl shadow-xl shadow-slate-200/50 border border-slate-100 bg-white/95 backdrop-blur-md overflow-hidden"
      >
        {/* Header */}
        <div className="px-4 pt-3 pb-2 border-b border-slate-50 bg-slate-50/30">
          <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">
            {trimmed ? t('suggestionsFor', { query: trimmed }) : t('quickSelect')}
          </p>
        </div>

        {/* List */}
        <div className="overflow-y-auto overscroll-contain max-h-60 scrollbar-thin">
          {/* Chưa có chuyên môn nào trong kho */}
          {suggestions.length === 0 && (
            <div className="py-8 text-center px-4">
              <Sparkles size={20} className="mx-auto mb-2 text-slate-200" />
              <p className="text-[12px] text-slate-400">{t('noExpertsPrompt')}</p>
            </div>
          )}

          {/* Không khớp query */}
          {isEmpty && suggestions.length > 0 && (
            <div className="py-6 text-center">
              <p className="text-[13px] text-slate-400">{t('noSuggestionsFound')}</p>
            </div>
          )}

          {filtered.map((label) => {
            const colors = getSpecialtyColor(label);
            const isSelected = selectedExperts.includes(label);
            return (
              <button
                key={label}
                type="button"
                onMouseDown={(e) => {
                  e.preventDefault();
                  if (!isSelected) onAdd(label);
                }}
                className={`group w-full flex items-center gap-3 px-4 py-2.5 text-left transition-all duration-150 ${
                  isSelected ? 'cursor-default bg-slate-50/60' : 'hover:bg-brand-50/80 active:bg-brand-100/50'
                }`}
              >
                <span
                  className="w-2 h-2 rounded-full shrink-0 transition-opacity"
                  style={{ backgroundColor: colors.text, opacity: isSelected ? 0.4 : 1 }}
                />
                <span
                  className={`flex-1 text-[13px] font-medium transition-colors ${
                    isSelected ? 'text-slate-400' : 'text-slate-700 group-hover:text-brand-700'
                  }`}
                >
                  {label}
                </span>
                {isSelected && <Check size={13} className="text-brand-400 shrink-0" />}
              </button>
            );
          })}
        </div>

        {/* Tạo mới — ghim phía dưới */}
        {showCreate && (
          <div className="border-t border-slate-100 bg-slate-50/10">
            <button
              type="button"
              onMouseDown={(e) => {
                e.preventDefault();
                onAdd(trimmed);
              }}
              className="w-full flex items-center gap-3 px-4 py-3 hover:bg-brand-50 text-left transition-all duration-150"
            >
              <Plus size={14} aria-hidden="true" className="text-brand-500 shrink-0" />
              <span className="text-[13px] text-brand-600 font-semibold">
                {t('createNewExpert', { name: trimmed })}
              </span>
            </button>
          </div>
        )}
      </PopoverContent>
    </Popover>
  );
}
