import { useEffect, useState } from 'react';
import { useFormContext } from 'react-hook-form';

import { FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { getDestinations, getSuppliers, type LookupItem, type ProductFormValues } from '@/lib/validations/product';

export function PricingSection() {
  const { control } = useFormContext<ProductFormValues>();
  const [suppliers, setSuppliers] = useState<LookupItem[]>([]);
  const [destinations, setDestinations] = useState<LookupItem[]>([]);

  useEffect(() => {
    setSuppliers(getSuppliers());
    setDestinations(getDestinations());
  }, []);

  return (
    <div className="bg-white rounded-xl border border-gray-200 p-6 space-y-4">
      <h2 className="font-semibold text-gray-900">💰 Giá &amp; Phân phối</h2>

      <div className="grid grid-cols-1 gap-4">
        <FormField
          control={control}
          name="supplier_id"
          render={({ field }) => (
            <FormItem>
              <FormLabel>
                Nhà cung cấp <span className="text-red-500">*</span>
              </FormLabel>
              <FormControl>
                <Select value={field.value ?? ''} onValueChange={(v) => field.onChange(v || null)}>
                  <SelectTrigger inputSize="sm" className="w-full">
                    <SelectValue placeholder="-- Chọn supplier --" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="">Không chọn</SelectItem>
                    {suppliers.map((s) => (
                      <SelectItem key={s.id} value={s.id}>
                        {s.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={control}
          name="destination_id"
          render={({ field }) => (
            <FormItem>
              <FormLabel>
                Điểm đến <span className="text-red-500">*</span>
              </FormLabel>
              <FormControl>
                <Select value={field.value ?? ''} onValueChange={(v) => field.onChange(v || null)}>
                  <SelectTrigger inputSize="sm" className="w-full">
                    <SelectValue placeholder="-- Chọn điểm đến --" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="">Không chọn</SelectItem>
                    {destinations.map((d) => (
                      <SelectItem key={d.id} value={d.id}>
                        {d.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
      </div>

      <FormField
        control={control}
        name="min_price"
        render={({ field }) => (
          <FormItem>
            <FormLabel>
              Giá từ (VND) <span className="text-red-500">*</span>
            </FormLabel>
            <FormControl>
              <Input type="number" size="sm" min={0} placeholder="VD: 2500000" {...field} />
            </FormControl>
            <FormMessage />
          </FormItem>
        )}
      />
    </div>
  );
}
