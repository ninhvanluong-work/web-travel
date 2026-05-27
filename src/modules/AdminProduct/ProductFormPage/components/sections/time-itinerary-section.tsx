import { Calendar, Plus } from 'lucide-react';
import { useEffect, useRef, useState } from 'react';
import { useFieldArray, useFormContext, useWatch } from 'react-hook-form';

import { Button } from '@/components/ui/button';
import { type ItineraryFormValues, type ProductFormValues } from '@/lib/validations/product';

import { ItineraryFormRow } from '../shared/ItineraryFormRow';

export function TimeItinerarySection() {
  const { control, setValue } = useFormContext<ProductFormValues>();
  const { fields, append, remove, move, insert } = useFieldArray({
    control,
    name: 'itineraries',
    keyName: '_id' as any,
  });
  const watchedItineraries = useWatch({ control, name: 'itineraries' }) as ItineraryFormValues[];

  const [openIndex, setOpenIndex] = useState<number | null>(null);
  const dragIndex = useRef<number | null>(null);

  // Keep order values in sync with array positions after any mutation
  const fieldIds = fields.map((f: any) => f._id ?? '').join(',');
  useEffect(() => {
    fields.forEach((_, i) => {
      setValue(`itineraries.${i}.order`, i + 1);
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [fieldIds]);

  const handleAdd = () => {
    const newIndex = fields.length;
    append({ name: `Day ${newIndex + 1}`, featuredName: '', order: newIndex + 1, description: '' });
    setOpenIndex(newIndex);
  };

  const handleChange = (index: number, patch: Partial<ItineraryFormValues>) => {
    (Object.entries(patch) as [keyof ItineraryFormValues, unknown][]).forEach(([key, val]) => {
      setValue(`itineraries.${index}.${key}`, val as any);
    });
  };

  const handleRemove = (index: number) => {
    remove(index);
    setOpenIndex((prev) => {
      if (prev === null) return null;
      if (prev === index) return null;
      return prev > index ? prev - 1 : prev;
    });
  };

  const handleClone = (index: number) => {
    const current = fields[index] as unknown as ItineraryFormValues;
    insert(index + 1, {
      name: current.name,
      featuredName: current.featuredName,
      order: index + 2,
      description: current.description,
    });
    setOpenIndex(index + 1);
  };

  const handleToggle = (index: number) => {
    setOpenIndex((prev) => (prev === index ? null : index));
  };

  const handleDragStart = (index: number) => {
    dragIndex.current = index;
  };

  const handleDragOver = (e: React.DragEvent, index: number) => {
    e.preventDefault();
    const from = dragIndex.current;
    if (from === null || from === index) return;
    move(from, index);
    dragIndex.current = index;
    setOpenIndex(index);
  };

  return (
    <div className="space-y-4">
      <div>
        <div className="flex items-center justify-between mb-3">
          <p className="text-sm font-medium text-gray-700">
            Itinerary Details
            {fields.length > 0 && <span className="ml-2 text-xs font-normal text-gray-400">{fields.length} days</span>}
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
            Add Day
          </Button>
        </div>

        {fields.length === 0 ? (
          <button
            type="button"
            onClick={handleAdd}
            className="w-full border-2 border-dashed border-gray-200 rounded-xl p-6 flex flex-col items-center gap-2 text-gray-400 hover:border-violet-300 hover:text-violet-500 hover:bg-violet-50/40 transition-colors"
          >
            <Calendar size={20} className="opacity-50" />
            <span className="text-sm font-medium">No itinerary yet</span>
            <span className="text-xs">Click to add the first day</span>
          </button>
        ) : (
          <div className="space-y-2">
            {fields.map((item, i) => {
              const field = (watchedItineraries?.[i] ?? item) as ItineraryFormValues;
              return (
                <div
                  key={(item as any)._id ?? i}
                  draggable
                  onDragStart={() => handleDragStart(i)}
                  onDragOver={(e) => handleDragOver(e, i)}
                >
                  <ItineraryFormRow
                    value={field}
                    index={i}
                    isOpen={openIndex === i}
                    dragHandleProps={{ onMouseDown: (e) => e.stopPropagation() }}
                    onChange={handleChange}
                    onRemove={handleRemove}
                    onClone={handleClone}
                    onToggle={handleToggle}
                  />
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
