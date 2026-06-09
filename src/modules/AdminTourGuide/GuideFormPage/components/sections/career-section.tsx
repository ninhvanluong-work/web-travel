import { Reorder } from 'framer-motion';
import { GripVertical, Plus, Trash2 } from 'lucide-react';
import { useFieldArray, useFormContext } from 'react-hook-form';

import { Button } from '@/components/ui/button';
import { FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import type { TourGuideFormValues } from '@/lib/validations/tour-guide';

type CareerEntry = TourGuideFormValues['careerPath'][number];

export function CareerSection() {
  const { control } = useFormContext<TourGuideFormValues>();
  const { fields, append, remove, replace } = useFieldArray({ control, name: 'careerPath' });

  const handleReorder = (reordered: typeof fields) => {
    replace(
      reordered.map(({ role, company, startYear, tourCount, description }) => ({
        role,
        company,
        startYear,
        tourCount,
        description,
      })) as CareerEntry[]
    );
  };

  return (
    <div className="space-y-4">
      {fields.length === 0 ? (
        <div className="py-8 text-center border border-dashed border-slate-200 rounded-2xl bg-slate-50/20">
          <p className="text-sm text-slate-400 italic">Chưa có thông tin sự nghiệp. Bấm nút dưới để thêm.</p>
        </div>
      ) : (
        <Reorder.Group axis="y" values={fields} onReorder={handleReorder} className="space-y-4">
          {fields.map((field, index) => (
            <Reorder.Item
              key={field.id}
              value={field}
              className="relative p-5 rounded-2xl border border-slate-200 bg-white dark:border-gray-800 dark:bg-white/[0.01] shadow-theme-xs cursor-default select-none"
              whileDrag={{ scale: 1.01, boxShadow: '0 10px 30px rgba(0,0,0,0.08)', zIndex: 50 }}
            >
              {/* Card header */}
              <div className="flex items-center justify-between pb-3 mb-4 border-b border-slate-100 dark:border-gray-800/60">
                <div className="flex items-center gap-2 cursor-grab active:cursor-grabbing text-slate-400 hover:text-slate-600 transition-colors">
                  <GripVertical size={15} />
                  <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">
                    Vị trí #{index + 1}
                  </span>
                </div>
                <button
                  type="button"
                  onClick={() => remove(index)}
                  className="text-slate-400 hover:text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-950/30 p-1.5 rounded-lg transition-all"
                >
                  <Trash2 size={14} />
                </button>
              </div>

              {/* Grid 4 cols */}
              <div className="grid grid-cols-4 gap-4">
                <FormField
                  control={control}
                  name={`careerPath.${index}.role`}
                  render={({ field: f }) => (
                    <FormItem className="col-span-2 space-y-1.5">
                      <FormLabel className="admin-form-label">Chức danh *</FormLabel>
                      <FormControl>
                        <Input size="sm" fullWidth placeholder="Ví dụ: Hướng dẫn viên chính" {...f} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={control}
                  name={`careerPath.${index}.company`}
                  render={({ field: f }) => (
                    <FormItem className="col-span-2 space-y-1.5">
                      <FormLabel className="admin-form-label">Công ty *</FormLabel>
                      <FormControl>
                        <Input size="sm" fullWidth placeholder="Ví dụ: Công ty Du lịch ABC" {...f} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={control}
                  name={`careerPath.${index}.startYear`}
                  render={({ field: f }) => (
                    <FormItem className="col-span-1 space-y-1.5">
                      <FormLabel className="admin-form-label">Năm bắt đầu</FormLabel>
                      <FormControl>
                        <Input
                          size="sm"
                          fullWidth
                          type="number"
                          placeholder={String(new Date().getFullYear())}
                          {...f}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={control}
                  name={`careerPath.${index}.tourCount`}
                  render={({ field: f }) => (
                    <FormItem className="col-span-1 space-y-1.5">
                      <FormLabel className="admin-form-label">Số tours</FormLabel>
                      <FormControl>
                        <Input size="sm" fullWidth type="number" placeholder="0" {...f} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={control}
                  name={`careerPath.${index}.description`}
                  render={({ field: f }) => (
                    <FormItem className="col-span-2 space-y-1.5">
                      <FormLabel className="admin-form-label">Mô tả ngắn</FormLabel>
                      <FormControl>
                        <Input
                          size="sm"
                          fullWidth
                          placeholder="Ví dụ: Dẫn tour trekking leo núi..."
                          {...f}
                          value={f.value ?? ''}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
            </Reorder.Item>
          ))}
        </Reorder.Group>
      )}

      <Button
        type="button"
        variant="ghost"
        size="xs"
        rounded="md"
        blur={false}
        className="w-full h-10 border-dashed border-slate-300 dark:border-gray-800 text-slate-500 hover:border-brand-500 hover:text-brand-600 rounded-xl hover:bg-brand-50/10 transition-all text-xs font-semibold gap-1.5"
        onClick={() =>
          append({ role: '', company: '', startYear: new Date().getFullYear(), tourCount: 0, description: '' })
        }
      >
        <Plus size={14} />
        Thêm kinh nghiệm sự nghiệp
      </Button>
    </div>
  );
}
