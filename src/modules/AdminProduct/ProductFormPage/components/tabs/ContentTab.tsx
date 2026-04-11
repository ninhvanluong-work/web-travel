import { useFormContext } from 'react-hook-form';

import { FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { TextArea } from '@/components/ui/textarea';
import type { ProductFormValues } from '@/lib/validations/product';

export function ContentTab() {
  const { control } = useFormContext<ProductFormValues>();

  return (
    <div className="bg-white rounded-lg border border-gray-200 p-5 space-y-5">
      <h2 className="font-bold text-gray-900">Nội dung chi tiết</h2>

      <FormField
        control={control}
        name="highlight"
        render={({ field }) => (
          <FormItem>
            <FormLabel>Điểm nổi bật</FormLabel>
            <FormControl>
              <TextArea
                rows={6}
                placeholder="Mô tả điểm nổi bật của tour..."
                fullWidth
                {...field}
                value={field.value ?? ''}
              />
            </FormControl>
            <FormMessage />
          </FormItem>
        )}
      />

      <FormField
        control={control}
        name="include"
        render={({ field }) => (
          <FormItem>
            <FormLabel>Giá bao gồm</FormLabel>
            <FormControl>
              <TextArea
                rows={6}
                placeholder="Liệt kê những gì bao gồm trong giá..."
                fullWidth
                {...field}
                value={field.value ?? ''}
              />
            </FormControl>
            <FormMessage />
          </FormItem>
        )}
      />

      <FormField
        control={control}
        name="exclude"
        render={({ field }) => (
          <FormItem>
            <FormLabel>Giá không bao gồm</FormLabel>
            <FormControl>
              <TextArea
                rows={6}
                placeholder="Liệt kê những gì không bao gồm trong giá..."
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
  );
}
