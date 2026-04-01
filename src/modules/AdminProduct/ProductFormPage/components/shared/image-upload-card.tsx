import { ImageIcon, Upload, X } from 'lucide-react';
import { useRef } from 'react';
import { useFormContext } from 'react-hook-form';

import { FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import type { ProductFormValues } from '@/lib/validations/product';

interface ImageUploadCardProps {
  label: string;
  fieldName: keyof ProductFormValues;
}

export function ImageUploadCard({ label, fieldName }: ImageUploadCardProps) {
  const { control } = useFormContext<ProductFormValues>();
  const fileInputRef = useRef<HTMLInputElement>(null);

  return (
    <FormField
      control={control}
      name={fieldName}
      render={({ field }) => {
        const url = field.value as string | null | undefined;

        const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
          const file = e.target.files?.[0];
          if (!file) return;
          const reader = new FileReader();
          reader.onload = (ev) => field.onChange(ev.target?.result as string);
          reader.readAsDataURL(file);
          e.target.value = '';
        };

        return (
          <FormItem>
            <FormLabel className="text-sm font-medium text-gray-700">{label}</FormLabel>
            <FormControl>
              <div className="rounded-xl border border-gray-200 overflow-hidden bg-white">
                {/* Preview area */}
                <div className="relative bg-gray-50 h-40">
                  {url ? (
                    <>
                      <img
                        src={url}
                        alt={label}
                        className="w-full h-full object-cover"
                        onError={(e) => {
                          (e.target as HTMLImageElement).style.display = 'none';
                        }}
                      />
                      {/* Overlay buttons on hover */}
                      <div className="absolute inset-0 bg-black/40 opacity-0 hover:opacity-100 transition-opacity flex items-center justify-center gap-2">
                        <button
                          type="button"
                          onClick={() => fileInputRef.current?.click()}
                          className="flex items-center gap-1.5 px-3 py-1.5 bg-white rounded-lg text-xs font-medium text-gray-700 hover:bg-gray-100 transition-colors shadow"
                        >
                          <Upload size={13} />
                          Đổi ảnh
                        </button>
                        <button
                          type="button"
                          onClick={() => field.onChange('')}
                          className="flex items-center gap-1.5 px-3 py-1.5 bg-red-500 rounded-lg text-xs font-medium text-white hover:bg-red-600 transition-colors shadow"
                        >
                          <X size={13} />
                          Xoá
                        </button>
                      </div>
                    </>
                  ) : (
                    <button
                      type="button"
                      onClick={() => fileInputRef.current?.click()}
                      className="w-full h-full flex flex-col items-center justify-center gap-2 text-gray-400 hover:text-blue-500 hover:bg-blue-50/50 transition-colors cursor-pointer"
                    >
                      <div className="w-12 h-12 rounded-xl bg-gray-100 flex items-center justify-center group-hover:bg-blue-100">
                        <ImageIcon size={22} className="text-gray-300" />
                      </div>
                      <span className="text-xs font-medium">Nhấn để chọn ảnh</span>
                      <span className="text-[10px] text-gray-300">PNG, JPG, WEBP</span>
                    </button>
                  )}
                </div>

                {/* Bottom action bar */}
                <div className="flex items-center gap-2 px-3 py-2 border-t border-gray-100 bg-white">
                  <button
                    type="button"
                    onClick={() => fileInputRef.current?.click()}
                    className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-gray-200 text-xs font-medium text-gray-600 hover:border-blue-400 hover:text-blue-600 hover:bg-blue-50 transition-colors shrink-0"
                  >
                    <Upload size={12} />
                    Tải lên
                  </button>
                  <input
                    type="text"
                    value={(field.value as string) ?? ''}
                    onChange={(e) => field.onChange(e.target.value)}
                    placeholder="Hoặc dán URL ảnh..."
                    className="flex-1 min-w-0 text-xs py-1.5 px-2 rounded-lg border border-gray-200 text-gray-600 focus:outline-none focus:border-blue-400 bg-transparent"
                  />
                </div>

                <input ref={fileInputRef} type="file" accept="image/*" className="hidden" onChange={handleFileChange} />
              </div>
            </FormControl>
            <FormMessage />
          </FormItem>
        );
      }}
    />
  );
}
