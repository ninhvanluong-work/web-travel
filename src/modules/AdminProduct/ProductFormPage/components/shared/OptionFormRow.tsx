import { Trash2 } from 'lucide-react';

import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { TextArea } from '@/components/ui/textarea';
import { CURRENCY_OPTIONS, type OptionFormValues } from '@/lib/validations/product';

interface OptionFormRowProps {
  value: OptionFormValues;
  index: number;
  onChange: (index: number, patch: Partial<OptionFormValues>) => void;
  onRemove: (index: number) => void;
}

export function OptionFormRow({ value, index, onChange, onRemove }: OptionFormRowProps) {
  const set = (patch: Partial<OptionFormValues>) => onChange(index, patch);

  return (
    <div className="border border-gray-200 rounded-lg p-4 space-y-3 bg-gray-50">
      <div className="flex items-center justify-between">
        <span className="text-sm font-semibold text-gray-700">Gói {index + 1}</span>
        <Button
          variant="ghost"
          size="icon"
          rounded="md"
          className="text-red-500 hover:bg-red-50"
          onClick={() => onRemove(index)}
        >
          <Trash2 size={15} />
        </Button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
        <div className="space-y-1">
          <label className="text-xs font-medium text-gray-600">Tên gói *</label>
          <Input
            size="sm"
            placeholder="VD: Gói tiêu chuẩn"
            value={value.title}
            onChange={(e) => set({ title: e.target.value })}
          />
        </div>
        <div className="flex gap-2 items-end">
          <div className="flex-1 space-y-1">
            <label className="text-xs font-medium text-gray-600">Thứ tự</label>
            <Input
              type="number"
              size="sm"
              min={0}
              value={value.order}
              onChange={(e) => set({ order: Number(e.target.value) })}
            />
          </div>
          <div className="w-24 space-y-1">
            <label className="text-xs font-medium text-gray-600">Tiền tệ</label>
            <Select value={value.currency} onValueChange={(v) => set({ currency: v })}>
              <SelectTrigger inputSize="sm">
                <SelectValue />
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
        </div>
      </div>

      <div className="grid grid-cols-3 gap-3">
        <div className="space-y-1">
          <label className="text-xs font-medium text-gray-600">Giá người lớn</label>
          <Input
            type="number"
            size="sm"
            min={0}
            value={value.adultPrice}
            onChange={(e) => set({ adultPrice: Number(e.target.value) })}
          />
        </div>
        <div className="space-y-1">
          <label className="text-xs font-medium text-gray-600">Giá trẻ em</label>
          <Input
            type="number"
            size="sm"
            min={0}
            value={value.childPrice}
            onChange={(e) => set({ childPrice: Number(e.target.value) })}
          />
        </div>
        <div className="space-y-1">
          <label className="text-xs font-medium text-gray-600">Giá em bé</label>
          <Input
            type="number"
            size="sm"
            min={0}
            value={value.infantPrice}
            onChange={(e) => set({ infantPrice: Number(e.target.value) })}
          />
        </div>
      </div>

      <div className="space-y-1">
        <label className="text-xs font-medium text-gray-600">Mô tả</label>
        <TextArea
          rows={2}
          placeholder="Mô tả gói..."
          fullWidth
          value={value.description ?? ''}
          onChange={(e) => set({ description: e.target.value })}
        />
      </div>
    </div>
  );
}
