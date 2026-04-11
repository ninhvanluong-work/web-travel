import { DollarSign, Plus } from 'lucide-react';
import { useState } from 'react';

import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { CURRENCY_OPTIONS, type OptionFormValues } from '@/lib/validations/product';

import { OptionsGridTable } from './options-grid-table';

interface Props {
  options: OptionFormValues[];
  onChange: (v: OptionFormValues[]) => void;
}

const DEFAULT_OPTION: OptionFormValues = {
  title: '',
  description: '',
  adultPrice: 0,
  childPrice: 0,
  infantPrice: 0,
  currency: 'VND',
  order: 0,
};

export function OptionsSection({ options, onChange }: Props) {
  const [lockCurrency, setLockCurrency] = useState('');

  const set = (index: number, patch: Partial<OptionFormValues>) => {
    onChange(options.map((o, i) => (i === index ? { ...o, ...patch } : o)));
  };

  const handleAdd = () => {
    onChange([...options, { ...DEFAULT_OPTION, currency: lockCurrency || 'VND', order: options.length }]);
  };

  const handleClone = (index: number) => {
    const clone = { ...options[index], id: undefined, order: options.length };
    onChange([...options, clone]);
  };

  const handleRemove = (index: number) => {
    onChange(options.filter((_, i) => i !== index).map((o, i) => ({ ...o, order: i })));
  };

  const handleCurrencyLock = (currency: string) => {
    setLockCurrency(currency);
    onChange(options.map((o) => ({ ...o, currency })));
  };

  if (options.length === 0) {
    return (
      <button
        type="button"
        onClick={handleAdd}
        className="w-full border-2 border-dashed border-gray-200 rounded-xl p-6 flex flex-col items-center gap-2 text-gray-400 hover:border-indigo-300 hover:text-indigo-500 hover:bg-indigo-50/40 transition-colors"
      >
        <DollarSign size={20} className="opacity-50" />
        <span className="text-sm font-medium">Chưa có gói giá</span>
        <span className="text-xs">Nhấn để thêm gói đầu tiên</span>
      </button>
    );
  }

  return (
    <div className="space-y-3">
      {/* Currency lock */}
      <div className="flex items-center gap-2 text-xs text-gray-500">
        <span>Áp dụng tiền tệ cho tất cả:</span>
        <Select value={lockCurrency} onValueChange={handleCurrencyLock}>
          <SelectTrigger inputSize="sm" className="w-24">
            <SelectValue placeholder="Chọn..." />
          </SelectTrigger>
          <SelectContent>
            {CURRENCY_OPTIONS.map((c) => (
              <SelectItem key={c.value} value={c.value}>
                {c.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      <OptionsGridTable
        options={options}
        lockCurrency={lockCurrency}
        onSet={set}
        onClone={handleClone}
        onRemove={handleRemove}
      />

      <Button
        type="button"
        variant="ghost"
        size="xs"
        rounded="md"
        blur={false}
        className="text-indigo-600 hover:text-indigo-700 hover:bg-indigo-50 border border-indigo-200 px-3 gap-1"
        onClick={handleAdd}
      >
        <Plus size={12} />
        Thêm gói giá
      </Button>
    </div>
  );
}
