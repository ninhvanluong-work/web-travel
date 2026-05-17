import { Plus, Trash2 } from 'lucide-react';
import { useEffect } from 'react';
import { useFieldArray, useFormContext, useWatch } from 'react-hook-form';

import { Button } from '@/components/ui/button';
import { FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { TextArea } from '@/components/ui/textarea';
import { generateSlug, type ProductFormValues } from '@/lib/validations/product';

interface GeneralTabProps {
  isEdit: boolean;
}

export function GeneralTab({ isEdit }: GeneralTabProps) {
  const { control, setValue } = useFormContext<ProductFormValues>();
  const { fields, append, remove } = useFieldArray({ control, name: 'images' });

  const nameValue = useWatch({ control, name: 'name' });

  // Auto-generate slug from name only in create mode
  useEffect(() => {
    if (!isEdit && nameValue) {
      setValue('slug', generateSlug(nameValue), { shouldValidate: false });
    }
  }, [isEdit, nameValue, setValue]);

  const thumbnailUrl = useWatch({ control, name: 'thumbnail' });

  return (
    <div className="space-y-6">
      {/* Basic info card */}
      <div className="bg-white rounded-lg border border-gray-200 p-5 space-y-4">
        <h2 className="font-bold text-gray-900">Thông tin cơ bản</h2>

        <FormField
          control={control}
          name="name"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Tên sản phẩm *</FormLabel>
              <FormControl>
                <Input size="sm" placeholder="VD: Tour Đà Nẵng 3N2Đ" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={control}
          name="slug"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Slug *</FormLabel>
              <FormControl>
                <Input size="sm" placeholder="tour-da-nang-3n2d" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={control}
          name="description"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Mô tả tổng quan</FormLabel>
              <FormControl>
                <TextArea
                  rows={4}
                  placeholder="Nhập mô tả sản phẩm..."
                  fullWidth
                  {...field}
                  value={field.value ?? ''}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
      </div>

      {/* Media card */}
      <div className="bg-white rounded-lg border border-gray-200 p-5 space-y-4">
        <h2 className="font-bold text-gray-900">Hình ảnh & Media</h2>

        {/* Thumbnail */}
        <FormField
          control={control}
          name="thumbnail"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Ảnh đại diện (URL)</FormLabel>
              <FormControl>
                <Input size="sm" placeholder="https://..." {...field} value={field.value ?? ''} />
              </FormControl>
              <FormMessage />
              {thumbnailUrl && (
                <img
                  src={thumbnailUrl}
                  alt="Thumbnail preview"
                  className="mt-2 w-full max-w-xs rounded-md border border-gray-200 object-cover h-40"
                  onError={(e) => {
                    (e.target as HTMLImageElement).style.display = 'none';
                  }}
                />
              )}
            </FormItem>
          )}
        />

        {/* Itinerary image */}
        <FormField
          control={control}
          name="itineraryImage"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Ảnh lịch trình (URL)</FormLabel>
              <FormControl>
                <Input size="sm" placeholder="https://..." {...field} value={field.value ?? ''} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        {/* Images array */}
        <div className="space-y-2">
          <FormLabel>Bộ ảnh</FormLabel>
          {fields.map((field, i) => (
            <div key={field.id} className="flex gap-2 items-center">
              <div className="flex-1">
                <FormField
                  control={control}
                  name={`images.${i}.url`}
                  render={({ field: f }) => (
                    <FormItem>
                      <FormControl>
                        <Input size="sm" placeholder={`URL ảnh ${i + 1}`} {...f} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
              <Button
                variant="ghost"
                size="icon"
                rounded="md"
                onClick={() => remove(i)}
                className="text-red-500 hover:bg-red-50 flex-shrink-0"
              >
                <Trash2 size={15} />
              </Button>
            </div>
          ))}
          <Button
            type="button"
            variant="ghost"
            size="xs"
            rounded="md"
            className="flex items-center gap-1 px-3"
            blur={false}
            onClick={() => append({ url: '' })}
          >
            <Plus size={14} />
            Thêm ảnh
          </Button>
        </div>
      </div>
    </div>
  );
}
