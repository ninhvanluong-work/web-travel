import { Reorder, useDragControls } from 'framer-motion';
import { ImageIcon, Menu, Plus, Trash2 } from 'lucide-react';
import { useEffect, useState } from 'react';
import { useFieldArray, useFormContext } from 'react-hook-form';

import { Button } from '@/components/ui/button';
import { FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import type { ProductFormValues } from '@/lib/validations/product';

import { ExperienceImageUpload } from '../shared/experience-image-upload';

const MAX_EXPERIENCES = 10;

type FieldItem = ReturnType<typeof useFieldArray<ProductFormValues, 'experiences'>>['fields'][number];

function DraggableExperienceItem({
  item,
  index,
  onRemove,
  onDragEnd,
}: {
  item: FieldItem;
  index: number;
  onRemove: () => void;
  onDragEnd: () => void;
}) {
  const { control } = useFormContext<ProductFormValues>();
  const dragControls = useDragControls();

  return (
    <Reorder.Item
      value={item}
      dragControls={dragControls}
      dragListener={false}
      layout
      onDragEnd={onDragEnd}
      whileDrag={{
        scale: 0.99,
        boxShadow: '0 20px 25px -5px rgb(0 0 0 / 0.1), 0 8px 10px -6px rgb(0 0 0 / 0.1)',
      }}
      className="rounded-2xl"
    >
      <div className="relative p-5 rounded-2xl border border-slate-200 bg-white shadow-sm overflow-hidden transition-all hover:border-brand-300 hover:shadow-theme-sm group flex items-start gap-2">
        <div
          className="mt-[22px] shrink-0 cursor-grab active:cursor-grabbing touch-none select-none text-slate-300 hover:text-slate-500 p-1"
          onPointerDown={(e) => dragControls.start(e)}
        >
          <Menu size={16} />
        </div>

        <div className="flex-1 flex flex-col sm:flex-row gap-6 min-w-0">
          <div className="shrink-0 w-full max-w-[280px] sm:w-[240px]">
            <FormField
              control={control}
              name={`experiences.${index}.imageUrl`}
              render={({ field }) => <ExperienceImageUpload value={field.value} onChange={field.onChange} />}
            />
          </div>

          <div className="flex-1 w-full min-w-0 space-y-4 pr-6 sm:pr-8">
            <FormField
              control={control}
              name={`experiences.${index}.title`}
              render={({ field }) => (
                <FormItem className="space-y-1.5">
                  <FormLabel className="text-[12px] text-slate-500 font-bold uppercase tracking-wider">
                    Experience Title
                  </FormLabel>
                  <FormControl>
                    <Input
                      size="default"
                      placeholder="e.g. Explore a mysterious cave..."
                      {...field}
                      className="text-[14px] font-medium bg-slate-50/80 border-slate-200 hover:bg-white focus:bg-white focus:border-brand-400 transition-all shadow-sm h-11"
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={control}
              name={`experiences.${index}.content`}
              render={({ field }) => (
                <FormItem className="space-y-1.5">
                  <FormLabel className="text-[12px] text-slate-500 font-bold uppercase tracking-wider">
                    Detailed Description
                  </FormLabel>
                  <FormControl>
                    <textarea
                      rows={3}
                      placeholder="Briefly describe what travelers will experience..."
                      className="w-full resize-none rounded-xl border border-slate-200 bg-slate-50/80 px-4 py-3 text-[14px] text-slate-700 placeholder:text-slate-400 focus:outline-none focus:bg-white focus:border-brand-400 focus:ring-4 focus:ring-brand-500/10 transition-all shadow-sm leading-relaxed"
                      {...field}
                      value={field.value ?? ''}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>
        </div>

        <button
          type="button"
          onClick={onRemove}
          className="absolute top-4 right-4 p-2 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-xl transition-all z-10 opacity-0 group-hover:opacity-100 focus:opacity-100"
        >
          <Trash2 size={14} />
        </button>
      </div>
    </Reorder.Item>
  );
}

export function ExperiencesSection() {
  const { control } = useFormContext<ProductFormValues>();
  const { fields, append, remove, move } = useFieldArray({ control, name: 'experiences' });
  const [displayOrder, setDisplayOrder] = useState<FieldItem[]>([]);

  // eslint-disable-next-line react-hooks/exhaustive-deps
  useEffect(() => {
    setDisplayOrder([...fields]);
  }, [fields]);

  const handleReorder = (newOrder: FieldItem[]) => setDisplayOrder(newOrder);

  const handleDragEnd = () => {
    if (displayOrder.length !== fields.length) {
      setDisplayOrder([...fields]);
      return;
    }
    const workingIds = fields.map((f) => f.id);
    const targetIds = displayOrder.map((f) => f.id);
    targetIds.forEach((targetId, targetIdx) => {
      const currentIdx = workingIds.indexOf(targetId);
      if (currentIdx !== -1 && currentIdx !== targetIdx) {
        move(currentIdx, targetIdx);
        workingIds.splice(currentIdx, 1);
        workingIds.splice(targetIdx, 0, targetId);
      }
    });
  };

  return (
    <div className="space-y-5">
      <div className="flex items-center gap-2">
        <span className="text-[13px] font-medium text-slate-600">Experiences</span>
        <span className="text-[11px] font-semibold text-slate-400 bg-slate-100 px-2 py-0.5 rounded-full">
          {fields.length}/{MAX_EXPERIENCES}
        </span>
      </div>

      {fields.length === 0 && (
        <div className="flex flex-col items-center justify-center p-8 border-2 border-dashed border-slate-200 rounded-xl bg-slate-50/50">
          <ImageIcon size={32} className="text-slate-300 mb-3" />
          <p className="text-[14px] font-medium text-slate-600">No experiences yet</p>
          <p className="text-[13px] text-slate-400 mt-1 mb-4">Click the button below to add highlighted experiences</p>
        </div>
      )}

      <Reorder.Group axis="y" values={displayOrder} onReorder={handleReorder} className="space-y-4">
        {displayOrder.map((item) => {
          const fieldIndex = fields.findIndex((f) => f.id === item.id);
          if (fieldIndex === -1) return null;
          return (
            <DraggableExperienceItem
              key={item.id}
              item={item}
              index={fieldIndex}
              onRemove={() => remove(fieldIndex)}
              onDragEnd={handleDragEnd}
            />
          );
        })}
      </Reorder.Group>

      <div className="flex pt-3 border-t border-slate-100">
        <Button
          type="button"
          variant="secondary"
          size="md"
          onClick={() => append({ imageUrl: '', title: '', content: '' })}
          disabled={fields.length >= MAX_EXPERIENCES}
          className="gap-2 h-10 px-4 bg-white border border-slate-200 text-slate-700 hover:bg-slate-50 hover:text-slate-900 shadow-sm transition-colors rounded-lg font-medium disabled:opacity-50 disabled:cursor-not-allowed"
        >
          <Plus size={16} className="text-brand-500" />
          Add Experience
        </Button>
      </div>
    </div>
  );
}
