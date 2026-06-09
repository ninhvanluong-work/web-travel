import { Plus, X } from 'lucide-react';
import { useRef } from 'react';
import { useFormContext, useWatch } from 'react-hook-form';

import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { getSpecialtyColor } from '@/lib/specialty-colors';
import type { TourGuideFormValues } from '@/lib/validations/tour-guide';

export function ExpertsSection() {
  const { control, setValue } = useFormContext<TourGuideFormValues>();
  const experts = (useWatch({ control, name: 'experts' }) ?? []) as string[];
  const inputRef = useRef<HTMLInputElement>(null);

  const addExpert = (label: string) => {
    const trimmed = label.trim();
    if (!trimmed || experts.includes(trimmed)) return;
    setValue('experts', [...experts, trimmed], { shouldValidate: true });
    if (inputRef.current) inputRef.current.value = '';
  };

  const removeExpert = (label: string) => {
    setValue(
      'experts',
      experts.filter((e) => e !== label),
      { shouldValidate: true }
    );
  };

  return (
    <div className="space-y-6">
      {/* Zone 1: Selected tags */}
      <div className="space-y-2">
        <label className="section-label-caps">Chuyên môn đã chọn ({experts.length})</label>
        {experts.length === 0 ? (
          <div className="py-3 px-4 rounded-xl border border-dashed border-slate-200 bg-slate-50/30 text-center">
            <p className="text-xs text-slate-400 italic">
              Chưa chọn chuyên môn nào. Chọn từ gợi ý bên dưới hoặc nhập mới.
            </p>
          </div>
        ) : (
          <div className="flex flex-wrap gap-2 p-1.5 rounded-xl border border-slate-100 bg-slate-50/20">
            {experts.map((label) => {
              const colors = getSpecialtyColor(label);
              return (
                <span
                  key={label}
                  className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-semibold shadow-theme-xs border transition-all hover:scale-[1.02]"
                  style={{ backgroundColor: colors.bg, color: colors.text, borderColor: `${colors.text}18` }}
                >
                  {label}
                  <button
                    type="button"
                    onClick={() => removeExpert(label)}
                    className="opacity-60 hover:opacity-100 hover:bg-black/5 rounded-full p-0.5 transition-all"
                  >
                    <X size={11} />
                  </button>
                </span>
              );
            })}
          </div>
        )}
      </div>

      {/* Zone 2: Input */}
      <div className="space-y-2">
        <label className="section-label-caps">Tự nhập chuyên môn mới</label>
        <div className="flex gap-3 items-center w-full">
          <div className="flex-1">
            <Input
              ref={inputRef}
              fullWidth
              placeholder="Ví dụ: Cắm trại qua đêm, Dẫn tour xe máy..."
              className="h-10 px-[14px] rounded-xl border-slate-200 shadow-theme-xs focus-visible:ring-brand-500/10"
              onKeyDown={(e) => {
                if (e.key === 'Enter') {
                  e.preventDefault();
                  addExpert(e.currentTarget.value);
                }
              }}
            />
          </div>
          <Button
            type="button"
            onClick={() => addExpert(inputRef.current?.value ?? '')}
            variant="primary"
            size="xs"
            rounded="md"
            blur={false}
            className="h-10 px-5 rounded-xl bg-brand-500 hover:bg-brand-600 border-0 flex items-center gap-1 shrink-0 shadow-theme-xs font-semibold text-xs"
          >
            <Plus size={14} />
            Thêm
          </Button>
        </div>
      </div>
    </div>
  );
}
