import { Plus, Trash2 } from 'lucide-react';
import { useFieldArray, useFormContext } from 'react-hook-form';

import { Button } from '@/components/ui/button';
import { FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import type { TourGuideFormValues } from '@/lib/validations/tour-guide';

export function CareerSection() {
  const { control } = useFormContext<TourGuideFormValues>();
  const { fields, append, remove } = useFieldArray({ control, name: 'careerPath' });

  return (
    <div className="space-y-4">
      {fields.map((field, index) => (
        <div key={field.id} className="relative p-4 rounded-xl border border-slate-200 bg-slate-50/50 space-y-3">
          <div className="flex items-center justify-between mb-1">
            <p className="text-[12px] font-semibold text-slate-500 uppercase tracking-wide">Position {index + 1}</p>
            <button
              type="button"
              onClick={() => remove(index)}
              className="text-gray-400 hover:text-red-500 transition-colors"
            >
              <Trash2 size={14} />
            </button>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <FormField
              control={control}
              name={`careerPath.${index}.role`}
              render={({ field: f }) => (
                <FormItem className="space-y-1">
                  <FormLabel className="text-[12px] text-slate-400">Chức danh *</FormLabel>
                  <FormControl>
                    <Input size="sm" placeholder="Lead guide" {...f} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={control}
              name={`careerPath.${index}.company`}
              render={({ field: f }) => (
                <FormItem className="space-y-1">
                  <FormLabel className="text-[12px] text-slate-400">Công ty *</FormLabel>
                  <FormControl>
                    <Input size="sm" placeholder="VVV — Vietnam Village Vibes" {...f} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={control}
              name={`careerPath.${index}.startYear`}
              render={({ field: f }) => (
                <FormItem className="space-y-1">
                  <FormLabel className="text-[12px] text-slate-400">Năm bắt đầu</FormLabel>
                  <FormControl>
                    <Input size="sm" type="number" placeholder={String(new Date().getFullYear())} {...f} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={control}
              name={`careerPath.${index}.tourCount`}
              render={({ field: f }) => (
                <FormItem className="space-y-1">
                  <FormLabel className="text-[12px] text-slate-400">Số tours</FormLabel>
                  <FormControl>
                    <Input size="sm" type="number" placeholder="0" {...f} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>

          <FormField
            control={control}
            name={`careerPath.${index}.description`}
            render={({ field: f }) => (
              <FormItem className="space-y-1">
                <FormLabel className="text-[12px] text-slate-400">Mô tả</FormLabel>
                <FormControl>
                  <Input size="sm" placeholder="trekking and craft villages" {...f} value={f.value ?? ''} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>
      ))}

      <Button
        type="button"
        variant="ghost"
        size="xs"
        rounded="md"
        blur={false}
        className="w-full h-10 border-dashed border-slate-300 text-slate-500 hover:border-brand-400 hover:text-brand-600"
        onClick={() =>
          append({ role: '', company: '', startYear: new Date().getFullYear(), tourCount: 0, description: '' })
        }
      >
        <Plus size={14} className="mr-1.5" />
        Add Position
      </Button>
    </div>
  );
}
