import { Plus, Trash2 } from 'lucide-react';
import { useFieldArray, useFormContext } from 'react-hook-form';

import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { ELEMENT_KEY_OPTIONS, type ProductFormValues } from '@/lib/validations/product';

import { ValueInput } from './quick-facts-input';

export function QuickFactsSection() {
  const { control } = useFormContext<ProductFormValues>();
  const { fields, append, remove, update } = useFieldArray({ control, name: 'elements' });

  const usedKeys = fields.map((f) => f.key);

  return (
    <div className="space-y-4">
      {fields.length === 0 && (
        <div className="flex flex-col items-center justify-center p-8 border-2 border-dashed border-slate-200 rounded-xl bg-slate-50/50">
          <p className="text-[14px] font-medium text-slate-600">No quick facts configured</p>
          <p className="text-[13px] text-slate-400 mt-1">Click the button below to add quick facts for this tour</p>
        </div>
      )}

      <div className="space-y-3">
        {fields.map((item, index) => (
          <div key={item.id} className="flex items-center gap-4">
            <Select value={item.key} onValueChange={(v) => update(index, { key: v, name: '' })}>
              <SelectTrigger
                inputSize="sm"
                className="w-[240px] shrink-0 bg-slate-50/50 border-slate-200 hover:bg-white transition-colors"
              >
                <SelectValue placeholder="Select fact type..." />
              </SelectTrigger>
              <SelectContent>
                {ELEMENT_KEY_OPTIONS.map((opt) => (
                  <SelectItem
                    key={opt.value}
                    value={opt.value}
                    disabled={usedKeys.includes(opt.value) && opt.value !== item.key}
                  >
                    {opt.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>

            <div className="w-[360px] shrink-0 flex">
              <ValueInput factKey={item.key} value={item.name} onChange={(v) => update(index, { ...item, name: v })} />
            </div>

            <button
              type="button"
              onClick={() => remove(index)}
              className="shrink-0 p-2 text-slate-400 hover:text-red-500 hover:bg-red-50 rounded-lg transition-all"
            >
              <Trash2 size={15} />
            </button>
          </div>
        ))}
      </div>

      <Button
        type="button"
        variant="secondary"
        size="md"
        onClick={() => append({ key: '', name: '' })}
        disabled={fields.length >= ELEMENT_KEY_OPTIONS.length}
        className="gap-2 h-9 px-4 bg-white border border-slate-200 text-slate-700 hover:bg-slate-50 shadow-theme-xs transition-colors rounded-lg font-medium text-[13px]"
      >
        <Plus size={14} className="text-brand-500" />
        Add fact
      </Button>
    </div>
  );
}
