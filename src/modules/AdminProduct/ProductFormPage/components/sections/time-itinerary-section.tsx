import { Calendar, Plus } from 'lucide-react';
import { useRef, useState } from 'react';
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
  const [openIndex, setOpenIndex] = useState<number | null>(null);
  const dragIndex = useRef<number | null>(null);

  const handleAdd = () => {
    const newIndex = itineraries.length;
    onChange([...itineraries, { name: '', featuredName: '', order: newIndex + 1, description: '' }]);
    setOpenIndex(newIndex);
  };

  const handleChange = (index: number, patch: Partial<ItineraryFormValues>) => {
    onChange(itineraries.map((it, i) => (i === index ? { ...it, ...patch } : it)));
  };

  const handleRemove = (index: number) => {
    const next = itineraries.filter((_, i) => i !== index).map((it, i) => ({ ...it, order: i + 1 }));
    onChange(next);
    setOpenIndex((prev) => {
      if (prev === null) return null;
      if (prev === index) return null;
      return prev > index ? prev - 1 : prev;
    });
  };

  const handleClone = (index: number) => {
    const clone = { ...itineraries[index], id: undefined };
    const next = [...itineraries.slice(0, index + 1), clone, ...itineraries.slice(index + 1)].map((it, i) => ({
      ...it,
      order: i + 1,
    }));
    onChange(next);
    setOpenIndex(index + 1);
  };

  const handleToggle = (index: number) => {
    setOpenIndex((prev) => (prev === index ? null : index));
  };

  // HTML5 drag-to-reorder
  const handleDragStart = (index: number) => {
    dragIndex.current = index;
  };

  const handleDragOver = (e: React.DragEvent, index: number) => {
    e.preventDefault();
    const from = dragIndex.current;
    if (from === null || from === index) return;
    const reordered = [...itineraries];
    const [removed] = reordered.splice(from, 1);
    reordered.splice(index, 0, removed);
    onChange(reordered.map((it, i) => ({ ...it, order: i + 1 })));
    dragIndex.current = index;
    setOpenIndex(index);
  };

  return (
    <div className="space-y-5">
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
          name="durationType"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Đơn vị</FormLabel>
              <FormControl>
                <Select value={field.value ?? ''} onValueChange={field.onChange}>
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
          <p className="text-sm font-medium text-gray-700">
            Chi tiết lịch trình
            {itineraries.length > 0 && (
              <span className="ml-2 text-xs font-normal text-gray-400">{itineraries.length} ngày</span>
            )}
          </p>
          <Button
            type="button"
            variant="ghost"
            size="xs"
            rounded="md"
            className="text-violet-600 hover:text-violet-700 hover:bg-violet-50 border border-violet-200 px-3 gap-1"
            blur={false}
            onClick={handleAdd}
          >
            <Plus size={12} />
            Thêm ngày
          </Button>
        </div>

        {itineraries.length === 0 ? (
          <button
            type="button"
            onClick={handleAdd}
            className="w-full border-2 border-dashed border-gray-200 rounded-xl p-6 flex flex-col items-center gap-2 text-gray-400 hover:border-violet-300 hover:text-violet-500 hover:bg-violet-50/40 transition-colors"
          >
            <Calendar size={20} className="opacity-50" />
            <span className="text-sm font-medium">Chưa có lịch trình</span>
            <span className="text-xs">Nhấn để thêm ngày đầu tiên</span>
          </button>
        ) : (
          <div className="space-y-2">
            {itineraries.map((it, i) => (
              <div
                key={it.id ?? i}
                draggable
                onDragStart={() => handleDragStart(i)}
                onDragOver={(e) => handleDragOver(e, i)}
              >
                <ItineraryFormRow
                  value={it}
                  index={i}
                  isOpen={openIndex === i}
                  dragHandleProps={{ onMouseDown: (e) => e.stopPropagation() }}
                  onChange={handleChange}
                  onRemove={handleRemove}
                  onClone={handleClone}
                  onToggle={handleToggle}
                />
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
