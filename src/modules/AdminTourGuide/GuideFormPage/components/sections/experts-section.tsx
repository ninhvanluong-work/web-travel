import { X } from 'lucide-react';
import { useRef } from 'react';
import { useFormContext, useWatch } from 'react-hook-form';

import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import type { TourGuideFormValues } from '@/lib/validations/tour-guide';

const SUGGESTIONS = [
  'Trekking expert',
  'Food storyteller',
  'Family-friendly',
  'Photography support',
  'Premium private guide',
  'Cultural tours',
  'Water sports',
  'City walking tour',
];

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

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      addExpert((e.target as HTMLInputElement).value);
    }
  };

  return (
    <div className="space-y-4">
      {/* Current tags */}
      {experts.length > 0 && (
        <div className="flex flex-wrap gap-2">
          {experts.map((label) => (
            <span
              key={label}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-medium bg-brand-50 text-brand-700 ring-1 ring-brand-200"
            >
              {label}
              <button
                type="button"
                onClick={() => removeExpert(label)}
                className="hover:text-brand-900 transition-colors"
              >
                <X size={12} />
              </button>
            </span>
          ))}
        </div>
      )}

      {/* Input row */}
      <div className="flex gap-2">
        <Input ref={inputRef} size="sm" placeholder="Thêm chuyên môn..." onKeyDown={handleKeyDown} className="flex-1" />
        <Button
          type="button"
          variant="ghost"
          size="xs"
          rounded="md"
          blur={false}
          onClick={() => addExpert(inputRef.current?.value ?? '')}
          className="h-9 px-4 shrink-0 border border-gray-200"
        >
          Add
        </Button>
      </div>

      {/* Suggestions */}
      <div className="space-y-1.5">
        <p className="text-[11px] text-slate-400 font-medium">Gợi ý:</p>
        <div className="flex flex-wrap gap-1.5">
          {SUGGESTIONS.filter((s) => !experts.includes(s)).map((s) => (
            <button
              key={s}
              type="button"
              onClick={() => addExpert(s)}
              className="px-2.5 py-1 rounded-full text-[11px] text-gray-500 border border-dashed border-gray-300 hover:border-brand-400 hover:text-brand-600 transition-colors"
            >
              + {s}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}
