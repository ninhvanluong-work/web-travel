import { Loader2 } from 'lucide-react';
import { useRef, useState } from 'react';
import { useFormContext } from 'react-hook-form';

import { uploadImage } from '@/api/upload';
import { Icons } from '@/assets/icons';
import { FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import type { ProductFormValues } from '@/lib/validations/product';

interface ImageUploadCardProps {
  label: string;
  fieldName: keyof ProductFormValues;
}

export function ImageUploadCard({ label, fieldName }: ImageUploadCardProps) {
  const { control } = useFormContext<ProductFormValues>();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [uploading, setUploading] = useState(false);
  const [localPreview, setLocalPreview] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  return (
    <FormField
      control={control}
      name={fieldName}
      render={({ field }) => {
        const cdnUrl = field.value as string | null | undefined;
        const displayUrl = localPreview ?? cdnUrl ?? null;

        const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
          const file = e.target.files?.[0];
          if (!file) return;
          e.target.value = '';

          const preview = URL.createObjectURL(file);
          setLocalPreview(preview);
          setError(null);
          setUploading(true);

          try {
            const url = await uploadImage(file);
            field.onChange(url);
            setLocalPreview(null);
            URL.revokeObjectURL(preview);
          } catch {
            setError('Tải ảnh thất bại. Vui lòng thử lại.');
          } finally {
            setUploading(false);
          }
        };

        return (
          <FormItem>
            <FormLabel className="text-sm font-medium text-gray-700">{label}</FormLabel>
            <FormControl>
              <div className="rounded-xl border border-gray-200 overflow-hidden bg-white">
                {/* Preview area */}
                <div className="relative bg-gray-50 h-40">
                  {displayUrl ? (
                    <>
                      <img
                        src={displayUrl}
                        alt={label}
                        className="w-full h-full object-cover"
                        onError={(e) => {
                          (e.target as HTMLImageElement).style.display = 'none';
                        }}
                      />
                      {uploading && (
                        <div className="absolute inset-0 bg-black/40 flex items-center justify-center">
                          <Loader2 size={24} className="animate-spin text-white" />
                        </div>
                      )}
                      {!uploading && (
                        <div className="absolute inset-0 bg-black/40 opacity-0 hover:opacity-100 transition-opacity flex items-center justify-center gap-2">
                          <button
                            type="button"
                            onClick={() => fileInputRef.current?.click()}
                            className="flex items-center gap-1.5 px-3 py-1.5 bg-white rounded-lg text-xs font-medium text-gray-700 hover:bg-gray-100 transition-colors shadow"
                          >
                            <Icons.upload size={13} />
                            Đổi ảnh
                          </button>
                          <button
                            type="button"
                            onClick={() => {
                              field.onChange('');
                              setLocalPreview(null);
                              setError(null);
                            }}
                            className="flex items-center gap-1.5 px-3 py-1.5 bg-red-500 rounded-lg text-xs font-medium text-white hover:bg-red-600 transition-colors shadow"
                          >
                            <Icons.x size={13} />
                            Xoá
                          </button>
                        </div>
                      )}
                    </>
                  ) : (
                    <button
                      type="button"
                      onClick={() => fileInputRef.current?.click()}
                      disabled={uploading}
                      className="w-full h-full flex flex-col items-center justify-center gap-2 text-gray-400 hover:text-blue-500 hover:bg-blue-50/50 transition-colors cursor-pointer disabled:opacity-50"
                    >
                      <div className="w-12 h-12 rounded-xl bg-gray-100 flex items-center justify-center">
                        <Icons.imageIcon size={22} className="text-gray-300" />
                      </div>
                      <span className="text-xs font-medium">Nhấn để chọn ảnh</span>
                      <span className="text-[10px] text-gray-300">PNG, JPG, WEBP</span>
                    </button>
                  )}
                </div>

                {/* Bottom bar */}
                <div className="flex items-center gap-2 px-3 py-2 border-t border-gray-100 bg-white min-h-[40px]">
                  {cdnUrl && !uploading ? (
                    <p className="flex-1 text-[10px] text-gray-400 truncate font-mono" title={cdnUrl}>
                      {cdnUrl}
                    </p>
                  ) : (
                    <button
                      type="button"
                      onClick={() => fileInputRef.current?.click()}
                      disabled={uploading}
                      className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-gray-200 text-xs font-medium text-gray-600 hover:border-blue-400 hover:text-blue-600 hover:bg-blue-50 transition-colors disabled:opacity-50"
                    >
                      {uploading ? (
                        <>
                          <Loader2 size={12} className="animate-spin" />
                          Đang tải...
                        </>
                      ) : (
                        <>
                          <Icons.upload size={12} />
                          Tải lên
                        </>
                      )}
                    </button>
                  )}
                </div>

                {error && <p className="px-3 pb-2 text-[11px] text-red-500">{error}</p>}

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
