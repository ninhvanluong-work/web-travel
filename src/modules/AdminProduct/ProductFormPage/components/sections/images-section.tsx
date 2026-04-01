import { ImageIcon, Plus, Upload } from 'lucide-react';
import { useRef } from 'react';
import { useFormContext } from 'react-hook-form';

import { FormControl, FormField, FormItem } from '@/components/ui/form';
import type { ProductFormValues } from '@/lib/validations/product';

import { GalleryItem } from '../shared/gallery-item';
import { ImageUploadCard } from '../shared/image-upload-card';

export function ImagesSection() {
  const { control } = useFormContext<ProductFormValues>();
  const galleryFileInputRef = useRef<HTMLInputElement>(null);

  return (
    <div className="bg-white rounded-xl border border-gray-200 p-6 space-y-5">
      <h2 className="font-semibold text-gray-900">🖼️ Hình ảnh</h2>

      <div className="grid grid-cols-2 gap-4">
        <ImageUploadCard label="Ảnh đại diện (Thumbnail)" fieldName="thumbnail" />
        <ImageUploadCard label="Ảnh lịch trình" fieldName="itinerary_image" />
      </div>

      <FormField
        control={control}
        name="images"
        render={({ field }) => {
          const list: { url: string }[] = (field.value as { url: string }[]) ?? [];

          const handleBulkFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
            const files = Array.from(e.target.files ?? []);
            if (!files.length) return;
            let loaded = 0;
            const newItems: { url: string }[] = new Array(files.length).fill(null).map(() => ({ url: '' }));
            files.forEach((file, i) => {
              const reader = new FileReader();
              reader.onload = (ev) => {
                newItems[i] = { url: ev.target?.result as string };
                loaded++;
                if (loaded === files.length) field.onChange([...list, ...newItems]);
              };
              reader.readAsDataURL(file);
            });
            e.target.value = '';
          };

          return (
            <FormItem>
              <div className="flex items-center justify-between mb-2">
                <p className="text-sm font-medium text-gray-700">
                  Bộ ảnh tour <span className="text-gray-400 font-normal">({list.length} ảnh)</span>
                </p>
                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={() => galleryFileInputRef.current?.click()}
                    className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-blue-600 text-xs font-medium text-white hover:bg-blue-700 transition-colors"
                  >
                    <Upload size={12} />
                    Tải nhiều ảnh
                  </button>
                  <button
                    type="button"
                    onClick={() => field.onChange([...list, { url: '' }])}
                    className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-gray-200 text-xs font-medium text-gray-600 hover:border-gray-300 hover:bg-gray-50 transition-colors"
                  >
                    <Plus size={12} />
                    Thêm slot
                  </button>
                </div>
              </div>

              <FormControl>
                <>
                  {list.length === 0 ? (
                    <button
                      type="button"
                      onClick={() => galleryFileInputRef.current?.click()}
                      className="w-full border-2 border-dashed border-gray-200 rounded-xl p-8 flex flex-col items-center gap-3 text-gray-400 hover:border-blue-400 hover:text-blue-500 hover:bg-blue-50/30 transition-colors"
                    >
                      <div className="w-12 h-12 rounded-xl bg-gray-100 flex items-center justify-center">
                        <ImageIcon size={22} className="text-gray-300" />
                      </div>
                      <div className="text-center">
                        <p className="text-sm font-medium">Nhấn để tải ảnh lên</p>
                        <p className="text-xs text-gray-300 mt-0.5">Có thể chọn nhiều ảnh • PNG, JPG, WEBP</p>
                      </div>
                    </button>
                  ) : (
                    <div className="grid grid-cols-3 gap-3">
                      {list.map((img, i) => (
                        <GalleryItem
                          key={i}
                          img={img}
                          index={i}
                          onChange={(url) => field.onChange(list.map((m, idx) => (idx === i ? { url } : m)))}
                          onRemove={() => field.onChange(list.filter((_, idx) => idx !== i))}
                        />
                      ))}
                      <button
                        type="button"
                        onClick={() => galleryFileInputRef.current?.click()}
                        className="min-h-[128px] border-2 border-dashed border-gray-200 rounded-xl flex flex-col items-center justify-center gap-2 text-gray-400 hover:border-blue-400 hover:text-blue-500 hover:bg-blue-50/30 transition-colors"
                      >
                        <Plus size={20} />
                        <span className="text-xs">Thêm ảnh</span>
                      </button>
                    </div>
                  )}
                  <input
                    ref={galleryFileInputRef}
                    type="file"
                    accept="image/*"
                    multiple
                    className="hidden"
                    onChange={handleBulkFileChange}
                  />
                </>
              </FormControl>
            </FormItem>
          );
        }}
      />
    </div>
  );
}
