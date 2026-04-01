import { Plus } from 'lucide-react';

import { Button } from '@/components/ui/button';
import type { OptionFormValues } from '@/lib/validations/product';

import { OptionFormRow } from '../shared/OptionFormRow';

interface OptionsTabProps {
  options: OptionFormValues[];
  onChange: (options: OptionFormValues[]) => void;
}

const DEFAULT_OPTION: OptionFormValues = {
  title: '',
  description: '',
  adult_price: 0,
  child_price: 0,
  infant_price: 0,
  currency: 'VND',
  order: 0,
};

export function OptionsTab({ options, onChange }: OptionsTabProps) {
  const handleChange = (index: number, patch: Partial<OptionFormValues>) => {
    onChange(options.map((o, i) => (i === index ? { ...o, ...patch } : o)));
  };

  const handleRemove = (index: number) => {
    onChange(options.filter((_, i) => i !== index));
  };

  const handleAdd = () => {
    onChange([...options, { ...DEFAULT_OPTION, order: options.length }]);
  };

  return (
    <div className="space-y-4">
      <div className="bg-white rounded-lg border border-gray-200 p-5 space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="font-bold text-gray-900">Gói giá (Options)</h2>
          <Button
            type="button"
            variant="primary"
            size="xs"
            rounded="md"
            className="flex items-center gap-1 px-3"
            blur={false}
            onClick={handleAdd}
          >
            <Plus size={14} />
            Thêm gói
          </Button>
        </div>

        {options.length === 0 ? (
          <p className="text-sm text-gray-400 text-center py-6">
            Chưa có gói giá nào. Nhấn &quot;Thêm gói&quot; để tạo.
          </p>
        ) : (
          <div className="space-y-3">
            {options.map((opt, i) => (
              <OptionFormRow key={i} value={opt} index={i} onChange={handleChange} onRemove={handleRemove} />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
