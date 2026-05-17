import { ImageIcon, Plus, Upload } from 'lucide-react';
import { useRef, useState } from 'react';
import { useFormContext } from 'react-hook-form';

import { uploadImage } from '@/api/upload';
import { FormControl, FormField, FormItem } from '@/components/ui/form';
import type { ProductFormValues } from '@/lib/validations/product';

import { GalleryItem } from '../shared/gallery-item';
import { ImageUploadCard } from '../shared/image-upload-card';

const MAX_CONCURRENT = 3;

function reorder<T>(arr: T[], from: number, to: number): T[] {
  const result = [...arr];
  const [removed] = result.splice(from, 1);
  result.splice(to, 0, removed);
  return result;
}

export function ImagesSection() {
  const { control } = useFormContext<ProductFormValues>();
  const galleryFileInputRef = useRef<HTMLInputElement>(null);
  const [bulkProgress, setBulkProgress] = useState<{ done: number; total: number } | null>(null);
  const [dragIndex, setDragIndex] = useState<number | null>(null);
  const [dragOverIndex, setDragOverIndex] = useState<number | null>(null);

  return (
    <div className="space-y-5">
      <div className="grid grid-cols-2 gap-4">
        <ImageUploadCard label="Ảnh đại diện (Thumbnail)" fieldName="thumbnail" />
        <ImageUploadCard label="Ảnh lịch trình" fieldName="itineraryImage" />
      </div>

      <FormField
        control={control}
        name="images"
        render={({ field }) => {
          const list: { url: string }[] = (field.value as { url: string }[]) ?? [];
          const isBulkUploading = bulkProgress !== null;

          const handleBulkFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
            const files = Array.from(e.target.files ?? []);
            if (!files.length) return;
            e.target.value = '';

            setBulkProgress({ done: 0, total: files.length });
            const results: string[] = [];
            for (let i = 0; i < files.length; i += MAX_CONCURRENT) {
              const batch = files.slice(i, i + MAX_CONCURRENT);
              // eslint-disable-next-line no-await-in-loop
              const urls = await Promise.all(batch.map((file) => uploadImage(file).catch(() => '')));
              results.push(...urls);
              setBulkProgress({ done: results.length, total: files.length });
            }

            field.onChange([...list, ...results.map((url) => ({ url }))]);
            setBulkProgress(null);
          };

          const handleDrop = (toIndex: number) => {
            if (dragIndex === null || dragIndex === toIndex) return;
            field.onChange(reorder(list, dragIndex, toIndex));
            setDragIndex(null);
            setDragOverIndex(null);
          };

          const handleMoveTop = (i: number) => field.onChange(reorder(list, i, 0));
          const handleMoveLeft = (i: number) => field.onChange(reorder(list, i, i - 1));
          const handleMoveRight = (i: number) => field.onChange(reorder(list, i, i + 1));

          return (
            <FormItem>
              <div className="flex items-center justify-between mb-3">
                <p className="text-sm font-medium text-gray-700">
                  Bộ ảnh tour
                  {list.length > 0 && <span className="ml-2 text-xs font-normal text-gray-400">{list.length} ảnh</span>}
                </p>
                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={() => galleryFileInputRef.current?.click()}
                    disabled={isBulkUploading}
                    className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-rose-500 text-xs font-medium text-white hover:bg-rose-600 transition-colors disabled:opacity-60 disabled:cursor-not-allowed"
                  >
                    <Upload size={12} />
                    {isBulkUploading ? `Đang tải ${bulkProgress!.done}/${bulkProgress!.total}...` : 'Tải nhiều ảnh'}
                  </button>
                  <button
                    type="button"
                    onClick={() => field.onChange([...list, { url: '' }])}
                    disabled={isBulkUploading}
                    className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-gray-200 text-xs font-medium text-gray-600 hover:border-gray-300 hover:bg-gray-50 transition-colors disabled:opacity-60"
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
                      disabled={isBulkUploading}
                      className="w-full border-2 border-dashed border-gray-200 rounded-xl p-8 flex flex-col items-center gap-3 text-gray-400 hover:border-rose-300 hover:text-rose-500 hover:bg-rose-50/30 transition-colors disabled:opacity-60"
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
                          isThumbnail={i === 0}
                          isDragOver={dragOverIndex === i && dragIndex !== i}
                          onChange={(url) => field.onChange(list.map((m, idx) => (idx === i ? { url } : m)))}
                          onRemove={() => field.onChange(list.filter((_, idx) => idx !== i))}
                          onMoveTop={() => handleMoveTop(i)}
                          onMoveLeft={i > 0 ? () => handleMoveLeft(i) : undefined}
                          onMoveRight={i < list.length - 1 ? () => handleMoveRight(i) : undefined}
                          onDragStart={() => setDragIndex(i)}
                          onDragOver={() => setDragOverIndex(i)}
                          onDrop={() => handleDrop(i)}
                          onDragEnd={() => {
                            setDragIndex(null);
                            setDragOverIndex(null);
                          }}
                        />
                      ))}
                      <button
                        type="button"
                        onClick={() => galleryFileInputRef.current?.click()}
                        disabled={isBulkUploading}
                        className="min-h-[128px] border-2 border-dashed border-gray-200 rounded-xl flex flex-col items-center justify-center gap-2 text-gray-400 hover:border-rose-300 hover:text-rose-500 hover:bg-rose-50/30 transition-colors disabled:opacity-60"
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
