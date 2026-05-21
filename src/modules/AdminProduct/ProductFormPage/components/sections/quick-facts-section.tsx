import { Plus, Trash2 } from 'lucide-react';
import { useFieldArray, useFormContext } from 'react-hook-form';

import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { ELEMENT_KEY_OPTIONS, type ProductFormValues } from '@/lib/validations/product';

const NUMBER_KEYS = new Set(['groupSize', 'day', 'night']);
const TIME_KEYS = new Set(['pickup', 'dropOff']);

function ValueInput({ factKey, value, onChange }: { factKey: string; value: string; onChange: (v: string) => void }) {
  if (!factKey) {
    return (
      <Input
        size="sm"
        placeholder="Chọn loại trước..."
        disabled
        value=""
        className="flex-1 bg-slate-50 text-slate-400"
      />
    );
  }

  if (TIME_KEYS.has(factKey)) {
    return (
      <input
        type="time"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="flex-1 h-10 rounded-lg border border-input bg-white px-3 py-2 text-[13px] text-slate-700 focus:outline-none focus:ring-2 focus:ring-brand-500/20 focus:border-brand-400 transition-all"
      />
    );
  }

  if (NUMBER_KEYS.has(factKey)) {
    return (
      <Input
        size="sm"
        placeholder="Nhập số..."
        value={value}
        onChange={(e) => onChange(e.target.value.replace(/\D/g, ''))}
        inputMode="numeric"
        className="flex-1"
      />
    );
  }

  return (
    <Input
      size="sm"
      placeholder="Nhập giá trị..."
      value={value}
      onChange={(e) => onChange(e.target.value)}
      className="flex-1"
    />
  );
}

export function QuickFactsSection() {
  const { control } = useFormContext<ProductFormValues>();
  const { fields, append, remove, update } = useFieldArray({ control, name: 'elements' });

  const usedKeys = fields.map((f) => f.key);

  return (
    <div className="space-y-4">
      {fields.length === 0 && (
        <div className="flex flex-col items-center justify-center p-8 border-2 border-dashed border-slate-200 rounded-xl bg-slate-50/50">
          <p className="text-[14px] font-medium text-slate-600">Chưa có thông tin nhanh</p>
          <p className="text-[13px] text-slate-400 mt-1">Nhấn nút bên dưới để thêm thông tin nhanh</p>
        </div>
      )}

      <div className="space-y-3">
        {fields.map((item, index) => (
          <div key={item.id} className="flex items-center gap-3">
            <Select value={item.key} onValueChange={(v) => update(index, { key: v, name: '' })}>
              <SelectTrigger
                inputSize="sm"
                className="w-[200px] shrink-0 bg-slate-50/50 border-slate-200 hover:bg-white transition-colors"
              >
                <SelectValue placeholder="Chọn loại..." />
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

            <ValueInput factKey={item.key} value={item.name} onChange={(v) => update(index, { ...item, name: v })} />

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
        Thêm thông tin
      </Button>
    </div>
  );
}
