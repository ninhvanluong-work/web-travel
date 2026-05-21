import { ImageIcon, Link, Trash2, Video } from 'lucide-react';
import { useFormContext } from 'react-hook-form';

import { FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import type { ProductFormValues } from '@/lib/validations/product';

import { BannerImageUpload } from './banner-image-upload';
import { BannerVideoUpload } from './banner-video-upload';

const BANNER_TYPE_OPTIONS = [
  { label: 'Hinh anh', value: 'image', icon: ImageIcon },
  { label: 'Video', value: 'video', icon: Video },
] as const;

export function BannerItem({ index, onRemove }: { index: number; onRemove: () => void }) {
  const { control, watch } = useFormContext<ProductFormValues>();
  const type = watch(`banner.${index}.type`);

  return (
    <div className="relative p-5 rounded-2xl border border-slate-200 bg-white shadow-sm overflow-hidden transition-all hover:border-brand-300 hover:shadow-theme-sm group flex flex-col sm:flex-row gap-6">
      <button
        type="button"
        onClick={onRemove}
        className="absolute top-4 right-4 p-2 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-xl transition-all z-10 opacity-0 group-hover:opacity-100 focus:opacity-100"
        title="Xóa media này"
      >
        <Trash2 size={16} />
      </button>

      {/* Left: Media Preview */}
      <div className="shrink-0 w-full max-w-[280px] sm:w-[240px]">
        <FormField
          control={control}
          name={`banner.${index}.url`}
          render={({ field }) =>
            type === 'image' ? (
              <BannerImageUpload value={field.value ?? ''} onChange={field.onChange} />
            ) : (
              <BannerVideoUpload value={field.value ?? ''} onChange={field.onChange} />
            )
          }
        />
      </div>

      {/* Right: Controls */}
      <div className="flex-1 space-y-4 pt-1 md:pr-8">
        <FormField
          control={control}
          name={`banner.${index}.type`}
          render={({ field }) => (
            <FormItem className="space-y-2">
              <FormLabel className="text-[11px] text-slate-500 font-bold uppercase tracking-wider">
                Loại hiển thị
              </FormLabel>
              <Select onValueChange={field.onChange} value={field.value}>
                <FormControl>
                  <SelectTrigger
                    inputSize="sm"
                    className="w-[180px] h-10 bg-slate-50/80 border-slate-200 hover:border-brand-300 hover:bg-white transition-colors"
                  >
                    <SelectValue />
                  </SelectTrigger>
                </FormControl>
                <SelectContent>
                  {BANNER_TYPE_OPTIONS.map((opt) => (
                    <SelectItem key={opt.value} value={opt.value} className="text-[13px] py-2">
                      <span className="flex items-center gap-2.5 font-medium text-slate-700">
                        <opt.icon size={15} className={opt.value === 'video' ? 'text-brand-500' : 'text-emerald-500'} />
                        {opt.label}
                      </span>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </FormItem>
          )}
        />

        <FormField
          control={control}
          name={`banner.${index}.url`}
          render={({ field }) => (
            <FormItem className="space-y-2">
              <FormLabel className="text-[11px] text-slate-500 font-bold uppercase tracking-wider">
                {type === 'video' ? 'Đường dẫn Video (embed)' : 'Đường dẫn Hình ảnh trực tiếp'}
              </FormLabel>
              <FormControl>
                <div className="relative group/input">
                  <Link
                    size={15}
                    className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within/input:text-brand-500 transition-colors"
                  />
                  <div
                    title={field.value || undefined}
                    className="pl-10 pr-3 h-10 flex items-center bg-slate-100 border border-slate-200 rounded-lg cursor-not-allowed overflow-hidden"
                  >
                    <span className="text-[13px] text-slate-400 truncate w-full">
                      {field.value ||
                        (type === 'video'
                          ? 'Chưa có video — nhấn ô bên trái để tải lên'
                          : 'Chưa có ảnh — nhấn ô bên trái để tải lên')}
                    </span>
                  </div>
                </div>
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
      </div>
    </div>
  );
}
