import { Plus } from 'lucide-react';
import { useFormContext } from 'react-hook-form';

import { Button } from '@/components/ui/button';
import { FormControl, FormField, FormItem, FormLabel } from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { DURATION_TYPES, type ItineraryFormValues, type ProductFormValues } from '@/lib/validations/product';

import { ItineraryFormRow } from '../shared/ItineraryFormRow';

interface TimeItinerarySectionProps {
  itineraries: ItineraryFormValues[];
  onChange: (v: ItineraryFormValues[]) => void;
}

export function TimeItinerarySection({ itineraries, onChange }: TimeItinerarySectionProps) {
  const { control } = useFormContext<ProductFormValues>();

  const handleAdd = () => {
    onChange([...itineraries, { name: '', featured_name: '', order: itineraries.length + 1, description: '' }]);
  };

  const handleChange = (index: number, patch: Partial<ItineraryFormValues>) => {
    onChange(itineraries.map((it, i) => (i === index ? { ...it, ...patch } : it)));
  };

  const handleRemove = (index: number) => {
    onChange(itineraries.filter((_, i) => i !== index).map((it, i) => ({ ...it, order: i + 1 })));
  };

  return (
    <div className="bg-white rounded-xl border border-gray-200 p-6 space-y-4">
      <h2 className="font-semibold text-gray-900">📅 Thời gian &amp; Lịch trình</h2>

      <div className="grid grid-cols-2 gap-4">
        <FormField
          control={control}
          name="duration"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Số ngày</FormLabel>
              <FormControl>
                <Input type="number" size="sm" min={1} placeholder="VD: 3" {...field} />
              </FormControl>
            </FormItem>
          )}
        />
        <FormField
          control={control}
          name="duration_type"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Đơn vị</FormLabel>
              <FormControl>
                <Select value={field.value} onValueChange={field.onChange}>
                  <SelectTrigger inputSize="sm" className="w-full">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {DURATION_TYPES.map((t) => (
                      <SelectItem key={t.value} value={t.value}>
                        {t.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </FormControl>
            </FormItem>
          )}
        />
      </div>

      <div>
        <div className="flex items-center justify-between mb-3">
          <p className="text-sm font-medium text-gray-700">Chi tiết lịch trình theo ngày</p>
          <Button
            type="button"
            variant="ghost"
            size="xs"
            rounded="md"
            className="text-blue-600 hover:text-blue-700 hover:bg-blue-50 border border-blue-200 px-3"
            blur={false}
            onClick={handleAdd}
          >
            <Plus size={13} className="mr-1" />+ Thêm ngày
          </Button>
        </div>

        {itineraries.length === 0 ? (
          <p className="text-sm text-gray-400 text-center py-6 border border-dashed border-gray-200 rounded-lg">
            Chưa có lịch trình. Nhấn &quot;+ Thêm ngày&quot; để tạo.
          </p>
        ) : (
          <div className="space-y-3">
            {itineraries.map((it, i) => (
              <ItineraryFormRow key={i} value={it} index={i} onChange={handleChange} onRemove={handleRemove} />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
