import { useFormContext } from 'react-hook-form';

import { FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { DURATION_TYPES, type ProductFormValues, STATUS_OPTIONS } from '@/lib/validations/product';

export function ConfigCard() {
  const { control } = useFormContext<ProductFormValues>();

  return (
    <div className="bg-white rounded-lg border border-gray-200 p-4 space-y-4">
      <h3 className="font-semibold text-gray-900">Trạng thái & Cấu hình</h3>

      {/* Status */}
      <FormField
        control={control}
        name="status"
        render={({ field }) => (
          <FormItem>
            <FormLabel>Trạng thái</FormLabel>
            <FormControl>
              <Select value={field.value} onValueChange={field.onChange}>
                <SelectTrigger inputSize="sm" className="w-full">
                  <SelectValue placeholder="Chọn trạng thái" />
                </SelectTrigger>
                <SelectContent>
                  {STATUS_OPTIONS.map((opt) => (
                    <SelectItem key={opt.value} value={opt.value}>
                      {opt.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </FormControl>
            <FormMessage />
          </FormItem>
        )}
      />

      {/* Duration */}
      <div className="flex gap-2">
        <FormField
          control={control}
          name="duration"
          render={({ field }) => (
            <div className="flex-1">
              <FormItem>
                <FormLabel>Thời lượng</FormLabel>
                <FormControl>
                  <Input type="number" size="sm" min={1} {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            </div>
          )}
        />
        <FormField
          control={control}
          name="duration_type"
          render={({ field }) => (
            <div className="w-28">
              <FormItem>
                <FormLabel>Đơn vị</FormLabel>
                <FormControl>
                  <Select value={field.value} onValueChange={field.onChange}>
                    <SelectTrigger inputSize="sm">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {DURATION_TYPES.map((t) => (
                        <SelectItem key={t.value} value={t.value}>
                          {t.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </FormControl>
              </FormItem>
            </div>
          )}
        />
      </div>
    </div>
  );
}
