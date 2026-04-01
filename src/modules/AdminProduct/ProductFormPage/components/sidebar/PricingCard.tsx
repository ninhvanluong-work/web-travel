import { useFormContext } from 'react-hook-form';

import { FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import type { ProductFormValues } from '@/lib/validations/product';

export function PricingCard() {
  const { control } = useFormContext<ProductFormValues>();

  return (
    <div className="bg-white rounded-lg border border-gray-200 p-4 space-y-4">
      <h3 className="font-semibold text-gray-900">Định giá & Thống kê</h3>

      <FormField
        control={control}
        name="min_price"
        render={({ field }) => (
          <FormItem>
            <FormLabel>Giá tối thiểu (đ)</FormLabel>
            <FormControl>
              <Input type="number" size="sm" min={0} placeholder="0" {...field} />
            </FormControl>
            <FormMessage />
          </FormItem>
        )}
      />

      <FormField
        control={control}
        name="review_point"
        render={({ field }) => (
          <FormItem>
            <FormLabel>Điểm đánh giá (0–5)</FormLabel>
            <FormControl>
              <Input type="number" size="sm" min={0} max={5} step={0.1} placeholder="0" {...field} />
            </FormControl>
            <FormMessage />
          </FormItem>
        )}
      />
    </div>
  );
}
